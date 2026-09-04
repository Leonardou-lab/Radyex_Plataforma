-- =============================================================================
-- RADYEX — Esquema inicial (fase 2 del roadmap)
-- =============================================================================
-- APLICADA al proyecto remoto con `supabase db push`. Es la base del esquema:
-- NO se edita este archivo para cambiar algo ya aplicado — se agrega una
-- migración nueva encima (como 20260826140000_fix_bitacora_folio.sql).
--
-- Fuente de verdad de las reglas que este esquema implementa:
--   - docs/perfiles-y-acceso.md   (roles, aprobaciones, pacientes compartidos)
--   - docs/orden-de-estudio.md    (catálogo de estudios, paquetes, entrega física)
--   - docs/bitacora-y-reportes.md (bitácora legal, append-only, solo-admin)
--   - radyex-web/lib/data.ts      (formas de datos ya usadas por el front)
--
-- Convención de nombres: en español (dominio del negocio), por la regla de
-- CLAUDE.md — distinto de `lib/data.ts`, que hoy usa nombres en inglés
-- (Doctor.name, Doctor.specialty...). Al conectar Supabase en fase 3 hará
-- falta un mapeo (o renombrar `lib/data.ts`) entre las dos convenciones;
-- se señala aquí para no perderlo de vista.
-- =============================================================================


-- =============================================================================
-- 1. TIPOS (ENUMS)
-- =============================================================================
-- Usamos ENUM de Postgres en vez de texto libre para los campos con un
-- conjunto cerrado de valores: la base de datos rechaza valores inválidos
-- por diseño, no hace falta validarlo en la aplicación.

-- Los 3 roles del sistema (docs/perfiles-y-acceso.md).
create type public.rol_usuario as enum ('admin', 'equipo_radyex', 'doctor');

-- Un doctor no se borra, se desactiva (docs/perfiles-y-acceso.md § Baja de doctor).
create type public.estatus_doctor as enum ('activo', 'inactivo');

-- pending/warn/success del mockup, con nombres en español.
create type public.estatus_orden as enum ('pendiente', 'en_proceso', 'finalizado');

create type public.tipo_entrega as enum ('Impreso', 'Digital');

-- Los 7 tipos de evento de la bitácora (docs/bitacora-y-reportes.md).
create type public.accion_bitacora as enum (
  'alta_doctor',
  'edicion_doctor',
  'subida_archivo',
  'cambio_estatus',
  'visualizacion_archivo',
  'descarga_archivo',
  'consulta_bitacora'
);

-- La mecánica de "solicitud pendiente + aviso a Monse" es una sola pieza
-- reutilizada por dos flujos (docs/perfiles-y-acceso.md).
create type public.tipo_solicitud as enum ('alta_doctor', 'cambio_sensible');
create type public.estado_solicitud as enum ('pendiente', 'aprobada', 'rechazada');


-- =============================================================================
-- 2. TABLA: usuarios
-- =============================================================================
-- Una fila por cada cuenta con login (Administrador, Equipo Radyex, Doctor).
-- Los pacientes NO tienen fila aquí — no acceden a la plataforma (CLAUDE.md).
--
-- `id` es el mismo id que Supabase Auth genera en `auth.users` al crear la
-- cuenta (login por correo). No se duplica el correo/contraseña: Supabase
-- Auth ya los maneja; aquí solo vive el rol y los datos que la app necesita
-- sin tener que consultar el esquema `auth` en cada pantalla.
create table public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null,
  nombre_completo text not null,
  correo text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.usuarios is
  'Cuentas con login: Administrador, Equipo Radyex y Doctor. Los pacientes no tienen cuenta.';
comment on column public.usuarios.rol is
  'Uno de los 3 roles del sistema. Determina qué políticas de RLS aplican en el resto de tablas.';


-- =============================================================================
-- 3. TABLA: doctores
-- =============================================================================
-- Datos propios de un doctor referente, además de lo que ya tiene en
-- `usuarios` (nombre, correo, rol). `id` es el mismo id de `usuarios` (y por
-- lo tanto el mismo de `auth.users`): 1 doctor = 1 usuario = 1 fila aquí.
create table public.doctores (
  id uuid primary key references public.usuarios (id) on delete cascade,
  especialidad text not null,
  consultorio text not null,
  telefono text,
  -- Heredado del mockup (RADYEX.username). El login real usa el correo vía
  -- Supabase Auth; este campo queda como referencia/handle interno, no como
  -- credencial.
  nombre_usuario text unique,
  estatus public.estatus_doctor not null default 'activo',
  ultimo_acceso timestamptz,
  fecha_nacimiento date,
  created_at timestamptz not null default now()
);

comment on table public.doctores is
  'Perfil extendido de un doctor referente. Se desactiva (estatus), nunca se borra — docs/perfiles-y-acceso.md.';
comment on column public.doctores.estatus is
  'Al desactivar un doctor sus pacientes/expedientes NO se tocan (retención NOM-004, 5 años).';


