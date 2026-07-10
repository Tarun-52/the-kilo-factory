'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Truck,
  XCircle,
  ShoppingBag,
  MapPin,
  CreditCard,
  Package,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  id: string
  qty: number
  priceAtOrder: number
  itemVariant: {
    id: string
    unit: string
    price: number
    item: { id: string; name: string; vegFlag: boolean }
  }
}

interface OrderAddress {
  id: string
  line1: string
  line2: string | null
  city: string
  pincode: string
  label: string | null
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
  paymentStatus: string
  porterRef: string | null
  porterTrackingUrl: string | null
  createdAt: string
  items: OrderItem[]
  address: OrderAddress | null
  coupon: { id: string; code: string; type: string; value: number } | null
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const TRACKING_STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'dispatched', label: 'Dispatched via Porter' },
  { key: 'delivered', label: 'Delivered' },
]

const STATUS_ORDER = ['placed', 'confirmed', 'preparing', 'dispatched', 'delivered']

const STATUS_STYLES: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  dispatched: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
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
// Main Component — routes between history and tracking
// ---------------------------------------------------------------------------

export default function OrderTracking() {
  const view = useAppStore((s) => s.view)

  if (view === 'order-tracking') {
    return <OrderTrackingView />
  }

  return <OrderHistoryView />
}

// ---------------------------------------------------------------------------
// Order Tracking View
// ---------------------------------------------------------------------------

