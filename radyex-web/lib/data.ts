/**
 * RADYEX — Datos y utilidades compartidas (semilla local).
 *
 * Portado desde assets/js/common.js del mockup estático. Por ahora
 * NO hay backend: las pantallas importan estos arreglos directo
 * (nada de fetch ni sessionStorage). Cuando llegue Supabase (fase 2
 * del roadmap) estas mismas formas de datos (los `type`) van a
 * guiar el esquema de la base de datos.
 *
 * Los nombres de campo ya están en español y alineados 1:1 con las
 * columnas reales de Supabase (ver docs/mapeo-campos.md para el
 * detalle completo, incluyendo los campos calculados/display que NO
 * tienen columna propia). Así, al conectar datos reales en la fase 4,
 * el renombrado ya está hecho una sola vez.
 */

/* ============================================================
   Tipos
   ============================================================ */

// Estatus de una orden. Coincide con el enum estatus_orden de la BD.
export type EstatusOrden = "pendiente" | "en_proceso" | "finalizado";

// Vocabulario VISUAL del sistema de diseño (colores/clases CSS:
// --success, --warn, --pending en app/radyex-ui.css), compartido por
// otras pantallas además de "órdenes" — no es vocabulario de negocio,
// por eso se queda en inglés y aparte de EstatusOrden. STATUS_MAP de
// abajo es la única traducción entre los dos.
export type EstatusVisual = "success" | "warn" | "pending";

export type Entrega = "Impreso" | "Digital";

export type Doctor = {
  id: string;
  nombreCompleto: string;
  especialidad: string;
  consultorio: string;
  correo: string;
  telefono: string;
  nombreUsuario: string;
  estatus: "activo" | "inactivo";
  ultimoAcceso: string;
  /** Fecha de nacimiento en formato ISO (YYYY-MM-DD). */
  fechaNacimiento: string;
};

export type ArchivoOrden = {
  nombreArchivo: string;
  fechaCaptura: string;
  /** Ruta del PDF de ejemplo que se abre en el visor. */
  src?: string;
};

// Los archivos de una orden se agrupan por año, igual que en el
// mockup: { "2025": [...], "2024": [...] }.
export type ArchivosPorAnio = Record<string, ArchivoOrden[]>;

export type Orden = {
  folio: string;
  nombrePaciente: string;
  /** Iniciales del paciente, usadas en el avatar redondo. */
  iniciales: string;
  localidad: string;
  fechaSolicitud: string;
  estatus: EstatusOrden;
  doctorId: string;
  tipoEstudio: string;
  entrega: Entrega;
  telefono: string;
  correo: string;
  edad: number;
  pacienteDesde: string;
  archivos: ArchivosPorAnio;
};

/* ============================================================
   Estatus: etiqueta + clase de color por estatus de orden
   ============================================================ */

export const STATUS_MAP: Record<EstatusOrden, { label: string; cls: EstatusVisual }> = {
  finalizado: { label: "Finalizado", cls: "success" },
  en_proceso: { label: "En proceso", cls: "warn" },
  pendiente: { label: "Pendiente", cls: "pending" },
};

/* ============================================================
   Semillas de datos (mismos doctores/pacientes que el mockup)
   ============================================================ */

