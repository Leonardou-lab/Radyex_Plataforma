"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Campo de contraseña del login, con botón para mostrar u ocultar lo escrito.
 *
 * Existe como componente cliente aparte porque el toggle necesita `useState` y
 * `app/login/page.tsx` es un Server Component. Solo se saca ESTE campo al
 * cliente: la página, el formulario y la Server Action `login` siguen igual
 * (el input conserva su `name`, así que el envío no cambia en nada).
 *
 * Sin `placeholder`: antes tenía uno de puntos ("••••••••") que parecía una
 * contraseña ya escrita. El campo vacío se lee mejor.
 */
export function CampoContrasena() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="contrasena">Contraseña</Label>
      <div className="relative">
        {/* El candado es decorativo: pointer-events-none para que el click
            siempre caiga en el input y no desvíe el cursor de texto. */}
        <Lock
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="contrasena"
          name="contrasena"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          required
          // pl-9 deja sitio al candado; pr-11 al botón del ojo. Sin ellos, el
          // texto y el cursor se montan encima de los íconos.
          className="h-11 pl-9 pr-11"
        />
        {/* El ojo SÍ es interactivo (nada de pointer-events-none). type=button
            para que no dispare el submit del formulario. */}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {visible ? (
            <EyeOff size={16} strokeWidth={2} />
          ) : (
            <Eye size={16} strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
