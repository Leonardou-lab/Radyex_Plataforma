# Estado del proyecto
Última actualización: 2026-07-21

## Hecho
- Prototipo estático navegable (HTML/CSS/JS plano, sin framework aún) con `index.html` selector de rol.
- Vista Radyex completa: inicio, órdenes, doctores (alta con modal), subir archivos, pacientes.
- Vista Doctor completa: inicio, mis órdenes, nueva orden, pacientes con sus archivos.
- Sistema de diseño base en `assets/css/styles.css`: variables navy/teal, tipografías Lexend/Inter, sidebar, chips de estatus.
- Datos ficticios coherentes (doctores, pacientes de Puebla, folios `LN`/`TM` + fecha) en `assets/js/common.js`.
- Archivos de ejemplo anonimizados en `assets/ejemplos/`.
- Workflow de GitHub Pages (`jekyll-gh-pages.yml`) para publicar el prototipo estático.
- Reorganización en carpetas: solo `index.html` queda en la raíz; páginas movidas a `radyex/` y `doctor/`, estilos y script a `assets/css/` y `assets/js/`. Enlaces y rutas verificados sirviendo el sitio en local (todo 200 OK).

## En curso
- Nada activo identificado en el repo; último commit fue un merge de `main`.

## Pendiente
- Migración del prototipo estático a Next.js + Tailwind + shadcn/ui (stack definido en CLAUDE.md, aún no iniciado).
- Integración real con Supabase (datos y auth) y Cloudflare R2 (almacenamiento de PDFs/imágenes).
- Módulo de **bitácora de auditoría real** (`radyex/bitacora.html` es solo un placeholder "Próximamente") — requisito legal LFPDPPP, no opcional.
- Autenticación real de doctores y Radyex (el prototipo no tiene login funcional).
- Despliegue en Netlify con dominio propio (hoy solo hay workflow de GitHub Pages).

## Decisiones tomadas
- Prototipo se construyó primero como HTML estático navegable antes de migrar a Next.js, para validar el mockup con el cliente.
- Un `styles.css` y `common.js` compartidos entre todas las pantallas en vez de duplicar estilos/lógica por archivo.

## Pendientes de resolver con Monse
- Confirmar aprobación del mockup estático antes de iniciar la migración a Next.js/Supabase (cambios estructurales después de aprobar requieren cotización aparte).
- Validar contenido y alcance real de la bitácora de auditoría (qué eventos debe registrar exactamente).
- Confirmar si se usará Netlify + dominio propio en vez de GitHub Pages para el deploy final.
