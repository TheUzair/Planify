"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const publicNavigation = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Don't show navbar on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  // Dashboard and admin have their own page headers
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-muted/30 backdrop-blur-lg border-b border-border shadow-sm h-16">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Planify
            </span>
          </Link>

          {/* Desktop Navigation - only on public pages */}
          {!session && (
            <div className="hidden md:flex md:items-center md:space-x-8">
              {publicNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors cursor-pointer ${pathname === item.href
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-gray-50"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* Right side - only show if not logged in */}
          {!session && (
            <div className="flex items-center space-x-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="cursor-pointer bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* When logged in, show user info */}
          {session && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              {(session.user as { role?: string }).role === "ADMIN" && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  ADMIN
                </span>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
