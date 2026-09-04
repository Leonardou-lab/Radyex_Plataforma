# Mapeo de campos — `lib/data.ts` ↔ esquema de Supabase

Spec de dónde sale cada campo de `radyex-web/lib/data.ts` en datos reales. Se
generó al renombrar los campos de inglés a español (2026-08-28) para que ese
renombrado se hiciera **una sola vez**: los nombres que usa hoy la UI ya
coinciden con las columnas reales de
`radyex-web/supabase/migrations/20260824120000_esquema_inicial.sql`.

**Estado (2026-09-03):** el mapeo de `Orden` ya está **implementado** en
`radyex-web/lib/mapeo-ordenes.ts` (`mapearOrden`), que lo usan las dos pantallas
de órdenes: `/ordenes` (vista Doctor) y `/admin/ordenes` (vista Radyex). Esta
tabla es la spec; ese archivo es la implementación — si cambia uno, actualizar
el otro. `Doctor` y `ArchivoOrden` siguen sin implementarse (el segundo depende
de R2, Fase 5).

Los campos marcados **CALCULADO/DISPLAY** no tienen una columna propia — se
derivan de otras columnas (o de un join) al momento de renderizar. No se
renombran a una columna porque no existe esa columna; el nombre en español
que tienen hoy es el que va a seguir usando la UI después de conectar datos
reales, solo que la función que los llena deja de ser el seed y pasa a ser un
cálculo sobre el resultado de la consulta.

## `Orden` (hoy plano; a futuro sale de `ordenes` join `pacientes`)

| Campo en `lib/data.ts` | Columna BD | Tipo |
|---|---|---|
| `folio` | `ordenes.folio` | columna |
| `nombrePaciente` | `pacientes.nombre_completo` | columna |
| `iniciales` | — | CALCULADO (`initials(nombrePaciente)`) |
| `localidad` | `pacientes.localidad` | columna |
| `fechaSolicitud` | `ordenes.fecha_solicitud` | columna |
| `estatus` | `ordenes.estatus` (enum `estatus_orden`: `pendiente`\|`en_proceso`\|`finalizado`) | columna |
| `doctorId` | `ordenes.doctor_id` | columna |
| `doctorNombre` | `usuarios.nombre_completo` | CALCULADO/DISPLAY (join de dos saltos `ordenes → doctores → usuarios`; en `doctores` no hay nombre). Campo **opcional** en el tipo, porque la semilla no lo trae |
| `tipoEstudio` | — | CALCULADO/DISPLAY (resumen de N filas de `orden_estudios` join `catalogo_estudios`, no una sola columna) |
| `entrega` | `ordenes.entrega` (enum `tipo_entrega`: `Impreso`\|`Digital`) | columna |
| `telefono` | `pacientes.telefono` | columna |
| `correo` | `pacientes.correo` | columna |
| `edad` | — | CALCULADO (`calcAge(pacientes.fecha_nacimiento)` — la función ya existe en `lib/data.ts`) |
| `pacienteDesde` | — | CALCULADO/DISPLAY (texto compuesto "2023 · 3 años"; **resuelto**: se deriva del año de `pacientes.created_at`) |
| `archivos` | — | CALCULADO/DISPLAY (agrupación por año de filas de `archivos` de esa orden). **Todavía NO conectado**: `mapearOrden` devuelve `{ "<año de la orden>": [] }` como placeholder — los binarios viven en R2 (Fase 5) |

**Eliminado:** `priority` no tiene columna en la BD (no existe ninguna
columna de prioridad en `ordenes`) y no se usaba en ningún componente
migrado — se quitó del tipo `Orden` y de la semilla en vez de renombrarse.

## `ArchivoOrden` (tabla `archivos`)

| Campo en `lib/data.ts` | Columna BD | Tipo |
|---|---|---|
| `nombreArchivo` | `archivos.nombre_archivo` | columna |
| `fechaCaptura` | `archivos.fecha_captura` | columna |
| `src` | `archivos.ruta_r2` (parcial) | CALCULADO/DISPLAY |

**Nota Fase 5:** `src` hoy es una ruta local a un PDF de ejemplo en
`public/ejemplos/`, servible tal cual. La columna real (`archivos.ruta_r2`)
es una **llave de objeto en Cloudflare R2, no una URL servible directo** —
conectarla de verdad no es un simple rename de campo: hace falta generar una
URL firmada temporal a partir de esa llave (parte del trabajo de la Fase 5,
"Archivos en R2", no de este renombrado).

## `Doctor` (hoy plano; a futuro sale de `doctores` join `usuarios`)

| Campo en `lib/data.ts` | Columna BD | Tipo |
|---|---|---|
| `id` | `doctores.id` (= `usuarios.id`) | columna |
| `nombreCompleto` | `usuarios.nombre_completo` | columna — **vive en `usuarios`, no en `doctores`** |
| `especialidad` | `doctores.especialidad` | columna |
| `consultorio` | `doctores.consultorio` | columna |
| `correo` | `usuarios.correo` | columna — **vive en `usuarios`, no en `doctores`** |
| `telefono` | `doctores.telefono` | columna |
| `nombreUsuario` | `doctores.nombre_usuario` | columna |
| `estatus` | `doctores.estatus` (enum `estatus_doctor`: `activo`\|`inactivo`) | columna |
| `ultimoAcceso` | `doctores.ultimo_acceso` | columna |
| `fechaNacimiento` | `doctores.fecha_nacimiento` | columna |

**Nota Fase 4:** al conectar datos reales, poblar un `Doctor` completo
requiere un **join `doctores` + `usuarios`** (`nombreCompleto` y `correo` no
están en la misma tabla que `especialidad`/`consultorio`/etc.) — no alcanza
con `select * from doctores`.

## Estatus visual (sin cambio, no es vocabulario de negocio)

`EstatusVisual` (`"success" | "warn" | "pending"`) se queda en inglés a
propósito: son los nombres de las clases CSS y tokens de color del sistema
de diseño (`--success`, `--warn`, `--pending`, `.status-success`, etc. en
`app/radyex-ui.css`), compartidos por más pantallas que solo "órdenes" — no
son parte del dominio de negocio. `STATUS_MAP` en `lib/data.ts` es la única
traducción entre `EstatusOrden` (valor de negocio, en español, igual a la
BD) y `EstatusVisual` (clase CSS):

| `EstatusOrden` (BD) | `label` | `EstatusVisual` (`cls`, CSS) |
|---|---|---|
| `pendiente` | Pendiente | `pending` |
| `en_proceso` | En proceso | `warn` |
| `finalizado` | Finalizado | `success` |

`Doctor.estatus` (`"activo" | "inactivo"`) no tiene esta capa intermedia:
no se usa en ninguna pantalla migrada todavía, así que se renombró directo
a los valores de la BD sin necesidad de un tipo visual aparte.
