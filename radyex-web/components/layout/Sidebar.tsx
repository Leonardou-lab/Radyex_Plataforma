"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { DOCTOR_NAV_ITEMS, RADYEX_NAV_ITEMS } from "./nav-items";
import { getCurrentDoctor, getOrdersByDoctor, initials } from "@/lib/data";

export type Rol = "doctor" | "radyex";

/**
 * Datos del usuario en sesión para el Sidebar y la barra móvil.
 * Todavía no hay login real (fase 3): el doctor en sesión siempre
 * es el mismo (CURRENT_DOCTOR_ID en lib/data.ts) y el personal
 * Radyex se muestra como un solo perfil genérico, igual que en el
 * mockup. Exportada porque MobileTopbar también necesita las
 * iniciales para su avatar.
 */
export function getUsuarioSidebar(role: Rol) {
  if (role === "radyex") {
    return { nombre: "Equipo Radyex", rolTexto: "Personal interno", iniciales: "RX" };
  }
  const doctorActual = getCurrentDoctor();
  return {
    nombre: doctorActual?.name ?? "",
    rolTexto: "Doctora referente",
    iniciales: doctorActual ? initials(doctorActual.name) : "",
  };
}

type SidebarProps = {
  role: Rol;
  /** En móvil, si el drawer está abierto (agrega la clase "open"). */
  open: boolean;
  /** Se llama al hacer click en un ítem del menú (cierra el drawer en móvil). */
  onNavigate: () => void;
};

/**
 * Menú lateral compartido por las dos vistas del sitio (Doctor y
 * Radyex). UN solo componente con los ítems que le tocan según
 * `role`, en vez de repetir el mismo marcado de sidebar en cada
 * pantalla como hacía el mockup estático (ver docs/migracion-nextjs.md).
 *
 * `usePathname()` (hook de Next.js) da la URL actual para marcar el
 * ítem activo — por eso este componente necesita "use client".
 */
export function Sidebar({ role, open, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const items = role === "doctor" ? DOCTOR_NAV_ITEMS : RADYEX_NAV_ITEMS;
  const usuario = getUsuarioSidebar(role);

  // El badge de "Mis órdenes" necesita el total de órdenes del
  // doctor en sesión (no aplica para la vista Radyex).
  const doctorActual = getCurrentDoctor();
  const totalOrdenesDoctor = doctorActual ? getOrdersByDoctor(doctorActual.id).length : 0;

  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      <div className="brand">
        <div className="brand-panel">
          <div className="brand-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG, sin optimización necesaria */}
            <img className="brand-logo" src="/logo/radyex-logo.svg" alt="RADYEX" />
          </div>
        </div>
      </div>
      <div className="role-tag">{role === "doctor" ? "Doctor referente" : "Panel interno"}</div>

      <div className="nav-section-label">Menú</div>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          // Cada <Link> es un ítem del arreglo de arriba: en vez de
          // escribir un <a> por pantalla (como el mockup), se genera
          // la lista con .map() y cada elemento necesita una `key`
          // única (aquí, el href) para que React sepa cuál es cuál.
          const activo = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`navitem${activo ? " active" : ""}`}
              onClick={onNavigate}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
              {item.badge === "ordenesDoctor" && <span className="badge">{totalOrdenesDoctor}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{usuario.iniciales}</div>
          <div>
            <div className="sidebar-user-name">{usuario.nombre}</div>
            <div className="sidebar-user-role">{usuario.rolTexto}</div>
          </div>
        </div>
        <Link href="/" className="navitem" onClick={onNavigate}>
          <LogOut size={18} strokeWidth={2} />
          <span>Salir</span>
        </Link>
      </div>
    </aside>
  );
}
