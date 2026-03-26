'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Fuel, Gauge, Calendar, ArrowRight } from 'lucide-react';

interface CarCardProps {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuel: string;
  transmission: string;
  images: string[];
}

export default function CarCard({
  id,
  brand,
  model,
  year,
  mileage,
  price,
  fuel,
  transmission,
  images,
}: CarCardProps) {
  const imageUrl = images[0] || '/images/placeholder-car.jpg';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/cars/${id}`} className="group block">
        <div className="overflow-hidden rounded-2xl border border-[#0a4d0e]/10 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${brand} ${model}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Price badge */}
            <div className="absolute bottom-3 left-3 rounded-lg bg-[#0a4d0e] px-3 py-1.5 text-sm font-bold text-white shadow-lg">
              {formatPrice(price)}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <div className="mb-3">
              <p className="text-xs font-medium text-[#D4A843]">{brand}</p>
              <h3 className="text-lg font-bold leading-tight text-[#0a4d0e] group-hover:text-[#0d6611] transition-colors">
                {model}
              </h3>
            </div>

            {/* Specs */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#0a4d0e]/50">
                <Calendar className="h-3.5 w-3.5" />
                <span>{year}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#0a4d0e]/50">
                <Gauge className="h-3.5 w-3.5" />
                <span>{formatMileage(mileage)} km</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#0a4d0e]/50">
                <Fuel className="h-3.5 w-3.5" />
                <span>{fuel}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between border-t border-[#0a4d0e]/10 pt-3">
              <span className="text-xs text-[#0a4d0e]/40">
                {transmission}
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-[#0a4d0e] group-hover:gap-2 transition-all">
                View Details
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
