"use client";

import { MemberPortal } from "./MemberPortal";

const apiBaseUrl =
  (process.env.NEXT_PUBLIC_API_URL ?? "https://smartchurch-cams.onrender.com/api").replace(/\/$/, "");

export default function MemberPage() {
  return (
    <MemberPortal
      apiBaseUrl={apiBaseUrl}
      onBack={() => { window.location.href = "/"; }}
    />
  );
}
