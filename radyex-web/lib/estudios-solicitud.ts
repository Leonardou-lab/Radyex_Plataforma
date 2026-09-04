/**
 * RADYEX — Estudios de una solicitud de orden: forma del estado + funciones puras.
 *
 * Vive en `lib/` porque lo usan los DOS lados:
 *  - el formulario del doctor (cliente), para el estado de la selección; y
 *  - la Server Action (servidor), para armar el `estudios` jsonb que se guarda
 *    en `solicitudes_orden.estudios`.
 *
 * Aquí se hacen cumplir las dos reglas de mapeo de
 * docs/orden-de-estudio.md § "Reglas de mapeo formulario → base de datos":
 *  1. Los valores salen en el formato canónico de la BD (`tipoCaptura` es
 *     'sensor' | 'rx' en minúscula, no "Sensor"/"RX").
 *  2. La Tomografía 3D NO tiene checkbox propio en el formulario: se infiere
 *     del FOV elegido. `construirEstudiosSolicitud()` la SINTETIZA — ver ahí.
 */

import {
  PAQUETES,
  STUDY_CATEGORIES,
  TOMOGRAFIA_FOV,
  type EstudioCatalogo,
  type Paquete,
} from "@/lib/data";

/** Valores que acepta `orden_estudios.tipo_captura` (check en minúscula). */
export type TipoCaptura = "sensor" | "rx";

/**
 * Id del estudio "paraguas" de Tomografía 3D en `catalogo_estudios`. El FOV
 * concreto NO es un estudio aparte: se guarda en `orden_estudios.fov`.
 */
export const ID_TOMOGRAFIA = "tomografia-3d";

/** Estudio que requiere elegir dientes FDI (Periapical). */
const ID_PERIAPICAL = "periapical";
/** Estudio que requiere texto libre (Cefalometría "Otro"). */
const ID_CEF_OTRO = "cef-otro";

/**
 * Estado de la sección "Estudios que se solicitan". Es lo que el componente
 * de selección mantiene con useState y lo que el formulario envía.
 */
export type SeleccionEstudios = {
  /** Ids de `catalogo_estudios` marcados con checkbox (sin la tomografía). */
  estudios: string[];
  /** Solo aplica a Periapical. Default 'sensor', igual que el mockup. */
  tipoCaptura: TipoCaptura;
  /** Solo Periapical: dientes en nomenclatura FDI. */
  dientesFdi: string[];
  /** Solo Cefalometría "Otro". */
  cefOtroTexto: string;
  /** Campo de visión de Tomografía 3D; null = no se pidió tomografía. */
  fov: string | null;
  /** Solo si el FOV elegido pide zona (hoy, 5x5). */
  zona: string;
  /** Qué paquetes clickeó el doctor (para el estado visual de los botones). */
  paquetesActivos: string[];
};

/** Estado inicial del panel de estudios (formulario vacío). */
export const SELECCION_VACIA: SeleccionEstudios = {
  estudios: [],
  tipoCaptura: "sensor",
  dientesFdi: [],
  cefOtroTexto: "",
  fov: null,
  zona: "",
  paquetesActivos: [],
};

/**
 * Un elemento del arreglo `solicitudes_orden.estudios` (jsonb). La forma la
 * declara la migración 20260902120000_solicitudes_orden.sql, y
 * `aprobar_solicitud_orden()` la convierte en una fila de `orden_estudios`.
 */
export type EstudioSolicitud = {
  estudio_id: string;
  dientes_fdi?: string[];
  tipo_captura?: TipoCaptura;
  fov?: string;
  zona?: string;
  nota_libre?: string;
};

/* ============================================================
   Catálogo plano (para buscar un estudio por id sin recorrer
   las categorías a mano cada vez)
   ============================================================ */

const CATALOGO_PLANO: EstudioCatalogo[] = STUDY_CATEGORIES.flatMap((cat) => cat.items);

export function buscarEstudio(id: string): EstudioCatalogo | undefined {
  return CATALOGO_PLANO.find((item) => item.id === id);
}

/** ¿El FOV elegido pide además una "Zona"? (hoy solo 5x5). */
export function fovPideZona(fov: string | null): boolean {
  if (!fov) return false;
  return TOMOGRAFIA_FOV.find((f) => f.value === fov)?.zona === true;
}

/**
 * ¿Este estudio se entrega en físico? Periapical es el caso especial: solo
 * cuando el doctor eligió RX (con sensor es digital).
 */
