/**
 * RADYEX — Mapeo de datos de órdenes: "fila de Supabase → molde que la UI
 * ya espera" (el tipo `Orden` de lib/data.ts).
 *
 * Vive en `lib/` porque lo comparten las DOS pantallas de órdenes: la del
 * Doctor (`app/(doctor)/ordenes/`, ya migrada) y la del equipo Radyex
 * (`app/(radyex)/admin/ordenes/`, Fase 4). Las dos hacen la misma consulta
 * y el mismo mapeo; solo cambia el alcance que aplica la RLS (el Doctor ve
 * las suyas, Radyex ve todas).
 *
 * Este archivo es el MOLDE de la Fase 4: cada entidad que se migre tendrá
 * su propio `mapeo-<entidad>.ts` con la misma idea — la página (Server
 * Component) hace la consulta y pasa el resultado por esta función antes de
 * dárselo al componente cliente.
 *
 * Regla clave: `mapearOrden` es una función PURA. No hace consultas, no lee
 * sesión, no toca el DOM — recibe una fila y devuelve un objeto `Orden`
 * (el tipo de `lib/data.ts`, exactamente la forma que hoy tiene `SEED_ORDERS`).
 *
 * Mapeo columna BD → campo UI (ver también docs/mapeo-campos.md):
 *   ordenes.folio              → folio
 *   pacientes.nombre_completo  → nombrePaciente   (join a `pacientes` por paciente_id)
 *   —                          → iniciales        CALCULADO: initials(nombrePaciente)
 *   pacientes.localidad        → localidad
 *   ordenes.fecha_solicitud    → fechaSolicitud   (date → texto "20 dic 2025")
 *   ordenes.estatus            → estatus          (enum ya idéntico a la UI)
 *   ordenes.doctor_id          → doctorId         (uuid del doctor dueño de la orden)
 *   usuarios.nombre_completo   → doctorNombre     (join ordenes → doctores → usuarios)
 *   orden_estudios[]           → tipoEstudio      CALCULADO: resumen de N estudios + FOV
 *   ordenes.entrega            → entrega          (enum "Impreso" | "Digital")
 *   pacientes.telefono         → telefono
 *   pacientes.correo           → correo
 *   pacientes.fecha_nacimiento → edad             CALCULADO: calcAge(fecha_nacimiento)
 *   pacientes.created_at       → pacienteDesde    CALCULADO: texto "2023 · 3 años"
 *   —                          → archivos         NO se conecta aquí (fase 5 - R2)
 */

import {
  calcAge,
  initials,
  type Orden,
  type ArchivoOrden,
  type EstatusOrden,
  type Entrega,
} from "@/lib/data";

/* ============================================================
   Forma de la fila que devuelve la consulta de page.tsx
   ============================================================
   El cliente de Supabase de este proyecto no está tipado con el
   esquema, así que declaramos a mano la forma de UNA fila tal como
   la pide el `select(...)` de la página (columnas reales + las
   relaciones embebidas de PostgREST). */

type FilaPacienteDB = {
  nombre_completo: string;
  telefono: string | null;
  correo: string | null;
  fecha_nacimiento: string | null; // date ISO "YYYY-MM-DD"
  localidad: string;
  created_at: string; // timestamptz ISO
};

// El nombre del doctor referente NO vive en `doctores` sino en `usuarios`
// (doctores.id === usuarios.id). Por eso el join es de dos saltos:
// ordenes.doctor_id → doctores → usuarios.nombre_completo.
type FilaDoctorDB = {
  usuarios:
    | { nombre_completo: string }
    | { nombre_completo: string }[]
    | null;
};

type FilaOrdenEstudioDB = {
  fov: string | null;
  // PostgREST embebe las relaciones "a-uno" como objeto, pero según
  // cómo se resuelva el tipo pueden llegar como arreglo de un elemento;
  // `unoDe()` más abajo normaliza ambos casos.
  catalogo_estudios: { etiqueta: string } | { etiqueta: string }[] | null;
  catalogo_fov: { etiqueta: string } | { etiqueta: string }[] | null;
};

export type FilaOrdenDB = {
  folio: string;
  fecha_solicitud: string; // date ISO "YYYY-MM-DD"
  estatus: EstatusOrden; // enum estatus_orden: pendiente | en_proceso | finalizado
  entrega: Entrega; // enum tipo_entrega: "Impreso" | "Digital"
  doctor_id: string; // uuid
  pacientes: FilaPacienteDB | FilaPacienteDB[] | null;
  doctores: FilaDoctorDB | FilaDoctorDB[] | null;
  orden_estudios: FilaOrdenEstudioDB[] | null;
};

/* ============================================================
   Función principal
   ============================================================ */

