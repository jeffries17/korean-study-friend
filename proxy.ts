import { auth } from "@/auth"
import { NextResponse } from "next/server"

const protectedPaths = ["/dashboard", "/upload", "/review", "/vocab"]

const authHandler = auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
})

export const proxy = authHandler

export const proxyConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.svg|favicon\\.ico).*)"],
}
