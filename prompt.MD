# Prompt para Claude Code — Extensión del mockup RADYEX

> Pégalo tal cual en Claude Code. Asume que el archivo HTML actual del mockup ("Mis órdenes") ya está en el proyecto.

---

## Contexto

RADYEX es una plataforma web para un centro de radiología dental. Digitaliza órdenes en papel, expedientes físicos y entrega de resultados. Hay **dos tipos de usuarios** que debes representar en este mockup:

- **Radyex (personal interno / administrador):** da de alta a los doctores, sube los archivos de estudios a las carpetas correspondientes y gestiona todo.
- **Doctor referente (externo):** solo hace dos cosas — **solicitar órdenes** de estudio y **consultar/descargar los archivos de sus pacientes**. Nada más.

Los pacientes **no** entran a la plataforma. El idioma de toda la interfaz es **español**.

## Archivo base y sistema de diseño (respetar sin excepción)

Ya existe un mockup de la pantalla "Mis órdenes". **Léelo primero y reutilízalo**; no lo reescribas desde cero ni cambies su estética. Debes conservar exactamente:

- La paleta y las variables CSS ya definidas (`--ink`, `--accent`, `--warn`, `--success`, `--pending`, etc.).
- Tipografías **Lexend** (display) + **Inter** (UI).
- El estilo: navy/teal, tarjetas, esquinas geométricas, chips/pills de estatus, sidebar oscuro, modal de detalle con tabs por año.
- Los componentes ya construidos (order cards, status pills, search box, chips de filtro, avatares, modal, file rows). Reúsalos en las pantallas nuevas.
- La responsividad (breakpoint ~880px con sidebar colapsado) y los detalles de accesibilidad (`focus-visible`, `aria-label`).

**Recomendación de estructura:** conviértelo en un **prototipo navegable multipantalla**. Extrae los estilos comunes a un `styles.css` compartido y separa cada pantalla en su propio archivo HTML enlazado desde el sidebar. Crea un **`index.html` de entrada con un selector de rol** ("Entrar como Radyex" / "Entrar como Doctor") para que el cliente pueda alternar entre las dos vistas. Es un mockup estático: sin backend ni auth reales; simula los estados (validación, éxito, carga de archivo) con JS del lado del cliente. El estado puede reiniciarse al recargar.

---

## Pantallas a construir

### A. VISTA RADYEX (personal interno)

Sidebar del rol Radyex: Inicio · Órdenes · **Doctores** · **Subir archivos** · Pacientes · (Bitácora — placeholder opcional).

**A1. Gestión de doctores / Alta de usuarios**
- Tabla de doctores registrados con columnas: Doctor, Especialidad/Consultorio, Correo, Usuario, Estatus (Activo/Inactivo con pill), Último acceso, Acciones (editar, resetear contraseña).
- Botón "Nuevo doctor" que abre un modal (mismo estilo del modal existente) con el formulario:
  - Nombre completo, Especialidad, Consultorio/Clínica, Correo, Teléfono.
  - **Usuario** (autogenerado editable, ej. a partir del nombre) y **Contraseña temporal** con botón "Generar".
  - Checkbox "Enviar credenciales por correo".
  - Botón "Crear usuario".
- Estado de éxito: toast/confirmación tipo "Usuario creado. Credenciales enviadas a [correo]." y el nuevo doctor aparece en la tabla.
- Objetivo: demostrar **cómo Radyex da de alta a un doctor con su usuario y contraseña**.

**A2. Subir archivo a la carpeta del doctor**
- Flujo en un formulario/pasos:
  1. Seleccionar **doctor** (dropdown con búsqueda).
  2. Seleccionar **paciente** de ese doctor (o la orden pendiente asociada).
  3. Tipo de estudio + fecha del estudio.
  4. **Zona de arrastrar y soltar** (drag & drop) para el PDF / imagen radiológica, con preview del archivo cargado (nombre, tamaño, ícono).
  5. Botón "Subir a la carpeta del doctor".
- Muestra a un lado los archivos que ya existen en la carpeta de ese paciente, para que quede claro **dónde aterriza** el archivo.
- Al subir: éxito + el archivo aparece en la carpeta, y **la orden cambia de "En proceso/Pendiente" a "Finalizado"** (conecta con el sistema de estatus ya existente). Nota visual de "el doctor será notificado".
- Objetivo: demostrar **cómo los chicos de Radyex suben el archivo a la carpeta del doctor**.

### B. VISTA DOCTOR (referente externo)

Sidebar del rol Doctor **reducido**: Inicio · Mis órdenes · Pacientes (con sus archivos). Sin nada de administración. Deja claro que sus únicos procesos son **solicitar órdenes** y **ver archivos de sus pacientes**.

**B1. Mis órdenes (ya existe)**
- Reutiliza la pantalla actual como la vista del doctor. Deja el botón "Nueva orden" funcional (abre B2).

**B2. Nueva orden (solicitar estudio)**
- Formulario que ve el doctor al hacer la orden:
  - **Paciente:** seleccionar existente o "+ Nuevo paciente" (nombre, edad, teléfono, correo).
  - **Tipo de estudio:** Tomografía CBCT, Radiografía panorámica, Serie periapical, Cefalométrica lateral.
  - **Indicaciones clínicas / motivo** (textarea).
  - Prioridad (Normal / Urgente) y fecha deseada.
  - Botón "Enviar solicitud".
- Confirmación: "Orden enviada. Radyex procesará el estudio." con un **folio generado** en el mismo formato existente (`LN`/`TM` + fecha). La orden nueva aparece en "Mis órdenes" con estatus "Pendiente".
- Objetivo: demostrar **lo que ve el doctor al hacer una orden**.

**B3. Ver archivos de sus pacientes**
- Reutiliza el modal de detalle con tabs por año ya construido. Asegura que cada archivo tenga acciones **"Ver"** (abre un preview placeholder del PDF/imagen) y **"Descargar"**.
- Debe quedar claro que el doctor **solo ve a sus propios pacientes**.
- Objetivo: demostrar **cómo el doctor visualiza sus archivos**.

---

## Requisitos de fidelidad

- Datos ficticios **coherentes con los existentes**: reutiliza los mismos doctores (Dra. Patricia Núñez, Dr. Iván Cordero, Dra. Renata Solís), pacientes de Puebla y el formato de folios ya usado.
- Toda la UI en español, tono claro para usuarios no técnicos.
- Interacciones que se sientan reales: validación básica de formularios, estados de éxito/toast, preview de archivo en el drag & drop, apertura/cierre de modales con Escape y clic fuera.
- Mantén accesibilidad (`focus-visible`, `aria-label`) y responsividad en todas las pantallas nuevas.
- Código limpio y comentado en español, listo para presentar al cliente.

## Entregable

Un prototipo navegable con: `index.html` (selector de rol) + las pantallas de ambos roles enlazadas desde sus respectivos sidebars, compartiendo `styles.css`. Todas las pantallas deben poder recorrerse haciendo clic, sin pasos rotos.