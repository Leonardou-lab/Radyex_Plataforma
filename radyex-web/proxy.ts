// proxy.ts
// Refresca la sesión de Supabase en cada petición (patrón oficial de Supabase
// para Next.js App Router, adaptado a la convención de esta versión de Next).
//
// NOTA: en Next.js 16 el archivo "middleware.ts" se renombró a "proxy.ts" (y
// la función exportada de "middleware" a "proxy"); el comportamiento es
// idéntico, solo cambian esos dos nombres. Ver
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Este "response" es el MISMO objeto que setAll() de abajo va actualizando
  // y el que se devuelve al final. Si en vez de reutilizarlo se armara un
  // NextResponse nuevo al final de la función, las cookies renovadas que
  // Supabase escribió durante getUser() se perderían y el doctor vería un
  // logout fantasma en la siguiente petición.
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Las cookies renovadas se escriben en dos lugares:
          // 1) en `request.cookies`, para que el resto de esta petición ya
          //    las vea actualizadas.
          // 2) en un `response` reconstruido a partir de esa request, para
          //    que el navegador reciba el `Set-Cookie` correspondiente.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // OJO: no meter ninguna línea de código entre `createServerClient(...)` y
  // este `getUser()`. Es la llamada que valida el token contra Supabase Auth
  // y dispara el refresh de la sesión (escribe las cookies nuevas vía el
  // `setAll` de arriba) — intercalar algo aquí en medio puede romper la
  // sesión de forma intermitente y muy difícil de rastrear después.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Corre en todo menos los assets internos de Next, el favicon y las
    // imágenes estáticas — no tiene caso gastar una consulta de sesión ahí.
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
