"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Check,
  Link2,
  Search,
  Stethoscope,
  TriangleAlert,
  UserPlus,
  X,
} from "lucide-react";
import type { SolicitudParaRevision } from "@/lib/mapeo-solicitudes";
import {
  aprobarSolicitud,
  buscarPacientes,
  rechazarSolicitud,
  type CandidatoPaciente,
} from "@/app/(radyex)/admin/solicitudes/actions";

type RevisionModalProps = {
  solicitud: SolicitudParaRevision;
  onCerrar: () => void;
  /** Se llama al resolver (aprobar o rechazar) para avisar a la lista. */
  onResuelta: (mensaje: string) => void;
};

/**
 * Modal donde el equipo Radyex revisa UNA solicitud y la resuelve.
 *
 * La decisión de fondo es la deduplicación: cuando el doctor mandó un
 * "paciente nuevo", puede que esa persona YA exista en el expediente maestro
 * porque otro doctor la refirió antes (docs/perfiles-y-acceso.md § Pacientes
 * compartidos). Por eso, antes de aprobar, se ofrece buscar y ENLAZAR.
 *
 * Quien crea o enlaza al paciente NO es este componente: es
 * `aprobar_solicitud_orden()` en la base de datos, en una sola transacción.
 * Aquí solo se elige qué mandarle en `p_paciente_id`.
 */
