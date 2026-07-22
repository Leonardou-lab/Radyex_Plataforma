# RADYEX

Plataforma web para un centro de radiología dental. Digitaliza órdenes en papel,
expedientes físicos y entrega de resultados. Cliente: Monse. Idioma de toda la
interfaz y de los comentarios de código: **español**.

## Roles del sistema

- **Radyex (interno):** da de alta doctores, sube archivos de estudios, gestiona todo.
- **Doctor referente (externo):** solo dos procesos — solicitar órdenes y consultar
  los archivos de sus pacientes. Nada de administración.
- Los pacientes **no** acceden a la plataforma.

## Stack

- Next.js + Tailwind + shadcn/ui
- Supabase (base de datos y auth) · Cloudflare R2 (PDFs e imágenes radiológicas)
- Netlify + dominio propio
- Tipografías: Lexend (display) + Inter (UI)

## Reglas de diseño

- Paleta navy/teal ya definida en variables CSS (`--ink`, `--accent`, `--warn`,
  `--success`, `--pending`). Nunca hardcodees colores fuera de esas variables.
- Estética: tarjetas, chips/pills de estatus, sidebar oscuro, geometría angular.
  No es el SaaS médico genérico.
- **Íconos: siempre de Lucide, copiando el path oficial.** Nunca dibujes SVG a mano —
  ya produjo íconos rotos (un estetoscopio con `<circle r="0">`). `stroke-width="2"`,
  `stroke-linecap`/`linejoin` en `round`, `currentColor`.
- Accesibilidad obligatoria: `focus-visible` en controles, `aria-label` en botones
  que solo tienen ícono.
- Responsivo con breakpoint en ~880px (sidebar colapsa a íconos).
- Interfaz pensada para usuarios no técnicos: lenguaje claro, sin jerga.

## Reglas de negocio

- **La bitácora de auditoría es requisito legal (LFPDPPP), no una feature opcional.**
  Debe registrar quién accedió a qué expediente y cuándo. Va en el módulo de
  administración y no se recorta por tiempo.
- Ningún dato real de pacientes en el repositorio ni en el deploy. Los archivos de
  muestra en `assets/ejemplos/` deben ir anonimizados y con nombres genéricos.
- Cambios menores de UI son gratis; cambios estructurales después de aprobar el
  mockup requieren cotización aparte.

## Convenciones de código

- Comentarios y nombres de variables de dominio en español.
- Los datos ficticios del prototipo deben ser coherentes entre pantallas: mismos
  doctores, mismos pacientes de Puebla, mismo formato de folio (`LN`/`TM` + fecha).
- Un componente por archivo. No metas todo en un solo HTML gigante.

## Flujo de trabajo

- Antes de empezar cualquier tarea, lee `docs/PROGRESO.md` para saber en qué punto
  quedó el proyecto.
- Al terminar una tarea significativa, actualiza `docs/PROGRESO.md` con qué se hizo,
  qué falta y cualquier decisión que tomaste.
- Plazo: entrega en un mes. Si algo del alcance está en riesgo, dilo en vez de
  recortar la bitácora de auditoría o la seguridad.