export const SEED_DOCTORS: Doctor[] = [
  { id: "dr-nunez", nombreCompleto: "Dra. Patricia Núñez", especialidad: "Ortodoncia", consultorio: "Consultorio Central Puebla", correo: "patricia.nunez@clinicasonrisa.mx", telefono: "222 310 4471", nombreUsuario: "patricia.nunez", estatus: "activo", ultimoAcceso: "20 dic 2025", fechaNacimiento: "1985-08-20" },
  { id: "dr-cordero", nombreCompleto: "Dr. Iván Cordero", especialidad: "Endodoncia", consultorio: "Consultorio Reforma", correo: "ivan.cordero@endopuebla.mx", telefono: "222 455 8890", nombreUsuario: "ivan.cordero", estatus: "activo", ultimoAcceso: "17 oct 2025", fechaNacimiento: "1979-11-02" },
  { id: "dr-solis", nombreCompleto: "Dra. Renata Solís", especialidad: "Cirugía Maxilofacial", consultorio: "Clínica Angelópolis", correo: "renata.solis@maxilopuebla.mx", telefono: "222 678 2205", nombreUsuario: "renata.solis", estatus: "activo", ultimoAcceso: "16 jun 2025", fechaNacimiento: "1990-07-22" },
  { id: "dr-beltran", nombreCompleto: "Dr. Ricardo Beltrán", especialidad: "Odontopediatría", consultorio: "Consultorio Los Fuertes", correo: "ricardo.beltran@sonrisakids.mx", telefono: "222 190 3345", nombreUsuario: "ricardo.beltran", estatus: "inactivo", ultimoAcceso: "02 ene 2025", fechaNacimiento: "1982-09-05" },
];

// El mockup no tiene login real: el doctor en sesión siempre es
// este. Cuando llegue auth (fase 3) esto sale de la sesión real.
export const CURRENT_DOCTOR_ID = "dr-nunez";

