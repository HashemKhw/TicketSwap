"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { lines } = useCart();
  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <header className="glass-header sticky top-0 z-40 shadow-[0_10px_30px_rgba(25,28,30,0.05)]">
      <div className="page-shell flex min-h-20 items-center justify-between gap-5 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="font-headline text-xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] sm:text-2xl"
          >
            TicketSwap
        </Link>
          <nav className="hidden items-center gap-5 md:flex">
            <Link
              href="/events"
              className="font-medium tracking-tight text-[var(--foreground)] hover:text-[var(--primary)]"
            >
              Events
            </Link>
            {user && (
              <Link
                href="/sell/new"
                className="font-medium tracking-tight text-[var(--muted)] hover:text-[var(--primary)]"
              >
                Sell
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                className="font-medium tracking-tight text-[var(--muted)] hover:text-[var(--primary)]"
              >
                Dashboard
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="font-medium tracking-tight text-[var(--secondary)] hover:opacity-80"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link
            href="/events"
            className="rounded-full px-3 py-2 font-medium text-[var(--muted)] hover:bg-white hover:text-[var(--primary)] md:hidden"
          >
            Events
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full bg-[var(--surface-high)] px-4 py-2 font-semibold text-[var(--foreground)] hover:bg-[var(--surface-highest)]"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 font-medium text-[var(--muted)] hover:bg-white hover:text-[var(--primary)]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="cta-primary px-4 py-2.5 text-sm"
              >
                Sign up
              </Link>
            </>
          )}
          {!loading && user && (
            <>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-3 py-2 font-medium text-[var(--muted)] hover:bg-white hover:text-[var(--primary)]"
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
