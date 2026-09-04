import { createClient } from "@/lib/server";
import { initials } from "@/lib/data";
import { OrderList } from "@/components/ordenes/OrderList";
import { mapearOrden, type FilaOrdenDB } from "@/lib/mapeo-ordenes";

// Pantalla "Órdenes" del panel interno (equipo Radyex / Administrador):
// la lista de TODAS las órdenes, de todos los doctores.
//
// Es la GEMELA de /ordenes (vista Doctor): mismo Server Component `async`,
// misma consulta, mismos componentes (OrderList/OrderCard/PatientModal) y
// el mismo mapeo (lib/mapeo-ordenes.ts). La única diferencia real es el
// alcance: aquí la RLS ("admin y equipo ven todas las ordenes") devuelve
// todo, no solo lo de un doctor — por eso la tarjeta muestra el "Doctor
// referente" (prop mostrarDoctor) y la búsqueda también lo cubre.
//
// SOLO LECTURA. Cambiar el estatus de una orden se POSPUSO (decisión
// 2026-09-02): ni el mockup ni los docs tienen un control manual; la única
// transición del prototipo ocurre al subir un archivo, así que ese
// `UPDATE ordenes.estatus` se hará en la Fase 5 junto con "Subir archivos".
// Ver docs/PROGRESO.md ("cambio de estatus de una orden — POSPUESTO") y
// docs/migracion-nextjs.md (Bloque 1 · paso 2). Los archivos del modal
// también son placeholder hasta la Fase 5 (R2).
export default async function OrdenesRadyexPage() {
  const supabase = await createClient();

  // Iniciales del usuario en sesión para el avatar del topbar. El layout
  // de (radyex) ya garantizó sesión + rol (admin | equipo_radyex); aquí
  // solo se lee el nombre (policy "cada quien ve su propia fila").
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

  // NO se filtra por doctor: la RLS de equipo/admin ya trae todas las
  // órdenes. Es la MISMA consulta base que la vista Doctor (incluye el
  // join `doctores → usuarios` para el nombre del referente).
  const { data, error } = await supabase
    .from("ordenes")
    .select(
      `
      folio,
      fecha_solicitud,
      estatus,
      entrega,
      doctor_id,
      pacientes (
        nombre_completo,
        telefono,
        correo,
        fecha_nacimiento,
        localidad,
        created_at
      ),
      doctores (
        usuarios ( nombre_completo )
      ),
      orden_estudios (
        fov,
        catalogo_estudios ( etiqueta ),
        catalogo_fov ( etiqueta )
      )
      `,
    )
    .order("fecha_solicitud", { ascending: false });

  if (error) {
    // No se revienta la pantalla: log en el servidor y lista vacía
    // (OrderList ya muestra su estado vacío sin tronar).
    console.error("No se pudieron cargar las órdenes:", error.message);
  }

  // `data` no viene tipado (el cliente no conoce el esquema): se trata
  // como el arreglo de filas cuya forma declara `FilaOrdenDB`.
  const filas = (data ?? []) as unknown as FilaOrdenDB[];
  const ordenes = filas.map(mapearOrden);

  return (
    <OrderList
      orders={ordenes}
      doctorIniciales={avatarIniciales}
      titulo="Órdenes"
      subtitulo="Todas las órdenes solicitadas por los doctores referentes"
      mostrarNuevaOrden={false}
      mostrarDoctor
    />
  );
}
