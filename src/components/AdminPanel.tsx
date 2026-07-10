'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ShoppingCart,
  IndianRupee,
  Package,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Power,
  PowerOff,
  RefreshCw,
  Settings,
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Tag,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Search,
  Upload,
  X,
  LogOut,
  UtensilsCrossed as FoodIcon,
  Clock,
} from 'lucide-react'

import CategoryManager from '@/components/CategoryManager'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardData {
  todayOrderCount: number
  todayRevenue: number
  totalOrderCount: number
  totalRevenue: number
  topItems: {
    itemVariantId: string
    totalQty: number
    variant: { id: string; unit: string; price: number } | null
    item: { id: string; name: string; photoUrl: string | null } | null
  }[]
}

interface OrderItem {
  id: string
  qty: number
  priceAtOrder: number
  itemVariant: {
    id: string
    unit: string
    item: { id: string; name: string; vegFlag: boolean }
  }
}

interface Order {
  id: string
  status: string
  subtotal: number
  gst: number
  packagingFee: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string
  porterRef: string | null
  porterTrackingUrl: string | null
  specialInstructions: string | null
  createdAt: string
  items: OrderItem[]
  address: {
    id: string
    line1: string
    line2: string | null
    city: string
    pincode: string
    label: string | null
  } | null
  coupon: { id: string; code: string; type: string; value: number } | null
}

interface MenuItemVariant {
  id: string
  unit: string
  price: number
  isActive: boolean
}

interface MenuItem {
  id: string
  categoryId: string
  name: string
  description: string | null
  photoUrl: string | null
  vegFlag: boolean
  spiceLevel: number
  isBestseller: boolean
  isNew: boolean
  isBulkOnly: boolean
  leadTimeHours: number
  isActive: boolean
  variants: MenuItemVariant[]
}

interface MenuCategory {
  id: string
  name: string
  displayOrder: number
  items: MenuItem[]
}

interface CouponData {
  id: string
  code: string
  type: string
  value: number
  minOrderValue: number
  validFrom: string
  validTo: string | null
  usageLimit: number
  usedCount: number
  isActive: boolean
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_ORDER = ['placed', 'confirmed', 'preparing', 'dispatched', 'delivered']

const STATUS_STYLES: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-amber-50 text-amber-700 border-amber-200',
  preparing: 'bg-orange-50 text-orange-700 border-orange-200',
  dispatched: 'bg-violet-50 text-violet-700 border-violet-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_DOT: Record<string, string> = {
  placed: 'bg-blue-500',
  confirmed: 'bg-amber-500',
  preparing: 'bg-orange-500',
  dispatched: 'bg-violet-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
}

const STATUS_LABELS: Record<string, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// ---------------------------------------------------------------------------
// Item edit form state
// ---------------------------------------------------------------------------

interface ItemFormData {
  name: string
  description: string
  photoUrl: string
  vegFlag: boolean
  spiceLevel: number
  isBestseller: boolean
  isBulkOnly: boolean
  leadTimeHours: number
  isActive: boolean
  variants: { id?: string; unit: string; price: string; isActive: boolean }[]
}

function emptyItemForm(): ItemFormData {
  return {
    name: '',
    description: '',
    photoUrl: '',
    vegFlag: false,
    spiceLevel: 0,
    isBestseller: false,
    isBulkOnly: false,
    leadTimeHours: 0,
    isActive: true,
    variants: [{ unit: '1kg', price: '', isActive: true }],
  }
}

function itemToForm(item: MenuItem): ItemFormData {
  return {
    name: item.name,
    description: item.description ?? '',
    photoUrl: item.photoUrl ?? '',
    vegFlag: item.vegFlag,
    spiceLevel: item.spiceLevel,
    isBestseller: item.isBestseller,
    isBulkOnly: item.isBulkOnly,
    leadTimeHours: item.leadTimeHours,
    isActive: item.isActive,
    variants: item.variants.map((v) => ({
      id: v.id,
      unit: v.unit,
      price: String(v.price),
      isActive: v.isActive,
    })),
  }
}

