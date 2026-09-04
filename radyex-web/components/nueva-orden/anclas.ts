/**
 * Ids de los puntos del formulario de "Nueva orden" a los que se puede llevar
 * la vista cuando el envío falla por validación.
 *
 * Viven en un módulo aparte para que el formulario y los paneles usen la
 * MISMA cadena: si estuvieran escritos a mano en cada archivo, renombrar uno
 * rompería el scroll en silencio (no falla el build, simplemente deja de
 * encontrar el elemento).
 *
 * Se resuelven con `document.getElementById` en vez de refs de React para no
 * tener que encadenar una prop `ref` a través de tres niveles de componentes
 * por un efecto que es puramente visual.
 */
export const ANCLAS = {
  /** Grupo de pills Impreso/Digital. No es enfocable: se resalta. */
  entrega: "ancla-entrega",
  /** Panel de paciente: se enfoca el primer input que tenga dentro. */
  paciente: "ancla-paciente",
  /** Panel de estudios completo (cuando no se marcó ninguno). */
  estudios: "ancla-estudios",
  /** Subpanel de Periapical. Los dientes son botones: se resalta. */
  periapical: "ancla-periapical",
  /** Campo de texto de Cefalometría "Otro". */
  cefOtro: "ancla-cef-otro",
  /** Campo de zona de la tomografía (solo con FOV 5×5). */
  zona: "ancla-zona",
} as const;
