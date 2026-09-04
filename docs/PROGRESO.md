# Estado del proyecto
Última actualización: 2026-09-04

## Hecho
- Prototipo estático navegable (HTML/CSS/JS plano, sin framework aún) con `index.html` selector de rol.
- Vista Radyex completa: inicio, órdenes, doctores (alta con modal), subir archivos, pacientes.
- Vista Doctor completa: inicio, mis órdenes, nueva orden, pacientes con sus archivos.
- Sistema de diseño base en `assets/css/styles.css`: variables navy/teal, tipografías Lexend/Inter, sidebar, chips de estatus.
- **Rebranding a la identidad del logo (2026-07-30):** paleta reemplazada en `:root` — negro cálido `--ink #231F20` (sidebar, botón primario, texto) y teal del logo `--brand #6BCECF` (ítem activo del menú, acentos) en vez del navy/teal anterior; `--accent #1E8688` (teal oscuro accesible) para enlaces/texto teal sobre blanco. Estatus (warn/success/pending) sin cambios. Todo color hardcodeado que quedaba (rgba de sombras, textos muted del sidebar, gradiente de `index.html`, etc.) se migró a las variables nuevas o a rgba neutros sobre negro — cero hex del esquema navy anterior sigue en `styles.css`.
- **Logo real en el sidebar** de las 11 pantallas (mismo `styles.css`/sidebar compartido) y en el hero de `index.html`, reemplazando el wordmark de texto. Alto ~34px en sidebar expandido (~52px en el hero de `index.html`), manteniendo aspect ratio; en el breakpoint de 880px el sidebar colapsa mostrando solo el ícono del logo (recorte por `overflow:hidden`, sin deformar).
  - **Los PNG entregados (`radyex-logo-white.png`, `radyex-logo.png`) tienen el fondo blanco "quemado" en el pixel (no transparente)** — se ven como una caja blanca sólida sobre el sidebar oscuro. No se usaron.
  - En su lugar se corrigió `assets/logo/radyex-logo.svg` (traía el mismo fondo blanco horneado como un `<path>` de fondo; se eliminó, y se ajustó el `viewBox` a la caja real del arte — traía márgenes vacíos enormes) y se generó `assets/logo/radyex-logo-white.svg` (misma geometría, tinta negra → blanca, teal intacto) para usarse sobre fondo oscuro. Ambos SVG quedan con transparencia real.
  - Pendiente con Monse/diseñador: re-exportar los PNG con transparencia real si se necesitan como raster en algún punto (p. ej. para un PDF de resultados que no soporte SVG); por ahora todo el sitio usa los SVG corregidos.
- Datos ficticios coherentes (doctores, pacientes de Puebla, folios `LN`/`TM` + fecha) en `assets/js/common.js`.
- Archivos de ejemplo anonimizados en `assets/ejemplos/`.
- Workflow de GitHub Pages (`jekyll-gh-pages.yml`) para publicar el prototipo estático.
- Reorganización en carpetas: solo `index.html` queda en la raíz; páginas movidas a `radyex/` y `doctor/`, estilos y script a `assets/css/` y `assets/js/`. Enlaces y rutas verificados sirviendo el sitio en local (todo 200 OK).
- **`docs/orden-de-estudio.md`**: transcripción del formato de papel real que llena el doctor, fuente de verdad del formulario de nueva orden.
- **`doctor/nueva-orden.html` reconstruido** para reflejar ese formato exacto:
  - Secciones "Datos del doctor" (prefilled desde el doctor en sesión: nombre, email, WhatsApp, indicaciones, entrega Impreso/Digital) y "Datos del paciente" (nombre, WhatsApp, fecha de nacimiento, email opcional — antes era edad/teléfono).
  - Estudios agrupados en las 6 categorías del papel (intraorales, extraorales, fotografías, modelos, cefalometría computarizada, tomografía 3D), renderizados dinámicamente desde `RADYEX.STUDY_CATEGORIES` en `common.js`.
  - Periapical: selector Sensor/RX + selección de dientes por nomenclatura FDI (infantil/adulto), igual que en el papel.
  - Cefalometría: incluye "Otro" con texto libre.
  - Tomografía 3D: tarjetas de FOV (16×9, 12×9, 8×9, 8×5, 5×5) cada una con su texto de ayuda; 5×5 pide "Zona" adicional.
  - Tres paquetes de selección rápida (Ortodoncia, Diagnóstico, Implantología) que marcan automáticamente los estudios que los componen; Implantología además añade una nota sobre la guía quirúrgica a "Indicaciones" (no es un estudio marcable).
  - Se quitaron "Prioridad" y "Fecha deseada" (no existen en el papel; decisión confirmada con el usuario).
  - No incluye parámetros de EzDent-i (CT/PANO/CEPH del técnico) — eso queda fuera del formulario del doctor, tal como indica el spec.
- `common.js`: catálogo de estudios centralizado (`STUDY_CATEGORIES`, `TOMOGRAFIA_FOV`, `DIENTES_FDI`, `PAQUETES`), `STUDY_TYPES` ahora se deriva de ese catálogo (usado por el `<select>` de `radyex/subir.html` sin cambios en ese archivo), y `calcAge()` para convertir fecha de nacimiento a edad. Los `studyType` de los datos semilla se renombraron para ser coherentes con el catálogo nuevo (p. ej. "Tomografía CBCT" → "Tomografía 3D — 12×9", "Serie periapical" → "Periapical").
- Flujo probado en navegador: llenado completo del formulario, validaciones condicionales (dientes requeridos si Periapical, texto requerido si "Otro", zona requerida si FOV 5×5), aplicación de paquete, envío y reflejo correcto en "Mis órdenes" (resumen tipo "Periapical + 7 más").

- **Correcciones de Monse, ronda 1 (2026-08-04)**, aplicadas sobre `docs/correcciones01.md`:
  1. **Fecha de nacimiento del doctor**: campo `type="date"` agregado al modal "Nuevo doctor" (`radyex/doctores.html`), junto a Consultorio/Clínica. Se guarda como `birthDate` en el objeto del doctor (`RADYEX.addDoctor`) y en los 4 doctores semilla de `common.js` (fechas ficticias coherentes, una de ellas — Dra. Patricia Núñez, 20 ago — cae dentro de los próximos 30 días desde hoy para que el widget de abajo tenga contenido de ejemplo). La notificación de cumpleaños al equipo admin **no se implementó**: queda un `// TODO (backend): notificar al equipo admin cuando llegue el cumpleaños de un doctor` en `radyex/doctores.html` justo después de `RADYEX.addDoctor(...)`. Como demostrativo (opcional del spec, sin lógica real) se agregó un widget "Próximos cumpleaños" en `radyex/inicio.html`, marcado con una etiqueta "Demostrativo", que lista doctores con cumpleaños en los próximos 30 días usando la nueva utilidad `RADYEX.daysUntilBirthday()` en `common.js` — es puro cálculo de fecha en el cliente, no dispara ningún aviso.
  2. **Color y logo del sidebar**: `--ink` de `#231F20` a `#34302F` y `--ink-soft` a `#4A4543` (resto de la paleta intacto). El logo del sidebar ahora vive dentro de un panel de fondo claro (`.brand-panel`, `--accent-soft`, esquinas redondeadas) y usa el SVG a color (`radyex-logo.svg`) en vez del blanco, a 42px de alto (antes 34px). En el sidebar colapsado de escritorio (≤880px) y en el drawer móvil se ajustó el recorte/tamaño del logo para mantener la proporción sin deformar.
  3. **Adaptación a móvil (≤640px)**: sidebar oscuro → drawer off-canvas con botón hamburguesa; se agregó una barra superior fija (`.mobile-topbar`: hamburguesa + logo sobre panel claro + avatar) y un overlay oscurecido que cierra el drawer al tocar fuera o al elegir una opción del menú (`RADYEX.initMobileNav()` en `common.js`, se autoinicializa si la página trae el marcado del drawer). Tarjetas de resumen a 1 columna, tarjetas de orden a ancho completo con el pill de estatus debajo del nombre (sin chevron), modales/detalle de paciente como hoja casi a pantalla completa con botón de cierre de 44px, formularios a una columna con inputs/botones/chips/acciones de ≥44px de alto, carta dental FDI con scroll horizontal contenido (sin desbordar la página). Marcado del drawer + panel del logo replicado de forma idéntica en las 10 pantallas con sidebar (`radyex/*.html`, `doctor/*.html`) vía script; `common.js` centraliza el JS del drawer para no duplicarlo por archivo.
     - Se probó en un iframe de 390px de ancho (proxy de un viewport de celular real, ya que la ventana del navegador de esta sesión no permitía redimensionar por debajo de su mínimo). Se encontraron y corrigieron dos bugs de layout reales durante la prueba: (a) insertar la barra móvil y el overlay como hijos directos de `.layout` (que es `display:flex` en fila para el layout de escritorio) hacía que la barra se estirara a la altura completa de la página — se corrigió forzando `.layout{flex-direction:column}` en el breakpoint móvil; (b) el scroll horizontal de la carta dental (`.tooth-row{overflow-x:auto}`) empujaba el ancho de toda la página porque los ítems de `.study-grid` (CSS Grid) no se encogen por debajo del contenido de sus hijos por defecto — se corrigió con `min-width:0` en los ítems del grid. Verificado sin overflow horizontal (`scrollWidth === clientWidth`) en las 11 pantallas a 390px.

