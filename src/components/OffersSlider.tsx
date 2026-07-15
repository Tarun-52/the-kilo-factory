"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const offers = [
  { bg: "bg-maroon", text: "text-ivory", title: "FLAT 25% OFF", desc: "On all Takeaway Orders", sub: "No minimum order amount" },
  { bg: "bg-yellow-400", text: "text-bark", title: "₹175 OFF", desc: "On Your First Order", sub: "Min. order amount ₹699" },
  { bg: "bg-maroon", text: "text-ivory", title: "BULK ORDER DEAL", desc: "Flat 10% OFF", sub: "On orders above ₹1500" },
  { bg: "bg-yellow-400", text: "text-bark", title: "FREE DELIVERY", desc: "On orders above ₹500", sub: "Use code: KILOFREE" },
  { bg: "bg-maroon", text: "text-ivory", title: "DAWAT100", desc: "Flat ₹100 OFF", sub: "Min. order amount ₹500" },
];

export default function OffersSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

  return (
    <section className="py-3 md:py-5 px-4 bg-ivory relative">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <h2 className="font-royal text-lg md:text-2xl font-bold text-bark">Offers</h2>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"><ChevronLeft className="size-5 text-bark"/></button>
            <button onClick={() => scroll("right")} className="p-2 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"><ChevronRight className="size-5 text-bark"/></button>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {offers.map((offer, i) => (
            <div 
              key={i} 
              // SLIM HEIGHT: 85px on mobile, 95px on desktop
              className={`min-w-[240px] md:min-w-[300px] h-[85px] md:h-[95px] rounded-xl p-3 md:p-3.5 flex flex-col justify-between shadow-md flex-shrink-0 cursor-pointer hover:scale-[1.02] transition-transform ${offer.bg} ${offer.text}`}
            >
              <div>
                {/* SLIM TEXT SIZES */}
                <h3 className="text-base md:text-xl font-extrabold leading-tight">{offer.title}</h3>
                <p className="text-[11px] md:text-xs opacity-90 mt-0 font-medium">{offer.desc}</p>
              </div>
              <p className="text-[9px] md:text-[10px] opacity-70 border-t border-current/20 pt-1 mt-1">{offer.sub}</p>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}