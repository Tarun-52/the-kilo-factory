import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import AdminPageClient from "./AdminPageClient";

// NEVER cache this page — always verify session fresh
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Panel — Dawat Express",
  description: "Admin dashboard for managing orders, menu, coupons, and settings.",
};

export default async function AdminPage() {
  // Server-side session check — runs on EVERY request (no static cache)
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.isAdmin === true;

  return <AdminPageClient serverIsAdmin={isAdmin} />;
}