-- =============================================================================
-- 4. TABLA: pacientes
-- =============================================================================
-- Un paciente = una sola fila (expediente maestro), sin importar cuántos
-- doctores lo refieran. Decisión cerrada en docs/perfiles-y-acceso.md
-- (2026-08-24): lo que pertenece a cada doctor son las ÓRDENES, no el
-- paciente — ver tabla `ordenes` más abajo.
create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre_completo text not null,
  telefono text,
  correo text,
  fecha_nacimiento date,
  localidad text not null default 'Puebla',
  -- Quién del equipo dio de alta o vinculó este expediente (para saber quién
  -- reconoció a un paciente que regresa — flujo interno, afinable después).
  creado_por uuid references public.usuarios (id),
  created_at timestamptz not null default now()
);

comment on table public.pacientes is
  'Expediente maestro del paciente — una fila por persona real, propiedad de Radyex, compartible entre doctores vía sus órdenes.';


-- =============================================================================
-- 5. CATÁLOGO DE ESTUDIOS (docs/orden-de-estudio.md, lib/data.ts)
-- =============================================================================
-- Datos de referencia, iguales para todos los usuarios (no son datos de
-- pacientes). La semilla real vive en la siguiente migración
-- (20260824120100_catalogo_estudios_seed.sql).

create table public.categorias_estudio (
  id text primary key,             -- p.ej. 'intraorales'
  etiqueta text not null,          -- p.ej. 'Radiografías intraorales'
  orden_visual int not null
);

comment on table public.categorias_estudio is
  'Las 6 secciones del formulario de papel: intraorales, extraorales, fotografías, modelos, cefalometría, tomografía 3D.';

create table public.catalogo_estudios (
  id text primary key,             -- p.ej. 'periapical'
  categoria_id text not null references public.categorias_estudio (id),
  etiqueta text not null,
  -- Periapical: además de marcarse, pide elegir dientes por FDI.
  requiere_dientes boolean not null default false,
  -- Cefalometría "Otro": pide un texto libre.
  requiere_nota boolean not null default false,
  -- Tomografía 3D: es el único estudio que pide un campo de visión (FOV).
  requiere_fov boolean not null default false,
  -- Entrega física (docs/orden-de-estudio.md § Entrega física):
  --   'siempre'  = el paciente siempre lo recoge en físico
  --   'si_rx'    = solo física si el doctor elige RX (caso especial de Periapical)
  --   null       = sigue la entrega general de la orden (Impreso/Digital)
  entrega_fisica text check (entrega_fisica in ('siempre', 'si_rx')),
  orden_visual int not null
);

comment on table public.catalogo_estudios is
  'Estudios que se pueden solicitar, transcritos del papel. Fuente de verdad: docs/orden-de-estudio.md.';

create table public.catalogo_fov (
  value text primary key,          -- p.ej. '16x9'
  etiqueta text not null,          -- p.ej. '16 × 9'
  ayuda text not null,             -- texto de ayuda del papel
  -- Solo el FOV 5×5 pide "Zona" adicional.
  requiere_zona boolean not null default false
);

comment on table public.catalogo_fov is
  'Campos de visión (FOV) de Tomografía 3D, con su texto de ayuda del formulario de papel.';

create table public.paquetes (
  id text primary key,             -- p.ej. 'ortodoncia'
  etiqueta text not null,
  descripcion text not null,
  fov text references public.catalogo_fov (value),
  nota text,
  -- Componentes de entrega física que el paquete incluye pero que NO son un
  -- estudio marcable (p.ej. la guía quirúrgica de Implantología).
  entrega_fisica_extra text[]
);

comment on table public.paquetes is
  'Paquetes de selección rápida (Ortodoncia, Diagnóstico, Implantología) que marcan varios estudios a la vez.';

create table public.paquete_estudios (
  paquete_id text not null references public.paquetes (id) on delete cascade,
  estudio_id text not null references public.catalogo_estudios (id),
  primary key (paquete_id, estudio_id)
);

comment on table public.paquete_estudios is
  'Qué estudios marca automáticamente cada paquete (tabla de unión paquetes ↔ catalogo_estudios).';


-- =============================================================================
-- 6. TABLA: ordenes
-- =============================================================================
-- La pieza clave del modelo de pacientes compartidos: cada orden le
-- pertenece a UN doctor (doctor_id) y apunta a UN paciente (paciente_id) del
-- expediente maestro. Un doctor solo ve las órdenes donde doctor_id es la
-- suya (ver RLS más abajo) — nunca ve las órdenes que otro doctor pidió
-- sobre el mismo paciente.
create table public.ordenes (
  id uuid primary key default gen_random_uuid(),
  -- Formato LN/TM + fecha, igual que el mockup (p.ej. "LN251220015").
  folio text not null unique,
  paciente_id uuid not null references public.pacientes (id),
  doctor_id uuid not null references public.doctores (id),
  fecha_solicitud date not null default current_date,
  estatus public.estatus_orden not null default 'pendiente',
  entrega public.tipo_entrega not null,
  indicaciones text,
  -- Quién del equipo procesó la orden (null si en el futuro el doctor la
  -- envía directo desde su portal sin pasar por el equipo).
  creado_por uuid references public.usuarios (id),
  created_at timestamptz not null default now()
);

