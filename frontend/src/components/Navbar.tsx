"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { lines } = useCart();
  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-indigo-700">
          TicketSwap
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
          <Link href="/events" className="hover:text-indigo-600">
            Events
          </Link>
          {user && (
            <Link href="/sell/new" className="hover:text-indigo-600">
              Sell
            </Link>
          )}
          <Link href="/cart" className="relative hover:text-indigo-600">
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {!loading && !user && (
            <>
              <Link href="/login" className="hover:text-indigo-600">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
          {!loading && user && (
            <>
              <Link href="/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-amber-700 hover:text-amber-800">
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-slate-500 hover:text-slate-800"
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
