"use client";

import { ShoppingBag, Scale, ChefHat, Truck } from 'lucide-react';

export default function HeroSection() {
  // Features array for the little icons under the text
  const features = [
    { icon: Scale, text: "By Weight" },
    { icon: ChefHat, text: "Freshly Made" },
    { icon: Truck, text: "Fast Delivery" },
  ];

  return (
    <section className="bg-bark text-ivory overflow-hidden relative">
      {/* Subtle Gold Glow Background */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left Content */}
        <div className="space-y-6 text-center md:text-left">
          <h1 className="font-royal text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gold">
            Authentic Flavours. <br/> 
            <span className="text-ivory">ROYAL TASTE, BY THE KILO.</span>
          </h1>
          
          <p className="text-lg text-ivory/80 max-w-lg mx-auto md:mx-0 font-medium">
            Authentic Kebabs, Biryani & Curries — By Weight, Delivered Fresh.
          </p>
          
          {/* Features List */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 py-2">
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-ivory/90">
                <feat.icon className="size-5 text-gold" />
                <span>{feat.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <button 
              onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-gold-gradient text-bark font-bold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer text-lg"
            >
              <ShoppingBag className="size-5" />
              ORDER NOW
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative flex justify-center md:justify-end">
          <div className="relative w-full max-w-md md:max-w-lg aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gold/20">
            <img 
              src="/hero-banner.webp" 
              alt="The Kilo Factory Authentic Food" 
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay to blend image with dark background */}
            <div className="absolute inset-0 bg-gradient-to-t from-bark/60 via-transparent to-transparent"></div>
          </div>
        </div>

      </div>
    </section>
  );
}