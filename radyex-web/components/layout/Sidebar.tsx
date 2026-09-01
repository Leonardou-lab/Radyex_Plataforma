"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { DOCTOR_NAV_ITEMS, RADYEX_NAV_ITEMS } from "./nav-items";
import { logout } from "@/app/login/actions";

export type Rol = "doctor" | "radyex";

/**
 * Datos del usuario en sesión que necesita el Sidebar (y, vía
 * SidebarShell, la barra móvil). Los resuelve en el servidor el
 * layout de cada route group (`app/(doctor)/layout.tsx` /
 * `app/(radyex)/layout.tsx`): nombre y rol reales desde `usuarios`,
 * y el conteo de órdenes desde la BD con RLS. Se bajan por props
 * porque este componente es "use client" y no consulta Supabase.
 */
export type UsuarioSidebar = {
  nombre: string;
  rolTexto: string;
  iniciales: string;
  /** Total de órdenes del doctor en sesión. En la vista Radyex es 0 (no se usa). */
  totalOrdenes: number;
};

type SidebarProps = {
  role: Rol;
  /** Usuario en sesión, resuelto en el layout (servidor). */
  usuario: UsuarioSidebar;
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
export function Sidebar({ role, usuario, open, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const items = role === "doctor" ? DOCTOR_NAV_ITEMS : RADYEX_NAV_ITEMS;

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
              {item.badge === "ordenesDoctor" && <span className="badge">{usuario.totalOrdenes}</span>}
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
        {/* Server Action de components/layout/Sidebar.tsx -> app/login/actions.ts.
            Antes este botón era un <Link href="/"> de relleno (sin login real
            todavía); ahora cierra la sesión de Supabase de verdad. */}
        <form action={logout}>
          <button type="submit" className="navitem" onClick={onNavigate}>
            <LogOut size={18} strokeWidth={2} />
            <span>Cerrar sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
