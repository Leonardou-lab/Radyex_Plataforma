// lib/auth.ts
// Helper de servidor para leer "¿quién es y qué rol tiene" en un solo
// lugar. Lo usan los layouts protegidos (app/(doctor)/layout.tsx,
// app/(radyex)/layout.tsx) y la Server Action de login
// (app/login/actions.ts) para no repetir la misma consulta tres veces.
import { createClient } from "@/lib/server";

// Mismos 3 valores que el enum public.rol_usuario en Supabase.
export type RolUsuario = "admin" | "equipo_radyex" | "doctor";

export type UsuarioConRol =
  | { usuario: null; rol: null }
  | { usuario: { id: string; correo?: string }; rol: RolUsuario | null };

/**
 * Devuelve la sesión actual (si existe) junto con su rol, leído de
 * public.usuarios por el id del usuario.
 *
 * `rol: null` cubre a propósito DOS casos distintos con el mismo
 * resultado (cuenta "huérfana"): que la fila en public.usuarios todavía
 * no exista, o que la consulta falle por cualquier otro motivo. Nunca se
 * deja que un error de Supabase tumbe el layout que llama a esta función
 * — como mucho, se trata igual que "sin rol todavía".
 */
export async function obtenerUsuarioConRol(): Promise<UsuarioConRol> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { usuario: null, rol: null };
  }

  // maybeSingle() no lanza error si no hay fila (a diferencia de single());
  // devuelve data: null. Aun así, por si acaso, error también se trata
  // como "sin rol" en vez de dejarlo reventar.
  const { data, error } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return { usuario: { id: user.id, correo: user.email }, rol: null };
  }

  return { usuario: { id: user.id, correo: user.email }, rol: data.rol as RolUsuario };
}

/**
 * A dónde debe mandarse a cada rol como "su inicio" (tras login, o al
 * intentar entrar a una zona que no le toca). Sin rol disponible, cae a
 * /login en vez de inventar un destino — evita otro limbo.
 */
export function rutaInicioPorRol(rol: RolUsuario | null): string {
  if (rol === "doctor") return "/ordenes";
  if (rol === "admin" || rol === "equipo_radyex") return "/admin";
  return "/login";
}
