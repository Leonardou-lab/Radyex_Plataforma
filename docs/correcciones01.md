# Correcciones de Monse — ronda 1

Tres cambios sobre el front end actual. Respetar el sistema de diseño de
CLAUDE.md y .claude/rules/estilos.md (paleta por variables, íconos Lucide,
tipografías Lexend/Inter). Al terminar, actualizar docs/PROGRESO.md.

---

## 1. Alta de doctor: fecha de nacimiento + cumpleaños

**Ahora (front end):**
- Agregar el campo **Fecha de nacimiento** al formulario de alta de doctor
  (modal en radyex-doctores.html). Tipo fecha, junto a los demás datos del doctor.
- Guardarlo en los datos ficticios del doctor (common.js) para que sea coherente
  con el resto de las pantallas.

**Diferido (requiere backend — NO construir la lógica ahora):**
- La notificación de cumpleaños al equipo de administración queda como **pendiente**.
  Déjala marcada, no implementada:
  - Un comentario `// TODO (backend): notificar al equipo admin cuando llegue el
    cumpleaños de un doctor` donde corresponda.
  - Una entrada en docs/PROGRESO.md bajo "Pendiente".
- Opcional (solo si no rompe la armonía): un placeholder visual en el panel de
  administración tipo tarjeta "Próximos cumpleaños" o un ícono de campana, marcado
  como demostrativo. La lógica real de notificación NO se hace en esta etapa.

---

## 2. Ajuste de color + visibilidad del logo en el sidebar

**Color:** el negro actual (#231F20) le pareció muy oscuro a Monse. Aclararlo un
poco, sin volver al azul marino y sin salirse de la familia del negro cálido:

    --ink: #34302F;        /* antes #231F20 — un poco más claro */
    --ink-soft: #4A4543;   /* versión suave para hovers */

(Son valores de partida; si Monse lo quiere aún más claro, subir hacia #3E3836.)
El resto de la paleta se queda igual.

**Logo en el sidebar (hacerlo más visible):**
- Colocar un **panel de fondo claro** detrás del logo, arriba del sidebar: un
  contenedor con esquinas redondeadas, fondo blanco (o --accent-soft #ECF8F8) y
  algo de padding, solo en la zona del logo. Así el logo resalta sobre el sidebar
  oscuro.
- Como el fondo del panel ahora es claro, usar el **logo a color**
  `assets/logo/radyex-logo.svg` (ya no la variante blanca), que es la versión de
  marca real.
- Aumentar un poco el tamaño del logo (de ~34px a ~42px de alto), manteniendo su
  proporción (~3.3:1) y el equilibrio visual del panel.
- En el sidebar colapsado / móvil, mostrar solo el ícono o una versión reducida,
  sin deformar.

---

## 3. Adaptación a móvil (navegador de celular)

Que todas las pantallas se usen bien en un teléfono. Breakpoint de teléfono en
**≤640px** (dejar el comportamiento de escritorio como está).

- **Navegación:** el sidebar oscuro se oculta y se vuelve un **drawer deslizable**
  (off-canvas) que abre con un botón **hamburguesa** en una barra superior fija.
  Fondo oscurecido detrás; cierra al tocar fuera o al elegir una opción.
- **Barra superior móvil:** hamburguesa + logo pequeño (sobre fondo claro para que
  se vea) + avatar.
- **Tarjetas de resumen (stats):** apiladas a 1 columna (o 2 si caben cómodas).
- **Listas y tarjetas de orden:** ancho completo, apiladas; que el pill de estatus
  y el chevron no rompan el layout (pueden pasar debajo del nombre).
- **Modales / detalle de paciente:** hoja casi a pantalla completa con scroll
  interno y botón de cierre grande.
- **Formularios (alta de doctor, nueva orden, subir archivo):** campos a una sola
  columna; inputs y botones con alto táctil ≥44px.
- **Nueva orden (formulario denso):** las secciones se apilan; la carta dental FDI
  con scroll horizontal si no cabe; los paquetes como botones grandes.
- Objetivos táctiles ≥44px; no depender de hover (usar estados táctiles/activos).
- Probar a **390px** de ancho.

---

## Checklist de aceptación

- [ ] Alta de doctor pide fecha de nacimiento y se guarda en los datos ficticios.
- [ ] Notificación de cumpleaños marcada como TODO + pendiente en PROGRESO (no implementada).
- [ ] --ink aclarado; el resto de la paleta intacto.
- [ ] Logo del sidebar más grande y sobre panel de fondo claro, usando el SVG a color.
- [ ] Navegación por drawer + hamburguesa en ≤640px; todo legible y usable a 390px.
- [ ] docs/PROGRESO.md actualizado.