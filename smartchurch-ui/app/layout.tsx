import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartChurch CAMS — Church Attendance Management System",
  description:
    "SmartChurch CAMS replaces paper registers and manual spreadsheets with a streamlined QR-code-based digital attendance system. Built for modern churches.",
  keywords: [
    "church attendance",
    "church management",
    "QR check-in",
    "Nigeria church software",
    "CAC attendance",
    "church member portal",
  ],
  openGraph: {
    title: "SmartChurch CAMS",
    description:
      "Digital attendance management for churches — QR check-in, member portal, absentee follow-up, and real-time reporting.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
