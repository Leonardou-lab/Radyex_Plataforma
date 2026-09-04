"use client";

import { LayoutGrid, TriangleAlert } from "lucide-react";
import { STUDY_CATEGORIES } from "@/lib/data";
import {
  recalcularPaquetesActivos,
  validarEstudios,
  type SeleccionEstudios as Seleccion,
} from "@/lib/estudios-solicitud";
import { ANCLAS } from "./anclas";
import { PaquetesRapidos } from "./PaquetesRapidos";
import { CategoriaEstudios } from "./CategoriaEstudios";
import { TomografiaFov } from "./TomografiaFov";

type SeleccionEstudiosProps = {
  valor: Seleccion;
  onChange: (valor: Seleccion) => void;
  /** Agregar/quitar la nota de un paquete en "Indicaciones". */
  onNota: (nota: string, agregar: boolean) => void;
  /** Muestra los errores inline (solo tras intentar enviar). */
  mostrarErrores: boolean;
};

/**
 * Panel "Estudios que se solicitan" del formulario de nueva orden.
 *
 * Es un componente CONTROLADO: no guarda estado propio. Recibe la selección
 * completa en `valor` y avisa cada cambio por `onChange`. El estado vive en el
 * formulario (que es quien lo envía), así no hay dos fuentes de verdad.
 *
 * Se arma solo desde el catálogo (`STUDY_CATEGORIES` + `TOMOGRAFIA_FOV` de
 * lib/data.ts): agregar un estudio nuevo no obliga a tocar este archivo.
 */
export function SeleccionEstudios({
  valor,
  onChange,
  onNota,
  mostrarErrores,
}: SeleccionEstudiosProps) {
  const errores = validarEstudios(valor);

  /**
   * Marca o desmarca un estudio. Después recalcula los paquetes activos: si
   * el doctor destildó a mano un estudio que formaba parte de un paquete, ese
   * paquete se apaga (nunca se prende solo — ver recalcularPaquetesActivos).
   */
  function alternarEstudio(id: string) {
    const estudios = valor.estudios.includes(id)
      ? valor.estudios.filter((e) => e !== id)
      : [...valor.estudios, id];
    const siguiente: Seleccion = { ...valor, estudios };
    onChange({ ...siguiente, paquetesActivos: recalcularPaquetesActivos(siguiente) });
  }

  /** Igual que arriba, pero al cambiar el FOV (Implantología lo fija). */
  function cambiarFov(fov: string | null) {
    const siguiente: Seleccion = { ...valor, fov };
    onChange({ ...siguiente, paquetesActivos: recalcularPaquetesActivos(siguiente) });
  }

  return (
    <div className="panel" id={ANCLAS.estudios} style={{ marginBottom: 20 }}>
      <div className="panel-title">
        <LayoutGrid size={17} strokeWidth={2} />
        Estudios que se solicitan
      </div>
      <div className="panel-sub">
        Elige un paquete para marcar sus estudios automáticamente, o selecciónalos uno por uno.
      </div>

      <PaquetesRapidos seleccion={valor} onSeleccion={onChange} onNota={onNota} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {STUDY_CATEGORIES.map((categoria) => (
          <CategoriaEstudios
            key={categoria.id}
            categoria={categoria}
            marcados={valor.estudios}
            onAlternar={alternarEstudio}
            tipoCaptura={valor.tipoCaptura}
            onTipoCaptura={(tipoCaptura) => onChange({ ...valor, tipoCaptura })}
            dientes={valor.dientesFdi}
            onDientes={(dientesFdi) => onChange({ ...valor, dientesFdi })}
            cefOtroTexto={valor.cefOtroTexto}
            onCefOtroTexto={(cefOtroTexto) => onChange({ ...valor, cefOtroTexto })}
            mostrarErrorDientes={mostrarErrores && errores.faltanDientes}
            mostrarErrorCefOtro={mostrarErrores && errores.faltaCefOtro}
          />
        ))}

        {/* Tomografía va aparte: no es un checkbox, se pide eligiendo FOV. */}
        <TomografiaFov
          fov={valor.fov}
          onFov={cambiarFov}
          zona={valor.zona}
          onZona={(zona) => onChange({ ...valor, zona })}
          mostrarErrorZona={mostrarErrores && errores.faltaZona}
        />
      </div>

      {mostrarErrores && errores.sinEstudios && (
        <div className="field-error" style={{ display: "flex", marginTop: 14 }}>
          <TriangleAlert size={13} strokeWidth={2} />
          Selecciona al menos un estudio.
        </div>
      )}
    </div>
  );
}
