"use client";

import { LayoutGrid, TriangleAlert } from "lucide-react";
import type { CategoriaEstudio } from "@/lib/data";
import { esEntregaFisica, type TipoCaptura } from "@/lib/estudios-solicitud";
import { ANCLAS } from "./anclas";
import { BadgeEntregaFisica } from "./BadgeEntregaFisica";
import { PanelPeriapical } from "./PanelPeriapical";

type CategoriaEstudiosProps = {
  categoria: CategoriaEstudio;
  /** Ids marcados (de toda la selección, no solo de esta categoría). */
  marcados: string[];
  onAlternar: (id: string) => void;
  // --- Detalle de Periapical (solo lo usa la categoría que lo contiene) ---
  tipoCaptura: TipoCaptura;
  onTipoCaptura: (tipo: TipoCaptura) => void;
  dientes: string[];
  onDientes: (dientes: string[]) => void;
  // --- Detalle de Cefalometría "Otro" ---
  cefOtroTexto: string;
  onCefOtroTexto: (texto: string) => void;
  // --- Errores (solo tras intentar enviar) ---
  mostrarErrorDientes: boolean;
  mostrarErrorCefOtro: boolean;
};

/**
 * Una de las categorías del formulario (intraorales, extraorales,
 * fotografías, modelos, cefalometría), con sus checkboxes.
 *
 * Es dirigido por datos: recorre `categoria.items` del catálogo
 * (`lib/data.ts`). Los dos estudios con detalle extra se reconocen por sus
 * flags del catálogo, no por su id escrito a mano aquí:
 *  - `item.teeth`  -> Periapical: abre el subpanel de Sensor/RX + dientes.
 *  - `item.note`   -> Cefalometría "Otro": abre el campo de texto libre.
 * Así, agregar un estudio nuevo al catálogo no obliga a tocar este archivo.
 */
export function CategoriaEstudios({
  categoria,
  marcados,
  onAlternar,
  tipoCaptura,
  onTipoCaptura,
  dientes,
  onDientes,
  cefOtroTexto,
  onCefOtroTexto,
  mostrarErrorDientes,
  mostrarErrorCefOtro,
}: CategoriaEstudiosProps) {
  return (
    <div className="study-section">
      <div className="study-section-title">
        <LayoutGrid size={16} strokeWidth={2} />
        {categoria.label}
      </div>

      <div className="study-grid">
        {categoria.items.map((item) => {
          const marcado = marcados.includes(item.id);
          // El badge de entrega física depende del catálogo y, para
          // Periapical, además de si eligió RX (con sensor es digital).
          const fisica = marcado && esEntregaFisica(item, tipoCaptura);
          // Los estudios con detalle extra ocupan toda la fila del grid,
          // porque su subpanel es ancho.
          const anchoCompleto = item.teeth === true || item.note === true;

          return (
            <div key={item.id} style={anchoCompleto ? { gridColumn: "1/-1" } : undefined}>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  className="study-check"
                  checked={marcado}
                  onChange={() => onAlternar(item.id)}
                />
                <span>{item.label}</span>
              </label>

              {fisica && <BadgeEntregaFisica />}

              {/* Periapical: Sensor/RX + carta dental FDI. */}
              {item.teeth === true && marcado && (
                <PanelPeriapical
                  tipoCaptura={tipoCaptura}
                  onTipoCaptura={onTipoCaptura}
                  dientes={dientes}
                  onDientes={onDientes}
                  mostrarError={mostrarErrorDientes}
                />
              )}

              {/* Cefalometría "Otro": técnica en texto libre. */}
              {item.note === true && marcado && (
                <div
                  className={`field${mostrarErrorCefOtro ? " invalid" : ""}`}
                  style={{ margin: "10px 0 0" }}
                >
                  <input
                    id={ANCLAS.cefOtro}
                    type="text"
                    placeholder="Especifica la técnica de cefalometría"
                    value={cefOtroTexto}
                    onChange={(e) => onCefOtroTexto(e.target.value)}
                  />
                  <div className="field-error">
                    <TriangleAlert size={13} strokeWidth={2} />
                    Especifica la técnica.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
