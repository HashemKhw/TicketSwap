"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { confirmCheckoutSession } from "@/lib/api";
import { useCart } from "@/context/CartContext";

function SuccessInner() {
  const { clear } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("err");
      setMessage("Missing session. Return to cart and try again.");
      return;
    }
    confirmCheckoutSession(sessionId)
      .then(() => {
        clear();
        setStatus("ok");
        setMessage("Your payment was received. Orders are marked as PAID.");
      })
      .catch((e) => {
        setStatus("err");
        setMessage(e instanceof Error ? e.message : "Could not confirm payment");
      });
  }, [sessionId, clear]);

  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      {status === "idle" && <p className="text-slate-600">Confirming payment…</p>}
      {status === "ok" && (
        <>
          <h1 className="text-2xl font-bold text-emerald-800">Success</h1>
          <p className="text-slate-700">{message}</p>
        </>
      )}
      {status === "err" && (
        <>
          <h1 className="text-2xl font-bold text-red-800">Something went wrong</h1>
          <p className="text-slate-700">{message}</p>
        </>
      )}
      <div className="flex justify-center gap-3 pt-4">
        <Link href="/dashboard/orders" className="text-indigo-600 hover:underline">
          My orders
        </Link>
        <Link href="/events" className="text-indigo-600 hover:underline">
          Browse events
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-600">Loading…</p>}>
      <SuccessInner />
    </Suspense>
  );
}
