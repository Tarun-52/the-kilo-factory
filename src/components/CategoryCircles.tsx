"use client";

interface CategoryCirclesProps {
  categories: any[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

// ==========================================
// MAPPED TO DIFFERENT IMAGES FROM YOUR FOLDER
// ==========================================
const categoryImages: Record<string, string> = {
  "hyderabadi biryani": "/images/menu/nawabi-murgh-dum-biryani.jpg", 
  "lucknowi biryani": "/images/menu/nawabi-murgh-dum-biryani.jpg",     
  "kolkata biryani": "/images/menu/nawabi-murgh-dum-biryani.jpg",       
  "everyday biryani combos": "/images/menu/aaloo-ande-ka-salan.jpg", 
  "kebabs": "/images/menu/mushroom-pepper-salt.jpg",                         
  "deal of the day": "/images/menu/aaloo-ande-ka-salan.jpg",    
  "royal kebab collection": "/images/menu/mushroom-pepper-salt.jpg",
  "veg curries": "/images/menu/mushroom-pepper-salt.jpg",
  "fish curries": "/images/menu/nawabi-awadhi-fish-curry.jpg",
  "seafood specialties": "/images/menu/nawabi-awadhi-fish-curry.jpg",
  "dal specialties": "/images/menu/aaloo-ande-ka-salan.jpg",
  "egg delicacies": "/images/menu/aaloo-ande-ka-salan.jpg"
};

// Fallback: Use one of your existing images if a category isn't in the list above
const FALLBACK_IMG = "/images/menu/mushroom-pepper-salt.jpg";

export default function CategoryCircles({ 
  categories, 
  activeCategory, 
  onSelectCategory,
  activeFilter,
  onSelectFilter
}: CategoryCirclesProps) {
  const filters = ["All", "Veg", "Non-Veg", "Best Seller"];

  return (
    <section className="bg-ivory pb-6 pt-5 px-4 border-b border-gray-100">
      <h2 className="font-royal text-xl font-bold text-bark mb-4">Categories</h2>

      <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide">
        {filters.map((chip) => (
          <button
            key={chip}
            onClick={() => onSelectFilter(chip)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer
              ${activeFilter === chip
                ? "bg-bark text-ivory border-bark shadow-sm"
                : "bg-white text-bark border-gray-300 hover:border-bark/50"
              }`
            }
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          
          // Lookup image. If not found, use FALLBACK_IMG.
          const imgSrc = cat.photoUrl || categoryImages[cat.name?.toLowerCase().trim()] || FALLBACK_IMG;
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center cursor-pointer group flex-shrink-0"
            >
              <div className={`relative w-[110px] h-[120px] rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-300 bg-white border-2
                ${isActive 
                  ? "border-gold shadow-md scale-105" 
                  : "border-gray-200 group-hover:border-gold/60 group-hover:shadow-sm"
                }`}
              >
                {/* CIRCLE IMAGE CONTAINER */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-100 mb-2 bg-gray-50 flex items-center justify-center">
                  
                  <img 
                    src={imgSrc} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      // If your local image 404s, instantly swap to the fallback image!
                      e.currentTarget.src = FALLBACK_IMG;
                      e.currentTarget.onerror = null; 
                    }}
                  />
                </div>
                
                <span className={`text-[11px] font-medium text-center leading-tight line-clamp-2 w-full
                  ${isActive ? "text-maroon font-bold" : "text-gray-700 group-hover:text-bark"}`}
                >
                  {cat.name}
                </span>

                {cat.isDeal && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow">
                    DEAL OF THE DAY
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}