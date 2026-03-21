"use client";

import { useEffect } from "react";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirebaseClientApp } from "@/lib/firebase/client";

/**
 * Initializes Google Analytics for Firebase in the browser when config and support exist.
 * Safe no-op when env vars are missing or analytics is unsupported (SSR, privacy browsers).
 */
export default function FirebaseAnalytics() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supported = await isSupported();
      if (!supported || cancelled) return;
      const firebaseApp = getFirebaseClientApp();
      if (!firebaseApp || cancelled) return;
      getAnalytics(firebaseApp);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
