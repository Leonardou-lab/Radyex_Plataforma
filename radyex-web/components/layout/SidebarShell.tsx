"use client";

import { useEffect, useState } from "react";
import { Sidebar, type Rol, type UsuarioSidebar } from "./Sidebar";
import { MobileTopbar } from "./MobileTopbar";

type SidebarShellProps = {
  role: Rol;
  /** Usuario en sesión, resuelto en el layout (servidor). */
  usuario: UsuarioSidebar;
  children: React.ReactNode;
};

/**
 * Layout compartido de las dos vistas del sitio: barra móvil +
 * overlay + Sidebar + área principal. Cada route group (app/(doctor)
 * y app/(radyex)) usa este mismo componente en su layout.tsx, solo
 * cambiando `role` — así el drawer móvil y el responsivo del
 * sidebar se escriben una sola vez.
 *
 * El estado `open` (drawer abierto/cerrado en móvil, ≤640px) vive
 * aquí con useState porque tanto el botón de hamburguesa
 * (MobileTopbar) como el overlay y el propio <Sidebar> necesitan
 * leerlo o cambiarlo — por eso "sube" al componente padre en común.
 */
export function SidebarShell({ role, usuario, children }: SidebarShellProps) {
  const [open, setOpen] = useState(false);

  function closeDrawer() {
    setOpen(false);
  }

  // Mientras el drawer está abierto, evita que la página de atrás
  // haga scroll (igual que RADYEX.initMobileNav() en el mockup).
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", open);
  }, [open]);

  // Cerrar con Escape.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="layout">
      <MobileTopbar avatarIniciales={usuario.iniciales} onMenuClick={() => setOpen((v) => !v)} />
      <div
        className={`sidebar-overlay${open ? " open" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <Sidebar role={role} usuario={usuario} open={open} onNavigate={closeDrawer} />

      <main className="main">{children}</main>
    </div>
  );
}
