"use client";
import { useState } from "react";

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
  const [paused, setPaused] = useState(false);
  const duplicatedOffers = [...offers, ...offers];

  return (
    <section className="w-full bg-ivory py-6 overflow-hidden">
      <div className="w-full px-4 md:px-8 mb-4">
        <h2 className="font-royal text-2xl font-bold text-bark">Offers</h2>
      </div>

      {/* Scrolling Track - Pauses perfectly on Hover/Touch */}
      <div 
        className={`flex w-max ${!paused ? 'animate-scroll-track' : ''}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 3000)} // Resumes 3s after swiping on mobile
      >
        {duplicatedOffers.map((offer, i) => {
          const isBrown = i % 2 === 0;
          return (
            <div
              key={i}
              className={`min-w-[82vw] sm:min-w-[280px] md:min-w-[340px] lg:min-w-[380px] h-[85px] sm:h-[90px] md:h-[95px] mx-1.5 sm:mx-2 flex-shrink-0 rounded-xl px-4 sm:px-5 py-3 flex flex-col justify-center shadow-lg cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl
                ${isBrown ? 'bg-bark text-ivory' : 'bg-gold text-bark'}
              `}
              style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {/* Left aligned text for perfect alignment */}
              <div className="text-left">
                <h3 className="text-sm sm:text-base md:text-lg font-extrabold tracking-wide leading-tight line-clamp-1">
                  {offer.title}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm opacity-90 mt-0.5 leading-snug font-medium line-clamp-1">
                  {offer.desc}
                </p>
                <p className={`text-[9px] sm:text-[10px] md:text-[11px] opacity-60 mt-1 pt-1 border-t ${
                  isBrown ? 'border-ivory/20' : 'border-bark/20'
                }`}>
                  {offer.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flawless CSS Animation - Prevents ANY tucking or stuttering */}
      <style jsx>{`
        @keyframes scroll-track {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-track {
          animation: scroll-track 50s linear infinite;
        }
      `}</style>
    </section>
  );
}