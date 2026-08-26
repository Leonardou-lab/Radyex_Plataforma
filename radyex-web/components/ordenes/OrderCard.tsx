import { MapPin, Tag, Calendar, LayoutGrid, ChevronRight } from "lucide-react";
import type { Orden } from "@/lib/data";
import { StatusPill } from "./StatusPill";

type OrderCardProps = {
  order: Orden;
  /** Se llama con la orden completa cuando el doctor toca la tarjeta. */
  onOpen: (order: Orden) => void;
};

/**
 * Tarjeta de una orden en la lista. Es "tonta": no sabe nada de
 * búsqueda ni filtros, solo recibe una orden por props y avisa al
 * padre (OrderList) cuando la tocan — el padre decide qué hacer
 * (abrir el modal de detalle).
 */
export function OrderCard({ order, onOpen }: OrderCardProps) {
  return (
    <div
      className={`order-card status-${order.status}`}
      onClick={() => onOpen(order)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(order);
      }}
    >
      <div className="order-avatar">{order.init}</div>
      <div className="order-main">
        <div className="order-name">{order.name}</div>
        <div className="order-meta">
          <div className="order-meta-item">
            <MapPin size={13} strokeWidth={2} />
            {order.loc}
          </div>
          <div className="order-meta-item">
            <Tag size={13} strokeWidth={2} />
            {order.code}
          </div>
          <div className="order-meta-item">
            <Calendar size={13} strokeWidth={2} />
            {order.date}
          </div>
          <div className="order-meta-item">
            <LayoutGrid size={13} strokeWidth={2} />
            {order.studyType}
          </div>
        </div>
      </div>
      <StatusPill status={order.status} />
      <ChevronRight className="chevron" size={18} strokeWidth={2} />
    </div>
  );
}
