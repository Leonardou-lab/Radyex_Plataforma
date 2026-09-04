import { createClient } from "@/lib/server";
import { initials } from "@/lib/data";
import { ListaSolicitudes } from "@/components/solicitudes/ListaSolicitudes";
import { mapearSolicitudRevision, type FilaSolicitudRevisionDB } from "@/lib/mapeo-solicitudes";

// Pantalla "Solicitudes" del panel interno (equipo Radyex + Administrador):
// la cola de órdenes que los doctores enviaron y nadie ha procesado.
//
// NO va detrás de `exigirAdmin()`: revisar órdenes es trabajo del equipo
// Radyex, no exclusivo del Administrador (docs/perfiles-y-acceso.md § roles),
// y la RLS de UPDATE de `solicitudes_orden` también deja pasar a los dos.
//
// Es la única pantalla de la Fase 4 que NO viene del mockup estático: nació
// con la mecánica `solicitudes_orden` (decisión B2, 2026-09-02), que no
// existía cuando se diseñó el prototipo.
export default async function SolicitudesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarIniciales = "";
  if (user) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("nombre_completo")
      .eq("id", user.id)
      .maybeSingle();
    if (perfil) avatarIniciales = initials(perfil.nombre_completo);
  }

  // Solo las pendientes: las ya resueltas no vuelven a la cola. El filtro por
  // `estado` es regla de negocio; el alcance (ver todas, de todos los
  // doctores) lo da la RLS "equipo y admin ven todas las solicitudes".
  //
  // Las más viejas primero (`ascending: true`): una cola de trabajo se atiende
  // por orden de llegada, al revés que las listas de órdenes.
  const { data, error } = await supabase
    .from("solicitudes_orden")
    .select(
      `
      id,
      created_at,
      entrega,
      indicaciones,
      estudios,
      paciente_id,
      paciente_datos,
      pacientes ( nombre_completo ),
      doctores ( usuarios ( nombre_completo ) )
      `,
    )
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("No se pudieron cargar las solicitudes:", error.message);
  }

  const solicitudes = ((data ?? []) as unknown as FilaSolicitudRevisionDB[]).map(
    mapearSolicitudRevision,
  );

  return <ListaSolicitudes solicitudes={solicitudes} avatarIniciales={avatarIniciales} />;
}
