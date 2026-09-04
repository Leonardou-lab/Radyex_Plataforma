import { MapPin, Tag, Calendar, LayoutGrid, ChevronRight, Stethoscope } from "lucide-react";
import { STATUS_MAP, type Orden } from "@/lib/data";
import { StatusPill } from "./StatusPill";

type OrderCardProps = {
  order: Orden;
  /** Se llama con la orden completa cuando el doctor toca la tarjeta. */
  onOpen: (order: Orden) => void;
  /**
   * Vista Radyex (equipo/admin): muestra el doctor referente como primer
   * dato de la tarjeta, en lugar de la localidad — porque aquí hay órdenes
   * de varios doctores y saber de quién es cada una sí importa. En la vista
   * Doctor no se pasa (default false) y la tarjeta se ve igual que siempre.
   */
  mostrarDoctor?: boolean;
};

/**
 * Tarjeta de una orden en la lista. Es "tonta": no sabe nada de
 * búsqueda ni filtros, solo recibe una orden por props y avisa al
 * padre (OrderList) cuando la tocan — el padre decide qué hacer
 * (abrir el modal de detalle).
 */
export function OrderCard({ order, onOpen, mostrarDoctor = false }: OrderCardProps) {
  // La clase CSS del borde de color (.status-success/.status-warn/
  // .status-pending en app/radyex-ui.css) usa el vocabulario VISUAL del
  // sistema de diseño, no el estatus de negocio — por eso se traduce con
  // STATUS_MAP en vez de interpolar `order.estatus` directo.
  const claseVisual = STATUS_MAP[order.estatus].cls;

  return (
    <div
      className={`order-card status-${claseVisual}`}
      onClick={() => onOpen(order)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(order);
      }}
    >
      <div className="order-avatar">{order.iniciales}</div>
      <div className="order-main">
        <div className="order-name">{order.nombrePaciente}</div>
        <div className="order-meta">
          {/* Primer dato: en la vista Radyex, el doctor referente; en la
              vista Doctor, la localidad del paciente (como siempre). */}
          <div className="order-meta-item">
            {mostrarDoctor ? (
              <>
                <Stethoscope size={13} strokeWidth={2} />
                {order.doctorNombre ?? "—"}
              </>
            ) : (
              <>
                <MapPin size={13} strokeWidth={2} />
                {order.localidad}
              </>
            )}
          </div>
          <div className="order-meta-item">
            <Tag size={13} strokeWidth={2} />
            {order.folio}
          </div>
          <div className="order-meta-item">
            <Calendar size={13} strokeWidth={2} />
            {order.fechaSolicitud}
          </div>
          <div className="order-meta-item">
            <LayoutGrid size={13} strokeWidth={2} />
            {order.tipoEstudio}
          </div>
        </div>
      </div>
      <StatusPill status={order.estatus} />
      <ChevronRight className="chevron" size={18} strokeWidth={2} />
    </div>
  );
}