export function esEntregaFisica(item: EstudioCatalogo, tipoCaptura: TipoCaptura): boolean {
  if (item.entregaFisica === true) return true;
  if (item.entregaFisica === "si-rx") return tipoCaptura === "rx";
  return false;
}

/* ============================================================
   Paquetes de selección rápida
   ============================================================ */

/**
 * Recalcula qué paquetes siguen "activos" después de un cambio en la
 * selección. Un paquete solo se APAGA aquí (si el doctor destildó a mano uno
 * de sus estudios, o le quitó el FOV); **nunca se prende solo**.
 *
 * Prenderlo requiere un click explícito, que es lo que mete su id en
 * `paquetesActivos`. Esto arregla un bug real ya visto en el mockup
 * (2026-08-26): los estudios de Diagnóstico son un subconjunto exacto de los
 * de Ortodoncia, así que inferir el estado "activo" comparando checkboxes
 * encendía Diagnóstico solo con marcar Ortodoncia, sin haberlo clickeado.
 */
export function recalcularPaquetesActivos(sel: SeleccionEstudios): string[] {
  return sel.paquetesActivos.filter((id) => {
    const paquete = PAQUETES.find((p) => p.id === id);
    if (!paquete) return false;
    const todosMarcados = paquete.items.every((itemId) => sel.estudios.includes(itemId));
    const fovOk = !paquete.fov || sel.fov === paquete.fov;
    return todosMarcados && fovOk;
  });
}

/**
 * Componentes de entrega física que incluye un paquete: se derivan del
 * catálogo (sus `items` con `entregaFisica === true`) más lo que el paquete
 * declare aparte en `entregaFisicaExtra` — p. ej. la guía quirúrgica de
 * Implantología, que no es un estudio marcable y por eso no se puede derivar.
 */
export function etiquetasEntregaFisicaPaquete(paquete: Paquete): string[] {
  const delCatalogo = paquete.items
    .map((id) => buscarEstudio(id))
    .filter((item): item is EstudioCatalogo => item?.entregaFisica === true)
    .map((item) => item.label);
  return [...delCatalogo, ...(paquete.entregaFisicaExtra ?? [])];
}

/* ============================================================
   Construir el payload que se guarda en la BD
   ============================================================ */

/**
 * Selección del formulario → arreglo `estudios` de la solicitud.
 *
 * REGLA (docs/orden-de-estudio.md): la Tomografía 3D no tiene un control de
 * estudio propio en el formulario — se infiere de la selección de FOV. Por eso
 * aquí se SINTETIZA `{ estudio_id: 'tomografia-3d', fov, zona }` cuando hay un
 * FOV elegido. Sin esto, las órdenes de tomografía se registrarían sin su
 * `estudio_id` y la fila `'tomografia-3d'` de `catalogo_estudios` nunca se
 * usaría.
 */
export function construirEstudiosSolicitud(sel: SeleccionEstudios): EstudioSolicitud[] {
  const lista: EstudioSolicitud[] = sel.estudios.map((id) => {
    const estudio: EstudioSolicitud = { estudio_id: id };

    // Periapical: además del id, lleva los dientes y si fue sensor o RX.
    if (id === ID_PERIAPICAL) {
      estudio.dientes_fdi = sel.dientesFdi;
      estudio.tipo_captura = sel.tipoCaptura;
    }

    // Cefalometría "Otro": el texto que escribió el doctor.
    if (id === ID_CEF_OTRO) {
      estudio.nota_libre = sel.cefOtroTexto.trim();
    }

    return estudio;
  });

  // Tomografía 3D: sintetizada desde el FOV (ver la regla de arriba).
  if (sel.fov) {
    const tomografia: EstudioSolicitud = { estudio_id: ID_TOMOGRAFIA, fov: sel.fov };
    if (fovPideZona(sel.fov)) {
      tomografia.zona = sel.zona.trim();
    }
    lista.push(tomografia);
  }

  return lista;
}

/* ============================================================
   Validación
   ============================================================ */

export type ErroresEstudios = {
  /** No marcó ningún estudio ni eligió FOV. */
  sinEstudios: boolean;
  /** Marcó Periapical pero no eligió dientes. */
  faltanDientes: boolean;
  /** Marcó Cefalometría "Otro" pero no escribió la técnica. */
  faltaCefOtro: boolean;
  /** Eligió un FOV que pide zona (5x5) y la dejó vacía. */
  faltaZona: boolean;
};