comment on table public.ordenes is
  'Una solicitud de estudios de un doctor para un paciente. doctor_id es la llave de la vista del doctor; paciente_id conecta con el expediente maestro.';

create index idx_ordenes_doctor on public.ordenes (doctor_id);
create index idx_ordenes_paciente on public.ordenes (paciente_id);


-- =============================================================================
-- 7. TABLA: orden_estudios
-- =============================================================================
-- Los estudios concretos que se marcaron dentro de una orden (una orden
-- puede tener varios). Guarda también el detalle específico de Periapical
-- (dientes FDI), Cefalometría "Otro" (nota libre) y Tomografía 3D (FOV/Zona).
create table public.orden_estudios (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes (id) on delete cascade,
  estudio_id text not null references public.catalogo_estudios (id),
  -- Solo Periapical: nomenclatura FDI, p.ej. {'11','12','21'}.
  dientes_fdi text[],
  -- Solo Periapical: 'sensor' (digital) o 'rx' (física).
  tipo_captura text check (tipo_captura in ('sensor', 'rx')),
  -- Solo Tomografía 3D.
  fov text references public.catalogo_fov (value),
  -- Solo Tomografía 3D con FOV 5×5.
  zona text,
  -- Solo Cefalometría "Otro".
  nota_libre text,
  created_at timestamptz not null default now(),
  unique (orden_id, estudio_id)
);

comment on table public.orden_estudios is
  'Estudios seleccionados dentro de una orden, con su detalle (dientes, FOV, nota libre según el tipo de estudio).';

create index idx_orden_estudios_orden on public.orden_estudios (orden_id);