function OrderTrackingView() {
  const selectedOrderId = useAppStore((s) => s.selectedOrderId)
  const goToOrderHistory = useAppStore((s) => s.goToOrderHistory)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedOrderId) return
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${selectedOrderId}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setOrder(json.order ?? null)
      } catch {
        toast.error('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [selectedOrderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <Package className="size-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Card className="max-w-md w-full border-border shadow-sm mx-4">
          <CardContent className="py-12 text-center space-y-4">
            <XCircle className="size-12 text-red-400 mx-auto" />
            <p className="text-bark font-medium">Order not found</p>
            <Button variant="outline" onClick={goToOrderHistory}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCancelled = order.status === 'cancelled'
  const currentStepIdx = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToOrderHistory}
            className="gap-1.5 text-bark-light hover:text-bark"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <h1 className="font-royal text-xl font-bold text-bark">Order Tracking</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Order ID & Date */}
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</p>
                <p className="font-mono text-sm text-bark font-medium mt-0.5">
                  {order.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Placed on
                </p>
                <p className="text-sm text-bark mt-0.5">
                  {new Date(order.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-royal text-lg text-bark">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isCancelled ? (
              <div className="flex flex-col items-center py-4 space-y-2">
                <XCircle className="size-12 text-red-500" />
                <p className="text-red-600 font-semibold text-lg">Order Cancelled</p>
                <p className="text-sm text-muted-foreground">
                  This order has been cancelled.
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {TRACKING_STEPS.map((step, idx) => {
                  const isCompleted = currentStepIdx >= idx
                  const isCurrent = currentStepIdx === idx
                  const isPorterStep = step.key === 'dispatched'

                  return (
                    <div key={step.key} className="relative flex gap-4">
                      {/* Vertical line */}
                      {idx < TRACKING_STEPS.length - 1 && (
                        <div className="absolute left-[15px] top-[32px] bottom-0 w-0.5">
                          <div
                            className={`w-full h-full rounded-full ${
                              currentStepIdx > idx ? 'bg-green-400' : 'bg-border'
                            }`}
                          />
                        </div>
                      )}

                      {/* Circle */}
                      <div className="flex-shrink-0 relative z-10">
                        {isCompleted ? (
                          <div
                            className={`size-8 rounded-full flex items-center justify-center ${
                              isCurrent
                                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                : 'bg-green-400'
                            }`}
                          >
                            <CheckCircle2 className="size-4 text-white" />
                          </div>
                        ) : (
                          <div className="size-8 rounded-full border-2 border-border flex items-center justify-center">
                            <Circle className="size-2.5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Label */}
                      <div className={idx < TRACKING_STEPS.length - 1 ? 'pb-8' : ''}>
                        <p
                          className={`text-sm font-medium ${
                            isCompleted ? 'text-bark' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>

                        {/* Porter tracking link */}
                        {isPorterStep && isCompleted && order.porterTrackingUrl && (
                          <a
                            href={order.porterTrackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <ExternalLink className="size-3" />
                            Track with Porter
                          </a>
                        )}

                        {/* Porter ref */}
                        {isPorterStep && isCompleted && order.porterRef && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {order.porterRef}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-royal text-lg text-bark">Items Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-block size-3 rounded-sm border ${
                        item.itemVariant.item.vegFlag
                          ? 'border-veg-green bg-veg-green'
                          : 'border-nonveg-red bg-nonveg-red'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-bark">
                        {item.itemVariant.item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.itemVariant.unit} &times; {item.qty}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-bark">
                    ₹{(item.priceAtOrder * item.qty).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-royal text-lg text-bark">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-bark">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST</span>
                <span className="text-bark">₹{order.gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Packaging</span>
                <span className="text-bark">
                  ₹{order.packagingFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-bark">
                  ₹{order.deliveryFee.toLocaleString('en-IN')}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.coupon ? ` (${order.coupon.code})` : ''}</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base pt-1">
                <span className="text-bark">Total</span>
                <span className="text-bark">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        {order.address && (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-royal text-lg text-bark flex items-center gap-2">
                <MapPin className="size-4 text-saffron" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-bark leading-relaxed">
                {order.address.label && (
                  <span className="font-semibold">{order.address.label}: </span>
                )}
                {order.address.line1}
                {order.address.line2 && `, ${order.address.line2}`}
                <br />
                {order.address.city} - {order.address.pincode}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Payment Info */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-royal text-lg text-bark flex items-center gap-2">
              <CreditCard className="size-4 text-saffron" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-bark font-medium capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  Status: {order.paymentStatus}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  order.paymentStatus === 'paid'
                    ? 'border-green-300 text-green-700 bg-green-50'
                    : 'border-yellow-300 text-yellow-700 bg-yellow-50'
                }`}
              >
                {order.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="pb-8">
          <Button
            variant="outline"
            onClick={goToOrderHistory}
            className="w-full border-maroon/30 text-maroon hover:bg-maroon/5 font-semibold"
            size="lg"
          >
            <ArrowLeft className="size-4 mr-1" />
            Back to My Orders
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Order History View
// ---------------------------------------------------------------------------

function OrderHistoryView() {
  const addToCart = useAppStore((s) => s.addToCart)
  const goToHome = useAppStore((s) => s.goToHome)
  const goToOrderTracking = useAppStore((s) => s.goToOrderTracking)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setOrders(json.orders ?? [])
      } catch {
        toast.error('Failed to load order history')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleReorder = (order: Order) => {
    for (const item of order.items) {
      addToCart(
        item.itemVariant.id,
        item.itemVariant.item.id,
        item.itemVariant.item.name,
        item.itemVariant.unit,
        item.priceAtOrder,
        item.itemVariant.item.vegFlag,
      )
    }
    toast.success(`${order.items.length} item(s) added to cart`)
    goToHome()
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToHome}
            className="gap-1.5 text-bark-light hover:text-bark"
          >
            <ArrowLeft className="size-4" />
            Back to Menu
          </Button>
          <h1 className="font-royal text-xl font-bold text-bark">My Orders</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border shadow-sm animate-pulse">
                <CardContent className="py-6">
                  <div className="h-4 bg-muted rounded w-32 mb-3" />
                  <div className="h-3 bg-muted rounded w-48 mb-2" />
                  <div className="h-3 bg-muted rounded w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="size-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-royal text-xl font-bold text-bark">
                No orders yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Start ordering your favourite dishes!
              </p>
            </div>
            <Button
              onClick={goToHome}
              className="bg-maroon hover:bg-maroon-light text-ivory font-semibold"
              size="lg"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          /* Order list */
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  {/* Top row: ID, date, status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {order.id.slice(0, 16)}...
                      </p>
                      <p className="text-sm text-bark mt-1">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>

                  {/* Items preview */}
                  <p className="text-sm text-bark truncate">
                    {order.items.map((item) => `${item.itemVariant.item.name} x${item.qty}`).join(', ')}
                  </p>

                  {/* Bottom row: count, total, actions */}
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold text-bark">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(order)}
                        className="text-gold-dark hover:text-gold-dark hover:bg-gold/10 gap-1 text-xs"
                      >
                        <RotateCcw className="size-3.5" />
                        Reorder
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => goToOrderTracking(order.id)}
                        className="bg-maroon hover:bg-maroon-light text-ivory text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  )
}