- **Bitácora y Reportes (2026-08-04)**, aplicados sobre `docs/bitacora-y-reportes.md`, ambos solo en la vista Radyex (admin) — no aparecen en la vista Doctor:
  1. **`radyex/bitacora.html` (antes placeholder "Próximamente") construida como registro cronológico inverso** con datos ficticios coherentes con `SEED_ORDERS`/`SEED_DOCTORS` (folios, pacientes y doctores reales de la maqueta). Incluye los 6 tipos de evento del spec — alta/edición de doctor, subida de archivo, cambio de estatus, **visualización de archivo** y **descarga de archivo** (los dos eventos clave del requisito legal), y consulta de la propia bitácora — cada uno con su ícono Lucide (`user-plus`, `upload`, `refresh-cw`, `eye`, `download`, `shield`) y color distinto vía las variables de estatus existentes. Filtros combinables por acción (chips), usuario (`<select>` poblado desde los actores del log) y rango de fechas (Desde/Hasta). Etiquetada "Demostrativo" en el topbar, con un panel explicando que es de solo lectura. Catálogo de acciones (`LOG_ACTIONS`) y datos (`SEED_BITACORA`, 21 eventos) viven en `common.js`, expuestos como `RADYEX.getBitacora()`; ahí mismo queda el `// TODO (backend)` de que el registro real debe ser una tabla **append-only con RLS que solo permita INSERT y SELECT** (nunca UPDATE/DELETE), con retención NOM-004 (5 años).
  2. **`radyex/reportes.html` (nueva) con métricas de negocio**, separada de la bitácora a propósito (un panel en la página lo explica). 4 tarjetas KPI (total de estudios, tipo más solicitado, órdenes completadas, pedidas-sin-completar) + panel de desglose "Estudios por tipo" (barras horizontales) + panel "Doctores que más piden" (ranking) + gráfica de "Tendencia mensual" — barras 100% CSS/HTML propio, sin ninguna librería de gráficas. Selector de rango (Todo / últimos 30 días / últimos 90 días / 2025) filtra los KPIs, el desglose por tipo y el ranking; la tendencia mensual se calcula agrupando `RADYEX.getOrders()` por mes y queda fuera del selector de rango a propósito (con una nota en pantalla) porque colapsarla a un rango corto le quita sentido a "tendencia". Etiquetada "Demostrativo"; `// TODO (backend)` en el script señalando que las agregaciones reales deben salir de queries sobre la tabla de órdenes, no calcularse en el cliente. Agregada al sidebar de las 7 pantallas de Radyex (incluida ella misma); el sidebar de Doctor no se tocó.
  - Antes de darlo por terminado se detectó y corrigió un error propio: los íconos de las dos etiquetas "Demostrativo" y del panel de cumplimiento se habían escrito como `${RADYEX.ICONS.shield}` directamente en HTML estático (fuera de `<script>`), el mismo tipo de error de interpolación que ya se había cometido antes en `radyex/inicio.html` en la ronda de correcciones anterior — se reemplazaron por el SVG del ícono escrito literalmente, como en el resto del sidebar/topbar estático.
  - Verificado en navegador: ambas páginas sin errores de consola, filtros de la bitácora funcionando (chip de acción reduce de 21 a 3 eventos, etc.), selector de rango de reportes recalculando KPIs/desglose/ranking correctamente, y sin overflow horizontal en ninguna de las 12 pantallas del sitio a 390px (incluidas las 2 nuevas).

- **Tres cambios en la vista Doctor (2026-08-04)**, solo front end:
  1. **"Nueva orden" en el menú lateral del doctor**: se agregó como ítem fijo del sidebar (ícono `file-plus`) en las 5 pantallas de la vista Doctor, enlazando a `doctor/nueva-orden.html`. Antes solo se llegaba ahí por el botón del topbar/inicio; ahora también vive en el menú, igual que Inicio/Mis órdenes/Pacientes. `doctor/nueva-orden.html` marca "Nueva orden" como el ítem activo (antes, por un detalle heredado, esa pantalla marcaba "Mis órdenes" como activo sin serlo).
  2. **Buzón "Dudas o sugerencias" (`doctor/dudas.html`, nueva), solo en la vista Doctor**: ítem de menú con ícono `message-square`, formulario de Asunto + Mensaje con validación básica (ambos requeridos, mensaje ≥10 caracteres) y estado de confirmación "Tu mensaje fue enviado" con botón para enviar otro. El envío real **no se implementó**: hay un `// TODO (backend): enviar el mensaje... al correo personal de Monse` en el script, justo donde iría la llamada real — no se simula ningún envío ni se inventó una API falsa, solo se valida y se cambia el estado de la UI (mismo patrón que "Orden enviada" en `nueva-orden.html`, que tampoco tiene backend real). No aparece en ningún sidebar de la vista Radyex (verificado).
  3. **Opción de entrega (Digital/Físico) en la nueva orden**: el campo ya existía en `doctor/nueva-orden.html` de una ronda anterior (par de `radio-pill` "Impreso"/"Digital", validado, guardado como `entrega` en la orden nueva vía `RADYEX.addOrder`). Lo que faltaba y se agregó ahora es el campo `entrega` en las **10 órdenes semilla** de `common.js`, para que los datos ficticios existentes también sean coherentes con el campo (antes solo las órdenes creadas desde el formulario lo tenían).
  - **Incidente propio durante esta tarea, ya resuelto**: al limpiar después de un script de edición fallido, se corrió `git checkout --` sobre los 4 archivos de `doctor/*.html` sin revisar antes que eso revertiría cambios sin commitear de la tarea de adaptación móvil (drawer, panel del logo) hecha antes en esta misma sesión. Se detectó de inmediato (`grep` de `mobile-topbar` en cero) y se reconstruyó el marcado exacto reaplicando el mismo script de transformación ya usado en el resto del sitio, antes de continuar. Ninguna otra parte de esos 4 archivos se vio afectada (verificado por HTML parseable + contenido de formularios/scripts intacto). Lección: revisar `git status`/diff antes de cualquier `git checkout --` sobre archivos con cambios sin commitear, incluso "solo para limpiar".
  - Verificado en navegador: menú del doctor con los 5 ítems y estados activos correctos en cada pantalla, formulario de dudas con validación y confirmación funcionando, campo Entrega visible y operante en nueva orden, sin overflow horizontal en las 13 pantallas del sitio a 390px, y el drawer móvil confirmado visualmente (por captura de pantalla) abriendo correctamente en `doctor/dudas.html`.

- **Migración a Next.js — Fase 1 completa (fundaciones + pantalla de referencia), 2026-08-18.** Alcance y patrón en `docs/migracion-nextjs.md`. Se hizo:
  - Proyecto `radyex-web/` creado con `create-next-app` (App Router, TypeScript, Tailwind v4, ESLint, alias `@/*`) y `shadcn/ui` inicializado (`components.json`, estilo `base-nova`), sin mezclarse con el mockup estático (`assets/`, `radyex/`, `doctor/` siguen intactos como referencia, sin tocarse).
  - Tokens de marca portados a `app/globals.css`: variables CSS 1:1 del mockup (`--ink`, `--brand`, `--accent`, warn/success/pending, etc.) expuestas como utilidades de Tailwind vía `@theme` (Next 16 + Tailwind v4 usan CSS en vez de `tailwind.config.js`) y mapeadas a los slots semánticos de shadcn. Lexend + Inter cargadas con `next/font` (`--font-display` / `--font-sans`). Logos SVG y los PDFs de ejemplo copiados a `public/`.
  - `lib/data.ts`: módulo de datos tipado (semilla) — `SEED_DOCTORS`, `SEED_ORDERS`, `STUDY_CATEGORIES`, `TOMOGRAFIA_FOV`, `DIENTES_FDI`, `PAQUETES`, `calcAge`, `daysUntilBirthday`, `initials` — portado de `assets/js/common.js`, sin sessionStorage ni backend (las pantallas leen los arreglos directo).
  - `components/layout/`: `Sidebar` (un componente, ítems por rol en `nav-items.ts`), `MobileTopbar`, `SidebarShell` (estado del drawer móvil con `useState`). Route groups `app/(doctor)/` (URLs limpias: `/ordenes`, etc.) y `app/(radyex)/` (bajo `/admin/*`, para no chocar con nombres de pantalla repetidos entre las dos vistas — decisión documentada en `CLAUDE.md`). `(radyex)` solo tiene un placeholder en `/admin` por ahora.
  - `app/radyex-ui.css`: clases del sistema de diseño portadas del mockup (sidebar, botones, tarjetas de orden, chips, modal, drawer móvil), mismos nombres de clase que `assets/css/styles.css` — se extiende pantalla por pantalla en la fase 4.
  - **Pantalla de referencia "Mis órdenes" (vista Doctor)** migrada end-to-end en `components/ordenes/`: `OrderList` (búsqueda + filtros + estado del modal, todo con `useState`), `OrderCard`, `StatusPill`, `PatientModal` (pestañas por año), `FileViewerModal` (visor de PDF), `InfoItem`. Comentada en español explicando props/estado/`.map`+`key`, como plantilla para el resto de pantallas.
  - Íconos con `lucide-react` (componentes reales de Lucide, no SVG a mano).
  - Verificado en navegador (`npm run dev` y `npm run build`, ambos sin errores/warnings; `tsc --noEmit` y `eslint` limpios): portada con selector de rol, "Mis órdenes" con búsqueda/filtros/modal/visor funcionando, y sin overflow horizontal a 390px (confirmado con `scrollWidth === clientWidth`), incluido el drawer móvil y el modal como hoja de pantalla completa.
  - Bug encontrado y corregido en el camino: `initials()` sobre "Dra. Patricia Núñez" daba "DP" (tomaba el honorífico como palabra) en vez de "PN" como en el mockup — se filtran honoríficos (`Dr.`/`Dra.`) antes de calcular iniciales.
  - `CLAUDE.md` (raíz) actualizado con la estructura de `radyex-web/` (rutas, dónde vive cada cosa, convención de URLs por rol).

- **Badge "Entrega física" en el formulario de nueva orden (2026-08-19)**, solución validada con Monse sobre `docs/orden-de-estudio.md`. Aplicado en `doctor/nueva-orden.html` (la versión vigente del formulario — todavía no migrada a `radyex-web/`, ver fase 4 abajo):
  - No se quitó ningún estudio del formulario. Los que no se digitalizan (el paciente los recoge en físico, **siempre**, sin importar si la orden dice Impreso o Digital) llevan un badge sutil "Entrega física" (tokens `--pending`/`--pending-soft`, ícono Lucide `package`, tooltip vía `title`) — es informativo, no un error.
  - Dirigido por datos: cada ítem de `RADYEX.STUDY_CATEGORIES` en `assets/js/common.js` puede traer `entregaFisica: true` (siempre física: Oclusal, Superior, Inferior, Aleta de mordida, Papel fotográfico, Estudio y Trabajo de modelos) o `entregaFisica: "si-rx"` (caso especial de Periapical: física solo si el doctor elige RX, con Sensor es digital — el badge se conecta al mismo listener que ya alternaba los pills Sensor/RX). `nueva-orden.html` solo lee esos flags para pintar el badge, nada hardcodeado por pantalla.
  - Los paquetes (`RADYEX.PAQUETES`) muestran una nota "Incluye entrega física: …" derivada automáticamente de sus `items` (para que no se desactualice si cambia el catálogo); Implantología además declara `entregaFisicaExtra: ["Guía quirúrgica"]` porque la guía quirúrgica no es un estudio marcable con checkbox propio, solo una nota de texto — no se puede derivar de `items`.
  - Mismos flags portados a `radyex-web/lib/data.ts` (`EstudioCatalogo.entregaFisica`, `Paquete.entregaFisicaExtra`) para que la regla no se pierda cuando se migre esta pantalla en la fase 4, aunque hoy ese módulo todavía no tiene una pantalla de "nueva orden" que lo use.
  - Regla de dominio documentada en `docs/orden-de-estudio.md` (nueva sección "Entrega física").
  - Verificado en navegador: los 7 estudios/badges esperados se muestran (y ninguno de más), el badge de Periapical aparece/desaparece correctamente al alternar Sensor/RX, tooltip correcto, sin errores de consola y sin overflow horizontal a 390px.

