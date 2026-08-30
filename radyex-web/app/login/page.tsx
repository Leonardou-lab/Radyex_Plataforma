import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login } from "./actions";

// Pantalla de login (fase 3). Server Component: el formulario se envía a la
// Server Action `login` de ./actions.ts, sin manejar estado en el cliente.
// El fondo/logo reutiliza las clases ".role-select-*" que ya existen en
// app/radyex-ui.css para la portada (app/page.tsx), en vez de crear estilos
// nuevos para una pantalla que visualmente es la misma "caja oscura
// centrada" con una tarjeta clara encima.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="role-select-wrap">
      <div className="role-select-brand">
        {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG, sin optimización necesaria */}
        <img className="role-select-logo" src="/logo/radyex-logo-white.svg" alt="RADYEX" />
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Iniciar sesión</CardTitle>
          <CardDescription>Ingresa con tu correo y contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle size={16} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <form action={login} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="correo">Correo</Label>
              <div className="relative">
                <Mail
                  size={16}
                  strokeWidth={2}
                  className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="doctor@correo.com"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contrasena">Contraseña</Label>
              <div className="relative">
                <Lock
                  size={16}
                  strokeWidth={2}
                  className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="pl-8"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-1 w-full">
              Entrar
              <LogIn size={16} strokeWidth={2} data-icon="inline-end" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="role-select-foot">RADYEX — plataforma interna, uso exclusivo del personal y doctores referentes.</div>
    </div>
  );
}
