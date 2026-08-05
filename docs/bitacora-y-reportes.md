# Bitácora y Reportes — módulo de administración

Monse juntó dos cosas en un solo apartado, pero tienen propósitos distintos y se
separan: **Bitácora** (registro legal de auditoría) y **Reportes** (métricas de
negocio: "cuántos estudios se realizaron"). Son dos secciones distintas dentro del
módulo de administración de Radyex.

Respetar el sistema de diseño de CLAUDE.md y .claude/rules/estilos.md (variables de
color, íconos Lucide, Lexend/Inter). Al terminar, actualizar docs/PROGRESO.md.

---

## A. Bitácora (auditoría — requisito legal LFPDPPP)

Registro de **quién hizo qué y cuándo**. Su fin es cumplimiento y seguridad, no
análisis de negocio. En el build real debe ser **solo-append** (se agrega, nunca se
edita ni se borra) y de solo lectura desde la interfaz.

### Eventos que registra
- Alta / edición de doctor
- Subida de archivo a la carpeta de un paciente
- Cambio de estatus de una orden
- **Visualización de un archivo de paciente**  ← clave para la ley
- **Descarga de un archivo de paciente**       ← clave para la ley
- Consulta de la propia bitácora (consultarla también es un evento auditable)

> Los dos eventos en negritas son el corazón del requisito ("quién accedió a qué
> expediente y cuándo"). Sin ellos la bitácora no cumple su función legal. Monse
> solo mencionó altas, subidas y cambios de estatus; hay que sumar acceso/descarga.

### Campos de cada evento
- Fecha y hora
- Usuario (actor) y su rol
- Acción (uno de los eventos de arriba)
- Objeto afectado (doctor, folio de orden o archivo/paciente)
- Detalle opcional (p. ej. estatus anterior → nuevo)

### Presentación (mockup, ahora)
- Tabla/lista cronológica inversa con filas de ejemplo (datos ficticios).
- Cada acción con su ícono Lucide (alta: user-plus · subida: upload · cambio de
  estatus: refresh-cw · visualización: eye · descarga: download · consulta: shield).
- Filtros visuales por tipo de acción, por usuario y por rango de fechas.
- Etiquetar como demostrativo.

### Diferido (backend — NO ahora)
- Registro real de eventos (triggers en Supabase o desde la app en cada acción sensible).
- Tabla **append-only** con RLS que solo permita INSERT y SELECT — nunca UPDATE ni DELETE.
- Retención alineada con NOM-004 (5 años).
- Marcar con TODO en el código.

---

## B. Reportes (métricas de negocio)

Responde "cuántos estudios se realizaron". **No sale de la bitácora**, sale de la
tabla de órdenes/estudios mediante conteos/agregaciones. Mantener separado del
registro legal.

### Métricas
- Total de estudios en un periodo (con selector de rango de fechas)
- Desglose por tipo de estudio (tomografía, panorámica, cefalometría, etc.)
- Por doctor referente (ranking de quién pide más)
- Órdenes pedidas vs. completadas
- Tendencia mensual

### Presentación (mockup, ahora)
- Tarjetas de conteo (KPIs) arriba + una gráfica simple (barras o línea) con datos
  ficticios. Mantener la gráfica **ligera** (SVG/CSS propio, o una librería mínima);
  no meter dependencias pesadas en el mockup.
- Etiquetar como demostrativo.

### Diferido (backend — NO ahora)
- Queries de agregación reales sobre las órdenes. Marcar con TODO.

---

## Permisos por perfil

- **Admin (Radyex):** bitácora completa (todos los usuarios y eventos) + reportes
  completos. Aquí vive el requisito legal.
- **Personal Radyex no-admin** (recepción / técnico): reportes operativos; la
  bitácora legal completa se reserva a admin.
- **Doctor:** **no** ve la bitácora global ni los reportes globales. (Opcional a
  futuro: su propia actividad y sus propias métricas, acotadas a lo suyo. Fuera de
  alcance en esta ronda.)

Para el mockup: ambos apartados viven en la **vista Radyex (admin)**. No agregarlos
a la vista Doctor.

---

## Checklist de aceptación

- [ ] Bitácora y Reportes son dos apartados separados en la vista Radyex.
- [ ] La bitácora incluye los eventos de visualización y descarga de archivos.
- [ ] Bitácora con filtros (acción, usuario, fecha) y datos ficticios, etiquetada demostrativa.
- [ ] Reportes con KPIs + una gráfica ligera y datos ficticios, etiquetada demostrativa.
- [ ] Nada de esto aparece en la vista Doctor.
- [ ] Lógica real (registro append-only, RLS, agregaciones) marcada como TODO/diferida.
- [ ] docs/PROGRESO.md actualizado.