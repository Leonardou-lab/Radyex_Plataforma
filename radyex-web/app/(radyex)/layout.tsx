import { redirect } from "next/navigation";
import { SidebarShell } from "@/components/layout/SidebarShell";
import { obtenerUsuarioConRol } from "@/lib/auth";

// Layout de toda la vista Radyex (panel interno): mismo Sidebar
// compartido, ahora con el rol "radyex" (rutas bajo /admin/*).
// Ninguna pantalla de esta vista está migrada todavía (fase 4);
// por ahora solo existe /admin como placeholder para probar que el
// layout y el Sidebar funcionan igual para los dos roles.
//
// También es el guardia de acceso de TODA la zona interna (operación +
// lo que hoy es solo el placeholder de /admin): entran Administrador y
// Equipo Radyex, el Doctor no. La restricción más fina "esta pantalla en
// particular es solo del Administrador" (bitácora legal completa,
// doctores, reportes — ver docs/perfiles-y-acceso.md) NO se implementa
// aquí: se agrega en Fase 4 con un layout anidado dentro de esas rutas
// específicas cuando existan, para no bloquear al Equipo Radyex del
// resto de la operación (órdenes, archivos, pacientes).
export default async function RadyexLayout({ children }: { children: React.ReactNode }) {
  const { usuario, rol } = await obtenerUsuarioConRol();

  if (!usuario) {
    redirect("/login");
  }

  if (!rol) {
    redirect("/cuenta-no-configurada");
  }

  if (rol !== "admin" && rol !== "equipo_radyex") {
    redirect("/sin-acceso");
  }

  return <SidebarShell role="radyex">{children}</SidebarShell>;
}
