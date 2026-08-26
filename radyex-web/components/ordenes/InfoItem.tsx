import type { LucideIcon } from "lucide-react";

type InfoItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

/** Un dato del paciente (ícono + etiqueta + valor) dentro de PatientModal. */
export function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="info-item">
      <div className="info-icon">
        <Icon size={15} strokeWidth={2} />
      </div>
      <div>
        <div className="info-label">{label}</div>
        <div className="info-value">{value}</div>
      </div>
    </div>
  );
}
