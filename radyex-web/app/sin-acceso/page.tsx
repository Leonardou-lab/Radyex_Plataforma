import { ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { obtenerUsuarioConRol, rutaInicioPorRol } from "@/lib/auth";
import { logout } from "@/app/login/actions";

// Pantalla para "tu cuenta es válida, pero este rol no entra aquí" (por
// ejemplo, un doctor que llega a una URL de /admin/*, o viceversa). A
// propósito queda FUERA de app/(doctor) y app/(radyex): si estuviera
// adentro, el propio guardia de acceso la volvería a mandar aquí y se
// formaría un bucle infinito de redirects.
export default async function SinAccesoPage() {
  const { rol } = await obtenerUsuarioConRol();
  // rutaInicioPorRol ya resuelve a "/login" si no hay rol disponible —
  // así el botón nunca apunta a un limbo, aunque esta pantalla se abra sin
  // sesión o con una cuenta huérfana.
  const rutaInicio = rutaInicioPorRol(rol);

  return (
    <div className="role-select-wrap">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger">
            <ShieldAlert size={22} strokeWidth={2} />
          </div>
          <CardTitle className="font-display text-xl">Sin acceso</CardTitle>
          <CardDescription>Tu cuenta no tiene permiso para entrar aquí.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <Button
            render={<a href={rutaInicio}>Ir a mi inicio</a>}
            nativeButton={false}
            className="w-full"
          />
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full">
              Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
