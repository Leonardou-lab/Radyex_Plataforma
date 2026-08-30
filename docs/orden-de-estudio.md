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

Implementación de referencia (esquema): `radyex-web/supabase/migrations/20260824120100_catalogo_estudios_seed.sql`,
tabla `paquete_estudios`. **Pendiente:** el mockup (`assets/js/common.js`) y
`radyex-web/lib/data.ts` (`PAQUETES`) todavía no reflejan este contenido completo —
hoy marcan de menos (falta "Trabajo" en Ortodoncia/Diagnóstico, y falta Modelos por
completo en Implantología). Actualizar cuando se retome el front de "nueva orden".

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

## Contexto: software de captura del técnico (EzDent-i) — NO va en el formulario del doctor

Menú principal: CT · Panorama · Cefalometría · Sensor intraoral · Cámara intraoral · TWAIN · Importar

- **CBCT (CT):** FOV (16×9, 12×9, 8×9, 8×5, 5×5) · Vertical (Maxilla, Occlusion, Mandible, TMJ, Airway) · Horizontal (Right, Center, Left) · Tooth (Right, Incisor, Left, Right Molar, Left Molar) · Image (High Resolution, Green) · Voxel (Standard 0.20, Application 0.30)
- **PANO:** Normal / Magic PAN · Arch (Narrow, Normal, Wide, Child, Orthogonal) · Examination (Standard, Right, Front, Left, Bitewing…) · Special (TMJ, Sinus…)
- **CEPH:** Examination (Lateral, Full Lateral, PA, SMV, Waters' view, Carpus)

El doctor pide "tomografía 16×9" en la orden; el técnico traduce eso a estos
parámetros al operar el equipo. La correspondencia importará para el flujo interno,
no para la pantalla de nueva orden.