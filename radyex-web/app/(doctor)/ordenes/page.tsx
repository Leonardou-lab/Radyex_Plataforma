import { createClient } from "@/lib/server";
import { initials } from "@/lib/data";
import { OrderList } from "@/components/ordenes/OrderList";
import { mapearOrden, type FilaOrdenDB } from "./mapeo";

// Pantalla "Mis órdenes" — MOLDE de la Fase 4 (ver docs/migracion-nextjs.md).
//
// Es un Server Component `async`: corre en el servidor, hace la consulta a
// Supabase con el cliente de `lib/server.ts` (que lee la sesión de las
// cookies), traduce cada fila con `mapearOrden` y pasa el arreglo YA
// MAPEADO por props a `OrderList`. `OrderList` sigue siendo el mismo
// componente cliente de antes ("use client", búsqueda y filtros con
// useState) — no cambió nada visual, solo de dónde salen los datos.
//
// El patrón que copian las demás pantallas: página (servidor) = "traer y
// mapear datos"; componente de pantalla (cliente) = "interactuar con
// ellos". El mapeo columna→prop vive en `./mapeo.ts`.
export default async function OrdenesPage() {
  const supabase = await createClient();

  // Iniciales del doctor en sesión, para el avatar del topbar. El layout
  // de (doctor) ya garantizó que hay sesión y que el rol es "doctor", así
  // que aquí solo se lee el nombre. La policy "cada quien ve su propia
  // fila de usuario" permite este SELECT sobre `usuarios`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let doctorIniciales = "";
  if (user) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("nombre_completo")
      .eq("id", user.id)
      .maybeSingle();
    if (perfil) doctorIniciales = initials(perfil.nombre_completo);
  }

  // Órdenes del doctor en sesión.
  //
  // NO se filtra por doctor aquí a propósito: la RLS de Supabase ya sólo
  // devuelve las filas con `doctor_id = auth.uid()` (policy "un doctor ve
  // solo sus propias ordenes"). Si esto vuelve vacío SIN error, es
  // correcto — ese doctor todavía no tiene órdenes, no es un bug.
  //
  // El join a `pacientes` trae nombre/teléfono/correo/fecha de nacimiento
  // (para la edad) y `created_at` (para "Paciente desde"). El join a
  // `doctores → usuarios` trae el nombre del doctor referente (vive en
  // `usuarios.nombre_completo`, no en `doctores`) para el modal.
  // `orden_estudios` + `catalogo_estudios`/`catalogo_fov` arman el resumen
  // de "Tipo de estudio". Los archivos NO se piden aquí (fase 5 - R2).
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
    // No se revienta la pantalla por un error de lectura: se deja
    // constancia en los logs del servidor y se sigue con lista vacía
    // (OrderList ya muestra su estado vacío sin tronar).
    console.error("No se pudieron cargar las órdenes:", error.message);
  }

  // `data` no viene tipado (el cliente no conoce el esquema): se trata
  // como el arreglo de filas cuya forma declara `FilaOrdenDB` en mapeo.ts.
  const filas = (data ?? []) as unknown as FilaOrdenDB[];
  const ordenes = filas.map(mapearOrden);

  return <OrderList orders={ordenes} doctorIniciales={doctorIniciales} />;
}
