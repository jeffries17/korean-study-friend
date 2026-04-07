import { auth } from "@/auth"
import { NextResponse } from "next/server"

const authHandler = auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")

  if (isAuthRoute) return NextResponse.next()
  if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.nextUrl))
})

export const proxy = authHandler

export const proxyConfig = {
  matcher: ["/((?!login|_next/static|_next/image|favicon\\.svg|favicon\\.ico).*)"],
}
