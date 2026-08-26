import { SidebarShell } from "@/components/layout/SidebarShell";

// Layout de toda la vista Radyex (panel interno): mismo Sidebar
// compartido, ahora con el rol "radyex" (rutas bajo /admin/*).
// Ninguna pantalla de esta vista está migrada todavía (fase 4);
// por ahora solo existe /admin como placeholder para probar que el
// layout y el Sidebar funcionan igual para los dos roles.
export default function RadyexLayout({ children }: { children: React.ReactNode }) {
  return <SidebarShell role="radyex">{children}</SidebarShell>;
}