- **Fix: los botones de paquete (Ortodoncia/Diagnóstico/Implantología) no se podían desseleccionar (2026-08-19)**, reportado por el usuario en `doctor/nueva-orden.html`. El listener de click solo marcaba checkboxes (`if (!chk.checked) chk.checked = true`), nunca los desmarcaba, así que un segundo click sobre un paquete ya activo no hacía nada. Ahora el click alterna según `btn.classList.contains('active')`: si ya estaba activo, desmarca sus estudios, desmarca el FOV que hubiera marcado, y quita la línea de `nota` que hubiera agregado a Indicaciones (si no estaba activo, hace lo de siempre: marcar todo). Verificado en navegador: seleccionar → desseleccionar Ortodoncia e Implantología limpia checkboxes, FOV e Indicaciones correctamente, sin errores de consola.

- **Mockup aprobado por Monse + respuestas sobre perfiles y accesos (2026-08-24).**
  Monse aprobó el mockup completo (front end estático + fase 1 de Next.js) y respondió
  las preguntas pendientes de perfiles/accesos que bloqueaban el diseño de auth/RLS.
  Documentado en el nuevo `docs/perfiles-y-acceso.md` (fuente de verdad) y reflejado
  en `docs/roadmapp.md` (compuertas resueltas, fases 2/3/6 actualizadas, nueva sección
  de mejoras futuras) y `docs/bitacora-y-reportes.md` (visibilidad solo-admin
  confirmada, campo de "quién subió" en el evento de subida de archivo). Sin cambios
  de código en esta ronda — es documentación/planeación.

  **Decisiones cerradas:**
  - 3 roles: Administrador (Monse, ve todo incluida bitácora completa), Equipo Radyex
    (2 usuarios, sin bitácora legal completa, cada subida de archivo registra qué
    persona del equipo la hizo), Doctor (sin cambios respecto al mockup).
  - Alta de doctor: registro no abierto, doble filtro liga + aprobación del
    Administrador (el equipo no aprueba altas).
  - Cambios a perfiles de doctor/paciente por sensibilidad de campo: menores
    (teléfono, correo, dirección) el equipo los aplica directo; sensibles (nombres,
    estudios, órdenes) requieren aprobación de Monse vía mecánica de "solicitud
    pendiente + aviso a Monse" — la misma mecánica se reutiliza para aprobar altas de
    doctor, se construye una sola vez.
  - Bitácora legal completa: visibilidad solo-Administrador, el equipo Radyex no la ve.
  - Baja de doctor: se desactiva, nunca se borra; expedientes de pacientes se
    conservan por NOM-004 (5 años).

  **Preguntas abiertas (bloquean partes puntuales del diseño, no todo el backend):**
  - Pacientes compartidos entre doctores: falta confirmar si "solo el que pide el
    doctor" significa que cada doctor solo ve sus propias órdenes sobre un paciente
    (sin compartir expediente), y cómo se reconoce internamente al mismo paciente que
    regresa con otro doctor. Bloquea el diseño final de las tablas de paciente y RLS
    (fase 2/3).
  - Alcance del respaldo .rar al desactivar un doctor (qué incluye, a qué correo se
    envía). No bloquea fases 2-5, solo el detalle de la fase 6.

  **Features nuevas agendadas como mejoras futuras** (no en el núcleo, después del
  backend base): semáforo de actividad del doctor por fecha de último estudio
  (rojo/naranja/verde), y el respaldo .rar + envío por correo al desactivar un doctor.

- **Pacientes compartidos entre doctores — decisión cerrada (2026-08-24).** La
  pregunta abierta de la entrada anterior quedó resuelta y documentada en
  `docs/perfiles-y-acceso.md`: un paciente es una sola fila (expediente maestro,
  dueño Radyex), lo que pertenece a cada doctor son las órdenes (`doctor_id` en la
  orden, no en el paciente). El doctor ve solo sus propias órdenes/estudios sobre un
  paciente; Radyex ve el expediente completo y deriva la lista de doctores que lo
  refieren de los `doctor_id` distintos en sus órdenes. El paciente que regresa lo
  vincula/crea el equipo de Radyex al procesar la orden (detalle de flujo interno,
  no bloquea el esquema). Sin este documento ya no queda ninguna pregunta abierta
  bloqueando el diseño de las tablas de paciente/orden ni las políticas de RLS de
  doctor — solo sigue pendiente el alcance del respaldo .rar (fase 6, no bloquea
  fase 2).

- **Esquema SQL propuesto para Supabase (2026-08-24 a 2026-08-26), PROPUESTA sin
  aplicar.** Dos migraciones nuevas en `radyex-web/supabase/migrations/`, ninguna
  corrida contra un proyecto real (no hay `supabase/config.toml` todavía — falta
  `supabase init`, y no se ha corrido `supabase db push`):
  - `20260824120000_esquema_inicial.sql`: tablas de `usuarios`/`doctores`/`pacientes`/
    `ordenes`/`orden_estudios`/`archivos`/`bitacora`/`solicitudes_pendientes` +
    catálogo de estudios, coherente con `docs/perfiles-y-acceso.md`,
    `docs/orden-de-estudio.md` y `docs/bitacora-y-reportes.md`. Incluye políticas de
    RLS por rol, funciones auxiliares (`es_admin()`, `es_equipo()`, etc.), la mecánica
    de `solicitudes_pendientes` con una función `aprobar_solicitud()` de referencia, y
    triggers que escriben en la bitácora los 4 eventos que sí son escrituras de base
    de datos (alta/edición de doctor, subida de archivo, cambio de estatus).
  - `20260824120100_catalogo_estudios_seed.sql`: semilla del catálogo de
    estudios/FOV/paquetes, transcrita de `docs/orden-de-estudio.md`/`lib/data.ts`.
  - **Correcciones aplicadas sobre el esquema inicial** (mismo archivo, sin migración
    nueva encima, porque nada se había aplicado todavía):
    1. `ultimo_acceso` de un doctor era inescribible con las políticas de RLS
       originales (un doctor no puede editar su propia fila) — se agregó la función
       `registrar_acceso()` (`SECURITY DEFINER`) como única vía de escritura, para que
       la app la invoque tras el login (fase 3+).
    2. El trigger `trg_bitacora_edicion_doctor` disparaba en cualquier `UPDATE` de
       `doctores`, así que cada login (que ahora toca `ultimo_acceso`) hubiera metido
       un evento falso de "edición de doctor" en la bitácora legal — se restringió a
       columnas de negocio (`especialidad, consultorio, telefono, nombre_usuario,
       estatus, fecha_nacimiento`), excluyendo `ultimo_acceso`.
    3. La política de `INSERT` en `bitacora` solo validaba `usuario_id = auth.uid()`,
       lo que permitía que un doctor insertara desde el navegador eventos falsos de
       cualquier tipo (p. ej. `alta_doctor`). Se restringió a que un cliente solo
       pueda auto-registrar eventos de **lectura** (`visualizacion_archivo`,
       `descarga_archivo`, y `consulta_bitacora` solo si es admin) — los eventos de
       escritura ya los meten los triggers `SECURITY DEFINER`, que no pasan por esta
       política.
    4. `validar_orden_estudio()` hardcodeaba `fov = '5x5'` para exigir "Zona" — se
       hizo data-driven, consultando el flag `catalogo_fov.requiere_zona`.
  - **Revisión de seguridad (2026-08-26), sin cambios de código** — confirmó que las
    4 correcciones anteriores quedaron aplicadas correctamente, y detectó que
    `ultimo_acceso` **no existe en `pacientes`** (solo en `doctores`) — si se necesita
    rastrear el último acceso de un paciente, esa columna/función/política falta por
    completo. Ver "Pendiente" abajo.
  - **Corrección al contenido de `paquete_estudios` (2026-08-26)**, confirmada por
    Monse: cada paquete debe pre-marcar su contenido **completo** (el doctor
    desmarca/cambia después), no un subconjunto. Se agregó "Trabajo" (modelos) a
    Ortodoncia y Diagnóstico, y "Estudio" + "Trabajo" (modelos) a Implantología, que
    antes no marcaba ningún modelo pese a que el papel siempre los incluyó. Detalle en
    `docs/orden-de-estudio.md` § "Contenido exacto pre-marcado por paquete". El mockup
    (`assets/js/common.js`) y `radyex-web/lib/data.ts` (`PAQUETES`) **no se tocaron**
    y quedaron desalineados con esta regla — ver "Pendiente".

- **Fix: al elegir el paquete Ortodoncia también se encendía el botón de Diagnóstico
  (2026-08-26)**, reportado por el usuario en `doctor/nueva-orden.html`. Causa: el
  estado "activo" de un botón de paquete se infería comparando checkboxes (¿están
  todos los suyos marcados?), y los estudios de Diagnóstico son un subconjunto exacto
  de los de Ortodoncia (Panorámica, Foto digital, Modelo estudio) — al marcar
  Ortodoncia, Diagnóstico quedaba "cumplido" sin que lo hubieran clickeado. Se
  reemplazó esa inferencia por un `Set` (`paquetesActivos`) que registra qué paquetes
  clickeó el doctor: un botón solo se prende por click explícito; `updatePackageStates()`
  ahora solo puede **apagarlo** (si el doctor destilda uno de sus estudios a mano, o si
  otro paquete que compartía un estudio se desactiva y se lo lleva), nunca prenderlo
  por inferencia. Cada paquete sigue siendo personalizable de forma independiente.
  Verificado en el navegador (servidor local temporal): click en Ortodoncia ya no
  enciende Diagnóstico; activar ambos por separado y luego apagar Ortodoncia apaga
  también Diagnóstico solo si pierde alguno de sus propios estudios compartidos, no si
  sus estudios exclusivos siguen completos; sin errores de consola. Cambio acotado a
  `doctor/nueva-orden.html` — `radyex-web/lib/data.ts` todavía no tiene pantalla de
  "nueva orden" (fase 4 pendiente), así que no aplicaba ahí.