-- Valida en la base de datos las mismas reglas que ya probó el formulario en
-- el navegador (docs/PROGRESO.md: "dientes requeridos si Periapical, texto
-- requerido si Otro, zona requerida si FOV 5×5") — defensa adicional, no
-- reemplaza la validación en el front.
create or replace function public.validar_orden_estudio()
returns trigger
language plpgsql
as $$
declare
  v_estudio public.catalogo_estudios%rowtype;
  v_requiere_zona boolean;
begin
  select * into v_estudio from public.catalogo_estudios where id = new.estudio_id;

  if v_estudio.requiere_dientes and (new.dientes_fdi is null or array_length(new.dientes_fdi, 1) is null) then
    raise exception 'El estudio "%" requiere seleccionar al menos un diente (FDI).', new.estudio_id;
  end if;

  if v_estudio.requiere_nota and (new.nota_libre is null or btrim(new.nota_libre) = '') then
    raise exception 'El estudio "%" requiere especificar el texto libre ("Otro").', new.estudio_id;
  end if;

  if v_estudio.requiere_fov and new.fov is null then
    raise exception 'El estudio "%" requiere elegir un campo de visión (FOV).', new.estudio_id;
  end if;

  -- Data-driven en vez de hardcodear '5x5': consulta el flag requiere_zona
  -- del catálogo, para que un FOV nuevo con ese flag no necesite tocar esta función.
  if new.fov is not null then
    select requiere_zona into v_requiere_zona from public.catalogo_fov where value = new.fov;
    if coalesce(v_requiere_zona, false) and (new.zona is null or btrim(new.zona) = '') then
      raise exception 'El FOV "%" requiere especificar la Zona.', new.fov;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_validar_orden_estudio
  before insert or update on public.orden_estudios
  for each row execute function public.validar_orden_estudio();


-- =============================================================================
-- 8. TABLA: archivos
-- =============================================================================
create table public.archivos (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references public.ordenes (id) on delete cascade,
  nombre_archivo text not null,
  -- Ruta/llave del objeto en Cloudflare R2. Null hasta la fase 5
  -- (integración real de R2); mientras tanto el archivo puede registrarse
  -- sin el binario todavía subido.
  ruta_r2 text,
  -- Obligatorio: Monse pidió saber qué persona del equipo subió cada
  -- archivo, no un genérico "Equipo Radyex" (docs/perfiles-y-acceso.md).
  subido_por uuid not null references public.usuarios (id),
  -- Fecha del estudio/archivo (para agrupar por año como en el mockup),
  -- distinta de created_at que es cuándo se registró en el sistema.
  fecha_captura date not null default current_date,
  created_at timestamptz not null default now()
);

comment on table public.archivos is
  'Archivos (PDF/imágenes) de una orden. subido_por es obligatorio: Monse quiere saber quién del equipo sube cada reporte.';

create index idx_archivos_orden on public.archivos (orden_id);


-- =============================================================================
-- 9. TABLA: bitacora (append-only — requisito legal LFPDPPP)
-- =============================================================================
-- Nunca se actualiza ni se borra una fila de esta tabla — ni siquiera el
-- Administrador. Eso se garantiza en dos capas: (a) no existen políticas de
-- RLS para UPDATE/DELETE (default deny) y (b) más abajo se revocan también
-- los privilegios base de UPDATE/DELETE — aunque un bug de RLS abriera la
-- puerta, el GRANT ya la cierra.
create table public.bitacora (
  id bigint generated always as identity primary key,
  fecha_hora timestamptz not null default now(),
  -- FK con "on delete set null" a propósito: si algún día una cuenta se
  -- elimina de auth.users (no debería pasar — los doctores se desactivan,
  -- no se borran), el evento histórico NO desaparece. Por eso también se
  -- guarda una copia del nombre/rol al momento del evento.
  usuario_id uuid references public.usuarios (id) on delete set null,
  nombre_actor text not null,
  rol_usuario public.rol_usuario not null,
  accion public.accion_bitacora not null,
  -- 'doctor' | 'orden' | 'archivo' | 'bitacora' — a qué tipo de objeto aplica.
  objeto_tipo text not null,
  -- Id o folio del objeto afectado, como texto (puede referenciar distintas
  -- tablas según objeto_tipo, por eso no es una FK tipada).
  objeto_id text,
  detalle text
);

comment on table public.bitacora is
  'Registro legal de auditoría (LFPDPPP): quién accedió a qué y cuándo. Append-only — jamás UPDATE ni DELETE, ni por el Administrador. Retención NOM-004 (5 años).';


-- =============================================================================
-- 10. TABLA: solicitudes_pendientes
-- =============================================================================
-- La mecánica compartida de "solicitud pendiente + aviso a Monse", que
-- sirve para los dos flujos de aprobación (docs/perfiles-y-acceso.md):
--   1. alta_doctor:     un doctor prospecto se registra vía liga.
--   2. cambio_sensible: el equipo propone cambiar un campo sensible
--                        (nombres, estudios, órdenes) de un doctor o paciente.
create table public.solicitudes_pendientes (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_solicitud not null,
  estado public.estado_solicitud not null default 'pendiente',
  -- Quién creó la solicitud: el propio doctor prospecto (alta_doctor) o el
  -- miembro del equipo que propone el cambio (cambio_sensible).
  propuesto_por uuid not null references public.usuarios (id),
  -- Para cambio_sensible: a qué tabla/fila aplica. Null para alta_doctor
  -- porque la fila (el doctor) todavía no existe.
  entidad_tipo text check (entidad_tipo in ('doctor', 'paciente')),
  entidad_id uuid,
  -- Qué se está cambiando, p.ej. 'nombre', 'estudios', 'ordenes'.
  campo text,
  -- El valor/datos propuestos. Flexible a propósito: para alta_doctor trae
  -- el perfil completo del doctor nuevo; para cambio_sensible, el valor
  -- nuevo del campo. Ver función aprobar_solicitud() más abajo para el
  -- contrato exacto de las llaves usadas.
  datos_propuestos jsonb not null,
  revisado_por uuid references public.usuarios (id),
  resuelto_at timestamptz,
  comentario_resolucion text,
  created_at timestamptz not null default now(),
  constraint chk_cambio_sensible_completo check (
    tipo <> 'cambio_sensible'
    or (entidad_tipo is not null and entidad_id is not null and campo is not null)
  )
);

comment on table public.solicitudes_pendientes is
  'Solicitud pendiente + aviso a Monse: mecánica compartida entre altas de doctor y cambios sensibles a perfiles.';

create index idx_solicitudes_estado on public.solicitudes_pendientes (estado);


-- =============================================================================
-- 11. FUNCIONES AUXILIARES para las políticas de RLS
-- =============================================================================
-- SECURITY DEFINER: corren con los privilegios de quien las creó (el dueño
-- del esquema), no del usuario que las llama. Esto evita un problema de
-- "recursión" al leer la tabla `usuarios` desde dentro de una política de
-- RLS que vive en la propia tabla `usuarios`.

create or replace function public.rol_actual()
returns public.rol_usuario
language sql stable security definer set search_path = public
as $$
  select rol from public.usuarios where id = auth.uid();
$$;

comment on function public.rol_actual() is
  'Rol del usuario autenticado actual, o NULL si aún no tiene fila en usuarios (p.ej. doctor recién registrado, pendiente de aprobación).';

create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.rol_actual() = 'admin';
$$;

create or replace function public.es_equipo()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.rol_actual() = 'equipo_radyex';
$$;

create or replace function public.es_equipo_o_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.rol_actual() in ('equipo_radyex', 'admin');
$$;

-- Nota: no hace falta una función `doctor_id_actual()` — como
-- `doctores.id` ES el mismo id de `auth.uid()` (relación 1:1 con usuarios),
-- las políticas comparan directo `doctor_id = auth.uid()`.

-- Ningún doctor puede editar su propia fila (la política de UPDATE de
-- `doctores` es solo equipo/admin), así que `ultimo_acceso` quedaría
-- inescribible. Esta función SECURITY DEFINER es la única vía para
-- escribirlo: la aplicación la invoca justo después de que el doctor hace
-- login (fase 3+), sin necesidad de abrirle un UPDATE amplio sobre su fila.
create or replace function public.registrar_acceso()
returns void
language sql security definer set search_path = public
as $$
  update public.doctores set ultimo_acceso = now() where id = auth.uid();
$$;


-- =============================================================================
-- 12. TRIGGER: bloquear cambios directos a campos sensibles (nombres)
-- =============================================================================
-- Los cambios de NOMBRE de un doctor o paciente son "sensibles"
-- (docs/perfiles-y-acceso.md): el equipo no puede aplicarlos directo, tienen
-- que pasar por solicitudes_pendientes. Este trigger lo hace cumplir a
-- nivel de base de datos, no solo de convención en la app.
--
-- Alcance de este trigger: solo el campo "nombre" (el más claro y el mismo
-- en ambas tablas). Los otros dos campos sensibles que menciona Monse
-- ("estudios", "órdenes") son operaciones más compuestas — p.ej. cambiar
-- los estudios de una orden ya enviada — y no un solo UPDATE de columna;
-- quedan para reforzarse en la fase 6 vía la función aprobar_solicitud()
-- de abajo + la ruta de la aplicación, no con un trigger genérico aquí.
create or replace function public.bloquear_cambio_nombre_directo()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.es_admin() and new.nombre_completo is distinct from old.nombre_completo then
    raise exception 'Cambiar el nombre requiere una solicitud pendiente aprobada por el Administrador (tabla solicitudes_pendientes).';
  end if;
  return new;
end;
$$;

create trigger trg_bloquear_nombre_usuarios
  before update on public.usuarios
  for each row execute function public.bloquear_cambio_nombre_directo();

create trigger trg_bloquear_nombre_pacientes
  before update on public.pacientes
  for each row execute function public.bloquear_cambio_nombre_directo();


-- =============================================================================
-- 13. FUNCIÓN: aprobar_solicitud (referencia orientativa)
-- =============================================================================
-- Ejemplo de cómo el Administrador resuelve una solicitud pendiente y cómo
-- se aplica el cambio. Es un punto de partida para la fase 6, no un
-- flujo terminado — en particular, dar de alta a un doctor primero necesita
-- crear su cuenta en auth.users vía la API de administración de Supabase
-- (supabase.auth.admin.createUser desde un backend/Edge Function, la
-- service role key nunca debe llegar al navegador), y pasar ese id aquí
-- dentro de `datos_propuestos`.
create or replace function public.aprobar_solicitud(
  p_solicitud_id uuid,
  p_aprobar boolean,
  p_comentario text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_solicitud public.solicitudes_pendientes%rowtype;
begin
  if not public.es_admin() then
    raise exception 'Solo el Administrador puede aprobar o rechazar solicitudes.';
  end if;

  select * into v_solicitud from public.solicitudes_pendientes where id = p_solicitud_id for update;
  if v_solicitud.id is null then
    raise exception 'Solicitud % no encontrada.', p_solicitud_id;
  end if;
  if v_solicitud.estado <> 'pendiente' then
    raise exception 'La solicitud % ya fue resuelta.', p_solicitud_id;
  end if;

  update public.solicitudes_pendientes
    set estado = case when p_aprobar then 'aprobada' else 'rechazada' end,
        revisado_por = auth.uid(),
        resuelto_at = now(),
        comentario_resolucion = p_comentario
    where id = p_solicitud_id;

  if not p_aprobar then
    return;
  end if;

  if v_solicitud.tipo = 'alta_doctor' then
    -- Contrato esperado de datos_propuestos para este tipo:
    -- { "usuario_id": "<uuid ya creado en auth.users>", "nombre_completo": "...",
    --   "correo": "...", "especialidad": "...", "consultorio": "...",
    --   "telefono": "...", "nombre_usuario": "...", "fecha_nacimiento": "YYYY-MM-DD" }
    insert into public.usuarios (id, rol, nombre_completo, correo)
    values (
      (v_solicitud.datos_propuestos ->> 'usuario_id')::uuid,
      'doctor',
      v_solicitud.datos_propuestos ->> 'nombre_completo',
      v_solicitud.datos_propuestos ->> 'correo'
    );
    insert into public.doctores (id, especialidad, consultorio, telefono, nombre_usuario, fecha_nacimiento)
    values (
      (v_solicitud.datos_propuestos ->> 'usuario_id')::uuid,
      v_solicitud.datos_propuestos ->> 'especialidad',
      v_solicitud.datos_propuestos ->> 'consultorio',
      v_solicitud.datos_propuestos ->> 'telefono',
      v_solicitud.datos_propuestos ->> 'nombre_usuario',
      (v_solicitud.datos_propuestos ->> 'fecha_nacimiento')::date
    );

  elsif v_solicitud.tipo = 'cambio_sensible' then
    if v_solicitud.entidad_tipo = 'doctor' and v_solicitud.campo = 'nombre' then
      update public.usuarios set nombre_completo = v_solicitud.datos_propuestos ->> 'nombre_completo'
        where id = v_solicitud.entidad_id;
    elsif v_solicitud.entidad_tipo = 'paciente' and v_solicitud.campo = 'nombre' then
      update public.pacientes set nombre_completo = v_solicitud.datos_propuestos ->> 'nombre_completo'
        where id = v_solicitud.entidad_id;
    else
      -- 'estudios' / 'ordenes': la aplicación automática de este caso se
      -- diseña en fase 6, cuando exista la pantalla real que propone el
      -- cambio y se sepa la forma exacta de datos_propuestos que necesita.
      raise exception 'Cambio sensible de tipo "%"/"%" todavía no tiene aplicación automática (pendiente fase 6).',
        v_solicitud.entidad_tipo, v_solicitud.campo;
    end if;
  end if;
end;
$$;

comment on function public.aprobar_solicitud(uuid, boolean, text) is
  'Referencia orientativa de cómo el Administrador resuelve una solicitud y se aplica el cambio. Completar/ajustar en fase 6.';


-- =============================================================================
-- 14. TRIGGERS: registrar en la bitácora los eventos que la base de datos
--     SÍ puede observar directamente (altas/ediciones de doctor, subida de
--     archivo, cambio de estatus de orden).
-- =============================================================================
-- Importante: "visualización de archivo", "descarga de archivo" y "consulta
-- de la bitácora" son eventos de LECTURA (abrir un PDF, generar una URL
-- firmada de R2, entrar a la pantalla de bitácora) — Postgres no puede
-- disparar un trigger por un SELECT ni por una descarga desde R2. Esos tres
-- eventos se registran desde la aplicación/Edge Function en el momento en
-- que ocurren (fase 5, cuando exista la integración real de R2 y las
-- pantallas conectadas). Aquí solo se automatizan los 4 eventos que sí son
-- escrituras reales en esta base de datos.
create or replace function public.registrar_bitacora_evento()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_accion public.accion_bitacora := tg_argv[0]::public.accion_bitacora;
  v_objeto_tipo text := tg_argv[1];
  v_objeto_id text;
  v_rol public.rol_usuario;
  v_nombre text;
begin
  select rol, nombre_completo into v_rol, v_nombre from public.usuarios where id = auth.uid();

  v_objeto_id := case
    when tg_table_name = 'ordenes' then new.folio
    else new.id::text
  end;

  insert into public.bitacora (usuario_id, nombre_actor, rol_usuario, accion, objeto_tipo, objeto_id, detalle)
  values (
    auth.uid(),
    coalesce(v_nombre, 'desconocido'),
    coalesce(v_rol, 'equipo_radyex'),
    v_accion,
    v_objeto_tipo,
    v_objeto_id,
    case when tg_table_name = 'ordenes' then 'estatus: ' || old.estatus || ' -> ' || new.estatus else null end
  );
  return new;
end;
$$;

create trigger trg_bitacora_alta_doctor
  after insert on public.doctores
  for each row execute function public.registrar_bitacora_evento('alta_doctor', 'doctor');

-- Restringido a columnas de negocio (no a "cualquier update"): registrar_acceso()
-- también hace un UPDATE sobre doctores (solo ultimo_acceso, en cada login), y ese
-- no debe generar un evento falso de "edición de doctor" en la bitácora legal.
create trigger trg_bitacora_edicion_doctor
  after update of especialidad, consultorio, telefono, nombre_usuario, estatus, fecha_nacimiento
  on public.doctores
  for each row execute function public.registrar_bitacora_evento('edicion_doctor', 'doctor');

create trigger trg_bitacora_subida_archivo
  after insert on public.archivos
  for each row execute function public.registrar_bitacora_evento('subida_archivo', 'archivo');

create trigger trg_bitacora_cambio_estatus
  after update of estatus on public.ordenes
  for each row when (old.estatus is distinct from new.estatus)
  execute function public.registrar_bitacora_evento('cambio_estatus', 'orden');


-- =============================================================================
-- 15. PRIVILEGIOS BASE (grants)
-- =============================================================================
-- Dos capas de seguridad, no una: el GRANT abre la puerta del edificio
-- (¿puede este rol de Postgres tocar esta tabla en general?) y la política
-- de RLS de abajo decide fila por fila qué puede ver/tocar. Sin el GRANT,
-- ninguna política de RLS importa — PostgREST (lo que usa Supabase para
-- exponer la API) responde "permiso denegado" antes de llegar a RLS.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- La bitácora es la excepción explícita: ni siquiera el Administrador puede
-- actualizar o borrar un evento ya escrito.
revoke update, delete on public.bitacora from authenticated;
grant select, insert on public.bitacora to authenticated;


-- =============================================================================
-- 16. ROW LEVEL SECURITY
-- =============================================================================

-- ---- usuarios ---------------------------------------------------------------
alter table public.usuarios enable row level security;

create policy "admin ve todos los usuarios"
  on public.usuarios for select to authenticated
  using (public.es_admin());

create policy "cada quien ve su propia fila de usuario"
  on public.usuarios for select to authenticated
  using (id = auth.uid());

create policy "solo admin crea usuarios directo"
  on public.usuarios for insert to authenticated
  with check (public.es_admin());
  -- Nota: la función aprobar_solicitud() también inserta aquí, pero como es
  -- SECURITY DEFINER no depende de esta política para funcionar.

create policy "admin actualiza cualquier usuario"
  on public.usuarios for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());
  -- El trigger trg_bloquear_nombre_usuarios ya impide que este UPDATE
  -- cambie nombre_completo si no lo hace el Administrador.