// ---------------------------------------------------------------------------
// Shared: Professional Loading Skeleton
// ---------------------------------------------------------------------------

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-gray-100" />
      <div className="h-48 rounded-2xl bg-gray-100" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdminPanel() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin' })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Professional Header ────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Back + Brand */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-800 -ml-2"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-sm">
                <FoodIcon className="size-4 text-amber-100" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Dawat Express</h1>
                <p className="text-[11px] text-gray-400 leading-tight">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right: Admin info + actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-800">A</span>
              </div>
              <div className="text-xs">
                <p className="font-medium text-gray-700 leading-tight">{session?.user?.name ?? 'Admin'}</p>
                <p className="text-gray-400 leading-tight">{session?.user?.email ?? ''}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-500 gap-1.5"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline text-xs">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm h-auto">
            <TabsTrigger
              value="dashboard"
              className="gap-2 px-4 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <LayoutDashboard className="size-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="gap-2 px-4 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <ClipboardList className="size-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="gap-2 px-4 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <UtensilsCrossed className="size-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              className="gap-2 px-4 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Tag className="size-4" />
              <span className="hidden sm:inline">Coupons</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 px-4 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="menu"><MenuTab /></TabsContent>
          <TabsContent value="coupons"><CouponsTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>

      {/* Bottom padding */}
      <div className="h-12" />
    </div>
  )
}

// ===========================================================================
// Dashboard Tab — Professional stat cards + clean table
// ===========================================================================

