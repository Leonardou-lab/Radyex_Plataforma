import { Calendar, Hourglass, LayoutGrid, UserPlus } from "lucide-react";
import type { SolicitudEnRevision } from "@/lib/mapeo-solicitudes";

type SolicitudesEnRevisionProps = {
  solicitudes: SolicitudEnRevision[];
};

/**
 * Sección "En revisión" de la pantalla "Mis órdenes": las solicitudes que el
 * doctor ya envió y que el equipo Radyex todavía no procesa.
 *
 * Existe porque sin ella el doctor manda una solicitud y no la ve en ningún
 * lado: `/ordenes` lee la tabla `ordenes`, y una solicitud pendiente todavía
 * no es una orden (la orden y su folio nacen al aprobarla).
 *
 * Es un componente PROPIO a propósito, no una variante de `OrderCard`: una
 * solicitud no tiene folio ni estatus de orden, así que no cabe en el molde
 * `Orden` sin inventar campos vacíos ni meter un cuarto estado en
 * `STATUS_MAP`. Tampoco es clicable — no hay detalle que abrir todavía.
 *
 * Server Component: no tiene interacción, así que no necesita "use client".
 */
export function SolicitudesEnRevision({ solicitudes }: SolicitudesEnRevisionProps) {
  // Sin solicitudes pendientes la sección entera desaparece: no se le ocupa
  // espacio al doctor con un bloque vacío.
  if (solicitudes.length === 0) return null;

  return (
    <div className="panel" style={{ marginBottom: 24 }}>
      <div className="panel-title">
        <Hourglass size={17} strokeWidth={2} />
        En revisión ({solicitudes.length})
      </div>
      <div className="panel-sub">
        Radyex está procesando estas solicitudes. Cuando las aprueben aparecerán abajo como
        órdenes, con su folio.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {solicitudes.map((solicitud) => (
          <div className="revision-row" key={solicitud.id}>
            <div className="order-avatar">{solicitud.iniciales}</div>
            <div className="order-main">
              <div className="order-name">{solicitud.nombrePaciente}</div>
              <div className="order-meta">
                <div className="order-meta-item">
                  <Calendar size={13} strokeWidth={2} />
                  {solicitud.fechaSolicitud}
                </div>
                <div className="order-meta-item">
                  <LayoutGrid size={13} strokeWidth={2} />
                  {solicitud.tipoEstudio}
                </div>
                {/* Solo si el paciente es nuevo para este doctor: le explica
                    por qué la revisión puede tardar un poco más. */}
                {solicitud.esPacienteNuevo && (
                  <div className="order-meta-item">
                    <UserPlus size={13} strokeWidth={2} />
                    Paciente nuevo
                  </div>
                )}
              </div>
            </div>
            <div className="revision-pill">
              <span className="dot" />
              <span>En revisión</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
