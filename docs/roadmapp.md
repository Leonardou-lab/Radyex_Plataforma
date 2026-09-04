# RADYEX — Roadmap

Estado a la fecha (2026-09-03): **mockup aprobado por Monse (2026-08-24)**;
**fases 1, 2 y 3 completas** (fundaciones, esquema aplicado en Supabase, auth +
RLS + rutas por rol); **fase 4 en curso** — ya migradas y leyendo datos reales
`/ordenes` (vista Doctor) y `/admin/ordenes` (vista Radyex). Ver
`docs/PROGRESO.md`. Monse también respondió las preguntas de perfiles y accesos
— decisiones cerradas en `docs/perfiles-y-acceso.md`.

Ver detalle del estado en `docs/PROGRESO.md`, de la migración en
`docs/migracion-nextjs.md`, y del modelo de acceso en `docs/perfiles-y-acceso.md`.

---

## Compuertas antes de escribir backend (resolver con Monse)

Estado actualizado tras las respuestas de Monse del 2026-08-24:

1. ~~**Aprobación del mockup.**~~ **Resuelto — aprobado.** Cambios estructurales
   de aquí en adelante requieren cotización aparte.
2. ~~**Verificación de doctores al auto-registrarse.**~~ **Resuelto.** Registro no
   abierto: liga + aprobación manual del Administrador (Monse). Detalle en
   `docs/perfiles-y-acceso.md`.
3. ~~**Radyex admin vs. no-admin.**~~ **Resuelto.** 3 roles formales (Administrador,
   Equipo Radyex, Doctor); el equipo no-admin no ve la bitácora legal completa.
   Detalle en `docs/perfiles-y-acceso.md`.
4. **Deploy:** Netlify + dominio propio vs. el GitHub Pages actual. **Sigue abierto**
   (ver `docs/PROGRESO.md` § Pendientes de resolver con Monse).

~~**Pacientes compartidos entre doctores.**~~ **Resuelto (2026-08-24).** Paciente =
una sola fila (expediente maestro de Radyex); cada orden lleva su propio `doctor_id`.
El doctor ve solo las órdenes que él pidió; Radyex ve el expediente completo. Detalle
en `docs/perfiles-y-acceso.md`.

**Pregunta abierta restante** (no bloquea el backend base, solo un detalle puntual de
fase 6 — ver `docs/perfiles-y-acceso.md`):

- **Alcance del respaldo .rar al desactivar un doctor:** qué incluye exactamente y a
  qué correo se envía.

---

## Fases

**Fase 1 — Fundaciones + pantalla de referencia.**
Proyecto Next.js, tokens de diseño portados, seed local, y "Mis órdenes" migrada como
plantilla. No toca Supabase/R2/auth. (Detalle en `docs/migracion-nextjs.md`.)

**Fase 2 — Modelo de datos.**
Esquema en Supabase: usuarios/roles (3 roles de `docs/perfiles-y-acceso.md`),
doctores, pacientes (una fila por persona, expediente maestro de Radyex), órdenes
(con `doctor_id` y `paciente_id`), estudios, archivos, bitácora, y la tabla de
**solicitudes pendientes** (mecánica compartida de aprobación: altas de doctor +
cambios sensibles a perfiles). `docs/orden-de-estudio.md` define órdenes/estudios;
`common.js`/`lib/data.ts` dan la estructura. Sin preguntas abiertas pendientes que
bloqueen este esquema.

**Fase 3 — Auth + RLS (el corazón). COMPLETADA (2026-08-28).**
Los dos clientes de Supabase (`radyex-web/lib/client.ts` y `lib/server.ts`),
`radyex-web/proxy.ts` (refresco de sesión en cada petición), login real con
`signInWithPassword` y landing por rol, protección de rutas por rol vía
layouts (`app/(doctor)` y `app/(radyex)`, con los casos huérfano y
sin-acceso resueltos), el renombrado de campos de `lib/data.ts` a español
alineado a las columnas reales (`docs/mapeo-campos.md`), y
`registrar_acceso()` enganchada al login del doctor — verificado en vivo
que estampa `ultimo_acceso` en `public.doctores`. Detalle completo en
`docs/PROGRESO.md`. Registro con verificación, recuperación de contraseña y
verificación de correo (de fábrica de Supabase) y el registro de doctor vía
liga + aprobación del Administrador quedan para cuando se necesiten — no
bloquean el resto de las fases. **Row Level Security** ya estaba aplicada
desde el esquema (fase 2): cada doctor solo ve sus pacientes/órdenes; el
equipo Radyex no ve la bitácora legal completa; solo el Administrador sí
— reglas exactas en `docs/perfiles-y-acceso.md`.

**Fase 4 — Migrar el resto de pantallas. EN CURSO (desde 2026-08-31).**
Convertir cada pantalla aprobada a componentes conectados a datos reales, con "Mis
órdenes" como patrón. El orden por bloques, el patrón exacto y los errores de
secuencia que hacen tropezar están en `docs/migracion-nextjs.md` § "Fase 4 — Orden
de migración". Hecho hasta ahora: cimientos (Bloque 0) y **Órdenes (Radyex)**.
Siguiente: el formulario de **Nueva orden** del doctor.

