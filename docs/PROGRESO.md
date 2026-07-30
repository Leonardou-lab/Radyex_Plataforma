# Estado del proyecto
Última actualización: 2026-07-30

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

## En curso
- Nada activo identificado en el repo.

## Pendiente
- Migración del prototipo estático a Next.js + Tailwind + shadcn/ui (stack definido en CLAUDE.md, aún no iniciado).
- Integración real con Supabase (datos y auth) y Cloudflare R2 (almacenamiento de PDFs/imágenes).
- Módulo de **bitácora de auditoría real** (`radyex/bitacora.html` es solo un placeholder "Próximamente") — requisito legal LFPDPPP, no opcional.
- Autenticación real de doctores y Radyex (el prototipo no tiene login funcional).
- Despliegue en Netlify con dominio propio (hoy solo hay workflow de GitHub Pages).

## Decisiones tomadas
- Prototipo se construyó primero como HTML estático navegable antes de migrar a Next.js, para validar el mockup con el cliente.
- Un `styles.css` y `common.js` compartidos entre todas las pantallas en vez de duplicar estilos/lógica por archivo.
- Para el rebrand del logo se usó el SVG (corregido) en vez de los PNG entregados, porque los PNG tenían el fondo blanco horneado en el pixel (no transparente) y se veían como una caja blanca sobre el sidebar oscuro. Se prefirió corregir el SVG (quitar el fondo, ajustar el `viewBox`) y derivar de ahí la versión blanca, en vez de generar un PNG nuevo, porque el SVG es editable/reutilizable y evita depender de herramientas externas de edición de imagen.
- El formulario de nueva orden se apega estrictamente al formato de papel (`docs/orden-de-estudio.md`); los campos "Prioridad" y "Fecha deseada" que existían antes se quitaron por no tener equivalente en el papel (confirmado con el usuario, 2026-07-29).
- El detalle de "Periapical" (Sensor/RX + dientes) y de "Tomografía 3D" (FOV + zona) se guarda en el objeto de la orden (`periapical`, `tomografia`) para no perder esos datos, aunque hoy ninguna pantalla los despliega en detalle — solo se usa un resumen (`studyType`) en las vistas de lista/modal existentes.

## Pendientes de resolver con Monse
- Confirmar aprobación del mockup estático antes de iniciar la migración a Next.js/Supabase (cambios estructurales después de aprobar requieren cotización aparte).
- Validar contenido y alcance real de la bitácora de auditoría (qué eventos debe registrar exactamente).
- Confirmar si se usará Netlify + dominio propio en vez de GitHub Pages para el deploy final.
- Validar con Monse el mapeo de estudios por paquete que se asumió (p. ej. Ortodoncia preselecciona cefalometría "Ricketts" como técnica por default; Implantología preselecciona FOV 12×9) — el papel no especifica técnica/FOV exactos por paquete.
- Pedir al diseñador un re-export de `radyex-logo.png` / `radyex-logo-white.png` con transparencia real (los que están en `assets/logo/` tienen el fondo blanco quemado en el pixel) — hoy el sitio no los usa, solo los `.svg`, pero probablemente se necesiten como raster para el PDF de resultados u otros usos fuera del navegador.
