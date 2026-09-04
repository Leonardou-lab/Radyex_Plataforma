"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ClipboardList, TriangleAlert } from "lucide-react";
import type { Entrega } from "@/lib/data";
import {
  hayErroresEstudios,
  validarEstudios,
  SELECCION_VACIA,
  type SeleccionEstudios as Seleccion,
} from "@/lib/estudios-solicitud";
import { crearSolicitudOrden } from "@/app/(doctor)/nueva-orden/actions";
import { ANCLAS } from "./anclas";
import { DatosDoctor, type PerfilDoctor } from "./DatosDoctor";
import { SelectorPaciente, type PacienteNuevo, type PacienteReferido } from "./SelectorPaciente";
import { SeleccionEstudios } from "./SeleccionEstudios";

type NuevaOrdenFormProps = {
  doctor: PerfilDoctor;
  pacientes: PacienteReferido[];
  fechaHoy: string;
};

const PACIENTE_NUEVO_VACIO: PacienteNuevo = {
  nombreCompleto: "",
  fechaNacimiento: "",
  telefono: "",
  correo: "",
};

/**
 * Formulario completo de "Nueva orden" (vista Doctor).
 *
 * Aquí vive TODO el estado del formulario; los paneles de abajo son
 * componentes controlados (reciben su valor y avisan los cambios). Así hay
 * una sola fuente de verdad para lo que se envía.
 *
 * Lo que envía NO es una orden: es una SOLICITUD que el equipo Radyex revisa
 * antes de que la orden exista (docs/perfiles-y-acceso.md § "Flujo …
 * solicitudes_orden"). Por eso la confirmación no muestra folio — el folio lo
 * genera `aprobar_solicitud_orden()` al aprobar.
 */
