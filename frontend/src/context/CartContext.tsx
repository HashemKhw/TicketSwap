"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";
import { toNumber } from "@/lib/money";

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQty: (ticketListingId: string, quantity: number) => void;
  removeLine: (ticketListingId: string) => void;
  clear: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const q = line.quantity ?? 1;
      setLines((prev) => {
        const i = prev.findIndex((l) => l.ticketListingId === line.ticketListingId);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], quantity: next[i].quantity + q };
          return next;
        }
        return [...prev, { ...line, quantity: q }];
      });
    },
    []
  );

  const setQty = useCallback((ticketListingId: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.ticketListingId !== ticketListingId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.ticketListingId === ticketListingId ? { ...l, quantity } : l))
    );
  }, []);

  const removeLine = useCallback((ticketListingId: string) => {
    setLines((prev) => prev.filter((l) => l.ticketListingId !== ticketListingId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({ lines, addLine, setQty, removeLine, clear, subtotal }),
    [lines, addLine, setQty, removeLine, clear, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function listingUnitPrice(price: string | number) {
  return toNumber(price);
}
