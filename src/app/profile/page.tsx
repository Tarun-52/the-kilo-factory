import type { Metadata } from "next";

// Profile page depends on session — never cache
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Profile — Dawat Express",
  description: "View and manage your Dawat Express profile and order history.",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}

import ProfilePageClient from "./ProfilePageClient";