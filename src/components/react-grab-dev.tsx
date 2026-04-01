"use client";

import { useEffect } from "react";

/**
 * Loads React Grab only in development. Bundled from `react-grab` so CSP
 * `script-src 'self'` allows it (external unpkg scripts are blocked in next.config).
 */
export function ReactGrabDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    void import("react-grab");
  }, []);

  return null;
}
