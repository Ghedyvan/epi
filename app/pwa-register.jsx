"use client";

import { useEffect } from "react";

const SERVICE_WORKER_PATH = "/sw.js";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
          scope: "/",
        });

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      } catch (error) {
        console.error("Falha ao registrar o service worker", error);
      }
    };

    registerServiceWorker();

    const messageListener = (event) => {
      if (event.data?.type === "PWA_SYNC_TRIGGER") {
        console.info("Sincronização solicitada pelo service worker", event.data);
      }
    };

    navigator.serviceWorker.addEventListener("message", messageListener);

    return () => {
      navigator.serviceWorker.removeEventListener("message", messageListener);
    };
  }, []);

  return null;
}
