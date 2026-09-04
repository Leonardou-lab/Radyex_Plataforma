# Perfiles y acceso — RADYEX

Fuente de verdad del modelo de roles, permisos y flujos de aprobación. Decisiones
cerradas por Monse el 2026-08-24, sobre el mockup ya aprobado. Esto define el diseño
de auth/RLS de la fase 3 (`docs/roadmapp.md`) y debe coincidir con lo que se
implemente ahí — si algo cambia en el build real, actualizar primero este documento.

---

## Los 3 roles

### 1. Administrador (Monse)
- Ve todo, sin restricción.
- Es el único rol que ve la **bitácora legal completa** (ver `docs/bitacora-y-reportes.md`).
- Autoriza altas de doctores.
- Aprueba los cambios sensibles que propone el equipo (ver abajo).

### 2. Equipo Radyex (2 usuarios)
- Revisa órdenes, sube archivos, entra a expedientes de pacientes, ve doctores.
- **No ve la bitácora legal completa** — coincide con lo ya definido en
  `docs/bitacora-y-reportes.md` (personal no-admin: reportes sí, bitácora no).
- Cada archivo subido debe registrar **quién del equipo lo subió** (campo obligatorio
  del evento de bitácora "subida de archivo": no basta con "Equipo Radyex" genérico,
  Monse quiere saber qué persona subió cada reporte). Esto es un campo más en el mismo
  evento que ya estaba planeado, no un evento nuevo.
- Puede proponer cambios sensibles, pero no aplicarlos directo (ver flujo de
  aprobación abajo).

### 3. Doctor (externo)
- Pide órdenes y consulta solo sus pacientes.
- No administra nada, no sube archivos.
- Sin cambios respecto a lo ya definido en el mockup.

---

## Alta de doctores: registro no abierto, doble filtro

El auto-registro abierto queda descartado (ya se había señalado como hueco LFPDPPP en
`docs/roadmapp.md`). El flujo aprobado:

1. El doctor se registra a través de una **liga** (no hay registro público sin liga).
2. La solicitud queda pendiente.
3. **El Administrador (Monse)** — no el equipo — aprueba o rechaza el alta.

Doble filtro: liga + autorización de Monse. El equipo Radyex no tiene permiso para
aprobar altas de doctor, aunque sí puede ver/gestionar doctores ya activos.

---

## Cambios a perfiles (doctor/paciente): aprobación por campo

Regla general: el nivel de aprobación depende de **qué campo** se está cambiando, no
de quién lo pide.

### Cambios menores — aplicación directa, sin aprobación
El equipo Radyex los aplica de inmediato:
- Teléfono
- Correo
- Dirección

### Cambios sensibles — requieren autorización de Monse antes de aplicarse
- Nombres
- Estudios
- Órdenes

**Mecánica** (una sola vez, reutilizada en dos flujos — ver siguiente sección):
1. El equipo propone el cambio.
2. Se guarda como **solicitud pendiente** (no se aplica todavía).
3. Le llega un aviso/notificación a Monse.
4. Monse aprueba o rechaza.
5. Si aprueba, el cambio se aplica; si rechaza, la solicitud queda cerrada sin efecto.

### Mecánica compartida: "solicitud pendiente + aviso a Monse"
Esta misma mecánica sirve para **dos casos** y debe construirse **una sola vez** como
pieza reutilizable (una tabla de solicitudes con tipo, estado, quién propone, a quién
notifica, y quién resuelve):
- Aprobación de altas de doctor.
- Aprobación de cambios sensibles a perfiles de doctor/paciente.

Implica una tabla de solicitudes pendientes con: tipo de solicitud, datos propuestos,
quién la creó, estado (pendiente/aprobada/rechazada), quién la resolvió y cuándo. Es
insumo directo para el modelo de datos de la fase 2.

---

## Bitácora: visibilidad solo-admin

Ajuste sobre `docs/bitacora-y-reportes.md`: la bitácora legal completa la ve **solo
Monse (admin)**. El equipo Radyex no tiene acceso a ella, ni siquiera de forma
parcial — ve Reportes (métricas de negocio), no Bitácora. Esto ya estaba anticipado en
la tabla de "Permisos por perfil" de ese documento; queda confirmado y sin ambigüedad
ahora que existen los 3 roles formales.

---

## Baja de doctor: desactivación, no borrado

- Un doctor dado de baja se **desactiva**, nunca se borra.
- Los expedientes de sus pacientes se **conservan** — retención NOM-004 (5 años). La
  baja del doctor no debe implicar sacar del sistema los estudios de esos pacientes.
- Monse pidió que, al desactivar, se genere un **respaldo (.rar)** de lo del doctor y
  se envíe a su correo.

**Estado: pendiente de backend.** No se construye en esta ronda.

**Pregunta abierta — alcance exacto del respaldo:**
- ¿Qué incluye el .rar? (¿solo datos/metadatos del doctor, o también copia de los
  archivos de estudios que él pidió?)
