-- =============================================================================
-- RADYEX — Fix: registrar_bitacora_evento() truena en tablas sin `folio`
-- =============================================================================
-- PROPUESTA, NO APLICADA. `20260824120000_esquema_inicial.sql` ya se corrió
-- contra el proyecto remoto (supabase db push), así que este fix NO edita esa
-- migración vieja — reemplaza la función con CREATE OR REPLACE, que sí se
-- puede volver a aplicar sobre una base ya existente. No hace falta recrear
-- los triggers: siguen apuntando al mismo nombre de función, así que toman
-- la versión nueva en cuanto esta migración se aplique.
--
-- BUG 1 (el reportado): `v_objeto_id := case when tg_table_name = 'ordenes'
-- then new.folio else new.id::text end;`. PL/pgSQL arma esa asignación como
-- una sola expresión SQL y resuelve TODAS las ramas del CASE contra el tipo
-- concreto de NEW en cada llamada, aunque la condición de esa rama no se
-- cumpla. `doctores` y `archivos` no tienen columna `folio`, así que
-- trg_bitacora_alta_doctor, trg_bitacora_edicion_doctor y
-- trg_bitacora_subida_archivo tronaban con:
--   ERROR: record "new" has no field "folio"
-- Arreglo: to_jsonb(new) ->> 'folio' lee el campo si existe y da NULL si no,
-- sin fallar al planear la expresión — igual que pidió el reporte.
--
-- BUG 2 (encontrado al revisar el mismo patrón en el resto de la función,
-- como pedía el reporte): el `detalle` del INSERT tenía el mismo tipo de
-- CASE de una sola pieza, pero referenciando `old.estatus`/`new.estatus`:
--   case when tg_table_name = 'ordenes' then 'estatus: ' || old.estatus ||
--        ' -> ' || new.estatus else null end
-- Esto NO se puede arreglar con el mismo truco de to_jsonb(old). La causa es
-- distinta a la del Bug 1: no es una columna faltante (to_jsonb sí resuelve
-- eso), es que en un trigger de INSERT (alta_doctor, subida_archivo) la fila
-- OLD no existe en absoluto — no está "vacía", está sin asignar — y
-- referenciarla, aunque sea envuelta en to_jsonb(old), truena con:
--   ERROR: record "old" is not assigned yet
-- porque un CASE sigue siendo una sola expresión SQL que Postgres resuelve
-- completa sin importar qué rama aplique. La única forma de no tocar OLD
-- durante un INSERT es no evaluarla ahí: se separó en un IF/ELSE real de
-- PL/pgSQL (dos statements independientes — cada uno se prepara/ejecuta
-- solo si se alcanza), gateado además por `tg_op = 'UPDATE'` para que la
-- rama con `old.estatus` jamás se ejecute en una llamada de INSERT.
-- (Antes de este fix, esto solo se había manifestado en las pruebas del
-- Bug 1 porque ese fallaba primero; con el Bug 1 resuelto, alta_doctor y
-- subida_archivo hubieran tronado aquí en su lugar.)
create or replace function public.registrar_bitacora_evento()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_accion public.accion_bitacora := tg_argv[0]::public.accion_bitacora;
  v_objeto_tipo text := tg_argv[1];
  v_objeto_id text;
  v_detalle text;
  v_rol public.rol_usuario;
  v_nombre text;
begin
  select rol, nombre_completo into v_rol, v_nombre from public.usuarios where id = auth.uid();

  v_objeto_id := coalesce(
    to_jsonb(new) ->> 'folio',
    to_jsonb(new) ->> 'id'
  );

  if tg_op = 'UPDATE' and tg_table_name = 'ordenes' then
    v_detalle := 'estatus: ' || old.estatus || ' -> ' || new.estatus;
  else
    v_detalle := null;
  end if;

  insert into public.bitacora (usuario_id, nombre_actor, rol_usuario, accion, objeto_tipo, objeto_id, detalle)
  values (
    auth.uid(),
    coalesce(v_nombre, 'desconocido'),
    coalesce(v_rol, 'equipo_radyex'),
    v_accion,
    v_objeto_tipo,
    v_objeto_id,
    v_detalle
  );
  return new;
end;
$$;