export const SEED_ORDERS: Orden[] = [
  { folio: "LN251220015", nombrePaciente: "Omar Mateo Rosas Lara", iniciales: "OR", localidad: "Puebla", fechaSolicitud: "20 dic 2025", estatus: "finalizado", doctorId: "dr-nunez", tipoEstudio: "Tomografía 3D — 12×9", entrega: "Digital", telefono: "222 145 7732", correo: "omar.rosas@gmail.com", edad: 34, pacienteDesde: "2023 · 3 años",
    archivos: { "2025": [{ nombreArchivo: "Tomografía 3D.pdf", fechaCaptura: "20 dic 2025" }], "2024": [{ nombreArchivo: "Panorámica.pdf", fechaCaptura: "14 mar 2024" }], "2023": [{ nombreArchivo: "Periapical (serie).pdf", fechaCaptura: "02 feb 2023" }] } },

  { folio: "LN251017016", nombrePaciente: "Marilú Méndez Martínez", iniciales: "MM", localidad: "Puebla", fechaSolicitud: "17 oct 2025", estatus: "finalizado", doctorId: "dr-cordero", tipoEstudio: "Panorámica", entrega: "Digital", telefono: "222 308 9912", correo: "marilu.mendez@hotmail.com", edad: 51, pacienteDesde: "2022 · 4 años",
    archivos: { "2025": [{ nombreArchivo: "Panorámica.pdf", fechaCaptura: "17 oct 2025" }], "2023": [{ nombreArchivo: "Lateral de cráneo.pdf", fechaCaptura: "11 may 2023" }], "2022": [{ nombreArchivo: "Periapical (serie).pdf", fechaCaptura: "30 ago 2022" }] } },

  { folio: "LN250805010", nombrePaciente: "Luis Ángel Castillo Medellín", iniciales: "LC", localidad: "Puebla", fechaSolicitud: "05 ago 2025", estatus: "en_proceso", doctorId: "dr-solis", tipoEstudio: "Tomografía 3D — 16×9", entrega: "Impreso", telefono: "222 477 0156", correo: "luis.castillo@outlook.com", edad: 27, pacienteDesde: "2025 · 1 año",
    archivos: { "2025": [{ nombreArchivo: "Tomografía 3D (en proceso).pdf", fechaCaptura: "05 ago 2025" }] } },

  { folio: "LN250802018", nombrePaciente: "Aline Daniela Vargas Sánchez", iniciales: "AV", localidad: "Puebla", fechaSolicitud: "02 ago 2025", estatus: "finalizado", doctorId: "dr-cordero", tipoEstudio: "Periapical", entrega: "Digital", telefono: "222 590 4423", correo: "aline.vargas@gmail.com", edad: 19, pacienteDesde: "2024 · 2 años",
    archivos: { "2025": [{ nombreArchivo: "Periapical (serie).pdf", fechaCaptura: "02 ago 2025" }], "2024": [{ nombreArchivo: "Panorámica.pdf", fechaCaptura: "19 nov 2024" }] } },

  { folio: "TM250709012", nombrePaciente: "María Guadalupe Zarco Herrera", iniciales: "MZ", localidad: "Puebla", fechaSolicitud: "09 jul 2025", estatus: "pendiente", doctorId: "dr-nunez", tipoEstudio: "Lateral de cráneo", entrega: "Impreso", telefono: "222 612 8870", correo: "maria.zarco@gmail.com", edad: 62, pacienteDesde: "2025 · nuevo",
    archivos: { "2025": [] } },

  { folio: "LN250708008", nombrePaciente: "Giovanna Fernanda Flores Gómez", iniciales: "GF", localidad: "Puebla", fechaSolicitud: "08 jul 2025", estatus: "finalizado", doctorId: "dr-solis", tipoEstudio: "Tomografía 3D — 12×9", entrega: "Digital", telefono: "222 734 2298", correo: "giovanna.flores@gmail.com", edad: 29, pacienteDesde: "2023 · 3 años",
    archivos: { "2025": [{ nombreArchivo: "Tomografía 3D.pdf", fechaCaptura: "08 jul 2025" }], "2024": [{ nombreArchivo: "Panorámica.pdf", fechaCaptura: "22 ene 2024" }], "2023": [{ nombreArchivo: "Periapical (serie).pdf", fechaCaptura: "15 jun 2023" }] } },

  { folio: "LN250616002", nombrePaciente: "María Guillermina Alarcón de Martino", iniciales: "MA", localidad: "Puebla", fechaSolicitud: "16 jun 2025", estatus: "en_proceso", doctorId: "dr-cordero", tipoEstudio: "Panorámica", entrega: "Impreso", telefono: "222 866 5541", correo: "guille.alarcon@hotmail.com", edad: 58, pacienteDesde: "2021 · 5 años",
    archivos: { "2025": [{ nombreArchivo: "Panorámica (en proceso).pdf", fechaCaptura: "16 jun 2025" }], "2022": [{ nombreArchivo: "Tomografía 3D.pdf", fechaCaptura: "03 sep 2022" }], "2021": [{ nombreArchivo: "Periapical (serie).pdf", fechaCaptura: "10 abr 2021" }] } },

  { folio: "TM250602018", nombrePaciente: "Damiana Uscanga Guadarrama", iniciales: "DU", localidad: "Puebla", fechaSolicitud: "02 jun 2025", estatus: "pendiente", doctorId: "dr-solis", tipoEstudio: "Periapical", entrega: "Digital", telefono: "222 901 3387", correo: "damiana.uscanga@gmail.com", edad: 41, pacienteDesde: "2025 · nuevo",
    archivos: { "2025": [] } },

  { folio: "LN250520011", nombrePaciente: "Fernando Iván Rosales Pacheco", iniciales: "FR", localidad: "Puebla", fechaSolicitud: "20 may 2025", estatus: "finalizado", doctorId: "dr-nunez", tipoEstudio: "Tomografía 3D — 12×9", entrega: "Digital", telefono: "222 220 6634", correo: "fernando.rosales@gmail.com", edad: 45, pacienteDesde: "2022 · 4 años",
    archivos: { "2025": [{ nombreArchivo: "Tomografía 3D.pdf", fechaCaptura: "20 may 2025" }], "2022": [{ nombreArchivo: "Panorámica.pdf", fechaCaptura: "11 feb 2022" }] } },

  { folio: "LN250415009", nombrePaciente: "Karla Sofía Domínguez Reyes", iniciales: "KD", localidad: "Puebla", fechaSolicitud: "15 abr 2025", estatus: "en_proceso", doctorId: "dr-nunez", tipoEstudio: "Periapical", entrega: "Impreso", telefono: "222 349 7712", correo: "karla.dominguez@outlook.com", edad: 24, pacienteDesde: "2024 · 2 años",
    archivos: { "2025": [{ nombreArchivo: "Periapical (serie) (en proceso).pdf", fechaCaptura: "15 abr 2025" }], "2024": [{ nombreArchivo: "Panorámica.pdf", fechaCaptura: "03 sep 2024" }] } },
];