-- ---- doctores -----------------------------------------------------------
alter table public.doctores enable row level security;

create policy "admin y equipo ven todos los doctores"
  on public.doctores for select to authenticated
  using (public.es_equipo_o_admin());

create policy "un doctor ve su propia fila"
  on public.doctores for select to authenticated
  using (id = auth.uid());

create policy "solo admin da de alta doctores directo"
  on public.doctores for insert to authenticated
  with check (public.es_admin());
  -- El alta normal pasa por solicitudes_pendientes + aprobar_solicitud().

create policy "equipo y admin editan doctores"
  on public.doctores for update to authenticated
  using (public.es_equipo_o_admin())
  with check (public.es_equipo_o_admin());
  -- Cambios menores (teléfono, correo) pasan directo. El nombre vive en
  -- `usuarios` y ya está protegido por su propio trigger.

-- ---- pacientes ------------------------------------------------------------
alter table public.pacientes enable row level security;

create policy "admin y equipo ven todos los pacientes"
  on public.pacientes for select to authenticated
  using (public.es_equipo_o_admin());

create policy "un doctor ve solo pacientes con orden suya"
  on public.pacientes for select to authenticated
  using (
    exists (
      select 1 from public.ordenes o
      where o.paciente_id = pacientes.id and o.doctor_id = auth.uid()
    )
  );

