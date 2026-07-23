"use client";
import { useEffect, useRef } from "react";

const offers = [
  { title: "FLAT 25% OFF", desc: "On all Takeaway Orders", sub: "No minimum order amount" },
  { title: "₹175 OFF", desc: "On Your First Order", sub: "Min. order amount ₹699" },
  { title: "BULK ORDER DEAL", desc: "Flat 10% OFF", sub: "On orders above ₹1500" },
  { title: "FREE DELIVERY", desc: "On orders above ₹500", sub: "Use code: KILOFREE" },
  { title: "DAWAT100", desc: "Flat ₹100 OFF", sub: "Min. order amount ₹500" },
  { title: "HAPPY HOURS", desc: "15% OFF 5 PM - 8 PM", sub: "Valid on all menu items" },
  { title: "WEEKEND SPECIAL", desc: "Flat ₹200 OFF", sub: "Min. order amount ₹800" },
  { title: "COMBO DEAL", desc: "2 Curries + 4 Rotis", sub: "Just for ₹599" },
  { title: "ROYAL FEAST", desc: "20% OFF on Biryani", sub: "On orders above ₹1000" },
];

export default function OffersSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startScroll = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth } = scrollRef.current;
        // If we reach the duplicated end, jump seamlessly back to start
        if (scrollLeft >= scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 0.5; // Smooth continuous movement
        }
      }
    }, 16); // 60fps smooth scrolling
  };

  const stopScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("mouseenter", stopScroll);
      el.addEventListener("mouseleave", startScroll);
    }
    return () => {
      stopScroll();
      if (el) {
        el.removeEventListener("mouseenter", stopScroll);
        el.removeEventListener("mouseleave", startScroll);
      }
    };
  }, []);

  // Duplicate for seamless loop
  const duplicatedOffers = [...offers, ...offers];

  return (
    <section className="w-full bg-ivory py-6 overflow-hidden">
      <div className="w-full px-4 md:px-8 mb-4">
        <h2 className="font-royal text-2xl font-bold text-bark">Offers</h2>
      </div>

      {/* Slider Container - Native mouse wheel scroll works perfectly here */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {duplicatedOffers.map((offer, i) => {
          // Alternate strictly between Brown (bark) and Gold
          const isBrown = i % 2 === 0;
          return (
            <div
              key={i}
              className={`min-w-[85vw] sm:min-w-[320px] md:min-w-[380px] lg:min-w-[420px] h-[110px] md:h-[115px] mx-2 flex-shrink-0 rounded-2xl px-6 py-4 flex flex-col justify-center shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl
                ${isBrown ? 'bg-bark text-ivory' : 'bg-gold text-bark'}
              `}
              style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
            >
              <h3 className="text-lg md:text-xl font-extrabold tracking-wide leading-tight">
                {offer.title}
              </h3>
              <p className="text-xs md:text-sm opacity-90 mt-0.5 leading-snug font-medium">
                {offer.desc}
              </p>
              <p className={`text-[10px] md:text-[11px] opacity-60 mt-1.5 pt-1.5 border-t ${
                isBrown ? 'border-ivory/20' : 'border-bark/20'
              }`}>
                {offer.sub}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}