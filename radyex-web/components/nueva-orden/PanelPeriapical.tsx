"use client";

import { TriangleAlert } from "lucide-react";
import { DIENTES_FDI } from "@/lib/data";
import type { TipoCaptura } from "@/lib/estudios-solicitud";
import { ANCLAS } from "./anclas";

type PanelPeriapicalProps = {
  tipoCaptura: TipoCaptura;
  onTipoCaptura: (tipo: TipoCaptura) => void;
  dientes: string[];
  onDientes: (dientes: string[]) => void;
  /** Muestra el error de "falta elegir dientes" (solo tras intentar enviar). */
  mostrarError: boolean;
};

/**
 * Subpanel que aparece al marcar "Periapical": elegir Sensor o RX y los
 * dientes por nomenclatura FDI, tal como el formato de papel
 * (docs/orden-de-estudio.md).
 *
 * OJO con los `value` de Sensor/RX: van en MINÚSCULA ('sensor' / 'rx') porque
 * ese es el formato canónico de la columna `orden_estudios.tipo_captura`
 * (`check in ('sensor','rx')`). El texto que ve el doctor sí va capitalizado.
 * Es la regla 1 de docs/orden-de-estudio.md § "Reglas de mapeo".
 */
export function PanelPeriapical({
  tipoCaptura,
  onTipoCaptura,
  dientes,
  onDientes,
  mostrarError,
}: PanelPeriapicalProps) {
  // Un diente se alterna: si ya estaba elegido se quita, si no se agrega.
  function alternarDiente(diente: string) {
    onDientes(
      dientes.includes(diente) ? dientes.filter((d) => d !== diente) : [...dientes, diente],
    );
  }

  return (
    <div className="study-subpanel" id={ANCLAS.periapical}>
      <div className="radio-pills" style={{ marginBottom: 14 }}>
        {/* El value canónico va aquí; el label es solo lo que se ve. */}
        <PillCaptura valor="sensor" label="Sensor" activo={tipoCaptura === "sensor"} onElegir={onTipoCaptura} />
        <PillCaptura valor="rx" label="RX" activo={tipoCaptura === "rx"} onElegir={onTipoCaptura} />
      </div>

      <FilaDientes titulo="Infantil" cuadrantes={DIENTES_FDI.infantil} elegidos={dientes} onAlternar={alternarDiente} />
      <FilaDientes titulo="Adulto" cuadrantes={DIENTES_FDI.adulto} elegidos={dientes} onAlternar={alternarDiente} />

      {mostrarError && (
        <div className="field-error" style={{ display: "flex", marginTop: 2 }}>
          <TriangleAlert size={13} strokeWidth={2} />
          Selecciona al menos un diente.
        </div>
      )}
    </div>
  );
}

/* ---------- Piezas internas de este panel ---------- */

function PillCaptura({
  valor,
  label,
  activo,
  onElegir,
}: {
  valor: TipoCaptura;
  label: string;
  activo: boolean;
  onElegir: (tipo: TipoCaptura) => void;
}) {
  return (
    <label className={`radio-pill${activo ? " checked" : ""}`}>
      <input
        type="radio"
        name="periapicalTipo"
        value={valor}
        checked={activo}
        onChange={() => onElegir(valor)}
      />
      {label}
    </label>
  );
}

/**
 * Una arcada de la carta dental. Los 4 cuadrantes van separados visualmente
 * igual que en el papel: [cuad 1] | [cuad 2] · [cuad 3] | [cuad 4].
 */
function FilaDientes({
  titulo,
  cuadrantes,
  elegidos,
  onAlternar,
}: {
  titulo: string;
  cuadrantes: string[][];
  elegidos: string[];
  onAlternar: (diente: string) => void;
}) {
  function chips(cuadrante: string[]) {
    return cuadrante.map((diente) => (
      <button
        key={diente}
        type="button"
        className={`tooth-chip${elegidos.includes(diente) ? " selected" : ""}`}
        aria-pressed={elegidos.includes(diente)}
        onClick={() => onAlternar(diente)}
      >
        {diente}
      </button>
    ));
  }

  return (
    <div className="tooth-row">
      <span className="tooth-row-label">{titulo}</span>
      {chips(cuadrantes[0])}
      <span className="tooth-sep" />
      {chips(cuadrantes[1])}
      <span className="tooth-dot-sep">·</span>
      {chips(cuadrantes[2])}
      <span className="tooth-sep" />
      {chips(cuadrantes[3])}
    </div>
  );
}
