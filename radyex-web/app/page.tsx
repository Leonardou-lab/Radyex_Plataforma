import Link from "next/link";
import { Building2, Stethoscope, Check, ChevronRight } from "lucide-react";

// Portada con selector de rol, portada de index.html del mockup.
// Solo enlaza a /ordenes (única pantalla migrada en esta fase 1) y
// a /admin (placeholder de la vista Radyex) — sin login todavía,
// igual que en el mockup.
export default function Home() {
  return (
    <div className="role-select-wrap">
      <div className="role-select-brand">
        {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG, sin optimización necesaria */}
        <img className="role-select-logo" src="/logo/radyex-logo-white.svg" alt="RADYEX" />
      </div>

      <div className="role-cards">
        <Link className="role-card" href="/admin">
          <div className="role-card-icon">
            <Building2 size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="role-card-title">Entrar como Radyex</div>
            <div className="role-card-desc">
              Personal interno del centro. Administra doctores, sube los estudios y da
              seguimiento a las órdenes.
            </div>
          </div>
          <ul className="role-card-list">
            <li>
              <Check size={14} strokeWidth={2.4} /> Dar de alta doctores referentes
            </li>
            <li>
              <Check size={14} strokeWidth={2.4} /> Subir archivos a la carpeta del doctor
            </li>
            <li>
              <Check size={14} strokeWidth={2.4} /> Gestionar órdenes y pacientes
            </li>
          </ul>
          <div className="role-card-cta">
            Entrar al panel
            <ChevronRight size={16} strokeWidth={2.2} />
          </div>
        </Link>

        <Link className="role-card" href="/ordenes">
          <div className="role-card-icon">
            <Stethoscope size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="role-card-title">Entrar como Doctor</div>
            <div className="role-card-desc">
              Doctor referente externo. Solicita órdenes de estudio y consulta los
              archivos de tus pacientes.
            </div>
          </div>
          <ul className="role-card-list">
            <li>
              <Check size={14} strokeWidth={2.4} /> Solicitar nuevas órdenes de estudio
            </li>
            <li>
              <Check size={14} strokeWidth={2.4} /> Ver y descargar archivos de tus pacientes
            </li>
            <li>
              <Check size={14} strokeWidth={2.4} /> Sin funciones de administración
            </li>
          </ul>
          <div className="role-card-cta">
            Entrar al panel
            <ChevronRight size={16} strokeWidth={2.2} />
          </div>
        </Link>
      </div>

      <div className="role-select-foot">Prototipo en migración — sin datos reales ni autenticación.</div>
    </div>
  );
}
