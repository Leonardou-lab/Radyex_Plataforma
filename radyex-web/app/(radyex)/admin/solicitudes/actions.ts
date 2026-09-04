"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { calcAge } from "@/lib/data";

export type ResultadoRevision =
  | { ok: true; folio?: string }
  | { ok: false; error: string };

/** Candidato de deduplicación: un paciente que ya existe en el expediente maestro. */
export type CandidatoPaciente = {
  id: string;
  nombreCompleto: string;
  edad: number | null;
  telefono: string | null;
  correo: string | null;
};

/**
 * Busca pacientes existentes por nombre, para que Radyex decida si el
 * "paciente nuevo" que mandó el doctor es en realidad alguien ya registrado
 * (referido por otro doctor). Es el corazón de la deduplicación.
 *
 * La RLS "admin y equipo ven todos los pacientes" da acceso al expediente
 * maestro completo — a diferencia del doctor, que solo ve los suyos.
 */
export async function buscarPacientes(termino: string): Promise<CandidatoPaciente[]> {
  const texto = termino.trim();
  // Menos de 3 letras devuelve demasiado ruido para ser útil.
  if (texto.length < 3) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacientes")
    .select("id, nombre_completo, fecha_nacimiento, telefono, correo")
    .ilike("nombre_completo", `%${texto}%`)
    .order("nombre_completo")
    .limit(10);

  if (error) {
    console.error("No se pudieron buscar pacientes:", error.message);
    return [];
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    nombreCompleto: p.nombre_completo,
    edad: p.fecha_nacimiento ? calcAge(p.fecha_nacimiento) : null,
    telefono: p.telefono,
    correo: p.correo,
  }));
}

/**
 * Aprueba una solicitud: crea o enlaza el paciente, genera el folio y
 * materializa `ordenes` + `orden_estudios`. Todo eso lo hace la función
 * `aprobar_solicitud_orden()` en la base de datos, en UNA transacción — si
 * algo falla, no queda ni orden ni paciente a medias.
 *
 * `pacienteId` solo se manda cuando Radyex decidió ENLAZAR a un expediente
 * existente. Si va null y la solicitud traía `paciente_datos`, la función
 * crea el paciente. Si la solicitud ya venía con su `paciente_id`, este
 * parámetro se ignora.
 */
export async function aprobarSolicitud(
  solicitudId: string,
  pacienteId: string | null,
  comentario: string | null,
): Promise<ResultadoRevision> {
  const supabase = await createClient();

  // Firma única de 4 parámetros (verificada vía pg_proc, no hay sobrecarga).
  const { data, error } = await supabase.rpc("aprobar_solicitud_orden", {
    p_solicitud_id: solicitudId,
    p_aprobar: true,
    p_paciente_id: pacienteId,
    p_comentario: comentario,
  });

  if (error) {
    console.error("No se pudo aprobar la solicitud:", error.message);
    // La función lanza excepciones con mensajes ya redactados para humanos
    // (p. ej. "La solicitud ya fue resuelta"), así que se pasan tal cual.
    return { ok: false, error: error.message };
  }

  revalidarPantallas();

  // La función devuelve jsonb: { solicitud_id, estado, orden_id, folio, paciente_id }
  const folio = (data as { folio?: string } | null)?.folio;
  return { ok: true, folio };
}

/**
 * Rechaza una solicitud. No crea nada: solo la marca 'rechazada' con el
 * comentario, que es lo que verá el equipo al revisar el historial.
 */
export async function rechazarSolicitud(
  solicitudId: string,
  comentario: string | null,
): Promise<ResultadoRevision> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("aprobar_solicitud_orden", {
    p_solicitud_id: solicitudId,
    p_aprobar: false,
    p_paciente_id: null,
    p_comentario: comentario,
  });

  if (error) {
    console.error("No se pudo rechazar la solicitud:", error.message);
    return { ok: false, error: error.message };
  }

  revalidarPantallas();
  return { ok: true };
}

/**
 * Una aprobación cambia tres pantallas a la vez: la cola de revisión (una
 * solicitud menos), las órdenes de Radyex (una orden más) y "Mis órdenes" del
 * doctor (sale de "En revisión" y entra a la lista con su folio).
 */
function revalidarPantallas() {
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/ordenes");
  revalidatePath("/ordenes");
}
