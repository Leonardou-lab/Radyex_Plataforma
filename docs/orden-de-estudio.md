# Orden de estudio RADYEX — modelo de dominio

Transcripción del formato en papel que el doctor llena para solicitar estudios.
Esta es la fuente de verdad para la pantalla **doctor-nueva-orden.html** y, más
adelante, para el esquema de base de datos y el formulario real en Next.js.

> Nota: las pantallas del equipo (EzDent-i / CBCT / PANO / CEPH) que aparecen al
> final son el software con el que el técnico de RADYEX **captura** el estudio.
> No van en el formulario del doctor; se incluyen solo como contexto del flujo
> interno.

---

## Encabezado

- Fecha

## Datos del doctor

- Dr./Dra. (nombre)
- Email
- WhatsApp
- Indicaciones (texto libre)
- Entrega: Impreso / Digital (elegir una)

## Datos del paciente

- Paciente (nombre)
- Email
- WhatsApp
- Fecha de nacimiento

---

## Estudios que se pueden solicitar

### Radiografías intraorales
- Periapical (adulto / infantil) — con opción **Sensor** o **RX**, y selección de
  dientes por nomenclatura FDI:
  - Infantil: 55 54 53 52 51 | 61 62 63 64 65 · 85 84 83 82 81 | 71 72 73 74 75
  - Adulto: 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28 · 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
- Oclusal
- Superior
- Inferior
- Aleta de mordida

### Radiografías extraorales
- Panorámica
- Lateral de cráneo
- Full lateral
- Carpal
- P.A. de cráneo
- A.P. de cráneo
- Waters
- A.T.M.
- Towne
- Hirtz
- Senos paranasales (Cadwell)
- Anteposterior

### Fotografías (intraoral / extraoral)
- Papel fotográfico
- Digital

### Modelos
- Estudio
- Trabajo
- Impreso 3D
- Escaneo intraoral (3Shape / Invisalign)

### Cefalometría computarizada
- Ricketts
- Steiner
- Mac Namara
- Tweed
- Jarabak
- Roth-Jarabak
- Downs
- Ricketts resumido
- Cefalometría P.A. de cráneo
- Otro (especificar) — texto libre

### Tomografía 3D (elegir FOV)
- 16×9 — óptimo para Dx de sinusitis y A.T.M.
- 12×9 — óptimo para cubrir todo el arco dental
- 8×9 — óptimo para selección de arco izquierdo, derecho y central
- 8×5 — óptimo para cubrir arco superior o inferior
- 5×5 — óptimo para cubrir de 3 a 4 dientes (indicar **Zona**)

---

## Paquetes (selección rápida que agrupa varios estudios)

- **Ortodoncia:** panorámica + lateral de cráneo + cefalometría + fotografías + modelos
- **Diagnóstico:** panorámica + fotografías + modelos
- **Implantología:** tomografía + guía quirúrgica (diseño e impresión) + modelos + escaneos 3D

Al elegir un paquete, se deben marcar automáticamente los estudios que lo componen.

### Contenido exacto pre-marcado por paquete

Confirmado con Monse (2026-08-26): cada paquete debe **pre-marcar su contenido
completo** al elegirse — el doctor luego desmarca o cambia en el formulario lo que no
quiera, no al revés. Esto precisa qué significa "cefalometría", "fotografías" y
"modelos" arriba:

- **Ortodoncia:** Panorámica, Lateral de cráneo, Cefalometría **Ricketts** (técnica
  por default), Fotografías **Digital** (por default), Modelos **Estudio y Trabajo**
  (ambos).
- **Diagnóstico:** Panorámica, Fotografías **Digital** (por default), Modelos
  **Estudio y Trabajo** (ambos).
- **Implantología:** Tomografía 3D FOV **12×9** (por default) + guía quirúrgica (nota
  en Indicaciones, no es un estudio marcable), Modelos **Estudio y Trabajo** (ambos),
  Escaneo intraoral.

Fuente de verdad (esquema): `radyex-web/supabase/migrations/20260824120100_catalogo_estudios_seed.sql`,
tabla `paquete_estudios`.

- ✅ `radyex-web/lib/data.ts` (`PAQUETES`) **ya está alineado 1:1** con esa tabla
  (2026-09-03, al arrancar el sub-paso 3.2 de la migración): se agregó "Trabajo"
  (modelos) a Ortodoncia y Diagnóstico, y "Estudio" + "Trabajo" a Implantología.
  Verificado por comparación automática de los tres paquetes.
- ⏳ El mockup (`assets/js/common.js`) **sigue desalineado** — marca de menos. Es
  referencia congelada y ya no alimenta la app real, así que se corrige solo si se
  vuelve a usar el prototipo estático para demo.

Nota: la Tomografía 3D de Implantología no aparece en `items` ni en
`paquete_estudios` a propósito — no es un estudio de checkbox, se marca fijando el
FOV (`PAQUETES[].fov = '12x9'`).

---

## Entrega física (estudios que no se digitalizan)

Decisión validada con Monse (2026-08-19): **todos** los estudios se mantienen en el
formulario, ninguno se elimina. Los que no se pueden digitalizar llevan un badge
visual "Entrega física" — es informativo, no bloquea la selección. El doctor sigue
eligiendo Impreso/Digital como entrega general de la orden, pero estos estudios en
particular **siempre** son de entrega física (el paciente los recoge en físico), sin
importar esa elección general.

Estudios/componentes que son de entrega física:

- **Periapical** — solo cuando el doctor elige **RX** (con **Sensor** es digital).
- **Oclusal, Superior, Inferior, Aleta de mordida** (radiografías intraorales).
- **Papel fotográfico** (Digital, dentro de fotografías, no lleva el badge).
- **Estudio, Trabajo** (modelos — Impreso 3D y Escaneo intraoral no llevan el badge).

