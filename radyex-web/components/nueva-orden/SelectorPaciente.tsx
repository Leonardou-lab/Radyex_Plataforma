"use client";

import { useState } from "react";
import { ChevronLeft, Plus, Search, TriangleAlert, Users, X } from "lucide-react";
import { calcAge, initials } from "@/lib/data";
import { ANCLAS } from "./anclas";

/** Paciente que el doctor ya refirió (la RLS solo devuelve los suyos). */
export type PacienteReferido = {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: string | null;
};

export type PacienteNuevo = {
  nombreCompleto: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
};

type SelectorPacienteProps = {
  pacientes: PacienteReferido[];
  /** "existente" = elegir de la lista; "nuevo" = teclear los datos. */
  modo: "existente" | "nuevo";
  onModo: (modo: "existente" | "nuevo") => void;
  pacienteId: string | null;
  onPacienteId: (id: string | null) => void;
  pacienteNuevo: PacienteNuevo;
  onPacienteNuevo: (paciente: PacienteNuevo) => void;
  mostrarErrores: boolean;
};

/**
 * Panel "Datos del paciente": elegir uno que el doctor ya refirió, o registrar
 * uno nuevo.
 *
 * OJO con qué significa "nuevo" aquí: el doctor NO crea el paciente. Los datos
 * que teclea viajan en `solicitudes_orden.paciente_datos` y es el equipo
 * Radyex quien, al revisar, decide si esa persona ya existe en el expediente
 * maestro (referida por otro doctor) y la enlaza, o si hay que crearla. Por
 * eso el texto dice "registra uno nuevo" y no "crear paciente".
 *
 * La búsqueda se hace en el cliente sobre la lista ya cargada: son solo los
 * pacientes de este doctor, no toda la base.
 */