function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.error || `HTTP ${res.status}`)
        }
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        toast.error(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <PageSkeleton />
  if (!data) return <p className="text-gray-500">No data available.</p>

  const cards = [
    {
      label: "Today's Orders",
      value: data.todayOrderCount,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
    },
    {
      label: "Today's Revenue",
      value: `₹${data.todayRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      gradient: 'from-emerald-500 to-emerald-600',
      lightBg: 'bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: data.totalOrderCount,
      icon: Package,
      gradient: 'from-amber-500 to-amber-600',
      lightBg: 'bg-amber-50',
    },
    {
      label: 'Total Revenue',
      value: `₹${data.totalRevenue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      gradient: 'from-violet-500 to-violet-600',
      lightBg: 'bg-violet-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                  <card.icon className="size-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Items Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">Top Selling Items</CardTitle>
          <CardDescription>Best performing items by quantity sold</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topItems.length === 0 ? (
            <div className="py-12 text-center">
              <TrendingUp className="size-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No sales data yet. Orders will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-gray-500 text-xs font-medium w-10">#</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Item Name</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium">Variant</TableHead>
                    <TableHead className="text-gray-500 text-xs font-medium text-right">Qty Sold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topItems.map((entry, idx) => (
                    <TableRow key={entry.itemVariantId} className="border-gray-50">
                      <TableCell className="text-gray-400 text-sm font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {entry.item?.photoUrl ? (
                            <img src={entry.item.photoUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                              <FoodIcon className="size-4 text-gray-300" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 text-sm">{entry.item?.name ?? 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{entry.variant?.unit ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-gray-900">{entry.totalQty}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ===========================================================================
// Orders Tab — Status filter + cleaner cards
// ===========================================================================

type OrderFilter = 'all' | 'placed' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled'

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderFilter>('all')
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false)
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null)
  const [porterRef, setPorterRef] = useState('')
  const [porterTrackingUrl, setPorterTrackingUrl] = useState('')

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setOrders(json.orders ?? [])
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Order updated to ${STATUS_LABELS[status] ?? status}`)
      fetchOrders()
    } catch {
      toast.error('Failed to update order status')
    }
  }

  const handleOpenDispatch = (orderId: string) => {
    setDispatchOrderId(orderId)
    setPorterRef('')
    setPorterTrackingUrl('')
    setDispatchDialogOpen(true)
  }

  const handleDispatchSubmit = async () => {
    if (!dispatchOrderId) return
    try {
      const res = await fetch(`/api/orders/${dispatchOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'dispatched',
          porterRef: porterRef.trim() || undefined,
          porterTrackingUrl: porterTrackingUrl.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Order dispatched via Porter')
      setDispatchDialogOpen(false)
      fetchOrders()
    } catch {
      toast.error('Failed to dispatch order')
    }
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  if (loading) return <PageSkeleton />

  const FILTER_TABS: { key: OrderFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  const counts: Record<string, number> = { all: orders.length }
  for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1

  return (
    <div className="space-y-5">
      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Order Cards */}
      {filteredOrders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <ClipboardList className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className={`border-0 shadow-sm overflow-hidden transition ${expandedOrder === order.id ? 'ring-2 ring-gray-900/10' : ''}`}>
              <div
                className="p-4 sm:p-5 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status] ?? ''}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.status] ?? 'bg-gray-400'}`} />
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items.map((i) => `${i.itemVariant.item.name} x${i.qty}`).join(', ')}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span>{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                    <ChevronDown className={`size-4 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5 space-y-4">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                    <div className="space-y-1.5">
                      {order.items.map((oi) => (
                        <div key={oi.id} className="flex justify-between text-sm py-1.5 px-3 rounded-lg bg-white">
                          <span className="text-gray-600">{oi.itemVariant.item.name} <span className="text-gray-400">({oi.itemVariant.unit})</span> x{oi.qty}</span>
                          <span className="font-semibold text-gray-900">₹{(oi.priceAtOrder * oi.qty).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown + Actions */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Breakdown</p>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between text-gray-500"><span>GST</span><span>₹{order.gst.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between text-gray-500"><span>Packaging</span><span>₹{order.packagingFee.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between text-gray-500"><span>Delivery</span><span>₹{order.deliveryFee.toLocaleString('en-IN')}</span></div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-medium"><span>Discount</span><span>-₹{order.discount.toLocaleString('en-IN')}</span></div>
                        )}
                        <Separator className="my-1.5" />
                        <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{order.total.toLocaleString('en-IN')}</span></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {/* Address */}
                      {order.address && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                          <p className="text-sm text-gray-600">{order.address.line1}{order.address.line2 && `, ${order.address.line2}`}, {order.address.city} - {order.address.pincode}</p>
                        </div>
                      )}
                      {/* Porter info */}
                      {order.porterRef && (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="size-4 text-violet-500" />
                          <span className="font-mono text-gray-700">{order.porterRef}</span>
                          {order.porterTrackingUrl && (
                            <a href={order.porterTrackingUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline text-xs flex items-center gap-0.5">
                              Track <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      )}
                      {order.specialInstructions && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                          <p className="text-xs font-medium text-amber-700">Special Instructions</p>
                          <p className="text-sm text-amber-800 mt-0.5">{order.specialInstructions}</p>
                        </div>
                      )}
                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {STATUS_ORDER.map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={order.status === s ? 'default' : 'outline'}
                            disabled={order.status === s || order.status === 'cancelled'}
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, s) }}
                            className={`h-8 text-xs ${order.status === s ? 'bg-gray-900 hover:bg-gray-800' : ''}`}
                          >
                            {STATUS_LABELS[s]}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); handleOpenDispatch(order.id) }}
                          className="h-8 text-xs text-violet-600 border-violet-200 hover:bg-violet-50"
                        >
                          Porter Dispatch
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'cancelled') }}
                          disabled={order.status === 'cancelled'}
                          className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Porter Dispatch Dialog */}
      <Dialog open={dispatchDialogOpen} onOpenChange={setDispatchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Dispatch via Porter</DialogTitle>
            <DialogDescription>Enter the Porter reference and tracking link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="porter-ref">Porter Reference *</Label>
              <Input id="porter-ref" placeholder="e.g. POR-123456" value={porterRef} onChange={(e) => setPorterRef(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="porter-url">Tracking URL (optional)</Label>
              <Input id="porter-url" placeholder="https://porter.in/track/..." value={porterTrackingUrl} onChange={(e) => setPorterTrackingUrl(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatchDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDispatchSubmit} disabled={!porterRef.trim()} className="bg-gray-900 hover:bg-gray-800 text-white">Confirm Dispatch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ===========================================================================
// Menu Tab — CLEAN layout with integrated categories
// ===========================================================================

function MenuTab() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategories, setShowCategories] = useState(false)

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<'edit' | 'create'>('edit')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [form, setForm] = useState<ItemFormData>(emptyItemForm())
  const [saving, setSaving] = useState(false)

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Image upload state
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/menu')
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      const cats: MenuCategory[] = json.categories ?? []
      setCategories(cats)
      setOpenCategories(new Set(cats.map((c) => c.id)))
    } catch (err: any) {
      toast.error(err.message || 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  // ── Image upload handler ──────────────────────────────────────────

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, and GIF images are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as Record<string, string>).error ?? 'Upload failed')
      }
      const data = await res.json()
      setForm((f) => ({ ...f, photoUrl: data.url }))
      toast.success('Image uploaded!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [])

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  // ── Edit / Create handlers ────────────────────────────────────────

  const openCreateDialog = (categoryId: string) => {
    setEditMode('create')
    setEditCategoryId(categoryId)
    setEditItemId(null)
    setForm(emptyItemForm())
    setEditDialogOpen(true)
  }

  const openEditDialog = (item: MenuItem) => {
    setEditMode('edit')
    setEditCategoryId(item.categoryId)
    setEditItemId(item.id)
    setForm(itemToForm(item))
    setEditDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (!form.name.trim()) { toast.error('Item name is required'); return }
    const validVariants = form.variants.filter(v => v.unit.trim() && Number(v.price) > 0)
    if (validVariants.length === 0) { toast.error('At least one variant with valid price is required'); return }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        photoUrl: form.photoUrl.trim() || null,
        vegFlag: form.vegFlag,
        spiceLevel: Number(form.spiceLevel) || 0,
        isBestseller: form.isBestseller,
        isBulkOnly: form.isBulkOnly,
        leadTimeHours: Number(form.leadTimeHours) || 0,
        isActive: form.isActive,
        variants: validVariants.map(v => ({
          ...(v.id && { id: v.id }),
          unit: v.unit.trim(),
          price: Number(v.price),
          isActive: v.isActive,
        })),
      }

      let res: Response
      if (editMode === 'create') {
        res = await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, categoryId: editCategoryId }),
        })
      } else {
        res = await fetch('/api/admin/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editItemId, ...payload }),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to save')
      }

      toast.success(editMode === 'create' ? 'Item created!' : 'Item updated!')
      setEditDialogOpen(false)
      fetchMenu()
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete handler ────────────────────────────────────────────────

  const confirmDelete = (itemId: string) => {
    setDeleteItemId(itemId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteItemId) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteItemId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Item deactivated')
      setDeleteDialogOpen(false)
      fetchMenu()
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setDeleting(false)
    }
  }

  // ── Toggle active ─────────────────────────────────────────────────

  const toggleItemActive = async (item: MenuItem) => {
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Item ${!item.isActive ? 'activated' : 'deactivated'}`)
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((it) => it.id === item.id ? { ...it, isActive: !item.isActive } : it),
        })),
      )
    } catch {
      toast.error('Failed to update item')
    }
  }

  // ── Variant form helpers ──────────────────────────────────────────

  const addVariant = () => {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { unit: '', price: '', isActive: true }],
    }))
  }

  const removeVariant = (idx: number) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== idx),
    }))
  }

  const updateVariant = (idx: number, field: 'unit' | 'price', value: string) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    }))
  }

  // ── Filtering ─────────────────────────────────────────────────────

  const filteredCategories = searchQuery.trim()
    ? categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : categories

  // ── Render ────────────────────────────────────────────────────────

  if (loading) return <PageSkeleton />

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0)
  const activeItems = categories.reduce((sum, c) => sum + c.items.filter(i => i.isActive).length, 0)

  return (
    <div className="space-y-6">
      {/* ── Category Management (collapsible section) ─────────────── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Tag className="size-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Category Management</h2>
              <p className="text-xs text-gray-400">{categories.length} categories</p>
            </div>
          </div>
          <ChevronDown className={`size-4 text-gray-400 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
        </button>
        {showCategories && (
          <div className="px-4 sm:px-5 pb-5 border-t border-gray-100 pt-4">
            <CategoryManager onUpdated={fetchMenu} />
          </div>
        )}
      </Card>

      {/* ── Menu Items ─────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Menu Items</CardTitle>
              <CardDescription className="mt-0.5">{totalItems} total, {activeItems} active</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-gray-50 border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="size-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{searchQuery ? 'No items match your search.' : 'No categories or items found.'}</p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <Collapsible
                key={category.id}
                open={openCategories.has(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                {/* Category Header */}
                <div
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight className={`size-4 text-gray-400 transition-transform ${openCategories.has(category.id) ? 'rotate-90' : ''}`} />
                    <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
                    <Badge variant="secondary" className="font-sans text-[11px] bg-white">{category.items.length}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-xs text-gray-500 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => { e.stopPropagation(); openCreateDialog(category.id) }}
                  >
                    <Plus className="size-3" /> Add Item
                  </Button>
                </div>

                <CollapsibleContent>
                  <div className="mt-2 space-y-2 pl-2">
                    {category.items.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">No items in this category.</p>
                    ) : (
                      category.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-3 rounded-xl border transition ${
                            item.isActive
                              ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                              : 'bg-gray-50/50 border-gray-100 opacity-60'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {item.photoUrl ? (
                              <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="size-5 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${item.vegFlag ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className="font-medium text-gray-900 text-sm truncate">{item.name}</span>
                              {item.isBestseller && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded">BESTSELLER</span>
                              )}
                              {item.isBulkOnly && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 rounded">BULK</span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate ml-5">{item.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-1.5 ml-5">
                              {item.variants.map((v) => (
                                <span key={v.id} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono ${v.isActive ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-300 line-through'}`}>
                                  {v.unit} · ₹{v.price}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 ${item.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                              onClick={() => toggleItemActive(item)}
                              title={item.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {item.isActive ? <Power className="size-3.5" /> : <PowerOff className="size-3.5" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100" onClick={() => openEditDialog(item)} title="Edit">
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => confirmDelete(item.id)} title="Deactivate">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Edit / Create Item Dialog ───────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editMode === 'create' ? 'Add New Item' : 'Edit Item'}
            </DialogTitle>
            <DialogDescription>
              {editMode === 'create' ? 'Create a new menu item with variants.' : 'Update item details, pricing, and variants.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name *</Label>
              <Input id="item-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Galouti Kebab" className="bg-gray-50" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="item-desc">Description</Label>
              <Textarea id="item-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the dish, ingredients, taste..." rows={3} className="bg-gray-50" />
            </div>

            {/* Photo — Upload or URL */}
            <div className="space-y-2">
              <Label>Food Image</Label>
              {form.photoUrl ? (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border bg-gray-100">
                  <img src={form.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, photoUrl: '' }))}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : uploading ? (
                <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Loader2 className="size-6 text-gray-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition group">
                  <Upload className="size-7 text-gray-300 group-hover:text-gray-500 transition mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Click to upload</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5MB</p>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">or paste URL:</span>
                <Input value={form.photoUrl} onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))} placeholder="https://example.com/food.jpg" className="h-8 text-xs bg-gray-50" />
              </div>
            </div>

            {/* Toggles row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <Label className="text-sm cursor-pointer" htmlFor="item-veg">Veg</Label>
                <Switch id="item-veg" checked={form.vegFlag} onCheckedChange={(v) => setForm((f) => ({ ...f, vegFlag: v }))} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <Label className="text-sm cursor-pointer" htmlFor="item-best">Bestseller</Label>
                <Switch id="item-best" checked={form.isBestseller} onCheckedChange={(v) => setForm((f) => ({ ...f, isBestseller: v }))} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <Label className="text-sm cursor-pointer" htmlFor="item-bulk">Bulk Only</Label>
                <Switch id="item-bulk" checked={form.isBulkOnly} onCheckedChange={(v) => setForm((f) => ({ ...f, isBulkOnly: v }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Spice Level</Label>
                <Select value={String(form.spiceLevel)} onValueChange={(v) => setForm((f) => ({ ...f, spiceLevel: Number(v) }))}>
                  <SelectTrigger className="h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Not Spicy</SelectItem>
                    <SelectItem value="1">Mild</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Very Spicy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Lead Time (hrs)</Label>
                <Input type="number" min="0" value={form.leadTimeHours} onChange={(e) => setForm((f) => ({ ...f, leadTimeHours: Number(e.target.value) || 0 }))} className="h-9 bg-gray-50" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <Label className="text-sm cursor-pointer" htmlFor="item-active">Active</Label>
                <Switch id="item-active" checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              </div>
            </div>

            <Separator />

            {/* Variants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-900">Variants (Size & Price)</Label>
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={addVariant}>
                  <Plus className="size-3" /> Add Variant
                </Button>
              </div>
              {form.variants.length === 0 && (
                <p className="text-xs text-gray-400">No variants. Click &quot;Add Variant&quot; to add one.</p>
              )}
              <div className="space-y-2">
                {form.variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input placeholder="e.g. 500g, 1kg, Full Plate" value={v.unit} onChange={(e) => updateVariant(idx, 'unit', e.target.value)} className="h-9 flex-1 bg-gray-50" />
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                      <Input type="number" min="0" placeholder="0" value={v.price} onChange={(e) => updateVariant(idx, 'price', e.target.value)} className="h-9 pl-7 bg-gray-50" />
                    </div>
                    <Button variant="ghost" size="icon" className="size-9 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeVariant(idx)} disabled={form.variants.length <= 1}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white">
              {saving ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving...</> : editMode === 'create' ? 'Create Item' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Deactivate Item</DialogTitle>
            <DialogDescription>
              This will deactivate the item (soft delete). It won&apos;t appear on the customer menu. You can reactivate it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="size-4 mr-2 animate-spin" />Deleting...</> : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ===========================================================================
// Coupons Tab — Clean card-based layout
// ===========================================================================

function CouponsTab() {
  const [coupons, setCoupons] = useState<CouponData[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'flat', value: '', minOrderValue: '', usageLimit: '', validTo: '' })
  const [creating, setCreating] = useState(false)

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      if (res.ok) {
        const json = await res.json()
        setCoupons(json.coupons ?? [])
      }
    } catch {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const handleCreate = async () => {
    if (!form.code.trim()) { toast.error('Coupon code is required'); return }
    if (Number(form.value) <= 0) { toast.error('Discount value must be positive'); return }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: Number(form.value),
          minOrderValue: Number(form.minOrderValue) || 0,
          usageLimit: Number(form.usageLimit) || 0,
          validTo: form.validTo || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to create coupon')
      }
      toast.success('Coupon created!')
      setCreateOpen(false)
      setForm({ code: '', type: 'flat', value: '', minOrderValue: '', usageLimit: '', validTo: '' })
      fetchCoupons()
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create coupon')
    } finally {
      setCreating(false)
    }
  }

  const toggleCouponActive = async (coupon: CouponData) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`)
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c))
    } catch {
      toast.error('Failed to update coupon')
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Coupons</CardTitle>
            <CardDescription className="mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</CardDescription>
          </div>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New Coupon
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {coupons.length === 0 ? (
          <div className="py-12 text-center">
            <Tag className="size-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No coupons yet. Create one to offer discounts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition ${c.isActive ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono font-bold text-amber-700 text-sm">{c.type === 'flat' ? '₹' : '%'}</span>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-gray-900 text-sm">{c.code}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span className={c.isActive ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{c.isActive ? 'Active' : 'Inactive'}</span>
                      <span>Min ₹{c.minOrderValue}</span>
                      <span>{c.usedCount}/{c.usageLimit || '∞'} used</span>
                      {c.validTo && <span>Till {new Date(c.validTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {c.type === 'flat' ? `₹${c.value}` : `${c.value}%`}
                    </p>
                    <p className="text-xs text-gray-400">{c.type === 'flat' ? 'Flat off' : 'Percent off'}</p>
                  </div>
                  <Switch checked={c.isActive} onCheckedChange={() => toggleCouponActive(c)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create Coupon Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Create Coupon</DialogTitle>
            <DialogDescription>Create a new discount coupon for customers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Coupon Code *</Label>
              <Input id="coupon-code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. DAWAT50" className="font-mono bg-gray-50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="h-9 bg-gray-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat ₹</SelectItem>
                    <SelectItem value="percent">Percent %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-value">Value *</Label>
                <Input id="coupon-value" type="number" min="0" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder={form.type === 'flat' ? '100' : '10'} className="bg-gray-50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coupon-min">Min Order (₹)</Label>
                <Input id="coupon-min" type="number" min="0" value={form.minOrderValue} onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))} placeholder="200" className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-limit">Usage Limit (0 = ∞)</Label>
                <Input id="coupon-limit" type="number" min="0" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} placeholder="100" className="bg-gray-50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-valid">Valid Till (optional)</Label>
              <Input id="coupon-valid" type="date" value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} className="bg-gray-50" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-gray-900 hover:bg-gray-800 text-white">
              {creating ? <><Loader2 className="size-4 mr-2 animate-spin" />Creating...</> : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ===========================================================================
// Settings Tab — Clean grouped sections
// ===========================================================================

function SettingsTab() {
  const [gstPercent, setGstPercent] = useState('')
  const [packagingCharge, setPackagingCharge] = useState('')
  const [minOrderValue, setMinOrderValue] = useState('')
  const [codEnabled, setCodEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) throw new Error()
        const json = await res.json()
        const s = json.settings ?? {}
        setGstPercent(s.gst_percent ?? '5')
        setPackagingCharge(s.packaging_charge ?? '20')
        setMinOrderValue(s.min_order_value ?? '200')
        setCodEnabled(s.cod_enabled !== 'false')
      } catch {
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            { key: 'gst_percent', value: gstPercent },
            { key: 'packaging_charge', value: packagingCharge },
            { key: 'min_order_value', value: minOrderValue },
            { key: 'cod_enabled', value: String(codEnabled) },
          ],
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="max-w-xl space-y-5">
      {/* Pricing */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">Pricing & Fees</CardTitle>
          <CardDescription>Configure taxes, charges, and order minimums</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="gst" className="text-sm text-gray-600">GST Percentage (%)</Label>
            <Input id="gst" type="number" step="0.1" min="0" value={gstPercent} onChange={(e) => setGstPercent(e.target.value)} placeholder="5" className="bg-gray-50" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="packaging" className="text-sm text-gray-600">Packaging Charge (₹)</Label>
            <Input id="packaging" type="number" step="1" min="0" value={packagingCharge} onChange={(e) => setPackagingCharge(e.target.value)} placeholder="20" className="bg-gray-50" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="min-order" className="text-sm text-gray-600">Minimum Order Value (₹)</Label>
            <Input id="min-order" type="number" step="1" min="0" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} placeholder="200" className="bg-gray-50" />
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">Payment</CardTitle>
          <CardDescription>Manage accepted payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
              <p className="text-xs text-gray-400 mt-0.5">Allow customers to pay on delivery</p>
            </div>
            <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold h-11 rounded-xl">
        {saving ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving...</> : 'Save All Settings'}
      </Button>
    </div>
  )
}