import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPathPrefixes = [
  "/dashboard",
  "/transactions",
  "/categories",
  "/reports",
];

function isProtectedPath(pathname: string) {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function redirectWithSessionCookies(
  redirectUrl: URL,
  sessionResponse: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(redirectUrl);

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  redirectResponse.headers.set("Cache-Control", "private, no-store");
  redirectResponse.headers.set("Pragma", "no-cache");
  redirectResponse.headers.set("Expires", "0");

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, responseHeaders) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(responseHeaders).forEach(([name, value]) => {
            response.headers.set(name, value);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const userId =
    !error && typeof data?.claims.sub === "string" && data.claims.sub.length > 0
      ? data.claims.sub
      : null;

  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = userId ? "/dashboard" : "/login";
    const redirectResponse = redirectWithSessionCookies(redirectUrl, response);
    return redirectResponse;
  }

  if (pathname === "/login" && userId) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    const redirectResponse = redirectWithSessionCookies(redirectUrl, response);
    return redirectResponse;
  }

  if (isProtectedPath(pathname) && !userId) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    const redirectResponse = redirectWithSessionCookies(redirectUrl, response);
    return redirectResponse;
  }

  return response;
}
