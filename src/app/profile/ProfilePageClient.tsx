"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  User as UserIcon,
  Phone,
  ShoppingBag,
  Package,
  LogOut,
  ChevronRight,
  ChevronDown,
  Edit3,
  Check,
  Loader2,
  CreditCard,
  MapPin,
  CalendarDays,
  Mail,
  ShieldAlert,
  ArrowLeft,
  LogIn,
  Plus,
  Trash2,
  Home,
  Building,
  Heart,
  Bell,
  HelpCircle,
  Info,
  UtensilsCrossed,
  Pencil,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  pincode: string;
  isDefault: boolean;
}

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  image: string | null;
  createdAt: string;
}

interface ProfileStats {
  totalOrders: number;
  totalSpent: number;
  activeOrders: number;
}

interface OrderItem {
  itemVariant: {
    item: { name: string; vegFlag: boolean; id?: string };
    unit: string;
    price: number;
  };
  qty: number;
  priceAtOrder: number;
}

interface OrderFull {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  gst: number;
  deliveryFee: number;
  packagingFee: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: string;
  specialInstructions: string | null;
  createdAt: string;
  address?: { line1: string; line2: string | null; city: string; pincode: string; label: string } | null;
  coupon?: { code: string; type: string; value: number } | null;
  items: OrderItem[];
}

interface FavoriteItem {
  id: string;
  name: string;
  vegFlag: boolean;
  categoryId: string;
  categoryName: string;
  addedAt: string;
}

type ProfileTab = "profile" | "orders" | "addresses" | "favorites" | "settings";

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-orange-100 text-orange-800 border-orange-200",
  dispatched: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ORDER_FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
] as const;

