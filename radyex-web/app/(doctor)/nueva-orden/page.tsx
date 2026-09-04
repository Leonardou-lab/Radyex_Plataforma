import { createClient } from "@/lib/server";
import { NuevaOrdenForm } from "@/components/nueva-orden/NuevaOrdenForm";
import type { PacienteReferido } from "@/components/nueva-orden/SelectorPaciente";

// Pantalla "Nueva orden" (vista Doctor). Mismo patrón que /ordenes: este
// Server Component `async` solo trae datos y se los pasa por props al
// componente cliente, que maneja el estado del formulario.
//
// Lo que el formulario envía NO es una orden: es una fila de
// `solicitudes_orden` que el equipo Radyex revisa antes de materializar la
// orden real (ver ./actions.ts y docs/perfiles-y-acceso.md).
export default async function NuevaOrdenPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Perfil del doctor para prellenar el panel de arriba. El nombre y el correo
  // viven en `usuarios`; el teléfono en `doctores` — por eso son dos lecturas
  // (el layout de (doctor) ya garantizó que hay sesión con rol doctor).
  let doctor = { nombre: "", correo: "", telefono: "" };
  if (user) {
    const [{ data: perfil }, { data: ficha }] = await Promise.all([
      supabase.from("usuarios").select("nombre_completo, correo").eq("id", user.id).maybeSingle(),
      supabase.from("doctores").select("telefono").eq("id", user.id).maybeSingle(),
    ]);
    doctor = {
      nombre: perfil?.nombre_completo ?? "",
      correo: perfil?.correo ?? "",
      telefono: ficha?.telefono ?? "",
    };
  }

  // Pacientes que este doctor ya refirió, para el combobox. NO se filtra por
  // doctor a mano: la RLS ("un doctor ve solo pacientes con orden suya") ya
  // devuelve únicamente los suyos. Si viene vacío sin error, es correcto —
  // el doctor todavía no tiene pacientes y usará "Nuevo paciente".
  const { data, error } = await supabase
    .from("pacientes")
    .select("id, nombre_completo, fecha_nacimiento")
    .order("nombre_completo");

  if (error) {
    console.error("No se pudieron cargar los pacientes del doctor:", error.message);
  }

  const pacientes: PacienteReferido[] = (data ?? []).map((p) => ({
    id: p.id,
    nombreCompleto: p.nombre_completo,
    fechaNacimiento: p.fecha_nacimiento,
  }));

  // La fecha del encabezado se formatea en el servidor para que no dependa
  // del reloj ni del idioma del navegador del doctor.
  const fechaHoy = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return <NuevaOrdenForm doctor={doctor} pacientes={pacientes} fechaHoy={fechaHoy} />;
}
