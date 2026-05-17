"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registrado"))
        .catch((err) => console.error("Error SW:", err));
    }
  }, []);

  return null;
}