export function SelectorPaciente({
  pacientes,
  modo,
  onModo,
  pacienteId,
  onPacienteId,
  pacienteNuevo,
  onPacienteNuevo,
  mostrarErrores,
}: SelectorPacienteProps) {
  const [busqueda, setBusqueda] = useState("");
  const [listaAbierta, setListaAbierta] = useState(false);

  const seleccionado = pacientes.find((p) => p.id === pacienteId) ?? null;

  const coincidencias = pacientes.filter((p) =>
    p.nombreCompleto.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  function etiquetaEdad(fechaNacimiento: string | null) {
    if (!fechaNacimiento) return "edad no registrada";
    const edad = calcAge(fechaNacimiento);
    return edad === null ? "edad no registrada" : `${edad} años`;
  }

  return (
    <div className="panel" id={ANCLAS.paciente} style={{ marginBottom: 20 }}>
      <div className="panel-title">
        <Users size={17} strokeWidth={2} />
        Datos del paciente
      </div>
      <div className="panel-sub">
        Busca a un paciente que ya has referido o registra uno nuevo.
      </div>

      {modo === "existente" ? (
        <div className="field" style={{ marginBottom: 0 }}>
          {seleccionado ? (
            <div className="selected-chip">
              <div className="mini-avatar">{initials(seleccionado.nombreCompleto)}</div>
              {seleccionado.nombreCompleto} · {etiquetaEdad(seleccionado.fechaNacimiento)}
              <button
                type="button"
                aria-label="Quitar paciente"
                onClick={() => {
                  onPacienteId(null);
                  setBusqueda("");
                }}
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>
          ) : (
            <div className="combobox">
              <div className="input-with-icon">
                <Search size={16} strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Buscar entre tus pacientes..."
                  autoComplete="off"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onFocus={() => setListaAbierta(true)}
                  // Se cierra con un pequeño retraso para que alcance a
                  // registrarse el click en un resultado antes del blur.
                  onBlur={() => setTimeout(() => setListaAbierta(false), 120)}
                />
              </div>
              {listaAbierta && (
                <div className="search-results open">
                  {coincidencias.length === 0 ? (
                    <div style={{ padding: 14, fontSize: 13, color: "var(--text-muted)" }}>
                      {pacientes.length === 0
                        ? 'Todavía no has referido pacientes. Usa "+ Nuevo paciente".'
                        : 'Sin resultados. Usa "+ Nuevo paciente".'}
                    </div>
                  ) : (
                    coincidencias.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="search-result-item"
                        onClick={() => {
                          onPacienteId(p.id);
                          setListaAbierta(false);
                        }}
                      >
                        <div className="mini-avatar">{initials(p.nombreCompleto)}</div>
                        <div>
                          <div>{p.nombreCompleto}</div>
                          <div className="sr-sub">{etiquetaEdad(p.fechaNacimiento)}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="btn-ghost"
            style={{ marginTop: 10, paddingLeft: 0 }}
            onClick={() => {
              onPacienteId(null);
              onModo("nuevo");
            }}
          >
            <Plus size={14} strokeWidth={2.2} />
            Nuevo paciente
          </button>

          {mostrarErrores && !seleccionado && (
            <div className="field-error" style={{ display: "flex", marginTop: 8 }}>
              <TriangleAlert size={13} strokeWidth={2} />
              Selecciona un paciente o registra uno nuevo.
            </div>
          )}
        </div>
      ) : (
        <div className="field" style={{ marginBottom: 0 }}>
          <div className="field-row">
            <div
              className={`field${
                mostrarErrores && !pacienteNuevo.nombreCompleto.trim() ? " invalid" : ""
              }`}
              style={{ marginBottom: 14 }}
            >
              <label className="field-label" htmlFor="npNombre">
                Paciente (nombre)
              </label>
              <input
                id="npNombre"
                type="text"
                placeholder="Nombre del paciente"
                value={pacienteNuevo.nombreCompleto}
                onChange={(e) =>
                  onPacienteNuevo({ ...pacienteNuevo, nombreCompleto: e.target.value })
                }
              />
              <div className="field-error">
                <TriangleAlert size={13} strokeWidth={2} />
                Ingresa el nombre del paciente.
              </div>
            </div>

            <div
              className={`field${
                mostrarErrores && !pacienteNuevo.fechaNacimiento ? " invalid" : ""
              }`}
              style={{ marginBottom: 14 }}
            >
              <label className="field-label" htmlFor="npNacimiento">
                Fecha de nacimiento
              </label>
              <input
                id="npNacimiento"
                type="date"
                value={pacienteNuevo.fechaNacimiento}
                onChange={(e) =>
                  onPacienteNuevo({ ...pacienteNuevo, fechaNacimiento: e.target.value })
                }
              />
              <div className="field-error">
                <TriangleAlert size={13} strokeWidth={2} />
                Ingresa la fecha de nacimiento.
              </div>
            </div>
          </div>

          <div className="field-row">
            <div className="field" style={{ marginBottom: 8 }}>
              <label className="field-label" htmlFor="npTelefono">
                WhatsApp <span className="opt">(opcional)</span>
              </label>
              <input
                id="npTelefono"
                type="tel"
                placeholder="222 000 0000"
                value={pacienteNuevo.telefono}
                onChange={(e) => onPacienteNuevo({ ...pacienteNuevo, telefono: e.target.value })}
              />
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label className="field-label" htmlFor="npCorreo">
                Email <span className="opt">(opcional)</span>
              </label>
              <input
                id="npCorreo"
                type="email"
                placeholder="paciente@correo.com"
                value={pacienteNuevo.correo}
                onChange={(e) => onPacienteNuevo({ ...pacienteNuevo, correo: e.target.value })}
              />
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "4px 0 10px" }}>
            El equipo Radyex revisará estos datos: si el paciente ya está registrado por otro
            doctor, lo vinculará a su expediente en vez de duplicarlo.
          </p>

          <button
            type="button"
            className="btn-ghost"
            style={{ paddingLeft: 0 }}
            onClick={() => onModo("existente")}
          >
            <ChevronLeft size={14} strokeWidth={2.2} />
            Elegir un paciente existente
          </button>
        </div>
      )}
    </div>
  );
}
