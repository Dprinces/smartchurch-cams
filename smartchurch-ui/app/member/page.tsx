import type { Metadata } from "next";
import MemberPage from "@/MemberPage";

export const metadata: Metadata = {
  title: "Member Portal — SmartChurch CAMS",
};

export default function Member() {
  return <MemberPage />;
}
