import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";

// Pantalla para el caso "huérfano": hay una sesión válida en Supabase Auth,
// pero esa cuenta todavía no tiene fila en public.usuarios (o la tiene sin
// rol asignado) — así que ningún layout protegido sabe a qué zona mandarla.
// A propósito queda FUERA de app/(doctor) y app/(radyex): si estuviera
// adentro, el propio guardia de acceso la volvería a mandar aquí y se
// formaría un bucle infinito de redirects.
export default function CuentaNoConfiguradaPage() {
  return (
    <div className="role-select-wrap">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-warn-soft text-warn">
            <AlertTriangle size={22} strokeWidth={2} />
          </div>
          <CardTitle className="font-display text-xl">Cuenta no configurada</CardTitle>
          <CardDescription>
            Tu cuenta no está configurada, contacta al administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
