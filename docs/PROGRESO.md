# Estado del proyecto
Última actualización: 2026-07-29

## Hecho
- Prototipo estático navegable (HTML/CSS/JS plano, sin framework aún) con `index.html` selector de rol.
- Vista Radyex completa: inicio, órdenes, doctores (alta con modal), subir archivos, pacientes.
- Vista Doctor completa: inicio, mis órdenes, nueva orden, pacientes con sus archivos.
- Sistema de diseño base en `assets/css/styles.css`: variables navy/teal, tipografías Lexend/Inter, sidebar, chips de estatus.
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
- El formulario de nueva orden se apega estrictamente al formato de papel (`docs/orden-de-estudio.md`); los campos "Prioridad" y "Fecha deseada" que existían antes se quitaron por no tener equivalente en el papel (confirmado con el usuario, 2026-07-29).
- El detalle de "Periapical" (Sensor/RX + dientes) y de "Tomografía 3D" (FOV + zona) se guarda en el objeto de la orden (`periapical`, `tomografia`) para no perder esos datos, aunque hoy ninguna pantalla los despliega en detalle — solo se usa un resumen (`studyType`) en las vistas de lista/modal existentes.

## Pendientes de resolver con Monse
- Confirmar aprobación del mockup estático antes de iniciar la migración a Next.js/Supabase (cambios estructurales después de aprobar requieren cotización aparte).
- Validar contenido y alcance real de la bitácora de auditoría (qué eventos debe registrar exactamente).
- Confirmar si se usará Netlify + dominio propio en vez de GitHub Pages para el deploy final.
- Validar con Monse el mapeo de estudios por paquete que se asumió (p. ej. Ortodoncia preselecciona cefalometría "Ricketts" como técnica por default; Implantología preselecciona FOV 12×9) — el papel no especifica técnica/FOV exactos por paquete.
