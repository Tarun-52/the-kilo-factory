"use client";

const offers = [
  { bg: "bg-red-800", text: "text-white", title: "FLAT 25% OFF", desc: "On all Takeaway Orders", sub: "No minimum order amount" },
  { bg: "bg-amber-400", text: "text-gray-900", title: "₹175 OFF", desc: "On Your First Order", sub: "Min. order amount ₹699" },
  { bg: "bg-teal-700", text: "text-white", title: "BULK ORDER DEAL", desc: "Flat 10% OFF", sub: "On orders above ₹1500" },
  { bg: "bg-blue-700", text: "text-white", title: "FREE DELIVERY", desc: "On orders above ₹500", sub: "Use code: KILOFREE" },
  { bg: "bg-orange-500", text: "text-white", title: "DAWAT100", desc: "Flat ₹100 OFF", sub: "Min. order amount ₹500" },
  { bg: "bg-purple-700", text: "text-white", title: "HAPPY HOURS", desc: "15% OFF 5 PM - 8 PM", sub: "Valid on all menu items" },
  { bg: "bg-emerald-600", text: "text-white", title: "WEEKEND SPECIAL", desc: "Flat ₹200 OFF", sub: "Min. order amount ₹800" },
  { bg: "bg-rose-500", text: "text-white", title: "COMBO DEAL", desc: "2 Curries + 4 Rotis", sub: "Just for ₹599" },
  { bg: "bg-indigo-600", text: "text-white", title: "ROYAL FEAST", desc: "20% OFF on Biryani", sub: "On orders above ₹1000" },
];

export default function OffersSlider() {
  // Duplicate the list for a seamless infinite loop effect
  const duplicatedOffers = [...offers, ...offers];

  return (
    <section className="w-full bg-ivory py-6 overflow-hidden">
      <div className="w-full px-4 mb-4">
        <h2 className="font-royal text-2xl font-bold text-bark">Offers</h2>
      </div>

      {/* Scrolling Track - Pauses on Hover */}
      <div className="flex hover:[animation-play-state:paused] animate-scroll-track">
        {duplicatedOffers.map((offer, i) => (
          <div
            key={i}
            className={`min-w-[85vw] sm:min-w-[320px] md:min-w-95 lg:min-w-105 h-25 md:h-27.5 mx-2 shrink-0 rounded-2xl px-6 py-3 flex flex-col justify-between shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105 ${offer.bg} ${offer.text}`}
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">{offer.title}</h3>
              <p className="text-sm md:text-base opacity-90 mt-1 font-medium">{offer.desc}</p>
            </div>
            <p className="text-xs opacity-70 border-t border-current/20 pt-2 mt-2">{offer.sub}</p>
          </div>
        ))}
      </div>

      {/* CSS Animation for continuous scrolling */}
      <style jsx>{`
        @keyframes scroll-track {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-track {
          animation: scroll-track 45s linear infinite;
        }
      `}</style>
    </section>
  );
}