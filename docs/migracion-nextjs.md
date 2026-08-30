# Migración a Next.js — estrategia y estado

El prototipo estático (HTML/CSS/JS en `assets/`) queda como **referencia visual y de
datos**. El producto real se construye en Next.js reusando ese diseño ya aprobado. La
migración es **por fases y por pantalla**, no de un solo golpe: el objetivo es que
Leonardo (dev junior) entienda cada pieza que entra, no acumular código sin revisar.

Stack objetivo (de CLAUDE.md): Next.js (App Router) + TypeScript + Tailwind +
shadcn/ui · Supabase (datos + auth) · Cloudflare R2 (archivos) · Netlify.

Principio de TypeScript: mantenerlo **simple y legible** (tipos claros, sin genéricos
rebuscados). Si estorba más de lo que ayuda, se puede arrancar en JS.

---

## Fase 1 — Fundaciones + pantalla de referencia (en curso)

No toca Supabase, R2 ni auth. Deja el proyecto montado y UNA pantalla migrada como
plantilla entendible.

- Proyecto Next.js nuevo (p. ej. `radyex-web/`), sin mezclar con el mockup. El
  mockup NO se borra.
- Tokens de marca portados a variables CSS + tema de Tailwind: `--ink #34302F`,
  `--ink-soft #4A4543`, `--brand #6BCECF`, `--accent #1E8688`, `--accent-soft`, y los
  de estatus (warn/success/pending) igual que en el mockup. Lexend/Inter con
  `next/font`. Logos SVG copiados (`radyex-logo.svg`, `radyex-logo-white.svg`).
- Estructura con route groups `(radyex)` y `(doctor)`, cada uno con su layout y su
  sidebar. **Sidebar como UN componente reutilizable** con ítems por rol — elimina la
  duplicación que hoy está repetida en 10 pantallas. Layout responsivo (drawer móvil
  ≤640px) en el layout compartido.
- Catálogo y datos ficticios de `common.js` → módulo de datos tipado
  (`STUDY_CATEGORIES`, `TOMOGRAFIA_FOV`, `DIENTES_FDI`, `PAQUETES`, `SEED_DOCTORS`,
  `SEED_ORDERS`) + utilidades (`calcAge`, `daysUntilBirthday`). Las pantallas leen de
  este seed local por ahora.
- **Pantalla de referencia: "Mis órdenes" (vista Doctor)**, migrada end-to-end a
  componentes: `OrderList` (búsqueda + filtros con `useState`), `OrderCard`,
  `StatusPill`, `PatientModal` (pestañas por año). Comentada en español explicando
  props, estado y `.map`/`key`, para servir de patrón.

---

## Patrón para migrar el resto de pantallas (fases siguientes)

Una vez "Mis órdenes" es la plantilla, cada pantalla se migra igual:

1. Identificar los componentes reutilizables de la pantalla (tarjetas, pills, filas,
   modal) y sacarlos como componentes con props.
2. El estado local de UI (búsqueda, filtros, pestañas, pasos de formulario) con
   `useState`.
3. Leer del módulo de datos seed (aún no Supabase).
4. Verificar contra el mockup (mismo look y comportamiento) y a 390px de ancho.

Orden sugerido de migración: login/registro (cuando entre auth) → nueva orden + lista
→ subir archivo → ver/descargar archivos → módulo admin (usuarios, bitácora,
reportes) → buzón.

---

## Ganchos de backend ya sembrados en el mockup (no perder al migrar)

El front ya marca dónde va cada integración con `// TODO (backend)`:

- Registro real de la **bitácora** (append-only + RLS solo INSERT/SELECT, retención
  NOM-004). Requisito legal LFPDPPP, no opcional.
- Agregaciones reales de **Reportes** (queries sobre la tabla de órdenes).
- Envío del **buzón "Dudas o sugerencias"** al correo personal de Monse (nunca a una
  tabla que el personal pueda consultar).
- **Notificación de cumpleaños** de doctores al equipo admin.

---

## Restricciones

- UI y comentarios en español. Respetar la identidad de marca definida.
- No borrar el mockup; es la referencia.
- Cada fase actualiza `docs/PROGRESO.md`. Si la estructura del proyecto cambia,
  actualizar `CLAUDE.md`.