// PDFs de ejemplo (contenido genérico, anonimizado) para el visor
// de archivos. Viven en public/ejemplos/ para poder servirse tal
// cual con una ruta absoluta.
const PDF_PACKAGE = "/ejemplos/ejemplo-paquete-estudio.pdf";
const PDF_SINGLE = "/ejemplos/ejemplo-radiografia.pdf";

// Igual que en el mockup: el año más antiguo con archivos de cada
// paciente se acompaña de un "paquete" inicial completo, y el
// resto de los archivos que no traen `src` usan la radiografía de
// ejemplo individual. Se corre una sola vez al cargar el módulo.
SEED_ORDERS.forEach((orden) => {
  const aniosConArchivos = Object.keys(orden.archivos)
    .map(Number)
    .filter((anio) => (orden.archivos[anio] ?? []).length > 0);

  if (aniosConArchivos.length > 0) {
    const anioMasAntiguo = String(Math.min(...aniosConArchivos));
    const archivoAncla = orden.archivos[anioMasAntiguo][0];
    orden.archivos[anioMasAntiguo].push({
      nombreArchivo: "Paquete de estudio inicial.pdf",
      fechaCaptura: archivoAncla.fechaCaptura,
      src: PDF_PACKAGE,
    });
  }

  Object.values(orden.archivos).forEach((archivos) => {
    archivos.forEach((archivo) => {
      if (!archivo.src) archivo.src = PDF_SINGLE;
    });
  });
});

/* ============================================================
   Catálogo de estudios (transcrito de docs/orden-de-estudio.md)
   Fuente de verdad del formulario "Nueva orden" del doctor —
   todavía no migrado en esta fase, pero se porta completo para
   que las fases siguientes no tengan que volver a common.js.
   ============================================================ */

export type EstudioCatalogo = {
  id: string;
  label: string;
  /** Periapical: además de marcarse, pide elegir dientes FDI. */
  teeth?: boolean;
  /** Cefalometría "Otro": pide un texto libre. */
  note?: boolean;
  /**
   * Este estudio no se digitaliza: el paciente lo recoge en físico, aunque
   * la orden diga "Digital" en la entrega general (docs/orden-de-estudio.md).
   * `"si-rx"` es el caso especial de Periapical: solo es física cuando el
   * doctor elige RX (con Sensor sí es digital).
   */
  entregaFisica?: true | "si-rx";
};

export type CategoriaEstudio = {
  id: string;
  label: string;
  items: EstudioCatalogo[];
};

