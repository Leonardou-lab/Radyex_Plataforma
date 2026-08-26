/**
 * RADYEX — Datos y utilidades compartidas (semilla local).
 *
 * Portado desde assets/js/common.js del mockup estático. Por ahora
 * NO hay backend: las pantallas importan estos arreglos directo
 * (nada de fetch ni sessionStorage). Cuando llegue Supabase (fase 2
 * del roadmap) estas mismas formas de datos (los `type`) van a
 * guiar el esquema de la base de datos.
 */

/* ============================================================
   Tipos
   ============================================================ */

// Estatus de una orden. Se usa para el color del chip/pill y del
// borde izquierdo de la tarjeta (ver STATUS_MAP más abajo).
export type EstatusOrden = "success" | "warn" | "pending";

export type Entrega = "Impreso" | "Digital";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  email: string;
  phone: string;
  username: string;
  status: "active" | "inactive";
  lastAccess: string;
  /** Fecha de nacimiento en formato ISO (YYYY-MM-DD). */
  birthDate: string;
};

export type ArchivoOrden = {
  name: string;
  date: string;
  /** Ruta del PDF de ejemplo que se abre en el visor. */
  src?: string;
};

// Los archivos de una orden se agrupan por año, igual que en el
// mockup: { "2025": [...], "2024": [...] }.
export type ArchivosPorAnio = Record<string, ArchivoOrden[]>;

export type Orden = {
  code: string;
  name: string;
  /** Iniciales del paciente, usadas en el avatar redondo. */
  init: string;
  loc: string;
  date: string;
  status: EstatusOrden;
  doctorId: string;
  studyType: string;
  priority: string;
  entrega: Entrega;
  phone: string;
  email: string;
  age: number;
  since: string;
  files: ArchivosPorAnio;
};

/* ============================================================
   Estatus: etiqueta + clase de color por estatus de orden
   ============================================================ */

export const STATUS_MAP: Record<EstatusOrden, { label: string; cls: EstatusOrden }> = {
  success: { label: "Finalizado", cls: "success" },
  warn: { label: "En proceso", cls: "warn" },
  pending: { label: "Pendiente", cls: "pending" },
};

/* ============================================================
   Semillas de datos (mismos doctores/pacientes que el mockup)
   ============================================================ */

export const SEED_DOCTORS: Doctor[] = [
  { id: "dr-nunez", name: "Dra. Patricia Núñez", specialty: "Ortodoncia", clinic: "Consultorio Central Puebla", email: "patricia.nunez@clinicasonrisa.mx", phone: "222 310 4471", username: "patricia.nunez", status: "active", lastAccess: "20 dic 2025", birthDate: "1985-08-20" },
  { id: "dr-cordero", name: "Dr. Iván Cordero", specialty: "Endodoncia", clinic: "Consultorio Reforma", email: "ivan.cordero@endopuebla.mx", phone: "222 455 8890", username: "ivan.cordero", status: "active", lastAccess: "17 oct 2025", birthDate: "1979-11-02" },
  { id: "dr-solis", name: "Dra. Renata Solís", specialty: "Cirugía Maxilofacial", clinic: "Clínica Angelópolis", email: "renata.solis@maxilopuebla.mx", phone: "222 678 2205", username: "renata.solis", status: "active", lastAccess: "16 jun 2025", birthDate: "1990-07-22" },
  { id: "dr-beltran", name: "Dr. Ricardo Beltrán", specialty: "Odontopediatría", clinic: "Consultorio Los Fuertes", email: "ricardo.beltran@sonrisakids.mx", phone: "222 190 3345", username: "ricardo.beltran", status: "inactive", lastAccess: "02 ene 2025", birthDate: "1982-09-05" },
];

// El mockup no tiene login real: el doctor en sesión siempre es
// este. Cuando llegue auth (fase 3) esto sale de la sesión real.
export const CURRENT_DOCTOR_ID = "dr-nunez";

