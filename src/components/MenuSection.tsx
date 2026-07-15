'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore as useStore } from '@/store';
import { Flame, Clock } from 'lucide-react';

const catColors: Record<string, string> = {
  'Royal Kebab Collection': 'from-amber-700 to-orange-800',
  'Mutton Specialties': 'from-red-900 to-rose-900',
  'Chicken Specialties': 'from-orange-700 to-amber-800',
  'Seafood Specialties': 'from-cyan-800 to-blue-900',
  'Dal Specialties': 'from-yellow-700 to-amber-800',
  'Paneer Specialties': 'from-emerald-700 to-green-800',
  'Veg Curries': 'from-green-700 to-emerald-800',
  'Veg Kofta Curries': 'from-amber-800 to-yellow-900',
  'Awadhi Chicken Curries': 'from-red-800 to-orange-900',
  'Egg Delicacies': 'from-yellow-600 to-amber-700',
  'Mutton Curries': 'from-red-900 to-red-800',
  'Fish Curries': 'from-teal-700 to-cyan-800',
  'Rice & Biryani': 'from-amber-600 to-yellow-700',
  'Raitas': 'from-lime-600 to-green-700',
  'Desserts': 'from-pink-700 to-rose-800',
  'Awadhi Breads': 'from-amber-600 to-orange-700',
  'Indo-Chinese Veg': 'from-green-600 to-emerald-700',
  'Chicken Indo-Chinese': 'from-red-700 to-orange-800',
  'Seafood Indo-Chinese': 'from-blue-700 to-cyan-800',
  'Noodles': 'from-yellow-600 to-orange-700',
  'Artisan Pasta': 'from-orange-600 to-amber-700',
  'Party Specials': 'from-purple-800 to-indigo-900',
  'Beverages': 'from-sky-500 to-cyan-600',
};

function ItemCard({ item, index }: { item: any; index: number }) {
  const { openItemDetail } = useStore();
  const minPrice = item.variants?.length
    ? Math.min(...item.variants.map((v: any) => v.price))
    : 0;
  const catName = item.category?.name || '';
  const grad = catColors[catName] || 'from-gray-600 to-gray-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      onClick={() => openItemDetail(item)}
      className="group relative bg-white rounded-xl shadow-sm border border-gold/10 overflow-hidden cursor-pointer
        hover:shadow-lg hover:border-gold/40 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Veg/Non-veg dot */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className={`inline-block w-4 h-4 rounded-sm border-2 ${item.vegFlag ? 'border-veg-green bg-veg-green' : 'border-nonveg-red bg-nonveg-red'}`} />
      </div>

      {/* Badges */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        {item.isBestseller && (
          <span className="bg-gold text-bark text-[10px] font-bold px-1.5 py-0.5 rounded-md">★ BEST</span>
        )}
        {item.isBulkOnly && (
          <span className="bg-maroon text-ivory text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Clock size={8} /> BULK</span>
        )}
      </div>

      {/* Image placeholder */}
            {/* Image */}
      <div className={`h-32 bg-gradient-to-br ${grad} flex items-center justify-center relative overflow-hidden`}>
        {item.photoUrl && (
          <img 
            src={item.photoUrl} 
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <span className={`text-5xl opacity-40 ${item.photoUrl ? 'hidden' : ''}`}>{item.category?.icon || '🍽️'}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-royal text-base font-semibold text-bark leading-tight line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>

        {/* Spice */}
        {item.spiceLevel > 0 && (
          <div className="mt-1.5 flex gap-0.5">
            {Array.from({ length: item.spiceLevel }).map((_, i) => (
              <Flame key={i} size={12} className="text-saffron" />
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-maroon">
            Starts ₹{minPrice}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); openItemDetail(item); }}
            className="px-3 py-1 rounded-full bg-gold-gradient text-bark text-xs font-bold hover:scale-110 transition-transform shadow-sm"
          >
            ADD +
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ADDED: activeFilter prop to accept the filter selection from page.tsx
export default function MenuSection({ activeFilter }: { activeFilter: string }) {
  const { items, categories, searchQuery, vegOnly, activeCategory } = useStore();

  const filtered = useMemo(() => {
    let result = items;
    
    // Category Filter
    if (activeCategory !== 'all') {
      result = result.filter((i: any) => i.category?.name === activeCategory || i.category?.id === activeCategory);
    }
    
    // ADDED: Dietary Filter Logic (Veg, Non-Veg, Best Seller)
    if (activeFilter === 'Veg') {
      result = result.filter((i: any) => i.vegFlag === true);
    } else if (activeFilter === 'Non-Veg') {
      result = result.filter((i: any) => i.vegFlag === false);
    } else if (activeFilter === 'Best Seller') {
      result = result.filter((i: any) => i.isBestseller === true);
    }

    // Existing VegOnly toggle (if you have it in your store)
    if (vegOnly) {
      result = result.filter((i: any) => i.vegFlag);
    }
    
    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i: any) => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, activeCategory, vegOnly, searchQuery, activeFilter]); // ADDED activeFilter to dependency array

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const item of filtered) {
      const catName = item.category?.name || 'Other';
      if (!map.has(catName)) map.set(catName, []);
      map.get(catName)!.push(item);
    }
    return map;
  }, [filtered]);

  if (items.length === 0) {
    return (
      <div id="menu-section" className="flex items-center justify-center py-32">
        <div className="animate-pulse flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-gold/20 animate-pulse" />
          <p className="text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <section id="menu-section" className="max-w-7xl mx-auto px-4 py-6">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <h3 className="font-royal text-2xl text-bark mb-2">No items found</h3>
          <p className="text-muted-foreground text-sm">Try a different search or category</p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([catName, catItems]) => {
          const cat = categories.find((c: any) => c.name === catName);
          return (
            <div key={catName} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                {cat && <span className="text-2xl">{cat.icon}</span>}
                <h2 className="font-royal text-2xl md:text-3xl font-bold text-bark">
                  {catName}
                </h2>
                <div className="flex-1 h-px bg-gold/30" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {catItems.map((item, i) => (
                  <ItemCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}