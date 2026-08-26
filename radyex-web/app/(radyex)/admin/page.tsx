import { Construction } from "lucide-react";

// Placeholder de la vista Radyex: solo existe para probar que el
// Sidebar y el layout compartido (SidebarShell) funcionan igual
// para el rol "radyex" que para "doctor". Las pantallas reales de
// esta vista (inicio, órdenes, doctores, subir, pacientes,
// bitácora, reportes) se migran en la fase 4, siguiendo "Mis
// órdenes" como patrón — no son parte de esta fase 1.
export default function AdminInicioPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Panel Radyex</div>
          <div className="page-sub">Vista interna del equipo Radyex</div>
        </div>
      </div>
      <div className="content">
        <div className="placeholder-block">
          <div className="placeholder-icon">
            <Construction size={26} strokeWidth={2} />
          </div>
          <p className="font-display text-[15px] font-semibold text-[var(--ink)]">
            Pantallas de Radyex — próximamente
          </p>
          <p className="mt-1.5 text-[13.5px] text-[var(--text-muted)]">
            Esta vista se migra pantalla por pantalla en la fase 4, usando &quot;Mis
            órdenes&quot; (vista Doctor) como plantilla.
          </p>
        </div>
      </div>
    </>
  );
}
