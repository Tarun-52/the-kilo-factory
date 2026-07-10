"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore as useStore } from '@/store';
import { useAuthSync } from '@/hooks/use-auth-sync';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategoryStrip from '@/components/CategoryStrip';
import MenuSection from '@/components/MenuSection';
import ItemDetailDrawer from '@/components/ItemDetailDrawer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutView from '@/components/CheckoutView';
import OrderConfirmation from '@/components/OrderConfirmation';
import OrderTracking from '@/components/OrderTracking';
import LoginModal from '@/components/LoginModal';
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const { data: session, status } = useSession();
  const { view, setMenuData, menuLoaded, setView } = useStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync NextAuth → Zustand
  useAuthSync();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch menu data on mount
  useEffect(() => {
    if (menuLoaded) return;
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        if (data.categories && data.items) {
          setMenuData(data.categories, data.items);
        }
      })
      .catch(console.error);
  }, [menuLoaded, setMenuData]);

  // Handle ?login= and ?view= query params using window.location.search
  // (avoids useSearchParams() which causes SSR bailout in Next.js 16)
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);

    // Auto-open login modal if ?login= is present
    const loginParam = params.get('login');
    if (loginParam && status === 'unauthenticated') {
      setLoginOpen(true);
    }

    // Switch SPA view if ?view= is present
    const viewParam = params.get('view');
    if (viewParam && ['order-history', 'order-tracking', 'checkout'].includes(viewParam)) {
      setView(viewParam as any);
    }
  }, [mounted, status, setView]);

  // Listen for open-login events from Header
  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener('open-login', handler);
    return () => window.removeEventListener('open-login', handler);
  }, []);

  // Auth gate for checkout
  const showLoginForCheckout = view === 'checkout' && !session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Header />

      {view === 'home' && (
        <main className="flex-1">
          <HeroSection />
          <CategoryStrip />
          <MenuSection />
        </main>
      )}

      {showLoginForCheckout && (
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <p className="font-royal text-xl text-bark mb-4">Please sign in to checkout</p>
            <button
              onClick={() => setLoginOpen(true)}
              className="bg-gold-gradient text-bark font-bold px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </main>
      )}

      {view === 'checkout' && session?.user && <CheckoutView />}
      {view === 'order-confirmation' && <OrderConfirmation />}
      {(view === 'order-tracking' || view === 'order-history') && <OrderTracking />}

      {(view === 'home' || view === 'order-history') && <Footer />}

      <ItemDetailDrawer />
      <CartDrawer />
      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          window.history.replaceState({}, '', '/');
        }}
      />
    </div>
  );
}

function HomeFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <Loader2 className="size-8 animate-spin text-maroon" />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}