export function RevisionModal({ solicitud, onCerrar, onResuelta }: RevisionModalProps) {
  // Paciente existente al que se enlazará. null = crear uno nuevo.
  const [enlazarA, setEnlazarA] = useState<CandidatoPaciente | null>(null);
  const [busqueda, setBusqueda] = useState(solicitud.datosTecleados?.nombreCompleto ?? "");
  const [candidatos, setCandidatos] = useState<CandidatoPaciente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [procesando, iniciar] = useTransition();

  const requiereDedup = solicitud.datosTecleados !== null;

  // Busca candidatos mientras el equipo escribe. El retraso evita disparar
  // una consulta por cada tecla; el "Buscando…" se enciende dentro del
  // timeout (no en el cuerpo del efecto) para no provocar renders en cascada
  // y, de paso, no parpadear con cada letra.
  useEffect(() => {
    if (!requiereDedup) return;
    let cancelado = false;
    const t = setTimeout(async () => {
      setBuscando(true);
      const resultados = await buscarPacientes(busqueda);
      if (!cancelado) {
        setCandidatos(resultados);
        setBuscando(false);
      }
    }, 350);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [busqueda, requiereDedup]);

  // Cerrar con Escape (mismo comportamiento que los otros modales).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCerrar]);

  function aprobar() {
    setError(null);
    iniciar(async () => {
      const r = await aprobarSolicitud(solicitud.id, enlazarA?.id ?? null, comentario.trim() || null);
      if (r.ok) {
        onResuelta(
          r.folio
            ? `Orden creada con folio ${r.folio}.`
            : "Solicitud aprobada.",
        );
      } else {
        setError(r.error);
      }
    });
  }

  function rechazar() {
    setError(null);
    if (!comentario.trim()) {
      setError("Escribe un motivo antes de rechazar la solicitud.");
      return;
    }
    iniciar(async () => {
      const r = await rechazarSolicitud(solicitud.id, comentario.trim());
      if (r.ok) onResuelta("Solicitud rechazada.");
      else setError(r.error);
    });
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="modal-card">
        <button className="modal-close" aria-label="Cerrar" onClick={onCerrar}>
          <X size={16} strokeWidth={2.2} />
        </button>

        <div className="modal-header">
          <div className="modal-avatar">{solicitud.iniciales}</div>
          <div>
            <div className="modal-name">{solicitud.nombrePaciente}</div>
            <div className="modal-folio">
              {solicitud.fechaSolicitud} · Entrega {solicitud.entrega}
            </div>
          </div>
        </div>

        <div className="revision-dato">
          <Stethoscope size={14} strokeWidth={2} />
          Solicitada por <strong>{solicitud.doctorNombre}</strong>
        </div>

        {solicitud.indicaciones && (
          <div className="revision-bloque">
            <div className="revision-bloque-titulo">Indicaciones</div>
            <p style={{ whiteSpace: "pre-line" }}>{solicitud.indicaciones}</p>
          </div>
        )}

        <div className="revision-bloque">
          <div className="revision-bloque-titulo">Estudios solicitados</div>
          <ul className="revision-estudios">
            {solicitud.estudios.map((e, i) => (
              <li key={i}>
                {e.etiqueta}
                {e.detalle && <span className="revision-estudio-detalle"> — {e.detalle}</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* --- Resolución del paciente --- */}
        {requiereDedup ? (
          <div className="revision-bloque">
            <div className="revision-bloque-titulo">
              Paciente nuevo para este doctor — revisa si ya existe
            </div>

            <div className="revision-datos-tecleados">
              {solicitud.datosTecleados?.edad !== null && (
                <span>{solicitud.datosTecleados?.edad} años</span>
              )}
              {solicitud.datosTecleados?.telefono && (
                <span>{solicitud.datosTecleados.telefono}</span>
              )}
              {solicitud.datosTecleados?.correo && <span>{solicitud.datosTecleados.correo}</span>}
            </div>

            {enlazarA ? (
              <div className="selected-chip">
                <Link2 size={15} strokeWidth={2} />
                Se enlazará a: {enlazarA.nombreCompleto}
                {enlazarA.edad !== null && ` · ${enlazarA.edad} años`}
                <button type="button" aria-label="Quitar enlace" onClick={() => setEnlazarA(null)}>
                  <X size={14} strokeWidth={2.2} />
                </button>
              </div>
            ) : (
              <>
                <div className="input-with-icon" style={{ marginTop: 8 }}>
                  <Search size={16} strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Buscar en el expediente maestro..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="revision-candidatos">
                  {buscando && <div className="revision-vacio">Buscando…</div>}
                  {!buscando && candidatos.length === 0 && (
                    <div className="revision-vacio">
                      Sin coincidencias. Al aprobar se creará un expediente nuevo.
                    </div>
                  )}
                  {!buscando &&
                    candidatos.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="search-result-item"
                        onClick={() => setEnlazarA(c)}
                      >
                        <div>
                          <div>{c.nombreCompleto}</div>
                          <div className="sr-sub">
                            {[c.edad !== null ? `${c.edad} años` : null, c.telefono, c.correo]
                              .filter(Boolean)
                              .join(" · ") || "sin datos de contacto"}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="revision-dato">
            <UserPlus size={14} strokeWidth={2} />
            El doctor eligió a un paciente que ya había referido — no hay que deduplicar.
          </div>
        )}

        {/* --- Comentario y acciones --- */}
        <div className="field" style={{ marginTop: 18 }}>
          <label className="field-label" htmlFor="comentarioRevision">
            Comentario <span className="opt">(obligatorio para rechazar)</span>
          </label>
          <textarea
            id="comentarioRevision"
            style={{ minHeight: 64 }}
            placeholder="Motivo del rechazo, o una nota interna sobre esta revisión."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>

        {error && (
          <div className="field-error" style={{ display: "flex", marginBottom: 12 }}>
            <TriangleAlert size={13} strokeWidth={2} />
            {error}
          </div>
        )}

        <div className="revision-acciones">
          <button
            type="button"
            className="btn-secondary"
            onClick={rechazar}
            disabled={procesando}
          >
            Rechazar
          </button>
          <button type="button" className="btn-primary" onClick={aprobar} disabled={procesando}>
            <Check size={16} strokeWidth={2.2} />
            {procesando
              ? "Procesando…"
              : enlazarA
                ? "Enlazar y aprobar"
                : requiereDedup
                  ? "Crear paciente y aprobar"
                  : "Aprobar"}
          </button>
        </div>
      </div>
    </div>
  );
}
