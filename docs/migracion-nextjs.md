# Migración a Next.js — estrategia y estado

El prototipo estático (HTML/CSS/JS en `assets/`) queda como **referencia visual y de
datos**. El producto real se construye en Next.js reusando ese diseño ya aprobado. La
migración es **por fases y por pantalla**, no de un solo golpe: el objetivo es que
Leonardo (dev junior) entienda cada pieza que entra, no acumular código sin revisar.

Stack objetivo (de CLAUDE.md): Next.js (App Router) + TypeScript + Tailwind +
shadcn/ui · Supabase (datos + auth) · Cloudflare R2 (archivos) · Netlify.

Principio de TypeScript: mantenerlo **simple y legible** (tipos claros, sin genéricos
rebuscados). Si estorba más de lo que ayuda, se puede arrancar en JS.

## Estado rápido (2026-08-31)

- **Fase 1 — fundaciones + pantalla de referencia: COMPLETA** (2026-08-18).
- **Fase 2/3 — esquema Supabase + auth + RLS + rutas por rol: COMPLETA** (agosto 2026).
- **`/ordenes` (vista Doctor) ya lee datos REALES de Supabase** — es el molde vivo
  de la Fase 4.
- **Fase 4 — migrar el resto de pantallas: SIGUIENTE.** Plan y orden más abajo.
- Fase 5 (archivos en Cloudflare R2) y Fase 6 (alta de doctor con service-role +
  mecánica de aprobaciones): después de la Fase 4.

---

## Fase 1 — Fundaciones + pantalla de referencia (completa, 2026-08-18)

Dejó el proyecto montado y UNA pantalla migrada como plantilla entendible. No tocó
Supabase, R2 ni auth (eso fue la Fase 2/3).

- Proyecto Next.js nuevo (`radyex-web/`), sin mezclar con el mockup. El mockup NO se
  borra.
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
  `SEED_ORDERS`) + utilidades (`calcAge`, `daysUntilBirthday`, `initials`).
- **Pantalla de referencia: "Mis órdenes" (vista Doctor)**, migrada end-to-end a
  componentes: `OrderList` (búsqueda + filtros con `useState`), `OrderCard`,
  `StatusPill`, `PatientModal` (pestañas por año), `FileViewerModal`, `InfoItem`.
  Comentada en español explicando props, estado y `.map`/`key`.

---

## Fase 2 y 3 — Backend base (completas, agosto 2026)

Lo que YA existe y **no se rehace, solo se extiende**:

- **Esquema Supabase** en `radyex-web/supabase/migrations/` (aplicado con `db push`):
  `usuarios`, `doctores`, `pacientes`, `ordenes`, `orden_estudios`, `archivos`,
  `bitacora`, `solicitudes_pendientes` + catálogo de estudios (`categorias_estudio`,
  `catalogo_estudios`, `catalogo_fov`, `paquetes`, `paquete_estudios`), con RLS por
  rol, funciones auxiliares (`es_admin()`, `es_equipo_o_admin()`, `rol_actual()`,
  `registrar_acceso()`) y triggers que escriben la bitácora en los 4 eventos que son
  escrituras de BD (alta/edición de doctor, subida de archivo, cambio de estatus).
- **Clientes de Supabase**: `lib/client.ts` (browser), `lib/server.ts` (Server
  Components / Actions / Route Handlers), `proxy.ts` (refresco de sesión en cada
  request). **No se tocan.**
- **Auth + rutas por rol**: `lib/auth.ts` (`obtenerUsuarioConRol`,
  `rutaInicioPorRol`), login real en `app/login/` (`page.tsx` + `actions.ts`), guards
  de acceso en `app/(doctor)/layout.tsx` y `app/(radyex)/layout.tsx`, pantallas
  `cuenta-no-configurada` y `sin-acceso` fuera de los layouts protegidos.
  `registrar_acceso()` enganchado al login del doctor (verificado en vivo).
- **`lib/data.ts` renombrado a español**, alineado 1:1 con las columnas reales de la
  BD (spec en `docs/mapeo-campos.md`). Sigue conteniendo los `type` de dominio, las
  utilidades y la semilla (`SEED_*`, catálogo).
- **`/ordenes` (vista Doctor) conectada a Supabase**: `app/(doctor)/ordenes/page.tsx`
  es Server Component `async` que consulta `ordenes` (join a `pacientes`, a
  `doctores → usuarios` para el nombre del doctor referente, y a `orden_estudios` +
  `catalogo_estudios`/`catalogo_fov`), traduce cada fila con `mapearOrden`
  (`app/(doctor)/ordenes/mapeo.ts`) y pasa el arreglo a `OrderList`. Los archivos del
  `PatientModal` quedan como placeholder (Fase 5). **Este es el patrón de la Fase 4.**