export const STUDY_CATEGORIES: CategoriaEstudio[] = [
  {
    id: "intraorales",
    label: "Radiografías intraorales",
    items: [
      { id: "periapical", label: "Periapical", teeth: true, entregaFisica: "si-rx" },
      { id: "oclusal", label: "Oclusal", entregaFisica: true },
      { id: "superior", label: "Superior", entregaFisica: true },
      { id: "inferior", label: "Inferior", entregaFisica: true },
      { id: "aleta", label: "Aleta de mordida", entregaFisica: true },
    ],
  },
  {
    id: "extraorales",
    label: "Radiografías extraorales",
    items: [
      { id: "panoramica", label: "Panorámica" },
      { id: "lateral-craneo", label: "Lateral de cráneo" },
      { id: "full-lateral", label: "Full lateral" },
      { id: "carpal", label: "Carpal" },
      { id: "pa-craneo", label: "P.A. de cráneo" },
      { id: "ap-craneo", label: "A.P. de cráneo" },
      { id: "waters", label: "Waters" },
      { id: "atm", label: "A.T.M." },
      { id: "towne", label: "Towne" },
      { id: "hirtz", label: "Hirtz" },
      { id: "senos", label: "Senos paranasales (Cadwell)" },
      { id: "anteposterior", label: "Anteposterior" },
    ],
  },
  {
    id: "fotografias",
    label: "Fotografías (intraoral / extraoral)",
    items: [
      { id: "foto-papel", label: "Papel fotográfico", entregaFisica: true },
      { id: "foto-digital", label: "Digital" },
    ],
  },
  {
    id: "modelos",
    label: "Modelos",
    items: [
      { id: "modelo-estudio", label: "Estudio", entregaFisica: true },
      { id: "modelo-trabajo", label: "Trabajo", entregaFisica: true },
      { id: "modelo-3d", label: "Impreso 3D" },
      { id: "escaneo-intraoral", label: "Escaneo intraoral (3Shape / Invisalign)" },
    ],
  },
  {
    id: "cefalometria",
    label: "Cefalometría computarizada",
    items: [
      { id: "cef-ricketts", label: "Ricketts" },
      { id: "cef-steiner", label: "Steiner" },
      { id: "cef-macnamara", label: "Mac Namara" },
      { id: "cef-tweed", label: "Tweed" },
      { id: "cef-jarabak", label: "Jarabak" },
      { id: "cef-rothjarabak", label: "Roth-Jarabak" },
      { id: "cef-downs", label: "Downs" },
      { id: "cef-ricketts-resumido", label: "Ricketts resumido" },
      { id: "cef-pa-craneo", label: "Cefalometría P.A. de cráneo" },
      { id: "cef-otro", label: "Otro", note: true },
    ],
  },
];

// Radiografías periapicales: nomenclatura FDI por arcada, tal como
// en el papel (docs/orden-de-estudio.md).
export const DIENTES_FDI: { infantil: string[][]; adulto: string[][] } = {
  infantil: [
    ["55", "54", "53", "52", "51"],
    ["61", "62", "63", "64", "65"],
    ["85", "84", "83", "82", "81"],
    ["71", "72", "73", "74", "75"],
  ],
  adulto: [
    ["18", "17", "16", "15", "14", "13", "12", "11"],
    ["21", "22", "23", "24", "25", "26", "27", "28"],
    ["48", "47", "46", "45", "44", "43", "42", "41"],
    ["31", "32", "33", "34", "35", "36", "37", "38"],
  ],
};

export type CampoVisionTomografia = {
  value: string;
  label: string;
  help: string;
  /** Solo el FOV 5×5 pide "Zona" adicional. */
  zona?: boolean;
};

// Tomografía 3D: cada campo de visión (FOV) con su texto de ayuda,
// tal como en el papel.
export const TOMOGRAFIA_FOV: CampoVisionTomografia[] = [
  { value: "16x9", label: "16 × 9", help: "Óptimo para Dx de sinusitis y A.T.M." },
  { value: "12x9", label: "12 × 9", help: "Óptimo para cubrir todo el arco dental" },
  { value: "8x9", label: "8 × 9", help: "Óptimo para selección de arco izquierdo, derecho y central" },
  { value: "8x5", label: "8 × 5", help: "Óptimo para cubrir arco superior o inferior" },
  { value: "5x5", label: "5 × 5", help: "Óptimo para cubrir de 3 a 4 dientes", zona: true },
];

export type Paquete = {
  id: string;
  label: string;
  desc: string;
  /** IDs de EstudioCatalogo que el paquete marca automáticamente. */
  items: string[];
  fov?: string;
  nota?: string;
  /**
   * Componentes de entrega física del paquete que NO son un estudio
   * marcable del catálogo (p. ej. la guía quirúrgica de Implantología, que
   * no tiene checkbox propio). Los componentes que SÍ son un estudio del
   * catálogo se derivan solos de `items` + `EstudioCatalogo.entregaFisica`.
   */
  entregaFisicaExtra?: string[];
};

