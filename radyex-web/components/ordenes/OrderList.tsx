"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, ClipboardList, Clock, Check } from "lucide-react";
import type { Orden, EstatusOrden } from "@/lib/data";
import { OrderCard } from "./OrderCard";
import { PatientModal } from "./PatientModal";

type OrderListProps = {
  /** Órdenes a mostrar (ya acotadas por la RLS en la página). */
  orders: Orden[];
  /** Iniciales del usuario en sesión, para el avatar del topbar. */
  doctorIniciales: string;
  /** Título del topbar. Default: el de la vista Doctor ("Mis órdenes"). */
  titulo?: string;
  /** Subtítulo del topbar. Default: el de la vista Doctor. */
  subtitulo?: string;
  /** Muestra el botón "Nueva orden" del topbar. Solo vista Doctor. Default: true. */
  mostrarNuevaOrden?: boolean;
  /**
   * Vista Radyex: muestra el doctor referente en cada tarjeta y deja
   * buscar por su nombre. Default: false (vista Doctor, sin cambios).
   */
  mostrarDoctor?: boolean;
  /**
   * Bloque opcional que se dibuja entre las tarjetas de resumen y el
   * buscador. Hoy lo usa la vista Doctor para la sección "En revisión"
   * (solicitudes que Radyex aún no procesa). Es un slot genérico a
   * propósito: OrderList no sabe qué le meten, así que no queda acoplado a
   * las solicitudes y la vista Radyex simplemente no lo pasa.
   */
  encabezado?: React.ReactNode;
};

// Filtros de estatus del toolbar. "todos" no es un EstatusOrden real,
// por eso el tipo es la unión explícita en vez de solo EstatusOrden.
type Filtro = "todos" | EstatusOrden;

const FILTROS: { key: Filtro; label: string; color?: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendiente", label: "Pendiente", color: "var(--pending)" },
  { key: "en_proceso", label: "En proceso", color: "var(--warn)" },
  { key: "finalizado", label: "Finalizado", color: "var(--success)" },
];

/**
 * PLANTILLA de migración (ver docs/migracion-nextjs.md): esta es la
 * pantalla de referencia de la fase 1. Componente "de pantalla"
 * (client component, por eso "use client" arriba): junta los datos
 * (recibidos por props desde app/(doctor)/ordenes/page.tsx) con el
 * estado de la interfaz.
 *
 * Tres estados con useState, cada uno con una responsabilidad:
 * - `busqueda`: texto de la caja de búsqueda.
 * - `filtroActivo`: chip de estatus seleccionado.
 * - `ordenAbierta`: qué orden se muestra en el modal (null = cerrado).
 *
 * React vuelve a ejecutar este componente cada vez que alguno de
 * estos estados cambia, así que `ordenesFiltradas` de abajo se
 * recalcula solo con cada tecleo o click en un chip — no hace falta
 * un event listener manual como en el mockup (`input.addEventListener`).
 */
export function OrderList({
  orders,
  doctorIniciales,
  titulo = "Mis órdenes",
  subtitulo = "Consulta y da seguimiento a los estudios de tus pacientes",
  mostrarNuevaOrden = true,
  mostrarDoctor = false,
  encabezado,
}: OrderListProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<Filtro>("todos");
  const [ordenAbierta, setOrdenAbierta] = useState<Orden | null>(null);

  // Los números de las tarjetas de resumen (stats) son siempre del
  // total de órdenes del doctor, sin importar el filtro/búsqueda
  // activos — igual que en el mockup.
  const totalEnProceso = orders.filter((o) => o.estatus === "en_proceso").length;
  const totalFinalizadas = orders.filter((o) => o.estatus === "finalizado").length;
  const totalPendientes = orders.filter((o) => o.estatus === "pendiente").length;

  const ordenesFiltradas = orders
    .filter((o) => filtroActivo === "todos" || o.estatus === filtroActivo)
    .filter((o) => {
      const q = busqueda.trim().toLowerCase();
      const coincideBase =
        o.nombrePaciente.toLowerCase().includes(q) || o.folio.toLowerCase().includes(q);
      // Vista Radyex: además, buscar por nombre del doctor referente.
      return coincideBase || (mostrarDoctor && (o.doctorNombre ?? "").toLowerCase().includes(q));
    });

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">{titulo}</div>
          <div className="page-sub">{subtitulo}</div>
        </div>
        <div className="topbar-actions">
          {mostrarNuevaOrden && (
            <Link className="btn-primary" href="/nueva-orden">
              <Plus size={16} strokeWidth={2.2} />
              Nueva orden
            </Link>
          )}
          <div className="avatar">{doctorIniciales}</div>
        </div>
      </div>

      <div className="content">
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--pending-soft)", color: "var(--pending)" }}>
              <ClipboardList size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="stat-num">{orders.length}</div>
              <div className="stat-label">Órdenes totales</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>
              <Clock size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="stat-num">{totalEnProceso}</div>
              <div className="stat-label">En proceso</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
              <Check size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="stat-num">{totalFinalizadas}</div>
              <div className="stat-label">Finalizadas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--pending-soft)", color: "var(--ink-soft)" }}>
              <Clock size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="stat-num">{totalPendientes}</div>
              <div className="stat-label">Pendientes</div>
            </div>
          </div>
        </div>

        {/* Slot del encabezado (ver prop `encabezado`): va después de los
            stats y antes del buscador, porque no forma parte de la lista
            filtrable de abajo. */}
        {encabezado}

        <div className="toolbar">
          <div className="search-box">
            <Search size={16} strokeWidth={2} />
            <input
              type="text"
              placeholder={
                mostrarDoctor ? "Buscar paciente, folio o doctor..." : "Buscar paciente o folio..."
              }
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="filters">
            {/* Un chip por filtro, generado con .map() — así agregar un
                estatus nuevo el día de mañana es agregar una fila al
                arreglo FILTROS, no copiar/pegar un <button>. */}
            {FILTROS.map((filtro) => (
              <button
                key={filtro.key}
                className={`chip${filtroActivo === filtro.key ? " active" : ""}`}
                onClick={() => setFiltroActivo(filtro.key)}
              >
                {filtro.color && <span className="dot" style={{ background: filtro.color }} />}
                {filtro.label}
              </button>
            ))}
          </div>
        </div>

        <div className="order-list">
          {ordenesFiltradas.length === 0 ? (
            <div className="empty-state">No encontramos órdenes con esos criterios.</div>
          ) : (
            // `order.folio` es único por orden, por eso sirve de key.
            // React lo usa para saber qué tarjeta es cuál entre un
            // render y el siguiente (por ejemplo, al filtrar).
            ordenesFiltradas.map((order) => (
              <OrderCard
                key={order.folio}
                order={order}
                onOpen={setOrdenAbierta}
                mostrarDoctor={mostrarDoctor}
              />
            ))
          )}
        </div>
        <p className="mt-3.5 text-[12.5px] text-[var(--text-muted)]">
          Toca cualquier paciente para ver su información completa y sus archivos.
        </p>
      </div>

      {ordenAbierta && (
        <PatientModal order={ordenAbierta} onClose={() => setOrdenAbierta(null)} />
      )}
    </>
  );
}