- **Fase 3 — conexión front↔Supabase confirmada + refresco de sesión
  (2026-08-27).** Los dos clientes de `radyex-web/lib/` (`client.ts` para
  Client Components con `createBrowserClient`, `server.ts` para Server
  Components/Actions con `createServerClient` y `getAll`/`setAll` sobre
  `next/headers`) quedaron probados y funcionando, leyendo
  `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` de `.env.local`.
  Se agregó `radyex-web/proxy.ts` (en la raíz del proyecto, junto a
  `package.json`) que refresca la sesión de Supabase en cada petición:
  reconstruye el cliente de servidor con cookies de request/response,
  reescribe las cookies renovadas tanto en `request` como en el `response`
  que finalmente se devuelve (para no perderlas), y llama
  `supabase.auth.getUser()` sin nada intercalado en medio (rompe la sesión si
  se mete código entre la creación del cliente y esa llamada). Excluye del
  `matcher` los assets de Next, el favicon y las imágenes estáticas.
  **Nota de nomenclatura:** el proyecto corre Next.js 16.3.1, que renombró la
  convención `middleware.ts`/`middleware()` a `proxy.ts`/`proxy()`
  (`middleware.ts` sigue funcionando pero está deprecado) — por eso el
  archivo se llama `proxy.ts` y no `middleware.ts`, con el mismo patrón
  oficial de Supabase por dentro.

- **Fase 3 — pantalla de login (2026-08-27).** `radyex-web/app/login/page.tsx`
  (Server Component, Card/Input/Label/Button de shadcn + iconos Lucide, lee
  `searchParams.error` y lo muestra arriba del formulario) y
  `radyex-web/app/login/actions.ts` con dos Server Actions: `login`
  (`signInWithPassword`; error → `redirect('/login?error=...')` con mensaje
  genérico, sin distinguir motivo por seguridad) y `logout` (`signOut()` +
  `redirect('/login')`). El botón "Salir" placeholder que ya existía al fondo
  del Sidebar (`components/layout/Sidebar.tsx`) se conectó a la Server Action
  `logout` real (antes era un `<Link href="/">` de relleno). Probado en
  navegador de punta a punta: credenciales falsas → error visible; entrar y
  salir con el usuario de prueba, funcionando.

- **Fase 3 — protección de rutas por rol (2026-08-28).** Cierra el corazón de
  la Fase 3 (login + RLS + rutas por rol):
  - `radyex-web/lib/auth.ts` (nuevo): helper de servidor
    `obtenerUsuarioConRol()` — llama `supabase.auth.getUser()` y, si hay
    sesión, lee `rol` de `public.usuarios` por `id` (permitido por la policy
    "cada quien ve su propia fila de usuario"). Si la fila no existe o la
    consulta falla, devuelve `rol: null` en vez de lanzar — nunca tumba el
    layout que lo llama. También expone `rutaInicioPorRol()` (doctor →
    `/ordenes`, admin/equipo_radyex → `/admin`, sin rol → `/login`).
  - `app/(doctor)/layout.tsx` y `app/(radyex)/layout.tsx`: guardia de acceso
    en el servidor. Sin sesión → `/login`; sesión sin fila/rol en
    `usuarios` (cuenta "huérfana") → `/cuenta-no-configurada`; rol
    equivocado para la zona → `/sin-acceso`. Un solo chequeo por layout
    cubre todas las pantallas del route group, no se repite por página.
    `(doctor)` exige rol `doctor`; `(radyex)` exige `admin` o
    `equipo_radyex` (bloquea `doctor`).
  - **Nota para la Fase 4:** hoy `(radyex)` solo tiene el placeholder de
    `/admin`, así que el layout de esa zona deja pasar a Equipo Radyex y
    Administrador por igual. La restricción más fina ("esta pantalla es
    solo del Administrador" — bitácora legal completa, doctores, reportes,
    ver `docs/perfiles-y-acceso.md`) **no está implementada todavía**: se
    agrega cuando esas pantallas existan, con un layout anidado dentro de
    esas rutas específicas (p. ej. `app/(radyex)/admin/bitacora/layout.tsx`),
    sin tocar el layout general de la zona.
  - `app/login/actions.ts`: la redirección tras login exitoso ya no es fija
    a `/ordenes` — lee el rol con `obtenerUsuarioConRol()` y usa
    `rutaInicioPorRol()`; sin rol, manda a `/cuenta-no-configurada`.
  - `app/cuenta-no-configurada/page.tsx` (nuevo) y `app/sin-acceso/page.tsx`
    (nuevo): pantallas fuera de los layouts protegidos (si estuvieran
    adentro, el propio guardia las volvería a rebotar ahí mismo → bucle
    infinito). Ambas con botón "Cerrar sesión"; `sin-acceso` además tiene
    "Ir a mi inicio" (usa `rutaInicioPorRol()`, cae a `/login` si no hay rol).
  - Probado en navegador: sin sesión, `/ordenes` y `/admin` responden
    307 → `/login`. Con la sesión real de prueba (rol Equipo Radyex/Admin):
    `/admin` carga el panel, `/ordenes` rebota a `/sin-acceso` con "Ir a mi
    inicio" apuntando a `/admin`. `npm run build` y `eslint` limpios.

- **Fase 3 — renombrado de campos a español (2026-08-28).** Todos los
  campos de `radyex-web/lib/data.ts` (`Doctor`, `Orden`, `ArchivoOrden`) se
  renombraron de inglés a español, alineados 1:1 con las columnas reales
  de la BD (`radyex-web/supabase/migrations/20260824120000_esquema_inicial.sql`),
  para no tener que renombrar otra vez al conectar datos reales en la fase
  4. `EstatusOrden` pasó a los valores del enum real (`pendiente`/
  `en_proceso`/`finalizado`); se agregó `EstatusVisual` como capa aparte
  para no tocar las clases CSS del sistema de diseño (que siguen en inglés:
  `success`/`warn`/`pending`). Se eliminó `priority` (sin columna en la BD
  y sin uso en ningún componente). Spec completa, con los campos
  calculados/display que no tienen columna propia (p. ej. `iniciales`,
  `edad`, `archivos`) y dos notas importantes (`nombreCompleto`/`correo`
  del doctor viven en `usuarios`, no en `doctores`; `src` de un archivo
  necesita URL firmada en fase 5, no es un rename directo de `ruta_r2`),
  documentada en **`docs/mapeo-campos.md`**. `npm run build` y `eslint`
  limpios; `/ordenes` sigue viéndose igual (verificado por revisión
  exhaustiva de referencias, ya que la pantalla exige sesión de doctor).

- **Fase 3 — `registrar_acceso()` enganchada al login del doctor
  (2026-08-28), VERIFICADO EN VIVO.** `app/login/actions.ts` llama
  `supabase.rpc('registrar_acceso')` justo después de resolver el rol y
  antes del redirect final (si se llama después del `redirect()`, nunca se
  ejecuta — `redirect()` corta lanzando), y solo cuando `rol === 'doctor'`
  (Equipo Radyex/Administrador no tienen `ultimo_acceso` en `doctores`). La
  llamada va en `try/catch`: si el RPC falla, se hace `console.error` y el
  login sigue de todos modos — estampar el acceso es secundario, nunca debe
  bloquear la entrada. **Confirmado con un doctor real que el timestamp
  `ultimo_acceso` en `public.doctores` se actualiza correctamente al hacer
  login.**

- **FASE 3 (Auth + RLS) — COMPLETA (2026-08-28).** Los dos clientes de
  Supabase, `proxy.ts`, el login real con landing por rol, la protección de
  rutas por rol (con los casos huérfano y sin-acceso resueltos), el
  renombrado de campos a español, y `registrar_acceso()` verificado en vivo
  — todo lo de arriba junto cierra el corazón de la Fase 3 tal como la
  describe `docs/roadmapp.md`. Sigue la Fase 4 (ver "Pendiente").

