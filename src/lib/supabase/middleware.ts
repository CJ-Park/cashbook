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

function addAuthTiming(response: NextResponse, startedAt: number) {
  const duration = Math.max(0, performance.now() - startedAt);
  const formattedDuration = duration.toFixed(1);
  response.headers.set("Server-Timing", `auth;dur=${formattedDuration}`);
  response.headers.set("X-Cashbook-Auth-Duration", `${formattedDuration}ms`);
  return response;
}

function redirectWithSessionCookies(
  redirectUrl: URL,
  sessionResponse: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(redirectUrl);

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const authStartedAt = performance.now();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
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
    return addAuthTiming(redirectResponse, authStartedAt);
  }

  if (pathname === "/login" && userId) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    const redirectResponse = redirectWithSessionCookies(redirectUrl, response);
    return addAuthTiming(redirectResponse, authStartedAt);
  }

  if (isProtectedPath(pathname) && !userId) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    const redirectResponse = redirectWithSessionCookies(redirectUrl, response);
    return addAuthTiming(redirectResponse, authStartedAt);
  }

  return addAuthTiming(response, authStartedAt);
}