type OrderFilter = (typeof ORDER_FILTERS)[number]["key"];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ProfilePageClient() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ totalOrders: 0, totalSpent: 0, activeOrders: 0 });
  const [orders, setOrders] = useState<OrderFull[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  // Edit profile
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Add/Edit address
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrEditId, setAddrEditId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({ label: "Home", line1: "", line2: "", city: "Lucknow", pincode: "" });
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrDeleteId, setAddrDeleteId] = useState<string | null>(null);

  // Order filter & expansion
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Logout dialog
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Settings
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [foodPref, setFoodPref] = useState<"all" | "veg" | "nonveg">("all");

  // Prevent hydration mismatch — session-dependent UI only renders after mount
  useEffect(() => { setMounted(true); }, []);

  // Redirect if not authenticated (client-side only)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/?login=profile");
    }
  }, [status, router]);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dawat-favorites");
        if (saved) setFavorites(JSON.parse(saved));
      } catch {}
      try {
        const pref = localStorage.getItem("dawat-food-pref");
        if (pref === "veg" || pref === "nonveg") setFoodPref(pref);
      } catch {}
      try {
        const no = localStorage.getItem("dawat-notify-orders");
        if (no === "false") setNotifyOrders(false);
      } catch {}
      try {
        const nf = localStorage.getItem("dawat-notify-offers");
        if (nf === "false") setNotifyOffers(false);
      } catch {}
    }
  }, []);

  // Fetch all profile data
  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProfile(json.user);
      setAddresses(json.addresses ?? []);
      setStats(json.stats ?? { totalOrders: 0, totalSpent: 0, activeOrders: 0 });
    } catch {
      if (session.user) {
        setProfile({
          id: (session.user as any).id ?? "",
          name: session.user.name,
          email: session.user.email,
          mobile: null,
          image: session.user.image ?? null,
          createdAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  const fetchOrders = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setOrders(json.orders ?? []);
    } catch {
      // silent
    }
  }, [session?.user]);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, [fetchProfile, fetchOrders]);

  // Computed
  const avgOrderValue = stats.totalOrders > 0 ? Math.round(stats.totalSpent / stats.totalOrders) : 0;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all") return true;
    if (orderFilter === "active") return ["placed", "confirmed", "preparing", "dispatched"].includes(o.status);
    return o.status === orderFilter;
  });

  // ── Handlers ───────────────────────────────────────────────────────

  const handleEditSave = async () => {
    if (!editName.trim()) { toast.error("Name cannot be empty"); return; }
    setEditSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), mobile: editMobile.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProfile(json.user);
      setEditOpen(false);
      toast.success("Profile updated!");
      updateSession();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setEditSaving(false);
    }
  };

  const openAddAddress = () => {
    setAddrEditId(null);
    setAddrForm({ label: "Home", line1: "", line2: "", city: "Lucknow", pincode: "" });
    setAddrOpen(true);
  };

  const openEditAddress = (addr: Address) => {
    setAddrEditId(addr.id);
    setAddrForm({
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      pincode: addr.pincode,
    });
    setAddrOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!addrForm.line1.trim() || !addrForm.pincode.trim()) {
      toast.error("Address and pincode are required");
      return;
    }
    setAddrSaving(true);
    try {
      if (addrEditId) {
        // Update existing
        const res = await fetch("/api/user/addresses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: addrEditId, ...addrForm }),
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setAddresses((prev) => prev.map((a) => (a.id === addrEditId ? json.address : a)));
        toast.success("Address updated!");
      } else {
        // Create new
        const res = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addrForm),
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setAddresses((prev) => [json.address, ...prev]);
        toast.success("Address added!");
      }
      setAddrOpen(false);
    } catch {
      toast.error(addrEditId ? "Failed to update address" : "Failed to add address");
    } finally {
      setAddrSaving(false);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addrDeleteId) return;
    try {
      await fetch("/api/user/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: addrDeleteId }),
      });
      setAddresses((prev) => prev.filter((a) => a.id !== addrDeleteId));
      toast.success("Address removed");
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setAddrDeleteId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch("/api/user/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, setDefault: true }),
      });
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("dawat-favorites", JSON.stringify(updated));
    toast.success("Removed from favorites");
  };

  const handleSaveFoodPref = (pref: "all" | "veg" | "nonveg") => {
    setFoodPref(pref);
    localStorage.setItem("dawat-food-pref", pref);
  };

  const handleSaveNotify = (key: "orders" | "offers", val: boolean) => {
    if (key === "orders") {
      setNotifyOrders(val);
      localStorage.setItem("dawat-notify-orders", String(val));
    } else {
      setNotifyOffers(val);
      localStorage.setItem("dawat-notify-offers", String(val));
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(false);
    signOut({ callbackUrl: "/" });
  };

  // ── Loading / Pre-mount guard ───────────────────────────────────
  // During SSR and hydration, always show a safe loading state.
  // This prevents hydration mismatches when session resolves immediately on client.
  if (!mounted || status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-maroon mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ───────────────────────────────────────────
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Card className="max-w-md border-gold/20 shadow-sm mx-4">
          <CardContent className="py-12 text-center space-y-4">
            <UserIcon className="size-12 text-maroon mx-auto" />
            <div>
              <p className="font-royal text-xl font-bold text-bark">Sign In Required</p>
              <p className="text-sm text-muted-foreground mt-1">Please sign in to view your profile.</p>
            </div>
            <Button onClick={() => router.push("/?login=profile")} className="bg-maroon hover:bg-maroon-light text-ivory gap-2">
              <LogIn className="size-4" /> Sign In
            </Button>
            <Button onClick={() => router.push("/")} variant="ghost" className="text-sm text-muted-foreground">Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile?.name ?? session.user.name ?? "User";
  const displayEmail = profile?.email ?? session.user.email ?? "";
  const displayMobile = profile?.mobile;

  // ── Tab config ──────────────────────────────────────────────────
  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <UserIcon className="size-4" /> },
    { key: "orders", label: "Orders", icon: <ShoppingBag className="size-4" /> },
    { key: "addresses", label: "Addresses", icon: <MapPin className="size-4" /> },
    { key: "favorites", label: "Favorites", icon: <Heart className="size-4" /> },
    { key: "settings", label: "Settings", icon: <Info className="size-4" /> },
  ];

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-ivory">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-maroon-gradient shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push("/")} className="text-ivory hover:text-gold transition cursor-pointer">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-royal text-xl font-bold text-ivory">My Account</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* ── Profile Summary Card (always visible) ──────────────── */}
        <Card className="border-gold/20 shadow-sm overflow-hidden mb-5">
          <div className="bg-maroon-gradient px-5 pt-6 pb-14 relative">
            {session.user?.image ? (
              <div className="absolute -bottom-8 left-5">
                <img
                  src={session.user.image}
                  alt={displayName}
                  className="size-16 rounded-full shadow-lg ring-4 ring-ivory object-cover"
                />
              </div>
            ) : (
              <div className="absolute -bottom-8 left-5">
                <div className="size-16 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg ring-4 ring-ivory">
                  <UserIcon className="size-8 text-maroon" />
                </div>
              </div>
            )}
          </div>
          <CardContent className="pt-12 pb-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-bark truncate">{displayName}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Mail className="size-3.5 flex-shrink-0" />
                  <span className="truncate">{displayEmail}</span>
                </div>
                {displayMobile ? (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <Phone className="size-3.5" />
                    <span>+91 {displayMobile}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1 italic">No mobile number added</p>
                )}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3" />
                  <span>Member since {new Date(profile?.createdAt ?? Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEditName(displayName); setEditMobile(displayMobile ?? ""); setEditOpen(true); }}
                className="gap-1.5 text-xs border-maroon/30 text-maroon hover:bg-maroon/5 flex-shrink-0 ml-3"
              >
                <Edit3 className="size-3.5" /> Edit
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-bark">{stats.totalOrders}</p>
                <p className="text-[11px] text-muted-foreground">Orders</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-bark">{"\u20B9"}{stats.totalSpent.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-bark">{"\u20B9"}{avgOrderValue.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-muted-foreground">Avg. Order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Tab Navigation (Zomato-style horizontal) ─────────── */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                activeTab === tab.key
                  ? "bg-maroon text-ivory shadow-sm"
                  : "bg-white border border-border text-muted-foreground hover:border-maroon/30 hover:text-bark"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.key === "orders" && stats.activeOrders > 0 && (
                <span className="ml-1 size-5 flex items-center justify-center rounded-full bg-gold text-maroon text-[10px] font-bold">
                  {stats.activeOrders}
                </span>
              )}
              {tab.key === "favorites" && favorites.length > 0 && (
                <span className="ml-1 size-5 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            {/* Personal Info Card */}
            <Card className="border-gold/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-royal text-base text-bark">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <InfoRow label="Full Name" value={displayName} icon={<UserIcon className="size-4 text-muted-foreground" />} />
                <InfoRow label="Email Address" value={displayEmail} icon={<Mail className="size-4 text-muted-foreground" />} />
                <InfoRow
                  label="Mobile Number"
                  value={displayMobile ? `+91 ${displayMobile}` : "Not added"}
                  icon={<Phone className="size-4 text-muted-foreground" />}
                  valueClass={!displayMobile ? "text-muted-foreground italic" : ""}
                />
                <InfoRow
                  label="Member Since"
                  value={new Date(profile?.createdAt ?? Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  icon={<CalendarDays className="size-4 text-muted-foreground" />}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gold/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-royal text-base text-bark">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <ActionRow icon={<Package className="size-4 text-maroon" />} label="My Orders" badge={stats.activeOrders > 0 ? `${stats.activeOrders} active` : undefined} onClick={() => setActiveTab("orders")} />
                  <ActionRow icon={<MapPin className="size-4 text-saffron" />} label="Saved Addresses" badge={addresses.length > 0 ? `${addresses.length}` : undefined} onClick={() => setActiveTab("addresses")} />
                  <ActionRow icon={<Heart className="size-4 text-red-500" />} label="My Favorites" badge={favorites.length > 0 ? `${favorites.length}` : undefined} onClick={() => setActiveTab("favorites")} />
                  <ActionRow icon={<CreditCard className="size-4 text-gold-dark" />} label="Payment Methods" onClick={() => toast.info("Payment methods coming soon!")} />
                  {session.user.isAdmin && (
                    <>
                      <Separator className="!my-2 bg-gold/10" />
                      <ActionRow icon={<ShieldAlert className="size-4 text-purple-600" />} label="Admin Panel" onClick={() => router.push("/admin")} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ORDER_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setOrderFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                    orderFilter === f.key
                      ? "bg-maroon text-ivory"
                      : "bg-white border border-border text-muted-foreground hover:border-maroon/30"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <Card className="border-gold/10 shadow-sm">
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="size-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-royal text-lg text-bark">No orders found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {orderFilter === "all"
                      ? "You haven't placed any orders yet"
                      : `No ${orderFilter} orders to show`}
                  </p>
                  <Button onClick={() => router.push("/")} variant="outline" className="mt-4 border-maroon/30 text-maroon hover:bg-maroon/5">
                    <UtensilsCrossed className="size-4 mr-2" /> Browse Menu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="border-gold/10 shadow-sm overflow-hidden">
                    {/* Order header - always visible */}
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="w-full text-left p-4 hover:bg-muted/30 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 10)}</p>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_STYLES[order.status] ?? ""}`}>
                              {STATUS_LABELS[order.status] ?? order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-bark mt-1 truncate">
                            {order.items.map((it) => `${it.itemVariant.item.name} x${it.qty}`).join(", ")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <p className="text-base font-bold text-bark">{"\u20B9"}{order.total.toLocaleString("en-IN")}</p>
                          {expandedOrder === order.id ? (
                            <ChevronDown className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded order details */}
                    {expandedOrder === order.id && (
                      <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                        {/* Items */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items Ordered</p>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block size-3 rounded-sm border ${item.itemVariant.item.vegFlag ? "border-veg-green" : "border-nonveg-red"}`}>
                                    <span className={`block size-1.5 m-[2px] rounded-full ${item.itemVariant.item.vegFlag ? "bg-veg-green" : "bg-nonveg-red"}`} />
                                  </span>
                                  <span className="text-sm text-bark">{item.itemVariant.item.name}</span>
                                  <span className="text-xs text-muted-foreground">({item.itemVariant.unit})</span>
                                </div>
                                <div className="text-sm text-bark">
                                  {item.qty} x {"\u20B9"}{item.priceAtOrder} = <strong>{"\u20B9"}{(item.priceAtOrder * item.qty).toLocaleString("en-IN")}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bill breakdown */}
                        <div className="bg-white rounded-lg p-3 space-y-1.5 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{"\u20B9"}{order.subtotal.toLocaleString("en-IN")}</span></div>
                          {order.gst > 0 && <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>{"\u20B9"}{order.gst.toLocaleString("en-IN")}</span></div>}
                          {order.packagingFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Packaging</span><span>{"\u20B9"}{order.packagingFee.toLocaleString("en-IN")}</span></div>}
                          {order.deliveryFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{"\u20B9"}{order.deliveryFee.toLocaleString("en-IN")}</span></div>}
                          {order.discount > 0 && <div className="flex justify-between text-veg-green"><span>Discount{order.coupon ? ` (${order.coupon.code})` : ""}</span><span>-{"\u20B9"}{order.discount.toLocaleString("en-IN")}</span></div>}
                          <Separator />
                          <div className="flex justify-between font-bold text-base"><span>Total</span><span>{"\u20B9"}{order.total.toLocaleString("en-IN")}</span></div>
                        </div>

                        {/* Delivery address */}
                        {order.address && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                            <div className="flex items-start gap-2 text-sm text-bark">
                              <MapPin className="size-4 text-saffron mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{order.address.label}</p>
                                <p className="text-muted-foreground">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
                                <p className="text-muted-foreground">{order.address.city} - {order.address.pincode}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment & instructions */}
                        <div className="flex flex-wrap gap-3 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CreditCard className="size-3.5" />
                            {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}
                          </div>
                          {order.specialInstructions && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Info className="size-3.5" />
                              {order.specialInstructions}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-royal text-lg font-bold text-bark">Saved Addresses</h2>
              <Button size="sm" variant="outline" onClick={openAddAddress} className="gap-1.5 text-xs border-maroon/30 text-maroon hover:bg-maroon/5">
                <Plus className="size-3.5" /> Add New
              </Button>
            </div>

            {addresses.length === 0 ? (
              <Card className="border-gold/10 shadow-sm">
                <CardContent className="py-12 text-center">
                  <MapPin className="size-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-royal text-lg text-bark">No saved addresses</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first delivery address to get started</p>
                  <Button onClick={openAddAddress} variant="outline" className="mt-4 border-maroon/30 text-maroon hover:bg-maroon/5">
                    <Plus className="size-4 mr-2" /> Add Address
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <Card key={addr.id} className="border-gold/10 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 size-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {addr.label?.toLowerCase() === "office" || addr.label?.toLowerCase() === "work" ? (
                            <Building className="size-4 text-muted-foreground" />
                          ) : (
                            <Home className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-bark">{addr.label}</span>
                            {addr.isDefault && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-maroon/10 text-maroon border-maroon/20">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                          <p className="text-sm text-muted-foreground">{addr.city} - {addr.pincode}</p>
                          <div className="flex items-center gap-2 mt-3">
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefault(addr.id)}
                                className="text-xs text-maroon hover:text-maroon-light font-medium cursor-pointer"
                              >
                                Set as default
                              </button>
                            )}
                            <button
                              onClick={() => openEditAddress(addr)}
                              className="text-xs text-muted-foreground hover:text-bark font-medium cursor-pointer flex items-center gap-1"
                            >
                              <Pencil className="size-3" /> Edit
                            </button>
                            <button
                              onClick={() => setAddrDeleteId(addr.id)}
                              className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="size-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-4">
            <h2 className="font-royal text-lg font-bold text-bark">My Favorites</h2>
            {favorites.length === 0 ? (
              <Card className="border-gold/10 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Heart className="size-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-royal text-lg text-bark">No favorites yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Browse the menu and tap the heart icon to save your favorite dishes</p>
                  <Button onClick={() => router.push("/")} variant="outline" className="mt-4 border-maroon/30 text-maroon hover:bg-maroon/5">
                    <UtensilsCrossed className="size-4 mr-2" /> Browse Menu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {favorites.map((fav) => (
                  <div key={fav.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold/30 transition bg-white">
                    <span className={`inline-block size-4 rounded-sm border-2 flex-shrink-0 ${fav.vegFlag ? "border-veg-green" : "border-nonveg-red"}`}>
                      <span className={`block size-2 m-[2px] rounded-full ${fav.vegFlag ? "bg-veg-green" : "bg-nonveg-red"}`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-bark truncate">{fav.name}</p>
                      <p className="text-xs text-muted-foreground">{fav.categoryName}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(fav.id)}
                      className="p-2 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition cursor-pointer flex-shrink-0"
                      title="Remove from favorites"
                    >
                      <Heart className="size-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            {/* Food Preferences */}
            <Card className="border-gold/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-royal text-base text-bark">Food Preferences</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-muted-foreground">Choose your preferred food type. This filters the menu to show only matching items.</p>
                <div className="flex gap-2">
                  {([
                    { key: "all", label: "All Foods", desc: "Show veg & non-veg" },
                    { key: "veg", label: "Vegetarian", desc: "Only veg items" },
                    { key: "nonveg", label: "Non-Vegetarian", desc: "Only non-veg items" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSaveFoodPref(opt.key)}
                      className={`flex-1 p-3 rounded-xl border-2 text-center transition cursor-pointer ${
                        foodPref === opt.key
                          ? "border-maroon bg-maroon/5"
                          : "border-border hover:border-gold/40"
                      }`}
                    >
                      <p className={`text-sm font-medium ${foodPref === opt.key ? "text-maroon" : "text-bark"}`}>{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-gold/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-royal text-base text-bark flex items-center gap-2">
                  <Bell className="size-4" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-bark">Order Updates</p>
                    <p className="text-xs text-muted-foreground">Get notified about order status changes</p>
                  </div>
                  <Switch checked={notifyOrders} onCheckedChange={(v) => handleSaveNotify("orders", v)} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-bark">Offers & Promotions</p>
                    <p className="text-xs text-muted-foreground">Receive deals and discount notifications</p>
                  </div>
                  <Switch checked={notifyOffers} onCheckedChange={(v) => handleSaveNotify("offers", v)} />
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="border-gold/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-royal text-base text-bark flex items-center gap-2">
                  <HelpCircle className="size-4" /> Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <ActionRow icon={<Phone className="size-4 text-maroon" />} label="Contact Support" onClick={() => toast.info("Support: +91 98765 43210")} />
                  <ActionRow icon={<Mail className="size-4 text-saffron" />} label="Email Us" onClick={() => toast.info("Email: support@dawatexpress.com")} />
                  <ActionRow icon={<HelpCircle className="size-4 text-gold-dark" />} label="FAQs" onClick={() => toast.info("FAQs coming soon!")} />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-royal text-base text-red-600 flex items-center gap-2">
                  <AlertTriangle className="size-4" /> Account
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <button
                  onClick={() => setLogoutDialogOpen(true)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="size-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </div>
                  <ChevronRight className="size-4 text-red-400" />
                </button>
              </CardContent>
            </Card>

            <div className="text-center pt-2 pb-4">
              <p className="text-xs text-muted-foreground">Dawat Express v1.0 — Royal Awadhi Cuisine</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Profile Dialog ─────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-royal text-lg text-bark">Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information</DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-muted rounded-lg border border-input text-sm text-muted-foreground">
                  +91
                </div>
                <Input
                  id="edit-phone"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit number"
                  type="tel"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={displayEmail} disabled className="bg-muted" />
              <p className="text-[10px] text-muted-foreground">Email is linked to your Google account and cannot be changed</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={handleEditSave}
              disabled={editSaving || !editName.trim()}
              className="flex-1 bg-maroon hover:bg-maroon-light text-ivory"
            >
              {editSaving ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <Check className="size-4 mr-1.5" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add/Edit Address Dialog ─────────────────────────────── */}
      <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-royal text-lg text-bark">
              {addrEditId ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {addrEditId ? "Update your delivery address" : "Add a new delivery address"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="space-y-2">
              <Label>Address Label</Label>
              <div className="flex gap-2">
                {["Home", "Office", "Other"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setAddrForm((f) => ({ ...f, label: l }))}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition cursor-pointer ${
                      addrForm.label === l
                        ? "border-maroon bg-maroon/5 text-maroon"
                        : "border-border text-muted-foreground hover:border-gold/40"
                    }`}
                  >
                    {l === "Home" ? <Home className="size-3.5 inline mr-1" /> : l === "Office" ? <Building className="size-3.5 inline mr-1" /> : null}
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address Line 1 *</Label>
              <Input
                value={addrForm.line1}
                onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))}
                placeholder="House no, street, area"
              />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input
                value={addrForm.line2}
                onChange={(e) => setAddrForm((f) => ({ ...f, line2: e.target.value }))}
                placeholder="Landmark, nearby location"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={addrForm.city}
                  onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input
                  value={addrForm.pincode}
                  onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  placeholder="226001"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddrOpen(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSaveAddress}
              disabled={addrSaving || !addrForm.line1.trim() || !addrForm.pincode.trim()}
              className="flex-1 bg-maroon hover:bg-maroon-light text-ivory"
            >
              {addrSaving ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <Plus className="size-4 mr-1.5" />}
              {addrEditId ? "Update" : "Add"} Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Address Confirm Dialog ───────────────────────── */}
      <Dialog open={!!addrDeleteId} onOpenChange={() => setAddrDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-royal text-lg text-bark">Delete Address</DialogTitle>
            <DialogDescription>Are you sure you want to remove this address? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddrDeleteId(null)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteAddress} className="flex-1">
              <Trash2 className="size-4 mr-1.5" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Logout Dialog ──────────────────────────────────────── */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-royal text-lg text-bark">Sign Out</DialogTitle>
            <DialogDescription>Are you sure you want to sign out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={handleLogout} className="flex-1">
              <LogOut className="size-4 mr-1.5" /> Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ label, value, icon, valueClass = "" }: { label: string; value: string; icon: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm text-bark ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

function ActionRow({ icon, label, badge, onClick }: { icon: React.ReactNode; label: string; badge?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-bark hover:bg-muted/50 transition cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
        {badge && <span className="text-[10px] font-medium text-maroon bg-maroon/10 px-1.5 py-0.5 rounded-full">{badge}</span>}
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}