- **`/ordenes` (vista Doctor) conectada a datos REALES de Supabase
  (2026-08-30).** Último pendiente de la Fase 3. La pantalla se ve y se
  comporta igual; lo único que cambió es la fuente de datos: ya no lee
  `SEED_ORDERS` de `lib/data.ts`, sino la BD vía consulta-en-servidor +
  `mapearOrden`. Es el MOLDE que copian las pantallas de la Fase 4.
  - `app/(doctor)/ordenes/page.tsx` pasó de Server Component síncrono (leía
    el seed) a **Server Component `async`**: crea el cliente con
    `lib/server.ts`, consulta `ordenes` con join a `pacientes` y a
    `orden_estudios` / `catalogo_estudios` / `catalogo_fov`, ordena por
    `fecha_solicitud` desc, y pasa el arreglo ya mapeado por props a
    `OrderList`. `OrderList` y el resto de componentes visuales
    (`OrderCard`, `StatusPill`, `PatientModal`, `InfoItem`,
    `FileViewerModal`) **no se tocaron**.
  - **No se filtra por doctor en el código**: se confía en la RLS
    (`doctor_id = auth.uid()`, policy "un doctor ve solo sus propias
    ordenes"). Vacío sin error = ese doctor no tiene órdenes, no es bug.
    `OrderList` ya muestra su estado vacío con `orders = []` sin tronar.
  - `app/(doctor)/ordenes/mapeo.ts` (nuevo): función pura
    `mapearOrden(filaDB) => Orden` con el mapeo columna→prop comentado en
    español (folio, `pacientes.nombre_completo`, `calcAge` sobre
    `fecha_nacimiento` para la edad, `pacientes.created_at` →
    "Paciente desde", resumen de `orden_estudios` + FOV → "Tipo de
    estudio", etc.). Reutiliza `calcAge` e `initials` de `lib/data.ts`.
    Cada pantalla de la Fase 4 tendrá su propio `mapeo.ts` con esta forma.
  - **Archivos por año del modal de paciente NO conectados** (viven en
    Cloudflare R2, fase 5): `mapearOrden` deja un solo año — el de la
    solicitud — con lista vacía, que es la forma que `PatientModal` ya
    sabe mostrar ("Aún no hay archivos cargados para 2025."). Marcado con
    `// TODO (fase 5 - R2)` en `mapeo.ts`.
  - **Cambio de comportamiento que quedó pendiente en esta ronda:** "Doctor
    referente" en `PatientModal` se resolvía con
    `getDoctorById(order.doctorId)` contra `SEED_DOCTORS`; con `doctor_id`
    real (uuid) esa búsqueda no encontraba nada y el campo mostraba "—".
    **Resuelto el 2026-08-30 — ver la entrada siguiente.**
  - Detalle menor: la fecha se formatea con `toLocaleDateString("es-MX")`
    y el FOV sale de `catalogo_fov.etiqueta` ("12 × 9"), así que el texto
    puede diferir mínimamente de la semilla escrita a mano ("12×9",
    "dic" vs "dic."). La BD es ahora la fuente de verdad.
  - `npm run build` y `eslint` limpios; `/ordenes` queda como ruta
    dinámica (`ƒ`), server-rendered on demand.

- **"Doctor referente" del modal de `/ordenes` ya sale de datos reales
  (2026-08-30).** Cierra el "—" que había quedado de la conexión anterior:
  - `app/(doctor)/ordenes/page.tsx`: la consulta suma un join de dos saltos
    `ordenes.doctor_id → doctores → usuarios` (`doctores ( usuarios (
    nombre_completo ) )`) — el nombre del doctor no vive en `doctores` sino
    en `usuarios.nombre_completo`. El resto de la consulta no cambió. La RLS
    deja pasar el join porque, en la vista del doctor, cada `doctor_id` es
    él mismo (policies "un doctor ve su propia fila" en `doctores` y
    `usuarios`).
  - `app/(doctor)/ordenes/mapeo.ts`: `mapearOrden` devuelve un campo nuevo
    `doctorNombre: string` con ese nombre; respaldo `"—"` si viniera nulo.
  - `components/ordenes/PatientModal.tsx`: "Doctor referente" se lee de
    `order.doctorNombre` en vez de `getDoctorById(order.doctorId)`. Se quitó
    el import de `getDoctorById` de este archivo. `OrderList`/`OrderCard`
    NO se tocaron — el campo viaja en el objeto `order` que ya se pasa tal
    cual al modal.
  - `lib/data.ts`: se agregó `doctorNombre?: string` (opcional) al tipo
    `Orden`, para que `SEED_ORDERS` siga compilando sin cambios.
  - `getDoctorById` ya no lo usa ningún componente directamente (queda vivo
    solo dentro de `lib/data.ts`). No se borró; ver la limpieza anotada en
    la entrada del Bloque 0, más abajo.
  - `npm run build` y `eslint` limpios.

- **Fase 4 · Bloque 0 — Cimientos (2026-08-31).** Groundwork antes de migrar
  pantallas nuevas; sin UI nueva. Plan en `docs/migracion-nextjs.md`.
  - **0.1 Sidebar con sesión real.** `components/layout/Sidebar.tsx` y
    `SidebarShell.tsx` ya no leen la semilla (`getCurrentDoctor` /
    `getOrdersByDoctor` / `getUsuarioSidebar`, eliminada): reciben un prop
    `usuario: UsuarioSidebar` (`nombre`, `rolTexto`, `iniciales`,
    `totalOrdenes`) que arma el layout de cada route group en el servidor.
    `lib/auth.ts::obtenerUsuarioConRol()` ahora también trae
    `usuarios.nombre_completo` (campo `nombre`); nueva `etiquetaRol()` para
    el texto bajo el nombre (doctor → "Doctor referente", equipo_radyex →
    "Equipo Radyex", admin → "Administración" — antes era "Doctora
    referente" / "Personal interno" fijos). El badge de "Mis órdenes" sale
    de un `select("*", { count: "exact", head: true })` sobre `ordenes` en
    `app/(doctor)/layout.tsx` (la RLS lo limita al doctor en sesión); en
    `(radyex)` el badge es 0 (no aplica a esa vista).
  - **0.2** `mapearOrden` + `FilaOrdenDB` movidos de
    `app/(doctor)/ordenes/mapeo.ts` a `lib/mapeo-ordenes.ts` (`git mv`,
    historia preservada) para que la pantalla de Órdenes de Radyex los
    reuse sin importar cruzando route groups. Import de
    `app/(doctor)/ordenes/page.tsx` actualizado a `@/lib/mapeo-ordenes`.
  - **0.3** `lib/auth.ts::exigirAdmin()` — guard que hace
    `redirect("/sin-acceso")` si el rol no es `admin`, pensado para un
    `layout.tsx` anidado en `app/(radyex)/admin/<pantalla>/` (bitácora /
    doctores / reportes, Bloque 3). Todavía no se usa; queda listo.
  - Los accesores de semilla `getCurrentDoctor`, `getOrdersByDoctor`,
    `getDoctorById`, `getDoctors`, `getOrders` y la constante
    `CURRENT_DOCTOR_ID` ya no los usa ningún componente (solo se
    referencian entre sí dentro de `lib/data.ts`). **No se borraron** —
    limpieza aparte cuando se migre "Nueva orden" y se confirme que del
    seed solo queda vivo el catálogo de estudios.
  - `npm run build`, `tsc --noEmit` y `eslint` limpios.

- **Fase 4 · Bloque 1 · paso 1 — Órdenes (Radyex) migrada y conectada a
  datos reales (2026-09-01).** SOLO LECTURA. Gemela de `/ordenes` (vista
  Doctor): reusa el mismo patrón, los mismos componentes y el mismo mapeo.
  - `app/(radyex)/admin/ordenes/page.tsx` (nuevo): Server Component `async`
    con la MISMA consulta base que la vista Doctor (join a `pacientes`, a
    `doctores → usuarios`, a `orden_estudios`/`catalogo_*`) y
    `mapearOrden` de `lib/mapeo-ordenes.ts`. **No filtra por doctor**: la
    RLS "admin y equipo ven todas las ordenes" ya devuelve todo. Orden por
    `fecha_solicitud` desc. Iniciales del avatar = usuario en sesión
    (mismo bloquecito que la vista Doctor).
  - `components/ordenes/OrderList.tsx`: 4 props opcionales nuevas, todas
    con default = comportamiento actual de la vista Doctor (así
    `/ordenes` no cambió ni una línea de render): `titulo`, `subtitulo`,
    `mostrarNuevaOrden` (default true; Radyex lo pasa `false`),
    `mostrarDoctor` (default false; Radyex `true`). Con `mostrarDoctor`,
    la búsqueda también matchea `doctorNombre` y el placeholder pasa a
    "Buscar paciente, folio o doctor...".
  - `components/ordenes/OrderCard.tsx`: prop opcional `mostrarDoctor`
    (default false). Cuando es `true`, el primer dato de la tarjeta es el
    doctor referente (ícono `Stethoscope` de Lucide) en lugar de la
    localidad — igual que el mockup `radyex/ordenes.html`. Vista Doctor:
    sin cambios (prop ausente → localidad, como siempre).
  - **Fuera de alcance, explícito:** (a) cambiar el estatus de una orden
    = paso 2 del Bloque 1 (primera escritura), NO va aquí; (b) archivos
    del modal = placeholder Fase 5 - R2; (c) el botón "Subir archivo para
    este paciente" del pie del modal en el mockup — no se añadió (requiere
    tocar `PatientModal` para meterle un pie; va con "Subir archivos" /
    Fase 5).
  - Diferencia mínima de copy no portada: el `<p>` bajo la lista dice
    "Toca cualquier paciente..." (compartido). En el mockup Radyex dice
    "Toca cualquier orden...". Se deja así para no sumar otra prop; se
    ajusta luego si molesta.
  - Vista Doctor `/ordenes`: verificada sin cambios (no se tocó su
    `page.tsx`; las props nuevas de `OrderList`/`OrderCard` son opcionales
    con default = lo de antes). `npm run build`, `tsc --noEmit` y `eslint`
    limpios; `/admin/ordenes` queda como ruta dinámica (`ƒ`).

- **Fase 4 · Bloque 1 · paso 3 — desvío: mecánica `solicitudes_orden`
  (opción B2), migración PROPUESTA (2026-09-02).** Un doctor no puede
  escribir en `pacientes` (RLS), así que "Nueva orden" del doctor no crea la
  orden directo: crea una **solicitud** que Radyex revisa (crear/enlazar
  paciente) antes de materializar `ordenes` + `orden_estudios`. Ver
  `docs/perfiles-y-acceso.md` § "Flujo … `solicitudes_orden`".
  - `radyex-web/supabase/migrations/20260902120000_solicitudes_orden.sql`
    (**APLICADO con `supabase db push` el 2026-09-02**): enum
    `estado_solicitud_orden` (`pendiente|aprobada|rechazada`) + tabla
    `public.solicitudes_orden` (`doctor_id`, `paciente_id` **o**
    `paciente_datos jsonb`, `entrega`, `indicaciones`, `estudios jsonb`,
    campos de revisión, `orden_id`) + constraints + índices + grants + RLS
    (doctor ve/crea las suyas; equipo y admin ven todas y son los únicos que
    hacen UPDATE = la revisión; sin DELETE). Endurecido en revisión: el
    INSERT del doctor exige que un `paciente_id` no nulo sea de un paciente
    con orden previa suya (patrón `exists` de
    `esquema_inicial.sql:733-736`); `chk_estudios_es_array` exige array **no
    vacío**.
  - Decisiones tomadas en la migración: (a) TODA orden del doctor pasa por
    `solicitudes_orden`, no solo las de paciente nuevo (cola de revisión
    única para Radyex); (b) `estudios` como jsonb, no tabla hija (consistente
    con `solicitudes_pendientes.datos_propuestos`); (c) sin folio en la
    solicitud — se asigna al materializar la orden; (d) el doctor no edita
    ni borra una solicitud enviada.

- **Fase 4 · Bloque 1 · paso 3.1 — `aprobar_solicitud_orden()` VERIFICADA EN
  VIVO (2026-09-04).** No solo aplicada: probada en el SQL Editor con las
  pruebas **dentro de transacciones con rollback**, sin dejar datos de prueba
  en la base. Sub-paso 3.1 **cerrado**.
  - **Rama (c) paciente nuevo:** solicitud con `paciente_datos` y sin
    `paciente_id` → la función creó el paciente desde cero, generó folio y
    materializó `ordenes` + `orden_estudios` en una sola transacción.
    Devolvió `folio: OR-260904-0001`, `estado: aprobada`. ✅
  - **Candado de propiedad (INSERT):** un doctor intentó mandar una solicitud
    con `paciente_id` directo a un paciente **sin orden previa suya** → rebotó
    con **RLS 42501 en el INSERT mismo**, ni siquiera llega a la función.
    Confirma viva la política endurecida de `solicitudes_orden`. ✅
  - **Rama (b) dedup de Radyex:** solicitud que llega como "paciente nuevo"
    (solo `paciente_datos`) pero que al aprobar Radyex enlaza pasando
    `p_paciente_id` de un paciente existente → **enlazó al paciente real** (el
    `paciente_id` devuelto es el del parámetro), **no creó duplicado**.
    Devolvió `folio: OR-260904-0002`. ✅
  - **Confirmaciones colaterales:**
    - Folio nuevo funcionando en vivo: `OR-260904-0001`, `OR-260904-0002`. El
      prefijo `LN` hardcodeado quedó **completamente eliminado**.
    - `folio_seq` es global e incrementa entre aprobaciones **aunque haya
      rollback** (`nextval` no se revierte). Los huecos en la numeración son
      esperados y aceptados — el folio es un id único, no un conteo.
    - `tipo_captura`: ambos valores (`sensor`, `rx`) entraron correctamente en
      minúscula.
    - **Función única confirmada vía `pg_proc`:** existe UNA sola versión,
      firma `(uuid, boolean, uuid, text)` — 4 parámetros, `SECURITY DEFINER`.
      No hay sobrecarga. La sospecha de una segunda versión de 3 params se
      descartó: era **truncamiento visual del SQL Editor**. La función
      homónima `aprobar_solicitud` (sin `_orden`, 3 params) es la de altas de
      doctor / cambios sensibles — otra cosa, no se toca.
  - **Firma real** (difiere del pseudocódigo original): 4 parámetros,
    incluyendo `p_comentario text default null`. Retorna `jsonb` con
    `{ folio, estado, orden_id, paciente_id, solicitud_id }`. El Server Action
    de 3.2 la llamará por esta firma única vía `supabase.rpc()`.
  - **Sin probar (aceptado):** el caso de **rechazo** (`p_aprobar = false`) no
    se ejercitó — es la rama de menor riesgo (solo marca la solicitud como
    `rechazada`, no crea nada). La **rama (a) directa** (solicitud con
    `paciente_id` legítimo + orden previa) tampoco se probó de frente, pero su
    candado inverso sí rebotó y la RLS de INSERT la cubre.

- **Fase 4 · Bloque 1 · paso 3.2a — cimientos del formulario "Nueva orden"
  (2026-09-03).** Groundwork antes de escribir la pantalla; sin UI nueva
  todavía.
  - `app/radyex-ui.css`: portadas del mockup las ~29 clases del formulario
    que faltaban (había **0**): `.panel*`, `.field*` + inputs/textarea/select,
    `.input-with-icon`, `.checkbox-row`, `.badge-entrega-fisica`,
    `.radio-pill*`, `.package-*`, `.study-section/-grid/-subpanel`,
    `.tooth-*` (carta dental FDI), `.fov-*`, `.combobox`/`.search-results`/
    `.search-result-item`/`.selected-chip`/`.mini-avatar`, `.btn-ghost`,
    `.btn-block`, `.dropzone-icon`. Mismos nombres de clase que
    `assets/css/styles.css`; las familias tipográficas usan los tokens de
    `globals.css` (`--font-display`/`--font-sans`) en vez de `'Lexend'`/
    `'Inter'` literales. También el bloque responsive ≤640px (una columna,
    objetivos táctiles ≥44px, y el `min-width:0` en `.study-grid > *` que
    evita el overflow horizontal que ya se había corregido en el mockup).
  - `lib/data.ts` (`PAQUETES`): alineado 1:1 con `paquete_estudios` de la BD
    — se agregó `modelo-trabajo` a Ortodoncia y Diagnóstico, y
    `modelo-estudio` + `modelo-trabajo` a Implantología (antes solo traía
    `escaneo-intraoral`). Verificado por comparación automática de los tres
    paquetes contra el seed SQL. Cierra un pendiente que arrastraba desde el
    2026-08-26.
  - `npm run build`, `tsc --noEmit` y `eslint` limpios.

- **Fase 4 · Bloque 1 · paso 3.2b — panel de estudios del formulario
  (2026-09-04).** La sección "Estudios que se solicitan", completa y
  autocontenida. Todavía no hay página que la monte (eso es 3.2c).
  - `lib/estudios-solicitud.ts` (nuevo): forma del estado
    (`SeleccionEstudios`) + funciones **puras** compartidas entre el
    formulario (cliente) y la Server Action (servidor):
    `construirEstudiosSolicitud()` (arma el `estudios` jsonb),
    `validarEstudios()`, `recalcularPaquetesActivos()`,
    `etiquetasEntregaFisicaPaquete()`, `esEntregaFisica()`, `fovPideZona()`,
    `resumirSeleccion()`. **Aquí se hacen cumplir las dos reglas de mapeo**:
    valores canónicos (`tipoCaptura: 'sensor' | 'rx'`) y la **síntesis de
    `{ estudio_id: 'tomografia-3d', fov, zona }`** desde el FOV elegido.
  - `components/nueva-orden/` (nuevos, uno por archivo):
    `SeleccionEstudios` (orquesta, componente **controlado** — sin estado
    propio), `PaquetesRapidos`, `CategoriaEstudios`, `PanelPeriapical`
    (Sensor/RX + carta dental FDI), `TomografiaFov`, `BadgeEntregaFisica`.
    Todo dirigido por el catálogo de `lib/data.ts`: agregar un estudio no
    obliga a tocar los componentes (Periapical y Cef "Otro" se reconocen por
    sus flags `teeth`/`note`, no por id escrito a mano).
  - **Portado el fix del bug de paquetes** (2026-08-26): un paquete solo se
    prende con click explícito; `recalcularPaquetesActivos()` únicamente lo
    puede **apagar**. Así marcar Ortodoncia no enciende Diagnóstico, aunque
    sus estudios sean un subconjunto exacto.
  - **Verificación:** 16 pruebas sobre las funciones puras (compiladas y
    corridas en Node), todas en verde — síntesis de tomografía, zona solo
    cuando el FOV la pide, `trim` de textos, `tipo_captura` en minúscula,
    las 4 reglas de validación, el bug histórico de Ortodoncia→Diagnóstico,
    apagado de paquete al destildar a mano, e Implantología exigiendo su FOV.
  - `npm run build`, `tsc --noEmit` y `eslint` limpios.

- **Fase 4 · Bloque 1 · paso 3.2c-1 — pantalla "Nueva orden" funcionando
  (2026-09-04).** El doctor ya puede enviar una solicitud de punta a punta.
  Ruta `/nueva-orden` viva (dinámica, `ƒ`).
  - `app/(doctor)/nueva-orden/page.tsx` (nuevo): Server Component `async` que
    trae el perfil del doctor (nombre/correo de `usuarios` + teléfono de
    `doctores`, dos lecturas porque viven en tablas distintas) y **sus**
    pacientes ya referidos — sin filtrar a mano: la RLS "un doctor ve solo
    pacientes con orden suya" ya los acota.
  - `app/(doctor)/nueva-orden/actions.ts` (nuevo): Server Action
    `crearSolicitudOrden()` → `insert` en `solicitudes_orden`. Recibe un
    **objeto plano** en vez de `FormData` (la selección de estudios es
    anidada). Revalida TODO en el servidor (paciente, entrega, estudios) —
    la validación del cliente es UX, no defensa. Traduce el error `42501`
    (RLS) a un mensaje entendible sin filtrar qué expedientes existen.
    `revalidatePath('/ordenes')` al terminar.
  - `components/nueva-orden/` (nuevos): `NuevaOrdenForm` (dueño de todo el
    estado; los paneles son controlados), `DatosDoctor`, `SelectorPaciente`.
  - **Confirmación SIN folio**, según lo acordado: "Solicitud enviada —
    Radyex la está revisando", explicando que la orden aparecerá en "Mis
    órdenes" con su folio cuando la procesen.
  - **Decisión: el perfil del doctor va de SOLO LECTURA** (el mockup lo tenía
    como inputs editables). Nombre/email/WhatsApp no tienen columna en
    `ordenes` — el dueño es `ordenes.doctor_id` — así que dejarlos editables
    sugeriría que el doctor puede mandar la orden a nombre de otro o corregir
    su perfil ahí, y ninguna de las dos cosas pasa. Editable solo lo que sí
    se guarda: `indicaciones` y `entrega`. Clase nueva `.dato-solo-lectura`
    en `radyex-ui.css`.
  - La nota de paquete (guía quirúrgica de Implantología) se agrega/quita de
    "Indicaciones" desde el formulario, igual que el mockup.

- **Fase 4 · Bloque 1 · paso 3.2c-2 — sección "En revisión" en
  `/ordenes` (2026-09-04).** Cierra el hueco: el doctor manda una solicitud y
  ahora sí la ve, mientras Radyex la procesa.
  - `lib/mapeo-solicitudes.ts` (nuevo): `mapearSolicitud()` + `FilaSolicitudDB`,
    mismo patrón que `mapeo-ordenes.ts`. **Molde aparte de `Orden`** a
    propósito: una solicitud pendiente no tiene folio (nace al aprobarla) ni
    estatus de orden ni archivos. El nombre del paciente sale de dos lugares
    según el caso — del join a `pacientes` si el doctor eligió uno ya
    referido, o de `paciente_datos` si es nuevo para él.
  - `components/ordenes/SolicitudesEnRevision.tsx` (nuevo): Server Component
    (no tiene interacción). Reusa `.order-avatar/-main/-name/-meta`, con dos
    clases nuevas mínimas (`.revision-row`, `.revision-pill`). **No es
    clicable**: todavía no hay detalle que abrir. Marca "Paciente nuevo"
    cuando aplica, para explicar por qué esa revisión puede tardar más. Si no
    hay solicitudes pendientes, la sección entera no se dibuja.
  - `components/ordenes/OrderList.tsx`: prop opcional nueva `encabezado?:
    React.ReactNode`, un **slot genérico** que se dibuja entre los stats y el
    buscador. OrderList no sabe qué le meten, así que no queda acoplado a las
    solicitudes; `/admin/ordenes` simplemente no lo pasa y no cambia en nada.
  - `app/(doctor)/ordenes/page.tsx`: segunda consulta a `solicitudes_orden`
    con `.eq('estado','pendiente')` — ese filtro es **regla de negocio**, no
    control de acceso: de que solo salgan las suyas se encarga la RLS.
  - **`OrderCard` y `StatusPill` NO se tocaron** (verificado con `git diff`),
    ni se agregó un cuarto estado a `STATUS_MAP` — tal como se acordó.
  - `npm run build`, `tsc --noEmit` y `eslint` limpios.

- **Fase 4 · Bloque 1 · paso 3.3 — pantalla de revisión de Radyex
  (2026-09-04).** Cierra el circuito completo: ya se puede aprobar o rechazar
  una solicitud **desde la app**, sin SQL Editor. Ruta `/admin/solicitudes`.
  - **Es la única pantalla de la Fase 4 que NO viene del mockup**: nació con
    la mecánica `solicitudes_orden` (decisión B2), que no existía cuando se
    diseñó el prototipo. Ítem de menú nuevo "Solicitudes" (ícono `Inbox`),
    puesto ANTES de "Órdenes" porque es la bandeja de entrada del flujo.
  - **No va detrás de `exigirAdmin()`**: revisar órdenes es trabajo del
    equipo Radyex (`docs/perfiles-y-acceso.md` § roles), y la RLS de UPDATE
    de `solicitudes_orden` también deja pasar a equipo + admin.
  - `app/(radyex)/admin/solicitudes/page.tsx` (nuevo): cola de pendientes,
    **más viejas primero** (`ascending: true`) — es una cola de trabajo, se
    atiende por orden de llegada, al revés que las listas de órdenes.
  - `app/(radyex)/admin/solicitudes/actions.ts` (nuevo): `aprobarSolicitud()`
    y `rechazarSolicitud()` llaman `supabase.rpc('aprobar_solicitud_orden')`
    con la firma única de 4 params; `buscarPacientes()` hace la búsqueda de
    deduplicación con `ilike` sobre el expediente maestro (mínimo 3 letras).
    Una resolución revalida **tres** rutas: `/admin/solicitudes`,
    `/admin/ordenes` y `/ordenes` del doctor.
  - `components/solicitudes/` (nuevos): `ListaSolicitudes` (cola + estado del
    modal + `router.refresh()` al resolver) y `RevisionModal`.
  - **La deduplicación es el corazón de la pantalla:** cuando el doctor mandó
    un "paciente nuevo", el modal busca coincidencias en el expediente
    maestro (precargando el nombre tecleado) y el equipo decide **enlazar** a
    uno existente o **crear** uno nuevo. El botón de aprobar cambia de texto
    según el caso ("Enlazar y aprobar" / "Crear paciente y aprobar" /
    "Aprobar"), para que la consecuencia sea explícita antes de tocarlo.
    Quien crea o enlaza NO es la app: es `aprobar_solicitud_orden()`, en una
    sola transacción.
  - **Rechazar exige comentario** (validado en el cliente): un rechazo sin
    motivo no le sirve a nadie después.
  - `lib/mapeo-solicitudes.ts`: molde nuevo `SolicitudParaRevision` +
    `mapearSolicitudRevision()` — Radyex necesita más que el doctor (quién la
    pidió, indicaciones, datos crudos del paciente y desglose completo de
    estudios). `lib/estudios-solicitud.ts`: `detallarEstudiosSolicitud()`,
    que expande cada estudio con su detalle (Sensor/RX, dientes, FOV, zona,
    técnica libre).
  - Corregido en revisión un `setState` síncrono dentro de un `useEffect` que
    ESLint marcó (renders en cascada): el "Buscando…" ahora se enciende
    dentro del timeout del debounce — de paso ya no parpadea con cada tecla.
  - `npm run build`, `tsc --noEmit` y `eslint` (proyecto completo) limpios.

## En curso
- **Fase 4 · Bloque 1 · pasos 3.2 y 3.3 completos.** El circuito de "Nueva
  orden" ya cierra de punta a punta en la app: el doctor la envía → la ve
  "En revisión" → Radyex la revisa, deduplica y aprueba → nace la orden con
  su folio y aparece en las dos listas de órdenes.
  - **Probado en navegador:** 3.2c-1 (prueba de humo del usuario, 2026-09-04).
  - **Sin probar en navegador:** 3.2c-2 y todo 3.3. Falta el recorrido
    completo con dos usuarios reales (doctor y equipo Radyex), incluyendo
    los tres caminos del modal: enlazar a existente, crear nuevo, y
    **rechazar** — esta última es la rama de `aprobar_solicitud_orden()` que
    sigue sin ejercitarse nunca (ver "Pendiente").
  - Siguen los pasos 4 y 5 del Bloque 1: **Pacientes (Radyex)** y
    **Pacientes (Doctor)**.
  Dos decisiones de UX cerradas: confirmación **sin folio** y sección
  "En revisión" en `/ordenes` con componente propio — detalle en
  `docs/migracion-nextjs.md` sub-paso 3.2.

## Pendiente
- **Mecánica `solicitudes_orden` (opción B2) — completar:**
  1. ~~**`public.aprobar_solicitud_orden(...)`**~~ — ✅ **APLICADA Y
     VERIFICADA EN VIVO** (2026-09-03 / 2026-09-04). Sub-paso 3.1 **cerrado**;
     detalle de las 3 pruebas en "Hecho". Firma única de 4 params
     `(uuid, boolean, uuid, text)`, retorna `jsonb`.
     **El backend de la mecánica B2 queda COMPLETO** — falta solo la UI
     (puntos 2 y 3).
  2. **Formulario "Nueva orden" del doctor** (`app/(doctor)/nueva-orden/`):
     buscar paciente ya referido **o** teclear uno nuevo; secciones de
     estudios + subpaneles (Periapical Sensor/RX + dientes FDI, Cef "Otro",
     Tomografía FOV + zona); paquetes; badges de entrega física; validación
     en cliente; Server Action que hace `insert` en `solicitudes_orden`.
     Portar el CSS del formulario desde `assets/css/styles.css` a
     `app/radyex-ui.css` (hoy no está ninguna clase del form).
  3. **Pantalla de revisión de Radyex**: cola de `solicitudes_orden`
     `pendiente`; ver `paciente_datos`, buscar en `pacientes`, enlazar/crear,
     aprobar (llama `aprobar_solicitud_orden()`) o rechazar.
  4. **Marcar la orden como "en revisión" en "Mis órdenes" del doctor** —
     va con el trabajo de estatus de orden (también pendiente). Hoy el doctor
     no verá la solicitud en `/ordenes` hasta que se apruebe (esa pantalla
     lee `ordenes`, no `solicitudes_orden`).
  5. ~~**`PAQUETES` en `radyex-web/lib/data.ts`** desalineado con
     `paquete_estudios`~~ — ✅ **corregido (2026-09-03)**, ver "Hecho".
     Queda desalineado solo el mockup (`assets/js/common.js`), que ya no
     alimenta la app real.
- **Prueba formal de rebote por rol del doctor:** la protección de rutas ya
  quedó verificada con una sesión de Equipo Radyex/Admin (`/ordenes` rebota
  a `/sin-acceso`), pero falta repetir la prueba con un usuario `doctor`
  real: confirmar que un doctor es rebotado de la zona `(radyex)` (debe caer
  en `/sin-acceso`), no solo que Equipo/Admin es rebotado de `(doctor)`.
- **Audit log completo de LFPDPPP (módulo Admin), sigue pendiente —
  DISTINTO de `registrar_acceso()`.** `registrar_acceso()` (ver "Hecho"
  arriba) solo estampa el último login del doctor, una fila que se
  sobrescribe en cada acceso. El requisito legal es otro: un registro
  **append-only**, una fila por cada vez que alguien abre un
  expediente/archivo clínico (quién, qué, cuándo — nunca sobrescribible).
  Ya está diseñado en el esquema (`public.bitacora`, ver "Registro real de
  la bitácora de auditoría" más abajo) pero no está construido. No
  confundir los dos: uno es UX de doctor (fase 3, ya resuelto), el otro es
  cumplimiento legal (fase 6, sigue pendiente).
- **Fase 4, restricción admin-only dentro de `(radyex)`:** cuando se migren
  bitácora/doctores/reportes, agregar ahí el chequeo "solo Administrador"
  (ver nota en "Hecho", entrada del 2026-08-28) — el layout general de la
  zona hoy solo exige admin o equipo_radyex.
- **Cambio de estatus de una orden (`UPDATE ordenes.estatus`) — POSPUESTO
  del Bloque 1 · paso 2 (decisión 2026-09-02).** Ni el mockup ni los docs
  tienen un control manual de estatus; la única transición del prototipo
  (`→ Finalizado`) ocurre al subir un archivo (`radyex/subir.html`,
  `RADYEX.addFileToOrder(code, file, 'success')`), que es Fase 5 (R2). Se
  construye ahí, junto con "Subir archivos", como en el mockup — así la
  primera ESCRITURA de la Fase 4 pasa a ser "Nueva orden" (paso 3), que sí
  está 100% especificada. La edición manual de estatus (control en el modal
  de Órdenes Radyex, por rol) queda como posible feature aparte si Monse la
  pide; no bloquea la Fase 4. El trigger `trg_bitacora_cambio_estatus` ya
  existe y escribirá la bitácora en cuanto haya un primer `UPDATE`.
- **Fase 4 de la migración a Next.js: migrar el resto de pantallas**, una por una, usando "Mis órdenes" (`components/ordenes/` + `app/(doctor)/ordenes/page.tsx` + `app/(doctor)/ordenes/mapeo.ts`) como patrón (ver `docs/migracion-nextjs.md`). El molde ya incluye la conexión a Supabase: página Server Component `async` que consulta con el cliente de `lib/server.ts` y traduce con un `mapeo.ts` propio (función pura `mapearOrden`); confiar en la RLS, no filtrar por rol en el código. Orden sugerido: nueva orden + lista → subir archivo → ver/descargar archivos → módulo admin (usuarios, bitácora, reportes) → buzón. Cada pantalla nueva extiende `app/radyex-ui.css` con las clases que le falten (hoy solo trae lo que usa el layout compartido y "Mis órdenes").
- **Notificación de cumpleaños de doctores al equipo admin** (requiere backend — job programado o trigger de Supabase que revise `birthDate` y notifique al equipo; el frontend ya guarda el dato y tiene el TODO marcado en `radyex/doctores.html`).
- Integración real con Supabase (datos y auth) y Cloudflare R2 (almacenamiento de PDFs/imágenes).
- **Registro real de la bitácora de auditoría** (`radyex/bitacora.html` ya tiene la interfaz completa con datos ficticios, pero no hay registro real de eventos) — requiere: triggers/llamadas desde la app en cada acción sensible (alta/edición de doctor, subida, cambio de estatus, visualización y descarga de archivos, consulta de la bitácora), tabla **append-only en Supabase con RLS que solo permita INSERT y SELECT** (nunca UPDATE/DELETE), y retención alineada a NOM-004 (5 años). Requisito legal LFPDPPP, no opcional. TODO marcado en `common.js` junto a `SEED_BITACORA`.
- **Agregaciones reales para Reportes** (`radyex/reportes.html` ya tiene la interfaz con KPIs/gráfica sobre datos ficticios) — requiere queries de agregación (COUNT/GROUP BY) sobre la tabla de órdenes real. TODO marcado en el script de `radyex/reportes.html`.
- **Envío real del buzón "Dudas o sugerencias"** (`doctor/dudas.html` ya tiene el formulario, validación y confirmación en UI) — requiere backend que tome asunto + mensaje + datos del doctor remitente y los envíe al correo personal de Monse (o a una bandeja compartida del equipo). TODO marcado en el script de `doctor/dudas.html`.
- Autenticación real de doctores y Radyex (el prototipo no tiene login funcional), incluyendo los 3 roles ya definidos en `docs/perfiles-y-acceso.md` (Administrador, Equipo Radyex, Doctor) — hoy el prototipo estático y `radyex-web` no distinguen roles dentro de Radyex, es trabajo de fase 2/3.
- Mecánica de "solicitud pendiente + aviso a Monse" (aprobación de altas de doctor y de cambios sensibles a perfiles) — diseño cerrado en `docs/perfiles-y-acceso.md`, sin construir todavía; es de fase 2 (tabla) y fase 6 (flujo/UI).
- **Revisar y aplicar el esquema SQL propuesto** en `radyex-web/supabase/migrations/` — el proyecto de Supabase ya existe y ya está vinculado (`supabase init` + `supabase link` corridos, 2026-08-26: existe `radyex-web/supabase/config.toml` y `.temp/project-ref`). Falta correr `supabase db push` cuando el usuario apruebe el contenido de las migraciones. Ver detalle en "Hecho" arriba.
- **`ultimo_acceso` de paciente**: no existe (ni columna, ni función, ni política) — hoy el esquema solo lo resuelve para `doctores`. Definir si hace falta para `pacientes` antes de aplicar el esquema.
- **Actualizar `assets/js/common.js` y `radyex-web/lib/data.ts` (`PAQUETES`)** para que coincidan con el contenido completo de paquetes ya confirmado por Monse y reflejado en el esquema SQL (`paquete_estudios`): falta "Trabajo" en Ortodoncia/Diagnóstico y ambos modelos en Implantología. Ver `docs/orden-de-estudio.md` § "Contenido exacto pre-marcado por paquete".
- Despliegue en Netlify con dominio propio (hoy solo hay workflow de GitHub Pages).

## Decisiones tomadas
- Prototipo se construyó primero como HTML estático navegable antes de migrar a Next.js, para validar el mockup con el cliente.
- Un `styles.css` y `common.js` compartidos entre todas las pantallas en vez de duplicar estilos/lógica por archivo.
- Para el rebrand del logo se usó el SVG (corregido) en vez de los PNG entregados, porque los PNG tenían el fondo blanco horneado en el pixel (no transparente) y se veían como una caja blanca sobre el sidebar oscuro. Se prefirió corregir el SVG (quitar el fondo, ajustar el `viewBox`) y derivar de ahí la versión blanca, en vez de generar un PNG nuevo, porque el SVG es editable/reutilizable y evita depender de herramientas externas de edición de imagen.
- El formulario de nueva orden se apega estrictamente al formato de papel (`docs/orden-de-estudio.md`); los campos "Prioridad" y "Fecha deseada" que existían antes se quitaron por no tener equivalente en el papel (confirmado con el usuario, 2026-07-29).
- El detalle de "Periapical" (Sensor/RX + dientes) y de "Tomografía 3D" (FOV + zona) se guarda en el objeto de la orden (`periapical`, `tomografia`) para no perder esos datos, aunque hoy ninguna pantalla los despliega en detalle — solo se usa un resumen (`studyType`) en las vistas de lista/modal existentes.
- En el drawer móvil (≤640px) se muestra el logo completo (icono + wordmark, sin recortar) en vez de solo el ícono como en el sidebar colapsado de escritorio: el drawer abre a 272px de ancho, suficiente para el logo completo, y da mejor legibilidad de marca que el recorte a ícono pensado para el riel angosto de escritorio.
- El widget "Próximos cumpleaños" (opcional del punto 1 de `docs/correcciones01.md`) sí se construyó, como vista de solo lectura marcada "Demostrativo" en `radyex/inicio.html`, porque no requería backend (solo lee `birthDate` de los doctores ya cargados) y da contexto visual de para qué sirve el campo nuevo sin implementar el aviso real.
- Bitácora y Reportes se separaron en dos páginas/menús distintos (`radyex/bitacora.html` y `radyex/reportes.html`) en vez de un solo apartado, siguiendo la distinción explícita de `docs/bitacora-y-reportes.md`: una es registro legal de solo lectura, la otra son métricas de negocio filtrables — mezclarlas habría complicado los permisos por rol a futuro (personal no-admin sí ve reportes pero no la bitácora legal completa).
- La gráfica de "Tendencia mensual" de Reportes usa datos derivados de las 10 órdenes ficticias compartidas (`RADYEX.getOrders()`) en vez de una serie mensual inventada aparte, para que el total de la gráfica siempre cuadre con el KPI "Total de estudios" — a costa de una gráfica con algunos meses en cero (solo hay pedidos de abril a diciembre 2025 en la semilla).
- **Migración a Next.js — decisiones de la fase 1 (2026-08-18):**
  - Las URLs de la vista Radyex viven bajo `/admin/*` (no `/radyex/*`) mientras que la vista Doctor usa rutas limpias sin prefijo (`/ordenes`, `/inicio`...): las dos vistas repiten nombres de pantalla ("inicio", "ordenes", "pacientes"), y como los route groups de Next.js (`(doctor)`, `(radyex)`) no agregan segmento a la URL, hacía falta un prefijo real para no chocar. Se eligió que el panel interno sea el que lleva el prefijo (`/admin`) porque el doctor es la cara pública del producto.
  - Las clases del sistema de diseño (`app/radyex-ui.css`) se portaron casi literal de `assets/css/styles.css` (mismos nombres de clase: `.sidebar`, `.order-card`, `.modal-overlay`...) en vez de reescribir todo como utilidades de Tailwind sueltas: ese CSS ya estaba probado a 390px en el mockup, y reusarlo evita repetir a mano decenas de reglas de los tres breakpoints (880px / 640px / 480px) con alto riesgo de que algo quede ligeramente distinto. Tailwind sí se usa para los tokens de color/tipografía (`@theme` en `app/globals.css`) y para utilidades sueltas dentro de los componentes nuevos.
  - Se reprodujo el flujo de "ver archivo" del mockup (visor de PDF en un modal encima del modal de paciente) tal cual, en vez de simplificarlo, porque es parte del comportamiento visible de "Mis órdenes" que la fase 1 tenía que igualar.
- **Fase 4 · Bloque 1 · paso 2 pospuesto (2026-09-02):** el "cambio de estatus de una orden" no se hace como pantalla/control aparte. El mockup solo cambia el estatus como efecto de subir un archivo (`radyex/subir.html`), así que esa escritura se hace en la Fase 5 (R2) junto con "Subir archivos", tal como el mockup. La primera ESCRITURA de la Fase 4 pasa a ser "Nueva orden" (paso 3). Edición manual de estatus = feature aparte solo si Monse la pide. Detalle en "Pendiente" arriba y en `docs/migracion-nextjs.md` (Bloque 1 · paso 2 + "Ganchos de backend").
- **Folio de orden — RADYEX genera su propio folio interno `OR-AAMMDD-NNNN` (2026-09-03, confirmado con Monse).** Dos hallazgos encadenados:
  1. Se investigó (git + docs + `docs/orden-de-estudio.md`, la transcripción del papel real) y `LN`/`TM` no estaban definidos en ningún lado — nacieron hardcodeados en `SEED_ORDERS` de `assets/js/common.js` y en `generateFolio()`, que elegía el prefijo **al azar**. Datos ficticios del mockup, sin significado. **Descartados por completo.**
  2. Monse aclaró que el folio operativo del centro **no se puede replicar**: depende de datos que este sistema no tiene (en qué computadora se capturó el estudio, folio del ticket de pago).
  **Decisión:** el folio de la plataforma es un identificador **interno de RADYEX**, independiente del folio operativo del centro. Formato `OR-AAMMDD-NNNN` (p. ej. `OR-260903-0001`): `'OR'` de "orden" — **no** es sede, sucursal ni tipo de estudio; `AAMMDD` = fecha de aprobación en `America/Mexico_City`; `NNNN` = `nextval('public.folio_seq')` con `lpad` a 4 dígitos. La secuencia es **global**, sin reinicio diario: el folio es un id único, no un conteo diario, y un contador global no necesita consultar "el último del día" (no es frágil bajo concurrencia). Verificado que `OR` no choca con ninguna otra serie del esquema. Implementado en `aprobar_solicitud_orden()`. Deja de ser un "pendiente con Monse".

## Pendientes de resolver con Monse
- ~~Confirmar aprobación del mockup estático~~ **Resuelto 2026-08-24: aprobado.**
- ~~Confirmar si el personal Radyex no-admin tendrá cuentas separadas y permisos distintos de bitácora~~ **Resuelto 2026-08-24:** 3 roles formales, equipo Radyex sin bitácora legal completa. Ver `docs/perfiles-y-acceso.md`.
- ~~Pacientes compartidos entre doctores~~ **Resuelto 2026-08-24:** paciente = una sola fila (expediente maestro de Radyex), órdenes con `doctor_id` propio; el doctor ve solo sus órdenes, Radyex ve todo. Ver `docs/perfiles-y-acceso.md`.
- **Alcance del respaldo .rar al desactivar un doctor** (nueva, 2026-08-24): qué incluye exactamente (¿solo datos del doctor o también archivos de sus pacientes?) y a qué correo se envía. Ver `docs/perfiles-y-acceso.md`.
- Confirmar si se usará Netlify + dominio propio en vez de GitHub Pages para el deploy final.
- ~~Validar con Monse el mapeo de estudios por paquete~~ **Resuelto 2026-08-26:** confirmó que cada paquete pre-marca su contenido completo — Ricketts, Digital y ambos modelos (Estudio+Trabajo) por default en los tres paquetes, FOV 12×9 en Implantología. Ver `docs/orden-de-estudio.md` § "Contenido exacto pre-marcado por paquete".
- Pedir al diseñador un re-export de `radyex-logo.png` / `radyex-logo-white.png` con transparencia real (los que están en `assets/logo/` tienen el fondo blanco quemado en el pixel) — hoy el sitio no los usa, solo los `.svg`, pero probablemente se necesiten como raster para el PDF de resultados u otros usos fuera del navegador.
