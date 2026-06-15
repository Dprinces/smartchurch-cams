import type { Metadata } from "next";
import AdminPage from "@/AdminPage";

export const metadata: Metadata = {
  title: "Admin — SmartChurch CAMS",
};

export default function Admin() {
  return <AdminPage />;
}
