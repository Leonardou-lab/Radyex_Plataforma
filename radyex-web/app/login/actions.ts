"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { obtenerUsuarioConRol, rutaInicioPorRol } from "@/lib/auth";

/**
 * Server Action del formulario de login. Recibe los campos del <form> como
 * FormData (así funciona sin JavaScript en el navegador, y es el patrón que
 * usan los ejemplos oficiales de Supabase para Server Actions).
 */
export async function login(formData: FormData) {
  const correo = formData.get("correo") as string;
  const contrasena = formData.get("contrasena") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    // No se distingue el motivo exacto (correo inexistente, contraseña
    // mala, cuenta deshabilitada...) para no darle pistas a quien intenta
    // adivinar credenciales — mismo mensaje genérico para todos los casos.
    redirect("/login?error=Correo o contraseña incorrectos");
  }

  // El Sidebar y el resto de Server Components leen la sesión al
  // renderizarse; hay que invalidar el cache para que la próxima carga ya
  // la vea actualizada en vez de una respuesta guardada de antes del login.
  revalidatePath("/", "layout");

  // A dónde mandarlo depende de su rol en public.usuarios (no del correo ni
  // de nada que haya escrito en el formulario): doctor -> "Mis órdenes",
  // equipo Radyex/Administrador -> panel interno. Sin fila de rol todavía
  // (cuenta recién creada en Auth pero no dada de alta) -> pantalla de
  // "cuenta no configurada", en vez de mandarlo a una zona que el layout
  // protegido le va a rebotar de todos modos.
  const { rol } = await obtenerUsuarioConRol();

  // Estampa "último acceso" solo para doctores (registrar_acceso() escribe
  // doctores.ultimo_acceso; Equipo Radyex/Administrador no tienen esa
  // columna). Va ANTES del redirect final a propósito: redirect() corta la
  // ejecución lanzando, así que cualquier código después de un redirect()
  // nunca llega a correr.
  //
  // Si el rpc falla, no se bloquea el login por esto — estampar el acceso
  // es secundario, y que un doctor se quede afuera por un problema aquí
  // sería peor que perder ese timestamp. Solo se deja constancia en logs.
  if (rol === "doctor") {
    try {
      const { error: errorAcceso } = await supabase.rpc("registrar_acceso");
      if (errorAcceso) throw errorAcceso;
    } catch (errorAcceso) {
      console.error("No se pudo registrar el último acceso del doctor:", errorAcceso);
    }
  }

  if (!rol) {
    redirect("/cuenta-no-configurada");
  }
  redirect(rutaInicioPorRol(rol));
}

/** Server Action para el botón "Cerrar sesión" del Sidebar. */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
