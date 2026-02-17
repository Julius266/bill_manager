import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Si hay un código OAuth en la URL raíz, redirigir a /auth/confirm
  if (pathname === "/" && searchParams.has("code")) {
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/dashboard";
    
    // Redirigir a la ruta de confirmación con los parámetros
    const confirmUrl = new URL("/auth/confirm", request.url);
    confirmUrl.searchParams.set("code", code!);
    confirmUrl.searchParams.set("next", next);
    
    return NextResponse.redirect(confirmUrl);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