create policy "equipo y admin crean pacientes"
  on public.pacientes for insert to authenticated
  with check (public.es_equipo_o_admin());

create policy "equipo y admin editan pacientes"
  on public.pacientes for update to authenticated
  using (public.es_equipo_o_admin())
  with check (public.es_equipo_o_admin());
  -- El nombre está protegido aparte por trg_bloquear_nombre_pacientes.

-- ---- catálogo de estudios (categorias_estudio, catalogo_estudios,
--      catalogo_fov, paquetes, paquete_estudios) ---------------------------
-- Datos de referencia, no de pacientes: cualquier cuenta autenticada puede
-- leerlos (los necesita el formulario de nueva orden del doctor). Solo el
-- Administrador los modifica — cambia poco y rara vez.
alter table public.categorias_estudio enable row level security;
alter table public.catalogo_estudios enable row level security;
alter table public.catalogo_fov enable row level security;
alter table public.paquetes enable row level security;
alter table public.paquete_estudios enable row level security;

create policy "cualquier autenticado lee categorias_estudio"
  on public.categorias_estudio for select to authenticated using (true);
create policy "solo admin escribe categorias_estudio"
  on public.categorias_estudio for insert to authenticated with check (public.es_admin());
create policy "solo admin actualiza categorias_estudio"
  on public.categorias_estudio for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "cualquier autenticado lee catalogo_estudios"
  on public.catalogo_estudios for select to authenticated using (true);
