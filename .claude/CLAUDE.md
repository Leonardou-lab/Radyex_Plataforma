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

## Proyecto Next.js (`radyex-web/`)

Migración en curso del prototipo estático a Next.js (ver `docs/roadmapp.md` y
`docs/migracion-nextjs.md` para el detalle por fases). El código vive en
`radyex-web/`, aparte del mockup:

- `assets/`, `radyex/*.html`, `doctor/*.html`, `index.html` — **el mockup
  estático se queda intacto como referencia** de diseño y datos. No se borra,
  no se depende de él en runtime.
- `radyex-web/` — la app real. Auth + RLS por rol ya conectados a Supabase
  (fase 3). La pantalla `/ordenes` ya lee datos reales de Supabase; el resto
  de pantallas todavía leen de una semilla local en TypeScript (`lib/data.ts`)
  hasta la fase 4. R2 (archivos) sigue pendiente (fase 5).

### Rutas (App Router, route groups por rol)

- `app/(doctor)/` — vista Doctor referente. URLs limpias sin prefijo:
  `/ordenes`, `/inicio`, `/nueva-orden`, `/pacientes`, `/dudas` (las que no
  sean `/ordenes` todavía no existen, son la fase 4).
- `app/(radyex)/` — panel interno, agrupado bajo `/admin/*`
  (`/admin`, `/admin/ordenes`, `/admin/doctores`, etc.) para no chocar con las
  rutas de arriba, que repiten nombres de pantalla (ambas vistas tienen
  "inicio", "ordenes", "pacientes"). Hoy solo existe `/admin` como placeholder.
- Cada route group tiene su propio `layout.tsx`, pero los dos delegan en el
  mismo `components/layout/SidebarShell.tsx` pasándole `role="doctor"` o
  `role="radyex"` — ahí vive el estado del drawer móvil (`useState`, ≤640px).
- `app/page.tsx` — portada con selector de rol (equivalente a `index.html`
  del mockup), sin login todavía.

### Dónde vive cada cosa

- `lib/data.ts` — tipos de dominio (`Orden`, `Doctor`, `EstatusOrden`...),
  utilidades (`calcAge`, `daysUntilBirthday`, `initials`, `STATUS_MAP`) y la
  semilla local (`SEED_DOCTORS`, `SEED_ORDERS`, catálogo de estudios). Los
  `type` son la referencia del esquema de Supabase y el molde que espera la
  UI. `/ordenes` ya NO usa `SEED_ORDERS` (lee de Supabase — ver
  `components/<pantalla>/` abajo), pero sí sigue usando los `type` y las
  utilidades; el resto de pantallas todavía importan los arreglos del seed
  directo hasta la fase 4.
- `components/layout/` — `Sidebar` (un componente, items por rol vía
  `nav-items.ts`), `MobileTopbar`, `SidebarShell` (el layout compartido).
- `components/<pantalla>/` — un componente por archivo, agrupados por
  pantalla (p. ej. `components/ordenes/` para "Mis órdenes": `OrderList`,
  `OrderCard`, `StatusPill`, `PatientModal`, `FileViewerModal`, `InfoItem`).
  Esta carpeta es la plantilla comentada en español para migrar el resto de
  pantallas (patrón en `docs/migracion-nextjs.md`): la página (`page.tsx`,
  Server Component `async`) trae los datos de Supabase con el cliente de
  `lib/server.ts`, los traduce al molde de la UI con un `mapeo.ts` propio de
  la pantalla (`app/(doctor)/ordenes/mapeo.ts` — función pura `mapearOrden`,
  con el mapeo columna→prop comentado), y pasa el arreglo ya mapeado por
  props al componente de pantalla (`"use client"`, con el `useState` de la
  UI). No se filtra por doctor/rol en el código: lo hace la RLS. Los
  archivos del `PatientModal` siguen sin conectar (fase 5 - R2).
- `app/globals.css` — tokens de marca como variables CSS + su mapeo al tema
  de Tailwind v4 (bloque `@theme`) y a los slots semánticos de shadcn/ui.
  Next/font de Lexend + Inter también se registra ahí (`--font-display`,
  `--font-sans`).
- `app/radyex-ui.css` — las clases del sistema de diseño portadas del mockup
  (sidebar, botones, tarjetas de orden, chips, modal, drawer móvil...), con
  los mismos nombres de clase que `assets/css/styles.css`. Se extiende
  pantalla por pantalla conforme se migran (fase 4) — hoy solo trae lo que usa
  el layout compartido y "Mis órdenes".
- Íconos: `lucide-react` (componentes, no SVG a mano — sigue cumpliendo la
  regla de "siempre Lucide, path oficial", solo que ahora es un import en vez
  de copiar el `<svg>`).
- `shadcn/ui` está inicializado (`components.json`, estilo `base-nova`) para
  cuando haga falta un componente compuesto (diálogos, dropdowns) en fases
  siguientes; la pantalla de referencia de esta fase usa las clases de
  `radyex-ui.css`, no componentes de shadcn.

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