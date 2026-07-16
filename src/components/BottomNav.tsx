"use client";

import { useAppStore as useStore } from '@/store';
import { useSession } from 'next-auth/react';
import { Home, ClipboardList, UtensilsCrossed, Wallet, User } from 'lucide-react';

export default function BottomNav() {
  const { view, setView } = useStore();
  const { data: session } = useSession();

  // ADDED: 'glow: true' to the orders object
  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      action: () => setView('home'),
      glow: false
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
      glow: false
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: ClipboardList, 
      action: () => setView('order-history'),
      glow: true // This triggers the animation!
    },
    { 
      id: 'money', 
      label: 'Money', 
      icon: Wallet, 
      action: () => setView('checkout'),
      glow: false
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      action: () => setView('profile'),
      glow: false
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
              {/* Wrapper for Icon + Glow Effect */}
              <div className="relative flex items-center justify-center">
                {/* Glowing Ring Animation (Only shows if glow: true) */}
                {item.glow && (
                  <span className="absolute inline-flex h-8 w-8 rounded-full bg-gold opacity-40 animate-glow-ping"></span>
                )}
                <Icon 
                  className={`relative size-5 transition-colors ${isActive ? 'text-maroon' : 'text-gray-500'}`} 
                />
              </div>
              
              <span className={`relative text-[10px] font-medium transition-colors ${isActive ? 'text-maroon' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom CSS for the Glowing Animation */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes glow-ping {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.4;
          }
        }
        .animate-glow-ping {
          animation: glow-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </nav>
  );
}