"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#181b27",
          color: "#e2e4f0",
          border: "1px solid #1e2236",
          fontSize: 13,
        },
      }}
    />
  );
}
