import type { Metadata } from "next";
import "./globals.css";

const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "sj-six-sigma-kpi-studio";
const basePath =
  process.env.GITHUB_PAGES === "true" ? `/${repositoryName}` : "";

export const metadata: Metadata = {
  title: "Last Mile Six Sigma KPI Studio",
  description: "Editable Pareto and Six Sigma KPI model for last-mile operations.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
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
