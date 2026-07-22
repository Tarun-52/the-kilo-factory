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
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  return (
    <section className="py-3 md:py-5 bg-ivory relative w-full">
      {/* Header (Constrained to standard width) */}
      <div className="mx-auto w-full px-4 mb-2 md:mb-3 flex items-center justify-between">
        <h2 className="font-royal text-lg md:text-2xl font-bold text-bark">Offers</h2>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll("left")} className="p-2 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"><ChevronLeft className="size-5 text-bark"/></button>
          <button onClick={() => scroll("right")} className="p-2 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"><ChevronRight className="size-5 text-bark"/></button>
        </div>
      </div>
      
      {/* SLIDER TRACK: Removed max-width constraint so it spans 100% of the screen */}
      <div ref={scrollRef} className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide px-4">
        {offers.map((offer, i) => (
          <div 
            key={i} 
            // REDUCED HEIGHT: 70px on mobile, 80px on desktop
            className={`min-w-[260px] md:min-w-[320px] h-[70px] md:h-[80px] rounded-xl p-3 flex flex-col justify-between shadow-md flex-shrink-0 cursor-pointer hover:scale-[1.02] transition-transform ${offer.bg} ${offer.text}`}
          >
            <div className="flex flex-col gap-0.5">
              {/* REDUCED TEXT SIZE to fit slimmer card */}
              <h3 className="text-sm md:text-base font-extrabold leading-tight">{offer.title}</h3>
              <p className="text-[10px] md:text-[11px] opacity-90 font-medium">{offer.desc}</p>
            </div>
            <p className="text-[8px] md:text-[9px] opacity-70 border-t border-current/20 pt-1 mt-1">{offer.sub}</p>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}