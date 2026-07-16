"use client";

import { useAppStore as useStore } from '@/store';
import { useSession } from 'next-auth/react';
import { Home, ClipboardList, UtensilsCrossed, Wallet, User } from 'lucide-react';

export default function BottomNav() {
  const { view, setView } = useStore();
  const { data: session } = useSession();

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      action: () => setView('home') 
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
      }
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: ClipboardList, 
      action: () => setView('order-history') 
    },
    { 
      id: 'money', 
      label: 'Money', 
      icon: Wallet, 
      action: () => setView('checkout') 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      // UPDATED: Now opens the mobile profile page
      action: () => setView('profile') 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-40">
      <div className="flex items-center justify-around py-1.5 px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
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
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 cursor-pointer transition-colors"
            >
              <Icon 
                className={`size-5 transition-colors ${isActive ? 'text-maroon' : 'text-gray-500'}`} 
              />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-maroon' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}