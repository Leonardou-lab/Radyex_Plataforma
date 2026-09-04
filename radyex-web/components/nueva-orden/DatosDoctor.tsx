"use client";

import { Stethoscope, TriangleAlert } from "lucide-react";
import type { Entrega } from "@/lib/data";
import { ANCLAS } from "./anclas";

export type PerfilDoctor = {
  nombre: string;
  correo: string;
  telefono: string;
};

type DatosDoctorProps = {
  doctor: PerfilDoctor;
  /** Fecha de hoy ya formateada, para el encabezado del panel. */
  fechaHoy: string;
  indicaciones: string;
  onIndicaciones: (texto: string) => void;
  entrega: Entrega | null;
  onEntrega: (entrega: Entrega) => void;
  mostrarErrorEntrega: boolean;
};

/**
 * Panel "Datos del doctor" del formulario de nueva orden.
 *
 * Nombre, email y WhatsApp salen de la sesión y se muestran de SOLO LECTURA,
 * a diferencia del mockup, donde eran inputs editables. Motivo: no tienen
 * columna en `ordenes` — el dueño de la orden es `ordenes.doctor_id`. Dejarlos
 * editables daría a entender que el doctor puede mandar la orden a nombre de
 * otro, o corregir aquí su propio perfil; ninguna de las dos cosas ocurre (su
 * perfil lo edita el equipo Radyex, ver docs/perfiles-y-acceso.md).
 *
 * Lo único editable de este panel es lo que SÍ se guarda:
 * `ordenes.indicaciones` y `ordenes.entrega`.
 */
export function DatosDoctor({
  doctor,
  fechaHoy,
  indicaciones,
  onIndicaciones,
  entrega,
  onEntrega,
  mostrarErrorEntrega,
}: DatosDoctorProps) {
  return (
    <div className="panel" style={{ marginBottom: 20 }}>
      <div className="panel-title">
        <Stethoscope size={17} strokeWidth={2} />
        Datos del doctor
      </div>
      <div className="panel-sub">Fecha: {fechaHoy}</div>

      <div className="field">
        <span className="field-label">Dr. / Dra.</span>
        <div className="dato-solo-lectura">{doctor.nombre}</div>
      </div>

      <div className="field-row">
        <div className="field">
          <span className="field-label">Email</span>
          <div className="dato-solo-lectura">{doctor.correo || "—"}</div>
        </div>
        <div className="field">
          <span className="field-label">WhatsApp</span>
          <div className="dato-solo-lectura">{doctor.telefono || "—"}</div>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="indicaciones">
          Indicaciones
        </label>
        <textarea
          id="indicaciones"
          placeholder="Ej. Valoración previa a tratamiento de ortodoncia, dolor en zona molar inferior derecha..."
          value={indicaciones}
          onChange={(e) => onIndicaciones(e.target.value)}
        />
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <span className="field-label">Entrega</span>
        {/* id de ancla: el envío fallido trae la vista hasta aquí. */}
        <div className="radio-pills" id={ANCLAS.entrega}>
          <PillEntrega valor="Impreso" activo={entrega === "Impreso"} onElegir={onEntrega} />
          <PillEntrega valor="Digital" activo={entrega === "Digital"} onElegir={onEntrega} />
        </div>
        {mostrarErrorEntrega && (
          <div className="field-error" style={{ display: "flex", marginTop: 8 }}>
            <TriangleAlert size={13} strokeWidth={2} />
            Elige cómo se entregará el estudio.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Los `value` van tal cual "Impreso"/"Digital", CON mayúscula inicial: así
 * está el enum `tipo_entrega` en la BD. No es una inconsistencia con
 * Sensor/RX (que van en minúscula) — cada columna tiene su propio formato
 * canónico. Ver docs/orden-de-estudio.md § "Reglas de mapeo".
 */
function PillEntrega({
  valor,
  activo,
  onElegir,
}: {
  valor: Entrega;
  activo: boolean;
  onElegir: (entrega: Entrega) => void;
}) {
  return (
    <label className={`radio-pill${activo ? " checked" : ""}`}>
      <input
        type="radio"
        name="entrega"
        value={valor}
        checked={activo}
        onChange={() => onElegir(valor)}
      />
      {valor}
    </label>
  );
}