- ¿A qué correo se envía exactamente — el de Monse, el del doctor, ambos?
- Confirmado: el respaldo **no** implica retirar del sistema los estudios de
  pacientes; esos deben permanecer por ley (NOM-004) sin importar el .rar.
- Bloquea: el diseño del job/función de desactivación (fase 6) y cualquier
  integración de envío de correo con adjuntos grandes.

---

## Pacientes compartidos entre doctores — CERRADO (2026-08-24)

Monse dijo "solo el que pide el doctor". Modelo confirmado:

- **Un paciente = una sola fila.** Es una persona real, un registro único — no se
  duplica por doctor. Radyex es dueño del **expediente maestro** del paciente.
- Lo que pertenece a cada doctor son las **órdenes**, no el paciente: cada orden
  tiene su propio `doctor_id`.
- **Vista del Doctor:** solo ve las órdenes/estudios que él mismo pidió (filtro por
  `doctor_id` en la orden), aunque el paciente físico sea compartido con otro doctor.
  No ve las órdenes que otros doctores pidieron para ese mismo paciente.
- **Vista de Radyex:** expediente completo del paciente — todas sus órdenes, sin
  importar qué doctor las pidió — y la lista de doctores que lo refieren, **derivada**
  de los `doctor_id` distintos presentes en sus órdenes (no se guarda aparte como
  campo propio del paciente).
- El "expediente único con historial por años" que ya existe en el mockup es la
  **vista interna de Radyex**, no la del doctor — el doctor solo ve su propio
  subconjunto de ese historial.
- **Reconocer al paciente que regresa:** lo vincula o lo crea el equipo de Radyex al
  procesar la orden — Radyex es dueño del expediente maestro y decide si una orden
  nueva es de un paciente existente o de uno nuevo. El detalle fino de ese flujo
  interno (búsqueda por nombre/teléfono, confirmación manual, etc.) es afinable más
  adelante y **no bloquea el esquema de base de datos**.

**Consecuencia para el esquema:** una tabla `pacientes` con una fila por persona, y
`ordenes.doctor_id` + `ordenes.paciente_id` como las dos llaves foráneas que resuelven
tanto la vista del doctor (RLS filtra por `doctor_id`) como la vista de Radyex (sin
filtro, agrupando por `paciente_id`). No hace falta una tabla intermedia
doctor-paciente — la relación ya está implícita en las órdenes.

### Flujo "el doctor manda la orden, Radyex la revisa" — `solicitudes_orden` (2026-09-02)

Concreción de "lo vincula o lo crea el equipo de Radyex al procesar la orden".
El doctor **no escribe en `pacientes` ni en `ordenes`** (la RLS solo deja a
equipo/admin crear pacientes). El formulario de "Nueva orden" del doctor crea una
fila en **`public.solicitudes_orden`** (estado `pendiente`):

1. Si el doctor elige a un paciente que **ya refirió**, la solicitud trae su
   `paciente_id` (revisión de Radyex = confirmar).
2. Si es **nuevo para él**, la solicitud trae `paciente_datos` (nombre, fecha de
   nacimiento, teléfono, correo tecleados) y `paciente_id` queda NULL.
3. Radyex revisa: busca en `pacientes` si esa persona ya existe (referida por otro
   doctor) → la **enlaza** a ese expediente, o **crea** uno nuevo.
4. Al **aprobar** se materializan `ordenes` + `orden_estudios` reales; la solicitud
   pasa a `aprobada` con su `orden_id`.

El doctor solo ve sus propias solicitudes y sus propias órdenes; la deduplicación y
el expediente compartido siguen siendo solo de Radyex. Es una mecánica **aparte** de
`solicitudes_pendientes` (esa es para altas de doctor y cambios sensibles a
perfiles). Esquema: `radyex-web/supabase/migrations/20260902120000_solicitudes_orden.sql`.
Pendiente: la función `aprobar_solicitud_orden()` (crear/enlazar paciente + folio +
insertar), y marcar la orden como "en revisión" en la vista "Mis órdenes" del doctor.

---

## Resumen de estado

| Decisión | Estado |
|---|---|
| 3 roles (Admin / Equipo Radyex / Doctor) | Cerrado |
| Alta de doctor: liga + aprobación de Monse | Cerrado |
| Cambios menores sin aprobación | Cerrado |
| Cambios sensibles con aprobación de Monse | Cerrado |
| Mecánica de solicitud pendiente compartida | Cerrado (diseño); pendiente construir en fase 2/3 |
| Bitácora solo-admin | Cerrado |
| Baja de doctor = desactivación, no borrado | Cerrado |
| Respaldo .rar al desactivar doctor | Pendiente de backend + pregunta abierta de alcance |
| Pacientes compartidos entre doctores | Cerrado (2026-08-24) — paciente único, filtro por `doctor_id` en la orden |
| Doctor manda orden → Radyex revisa/vincula paciente (`solicitudes_orden`) | Cerrado (2026-09-02, opción B2) — tabla propuesta; falta `aprobar_solicitud_orden()` + UI |
