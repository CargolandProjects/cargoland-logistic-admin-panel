import { NextResponse, type NextRequest } from "next/server";

/**
 * Route gate (Next.js 16 renamed `middleware` -> `proxy`; Node.js runtime only).
 *
 * Auth is currently a client-side bearer token in localStorage, so the real
 * gate lives in the axios 401 interceptor + client redirects. This proxy is a
 * thin, ready-to-extend placeholder: once auth moves to an HttpOnly cookie,
 * uncomment the block below to enforce login at the edge.
 */
export function proxy(request: NextRequest) {
  void request; // referenced once the cookie-based gate below is enabled
  // const { pathname } = request.nextUrl;
  // const isPublic = pathname.startsWith("/login");
  // const token = request.cookies.get("cargoland.token")?.value;
  // if (!isPublic && !token) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   url.searchParams.set("next", pathname);
  //   return NextResponse.redirect(url);
  // }
  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
