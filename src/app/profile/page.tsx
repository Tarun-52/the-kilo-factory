import type { Metadata } from "next";
import ProfilePageClient from "./ProfilePageClient";

// Profile page depends on session — never cache
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Profile — The Kilo Factory",
  description: "View and manage your The Kilo Factory profile and order history.",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}