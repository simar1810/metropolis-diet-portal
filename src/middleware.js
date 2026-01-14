import { NextResponse } from "next/server";

export default function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const userType = request.cookies.get('userType')?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/coach/clients", request.url));
  }
  if (pathname === "/client/login" && token) {
    return NextResponse.redirect(new URL("/client/app/clients", request.url));
  }

  if (pathname.startsWith("/coach") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/client/app") && !token) {
    return NextResponse.redirect(new URL("/client/login", request.url));
  }

  // Block access to Users page for regular users
  if (pathname === "/coach/users" && userType === "user") {
    return NextResponse.redirect(new URL("/coach/clients", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/coach/:path*", "/login", "/client/:path*"],
};
