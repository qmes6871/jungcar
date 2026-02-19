'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Car, ArrowRight } from 'lucide-react';

export default function CarsPage() {
  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative flex items-center justify-center py-24 sm:py-32">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Jungcar/images/hero-banner.jpg"
            alt="Browse Cars"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a4d0e]/90 via-[#0a4d0e]/75 to-[#0a4d0e]/50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 px-4 py-1.5 text-sm font-medium text-[#D4A843] backdrop-blur-sm">
              <Car className="h-4 w-4" />
              Vehicle Inventory
            </span>
            <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Browse Our <span className="text-[#D4A843]">Vehicles</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
              Premium Korean used cars available for export
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0a4d0e]/10">
              <Car className="h-10 w-10 text-[#0a4d0e]/40" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-[#0a4d0e]">
              Browse Auction Vehicles
            </h2>
            <p className="mt-3 text-[#0a4d0e]/60 max-w-md mx-auto">
              View available vehicles at our partner auction houses
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auction/hyundai-glovis"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0a4d0e] px-6 py-3 font-semibold text-white hover:bg-[#0d6611] transition-colors"
              >
                Hyundai Glovis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auction/autohub"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0a4d0e] px-6 py-3 font-semibold text-[#0a4d0e] hover:bg-[#0a4d0e]/5 transition-colors"
              >
                AutoHub
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
