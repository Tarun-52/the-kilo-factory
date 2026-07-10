"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UtensilsCrossed, Phone, MapPin, Truck, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAppStore as useStore } from "@/store";

export default function Footer() {
  const { goToHome } = useStore();
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.isAdmin === true;

  return (
    <footer className="mt-auto">
      <div className="filigree-divider" />

      <div className="bg-maroon-dark px-4 pt-8 pb-6">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="size-6 text-gold" />
              <span className="font-royal text-2xl font-bold text-gold-gradient">
                DAWAT EXPRESS
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ivory/70">
              Royal Awadhi Cuisine
            </p>
            <p className="text-sm leading-relaxed text-ivory/60">
              Bringing the authentic flavours of the Nawabi kitchen to your
              doorstep — from the heart of Lucknow.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-royal text-lg font-bold text-gold">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={goToHome}
                  className="text-left text-sm text-ivory/70 transition-colors hover:text-gold"
                >
                  Home
                </motion.button>
              </li>
              <li>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => router.push("/?view=order-history")}
                  className="text-left text-sm text-ivory/70 transition-colors hover:text-gold"
                >
                  My Orders
                </motion.button>
              </li>
              {isAdmin && (
                <li>
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => router.push("/admin")}
                    className="text-left text-sm text-ivory/70 transition-colors hover:text-gold flex items-center gap-1.5"
                  >
                    <Shield className="size-3.5" />
                    Admin Panel
                  </motion.button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="font-royal text-lg font-bold text-gold">Contact</h3>
            <ul className="flex flex-col gap-3 text-sm text-ivory/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold/70" />
                <span>
                  226001, Lucknow
                  <br />
                  Uttar Pradesh, India
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-gold/70" />
                <span>+91 98 XXXXX XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="size-4 shrink-0 text-gold/70" />
                <span>Delivery by Porter</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-ivory/10 pt-4">
          <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-ivory/50 sm:flex-row sm:text-left">
            <span>&copy; 2026 Dawat Express. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Truck className="size-3" />
                Delivery by Porter
              </span>
              <span className="text-ivory/30">|</span>
              <span>GST: 5%</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}