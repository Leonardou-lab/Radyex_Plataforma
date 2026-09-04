"use client";

import { Package } from "lucide-react";
import { PAQUETES } from "@/lib/data";
import {
  etiquetasEntregaFisicaPaquete,
  recalcularPaquetesActivos,
  type SeleccionEstudios,
} from "@/lib/estudios-solicitud";

type PaquetesRapidosProps = {
  seleccion: SeleccionEstudios;
  onSeleccion: (sel: SeleccionEstudios) => void;
  /**
   * Aviso para que el formulario agregue o quite la nota del paquete en
   * "Indicaciones" (p. ej. la guía quirúrgica de Implantología). Vive en el
   * panel del doctor, por eso este componente no la escribe: la anuncia.
   */
  onNota: (nota: string, agregar: boolean) => void;
};

const TOOLTIP_FISICA =
  "Este estudio no se digitaliza; se entrega en físico y el paciente lo recoge.";

/**
 * Botones de paquete (Ortodoncia / Diagnóstico / Implantología) que marcan de
 * golpe los estudios que los componen.
 *
 * Cada paquete pre-marca su contenido COMPLETO y el doctor desmarca lo que no
 * quiera, no al revés (confirmado con Monse; ver docs/orden-de-estudio.md).
 * El contenido sale de `PAQUETES` en lib/data.ts, que está alineado 1:1 con la
 * tabla `paquete_estudios` de la BD.
 *
 * Un paquete solo se PRENDE con un click explícito (ver
 * `recalcularPaquetesActivos`), nunca por inferencia sobre los checkboxes.
 */
export function PaquetesRapidos({ seleccion, onSeleccion, onNota }: PaquetesRapidosProps) {
  function alternarPaquete(paqueteId: string) {
    const paquete = PAQUETES.find((p) => p.id === paqueteId);
    if (!paquete) return;

    // Se pregunta al arreglo de activos, no a la clase CSS: la clase se
    // recalcula y puede no coincidir con lo que el doctor clickeó.
    const activar = !seleccion.paquetesActivos.includes(paqueteId);

    // Estudios del paquete: se agregan o se quitan en bloque.
    const estudios = activar
      ? [...new Set([...seleccion.estudios, ...paquete.items])]
      : seleccion.estudios.filter((id) => !paquete.items.includes(id));

    // FOV: solo Implantología lo fija. Al desactivar, se quita solo si es
    // justo el que este paquete había puesto.
    let fov = seleccion.fov;
    if (paquete.fov) {
      fov = activar ? paquete.fov : seleccion.fov === paquete.fov ? null : seleccion.fov;
    }

    const paquetesActivos = activar
      ? [...seleccion.paquetesActivos, paqueteId]
      : seleccion.paquetesActivos.filter((id) => id !== paqueteId);

    const siguiente: SeleccionEstudios = { ...seleccion, estudios, fov, paquetesActivos };

    // Desactivar un paquete puede romper los requisitos de otro que compartía
    // estudios con él — por eso se recalcula antes de publicar el cambio.
    onSeleccion({ ...siguiente, paquetesActivos: recalcularPaquetesActivos(siguiente) });

    // La nota va a "Indicaciones", que vive en el panel del doctor.
    if (paquete.nota) onNota(paquete.nota, activar);
  }

  return (
    <div className="package-row" style={{ marginBottom: 22 }}>
      {PAQUETES.map((paquete) => {
        const activo = seleccion.paquetesActivos.includes(paquete.id);
        const fisicas = etiquetasEntregaFisicaPaquete(paquete);

        return (
          <button
            key={paquete.id}
            type="button"
            className={`package-btn${activo ? " active" : ""}`}
            aria-pressed={activo}
            onClick={() => alternarPaquete(paquete.id)}
          >
            <div className="package-btn-title">{paquete.label}</div>
            <div className="package-btn-desc">
              {paquete.desc}
              {paquete.nota && (
                <>
                  <br />
                  {paquete.nota}
                </>
              )}
            </div>
            {fisicas.length > 0 && (
              <div className="package-btn-fisica" title={TOOLTIP_FISICA}>
                <Package size={12} strokeWidth={2} />
                Incluye entrega física: {fisicas.join(", ")}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
