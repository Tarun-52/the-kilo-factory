"use client";

import { useAppStore as useStore } from '@/store';
import { useSession } from 'next-auth/react';
import { Home, ClipboardList, UtensilsCrossed, Wallet, User } from 'lucide-react';

export default function BottomNav() {
  const { view, setView } = useStore();
  const { data: session } = useSession();

  // Added 'highlight: true' only for Orders
  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      action: () => setView('home'),
      highlight: false
    },
    { 
      id: 'menu', 
      label: 'Menu', 
      icon: UtensilsCrossed, 
      action: () => {
        setView('home');
        setTimeout(() => {
          document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      highlight: false
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: ClipboardList, 
      action: () => setView('order-history'),
      highlight: true // This makes it larger with a green floating circle
    },
    { 
      id: 'money', 
      label: 'Money', 
      icon: Wallet, 
      action: () => setView('checkout'),
      highlight: false
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      action: () => setView('profile'),
      highlight: false
    },
  ];

  return (
    // Added pt-4 so the floating circle doesn't get cut off at the top
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-40 pt-4">
      <div className="flex items-end justify-around px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          const isActive = 
            (view === item.id) || 
            (view === 'order-history' && item.id === 'orders') || 
            (view === 'order-tracking' && item.id === 'orders') ||
            (view === 'checkout' && item.id === 'money');
          
          return (
            <button 
              key={item.id} 
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-1 flex-1 cursor-pointer transition-colors"
            >
              {item.highlight ? (
                // Floating Green Circle for Orders (Larger Icon)
                <div className="bg-veg-green p-3 rounded-full shadow-lg -mt-8 border-4 border-white">
                  <Icon className="size-6 text-white" />
                </div>
              ) : (
                // Normal Icons
                <div className="flex items-center justify-center py-1">
                  <Icon className={`size-5 transition-colors ${isActive ? 'text-maroon' : 'text-gray-500'}`} />
                </div>
              )}
              
              <span className={`relative text-[10px] font-medium transition-colors ${isActive ? 'text-maroon' : 'text-gray-500'} ${item.highlight ? 'mt-1' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}