import type { Metadata } from "next";

import {
  THEME_INIT_SCRIPT,
  ThemeProvider,
} from "@/components/shell/ThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "MyDigitalPal",
  description: "Your family's command centre",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme before the body paints to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-bg font-body text-text">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
