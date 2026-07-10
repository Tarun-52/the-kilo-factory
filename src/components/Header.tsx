"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Shield,
  ClipboardList,
  Menu,
  X,
  UtensilsCrossed,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppStore as useStore } from "@/store";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    vegOnly,
    toggleVegOnly,
    cartOpen,
    setCartOpen,
    getCartCount,
  } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? getCartCount() : 0;
  // Only read session-derived flags after mount to avoid hydration mismatch
  // (SSR always has session=undefined → false, client may have session → true)
  const isAdmin = mounted ? session?.user?.isAdmin === true : false;
  const isLoggedIn = mounted ? !!session?.user : false;

  // Don't show the main header on /admin (it has its own)
  if (pathname === "/admin") return null;

  // On /profile, show a simpler header
  if (pathname === "/profile") return null;

  const handleNav = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-maroon-gradient shadow-lg">
      {/* ── Top row ─────────────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <button
          onClick={() => handleNav("/")}
          className="flex items-center gap-2 focus:outline-none cursor-pointer"
        >
          <UtensilsCrossed className="size-6 text-gold" />
          <div className="flex flex-col leading-tight">
            <span className="font-royal text-2xl font-bold text-gold-gradient">
              The Kilo Factory
            </span>
            <span className="hidden text-[10px] tracking-widest text-ivory/70 sm:block">
              ROYAL AWADHI CUISINE
            </span>
          </div>
        </button>

        {/* ── Desktop center: Search ───────────────────────────────── */}
        <div className="mx-4 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ivory/50" />
            <Input
              type="text"
              placeholder="Search dishes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-gold/30 bg-ivory/10 pl-9 pr-3 text-sm text-ivory placeholder:text-ivory/40 focus-visible:border-gold focus-visible:ring-gold/40"
            />
          </div>
        </div>

        {/* ── Right actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile search toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="rounded-full p-2 text-ivory/80 hover:bg-ivory/10 md:hidden"
            aria-label="Toggle search"
          >
            <Search className="size-5" />
          </motion.button>

          {/* Veg / Non-veg toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVegOnly}
            className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-ivory/80 hover:bg-ivory/10"
            aria-label={vegOnly ? "Show all items" : "Show veg-only items"}
            title={vegOnly ? "Veg only active" : "Click for veg only"}
          >
            <span
              className={`inline-block size-4 rounded-full border-2 ${
                vegOnly
                  ? "border-veg-green bg-veg-green"
                  : "border-nonveg-red bg-nonveg-red"
              }`}
            />
            <span className="hidden sm:inline">{vegOnly ? "Veg" : "All"}</span>
          </motion.button>

          {/* Cart */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCartOpen(!cartOpen)}
            className="relative rounded-full p-2 text-ivory/80 hover:bg-ivory/10"
            aria-label="Open cart"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && mounted && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gold-gradient text-[11px] font-bold text-maroon">
                {cartCount}
              </span>
            )}
          </motion.button>

          {/* Login button — only when not logged in */}
          {!isLoggedIn && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Dispatch a custom event that page.tsx listens to
                window.dispatchEvent(new CustomEvent('open-login'));
              }}
              className="flex items-center gap-1.5 rounded-full bg-gold-gradient px-3 py-1.5 text-sm font-medium text-bark hover:opacity-90 cursor-pointer"
            >
              <UserIcon className="size-4" />
              <span>Login</span>
            </motion.button>
          )}

          {/* User avatar — goes to /profile */}
          {isLoggedIn && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNav("/profile")}
              className="hidden rounded-full p-2 text-ivory/80 hover:bg-ivory/10 sm:block"
              aria-label="My profile"
              title={mounted ? `Signed in as ${session.user?.name}` : ''}
            >
              {mounted && session.user?.image ? (
                <img
                  src={session.user.image!}
                  alt=""
                  className="size-5 rounded-full"
                />
              ) : (
                <UserIcon className="size-5" />
              )}
            </motion.button>
          )}

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNav("/admin")}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ivory/80 hover:bg-ivory/10 cursor-pointer"
              >
                <Shield className="size-4" />
                <span>Admin</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/?view=order-history")}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ivory/80 hover:bg-ivory/10 cursor-pointer"
            >
              <ClipboardList className="size-4" />
              <span>Orders</span>
            </motion.button>
          </nav>

          {/* Mobile hamburger */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-full p-2 text-ivory/80 hover:bg-ivory/10 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* ── Mobile search bar ───────────────────────────────────────── */}
      {mobileSearchOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-t border-ivory/10 px-4 py-2 md:hidden"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ivory/50" />
            <Input
              type="text"
              placeholder="Search dishes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="h-9 border-gold/30 bg-ivory/10 pl-9 pr-3 text-sm text-ivory placeholder:text-ivory/40 focus-visible:border-gold focus-visible:ring-gold/40"
            />
          </div>
        </motion.div>
      )}

      {/* ── Mobile menu ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden border-t border-ivory/10 px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {!isLoggedIn && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-login'));
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gold hover:bg-ivory/10 cursor-pointer font-medium"
              >
                <UserIcon className="size-4" />
                Login / Sign In
              </button>
            )}
            {isLoggedIn && (
              <button
                onClick={() => handleNav("/profile")}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ivory/80 hover:bg-ivory/10 cursor-pointer"
              >
                {mounted && session.user?.image ? (
                  <img src={session.user.image!} alt="" className="size-4 rounded-full" />
                ) : (
                  <UserIcon className="size-4" />
                )}
                {session.user?.name ?? "Profile"}
              </button>
            )}
            <button
              onClick={() => {
                router.push("/?view=order-history");
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ivory/80 hover:bg-ivory/10 cursor-pointer"
            >
              <ClipboardList className="size-4" />
              My Orders
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNav("/admin")}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ivory/80 hover:bg-ivory/10 cursor-pointer"
              >
                <Shield className="size-4" />
                Admin Panel
              </button>
            )}
            {isLoggedIn && (
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ivory/80 hover:bg-ivory/10 cursor-pointer"
              >
                <X className="size-4" />
                Sign Out
              </button>
            )}
          </div>
        </motion.nav>
      )}
    </header>
  );
}