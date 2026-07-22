'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore as useStore } from '@/store';
import { Flame, Clock } from 'lucide-react';

const catColors: Record<string, string> = {
  'Veg Kebab Collection': 'from-amber-700 to-orange-800',
  'Mutton Kebab Specials': 'from-red-900 to-rose-900',
  'Chicken Tikka & Kebabs': 'from-orange-700 to-amber-800',
  'Seafood Starters': 'from-cyan-800 to-blue-900',
  'Shahi Daal-e-Darbar': 'from-yellow-700 to-amber-800',
  'Paneer Specialities': 'from-emerald-700 to-green-800',
  'Veg Curries': 'from-green-700 to-emerald-800',
  'Veg Kofta Curries': 'from-amber-800 to-yellow-900',
  'Chicken Main Course': 'from-red-800 to-orange-900',
  'Egg Delicacies': 'from-yellow-600 to-amber-700',
  'Mutton Main Course': 'from-red-900 to-red-800',
  'Fish & Prawns Curry': 'from-teal-700 to-cyan-800',
  'Rice & Biryani': 'from-amber-600 to-yellow-700',
  'Raitas': 'from-lime-600 to-green-700',
  'Desserts': 'from-pink-700 to-rose-800',
  'Awadhi Breads': 'from-amber-600 to-orange-700',
  'Chinese Veg Starters': 'from-green-600 to-emerald-700',
  'Chinese Chicken Starters': 'from-red-700 to-orange-800',
  'Chinese Seafood': 'from-blue-700 to-cyan-800',
  'Veg Noodles': 'from-yellow-600 to-orange-700',
  'Chicken Noodles': 'from-yellow-600 to-orange-700',
  'Artisan Pasta': 'from-orange-600 to-amber-700',
  'Signature Food Park': 'from-purple-800 to-indigo-900',
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
      className="group relative bg-white rounded-2xl shadow-sm border border-gold/10 overflow-hidden cursor-pointer
        hover:shadow-xl hover:border-gold/40 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Veg/Non-veg dot */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`inline-block w-4 h-4 rounded-sm border-2 ${item.vegFlag ? 'border-veg-green bg-veg-green' : 'border-nonveg-red bg-nonveg-red'}`} />
      </div>

      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {item.isBestseller && (
          <span className="bg-gold text-bark text-[10px] font-bold px-1.5 py-0.5 rounded-md">★ BEST</span>
        )}
        {item.isBulkOnly && (
          <span className="bg-maroon text-ivory text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Clock size={8} /> BULK</span>
        )}
      </div>

      {/* Image - INCREASED HEIGHT */}
           {/* Image - Perfect Square, No Cropping */}
      <div className={`w-full aspect-square bg-gradient-to-br ${grad} flex items-center justify-center relative overflow-hidden`}>
        {item.photoUrl && (
          <img 
            src={item.photoUrl} 
            alt={item.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <span className={`text-6xl opacity-40 ${item.photoUrl ? 'hidden' : ''}`}>{item.category?.icon || '🍽️'}</span>
      </div>

      {/* Info - ADDED DESCRIPTION */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-royal text-base font-semibold text-bark leading-tight line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>
        
        {/* ADDED DESCRIPTION TEXT */}
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed flex-1">
            {item.description}
          </p>
        )}

        {/* Spice */}
        {item.spiceLevel > 0 && (
          <div className="mt-2 flex gap-0.5">
            {Array.from({ length: item.spiceLevel }).map((_, i) => (
              <Flame key={i} size={12} className="text-saffron" />
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm font-bold text-maroon">
            Starts ₹{minPrice}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); openItemDetail(item); }}
            className="px-4 py-1.5 rounded-full bg-gold-gradient text-bark text-xs font-bold hover:scale-110 transition-transform shadow-sm"
          >
            ADD +
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuSection() {
  // ADDED bestsellerOnly HERE
  const { items, categories, searchQuery, vegOnly, activeCategory, bestsellerOnly } = useStore();

  const filtered = useMemo(() => {
    let result = items;
    if (activeCategory !== 'all') {
      result = result.filter((i: any) => i.category?.name === activeCategory);
    }
    if (vegOnly) {
      result = result.filter((i: any) => i.vegFlag);
    }
    // ADDED BESTSELLER FILTER HERE
    if (bestsellerOnly) {
      result = result.filter((i: any) => i.isBestseller);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i: any) => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, activeCategory, vegOnly, bestsellerOnly, searchQuery]);

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
        <section id="menu-section" className="w-full px-4 md:px-8 lg:px-12 py-6">
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
            <div key={catName} className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                {cat && <span className="text-3xl">{cat.icon}</span>}
                <h2 className="font-royal text-2xl md:text-3xl font-bold text-bark">
                  {catName}
                </h2>
                <div className="flex-1 h-px bg-gold/30" />
              </div>
              {/* CHANGED GRID TO 4 COLUMNS ON DESKTOP (8 PER FRAME) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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