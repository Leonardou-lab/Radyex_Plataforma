-- =============================================================================
-- RADYEX — Función: aprobar_solicitud_orden (materializa una orden revisada)
-- =============================================================================
-- APLICADA a producción con `supabase db push` el 2026-09-03, y VERIFICADA EN
-- VIVO el 2026-09-04 (pruebas en transacciones con rollback: rama de paciente
-- nuevo, candado de propiedad rebotando con RLS 42501 en el INSERT, y dedup
-- enlazando a un expediente existente sin duplicar). Ver docs/PROGRESO.md.
-- Existe UNA sola versión de esta función en la BD, firma
-- (uuid, boolean, uuid, text) — no hay sobrecarga. Depende de:
--   20260824120000_esquema_inicial.sql   (ordenes, orden_estudios, pacientes,
--                                         es_equipo_o_admin(), trg_validar_orden_estudio)
--   20260902120000_solicitudes_orden.sql (solicitudes_orden, estado_solicitud_orden)
--
-- El equipo Radyex revisa una fila de solicitudes_orden y la resuelve con esta
-- función. Es SECURITY DEFINER: es la ÚNICA vía sancionada para que se cree el
-- paciente sin abrirle a nadie la RLS de INSERT de public.pacientes.
--
-- APROBAR (p_aprobar = true):
--   1. Resuelve el paciente, en este orden de prioridad:
--      · La solicitud YA trae paciente_id (el doctor eligió a uno que ya
--        refirió) -> se usa, y se RE-VERIFICA que ese paciente tenga una orden
--        previa de ese doctor (defensa en dos capas sobre la RLS de INSERT de
--        solicitudes_orden).
--      · Radyex pasa p_paciente_id (deduplicación: "esta persona ya existe,
--        referida por otro doctor") -> se enlaza a ese expediente.
--      · Ninguno de los dos -> se CREA un pacientes nuevo con paciente_datos.
--   2. Genera el FOLIO INTERNO de RADYEX: 'OR-' + AAMMDD (zona
--      America/Mexico_City) + '-' + secuencia public.folio_seq a 4 dígitos.
--      Ejemplo: OR-260903-0001. Ver el bloque de la sección 2) más abajo para
--      el porqué del formato.
--   3. Inserta public.ordenes + una fila de public.orden_estudios por cada
--      elemento del jsonb `estudios`. El trigger trg_validar_orden_estudio
--      valida cada estudio (dientes si Periapical, fov si Tomografía, etc.);
--      si alguno es inválido, TODO se revierte — la función es una sola
--      transacción, no quedan órdenes ni pacientes huérfanos.
--   4. Marca la solicitud 'aprobada' (revisado_por, resuelto_at, orden_id y el
--      paciente_id final).
--
-- RECHAZAR (p_aprobar = false): solo marca la solicitud 'rechazada' con
-- comentario. No crea nada.
--
-- PENDIENTE (no aquí): registrar la creación de la orden en la bitácora — el
-- enum accion_bitacora no tiene un valor para "creación de orden" y los 7
-- eventos que pidió Monse (docs/bitacora-y-reportes.md) no lo incluyen. Se
-- decide aparte si hace falta.
-- =============================================================================


-- Secuencia GLOBAL para el sufijo del folio (no se reinicia por día ni por
-- nada). Decisión deliberada: el folio es un identificador único, no un conteo
-- diario — un contador global no necesita consultar "el último del día", así
-- que no es frágil bajo concurrencia (dos aprobaciones simultáneas nunca
-- obtienen el mismo nextval). La toca solo esta función (SECURITY DEFINER),
-- así que no necesita GRANT para authenticated.
create sequence public.folio_seq;


