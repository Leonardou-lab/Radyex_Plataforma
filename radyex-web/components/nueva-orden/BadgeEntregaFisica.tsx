import { Package } from "lucide-react";

/** Texto del tooltip, igual que en el mockup. */
const TOOLTIP = "Este estudio no se digitaliza; se entrega en físico y el paciente lo recoge.";

/**
 * Aviso INFORMATIVO (no es un error) para estudios que no se digitalizan: el
 * paciente los recoge en físico aunque la orden diga "Digital"
 * (docs/orden-de-estudio.md § Entrega física).
 *
 * Qué estudios lo llevan NO se decide aquí: sale del flag `entregaFisica` del
 * catálogo (`lib/data.ts`), vía `esEntregaFisica()`. Nada hardcodeado por
 * pantalla.
 */
export function BadgeEntregaFisica() {
  return (
    <span className="badge-entrega-fisica" title={TOOLTIP}>
      <Package size={12} strokeWidth={2} />
      Entrega física
    </span>
  );
}
