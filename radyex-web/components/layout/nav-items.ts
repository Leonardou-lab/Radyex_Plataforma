import {
  Home,
  FilePlus,
  ClipboardList,
  Users,
  MessageSquare,
  Stethoscope,
  Upload,
  History,
  BarChart3,
  Inbox,
  type LucideIcon,
} from "lucide-react";

// Ítem de menú del Sidebar. `badge` es opcional: hoy solo lo usa
// "Mis órdenes" para mostrar el total de órdenes del doctor.
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "ordenesDoctor";
};

// Vista Doctor referente: URLs "limpias" (sin prefijo), porque es
// la cara pública del producto. Solo "Mis órdenes" (/ordenes) está
// migrada en esta fase; el resto de los href ya quedan listos para
// cuando se migren esas pantallas (fase 4).
export const DOCTOR_NAV_ITEMS: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/nueva-orden", label: "Nueva orden", icon: FilePlus },
  { href: "/ordenes", label: "Mis órdenes", icon: ClipboardList, badge: "ordenesDoctor" },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/dudas", label: "Dudas o sugerencias", icon: MessageSquare },
];

// Vista Radyex (panel interno): agrupada bajo /admin para no
// chocar con las rutas de la vista Doctor (ambas tienen pantallas
// "inicio", "ordenes", "pacientes"). Ninguna de estas pantallas
// está migrada todavía — son las siguientes en la fase 4.
export const RADYEX_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: Home },
  // "Solicitudes" no viene del mockup: nació con la mecánica
  // `solicitudes_orden` (las órdenes que manda el doctor pasan por revisión
  // del equipo antes de existir). Va antes de "Órdenes" porque es la bandeja
  // de entrada del flujo: primero se revisa, luego la orden aparece allá.
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/admin/ordenes", label: "Órdenes", icon: ClipboardList },
  { href: "/admin/doctores", label: "Doctores", icon: Stethoscope },
  { href: "/admin/subir", label: "Subir archivos", icon: Upload },
  { href: "/admin/pacientes", label: "Pacientes", icon: Users },
  { href: "/admin/bitacora", label: "Bitácora", icon: History },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
];