export function mapearOrden(fila: FilaOrdenDB): Orden {
  const paciente = unoDe(fila.pacientes);

  // --- Datos del paciente (vienen del join a `pacientes`) ---
  const nombrePaciente = paciente?.nombre_completo ?? "Paciente sin nombre";
  const telefono = paciente?.telefono ?? "—";
  const correo = paciente?.correo ?? "—";
  const localidad = paciente?.localidad ?? "Puebla";

  // edad: CALCULADO con calcAge() (ya existe en lib/data.ts) sobre
  // pacientes.fecha_nacimiento. Sin fecha de nacimiento → 0 (la UI
  // muestra "0 años"); es un dato obligatorio del expediente, así que
  // en la práctica siempre viene.
  const edad = paciente?.fecha_nacimiento
    ? calcAge(paciente.fecha_nacimiento) ?? 0
    : 0;

  // pacienteDesde: CALCULADO/DISPLAY. Texto "AÑO · N años" a partir del
  // año en que se creó el expediente (pacientes.created_at). Mismo
  // formato que la semilla ("2023 · 3 años", "2025 · nuevo").
  const pacienteDesde = calcularPacienteDesde(paciente?.created_at);

  // doctorNombre: CALCULADO/DISPLAY. Nombre del doctor referente (dueño de
  // la orden), que el modal muestra en "Doctor referente". Sale del join
  // de dos saltos ordenes.doctor_id → doctores → usuarios; la columna real
  // es `usuarios.nombre_completo` (en `doctores` no hay nombre). Si por lo
  // que sea viene nulo, se deja "—" en vez de romper.
  const doctor = unoDe(fila.doctores);
  const doctorNombre = unoDe(doctor?.usuarios)?.nombre_completo ?? "—";

  // --- Datos de la orden ---
  // fechaSolicitud: ordenes.fecha_solicitud (date) formateada como en la
  // semilla ("20 dic 2025"). Se fija la hora a mediodía para que el huso
  // horario no recorra la fecha un día (mismo truco que calcAge).
  const fechaSolicitud = formatearFecha(fila.fecha_solicitud);

  // tipoEstudio: CALCULADO/DISPLAY. No es una columna: es el resumen de
  // las filas de orden_estudios (join a catalogo_estudios.etiqueta). Si
  // el estudio trae FOV (solo Tomografía 3D) se le pega
  // " — " + catalogo_fov.etiqueta, quedando p. ej. "Tomografía 3D — 12 × 9".
  const tipoEstudio = resumirEstudios(fila.orden_estudios);

  // archivos: NO se conecta en esta fase. Los binarios (PDF/imágenes)
  // viven en Cloudflare R2 y necesitan URL firmada (fase 5). Se deja un
  // único año — el de la solicitud — con lista vacía, que es exactamente
  // la forma que PatientModal ya sabe mostrar para una orden todavía sin
  // archivos ("Aún no hay archivos cargados para 2025.").
  // TODO (fase 5 - R2): traer las filas de `archivos` de esta orden,
  // agruparlas por año (archivos.fecha_captura) y firmar cada
  // `archivos.ruta_r2` para poder abrirlas/descargarlas.
  const anioSolicitud = fila.fecha_solicitud.slice(0, 4);
  const archivos: Record<string, ArchivoOrden[]> = { [anioSolicitud]: [] };

  return {
    folio: fila.folio,
    nombrePaciente,
    iniciales: initials(nombrePaciente),
    localidad,
    fechaSolicitud,
    estatus: fila.estatus,
    doctorId: fila.doctor_id,
    doctorNombre,
    tipoEstudio,
    entrega: fila.entrega,
    telefono,
    correo,
    edad,
    pacienteDesde,
    archivos,
  };
}

/* ============================================================
   Utilidades internas de este mapeo
   ============================================================ */

/**
 * Normaliza una relación embebida de PostgREST: la "a-uno" puede llegar
 * como objeto o como arreglo de un solo elemento según cómo se resuelva
 * el tipo. Devuelve el objeto, o null si no vino nada.
 */
function unoDe<T>(relacion: T | T[] | null | undefined): T | null {
  if (Array.isArray(relacion)) return relacion[0] ?? null;
  return relacion ?? null;
}

/** Fecha ISO de la BD ("2025-12-20") → texto de la UI ("20 dic 2025"). */
function formatearFecha(fechaISO: string): string {
  const fecha = new Date(`${fechaISO}T12:00:00`);
  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** pacientes.created_at → "2023 · 3 años" / "2025 · 1 año" / "2025 · nuevo". */
function calcularPacienteDesde(createdAtISO: string | null | undefined): string {
  if (!createdAtISO) return "—";
  const anioAlta = new Date(createdAtISO).getFullYear();
  const anios = new Date().getFullYear() - anioAlta;
  const etiqueta = anios <= 0 ? "nuevo" : anios === 1 ? "1 año" : `${anios} años`;
  return `${anioAlta} · ${etiqueta}`;
}

/**
 * Filas de orden_estudios → texto resumen para la tarjeta y el modal.
 * Une los nombres con ", "; a Tomografía 3D le agrega su FOV.
 * Sin estudios (no debería pasar en una orden real) → "—".
 */
function resumirEstudios(estudios: FilaOrdenEstudioDB[] | null): string {
  const lista = estudios ?? [];
  if (lista.length === 0) return "—";
  return lista
    .map((oe) => {
      const nombre = unoDe(oe.catalogo_estudios)?.etiqueta ?? "Estudio";
      const fov = unoDe(oe.catalogo_fov)?.etiqueta;
      return fov ? `${nombre} — ${fov}` : nombre;
    })
    .join(", ");
}
