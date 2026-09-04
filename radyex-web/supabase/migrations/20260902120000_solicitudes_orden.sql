-- =============================================================================
-- RADYEX — Tabla: solicitudes_orden (revisión de órdenes del doctor)
-- =============================================================================
-- APLICADA a producción con `supabase db push` el 2026-09-02.
-- Depende de 20260824120000_esquema_inicial.sql.
--
-- Contexto (decisión 2026-09-02, "opción B2"):
-- Un doctor NO puede escribir en public.pacientes (RLS "equipo y admin crean
-- pacientes"), pero el formulario de "Nueva orden" del doctor necesita poder
-- solicitar estudios para un paciente que él todavía no ha referido.
--
-- Solución: el doctor NO crea la orden directamente. Crea una SOLICITUD que el
-- equipo Radyex revisa antes de que exista la orden real. Flujo:
--
--   1. El doctor envía el formulario  ->  fila en solicitudes_orden
--      (estado 'pendiente'). Trae los datos del paciente que tecleó
--      (paciente_datos) o, si eligió a uno que YA refirió, su paciente_id.
--   2. Radyex revisa: busca en public.pacientes si esa persona ya existe
--      (referida por otro doctor). Enlaza a ese expediente o crea uno nuevo.
--   3. Al APROBAR se materializan las filas reales: public.ordenes +
--      public.orden_estudios. La solicitud queda 'aprobada' con su orden_id.
--
-- Por diseño (docs/perfiles-y-acceso.md): el doctor solo ve SUS órdenes; el
-- expediente maestro compartido y la deduplicación de pacientes son visibles
-- solo para Radyex. Esta tabla es el "filtro" de Radyex antes de que la orden
-- exista.
--
-- ALCANCE DE ESTA MIGRACIÓN: solo la tabla + enum + RLS + índices. Lo que
-- viene DESPUÉS (pasos siguientes, no aquí):
--   - public.aprobar_solicitud_orden() — función SECURITY DEFINER que crea o
--     enlaza el paciente, genera el folio, e inserta ordenes + orden_estudios.
--     DEBE RE-VERIFICAR la propiedad del paciente: si la solicitud trae
--     paciente_id, confirmar que ese paciente tiene una orden previa del
--     doctor de la solicitud. La política de INSERT de abajo ya lo valida al
--     crear la solicitud, pero como esta función es SECURITY DEFINER no debe
--     confiar a ciegas del paciente_id guardado — defensa en dos capas.
--   - La regla del FOLIO (prefijo LN/TM, secuencia) sigue abierta; se resuelve
--     al escribir esa función.
--   - Marcar la orden como "en revisión" en la vista "Mis órdenes" del doctor
--     (va con el trabajo de estatus de orden, pendiente).
--   - Registrar la creación de la orden en la bitácora (hoy no hay trigger de
--     INSERT en ordenes; se decide junto con la función de aprobación).
-- =============================================================================


-- Estado de la revisión. Nombre propio para no chocar con
-- public.estado_solicitud, que ya usa solicitudes_pendientes (altas de doctor
-- y cambios sensibles).
create type public.estado_solicitud_orden as enum ('pendiente', 'aprobada', 'rechazada');


create table public.solicitudes_orden (
  id uuid primary key default gen_random_uuid(),

  -- Quién la envía. Siempre el doctor en sesión (doctores.id = usuarios.id =
  -- auth.uid(), relación 1:1 — igual que ordenes.doctor_id).
  doctor_id uuid not null references public.doctores (id),

  estado public.estado_solicitud_orden not null default 'pendiente',

  -- --- Paciente: uno de los dos (ver constraint chk_paciente_o_datos) ---
  --  · paciente_id: el doctor eligió a un paciente que YA refirió. La revisión
  --    de Radyex es casi un trámite (confirmar y materializar).
  --  · paciente_datos: paciente nuevo para el doctor. paciente_id queda NULL
  --    hasta que Radyex cree el expediente o lo enlace a uno existente.
  --    Forma esperada:
  --      { "nombre_completo": text,
  --        "fecha_nacimiento": "YYYY-MM-DD",
  --        "telefono": text,
  --        "correo": text | null }
  paciente_id uuid references public.pacientes (id),
  paciente_datos jsonb,

  -- --- Contenido de la orden (se materializa en ordenes/orden_estudios) ---
  entrega public.tipo_entrega not null,          -- 'Impreso' | 'Digital'
  indicaciones text,

  -- Estudios seleccionados. Array de objetos; cada uno se vuelve una fila de
  -- orden_estudios al aprobar, y ahí el trigger validar_orden_estudio() los
  -- valida de verdad (dientes si Periapical, fov si Tomografía, etc.).
  -- Forma por elemento:
  --   { "estudio_id":   text,                 -- id de catalogo_estudios ('periapical', 'tomografia-3d', ...)
  --     "dientes_fdi":  text[] | null,        -- solo Periapical
  --     "tipo_captura": "sensor" | "rx" | null,  -- solo Periapical
  --     "fov":          text | null,          -- solo Tomografía 3D (value de catalogo_fov)
  --     "zona":         text | null,          -- solo Tomografía 3D con FOV 5x5
  --     "nota_libre":   text | null }         -- solo Cefalometría "Otro"
  estudios jsonb not null,

  -- --- Trazabilidad de la revisión ---
  revisado_por uuid references public.usuarios (id),
  resuelto_at timestamptz,
  comentario_resolucion text,
  -- Orden real creada al aprobar (NULL mientras 'pendiente' o 'rechazada').
  orden_id uuid references public.ordenes (id) on delete set null,

  created_at timestamptz not null default now(),

  -- O viene el paciente ya identificado, o vienen sus datos para deduplicar.
  constraint chk_paciente_o_datos check (
    paciente_id is not null or paciente_datos is not null
  ),
  -- estudios debe ser un array JSON con al menos un elemento: la base
  -- garantiza que no entra una solicitud sin estudios (no hay que confiar
  -- solo en el formulario). Ningún otro SQL del esquema imponía este mínimo
  -- (validar_orden_estudio() valida fila por fila, no el conteo).
  constraint chk_estudios_es_array check (
    jsonb_typeof(estudios) = 'array' and jsonb_array_length(estudios) > 0
  )
);

comment on table public.solicitudes_orden is
  'Órdenes que un doctor envía y que el equipo Radyex revisa (crear/enlazar paciente) antes de materializarlas en public.ordenes. El doctor no escribe en pacientes ni en ordenes directamente.';
comment on column public.solicitudes_orden.paciente_id is
  'Presente si el doctor eligió a un paciente que ya refirió; NULL si es nuevo para él (entonces viene paciente_datos).';
comment on column public.solicitudes_orden.paciente_datos is
  'Datos del paciente tecleados por el doctor cuando es nuevo para él. Radyex los usa para deduplicar contra pacientes existentes.';
comment on column public.solicitudes_orden.estudios is
  'Payload de estudios propuestos (jsonb array). Se convierte en filas de orden_estudios al aprobar; ahí se valida de verdad.';
comment on column public.solicitudes_orden.orden_id is
  'Orden real (public.ordenes) creada al aprobar esta solicitud. NULL mientras no esté aprobada.';

create index idx_solicitudes_orden_estado on public.solicitudes_orden (estado);
create index idx_solicitudes_orden_doctor on public.solicitudes_orden (doctor_id);


-- =============================================================================
-- Privilegios base + RLS
-- =============================================================================
-- El GRANT masivo de 20260824120000 (sección 15) solo cubrió las tablas que
-- existían entonces; esta tabla necesita el suyo. Sin DELETE a propósito
-- (no hay política de borrado — ver abajo).
grant select, insert, update on public.solicitudes_orden to authenticated;

alter table public.solicitudes_orden enable row level security;

-- ---- SELECT ----
create policy "un doctor ve sus propias solicitudes de orden"
  on public.solicitudes_orden for select to authenticated
  using (doctor_id = auth.uid());

create policy "equipo y admin ven todas las solicitudes de orden"
  on public.solicitudes_orden for select to authenticated
  using (public.es_equipo_o_admin());

-- ---- INSERT ----
-- Caso normal: la crea el doctor a su propio nombre. Equipo/admin también
-- pueden (registrar una orden en nombre de un doctor), igual que en ordenes.
--
-- Cuando el doctor manda la solicitud con un paciente_id (uno que dice haber
-- referido antes), se exige que ESE paciente tenga una orden previa suya. Sin
-- esto, un doctor podría apuntar su solicitud a un expediente ajeno tecleando
-- el uuid a mano: la RLS de SELECT de `pacientes` limita qué uuids puede
-- enumerar, pero no impide que use uno que consiguió de otro lado (los uuid no
-- son secretos). Si paciente_id es NULL (paciente nuevo, viene paciente_datos),
-- no aplica esta restricción. Mismo patrón exists() que
-- 20260824120000_esquema_inicial.sql:733-736.
create policy "crear solicitud de orden"
  on public.solicitudes_orden for insert to authenticated
  with check (
    (
      doctor_id = auth.uid()
      and public.rol_actual() = 'doctor'
      and (
        solicitudes_orden.paciente_id is null
        or exists (
          select 1 from public.ordenes o
          where o.paciente_id = solicitudes_orden.paciente_id
            and o.doctor_id = auth.uid()
        )
      )
    )
    or public.es_equipo_o_admin()
  );

-- ---- UPDATE ----
-- Solo la revisión: equipo y admin. El doctor NO edita una solicitud ya
-- enviada (mismo criterio que ordenes: no se edita después de mandarla).
create policy "equipo y admin revisan solicitudes de orden"
  on public.solicitudes_orden for update to authenticated
  using (public.es_equipo_o_admin())
  with check (public.es_equipo_o_admin());

-- Sin política de DELETE: por defecto, denegado. Si más adelante se quiere que
-- el doctor pueda cancelar una solicitud todavía 'pendiente', se agrega aquí.
