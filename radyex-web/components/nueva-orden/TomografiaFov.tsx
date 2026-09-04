"use client";

import { LayoutGrid, TriangleAlert } from "lucide-react";
import { TOMOGRAFIA_FOV } from "@/lib/data";
import { fovPideZona } from "@/lib/estudios-solicitud";
import { ANCLAS } from "./anclas";

type TomografiaFovProps = {
  fov: string | null;
  onFov: (fov: string | null) => void;
  zona: string;
  onZona: (zona: string) => void;
  /** Muestra el error de "falta la zona" (solo tras intentar enviar). */
  mostrarErrorZona: boolean;
};

/**
 * Sección "Tomografía 3D (elegir FOV)". Va aparte de las demás categorías a
 * propósito: la tomografía NO es un checkbox del catálogo, se pide eligiendo
 * un campo de visión — igual que en el formato de papel.
 *
 * CONSECUENCIA IMPORTANTE (regla 2 de docs/orden-de-estudio.md § "Reglas de
 * mapeo"): como no hay checkbox, este componente nunca emite un `estudio_id`.
 * Quien sintetiza `{ estudio_id: 'tomografia-3d', fov, zona }` es
 * `construirEstudiosSolicitud()` en lib/estudios-solicitud.ts. Si algún día se
 * cambia esto, revisar allá también.
 */
export function TomografiaFov({ fov, onFov, zona, onZona, mostrarErrorZona }: TomografiaFovProps) {
  return (
    <div className="study-section">
      <div className="study-section-title">
        <LayoutGrid size={16} strokeWidth={2} />
        Tomografía 3D (elegir FOV)
      </div>

      <div className="fov-grid">
        {TOMOGRAFIA_FOV.map((campo) => (
          <label key={campo.value} className={`fov-card${fov === campo.value ? " checked" : ""}`}>
            <div className="fov-card-title">
              <input
                type="radio"
                name="fov"
                value={campo.value}
                checked={fov === campo.value}
                // Un segundo click sobre el FOV ya elegido lo desmarca: es la
                // única forma de "no pedir tomografía" después de haber
                // elegido uno, porque un grupo de radios no se vacía solo.
                onClick={() => onFov(fov === campo.value ? null : campo.value)}
                onChange={() => {
                  /* el cambio se maneja en onClick, para poder desmarcar */
                }}
              />
              {campo.label}
            </div>
            <div className="fov-card-help">{campo.help}</div>
          </label>
        ))}
      </div>

      {/* La zona solo se pide para el FOV que la requiere (hoy, 5×5). El flag
          sale del catálogo (`TOMOGRAFIA_FOV[].zona`), no hardcodeado aquí. */}
      {fovPideZona(fov) && (
        <div className={`field${mostrarErrorZona ? " invalid" : ""}`} style={{ margin: "14px 0 0" }}>
          <label className="field-label" htmlFor={ANCLAS.zona}>
            Zona a cubrir
          </label>
          <input
            id={ANCLAS.zona}
            type="text"
            placeholder="Ej. Molares superiores derechos"
            value={zona}
            onChange={(e) => onZona(e.target.value)}
          />
          <div className="field-error">
            <TriangleAlert size={13} strokeWidth={2} />
            Indica la zona a cubrir.
          </div>
        </div>
      )}
    </div>
  );
}