Desvío importante de esta fase (2026-09-02/03): como un doctor **no puede escribir
en `pacientes`** (RLS), "Nueva orden" no crea la orden — crea una **solicitud** en
`public.solicitudes_orden` que el equipo Radyex revisa (crea o enlaza el paciente)
antes de materializar `ordenes` + `orden_estudios` vía
`public.aprobar_solicitud_orden()`. Ambas piezas de backend ya están aplicadas en
Supabase; falta la UI (formulario del doctor + pantalla de revisión de Radyex). Ver
`docs/perfiles-y-acceso.md` § "Flujo … `solicitudes_orden`".

Ahí también se decidió el **folio**: RADYEX genera el suyo interno,
`OR-AAMMDD-NNNN`, independiente del folio operativo del centro (que depende de datos
externos al sistema y no se puede replicar).

**Fase 5 — Archivos en R2.**
Subida asociada a paciente/doctor/orden; descargas con URLs firmadas temporales. Aquí
el acceso y la descarga **disparan el registro en la bitácora** (evento legal clave).
Egress cero de R2 = por eso se eligió, dado que los doctores descargan seguido.

**Fase 6 — Rellenar los TODO del front.**
Registro real de la bitácora (append-only + RLS, solo INSERT/SELECT, retención
NOM-004, incluyendo quién del equipo subió cada archivo), agregaciones reales de
reportes, envío del buzón al correo de Monse, notificación de cumpleaños, el flujo de
aprobación de cambios sensibles y altas de doctor (solicitud pendiente → aviso a
Monse → aprobar/rechazar), y la desactivación de doctores (conserva expedientes por
NOM-004; el respaldo .rar por correo queda pendiente de definir alcance, ver
`docs/perfiles-y-acceso.md`). Es "conectar lo que ya está dibujado".

**Módulo de gestión de equipo (usuarios internos Admin + Equipo).**
Pantalla "Equipo" dentro del módulo de Admin (solo visible para rol Admin) para que
Monse dé de alta y de baja a su propio equipo SIN tocar Supabase ni depender del
desarrollador. Hoy esas cuentas se crean a mano en dos lugares (`auth.users` +
`public.usuarios` con el rol), lo que ata cada contratación o despido al
desarrollador — insostenible. "Agregar miembro" hace en un solo flujo las dos
operaciones que hoy son manuales: (1) crear el usuario en Auth
(`supabase.auth.admin.createUser`) y (2) insertar su fila en `public.usuarios`
(id = id de auth.users, rol, nombre, correo); Monse nunca ve que por debajo son dos
tablas. Baja = DESACTIVAR, no borrar (mismo criterio que la desactivación de
doctores: por NOM-004 y la bitácora se conserva la fila y su rastro de auditoría;
borrar rompería la trazabilidad que exige la LFPDPPP). Reactivar un correo ya
existente en vez de duplicarlo. Restricción técnica: requiere la service-role key,
que vive SOLO en el servidor (Server Action o Route Handler, variable de entorno sin
prefijo `NEXT_PUBLIC_`, nunca en el navegador) — esta superficie de seguridad nueva
es la razón por la que este módulo es de Fase 6 y no del login. Aplica solo a
usuarios internos; el alta de doctores es aparte, vía `aprobar_solicitud()`. Depende
de tener el registro abierto DESHABILITADO en Auth. Feature con valor comercial:
debe quedar explícita en el alcance con Monse o en el acuerdo de soporte
post-lanzamiento, no incluirse por defecto.

**Fase 7 — Pruebas y entrega.**
Semilla anonimizada; probar permisos por rol (sobre todo que un doctor no vea
pacientes de otro); UAT con Monse y un doctor real; deploy con dominio; capacitación.
Ahí arranca la garantía de 30 días.

---

## No negociable (aunque apriete el tiempo)

- **RLS** (fase 3): control de acceso por rol/doctor.
- **Registro de la bitácora** (fase 6): quién accedió/descargó qué expediente y cuándo.

Ambos son cumplimiento de la LFPDPPP con datos clínicos de menores. Lo que **sí** se
puede simplificar si urge: pulido de reportes, mapeo fino de paquetes, detalle de
modelos/cefalometría.

---

## Mejoras futuras (después del backend base, no ahora)

Pedidas por Monse el 2026-08-24, fuera del núcleo de las fases 2-7:

- **Semáforo de actividad del doctor:** indicador visual por doctor según fecha del
  último estudio pedido — rojo (sin estudios ≥1 año), naranja (≥4 meses), verde
  (<4 meses, activo). Cálculo derivado, no requiere datos nuevos más allá de las
  fechas de orden que ya existen en el modelo.
- **Respaldo .rar + envío por correo al desactivar un doctor:** ligado a la baja de
  doctor (fase 6). Alcance exacto pendiente de definir con Monse — ver "pregunta
  abierta" en `docs/perfiles-y-acceso.md`.

---

## Notas legales (contexto, confirmar con Monse/abogado)

- **LFPDPPP:** el aviso de privacidad y el proceso ARCO los mantiene el centro, no
  Leonardo. Los pacientes no acceden a la plataforma.
- **NOM-004-SSA3-2012:** retención de expediente clínico 5 años.
- Cero datos reales de pacientes fuera de producción; usar semilla anonimizada.
