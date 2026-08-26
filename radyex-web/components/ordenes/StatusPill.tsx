import { STATUS_MAP, type EstatusOrden } from "@/lib/data";

type StatusPillProps = {
  status: EstatusOrden;
};

/**
 * Chip de estatus (Pendiente / En proceso / Finalizado). Recibe el
 * estatus como prop y saca la etiqueta + el color de STATUS_MAP
 * (lib/data.ts), así el mapeo estatus→color vive en un solo lugar
 * y no se repite en cada pantalla que muestre una orden.
 */
export function StatusPill({ status }: StatusPillProps) {
  const { label, cls } = STATUS_MAP[status];
  return (
    <div className={`status-pill ${cls}`}>
      <span className="dot" />
      <span>{label}</span>
    </div>
  );
}
