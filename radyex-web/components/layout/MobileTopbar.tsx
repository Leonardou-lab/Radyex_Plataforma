"use client";

import { Menu } from "lucide-react";

type MobileTopbarProps = {
  avatarIniciales: string;
  onMenuClick: () => void;
};

/**
 * Barra fija que solo se ve en móvil (≤640px, ver .mobile-topbar en
 * app/radyex-ui.css): botón de hamburguesa + logo + avatar. No
 * guarda estado propio, solo avisa al padre (SidebarShell) que hay
 * que abrir el drawer.
 */
export function MobileTopbar({ avatarIniciales, onMenuClick }: MobileTopbarProps) {
  return (
    <div className="mobile-topbar">
      <button
        className="mobile-menu-btn"
        aria-label="Abrir menú"
        aria-expanded={false}
        onClick={onMenuClick}
      >
        <Menu size={22} strokeWidth={2} />
      </button>
      <div className="mobile-brand-panel">
        {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG, sin optimización necesaria */}
        <img src="/logo/radyex-logo.svg" alt="RADYEX" />
      </div>
      <div className="avatar">{avatarIniciales}</div>
    </div>
  );
}
