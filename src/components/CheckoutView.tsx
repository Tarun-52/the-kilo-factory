'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Truck, CreditCard, Banknote } from 'lucide-react';
import { useAppStore as useStore } from '@/store';
import { toast } from 'sonner';

export default function CheckoutView() {
  const { data: session } = useSession();
  const {
    cartItems, getCartSubtotal, couponCode, couponDiscount, deliveryFee, deliveryPincode,
    clearCart, goToOrderConfirmation, goToHome,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name ?? '',
    mobile: '',
    line1: '',
    line2: '',
    city: 'Lucknow',
    pincode: deliveryPincode || '',
  });
  const [payment, setPayment] = useState('cod');
  const [instructions, setInstructions] = useState('');

  const subtotal = getCartSubtotal();
  const gst = Math.round(subtotal * 0.05);
  const packaging = 20;
  const total = Math.max(0, subtotal + gst + packaging + deliveryFee - couponDiscount);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handlePlace = async () => {
    if (!form.name || !form.mobile || !form.line1 || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(ci => ({ variantId: ci.variantId, qty: ci.qty })),
          address: { line1: form.line1, line2: form.line2, city: form.city, pincode: form.pincode, label: 'Home' },
          paymentMethod: payment,
          specialInstructions: instructions,
          couponCode: couponCode || undefined,
          userId: session?.user?.id || undefined,
          userName: form.name,
          userMobile: form.mobile,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        clearCart();
        goToOrderConfirmation(data.order?.id ?? data.id);
        toast.success('Order placed successfully!');
      }
    } catch {
      toast.error('Failed to place order. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-maroon-gradient px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={goToHome} className="text-ivory hover:text-gold transition cursor-pointer"><ArrowLeft size={22} /></button>
          <h1 className="font-royal text-2xl text-ivory font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-5">
          {/* Address */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gold/10">
            <h2 className="font-royal text-xl font-bold text-bark mb-4 flex items-center gap-2">
              <Truck size={18} className="text-maroon" /> Delivery Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name" className="mt-1" /></div>
              <div><Label>Mobile *</Label><Input value={form.mobile} onChange={e => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" className="mt-1" /></div>
              <div className="sm:col-span-2"><Label>Address Line 1 *</Label><Input value={form.line1} onChange={e => update('line1', e.target.value)} placeholder="House no, street" className="mt-1" /></div>
              <div className="sm:col-span-2"><Label>Address Line 2</Label><Input value={form.line2} onChange={e => update('line2', e.target.value)} placeholder="Landmark, area" className="mt-1" /></div>
              <div><Label>City</Label><Input value={form.city} onChange={e => update('city', e.target.value)} className="mt-1" /></div>
              <div><Label>Pincode *</Label><Input value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="226001" className="mt-1" /></div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gold/10">
            <h2 className="font-royal text-xl font-bold text-bark mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-maroon" /> Payment Method
            </h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${payment === 'cod' ? 'border-maroon bg-maroon/5' : 'border-gold/20 hover:border-gold/40'}`}>
                <input type="radio" name="payment" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="accent-maroon" />
                <Banknote size={18} className="text-gold-dark" />
                <div><p className="text-sm font-medium">Cash on Delivery</p><p className="text-xs text-muted-foreground">Pay when your order arrives</p></div>
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${payment === 'online' ? 'border-maroon bg-maroon/5' : 'border-gold/20 hover:border-gold/40'}`}>
                <input type="radio" name="payment" checked={payment === 'online'} onChange={() => setPayment('online')} className="accent-maroon" />
                <CreditCard size={18} className="text-gold-dark" />
                <div><p className="text-sm font-medium">Online Payment</p><p className="text-xs text-muted-foreground">UPI / Card / NetBanking — coming soon</p></div>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gold/10">
            <Label>Special Instructions</Label>
            <Textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Any special requests (extra spicy, no onions, etc.)" className="mt-1" rows={3} />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gold/10 sticky top-24">
            <h2 className="font-royal text-xl font-bold text-bark mb-3">Order Summary</h2>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto scrollbar-thin">
              {cartItems.map(ci => (
                <div key={ci.variantId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{ci.itemName} <span className="text-xs">({ci.unit}) x{ci.qty}</span></span>
                  <span className="font-medium flex-shrink-0">₹{(ci.price * ci.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <Separator className="bg-gold/20" />
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST (5%)</span><span>₹{gst}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Packaging</span><span>₹{packaging}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee > 0 ? `₹${deliveryFee}` : deliveryPincode ? 'Free' : 'Enter pincode'}</span></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-veg-green"><span>Discount ({couponCode})</span><span>-₹{couponDiscount}</span></div>
              )}
            </div>
            <Separator className="bg-gold/20 my-3" />
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span><span className="text-maroon">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <Button
              onClick={handlePlace}
              disabled={loading}
              className="w-full bg-gold-gradient text-bark font-bold py-3 rounded-xl hover:shadow-lg transition-all text-base"
            >
              {loading ? <><Loader2 size={18} className="mr-2 animate-spin" /> Placing Order...</> : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}