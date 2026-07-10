"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Loader2, ShieldAlert, LogIn, Eye, EyeOff, UtensilsCrossed, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AdminPanel from "@/components/AdminPanel";

interface Props {
  /** Pre-verified on the server — true only when a valid admin session exists. */
  serverIsAdmin: boolean;
}

export default function AdminPageClient({ serverIsAdmin }: Props) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Mark as mounted after hydration — critical for avoiding Radix ID mismatches
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // ── Skeleton: shown during SSR and initial hydration ──────────────
  // This is the ONLY thing rendered server-side when serverIsAdmin=true.
  // It contains zero Radix primitives, so no auto-generated IDs can mismatch.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        {/* Header skeleton — matches new professional header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-24 h-8 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
        {/* Tab bar skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="bg-white border border-gray-200 rounded-xl p-1 h-11 flex gap-1 animate-pulse" />
          {/* Content skeleton */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="mt-6 h-64 rounded-2xl bg-gray-200/60 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── After mount: render AdminPanel purely client-side ─────────────
  if (session?.user?.isAdmin === true) {
    return <AdminPanel />;
  }

  // ── If client session says user is logged in but NOT admin ────────
  if (status !== "loading" && session?.user) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Card className="max-w-md border-border shadow-sm mx-4">
          <CardContent className="py-12 text-center space-y-4">
            <ShieldAlert className="size-12 text-red-500 mx-auto" />
            <div>
              <p className="font-royal text-xl font-bold text-bark">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-1">
                Signed in as <strong>{session.user.email}</strong> — this is not an admin account.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => signOut({ callbackUrl: "/admin" })} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                Sign Out
              </Button>
              <Button onClick={() => router.push("/")} variant="ghost" className="text-sm text-muted-foreground">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Admin Login Form ──────────────────────────────────────────────
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Enter email and password");
      return;
    }
    setLoginLoading(true);
    try {
      const result = await signIn("admin-credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (!result || result.error) {
        setLoginLoading(false);
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Welcome Admin!");

      window.location.reload();
    } catch {
      setLoginLoading(false);
      toast.error("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <Card className="w-full max-w-sm border-gold/20 shadow-lg">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="size-14 bg-maroon-gradient rounded-2xl flex items-center justify-center mb-3 shadow-md">
              <UtensilsCrossed className="size-7 text-gold" />
            </div>
            <h1 className="font-royal text-2xl font-bold text-bark">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">The Kilo Factory Dashboard</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dawatexpress.com"
                autoComplete="email"
                className="h-11"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-bark transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginLoading || !email.trim() || !password.trim()}
              className="w-full bg-maroon-gradient text-ivory font-semibold h-11 text-base"
            >
              {loginLoading ? (
                <><Loader2 className="size-4 animate-spin mr-2" />Signing in...</>
              ) : (
                <><LogIn className="size-4 mr-2" />Sign In</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-muted-foreground hover:text-bark transition cursor-pointer"
            >
              &larr; Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}