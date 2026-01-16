'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        <div className="card-hover overflow-hidden rounded-2xl border border-border bg-card">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={`${brand} ${model}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Price badge */}
            <div className="absolute bottom-3 left-3 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white shadow-lg">
              {formatPrice(price)}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">{brand}</p>
              <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                {model}
              </h3>
            </div>

            {/* Specs */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{year}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                <span>{formatMileage(mileage)} km</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fuel className="h-3.5 w-3.5" />
                <span>{fuel}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">
                {transmission}
              </span>
              <span className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
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
