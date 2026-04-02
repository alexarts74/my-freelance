import type { Metadata } from "next";
import { Lora, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const lora = Lora({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Suivi Freelance",
  description: "Suivi hebdomadaire et facturation freelance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${lora.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav
          style={{ background: "var(--bg-nav)" }}
          className="px-6 py-3"
        >
          <div className="max-w-5xl mx-auto flex items-center gap-8">
            <Link
              href="/"
              className="font-serif text-xl tracking-tight"
              style={{ color: "var(--accent-light)", fontWeight: 500 }}
            >
              A.
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/clients" className="nav-link">
                Clients
              </Link>
              <Link href="/semaines" className="nav-link">
                Semaines
              </Link>
              <Link href="/factures" className="nav-link">
                Factures
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
