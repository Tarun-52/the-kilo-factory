"use client";

import { useAppStore as useStore } from '@/store';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // ADDED for page routing
import { MapPin, Info, ShoppingBag, Phone, ChevronRight, User, LogIn } from 'lucide-react';

export default function MobileProfile() {
  const { data: session } = useSession();
  const { setView } = useStore();
  const router = useRouter(); // ADDED router

  // Updated menu items: Removed Loyalty, Media, Unsubscribe. Added routing.
  const menuItems = [
    { icon: MapPin, label: "Store Locator", action: () => router.push('/store-locator') },
    { icon: Info, label: "About The Kilo Factory", action: () => router.push('/about') },
    { icon: ShoppingBag, label: "Bulk Order", action: () => router.push('/bulk-order') },
    { icon: Phone, label: "Contact Us", action: () => router.push('/contact') },
  ];

  return (
    <main className="flex-1 bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm mb-4 border-b border-gray-100">
        <h1 className="font-royal text-2xl font-bold text-bark text-center">My Profile</h1>
      </div>

      {/* Login/Signup or User Info */}
      <div className="px-4 mb-6">
        {session?.user ? (
          <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="size-14 rounded-full bg-maroon flex items-center justify-center text-white text-xl font-bold overflow-hidden">
              {session.user.image ? (
                <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="size-6" />
              )}
            </div>
            <div>
              <p className="font-semibold text-bark text-lg leading-tight">{session.user.name}</p>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => window.dispatchEvent(new Event('open-login'))}
            // CHANGED: From bg-red-600 to bg-maroon (your theme color)
            className="w-full bg-maroon text-white font-bold py-4 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-maroon/90 transition-colors text-lg"
          >
            <LogIn className="size-5" /> Login / Signup
          </button>
        )}
      </div>

      {/* Menu List */}
      <div className="bg-white mx-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button 
              key={item.label} 
              onClick={item.action}
              className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3 text-gray-700">
                <Icon className="size-5 text-maroon" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <ChevronRight className="size-4 text-gray-400" />
            </button>
          );
        })}
      </div>

      {/* Sign Out Button (Only if logged in) */}
      {session?.user && (
        <div className="px-4 mt-6">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full bg-white text-maroon font-bold py-3 rounded-xl shadow-sm border border-maroon/20 hover:bg-maroon/5 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </main>
  );
}