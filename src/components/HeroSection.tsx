'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  const scrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative w-full">
      {/* ── Main Hero ──────────────────────────────────────────── */}
      
      {/* 🛑 CHANGED LINE 1 HERE: Added min-h, background image URL, cover, center, and no-repeat */}
      <div className="relative min-h-600px bg-[url('/hero-banner.webp')] bg-cover bg-center bg-no-repeat overflow-hidden">
        
        {/* 🛑 CHANGED LINE 2 HERE: Changed bg-black/20 to bg-black/60 so text is readable over the photo */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content (No changes needed here, it already has relative z-10!) */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center min-h-600px">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-royal text-5xl md:text-7xl font-bold text-gold-gradient leading-tight"
          >
            The Kilo Factory
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            className="mt-4 text-lg md:text-xl font-medium text-ivory/90 tracking-wide"
          >
            From the Royal Kitchens of Awadh
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="mt-3 max-w-lg text-sm md:text-base text-ivory/70 leading-relaxed"
          >
            Authentic Kebabs, Biryanis &amp; Curries — by Weight, Delivered Fresh
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.75, ease: 'easeOut' }}
            onClick={scrollToMenu}
            className="mt-8 px-8 py-3 rounded-full bg-gold-gradient text-bark font-semibold text-sm md:text-base tracking-wide shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            Order Now
          </motion.button>
        </div>
      </div>

      {/* ── Offers Bar ─────────────────────────────────────────── */}
      <div className="bg-maroon-dark border-t border-gold/30">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block rounded bg-gold/90 text-bark px-2 py-0.5 font-bold text-xs tracking-wide">
              DAWAT100
            </span>
            <span className="text-ivory/80">
              for ₹100 off on ₹500+
            </span>
          </div>
          <span className="hidden sm:inline text-gold/40">|</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block rounded bg-gold/90 text-bark px-2 py-0.5 font-bold text-xs tracking-wide">
              ROYAL20
            </span>
            <span className="text-ivory/80">
              20% off on orders above ₹800
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}