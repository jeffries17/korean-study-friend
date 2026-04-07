import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth, signOut } from "@/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gongbu Buddy",
  description: "Your Korean, from your real life. Screenshot it, build your cards, review with spaced repetition.",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {session?.user && (
            <header className="border-b border-border/40 px-4 py-2 flex items-center justify-end gap-3">
              <span className="text-xs text-muted-foreground">{session.user.email}</span>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/login" })
                }}
              >
                <button type="submit" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Sign out
                </button>
              </form>
            </header>
          )}
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
