"use client";

import { AdminWorkspace } from "./AdminWorkspace";

const apiBaseUrl =
  (process.env.NEXT_PUBLIC_API_URL ?? "https://smartchurch-cams.onrender.com/api").replace(/\/$/, "");

export default function AdminPage() {
  return (
    <AdminWorkspace
      apiBaseUrl={apiBaseUrl}
      onBack={() => { window.location.href = "/"; }}
    />
  );
}
