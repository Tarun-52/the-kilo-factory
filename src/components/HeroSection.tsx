"use client";
import { useState, useEffect } from "react";

// Your 6 hero banner images
const heroImages = [
  "/hero-banner.png",
  "/hero-banner-2.png",
  "/hero-banner-3.png",
  "/hero-banner-4.png",
  "/hero-banner-5.png",
  "/hero-banner-6.png",
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Auto-slide every 3 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      {/* Slides */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={image}
            alt={`Hero slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Smooth Gradient Overlay at the bottom so Offers section blends nicely */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-ivory to-transparent z-20 pointer-events-none" />

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide 
                ? "w-8 bg-gold shadow-lg" 
                : "w-2.5 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}