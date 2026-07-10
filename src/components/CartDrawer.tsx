'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, X, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { useAppStore as useStore } from '@/store';
import { toast } from 'sonner';

const ZONE_FEES: Record<string, number> = {
  '226001': 0, '226010': 30, '226015': 30, '226016': 40, '226020': 40,
};

export default function CartDrawer() {
  const {
    cartItems, cartOpen, setCartOpen, couponCode, couponDiscount,
    setCoupon, clearCoupon, deliveryFee, deliveryPincode,
    setDeliveryFee, setDeliveryPincode, removeFromCart, updateQty,
    getCartSubtotal, getCartCount, goToCheckout,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode || '');

  const subtotal = getCartSubtotal();
  const gst = Math.round(subtotal * 0.05);
  const packaging = 20;
  const total = Math.max(0, subtotal + gst + packaging + deliveryFee - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.toUpperCase(), orderValue: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon(data.coupon.code, data.discount);
        toast.success(`${data.coupon.code} applied! -₹${data.discount}`);
        setCouponInput('');
      } else {
        toast.error(data.message || 'Invalid coupon');
      }
    } catch {
      toast.error('Could not validate coupon');
    }
    setApplying(false);
  };

  const handlePincodeBlur = () => {
    const pc = pincodeInput.trim();
    if (pc.length === 6) {
      const fee = ZONE_FEES[pc] ?? 50;
      setDeliveryFee(fee);
      setDeliveryPincode(pc);
      toast.success(`Delivery to ${pc}: ₹${fee} delivery fee`);
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    goToCheckout();
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-gold/20">
          <SheetTitle className="font-royal text-2xl text-bark flex items-center gap-2">
            <ShoppingBag size={22} />
            Your Cart
            <span className="ml-1 text-sm font-sans bg-maroon text-ivory rounded-full w-6 h-6 flex items-center justify-center">
              {getCartCount()}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={48} className="text-gold/40 mb-4" />
              <p className="font-royal text-xl text-bark mb-1">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Add some delicious items!</p>
            </div>
          ) : (
            <div className="px-5 py-3">
              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map(ci => (
                  <div key={ci.variantId} className="flex items-center gap-3 p-3 bg-ivory/50 rounded-lg">
                    <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${ci.vegFlag ? 'bg-veg-green' : 'bg-nonveg-red'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-bark truncate">{ci.itemName}</p>
                      <p className="text-xs text-muted-foreground">{ci.unit} · ₹{ci.price}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(ci.variantId, ci.qty - 1)} className="w-6 h-6 rounded-full border border-gold/40 flex items-center justify-center hover:bg-gold/10 cursor-pointer"><Minus size={10} /></button>
                      <span className="w-5 text-center text-sm font-medium">{ci.qty}</span>
                      <button onClick={() => updateQty(ci.variantId, ci.qty + 1)} className="w-6 h-6 rounded-full border border-gold/40 flex items-center justify-center hover:bg-gold/10 cursor-pointer"><Plus size={10} /></button>
                    </div>
                    <p className="text-sm font-semibold text-maroon w-16 text-right">₹{(ci.price * ci.qty).toLocaleString('en-IN')}</p>
                    <button onClick={() => removeFromCart(ci.variantId)} className="text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <Separator className="bg-gold/20" />

              {/* Coupon */}
              <div className="py-3">
                {couponCode ? (
                  <div className="flex items-center justify-between bg-gold/10 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-gold-dark" />
                      <span className="text-sm font-medium">{couponCode}</span>
                      <span className="text-xs text-veg-green font-semibold">-₹{couponDiscount}</span>
                    </div>
                    <button onClick={() => { clearCoupon(); }} className="text-muted-foreground hover:text-destructive cursor-pointer"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 text-sm h-9"
                    />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={applying || !couponInput}
                      className="border-gold text-gold-dark hover:bg-gold/10 font-semibold text-xs">
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="bg-gold/20" />

              {/* Pincode */}
              <div className="py-3">
                <p className="text-xs text-muted-foreground mb-1.5">Delivery pincode</p>
                <Input
                  placeholder="Enter 6-digit pincode (e.g. 226001)"
                  value={pincodeInput}
                  onChange={e => setPincodeInput(e.target.value.slice(0, 6))}
                  onBlur={handlePincodeBlur}
                  className="text-sm h-9"
                  maxLength={6}
                />
                {deliveryFee > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Delivery fee: ₹{deliveryFee}</p>
                )}
              </div>

              <Separator className="bg-gold/20" />

              {/* Summary */}
              <div className="py-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>₹{gst}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Packaging</span><span>₹{packaging}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'Enter pincode'}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-veg-green"><span>Discount</span><span>-₹{couponDiscount}</span></div>
                )}
                <Separator className="bg-gold/20" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span><span className="text-maroon text-xl">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="px-5 pb-5 pt-3 border-t border-gold/20">
            <Button
              onClick={handleCheckout}
              className="w-full bg-maroon-gradient text-ivory font-bold py-3 rounded-xl hover:shadow-lg transition-all text-base"
            >
              Proceed to Checkout · ₹{total.toLocaleString('en-IN')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}