Nada en Radiografías extraorales, Cefalometría ni Tomografía 3D es de entrega física.

### Paquetes: componentes de entrega física que incluyen

- **Ortodoncia:** el componente de modelos (Estudio) es de entrega física.
- **Diagnóstico:** el componente de modelos (Estudio) es de entrega física.
- **Implantología:** modelos y **guía quirúrgica** son de entrega física — la guía
  quirúrgica no es un estudio marcable del catálogo (no tiene checkbox propio, solo
  la nota que se agrega a "Indicaciones"), por eso no se puede derivar solo de los
  estudios que el paquete marca automáticamente.

Implementación de referencia (mockup): `assets/js/common.js` — cada ítem del catálogo
(`STUDY_CATEGORIES`) puede traer `entregaFisica: true` (siempre física) o
`entregaFisica: "si-rx"` (el caso especial de Periapical). Cada paquete
(`PAQUETES`) puede traer `entregaFisicaExtra: [...]` para componentes de entrega
física que no son un estudio marcable. `doctor/nueva-orden.html` lee esos flags para
pintar el badge — no está codificado a mano por pantalla. Mismos flags portados en
`radyex-web/lib/data.ts` para cuando se migre esta pantalla (fase 4).

---

## Reglas de mapeo formulario → base de datos

Reglas que el formulario ya cumple y que la migración a Next.js (sub-paso 3.2 de
`docs/migracion-nextjs.md`) tiene que respetar.

### 1. El `value` de un control de opción fija sale en el formato canónico de la BD

**El `value` de todo control de opción fija (radio, checkbox, select) se emite en el
formato canónico de la columna destino, nunca en el formato de display.** La etiqueta
que ve el doctor se mantiene como esté; lo que cambia es solo el valor que viaja.

Origen (2026-09-03): los radios de Periapical emitían `value="Sensor"` / `value="RX"`,
pero `orden_estudios.tipo_captura` tiene `check (tipo_captura in ('sensor','rx'))` en
minúscula — un insert con `'RX'` habría reventado el check. Se corrigió en
`doctor/nueva-orden.html` (`value="sensor"` / `value="rx"`, labels "Sensor" / "RX"
intactos), junto con los tres sitios de JS que comparaban contra el valor viejo
(el badge de "Entrega física" y el resaltado de los pills).

Formatos canónicos vigentes de los controles de este formulario:

| Control | Columna destino | Formato canónico |
|---|---|---|
| Entrega (Impreso / Digital) | `ordenes.entrega` | enum `tipo_entrega`: `'Impreso'`, `'Digital'` (**sí van capitalizados**) |
| Periapical Sensor / RX | `orden_estudios.tipo_captura` | `'sensor'`, `'rx'` (minúscula) |
| FOV de Tomografía 3D | `orden_estudios.fov` | `catalogo_fov.value`: `'16x9'`, `'12x9'`, `'8x9'`, `'8x5'`, `'5x5'` |
| Checkbox de estudio | `orden_estudios.estudio_id` | `catalogo_estudios.id`: `'periapical'`, `'panoramica'`, … |

Campos de texto libre (`zona`, `nota_libre`, `indicaciones`) no tienen formato
canónico: van tal cual los escribe el doctor.

### 2. Tomografía 3D: la Server Action debe sintetizar el estudio

La tomografía 3D **no tiene un control de estudio propio en el formulario**; se infiere
de la selección de FOV. La Server Action de 3.2 **DEBE sintetizar** un estudio
`{ estudio_id: 'tomografia-3d', fov: <valor del radio>, zona: <valor de #fovZona> }`
cuando haya un FOV seleccionado, y agregarlo al array de estudios de la solicitud. Sin
esto, las órdenes de tomografía se registran sin su `estudio_id` y la fila de
`catalogo_estudios` `'tomografia-3d'` nunca se usa.

Contexto: el resto de las categorías se pintan como checkboxes desde
`STUDY_CATEGORIES`, y cada uno emite su `estudio_id`. Tomografía 3D se pinta aparte,
como tarjetas de FOV (radios `name="fov"`), y al enviar el mockup solo produce la
etiqueta de display `"Tomografía 3D — 12 × 9"` — que no es un id de catálogo. La fila
`'tomografia-3d'` sí existe en la BD (con `requiere_fov = true`), y el trigger
`validar_orden_estudio()` exige el `fov` cuando ese estudio se inserta, además de la
`zona` cuando el FOV es `5x5` (`catalogo_fov.requiere_zona`).

---

## Contexto: software de captura del técnico (EzDent-i) — NO va en el formulario del doctor

Menú principal: CT · Panorama · Cefalometría · Sensor intraoral · Cámara intraoral · TWAIN · Importar

- **CBCT (CT):** FOV (16×9, 12×9, 8×9, 8×5, 5×5) · Vertical (Maxilla, Occlusion, Mandible, TMJ, Airway) · Horizontal (Right, Center, Left) · Tooth (Right, Incisor, Left, Right Molar, Left Molar) · Image (High Resolution, Green) · Voxel (Standard 0.20, Application 0.30)
- **PANO:** Normal / Magic PAN · Arch (Narrow, Normal, Wide, Child, Orthogonal) · Examination (Standard, Right, Front, Left, Bitewing…) · Special (TMJ, Sinus…)
- **CEPH:** Examination (Lateral, Full Lateral, PA, SMV, Waters' view, Carpus)

El doctor pide "tomografía 16×9" en la orden; el técnico traduce eso a estos
parámetros al operar el equipo. La correspondencia importará para el flujo interno,
no para la pantalla de nueva orden.