/**
 * Mismas reglas que ya validaba el mockup en el navegador. La BD las vuelve a
 * validar al aprobar (trigger `validar_orden_estudio`), así que esto es para
 * que el doctor vea el error antes de enviar, no la única defensa.
 */
export function validarEstudios(sel: SeleccionEstudios): ErroresEstudios {
  return {
    sinEstudios: sel.estudios.length === 0 && !sel.fov,
    faltanDientes: sel.estudios.includes(ID_PERIAPICAL) && sel.dientesFdi.length === 0,
    faltaCefOtro: sel.estudios.includes(ID_CEF_OTRO) && sel.cefOtroTexto.trim() === "",
    faltaZona: fovPideZona(sel.fov) && sel.zona.trim() === "",
  };
}

/** ¿La selección tiene algún error? */
export function hayErroresEstudios(errores: ErroresEstudios): boolean {
  return Object.values(errores).some(Boolean);
}

/**
 * Resumen de la selección para mostrar en pantalla (p. ej. "Periapical + 3
 * más"). No se guarda en la BD: `Orden.tipoEstudio` se recalcula al leer,
 * desde `orden_estudios` (ver lib/mapeo-ordenes.ts).
 */
export function resumirSeleccion(sel: SeleccionEstudios): string {
  const etiquetas = sel.estudios.map((id) => buscarEstudio(id)?.label ?? id);
  if (sel.fov) {
    const fov = TOMOGRAFIA_FOV.find((f) => f.value === sel.fov);
    etiquetas.push(`Tomografía 3D — ${fov?.label ?? sel.fov}`);
  }
  return juntarEtiquetas(etiquetas);
}

/**
 * Mismo resumen, pero desde el `estudios` jsonb ya guardado en
 * `solicitudes_orden` (para la sección "En revisión" de "Mis órdenes").
 *
 * La tomografía se trata aparte porque su id NO está en `STUDY_CATEGORIES`
 * (no es un checkbox del formulario, ver ID_TOMOGRAFIA arriba): su etiqueta se
 * arma con el FOV guardado en la propia fila.
 */
export function resumirEstudiosSolicitud(estudios: EstudioSolicitud[]): string {
  const etiquetas = estudios.map((e) => {
    if (e.estudio_id === ID_TOMOGRAFIA) {
      const fov = TOMOGRAFIA_FOV.find((f) => f.value === e.fov);
      return `Tomografía 3D — ${fov?.label ?? e.fov ?? ""}`.trim();
    }
    return buscarEstudio(e.estudio_id)?.label ?? e.estudio_id;
  });
  return juntarEtiquetas(etiquetas);
}

/**
 * Detalle línea por línea de los estudios de una solicitud, para la pantalla
 * de revisión de Radyex: ahí no basta el resumen, hay que ver TODO lo que
 * pidió el doctor (dientes, sensor/RX, FOV, zona, técnica libre) antes de
 * aprobar.
 */
export type EstudioDetallado = { etiqueta: string; detalle: string | null };

export function detallarEstudiosSolicitud(estudios: EstudioSolicitud[]): EstudioDetallado[] {
  return estudios.map((e) => {
    if (e.estudio_id === ID_TOMOGRAFIA) {
      const fov = TOMOGRAFIA_FOV.find((f) => f.value === e.fov);
      const partes = [`FOV ${fov?.label ?? e.fov ?? "?"}`];
      if (e.zona) partes.push(`zona: ${e.zona}`);
      return { etiqueta: "Tomografía 3D", detalle: partes.join(" · ") };
    }

    const etiqueta = buscarEstudio(e.estudio_id)?.label ?? e.estudio_id;
    const partes: string[] = [];
    // 'sensor' | 'rx' vienen en minúscula (formato de la BD); aquí se
    // muestran capitalizados porque es texto para leer, no un valor.
    if (e.tipo_captura) partes.push(e.tipo_captura === "rx" ? "RX" : "Sensor");
    if (e.dientes_fdi?.length) partes.push(`dientes: ${e.dientes_fdi.join(", ")}`);
    if (e.nota_libre) partes.push(e.nota_libre);

    return { etiqueta, detalle: partes.length > 0 ? partes.join(" · ") : null };
  });
}

/** "A", "A + B", o "A + N más" a partir de 3. */
function juntarEtiquetas(etiquetas: string[]): string {
  if (etiquetas.length === 0) return "";
  if (etiquetas.length <= 2) return etiquetas.join(" + ");
  return `${etiquetas[0]} + ${etiquetas.length - 1} más`;
}
