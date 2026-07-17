"use client";

import { ShoppingBag, Scale, ChefHat, Truck } from 'lucide-react';

export default function HeroSection() {
  // Features array matching your image
  const features = [
    { icon: Scale, text: "BY WEIGHT Served" },
    { icon: ChefHat, text: "FRESHLY Prepared" },
    { icon: Truck, text: "FAST Delivery" },
  ];

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center text-center overflow-hidden">
      
      {/* Background Image (Full Screen) */}
      <img 
        src="/hero-banner.webp" 
        alt="The Kilo Factory Authentic Food" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
      
      {/* Centered Content Overlay */}
      <div className="relative z-10 max-w-3xl px-4 py-16 space-y-8 flex flex-col items-center">
        
        {/* Main Typography */}
        <h1 className="font-royal text-4xl md:text-6xl font-bold leading-tight text-gold drop-shadow-lg">
          Authentic Flavours. <br/> 
          <span className="text-ivory">ROYAL TASTE, BY THE KILO.</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-ivory/90 max-w-2xl font-medium drop-shadow-md">
          Authentic Kebabs, Biryani & Curries — By Weight, Delivered Fresh.
        </p>
        
        {/* Features List (Pill Badges) */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 py-2">
          {features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-semibold text-ivory bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-gold/30">
              <feat.icon className="size-5 text-gold" />
              <span>{feat.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 bg-gold-gradient text-bark font-bold px-10 py-4 rounded-full shadow-xl hover:scale-105 transition-transform cursor-pointer text-lg"
        >
          <ShoppingBag className="size-6" />
          ORDER NOW
        </button>

      </div>
    </section>
  );
}