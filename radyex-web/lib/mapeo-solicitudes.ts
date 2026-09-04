/**
 * RADYEX — Mapeo de SOLICITUDES de orden: fila de Supabase → molde de la UI.
 *
 * Mismo patrón que lib/mapeo-ordenes.ts, pero para `solicitudes_orden`: lo
 * que el doctor ya envió y el equipo Radyex todavía no ha revisado.
 *
 * Por qué es un molde APARTE y no reusa el tipo `Orden`: una solicitud
 * pendiente **no es una orden todavía**. No tiene `folio` (lo genera
 * `aprobar_solicitud_orden()` al aprobar), ni `estatus` de orden, ni archivos.
 * Forzarla dentro de `Orden` obligaría a inventar campos vacíos y a meter un
 * cuarto estado en `STATUS_MAP` que contaminaría las tarjetas ya probadas.
 *
 * Mapeo columna BD → campo UI:
 *   solicitudes_orden.id             → id
 *   pacientes.nombre_completo        → nombrePaciente  (si el doctor eligió uno ya referido)
 *   paciente_datos->>nombre_completo → nombrePaciente  (si es nuevo para él)
 *   —                                → iniciales       CALCULADO: initials(nombrePaciente)
 *   solicitudes_orden.created_at     → fechaSolicitud  (timestamptz → "04 sep 2026")
 *   solicitudes_orden.estudios       → tipoEstudio     CALCULADO: resumen del jsonb
 *   solicitudes_orden.entrega        → entrega
 *   —                                → esPacienteNuevo CALCULADO: no traía paciente_id
 */

import { calcAge, initials, type Entrega } from "@/lib/data";
import {
  detallarEstudiosSolicitud,
  resumirEstudiosSolicitud,
  type EstudioDetallado,
  type EstudioSolicitud,
} from "@/lib/estudios-solicitud";

type FilaPacienteDB = { nombre_completo: string };

export type FilaSolicitudDB = {
  id: string;
  created_at: string; // timestamptz ISO
  entrega: Entrega;
  estudios: EstudioSolicitud[]; // jsonb array
  paciente_id: string | null;
  paciente_datos: { nombre_completo?: string } | null;
  // Relación embebida de PostgREST: objeto, arreglo de uno, o null.
  pacientes: FilaPacienteDB | FilaPacienteDB[] | null;
};

export type SolicitudEnRevision = {
  id: string;
  nombrePaciente: string;
  iniciales: string;
  fechaSolicitud: string;
  tipoEstudio: string;
  entrega: Entrega;
  /** true = el doctor tecleó los datos; Radyex decidirá si ya existe. */
  esPacienteNuevo: boolean;
};

export function mapearSolicitud(fila: FilaSolicitudDB): SolicitudEnRevision {
  // El nombre sale de dos lugares según cómo se mandó la solicitud: del join a
  // `pacientes` si el doctor eligió a uno que ya refirió, o de los datos que
  // tecleó si es nuevo para él.
  const pacienteJoin = unoDe(fila.pacientes);
  const nombrePaciente =
    pacienteJoin?.nombre_completo ??
    fila.paciente_datos?.nombre_completo ??
    "Paciente sin nombre";

  return {
    id: fila.id,
    nombrePaciente,
    iniciales: initials(nombrePaciente),
    fechaSolicitud: formatearFecha(fila.created_at),
    tipoEstudio: resumirEstudiosSolicitud(fila.estudios ?? []),
    entrega: fila.entrega,
    esPacienteNuevo: fila.paciente_id === null,
  };
}

/* ============================================================
   Vista de REVISIÓN (equipo Radyex) — molde más completo
   ============================================================
   El doctor solo necesita "qué mandé y cuándo". Radyex necesita TODO lo que
   hace falta para decidir: quién la pidió, los datos crudos del paciente para
   deduplicar, y el desglose completo de los estudios. */

type FilaDoctorDB = { usuarios: { nombre_completo: string } | { nombre_completo: string }[] | null };

export type FilaSolicitudRevisionDB = FilaSolicitudDB & {
  indicaciones: string | null;
  doctores: FilaDoctorDB | FilaDoctorDB[] | null;
  paciente_datos: {
    nombre_completo?: string;
    fecha_nacimiento?: string;
    telefono?: string | null;
    correo?: string | null;
  } | null;
};

export type SolicitudParaRevision = {
  id: string;
  fechaSolicitud: string;
  doctorNombre: string;
  entrega: Entrega;
  indicaciones: string | null;
  estudios: EstudioDetallado[];
  /** Si ya viene identificado, la revisión es solo confirmar. */
  pacienteId: string | null;
  /** Nombre a mostrar, venga del join o de los datos tecleados. */
  nombrePaciente: string;
  iniciales: string;
  /** Datos crudos que tecleó el doctor (solo si el paciente es nuevo para él). */
  datosTecleados: {
    nombreCompleto: string;
    fechaNacimiento: string | null;
    edad: number | null;
    telefono: string | null;
    correo: string | null;
  } | null;
};

export function mapearSolicitudRevision(fila: FilaSolicitudRevisionDB): SolicitudParaRevision {
  const pacienteJoin = unoDe(fila.pacientes);
  const datos = fila.paciente_datos;
  const nombrePaciente =
    pacienteJoin?.nombre_completo ?? datos?.nombre_completo ?? "Paciente sin nombre";

  const doctor = unoDe(fila.doctores);
  const doctorNombre = unoDe(doctor?.usuarios)?.nombre_completo ?? "—";

  return {
    id: fila.id,
    fechaSolicitud: formatearFecha(fila.created_at),
    doctorNombre,
    entrega: fila.entrega,
    indicaciones: fila.indicaciones,
    estudios: detallarEstudiosSolicitud(fila.estudios ?? []),
    pacienteId: fila.paciente_id,
    nombrePaciente,
    iniciales: initials(nombrePaciente),
    datosTecleados:
      fila.paciente_id === null && datos
        ? {
            nombreCompleto: datos.nombre_completo ?? "",
            fechaNacimiento: datos.fecha_nacimiento ?? null,
            edad: datos.fecha_nacimiento ? calcAge(datos.fecha_nacimiento) : null,
            telefono: datos.telefono ?? null,
            correo: datos.correo ?? null,
          }
        : null,
  };
}

/** Normaliza una relación embebida de PostgREST (objeto o arreglo de uno). */
function unoDe<T>(relacion: T | T[] | null | undefined): T | null {
  if (Array.isArray(relacion)) return relacion[0] ?? null;
  return relacion ?? null;
}

/** timestamptz ISO → "04 sep 2026" (mismo formato que las órdenes). */
function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
