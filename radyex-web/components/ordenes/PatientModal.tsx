"use client";

import { useEffect, useState } from "react";
import { X, FileText, Eye, Download, Stethoscope, Phone, Mail, User, Calendar, LayoutGrid } from "lucide-react";
import { getDoctorById, type Orden, type ArchivoOrden } from "@/lib/data";
import { StatusPill } from "./StatusPill";
import { InfoItem } from "./InfoItem";
import { FileViewerModal } from "./FileViewerModal";

type PatientModalProps = {
  order: Orden;
  onClose: () => void;
};

/**
 * Modal de detalle de paciente: datos de la orden + archivos
 * agrupados por año con pestañas. Se abre desde OrderList cuando
 * el doctor toca una OrderCard.
 *
 * Tiene DOS estados propios (con useState), independientes del
 * padre: qué año está activo en las pestañas, y qué archivo (si
 * alguno) está abierto en el visor. Son estados de UI que solo le
 * importan a este modal, por eso viven aquí y no en OrderList.
 */
export function PatientModal({ order, onClose }: PatientModalProps) {
  // Años con archivos, más reciente primero.
  const anios = Object.keys(order.archivos).sort((a, b) => Number(b) - Number(a));
  const [anioActivo, setAnioActivo] = useState(anios[0]);
  const [archivoEnVisor, setArchivoEnVisor] = useState<ArchivoOrden | null>(null);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const doctorReferente = getDoctorById(order.doctorId);
  const archivosDelAnio = order.archivos[anioActivo] ?? [];

  return (
    <>
      <div
        className="modal-overlay open"
        onClick={(e) => {
          // Solo cierra si el click fue en el fondo oscuro, no en la tarjeta.
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-card">
          <button className="modal-close" aria-label="Cerrar" onClick={onClose}>
            <X size={16} strokeWidth={2.2} />
          </button>

          <div className="modal-header">
            <div className="modal-avatar">{order.iniciales}</div>
            <div>
              <div className="modal-name">{order.nombrePaciente}</div>
              <div className="modal-folio">
                {order.folio} · {order.localidad}
              </div>
            </div>
            <div className="ml-auto">
              <StatusPill status={order.estatus} />
            </div>
          </div>

          <div className="modal-info-grid">
            <InfoItem icon={Stethoscope} label="Doctor referente" value={doctorReferente?.nombreCompleto ?? "—"} />
            <InfoItem icon={Phone} label="Teléfono" value={order.telefono} />
            <InfoItem icon={Mail} label="Correo" value={order.correo} />
            <InfoItem icon={User} label="Edad" value={`${order.edad} años`} />
            <InfoItem icon={Calendar} label="Paciente desde" value={order.pacienteDesde} />
            <InfoItem icon={LayoutGrid} label="Tipo de estudio" value={order.tipoEstudio} />
          </div>

          <div className="modal-section-title">
            <FileText size={16} strokeWidth={2} />
            Archivos del paciente
          </div>

          <div className="year-tabs">
            {/* Una pestaña por año, generada con .map(); `anio` es la
                key porque cada año aparece una sola vez en el arreglo. */}
            {anios.map((anio) => (
              <button
                key={anio}
                className={`year-tab${anio === anioActivo ? " active" : ""}`}
                onClick={() => setAnioActivo(anio)}
              >
                {anio}
              </button>
            ))}
          </div>

          <div className="file-list">
            {archivosDelAnio.length === 0 ? (
              <div className="file-empty">Aún no hay archivos cargados para {anioActivo}.</div>
            ) : (
              archivosDelAnio.map((archivo) => (
                <div className="file-row" key={archivo.nombreArchivo}>
                  <div className="file-icon">
                    <FileText size={16} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="file-name">{archivo.nombreArchivo}</div>
                    <div className="file-date">{archivo.fechaCaptura}</div>
                  </div>
                  <div className="file-row-actions">
                    <button
                      className="file-action"
                      title="Ver archivo"
                      aria-label="Ver archivo"
                      onClick={() => setArchivoEnVisor(archivo)}
                    >
                      <Eye size={15} strokeWidth={2} />
                    </button>
                    {/* Descargar no necesita JS: el atributo `download`
                        del navegador ya hace el trabajo. */}
                    <a
                      className="file-action"
                      title="Descargar archivo"
                      aria-label="Descargar archivo"
                      href={archivo.src}
                      download={archivo.nombreArchivo}
                    >
                      <Download size={15} strokeWidth={2} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {archivoEnVisor && (
        <FileViewerModal file={archivoEnVisor} onClose={() => setArchivoEnVisor(null)} />
      )}
    </>
  );
}
