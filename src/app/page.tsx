"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore as useStore } from '@/store';
import { useAuthSync } from '@/hooks/use-auth-sync';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import OffersSlider from '@/components/OffersSlider';
import CategoryCircles from '@/components/CategoryCircles';
import MenuSection from '@/components/MenuSection';
import ItemDetailDrawer from '@/components/ItemDetailDrawer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutView from '@/components/CheckoutView';
import OrderConfirmation from '@/components/OrderConfirmation';
import OrderTracking from '@/components/OrderTracking';
import LoginModal from '@/components/LoginModal';
import BottomNav from '@/components/BottomNav'; // ADDED: Mobile Bottom Nav
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const { data: session, status } = useSession();
  const { view, setMenuData, menuLoaded, setView, categories, activeCategory, setActiveCategory } = useStore();
  
  const [loginOpen, setLoginOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // State for the dietary filter so products change on click
  const [activeFilter, setActiveFilter] = useState("All");

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

  // Handle ?login= and ?view= query params
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);

    const loginParam = params.get('login');
    if (loginParam && status === 'unauthenticated') {
      setLoginOpen(true);
    }

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

  const showLoginForCheckout = view === 'checkout' && !session?.user;

  return (
    // ADDED pb-16 md:pb-0 so the fixed bottom menu doesn't cover content on mobile
    <div className="min-h-screen flex flex-col bg-ivory pb-16 md:pb-0">
      <Header />

      {view === 'home' && (
        <main className="flex-1">
          <HeroSection />
          
          {/* Promotional Banner Slider */}
          <OffersSlider /> 

          {/* Filter Chips + Circular Image Categories */}
          <CategoryCircles 
            categories={categories || []} 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />

          {/* Pass the activeFilter to MenuSection so it actually filters the items */}
          <MenuSection activeFilter={activeFilter} />
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

      {/* ADDED: Mobile Bottom Navigation Bar */}
      <BottomNav />
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