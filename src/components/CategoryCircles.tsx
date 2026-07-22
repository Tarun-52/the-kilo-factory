"use client";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  icon: string;
  photoUrl?: string | null;
  description?: string | null;
}

interface CategoryCirclesProps {
  categories: Category[];
  items: any[]; // ADDED: Pass items to grab their images
  activeCategory: string;
  onSelectCategory: (catName: string) => void;
  onFilterChange: (filter: string) => void;
}

export default function CategoryCircles({ 
  categories, 
  items, 
  activeCategory, 
  onSelectCategory,
  onFilterChange
}: CategoryCirclesProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Veg", "Non-Veg", "Best Seller"];

  return (
    <section className="bg-ivory pb-6 px-4">
      {/* Title */}
      <h2 className="font-royal text-2xl font-bold text-bark mb-4">Categories</h2>

      {/* Top Filter Chips */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((chip) => (
          <button
            key={chip}
            onClick={() => {
              setActiveFilter(chip);
              onFilterChange(chip);
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border-2 cursor-pointer shadow-sm ${
              activeFilter === chip
                ? "bg-bark text-ivory border-bark shadow-md scale-105"
                : "bg-white text-bark border-gray-200 hover:border-bark/50 hover:shadow-md"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Horizontal Slider */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
        {categories.map((cat: Category) => {
          const isActive = activeCategory === cat.name;
          
          // MAGIC TRICK: Find the first item in this category that has an image
          const fallbackImage = items.find((i: any) => i.categoryId === cat.id && i.photoUrl)?.photoUrl;
          const displayImage = cat.photoUrl || fallbackImage;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`flex-shrink-0 w-[130px] md:w-[140px] snap-start group flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
                isActive ? "scale-105" : "hover:scale-105"
              }`}
            >
              {/* Square Image Container */}
              <div className={`w-full aspect-square rounded-2xl overflow-hidden mb-2.5 shadow-md border-2 transition-all duration-300 ${
                isActive 
                  ? "border-gold shadow-[0_0_15px_rgba(255,215,0,0.5)]" 
                  : "border-transparent group-hover:border-gold/50 group-hover:shadow-lg"
              }`}>
                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <span className="text-5xl opacity-80">{cat.icon}</span>
                  </div>
                )}
              </div>
              
              {/* Name & Description */}
              <div className="w-full px-1">
                <h3 className={`text-xs font-semibold leading-tight line-clamp-2 transition-colors ${
                  isActive ? "text-maroon" : "text-bark group-hover:text-maroon"
                }`}>
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5 hidden md:block">
                    {cat.description}
                  </p>
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