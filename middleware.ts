import { auth } from "@/auth"

export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL("/", req.url))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/review/:path*", "/vocab/:path*"],
}
