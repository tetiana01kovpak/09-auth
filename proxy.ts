import { NextRequest, NextResponse } from "next/server";

const privateRoutes = ["/notes", "/profile"];
const authRoutes = ["/sign-in", "/sign-up"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isPrivateRoute && !accessToken && refreshToken) {
    const sessionResponse = await fetch(
      new URL("/api/auth/session", request.url),
      {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      }
    );

    if (sessionResponse.ok) {
      const response = NextResponse.next();
      const setCookieHeaders = sessionResponse.headers.getSetCookie();
      setCookieHeaders.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
      return response;
    }

    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const isAuthenticated = !!accessToken;

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
