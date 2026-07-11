import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Last Mile Six Sigma KPI Studio",
  description: "Editable Pareto and Six Sigma KPI model for last-mile operations.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
