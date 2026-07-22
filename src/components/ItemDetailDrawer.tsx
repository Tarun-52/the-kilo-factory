'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Flame, Clock, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { useAppStore as useStore } from '@/store';
import { toast } from 'sonner';

interface FavoriteItem {
  id: string;
  name: string;
  vegFlag: boolean;
  categoryId: string;
  categoryName: string;
  addedAt: string;
}

export default function ItemDetailDrawer() {
  const { selectedItem, itemDetailOpen, closeItemDetail, addToCart } = useStore();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const item = selectedItem;

  // Check favorite status on mount / item change
  useEffect(() => {
    if (!item?.id) return;
    try {
      const saved = localStorage.getItem('dawat-favorites');
      if (saved) {
        const favs: FavoriteItem[] = JSON.parse(saved);
        setIsFavorite(favs.some((f) => f.id === item.id));
      }
    } catch {}
  }, [item?.id]);

  // Reset state when item changes or drawer closes
  useEffect(() => {
    if (!item) {
      setQty(1);
      setSelectedVariant(null);
    }
  }, [item]);

  if (!item) return null;

  const variants = item.variants?.filter((v: any) => v.isActive && v.stockStatus === 'in_stock') || [];
  const active = selectedVariant || variants[0];
  if (!active) return null;

  const subtotal = active.price * qty;

  const handleAdd = () => {
    addToCart(active.id, item.id, item.name, active.unit, active.price, item.vegFlag);
    toast.success(`${item.name} (${active.unit}) added to cart!`);
    closeItemDetail();
    setQty(1);
    setSelectedVariant(null);
  };

  const handleToggleFavorite = () => {
    try {
      const saved = localStorage.getItem('dawat-favorites');
      const favs: FavoriteItem[] = saved ? JSON.parse(saved) : [];

      if (isFavorite) {
        const updated = favs.filter((f) => f.id !== item.id);
        localStorage.setItem('dawat-favorites', JSON.stringify(updated));
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        const newFav: FavoriteItem = {
          id: item.id,
          name: item.name,
          vegFlag: item.vegFlag,
          categoryId: item.categoryId,
          categoryName: item.category?.name ?? '',
          addedAt: new Date().toISOString(),
        };
        favs.unshift(newFav);
        localStorage.setItem('dawat-favorites', JSON.stringify(favs));
        setIsFavorite(true);
        toast.success('Added to favorites!');
      }
    } catch {
      toast.error('Could not update favorites');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeItemDetail();
      setQty(1);
      setSelectedVariant(null);
    }
  };

  return (
    <Sheet open={itemDetailOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-none px-0 pb-0">
        <SheetTitle className="sr-only">{item.name}</SheetTitle>
        <div className="h-full overflow-y-auto scrollbar-thin">
          {/* Image placeholder */}
                    {/* Image */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center overflow-hidden">
            {item.photoUrl ? (
              <img 
                src={item.photoUrl} 
                alt={item.name}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-7xl opacity-30">{item.category?.icon || '🍽️'}</span>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
            {/* Close button */}
            <button
              onClick={closeItemDetail}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
            >
              ✕
            </button>
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={18}
                className={isFavorite ? 'text-red-400 fill-red-400' : 'text-white'}
              />
            </button>
          </div>

          <div className="px-5 pb-6 pt-4">
            {/* Title row */}
            <div className="flex items-start gap-2">
              <span className={`mt-1 inline-block w-4 h-4 rounded-sm border-2 flex-shrink-0 ${item.vegFlag ? 'border-veg-green bg-veg-green' : 'border-nonveg-red bg-nonveg-red'}`} />
              <div>
                <h2 className="font-royal text-2xl font-bold text-bark">{item.name}</h2>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>

            {/* Spice + Badges */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {item.spiceLevel > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  {Array.from({ length: item.spiceLevel }).map((_, i) => (
                    <Flame key={i} size={14} className="text-saffron" />
                  ))}
                  <span className="text-muted-foreground ml-1">Spicy</span>
                </div>
              )}
              {item.isBestseller && (
                <span className="bg-gold/20 text-gold-dark text-xs font-bold px-2 py-0.5 rounded-full">★ Bestseller</span>
              )}
              {item.isBulkOnly && (
                <span className="bg-maroon/10 text-maroon text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock size={10} /> {item.leadTimeHours}h advance order
                </span>
              )}
            </div>

            <Separator className="my-4 bg-gold/20" />

            {/* Variant selector */}
            {variants.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-bark mb-2">Select Size</h3>
                <div className="flex gap-2 flex-wrap">
                  {variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setQty(1); }}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
                        ${active.id === v.id
                          ? 'border-maroon bg-maroon/5 text-maroon shadow-sm'
                          : 'border-gold/30 text-bark hover:border-gold/60'}`}
                    >
                      <span className="block font-bold">₹{v.price}</span>
                      <span className="text-xs text-muted-foreground">{v.unit}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4 bg-gold/20" />

            {/* Quantity stepper */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-bark">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 rounded-full border-2 border-gold/40 flex items-center justify-center hover:bg-gold/10 transition cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-lg">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-9 h-9 rounded-full border-2 border-gold/40 flex items-center justify-center hover:bg-gold/10 transition cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <Separator className="my-4 bg-gold/20" />

            {/* Add to Cart */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Subtotal</p>
                <p className="text-2xl font-bold text-maroon">₹{subtotal.toLocaleString('en-IN')}</p>
                {active.unit !== 'piece' && active.unit !== 'whole' && (
                  <p className="text-xs text-muted-foreground">₹{active.price} × {qty}</p>
                )}
              </div>
              <Button
                onClick={handleAdd}
                className="bg-gold-gradient text-bark font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}