export function NuevaOrdenForm({ doctor, pacientes, fechaHoy }: NuevaOrdenFormProps) {
  // --- Estado del formulario ---
  const [indicaciones, setIndicaciones] = useState("");
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [modoPaciente, setModoPaciente] = useState<"existente" | "nuevo">("existente");
  const [pacienteId, setPacienteId] = useState<string | null>(null);
  const [pacienteNuevo, setPacienteNuevo] = useState<PacienteNuevo>(PACIENTE_NUEVO_VACIO);
  const [estudios, setEstudios] = useState<Seleccion>(SELECCION_VACIA);

  // --- Estado del envío ---
  // `mostrarErrores` arranca en false para no recibir al doctor con la
  // pantalla en rojo: los errores aparecen recién cuando intenta enviar.
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviada, setEnviada] = useState(false);
  const [enviando, iniciarEnvio] = useTransition();

  /**
   * Agrega o quita la nota de un paquete en "Indicaciones" (p. ej. la guía
   * quirúrgica de Implantología). Vive aquí porque el texto es del panel del
   * doctor, pero lo dispara el panel de estudios.
   */
  function alternarNotaPaquete(nota: string, agregar: boolean) {
    setIndicaciones((actual) => {
      if (agregar) {
        if (actual.includes(nota)) return actual;
        return actual ? `${actual}\n${nota}` : nota;
      }
      return actual
        .split("\n")
        .filter((linea) => linea.trim() !== nota)
        .join("\n");
    });
  }

  const pacienteOk =
    modoPaciente === "existente"
      ? pacienteId !== null
      : pacienteNuevo.nombreCompleto.trim() !== "" && pacienteNuevo.fechaNacimiento !== "";

  /**
   * Lleva la vista al PRIMER campo con error, en el mismo orden en que están
   * en la pantalla. Solo cambia a dónde mira el doctor: no toca la validación
   * ni los mensajes, que siguen saliendo igual.
   *
   * `enfocar: false` para los grupos que no son un campo enfocable (las pills
   * de entrega, los chips de dientes): ahí se resalta el bloque en vez de
   * intentar un .focus() que no tendría a dónde ir.
   */
  function irAlPrimerError() {
    const errores = validarEstudios(estudios);

    if (!entrega) return señalar(ANCLAS.entrega, { enfocar: false });
    if (!pacienteOk) return señalar(ANCLAS.paciente, { enfocar: true });
    if (errores.sinEstudios) return señalar(ANCLAS.estudios, { enfocar: false });
    if (errores.faltanDientes) return señalar(ANCLAS.periapical, { enfocar: false });
    if (errores.faltaCefOtro) return señalar(ANCLAS.cefOtro, { enfocar: true });
    if (errores.faltaZona) return señalar(ANCLAS.zona, { enfocar: true });
  }

  function señalar(id: string, { enfocar }: { enfocar: boolean }) {
    // Se espera un frame para que React ya haya pintado los mensajes de error
    // (acabamos de poner mostrarErrores en true) antes de mover la vista.
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });

      if (enfocar) {
        // El ancla puede ser el campo mismo o el panel que lo contiene.
        const campo = el.matches("input, textarea")
          ? (el as HTMLElement)
          : el.querySelector<HTMLElement>("input, textarea");
        // preventScroll: el scrollIntoView de arriba ya se está encargando, y
        // el salto del focus lo cortaría a medias.
        campo?.focus({ preventScroll: true });
        return;
      }

      // Resaltado temporal. Se toca el DOM directo a propósito: es un efecto
      // puramente visual y de un solo uso — meterlo al estado obligaría a
      // encadenar una prop más por tres niveles de componentes.
      el.classList.add("resaltado-error");
      window.setTimeout(() => el.classList.remove("resaltado-error"), 2200);
    });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrorEnvio(null);
    setMostrarErrores(true);

    // Validación en el navegador: es para que el doctor vea el error de
    // inmediato. La Server Action vuelve a validar todo — no se confía en esto.
    if (!entrega || !pacienteOk || hayErroresEstudios(validarEstudios(estudios))) {
      // El botón de enviar está hasta abajo y el campo que falta puede estar
      // muy arriba: sin esto, el doctor ve un error que no puede ubicar.
      irAlPrimerError();
      return;
    }

    iniciarEnvio(async () => {
      const resultado = await crearSolicitudOrden({
        pacienteId: modoPaciente === "existente" ? pacienteId : null,
        pacienteNuevo: modoPaciente === "nuevo" ? pacienteNuevo : null,
        entrega,
        indicaciones,
        estudios,
      });

      if (resultado.ok) {
        setEnviada(true);
      } else {
        setErrorEnvio(resultado.error);
      }
    });
  }

  /** Deja el formulario en blanco para capturar otra solicitud. */
  function otraSolicitud() {
    setIndicaciones("");
    setEntrega(null);
    setModoPaciente("existente");
    setPacienteId(null);
    setPacienteNuevo(PACIENTE_NUEVO_VACIO);
    setEstudios(SELECCION_VACIA);
    setMostrarErrores(false);
    setErrorEnvio(null);
    setEnviada(false);
  }

  /* ---------- Confirmación ---------- */
  // No lleva folio a propósito: la orden todavía no existe, y por lo tanto
  // tampoco su folio. Decisión documentada en docs/migracion-nextjs.md § 3.2.
  if (enviada) {
    return (
      <div className="content">
        <div className="panel" style={{ textAlign: "center", padding: "40px 30px" }}>
          <div
            className="dropzone-icon"
            style={{ background: "var(--success-soft)", color: "var(--success)", marginBottom: 18 }}
          >
            <Check size={26} strokeWidth={2.4} />
          </div>
          <div className="page-title" style={{ marginBottom: 6 }}>
            Solicitud enviada
          </div>
          <div className="page-sub" style={{ marginBottom: 24 }}>
            Radyex la está revisando. En cuanto la procesen, la orden aparecerá en
            &quot;Mis órdenes&quot; con su folio y te notificaremos.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn-primary" href="/ordenes">
              <ClipboardList size={16} strokeWidth={2} />
              Ver en Mis órdenes
            </Link>
            <button className="btn-secondary" type="button" onClick={otraSolicitud}>
              Solicitar otra orden
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Formulario ---------- */
  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Nueva orden</div>
          <div className="page-sub">Solicita los estudios que necesitas para tu paciente</div>
        </div>
        <div className="topbar-actions">
          <Link className="btn-secondary" href="/ordenes">
            <ChevronLeft size={16} strokeWidth={2.2} />
            Mis órdenes
          </Link>
        </div>
      </div>

      <div className="content">
        <form onSubmit={enviar} noValidate>
          <DatosDoctor
            doctor={doctor}
            fechaHoy={fechaHoy}
            indicaciones={indicaciones}
            onIndicaciones={setIndicaciones}
            entrega={entrega}
            onEntrega={setEntrega}
            mostrarErrorEntrega={mostrarErrores && !entrega}
          />

          <SelectorPaciente
            pacientes={pacientes}
            modo={modoPaciente}
            onModo={setModoPaciente}
            pacienteId={pacienteId}
            onPacienteId={setPacienteId}
            pacienteNuevo={pacienteNuevo}
            onPacienteNuevo={setPacienteNuevo}
            mostrarErrores={mostrarErrores && !pacienteOk}
          />

          <SeleccionEstudios
            valor={estudios}
            onChange={setEstudios}
            onNota={alternarNotaPaquete}
            mostrarErrores={mostrarErrores}
          />

          {errorEnvio && (
            <div className="field-error" style={{ display: "flex", marginBottom: 14 }}>
              <TriangleAlert size={13} strokeWidth={2} />
              {errorEnvio}
            </div>
          )}

          <button type="submit" className="btn-primary btn-block" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </>
  );
}
