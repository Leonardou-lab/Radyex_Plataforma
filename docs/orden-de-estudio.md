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

---

## Contexto: software de captura del técnico (EzDent-i) — NO va en el formulario del doctor

Menú principal: CT · Panorama · Cefalometría · Sensor intraoral · Cámara intraoral · TWAIN · Importar

- **CBCT (CT):** FOV (16×9, 12×9, 8×9, 8×5, 5×5) · Vertical (Maxilla, Occlusion, Mandible, TMJ, Airway) · Horizontal (Right, Center, Left) · Tooth (Right, Incisor, Left, Right Molar, Left Molar) · Image (High Resolution, Green) · Voxel (Standard 0.20, Application 0.30)
- **PANO:** Normal / Magic PAN · Arch (Narrow, Normal, Wide, Child, Orthogonal) · Examination (Standard, Right, Front, Left, Bitewing…) · Special (TMJ, Sinus…)
- **CEPH:** Examination (Lateral, Full Lateral, PA, SMV, Waters' view, Carpus)

El doctor pide "tomografía 16×9" en la orden; el técnico traduce eso a estos
parámetros al operar el equipo. La correspondencia importará para el flujo interno,
no para la pantalla de nueva orden.