// lib/auth.ts
// Helper de servidor para leer "¿quién es y qué rol tiene" en un solo
// lugar. Lo usan los layouts protegidos (app/(doctor)/layout.tsx,
// app/(radyex)/layout.tsx) y la Server Action de login
// (app/login/actions.ts) para no repetir la misma consulta tres veces.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

// Mismos 3 valores que el enum public.rol_usuario en Supabase.
export type RolUsuario = "admin" | "equipo_radyex" | "doctor";

export type UsuarioConRol =
  | { usuario: null; rol: null }
  | {
      usuario: { id: string; correo?: string; nombre: string };
      rol: RolUsuario | null;
    };

/**
 * Devuelve la sesión actual (si existe) junto con su rol y su nombre,
 * leídos de public.usuarios por el id del usuario.
 *
 * `rol: null` cubre a propósito DOS casos distintos con el mismo
 * resultado (cuenta "huérfana"): que la fila en public.usuarios todavía
 * no exista, o que la consulta falle por cualquier otro motivo. Nunca se
 * deja que un error de Supabase tumbe el layout que llama a esta función
 * — como mucho, se trata igual que "sin rol todavía" (y `nombre: ""`).
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
    .select("rol, nombre_completo")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return {
      usuario: { id: user.id, correo: user.email, nombre: "" },
      rol: null,
    };
  }

  return {
    usuario: { id: user.id, correo: user.email, nombre: data.nombre_completo },
    rol: data.rol as RolUsuario,
  };
}

/**
 * Etiqueta legible del rol, para mostrar bajo el nombre del usuario en
 * el Sidebar (slot `sidebar-user-role`). Cadena vacía si aún no hay rol.
 */
export function etiquetaRol(rol: RolUsuario | null): string {
  if (rol === "doctor") return "Doctor referente";
  if (rol === "equipo_radyex") return "Equipo Radyex";
  if (rol === "admin") return "Administración";
  return "";
}

/**
 * Guard para las pantallas del panel interno que son EXCLUSIVAS del
 * Administrador (bitácora legal completa, doctores, reportes — ver
 * docs/perfiles-y-acceso.md). El layout general de (radyex) ya dejó
 * pasar a Equipo Radyex y Administrador; esto recorta a solo Admin.
 *
 * Se usa en un layout.tsx anidado dentro de la ruta específica, sin
 * tocar el layout general de la zona:
 *
 *   // app/(radyex)/admin/bitacora/layout.tsx
 *   import { exigirAdmin } from "@/lib/auth";
 *   export default async function Layout({ children }) {
 *     await exigirAdmin();
 *     return <>{children}</>;
 *   }
 *
 * IMPORTANTE: `/admin/` es el namespace de URL del panel interno (equipo
 * Radyex + Administrador), NO una marca de "solo Administrador" — existe
 * solo para no chocar con las rutas de la vista Doctor (/ordenes,
 * /pacientes, /inicio, que se repiten en las dos vistas). Por eso
 * `exigirAdmin()` va SIEMPRE en un layout.tsx por subcarpeta
 * (admin/bitacora/, admin/reportes/, admin/doctores/) y NUNCA en
 * app/(radyex)/admin/layout.tsx: ahí sellaría también Órdenes, Pacientes
 * y Subir archivos, que son de equipo + admin.
 */
export async function exigirAdmin(): Promise<void> {
  const { rol } = await obtenerUsuarioConRol();
  if (rol !== "admin") {
    redirect("/sin-acceso");
  }
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
