"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ChefHat, UtensilsCrossed, Heart, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-ivory pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 md:py-16">
        {/* Back Button (Visible on Mobile) */}
        <button 
          onClick={() => router.back()}
          className="md:hidden flex items-center gap-2 text-gray-600 mb-6 font-medium hover:text-maroon transition-colors"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-royal text-4xl md:text-5xl font-bold text-maroon mb-4">About The Kilo Factory</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bringing the authentic flavors of Mughlai and Awadhi cuisine directly to your doorstep. Crafted by master chefs, served with passion.
          </p>
        </div>

        {/* Decorative Banner */}
        <div className="bg-maroon-gradient rounded-2xl p-8 md:p-12 text-center mb-12 shadow-lg">
          <UtensilsCrossed className="size-16 text-gold mx-auto mb-4" />
          <h2 className="font-royal text-2xl md:text-3xl text-ivory mb-2">A Legacy of Taste</h2>
          <p className="text-ivory/80 max-w-xl mx-auto">
            At The Kilo Factory, we believe great food is an experience. From the rich, aromatic Hyderabadi Biryanis to the melt-in-your-mouth Awadhi Kebabs, every dish is prepared using traditional recipes and the finest ingredients.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="size-6 text-maroon" />
            </div>
            <h3 className="font-royal text-xl text-bark mb-2">Master Chefs</h3>
            <p className="text-sm text-gray-600">Our culinary team brings decades of experience in royal Indian kitchens to every plate.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="size-6 text-maroon" />
            </div>
            <h3 className="font-royal text-xl text-bark mb-2">Bulk Specialists</h3>
            <p className="text-sm text-gray-600">Whether it's a family gathering or a corporate event, we deliver quality by the kilo.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="size-6 text-maroon" />
            </div>
            <h3 className="font-royal text-xl text-bark mb-2">Made with Love</h3>
            <p className="text-sm text-gray-600">We use fresh, premium ingredients and traditional slow-cooking methods for authentic taste.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/')}
            className="bg-gold-gradient text-bark font-bold px-8 py-3 rounded-full shadow-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            Explore Our Menu
          </button>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}