export const SEED_ORDERS: Orden[] = [
  { code: "LN251220015", name: "Omar Mateo Rosas Lara", init: "OR", loc: "Puebla", date: "20 dic 2025", status: "success", doctorId: "dr-nunez", studyType: "Tomografía 3D — 12×9", priority: "Normal", entrega: "Digital", phone: "222 145 7732", email: "omar.rosas@gmail.com", age: 34, since: "2023 · 3 años",
    files: { "2025": [{ name: "Tomografía 3D.pdf", date: "20 dic 2025" }], "2024": [{ name: "Panorámica.pdf", date: "14 mar 2024" }], "2023": [{ name: "Periapical (serie).pdf", date: "02 feb 2023" }] } },

  { code: "LN251017016", name: "Marilú Méndez Martínez", init: "MM", loc: "Puebla", date: "17 oct 2025", status: "success", doctorId: "dr-cordero", studyType: "Panorámica", priority: "Normal", entrega: "Digital", phone: "222 308 9912", email: "marilu.mendez@hotmail.com", age: 51, since: "2022 · 4 años",
    files: { "2025": [{ name: "Panorámica.pdf", date: "17 oct 2025" }], "2023": [{ name: "Lateral de cráneo.pdf", date: "11 may 2023" }], "2022": [{ name: "Periapical (serie).pdf", date: "30 ago 2022" }] } },

  { code: "LN250805010", name: "Luis Ángel Castillo Medellín", init: "LC", loc: "Puebla", date: "05 ago 2025", status: "warn", doctorId: "dr-solis", studyType: "Tomografía 3D — 16×9", priority: "Urgente", entrega: "Impreso", phone: "222 477 0156", email: "luis.castillo@outlook.com", age: 27, since: "2025 · 1 año",
    files: { "2025": [{ name: "Tomografía 3D (en proceso).pdf", date: "05 ago 2025" }] } },

  { code: "LN250802018", name: "Aline Daniela Vargas Sánchez", init: "AV", loc: "Puebla", date: "02 ago 2025", status: "success", doctorId: "dr-cordero", studyType: "Periapical", priority: "Normal", entrega: "Digital", phone: "222 590 4423", email: "aline.vargas@gmail.com", age: 19, since: "2024 · 2 años",
    files: { "2025": [{ name: "Periapical (serie).pdf", date: "02 ago 2025" }], "2024": [{ name: "Panorámica.pdf", date: "19 nov 2024" }] } },

  { code: "TM250709012", name: "María Guadalupe Zarco Herrera", init: "MZ", loc: "Puebla", date: "09 jul 2025", status: "pending", doctorId: "dr-nunez", studyType: "Lateral de cráneo", priority: "Normal", entrega: "Impreso", phone: "222 612 8870", email: "maria.zarco@gmail.com", age: 62, since: "2025 · nuevo",
    files: { "2025": [] } },

  { code: "LN250708008", name: "Giovanna Fernanda Flores Gómez", init: "GF", loc: "Puebla", date: "08 jul 2025", status: "success", doctorId: "dr-solis", studyType: "Tomografía 3D — 12×9", priority: "Normal", entrega: "Digital", phone: "222 734 2298", email: "giovanna.flores@gmail.com", age: 29, since: "2023 · 3 años",
    files: { "2025": [{ name: "Tomografía 3D.pdf", date: "08 jul 2025" }], "2024": [{ name: "Panorámica.pdf", date: "22 ene 2024" }], "2023": [{ name: "Periapical (serie).pdf", date: "15 jun 2023" }] } },

  { code: "LN250616002", name: "María Guillermina Alarcón de Martino", init: "MA", loc: "Puebla", date: "16 jun 2025", status: "warn", doctorId: "dr-cordero", studyType: "Panorámica", priority: "Normal", entrega: "Impreso", phone: "222 866 5541", email: "guille.alarcon@hotmail.com", age: 58, since: "2021 · 5 años",
    files: { "2025": [{ name: "Panorámica (en proceso).pdf", date: "16 jun 2025" }], "2022": [{ name: "Tomografía 3D.pdf", date: "03 sep 2022" }], "2021": [{ name: "Periapical (serie).pdf", date: "10 abr 2021" }] } },

  { code: "TM250602018", name: "Damiana Uscanga Guadarrama", init: "DU", loc: "Puebla", date: "02 jun 2025", status: "pending", doctorId: "dr-solis", studyType: "Periapical", priority: "Normal", entrega: "Digital", phone: "222 901 3387", email: "damiana.uscanga@gmail.com", age: 41, since: "2025 · nuevo",
    files: { "2025": [] } },

  { code: "LN250520011", name: "Fernando Iván Rosales Pacheco", init: "FR", loc: "Puebla", date: "20 may 2025", status: "success", doctorId: "dr-nunez", studyType: "Tomografía 3D — 12×9", priority: "Normal", entrega: "Digital", phone: "222 220 6634", email: "fernando.rosales@gmail.com", age: 45, since: "2022 · 4 años",
    files: { "2025": [{ name: "Tomografía 3D.pdf", date: "20 may 2025" }], "2022": [{ name: "Panorámica.pdf", date: "11 feb 2022" }] } },

  { code: "LN250415009", name: "Karla Sofía Domínguez Reyes", init: "KD", loc: "Puebla", date: "15 abr 2025", status: "warn", doctorId: "dr-nunez", studyType: "Periapical", priority: "Normal", entrega: "Impreso", phone: "222 349 7712", email: "karla.dominguez@outlook.com", age: 24, since: "2024 · 2 años",
    files: { "2025": [{ name: "Periapical (serie) (en proceso).pdf", date: "15 abr 2025" }], "2024": [{ name: "Panorámica.pdf", date: "03 sep 2024" }] } },
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
  const aniosConArchivos = Object.keys(orden.files)
    .map(Number)
    .filter((anio) => (orden.files[anio] ?? []).length > 0);

  if (aniosConArchivos.length > 0) {
    const anioMasAntiguo = String(Math.min(...aniosConArchivos));
    const archivoAncla = orden.files[anioMasAntiguo][0];
    orden.files[anioMasAntiguo].push({
      name: "Paquete de estudio inicial.pdf",
      date: archivoAncla.date,
      src: PDF_PACKAGE,
    });
  }

  Object.values(orden.files).forEach((archivos) => {
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
// deja de guardar `age` a mano en la orden y se calcula del
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