create policy "solo admin escribe catalogo_estudios"
  on public.catalogo_estudios for insert to authenticated with check (public.es_admin());
create policy "solo admin actualiza catalogo_estudios"
  on public.catalogo_estudios for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "cualquier autenticado lee catalogo_fov"
  on public.catalogo_fov for select to authenticated using (true);
create policy "solo admin escribe catalogo_fov"
  on public.catalogo_fov for insert to authenticated with check (public.es_admin());
create policy "solo admin actualiza catalogo_fov"
  on public.catalogo_fov for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "cualquier autenticado lee paquetes"
  on public.paquetes for select to authenticated using (true);
create policy "solo admin escribe paquetes"
  on public.paquetes for insert to authenticated with check (public.es_admin());
create policy "solo admin actualiza paquetes"
  on public.paquetes for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "cualquier autenticado lee paquete_estudios"
  on public.paquete_estudios for select to authenticated using (true);
create policy "solo admin escribe paquete_estudios"
  on public.paquete_estudios for insert to authenticated with check (public.es_admin());

-- ---- ordenes ----------------------------------------------------------------
alter table public.ordenes enable row level security;

create policy "admin y equipo ven todas las ordenes"
  on public.ordenes for select to authenticated
  using (public.es_equipo_o_admin());

create policy "un doctor ve solo sus propias ordenes"
  on public.ordenes for select to authenticated
  using (doctor_id = auth.uid());

create policy "un doctor crea ordenes a su propio nombre"
  on public.ordenes for insert to authenticated
  with check (doctor_id = auth.uid() or public.es_equipo_o_admin());

create policy "equipo y admin actualizan ordenes"
  on public.ordenes for update to authenticated
  using (public.es_equipo_o_admin())
  with check (public.es_equipo_o_admin());
  -- El doctor NO puede editar una orden después de enviarla (igual que en
  -- el mockup); solo el equipo cambia estatus, etc.

-- ---- orden_estudios -----------------------------------------------------
-- Mismas reglas que `ordenes`, verificadas a través de la orden dueña.
alter table public.orden_estudios enable row level security;

