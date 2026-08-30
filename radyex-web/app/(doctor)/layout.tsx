import { redirect } from "next/navigation";
import { SidebarShell } from "@/components/layout/SidebarShell";
import { obtenerUsuarioConRol } from "@/lib/auth";

// Layout de toda la vista Doctor: envuelve cada pantalla bajo este
// route group con el Sidebar + drawer móvil ya configurados para
// el rol "doctor" (ver components/layout/nav-items.ts).
//
// También es el guardia de acceso de la zona: se ejecuta en el servidor
// antes de renderizar cualquier pantalla de aquí abajo, así que un solo
// chequeo cubre todas las páginas del route group (no hay que repetirlo
// en cada page.tsx).
export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { usuario, rol } = await obtenerUsuarioConRol();

  // Sin sesión: nada que decidir, a login. /login vive fuera de este
  // layout, así que no hay riesgo de bucle.
  if (!usuario) {
    redirect("/login");
  }

  // Con sesión pero sin fila en public.usuarios (o sin rol asignado):
  // cuenta "huérfana", todavía no se le puede asignar ninguna zona.
  if (!rol) {
    redirect("/cuenta-no-configurada");
  }

  // Esta zona es exclusiva del rol "doctor" — es un silo aparte de la
  // vista Radyex (Equipo/Admin no tienen nada que hacer aquí).
  if (rol !== "doctor") {
    redirect("/sin-acceso");
  }

  return <SidebarShell role="doctor">{children}</SidebarShell>;
}
