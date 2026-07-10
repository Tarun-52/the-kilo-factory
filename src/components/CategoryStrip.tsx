'use client';

import { useRef, useEffect } from 'react';
import { useAppStore as useStore } from '@/store';

export default function CategoryStrip() {
  const { categories, activeCategory, setActiveCategory } = useStore();
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCategory !== 'all' && stripRef.current) {
      const btn = stripRef.current.querySelector(`[data-cat="${activeCategory}"]`);
      btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  const allCats = [{ id: 'all', name: 'All', icon: '🍽️' }, ...categories.filter(c => c.isActive)];

  return (
    <div className="sticky top-16 z-40 bg-ivory border-b border-gold/30 shadow-sm">
      <div ref={stripRef} className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {allCats.map(cat => {
          const isActive = activeCategory === cat.name || (activeCategory === 'all' && cat.id === 'all');
          return (
            <button
              key={cat.id}
              data-cat={cat.name}
              onClick={() => setActiveCategory(cat.id === 'all' ? 'all' : cat.name)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-maroon text-ivory shadow-md scale-105'
                  : 'bg-white border border-gold/40 text-bark hover:border-gold hover:bg-gold/10'}`}
            >
              <span className="text-base">{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}