---

## Patrón para migrar una pantalla (Fase 4 en adelante)

Ya no se lee del seed. Cada pantalla sigue el patrón de `/ordenes`:

1. **Componentes visuales** (`components/<pantalla>/`, uno por archivo): tarjetas,
   pills, filas, modal. Son "tontos": reciben props, no saben de dónde salen los
   datos. El estado de UI (búsqueda, filtros, pestañas, pasos de formulario) vive en
   el componente de pantalla (`"use client"`, con `useState`).
2. **Página = Server Component `async`** (`app/(rol)/<ruta>/page.tsx`):
   - Crea el cliente con `createClient()` de `lib/server.ts`.
   - Hace la(s) consulta(s). **Confía en la RLS**: no filtres por rol/doctor a mano.
     Vacío sin error = no hay datos todavía, no es bug.
   - Traduce cada fila con una función pura de mapeo (paso 3).
   - Pasa el arreglo ya mapeado por props al componente de pantalla.
3. **Mapeo `filaDB → molde UI`**: función pura, comentada en español, con el mapeo
   columna→prop explícito. Reusa utilidades de `lib/data.ts` (`calcAge`, `initials`,
   `STATUS_MAP`). Ubicación: `lib/mapeo-<entidad>.ts` si la comparten dos route
   groups; si es exclusiva de una pantalla, `app/(rol)/<ruta>/mapeo.ts`.
4. **Escrituras** (crear/editar): Server Action en `actions.ts` aparte, con
   `revalidatePath` de la ruta afectada. Deja que los triggers de la BD hagan lo
   suyo (p. ej. la bitácora de `cambio_estatus` se escribe sola).
5. **CSS**: extiende `app/radyex-ui.css` con las clases que le falten a esa pantalla
   (hoy solo trae lo del layout compartido y "Mis órdenes"). Mismos nombres de clase
   que `assets/css/styles.css`.
6. **Verifica** contra el mockup (mismo look y comportamiento) y a 390px de ancho.
   `npm run build` y `eslint` limpios antes de cerrar la pantalla.

Cosas que se dejan como **placeholder** hasta su fase:

- **Archivos de un expediente** (por año, en el modal de paciente o en "subir
  archivo"): viven en R2 (Fase 5). Se deja la sección con la forma vacía que la UI ya
  sabe mostrar y un `// TODO (fase 5 - R2)`, igual que en `/ordenes`.
- **Alta de doctor** (crear cuenta en Auth con service-role) y la mecánica de
  `solicitudes_pendientes`: Fase 6.

---

## Fase 4 — Orden de migración pantalla por pantalla

Principio: (a) lectura antes que escritura; (b) quien genera el dato antes que quien
lo muestra; (c) lo que depende de R2 o del alta con service-role va al final;
(d) reusar el molde de `/ordenes` mientras está fresco.

### Bloque 0 — Cimientos ✅ HECHO (2026-08-31)

- **0.1 Sidebar con sesión real.** Hecho. `Sidebar.tsx` / `SidebarShell.tsx` ya no
  leen la semilla: reciben un prop `usuario: UsuarioSidebar`
  (`nombre` / `rolTexto` / `iniciales` / `totalOrdenes`) que arma cada `layout.tsx`
  en el servidor. `obtenerUsuarioConRol()` ahora trae también
  `usuarios.nombre_completo`; `etiquetaRol()` da el texto del rol; el badge de "Mis
  órdenes" sale de un `count` con RLS sobre `ordenes` en `app/(doctor)/layout.tsx`.
- **0.2 Mover `mapearOrden`.** Hecho. Está en `lib/mapeo-ordenes.ts` (antes
  `app/(doctor)/ordenes/mapeo.ts`); lo reusará Órdenes (Radyex) sin importar
  cruzando route groups.
- **0.3 Guard "solo Administrador".** Hecho. `lib/auth.ts::exigirAdmin()` hace
  `redirect("/sin-acceso")` si el rol no es `admin`; se usará en un `layout.tsx`
  anidado en `app/(radyex)/admin/<pantalla>/` (bitácora, doctores, reportes —
  Bloque 3). Todavía sin usar.
- Pendiente de limpieza aparte: `getCurrentDoctor`, `getOrdersByDoctor`,
  `getDoctorById`, `getDoctors`, `getOrders`, `CURRENT_DOCTOR_ID` en `lib/data.ts`
  ya no los usa ningún componente (solo se referencian entre sí). Se borran cuando
  se migre "Nueva orden" y del seed solo quede vivo el catálogo.

### Bloque 1 — Órdenes y pacientes (lectura, reusa el molde)

1. **Órdenes (Radyex)** — lista de TODAS las órdenes. Gemela de `/ordenes`; la RLS
   de equipo/admin ya trae todo (no filtres). Agrega columna/filtro por doctor. Solo
   lectura en este paso.
2. **Cambiar estatus de una orden** (Server Action) en esa misma pantalla. Primera
   escritura (`UPDATE ordenes.estatus`, RLS equipo/admin). Dispara el trigger
   `trg_bitacora_cambio_estatus` → empiezan a existir filas reales de bitácora. El
   `/ordenes` del doctor lo refleja al instante (ya lee en vivo).
3. **Nueva orden (Doctor)** — el formulario grande. Lee el catálogo (constantes de
   `lib/data.ts`, ya sembrado idéntico en la BD) e **inserta `pacientes` + `ordenes`
   + `orden_estudios`** en una Server Action. Autocontenido. A partir de aquí se
   generan datos reales que fluyen a Órdenes (Radyex).
4. **Pacientes (Radyex)** — lista de todos los pacientes (ya poblada por el paso 3).
   Solo lectura.
5. **Pacientes (Doctor)** — pacientes del doctor (RLS: solo los que tienen una orden
   suya). Mismos componentes que el paso 4, cambia el rol. La sección de archivos
   por año queda como placeholder (Fase 5).

### Bloque 2 — Dashboards y doctores

6. **Doctores (Radyex) — solo el listado** (`doctores ⋈ usuarios`) + edición de
   campos menores (teléfono/correo = `UPDATE` normal). **El "alta con modal" se
   difiere a la Fase 6** (necesita `supabase.auth.admin.createUser` con service-role
   + la mecánica de aprobación). No empezar el alta a media Fase 4.
7. **Inicio (Doctor)** y luego **Inicio (Radyex)** — dashboards: agregados sobre
   datos que ya existen. El widget "Próximos cumpleaños" lee
   `doctores.fecha_nacimiento`. Van tarde a propósito: sin órdenes reales no se ven.

### Bloque 3 — Admin-only (detrás del guard del paso 0.3)

8. **Bitácora (Admin)** — lee `public.bitacora`. Va DESPUÉS de los pasos 2 y 6 para
   que ya haya eventos reales. Solo lectura. Primera pantalla que usa el guard "solo
   Administrador".
9. **Reportes (Admin)** — `COUNT` / `GROUP BY` sobre `ordenes`. Demostrativo, bajo
   riesgo, al final: necesita volumen de órdenes para ser útil.

### Bloque 4 — Independientes / diferidos

10. **Dudas / buzón (Doctor)** — no toca BD (manda correo a Monse, nunca a una tabla
    consultable). Depende de elegir infra de email (Edge Function / Resend / etc.).
    Hazlo cuando esté esa decisión.
- **Subir archivos (Radyex)** y **ver/descargar archivos** (dentro de Pacientes
  Doctor): **Fase 5 (R2)**. Se puede migrar el UI/form; la subida real y las URLs
  firmadas son R2. Mantén la sección de archivos con el placeholder.
- **Alta de doctor (liga + aprobación) + `solicitudes_pendientes`**: **Fase 6**.

### Errores de orden que hacen tropezar

- **Bitácora antes de las escrituras** (pasos 2 y 6) → pantalla vacía, no sabes si
  funciona.
- **Reportes o los Inicio antes de "Nueva orden"** → nada que agregar; pruebas
  contra una sola fila.
- **Pacientes (Radyex) antes de "Nueva orden"** → lista vacía.
- **Empezar "alta de doctor" o "subir archivos" a media fase** → te bloqueas en
  infra (service-role / R2). Son frontera Fase 5/6.
- **No arreglar el Sidebar (0.1)** → arrastras el nombre y los conteos falsos por
  toda la fase.
- **Construir Órdenes (Radyex) importando `app/(doctor)/ordenes/mapeo.ts`** → import
  cruzando route groups; muévelo a `lib/` primero (0.2).

### Decisión tomada para la Fase 4

El catálogo de estudios (`STUDY_CATEGORIES`, `TOMOGRAFIA_FOV`, `PAQUETES`,
`DIENTES_FDI`) se **sigue leyendo de las constantes de `lib/data.ts`**, no de las
tablas `catalogo_*`: es data de referencia, cambia poco y está sembrada idéntica en
la BD. Se pasa a consulta solo si el Administrador va a poder editar el catálogo
(fuera de alcance de la Fase 4).

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
- No tocar `lib/client.ts`, `lib/server.ts`, `proxy.ts` ni `.env.local`.
- No correr migraciones ni `db push` sin aprobación: el esquema se LEE de los
  archivos de `radyex-web/supabase/migrations/`.
- Confiar en la RLS: no filtrar por rol/doctor en el código de la pantalla.
- Cada fase/pantalla actualiza `docs/PROGRESO.md`. Si la estructura del proyecto
  cambia, actualizar `CLAUDE.md`.
