import { SidebarShell } from "@/components/layout/SidebarShell";

// Layout de toda la vista Doctor: envuelve cada pantalla bajo este
// route group con el Sidebar + drawer móvil ya configurados para
// el rol "doctor" (ver components/layout/nav-items.ts).
export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <SidebarShell role="doctor">{children}</SidebarShell>;
}
