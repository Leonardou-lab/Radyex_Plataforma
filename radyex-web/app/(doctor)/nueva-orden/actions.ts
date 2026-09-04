"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import {
  construirEstudiosSolicitud,
  hayErroresEstudios,
  validarEstudios,
  type SeleccionEstudios,
} from "@/lib/estudios-solicitud";
import type { Entrega } from "@/lib/data";

/**
 * Datos que el formulario manda para crear una solicitud de orden.
 *
 * Se recibe como objeto plano y no como FormData (a diferencia del login):
 * la selección de estudios es una estructura anidada (dientes, FOV, paquetes)
 * que no cabe en pares clave/valor sin serializarla a mano. Next.js serializa
 * el objeto solo al cruzar al servidor.
 */
export type DatosSolicitud = {
  /** Paciente que el doctor ya refirió antes. Excluyente con `pacienteNuevo`. */
  pacienteId: string | null;
  /** Paciente nuevo para este doctor: Radyex lo creará o lo enlazará al revisar. */
  pacienteNuevo: {
    nombreCompleto: string;
    fechaNacimiento: string;
    telefono: string;
    correo: string;
  } | null;
  entrega: Entrega;
  indicaciones: string;
  estudios: SeleccionEstudios;
};

export type ResultadoSolicitud = { ok: true } | { ok: false; error: string };

/**
 * Crea la solicitud de orden del doctor.
 *
 * IMPORTANTE: el doctor NO crea la orden ni el paciente — eso lo hace Radyex
 * al revisar (`aprobar_solicitud_orden()`). Aquí solo se inserta una fila en
 * `solicitudes_orden` con estado 'pendiente'. Ver docs/perfiles-y-acceso.md
 * § "Flujo … solicitudes_orden".
 *
 * Todo lo que valida el formulario en el navegador se vuelve a validar aquí:
 * la validación del cliente es para que el doctor vea el error a tiempo, no
 * una defensa. La RLS y los CHECK de la BD son la última capa.
 */
export async function crearSolicitudOrden(datos: DatosSolicitud): Promise<ResultadoSolicitud> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  }

  // --- Validación del paciente: uno de los dos, nunca ninguno ni ambos ---
  if (!datos.pacienteId && !datos.pacienteNuevo) {
    return { ok: false, error: "Selecciona un paciente o registra uno nuevo." };
  }
  if (datos.pacienteNuevo) {
    if (!datos.pacienteNuevo.nombreCompleto.trim()) {
      return { ok: false, error: "Ingresa el nombre del paciente." };
    }
    if (!datos.pacienteNuevo.fechaNacimiento) {
      return { ok: false, error: "Ingresa la fecha de nacimiento del paciente." };
    }
  }

  // --- Validación de la orden ---
  if (datos.entrega !== "Impreso" && datos.entrega !== "Digital") {
    return { ok: false, error: "Elige cómo se entregará el estudio." };
  }
  if (hayErroresEstudios(validarEstudios(datos.estudios))) {
    return { ok: false, error: "Revisa los estudios seleccionados." };
  }

  // Aquí se aplica la regla de la tomografía: `construirEstudiosSolicitud`
  // sintetiza `{ estudio_id: 'tomografia-3d', fov, zona }` si hay FOV elegido
  // (docs/orden-de-estudio.md § "Reglas de mapeo").
  const estudios = construirEstudiosSolicitud(datos.estudios);
  if (estudios.length === 0) {
    // El CHECK chk_estudios_es_array de la BD también lo rechaza; esto es
    // para dar un mensaje entendible en vez de un error de Postgres.
    return { ok: false, error: "Selecciona al menos un estudio." };
  }

  // `paciente_datos` solo viaja cuando es un paciente nuevo para el doctor.
  // Radyex lo usa para deduplicar contra los expedientes existentes.
  const pacienteDatos = datos.pacienteNuevo
    ? {
        nombre_completo: datos.pacienteNuevo.nombreCompleto.trim(),
        fecha_nacimiento: datos.pacienteNuevo.fechaNacimiento,
        telefono: datos.pacienteNuevo.telefono.trim() || null,
        correo: datos.pacienteNuevo.correo.trim() || null,
      }
    : null;

  const { error } = await supabase.from("solicitudes_orden").insert({
    // doctor_id = el propio doctor en sesión: es lo que exige la política de
    // INSERT (`doctor_id = auth.uid() and rol_actual() = 'doctor'`).
    doctor_id: user.id,
    paciente_id: datos.pacienteId,
    paciente_datos: pacienteDatos,
    entrega: datos.entrega,
    indicaciones: datos.indicaciones.trim() || null,
    estudios,
  });

  if (error) {
    console.error("No se pudo crear la solicitud de orden:", error.message);
    // 42501 = violación de RLS. El caso realista: mandó un `paciente_id` de
    // un paciente que no ha referido (la política lo exige). No se le da
    // detalle al cliente para no filtrar qué expedientes existen.
    if (error.code === "42501") {
      return { ok: false, error: "No puedes solicitar estudios para ese paciente." };
    }
    return { ok: false, error: "No se pudo enviar la solicitud. Inténtalo de nuevo." };
  }

  // "Mis órdenes" muestra las solicitudes pendientes en su sección "En
  // revisión", así que su cache tiene que invalidarse para que aparezca.
  revalidatePath("/ordenes");

  return { ok: true };
}
