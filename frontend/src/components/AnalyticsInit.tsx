"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

export function AnalyticsInit() {
  useEffect(() => {
    getFirebaseAnalytics();
  }, []);

  return null;
}