create or replace function public.aprobar_solicitud_orden(
  p_solicitud_id uuid,
  p_aprobar boolean,
  -- Expediente existente al que enlazar (deduplicación). Solo se usa si la
  -- solicitud NO trae ya su propio paciente_id.
  p_paciente_id uuid default null,
  p_comentario text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sol         public.solicitudes_orden%rowtype;
  v_paciente_id uuid;
  v_orden_id    uuid;
  v_folio       text;
  v_datos       jsonb;
  v_est         jsonb;
begin
  -- Solo el equipo Radyex / Administrador resuelve solicitudes de orden.
  if not public.es_equipo_o_admin() then
    raise exception 'Solo el equipo Radyex o el Administrador pueden resolver solicitudes de orden.';
  end if;

  -- Bloquea la fila: dos revisiones simultáneas no la procesan dos veces.
  select * into v_sol from public.solicitudes_orden where id = p_solicitud_id for update;
  if v_sol.id is null then
    raise exception 'Solicitud de orden % no encontrada.', p_solicitud_id;
  end if;
  if v_sol.estado <> 'pendiente' then
    raise exception 'La solicitud de orden % ya fue resuelta (estado: %).', p_solicitud_id, v_sol.estado;
  end if;

  -- ---------- RECHAZAR ----------
  if not p_aprobar then
    update public.solicitudes_orden
       set estado = 'rechazada',
           revisado_por = auth.uid(),
           resuelto_at = now(),
           comentario_resolucion = p_comentario
     where id = p_solicitud_id;
    return jsonb_build_object('solicitud_id', p_solicitud_id, 'estado', 'rechazada');
  end if;

  -- ---------- APROBAR — 1) resolver el paciente ----------
  if v_sol.paciente_id is not null then
    -- El doctor eligió a un paciente que dice haber referido: se re-verifica.
    if not exists (
      select 1 from public.ordenes o
      where o.paciente_id = v_sol.paciente_id and o.doctor_id = v_sol.doctor_id
    ) then
      raise exception
        'El paciente de la solicitud no tiene ninguna orden previa del doctor %; revísalo manualmente.',
        v_sol.doctor_id;
    end if;
    v_paciente_id := v_sol.paciente_id;

  elsif p_paciente_id is not null then
    -- Radyex enlaza la solicitud a un expediente ya existente (deduplicación).
    if not exists (select 1 from public.pacientes where id = p_paciente_id) then
      raise exception 'El expediente % no existe.', p_paciente_id;
    end if;
    v_paciente_id := p_paciente_id;

  else
    -- Paciente nuevo: se crea el expediente con lo que tecleó el doctor.
    v_datos := v_sol.paciente_datos;
    if v_datos is null or coalesce(btrim(v_datos->>'nombre_completo'), '') = '' then
      raise exception
        'La solicitud % no trae paciente_id, ni p_paciente_id, ni un nombre en paciente_datos.',
        p_solicitud_id;
    end if;
    insert into public.pacientes
      (nombre_completo, fecha_nacimiento, telefono, correo, localidad, creado_por)
    values (
      btrim(v_datos->>'nombre_completo'),
      nullif(v_datos->>'fecha_nacimiento', '')::date,
      nullif(btrim(v_datos->>'telefono'), ''),
      nullif(btrim(v_datos->>'correo'), ''),
      coalesce(nullif(btrim(v_datos->>'localidad'), ''), 'Puebla'),
      auth.uid()
    )
    returning id into v_paciente_id;
  end if;

  -- ---------- APROBAR — 2) folio ----------
  -- FOLIO INTERNO DE RADYEX (formato: OR-AAMMDD-NNNN, p. ej. OR-260903-0001).
  --
  -- Es independiente del folio operativo del centro: ese depende de datos que
  -- este sistema NO tiene (en qué computadora se capturó, folio del ticket de
  -- pago), así que no se puede replicar — confirmado con Monse (2026-09-03).
  -- RADYEX genera el suyo.
  --
  -- 'OR' es de "orden". NO codifica sede, sucursal ni tipo de estudio (los
  -- LN/TM del mockup eran datos ficticios inventados, ya descartados). Se
  -- verificó que ninguna otra serie de folio del esquema usa este prefijo.
  --
  -- El sufijo va a 4 dígitos desde el inicio para no tener el salto feo
  -- 999 -> 1000 a media serie; si algún día se pasa de 9999, lpad simplemente
  -- deja crecer el número (no trunca, no colisiona).
  v_folio := 'OR-'
    || to_char(now() at time zone 'America/Mexico_City', 'YYMMDD')
    || '-'
    || lpad(nextval('public.folio_seq')::text, 4, '0');

  -- ---------- APROBAR — 3) materializar la orden ----------
  insert into public.ordenes
    (folio, paciente_id, doctor_id, fecha_solicitud, entrega, indicaciones, creado_por)
  values (
    v_folio,
    v_paciente_id,
    v_sol.doctor_id,
    (v_sol.created_at at time zone 'America/Mexico_City')::date,  -- fecha en que el doctor la solicitó
    v_sol.entrega,
    v_sol.indicaciones,
    auth.uid()
  )
  returning id into v_orden_id;

  for v_est in select value from jsonb_array_elements(v_sol.estudios)
  loop
    insert into public.orden_estudios
      (orden_id, estudio_id, dientes_fdi, tipo_captura, fov, zona, nota_libre)
    values (
      v_orden_id,
      v_est->>'estudio_id',
      case
        when jsonb_typeof(v_est->'dientes_fdi') = 'array'
        then array(select jsonb_array_elements_text(v_est->'dientes_fdi'))
        else null
      end,
      -- Normalización defensiva: el formulario ya manda 'sensor'/'rx' canónico
      -- (docs/orden-de-estudio.md § Reglas de mapeo), pero solicitudes_orden
      -- puede recibir inserts de otras vías (migraciones, carga masiva,
      -- scripts). Sin este lower(trim()), un 'Sensor' reventaría el
      -- check (tipo_captura in ('sensor','rx')) aquí adentro, tumbando toda la
      -- transacción de aprobación. Solo aplica a esta columna: estudio_id y fov
      -- son FK y deben fallar ruidosamente si vienen mal, no normalizarse en
      -- silencio; zona y nota_libre son texto libre y lower() los corrompería.
      nullif(lower(trim(v_est->>'tipo_captura')), ''),
      nullif(v_est->>'fov', ''),
      nullif(v_est->>'zona', ''),
      nullif(v_est->>'nota_libre', '')
    );
    -- trg_validar_orden_estudio valida esta fila; si es inválida -> rollback total.
  end loop;

  -- ---------- APROBAR — 4) cerrar la solicitud ----------
  update public.solicitudes_orden
     set estado = 'aprobada',
         paciente_id = v_paciente_id,
         orden_id = v_orden_id,
         revisado_por = auth.uid(),
         resuelto_at = now(),
         comentario_resolucion = p_comentario
   where id = p_solicitud_id;

  return jsonb_build_object(
    'solicitud_id', p_solicitud_id,
    'estado',       'aprobada',
    'orden_id',     v_orden_id,
    'folio',        v_folio,
    'paciente_id',  v_paciente_id
  );
end;
$$;

comment on function public.aprobar_solicitud_orden(uuid, boolean, uuid, text) is
  'El equipo Radyex resuelve una solicitudes_orden: aprobar (crea/enlaza paciente + genera folio + inserta ordenes/orden_estudios) o rechazar. SECURITY DEFINER — única vía para crear el paciente sin abrir la RLS de INSERT de pacientes.';

-- La función ya valida es_equipo_o_admin() por dentro; además se limita quién
-- puede EJECUTARLA (por defecto EXECUTE es para PUBLIC, que incluye anon).
revoke all on function public.aprobar_solicitud_orden(uuid, boolean, uuid, text) from public;
grant execute on function public.aprobar_solicitud_orden(uuid, boolean, uuid, text) to authenticated;