// Paquetes de selección rápida: marcan automáticamente los
// estudios que los componen en el formulario de nueva orden.
export const PAQUETES: Paquete[] = [
  {
    id: "ortodoncia",
    label: "Ortodoncia",
    desc: "Panorámica + lateral de cráneo + cefalometría + fotografías + modelos",
    items: ["panoramica", "lateral-craneo", "cef-ricketts", "foto-digital", "modelo-estudio"],
  },
  {
    id: "diagnostico",
    label: "Diagnóstico",
    desc: "Panorámica + fotografías + modelos",
    items: ["panoramica", "foto-digital", "modelo-estudio"],
  },
  {
    id: "implantologia",
    label: "Implantología",
    desc: "Tomografía + guía quirúrgica (diseño e impresión) + modelos + escaneos 3D",
    items: ["escaneo-intraoral"],
    fov: "12x9",
    nota: "Incluye diseño e impresión de guía quirúrgica (lo coordina Radyex).",
    entregaFisicaExtra: ["Guía quirúrgica"],
  },
];

// Catálogo plano (para selects sencillos como "Subir archivos"),
// derivado de las categorías — no se mantiene a mano.
export const STUDY_TYPES: string[] = STUDY_CATEGORIES.flatMap((cat) =>
  cat.items.filter((item) => !item.note).map((item) => item.label)
).concat(TOMOGRAFIA_FOV.map((fov) => `Tomografía 3D — ${fov.label}`));

/* ============================================================
   Acceso a datos (lectura del seed local; sin backend todavía)
   ============================================================ */

export function getDoctors(): Doctor[] {
  return SEED_DOCTORS;
}

export function getDoctorById(id: string): Doctor | undefined {
  return SEED_DOCTORS.find((d) => d.id === id);
}

export function getCurrentDoctor(): Doctor | undefined {
  return getDoctorById(CURRENT_DOCTOR_ID);
}

export function getOrders(): Orden[] {
  return SEED_ORDERS;
}

export function getOrdersByDoctor(doctorId: string): Orden[] {
  return SEED_ORDERS.filter((o) => o.doctorId === doctorId);
}

// Honoríficos que no cuentan como "nombre" al calcular iniciales
// (para que "Dra. Patricia Núñez" dé "PN" y no "DP").
const HONORIFICOS = new Set(["dr", "dr.", "dra", "dra."]);

// Iniciales de un nombre completo (primera letra de las dos
// primeras palabras, ignorando honoríficos), para avatares como el
// del Sidebar.
export function initials(fullName: string): string {
  const partes = fullName
    .trim()
    .split(/\s+/)
    .filter((palabra) => !HONORIFICOS.has(palabra.toLowerCase()));
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

/* ============================================================
   Utilidades de fecha
   ============================================================ */

// Edad a partir de la fecha de nacimiento (usado si algún día se
// deja de guardar `edad` a mano en la orden y se calcula del
// paciente real).
export function calcAge(birthDateStr: string): number | null {
  const birth = new Date(`${birthDateStr}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const antesDelCumple =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (antesDelCumple) age--;
  return age;
}

// Días que faltan para el próximo cumpleaños (0 = es hoy). Usado
// por el widget "Próximos cumpleaños" del panel de administración
// (pantalla todavía no migrada).
// TODO (backend): notificar al equipo admin cuando llegue el
// cumpleaños de un doctor — esta función solo calcula la fecha,
// no dispara ningún aviso.
export function daysUntilBirthday(birthDateStr: string): number | null {
  const birth = new Date(`${birthDateStr}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let proximo = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (proximo < today) {
    proximo = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  return Math.round((proximo.getTime() - today.getTime()) / 86_400_000);
}
