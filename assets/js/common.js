/* ============================================================
   RADYEX — Datos y utilidades compartidas
   Simula un backend: guarda el estado (doctores, órdenes,
   archivos) en sessionStorage para que los cambios hechos en
   una pantalla (alta de doctor, nueva orden, archivo subido)
   se reflejen al navegar a otra. No hay autenticación real.
   ============================================================ */

const RADYEX = (function () {

  /* ---------- Catálogo de íconos SVG reutilizados ---------- */
  const ICONS = {
    doctor: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg>',
    phone: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.4 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2.1Z"/></svg>',
    mail: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
    age: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>',
    since: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    study: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    file: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    eye: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5 11-11"/></svg>',
    alert: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>',
    key: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
    clinic: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>',
    upload: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>',
    doctors: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg>',
    patients: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>',
    home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>',
    orders: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>',
    log: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
    logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
    reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
    bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    external: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
    folder: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
    userPlus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M19 16v6"/><path d="M22 19h-6"/></svg>',
    shield: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    barChart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
    filePlus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',
    messageSquare: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  };

  /* ---------- PDFs de ejemplo (contenido genérico para el visor) ---------- */
  const PDF_PACKAGE = "../assets/ejemplos/ejemplo-paquete-estudio.pdf";
  const PDF_SINGLE = "../assets/ejemplos/ejemplo-radiografia.pdf";

  /* ---------- Semillas de datos (estado inicial de la demo) ---------- */
  const SEED_DOCTORS = [
    { id: "dr-nunez", name: "Dra. Patricia Núñez", specialty: "Ortodoncia", clinic: "Consultorio Central Puebla", email: "patricia.nunez@clinicasonrisa.mx", phone: "222 310 4471", username: "patricia.nunez", status: "active", lastAccess: "20 dic 2025", birthDate: "1985-08-20" },
    { id: "dr-cordero", name: "Dr. Iván Cordero", specialty: "Endodoncia", clinic: "Consultorio Reforma", email: "ivan.cordero@endopuebla.mx", phone: "222 455 8890", username: "ivan.cordero", status: "active", lastAccess: "17 oct 2025", birthDate: "1979-11-02" },
    { id: "dr-solis", name: "Dra. Renata Solís", specialty: "Cirugía Maxilofacial", clinic: "Clínica Angelópolis", email: "renata.solis@maxilopuebla.mx", phone: "222 678 2205", username: "renata.solis", status: "active", lastAccess: "16 jun 2025", birthDate: "1990-07-22" },
    { id: "dr-beltran", name: "Dr. Ricardo Beltrán", specialty: "Odontopediatría", clinic: "Consultorio Los Fuertes", email: "ricardo.beltran@sonrisakids.mx", phone: "222 190 3345", username: "ricardo.beltran", status: "inactive", lastAccess: "02 ene 2025", birthDate: "1982-09-05" },
  ];

  const CURRENT_DOCTOR_ID = "dr-nunez";

  const SEED_ORDERS = [
    { code: "LN251220015", name: "Omar Mateo Rosas Lara", init: "OR", loc: "Puebla", date: "20 dic 2025", status: "success", doctorId: "dr-nunez", studyType: "Tomografía 3D — 12×9", priority: "Normal", entrega: "Digital", phone: "222 145 7732", email: "omar.rosas@gmail.com", age: 34, since: "2023 · 3 años",
      files: { 2025: [{ name: "Tomografía 3D.pdf", date: "20 dic 2025" }], 2024: [{ name: "Panorámica.pdf", date: "14 mar 2024" }], 2023: [{ name: "Periapical (serie).pdf", date: "02 feb 2023" }] } },

    { code: "LN251017016", name: "Marilú Méndez Martínez", init: "MM", loc: "Puebla", date: "17 oct 2025", status: "success", doctorId: "dr-cordero", studyType: "Panorámica", priority: "Normal", entrega: "Digital", phone: "222 308 9912", email: "marilu.mendez@hotmail.com", age: 51, since: "2022 · 4 años",
      files: { 2025: [{ name: "Panorámica.pdf", date: "17 oct 2025" }], 2023: [{ name: "Lateral de cráneo.pdf", date: "11 may 2023" }], 2022: [{ name: "Periapical (serie).pdf", date: "30 ago 2022" }] } },

    { code: "LN250805010", name: "Luis Ángel Castillo Medellín", init: "LC", loc: "Puebla", date: "05 ago 2025", status: "warn", doctorId: "dr-solis", studyType: "Tomografía 3D — 16×9", priority: "Urgente", entrega: "Impreso", phone: "222 477 0156", email: "luis.castillo@outlook.com", age: 27, since: "2025 · 1 año",
      files: { 2025: [{ name: "Tomografía 3D (en proceso).pdf", date: "05 ago 2025" }] } },

    { code: "LN250802018", name: "Aline Daniela Vargas Sánchez", init: "AV", loc: "Puebla", date: "02 ago 2025", status: "success", doctorId: "dr-cordero", studyType: "Periapical", priority: "Normal", entrega: "Digital", phone: "222 590 4423", email: "aline.vargas@gmail.com", age: 19, since: "2024 · 2 años",
      files: { 2025: [{ name: "Periapical (serie).pdf", date: "02 ago 2025" }], 2024: [{ name: "Panorámica.pdf", date: "19 nov 2024" }] } },

    { code: "TM250709012", name: "María Guadalupe Zarco Herrera", init: "MZ", loc: "Puebla", date: "09 jul 2025", status: "pending", doctorId: "dr-nunez", studyType: "Lateral de cráneo", priority: "Normal", entrega: "Impreso", phone: "222 612 8870", email: "maria.zarco@gmail.com", age: 62, since: "2025 · nuevo",
      files: { 2025: [] } },

    { code: "LN250708008", name: "Giovanna Fernanda Flores Gómez", init: "GF", loc: "Puebla", date: "08 jul 2025", status: "success", doctorId: "dr-solis", studyType: "Tomografía 3D — 12×9", priority: "Normal", entrega: "Digital", phone: "222 734 2298", email: "giovanna.flores@gmail.com", age: 29, since: "2023 · 3 años",
      files: { 2025: [{ name: "Tomografía 3D.pdf", date: "08 jul 2025" }], 2024: [{ name: "Panorámica.pdf", date: "22 ene 2024" }], 2023: [{ name: "Periapical (serie).pdf", date: "15 jun 2023" }] } },

    { code: "LN250616002", name: "María Guillermina Alarcón de Martino", init: "MA", loc: "Puebla", date: "16 jun 2025", status: "warn", doctorId: "dr-cordero", studyType: "Panorámica", priority: "Normal", entrega: "Impreso", phone: "222 866 5541", email: "guille.alarcon@hotmail.com", age: 58, since: "2021 · 5 años",
      files: { 2025: [{ name: "Panorámica (en proceso).pdf", date: "16 jun 2025" }], 2022: [{ name: "Tomografía 3D.pdf", date: "03 sep 2022" }], 2021: [{ name: "Periapical (serie).pdf", date: "10 abr 2021" }] } },

    { code: "TM250602018", name: "Damiana Uscanga Guadarrama", init: "DU", loc: "Puebla", date: "02 jun 2025", status: "pending", doctorId: "dr-solis", studyType: "Periapical", priority: "Normal", entrega: "Digital", phone: "222 901 3387", email: "damiana.uscanga@gmail.com", age: 41, since: "2025 · nuevo",
      files: { 2025: [] } },

    { code: "LN250520011", name: "Fernando Iván Rosales Pacheco", init: "FR", loc: "Puebla", date: "20 may 2025", status: "success", doctorId: "dr-nunez", studyType: "Tomografía 3D — 12×9", priority: "Normal", entrega: "Digital", phone: "222 220 6634", email: "fernando.rosales@gmail.com", age: 45, since: "2022 · 4 años",
      files: { 2025: [{ name: "Tomografía 3D.pdf", date: "20 may 2025" }], 2022: [{ name: "Panorámica.pdf", date: "11 feb 2022" }] } },

    { code: "LN250415009", name: "Karla Sofía Domínguez Reyes", init: "KD", loc: "Puebla", date: "15 abr 2025", status: "warn", doctorId: "dr-nunez", studyType: "Periapical", priority: "Normal", entrega: "Impreso", phone: "222 349 7712", email: "karla.dominguez@outlook.com", age: 24, since: "2024 · 2 años",
      files: { 2025: [{ name: "Periapical (serie) (en proceso).pdf", date: "15 abr 2025" }], 2024: [{ name: "Panorámica.pdf", date: "03 sep 2024" }] } },
  ];

  /* Añade el PDF de ejemplo correspondiente a cada archivo semilla: el estudio
     más antiguo de cada paciente se acompaña de un "paquete" inicial completo
     (fotos + panorámica + lateral), y el resto usa la radiografía individual. */
  SEED_ORDERS.forEach(o => {
    const yearsWithFiles = Object.keys(o.files).map(Number).filter(y => (o.files[y] || []).length > 0);
    if (yearsWithFiles.length) {
      const oldestYear = Math.min(...yearsWithFiles);
      const anchor = o.files[oldestYear][0];
      o.files[oldestYear].push({ name: "Paquete de estudio inicial.pdf", date: anchor.date, src: PDF_PACKAGE });
    }
    Object.keys(o.files).forEach(y => {
      o.files[y].forEach(f => { if (!f.src) f.src = PDF_SINGLE; });
    });
  });

  const STATUS_MAP = {
    success: { label: "Finalizado", cls: "success" },
    warn: { label: "En proceso", cls: "warn" },
    pending: { label: "Pendiente", cls: "pending" },
  };

  /* ---------- Bitácora de auditoría (LFPDPPP) ----------
     TODO (backend): esta bitácora debe ser una tabla append-only en Supabase con
     RLS que solo permita INSERT y SELECT (nunca UPDATE ni DELETE), poblada por la
     app o por triggers en cada acción sensible: alta/edición de doctor, subida de
     archivo, cambio de estatus de una orden, visualización y descarga de un
     archivo de paciente, y consulta de la propia bitácora. Retención alineada a
     NOM-004 (5 años). Aquí abajo son puros datos ficticios fijos para la maqueta,
     no hay registro real de eventos todavía. */
  const LOG_ACTIONS = {
    doctor: { label: "Alta / edición de doctor", chip: "Doctores", icon: "userPlus", bg: "var(--pending-soft)", fg: "var(--ink-soft)" },
    subida: { label: "Subida de archivo", chip: "Subida", icon: "upload", bg: "var(--accent-soft)", fg: "var(--accent-dark)" },
    estatus: { label: "Cambio de estatus", chip: "Estatus", icon: "reset", bg: "var(--warn-soft)", fg: "var(--warn)" },
    visualizacion: { label: "Visualización de archivo", chip: "Visualización", icon: "eye", bg: "var(--success-soft)", fg: "var(--success)" },
    descarga: { label: "Descarga de archivo", chip: "Descarga", icon: "download", bg: "var(--pending-soft)", fg: "var(--pending)" },
    consulta: { label: "Consulta de bitácora", chip: "Consulta", icon: "shield", bg: "var(--danger-soft)", fg: "var(--danger)" },
  };

  /* Reverso cronológico (más reciente primero). Folios, doctores y pacientes
     coinciden con SEED_ORDERS / SEED_DOCTORS para que la bitácora sea coherente
     con el resto de la maqueta. */
  const SEED_BITACORA = [
    { ts: "2025-12-22T11:14", actor: "Mariana Ibáñez", role: "Radyex · Administración", type: "consulta", object: "Bitácora completa", detail: "Filtró por acción: Descarga" },
    { ts: "2025-12-21T17:40", actor: "Dra. Patricia Núñez", role: "Doctor referente", type: "descarga", object: "Omar Mateo Rosas Lara · Tomografía 3D.pdf", detail: "Folio LN251220015" },
    { ts: "2025-12-21T17:38", actor: "Dra. Patricia Núñez", role: "Doctor referente", type: "visualizacion", object: "Omar Mateo Rosas Lara · Tomografía 3D.pdf", detail: "Folio LN251220015" },
    { ts: "2025-12-20T16:05", actor: "Diego Salgado", role: "Radyex · Recepción", type: "estatus", object: "Folio LN251220015 · Omar Mateo Rosas Lara", detail: "Pendiente → Finalizado" },
    { ts: "2025-12-20T16:04", actor: "Diego Salgado", role: "Radyex · Recepción", type: "subida", object: "Omar Mateo Rosas Lara · Tomografía 3D.pdf", detail: "Folio LN251220015" },
    { ts: "2025-10-17T10:22", actor: "Dr. Iván Cordero", role: "Doctor referente", type: "descarga", object: "Marilú Méndez Martínez · Panorámica.pdf", detail: "Folio LN251017016" },
    { ts: "2025-10-17T09:58", actor: "Diego Salgado", role: "Radyex · Recepción", type: "estatus", object: "Folio LN251017016 · Marilú Méndez Martínez", detail: "En proceso → Finalizado" },
    { ts: "2025-10-17T09:55", actor: "Diego Salgado", role: "Radyex · Recepción", type: "subida", object: "Marilú Méndez Martínez · Panorámica.pdf", detail: "Folio LN251017016" },
    { ts: "2025-10-12T14:03", actor: "Mariana Ibáñez", role: "Radyex · Administración", type: "doctor", object: "Dr. Iván Cordero", detail: "Edición de doctor · actualizó teléfono de contacto" },
    { ts: "2025-08-05T09:30", actor: "Diego Salgado", role: "Radyex · Recepción", type: "estatus", object: "Folio LN250805010 · Luis Ángel Castillo Medellín", detail: "Pendiente → En proceso" },
    { ts: "2025-08-02T12:11", actor: "Dr. Iván Cordero", role: "Doctor referente", type: "visualizacion", object: "Aline Daniela Vargas Sánchez · Periapical (serie).pdf", detail: "Folio LN250802018" },
    { ts: "2025-07-09T18:20", actor: "Mariana Ibáñez", role: "Radyex · Administración", type: "consulta", object: "Bitácora completa", detail: "Filtró por usuario: Dra. Renata Solís" },
    { ts: "2025-07-08T15:47", actor: "Diego Salgado", role: "Radyex · Recepción", type: "subida", object: "Giovanna Fernanda Flores Gómez · Tomografía 3D.pdf", detail: "Folio LN250708008" },
    { ts: "2025-07-08T15:46", actor: "Diego Salgado", role: "Radyex · Recepción", type: "estatus", object: "Folio LN250708008 · Giovanna Fernanda Flores Gómez", detail: "En proceso → Finalizado" },
    { ts: "2025-06-16T10:02", actor: "Diego Salgado", role: "Radyex · Recepción", type: "estatus", object: "Folio LN250616002 · María Guillermina Alarcón de Martino", detail: "Pendiente → En proceso" },
    { ts: "2025-06-02T09:14", actor: "Mariana Ibáñez", role: "Radyex · Administración", type: "estatus", object: "Folio TM250602018 · Damiana Uscanga Guadarrama", detail: "Orden registrada · Pendiente" },
    { ts: "2025-05-20T13:36", actor: "Dra. Patricia Núñez", role: "Doctor referente", type: "descarga", object: "Fernando Iván Rosales Pacheco · Tomografía 3D.pdf", detail: "Folio LN250520011" },
    { ts: "2025-04-15T11:52", actor: "Dra. Patricia Núñez", role: "Doctor referente", type: "visualizacion", object: "Karla Sofía Domínguez Reyes · Periapical (serie) (en proceso).pdf", detail: "Folio LN250415009" },
    { ts: "2025-04-15T09:20", actor: "Diego Salgado", role: "Radyex · Recepción", type: "subida", object: "Karla Sofía Domínguez Reyes · Periapical (serie) (en proceso).pdf", detail: "Folio LN250415009" },
    { ts: "2025-03-03T16:41", actor: "Mariana Ibáñez", role: "Radyex · Administración", type: "doctor", object: "Dra. Renata Solís", detail: "Edición de doctor · actualizó consultorio" },
    { ts: "2025-01-02T10:15", actor: "Mariana Ibáñez", role: "Radyex · Administración", type: "doctor", object: "Dr. Ricardo Beltrán", detail: "Alta de doctor · Odontopediatría" },
  ];

  /* ---------- Catálogo de estudios (transcrito de docs/orden-de-estudio.md) ----------
     Fuente de verdad del formulario "Nueva orden" del doctor. Cada categoría agrupa
     los estudios tal como aparecen en la orden de papel. */
  const STUDY_CATEGORIES = [
    {
      id: "intraorales",
      label: "Radiografías intraorales",
      items: [
        { id: "periapical", label: "Periapical", teeth: true },
        { id: "oclusal", label: "Oclusal" },
        { id: "superior", label: "Superior" },
        { id: "inferior", label: "Inferior" },
        { id: "aleta", label: "Aleta de mordida" },
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
        { id: "foto-papel", label: "Papel fotográfico" },
        { id: "foto-digital", label: "Digital" },
      ],
    },
    {
      id: "modelos",
      label: "Modelos",
      items: [
        { id: "modelo-estudio", label: "Estudio" },
        { id: "modelo-trabajo", label: "Trabajo" },
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

  /* Radiografías periapicales: nomenclatura FDI por arcada, tal como en el papel. */
  const DIENTES_FDI = {
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

  /* Tomografía 3D: cada FOV con su texto de ayuda, tal como en el papel. */
  const TOMOGRAFIA_FOV = [
    { value: "16x9", label: "16 × 9", help: "Óptimo para Dx de sinusitis y A.T.M." },
    { value: "12x9", label: "12 × 9", help: "Óptimo para cubrir todo el arco dental" },
    { value: "8x9", label: "8 × 9", help: "Óptimo para selección de arco izquierdo, derecho y central" },
    { value: "8x5", label: "8 × 5", help: "Óptimo para cubrir arco superior o inferior" },
    { value: "5x5", label: "5 × 5", help: "Óptimo para cubrir de 3 a 4 dientes", zona: true },
  ];

  /* Paquetes: selección rápida que marca automáticamente los estudios que lo componen. */
  const PAQUETES = [
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
    },
  ];

  /* Catálogo plano (para selects sencillos como "Subir archivos") derivado de las categorías. */
  const STUDY_TYPES = STUDY_CATEGORIES.flatMap(cat => cat.items.filter(i => !i.note).map(i => i.label))
    .concat(TOMOGRAFIA_FOV.map(f => `Tomografía 3D — ${f.label}`));

  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  /* ---------- Persistencia en sessionStorage ---------- */
  const KEY = "radyexDemoState";

  function loadState() {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* sessionStorage no disponible: seguimos con datos semilla */ }
    const fresh = { doctors: SEED_DOCTORS, orders: SEED_ORDERS };
    saveState(fresh);
    return fresh;
  }

  function saveState(state) {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* modo privado u otro bloqueo: la demo sigue en memoria */ }
  }

  let state = loadState();

  function resetState() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    window.location.href = "../index.html";
  }

  /* ---------- Utilidades de formato ---------- */
  function pad2(n) { return String(n).padStart(2, "0"); }

  function formatDateEs(d) {
    d = d || new Date();
    return `${pad2(d.getDate())} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  }

  function folioDatePart(d) {
    d = d || new Date();
    return `${String(d.getFullYear()).slice(2)}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  }

  function generateFolio(prefix) {
    prefix = prefix || (Math.random() < 0.5 ? "LN" : "TM");
    const seq = pad2(Math.floor(Math.random() * 90) + 10) + Math.floor(Math.random() * 9);
    return `${prefix}${folioDatePart()}${seq}`;
  }

  function calcAge(birthDateStr) {
    const birth = new Date(birthDateStr + "T12:00:00");
    if (isNaN(birth)) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const beforeBirthday = today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (beforeBirthday) age--;
    return age;
  }

  /* Días que faltan para el próximo cumpleaños (0 = es hoy). Solo para el
     widget demostrativo "Próximos cumpleaños" del panel de administración.
     TODO (backend): notificar al equipo admin cuando llegue el cumpleaños de
     un doctor — esta función solo calcula la fecha, no dispara ningún aviso. */
  function daysUntilBirthday(birthDateStr) {
    const birth = new Date(birthDateStr + "T12:00:00");
    if (isNaN(birth)) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    return Math.round((next - today) / 86400000);
  }

  /* Fecha+hora en español para filas de la bitácora, p. ej. "22 dic 2025" / "11:14 a.m." */
  function formatDateTimeEs(isoStr) {
    const d = new Date(isoStr);
    let h = d.getHours();
    const m = pad2(d.getMinutes());
    const ampm = h >= 12 ? "p.m." : "a.m.";
    h = h % 12; if (h === 0) h = 12;
    return { date: formatDateEs(d), time: `${h}:${m} ${ampm}`, isoDate: isoStr.slice(0, 10) };
  }

  function initials(fullName) {
    const parts = fullName.trim().split(/\s+/);
    return ((parts[0] || "")[0] + (parts[1] || "")[0]).toUpperCase();
  }

  function slugify(str) {
    return str.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
  }

  function suggestUsername(fullName) {
    const parts = slugify(fullName).filter(p => !["dr", "dra", "de", "del"].includes(p));
    if (parts.length < 2) return parts.join(".") || "usuario";
    return `${parts[0]}.${parts[parts.length - 1]}`;
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let out = "";
    for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  /* ---------- Acceso a datos ---------- */
  function getDoctors() { return state.doctors; }
  function getDoctorById(id) { return state.doctors.find(d => d.id === id); }
  function getCurrentDoctor() { return getDoctorById(CURRENT_DOCTOR_ID); }

  function addDoctor(doc) {
    state.doctors.push(doc);
    saveState(state);
  }

  function getOrders() { return state.orders; }
  function getOrdersByDoctor(doctorId) { return state.orders.filter(o => o.doctorId === doctorId); }
  function getBitacora() { return SEED_BITACORA; }
  function getOrderByCode(code) { return state.orders.find(o => o.code === code); }

  function addOrder(order) {
    state.orders.unshift(order);
    saveState(state);
    return order;
  }

  function addFileToOrder(code, file, newStatus) {
    const order = getOrderByCode(code);
    if (!order) return;
    const year = new Date().getFullYear();
    if (!order.files[year]) order.files[year] = [];
    if (!file.src) file.src = PDF_SINGLE;
    order.files[year].unshift(file);
    if (newStatus) order.status = newStatus;
    saveState(state);
    return order;
  }

  function countFiles(order) {
    return Object.values(order.files).reduce((sum, arr) => sum + arr.length, 0);
  }

  /* ---------- Visor de archivos (lightbox con iframe de PDF) ---------- */
  let viewerReady = false;

  function ensureViewer() {
    if (viewerReady) return;
    viewerReady = true;
    const host = document.createElement("div");
    host.innerHTML = `
      <div class="modal-overlay" id="radyexViewerOverlay">
        <div class="modal-card modal-viewer">
          <button class="modal-close" id="radyexViewerClose" aria-label="Cerrar visor">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div class="viewer-header">
            <div class="viewer-icon">${ICONS.file}</div>
            <div>
              <div class="viewer-name" id="radyexViewerName"></div>
              <div class="viewer-date" id="radyexViewerDate"></div>
            </div>
          </div>
          <div class="viewer-frame-wrap">
            <iframe id="radyexViewerFrame" title="Vista previa del documento"></iframe>
          </div>
          <div class="viewer-actions">
            <a class="btn-secondary" id="radyexViewerDownload" href="#" download>${ICONS.download} Descargar</a>
            <a class="btn-secondary" id="radyexViewerOpen" href="#" target="_blank" rel="noopener">${ICONS.external} Abrir en pestaña nueva</a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(host.firstElementChild);

    const overlay = document.getElementById("radyexViewerOverlay");
    document.getElementById("radyexViewerClose").addEventListener("click", closeFileViewer);
    overlay.addEventListener("click", e => { if (e.target === overlay) closeFileViewer(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeFileViewer();
    });
  }

  function openFileViewer(file) {
    ensureViewer();
    document.getElementById("radyexViewerName").textContent = file.name;
    document.getElementById("radyexViewerDate").textContent = file.date || "";
    document.getElementById("radyexViewerFrame").src = file.src || "";
    document.getElementById("radyexViewerDownload").href = file.src || "#";
    document.getElementById("radyexViewerDownload").setAttribute("download", file.name || "");
    document.getElementById("radyexViewerOpen").href = file.src || "#";
    document.getElementById("radyexViewerOverlay").classList.add("open");
  }

  function closeFileViewer() {
    const overlay = document.getElementById("radyexViewerOverlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    document.getElementById("radyexViewerFrame").src = "about:blank";
  }

  function downloadFile(file) {
    const a = document.createElement("a");
    a.href = file.src;
    a.download = file.name || "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------- Navegación móvil (drawer + hamburguesa, ≤640px) ----------
     Se activa sola si la página trae el marcado del drawer (topbar móvil +
     overlay + aside#sidebar); si no existen esos elementos no hace nada. */
  function initMobileNav() {
    const btn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (!btn || !sidebar || !overlay) return;

    const avatarSrc = document.querySelector(".sidebar-user-avatar");
    const avatarDst = document.getElementById("mobileAvatar");
    if (avatarSrc && avatarDst) avatarDst.textContent = avatarSrc.textContent;

    function openDrawer() {
      sidebar.classList.add("open");
      overlay.classList.add("open");
      document.body.classList.add("sidebar-open");
      btn.setAttribute("aria-expanded", "true");
    }
    function closeDrawer() {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
      document.body.classList.remove("sidebar-open");
      btn.setAttribute("aria-expanded", "false");
    }
    btn.addEventListener("click", () => {
      sidebar.classList.contains("open") ? closeDrawer() : openDrawer();
    });
    overlay.addEventListener("click", closeDrawer);
    sidebar.querySelectorAll(".navitem").forEach(item => item.addEventListener("click", closeDrawer));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  }
  initMobileNav();

  /* ---------- API pública ---------- */
  return {
    ICONS, STATUS_MAP, STUDY_TYPES, STUDY_CATEGORIES, DIENTES_FDI, TOMOGRAFIA_FOV, PAQUETES, CURRENT_DOCTOR_ID,
    LOG_ACTIONS,
    getDoctors, getDoctorById, getCurrentDoctor, addDoctor,
    getOrders, getOrdersByDoctor, getOrderByCode, addOrder, addFileToOrder, countFiles, getBitacora,
    formatDateEs, formatDateTimeEs, generateFolio, initials, suggestUsername, generatePassword, calcAge, daysUntilBirthday,
    resetState, openFileViewer, downloadFile,
  };
})();
