"use client";

import { ShoppingBag, Scale, ChefHat, Truck } from 'lucide-react';

export default function HeroSection() {
  const features = [
    { icon: Scale, text: "BY WEIGHT Served" },
    { icon: ChefHat, text: "FRESHLY Prepared" },
    { icon: Truck, text: "FAST Delivery" },
  ];

  return (
    <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
      
      {/* Background Image */}
      <img 
        src="/hero-banner.webp" 
        alt="The Kilo Factory Authentic Food" 
        className="absolute inset-0 w-full h-full object-cover object-right md:object-center"
      />
      
      {/* Left-Side Dark Gradient Overlay (Extended further right) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
      
      {/* Content Container (Increased width to 60%, reduced vertical spacing) */}
      <div className="relative z-10 w-full md:w-3/5 lg:w-[55%] h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 py-10 text-left space-y-4 md:space-y-6">
        
        {/* Main Typography */}
        <div className="space-y-1.5 md:space-y-2">
          <h1 className="font-royal text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
            <span className="text-gold">Authentic Flavours.</span> <br/> 
            <span className="text-ivory">ROYAL TASTE, BY THE KILO.</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-sm md:text-base lg:text-lg text-ivory/90 max-w-md font-medium drop-shadow-md">
            Authentic Kebabs, Biryani & Curries — By Weight, Delivered Fresh.
          </p>
        </div>
        
        {/* Features List */}
        <div className="flex flex-col gap-2.5 md:gap-3">
          {features.map((feat, i) => (
            <div key={i} className="flex items-center gap-3 text-sm md:text-base font-semibold text-ivory">
              <feat.icon className="size-5 text-gold drop-shadow" />
              <span className="drop-shadow">{feat.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pt-1">
          <button 
            onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-gold-gradient text-bark font-bold px-7 py-3 md:py-3.5 rounded-full shadow-xl hover:scale-105 transition-transform cursor-pointer text-sm md:text-base"
          >
            <ShoppingBag className="size-5" />
            ORDER NOW
          </button>
        </div>

      </div>
    </section>
  );
}