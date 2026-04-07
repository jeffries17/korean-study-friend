import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL ?? "alex.jeffries@gmail.com"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ user }) {
      return user.email === ALLOWED_EMAIL
    },
  },
})
