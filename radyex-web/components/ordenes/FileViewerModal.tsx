"use client";

import { useEffect } from "react";
import { X, FileText, Download, ExternalLink } from "lucide-react";
import type { ArchivoOrden } from "@/lib/data";

type FileViewerModalProps = {
  file: ArchivoOrden;
  onClose: () => void;
};

/**
 * Visor de un archivo (PDF de ejemplo en un iframe). Se abre
 * "encima" de PatientModal cuando el doctor toca "Ver archivo" —
 * son dos overlays independientes, cada uno con su propio estado,
 * igual que en el mockup (ver .modal-overlay.viewer-overlay en
 * app/radyex-ui.css para el z-index que lo pone por encima).
 */
export function FileViewerModal({ file, onClose }: FileViewerModalProps) {
  // Cerrar con la tecla Escape mientras el visor está abierto.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay open viewer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card modal-viewer">
        <button className="modal-close" aria-label="Cerrar visor" onClick={onClose}>
          <X size={16} strokeWidth={2.2} />
        </button>

        <div className="viewer-header">
          <div className="viewer-icon">
            <FileText size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="viewer-name">{file.name}</div>
            <div className="viewer-date">{file.date}</div>
          </div>
        </div>

        <div className="viewer-frame-wrap">
          <iframe src={file.src} title="Vista previa del documento" />
        </div>

        <div className="viewer-actions">
          <a className="btn-secondary" href={file.src} download={file.name}>
            <Download size={16} strokeWidth={2} />
            Descargar
          </a>
          <a className="btn-secondary" href={file.src} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={15} strokeWidth={2} />
            Abrir en pestaña nueva
          </a>
        </div>
      </div>
    </div>
  );
}