create policy "ver estudios de una orden visible"
  on public.orden_estudios for select to authenticated
  using (
    exists (
      select 1 from public.ordenes o
      where o.id = orden_estudios.orden_id
        and (public.es_equipo_o_admin() or o.doctor_id = auth.uid())
    )
  );

create policy "crear estudios en una orden propia o del equipo"
  on public.orden_estudios for insert to authenticated
  with check (
    exists (
      select 1 from public.ordenes o
      where o.id = orden_estudios.orden_id
        and (public.es_equipo_o_admin() or o.doctor_id = auth.uid())
    )
  );

create policy "equipo y admin editan estudios de una orden"
  on public.orden_estudios for update to authenticated
  using (public.es_equipo_o_admin())
  with check (public.es_equipo_o_admin());

-- ---- archivos -------------------------------------------------------------
alter table public.archivos enable row level security;

create policy "admin y equipo ven todos los archivos"
  on public.archivos for select to authenticated
  using (public.es_equipo_o_admin());

create policy "un doctor ve archivos de sus propias ordenes"
  on public.archivos for select to authenticated
  using (
    exists (
      select 1 from public.ordenes o
      where o.id = archivos.orden_id and o.doctor_id = auth.uid()
    )
  );

create policy "equipo y admin suben archivos"
  on public.archivos for insert to authenticated
  with check (public.es_equipo_o_admin() and subido_por = auth.uid());
  -- subido_por = auth.uid() evita que alguien del equipo registre una
  -- subida a nombre de otra persona.

create policy "equipo y admin corrigen datos de archivo"
  on public.archivos for update to authenticated
  using (public.es_equipo_o_admin())
  with check (public.es_equipo_o_admin());
  -- Sin política de DELETE a propósito: un archivo no se borra por la app
  -- (retención NOM-004); una baja real, si hiciera falta, se hace aparte
  -- con criterio legal, no vía la API normal.

-- ---- bitacora ---------------------------------------------------------------
alter table public.bitacora enable row level security;

create policy "solo admin lee la bitacora"
  on public.bitacora for select to authenticated
  using (public.es_admin());
  -- Decisión de Monse (2026-08-24): visibilidad solo-Administrador, ni
  -- siquiera el equipo Radyex la ve — docs/perfiles-y-acceso.md.

-- Solo eventos de LECTURA se auto-registran desde el cliente: los eventos
-- de ESCRITURA (alta_doctor, edicion_doctor, subida_archivo, cambio_estatus)
-- ya los insertan los triggers SECURITY DEFINER de la sección 14, que no
-- pasan por esta política — dejarla abierta a cualquier `accion` permitiría
-- que un doctor insertara desde el navegador un "alta_doctor" o
-- "cambio_estatus" falso y contaminara el registro legal.
-- TODO (fase 5): mover el registro de visualizacion_archivo/descarga_archivo
-- a una Edge Function con service role que verifique el acceso al archivo
-- ANTES de escribir el evento — así se cierra el hueco de que un doctor se
-- auto-atribuya haber visto/descargado un archivo que no es suyo.
create policy "cualquier autenticado registra su propia accion de lectura"
  on public.bitacora for insert to authenticated
  with check (
    usuario_id = auth.uid()
    and (
      -- Un doctor o el equipo solo auto-registran ver/descargar un archivo.
      accion in ('visualizacion_archivo', 'descarga_archivo')
      -- Solo el admin auto-registra que consultó la bitácora (es el único
      -- rol que puede verla — sección 16, política "solo admin lee la bitacora").
      or (accion = 'consulta_bitacora' and public.es_admin())
    )
  );
  -- (No hay políticas de UPDATE/DELETE: además del GRANT revocado arriba,
  -- por defecto sin política = denegado.)

-- ---- solicitudes_pendientes ----------------------------------------------
alter table public.solicitudes_pendientes enable row level security;

create policy "ver solicitudes segun rol"
  on public.solicitudes_pendientes for select to authenticated
  using (
    public.es_admin()
    or public.es_equipo()
    or propuesto_por = auth.uid()
  );
  -- Admin y equipo ven todo (visibilidad operativa); un doctor prospecto
  -- sin rol asignado solo ve la solicitud que él mismo creó.

create policy "crear solicitud segun tipo y rol"
  on public.solicitudes_pendientes for insert to authenticated
  with check (
    propuesto_por = auth.uid()
    and (
      -- Alta de doctor: la crea el propio prospecto, recién registrado por
      -- la liga, todavía SIN fila en `usuarios` (por eso rol_actual() es NULL).
      (tipo = 'alta_doctor' and public.rol_actual() is null)
      or
      -- Cambio sensible: solo lo proponen equipo o admin.
      (tipo = 'cambio_sensible' and public.es_equipo_o_admin())
    )
  );

create policy "solo admin resuelve solicitudes"
  on public.solicitudes_pendientes for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());
  -- En la práctica se resuelve vía aprobar_solicitud() (SECURITY DEFINER);
  -- esta política cubre además cualquier ajuste manual desde el dashboard.
