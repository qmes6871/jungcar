'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Palette,
  Car,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  Heart,
} from 'lucide-react';
import CarCard from '@/components/CarCard';

interface CarData {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  engine: string;
  drivetrain: string;
  doors: number;
  seats: number;
  vin: string;
  description: string;
  images: string[];
  status: string;
}

interface RelatedCar {
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

interface CarDetailClientProps {
  car: CarData;
  relatedCars: RelatedCar[];
}

export default function CarDetailClient({ car, relatedCars }: CarDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `I'm interested in the ${car.year} ${car.brand} ${car.model}. Please provide more information.`,
  });

  const specs = [
    { icon: Calendar, label: 'Year', value: car.year.toString() },
    { icon: Gauge, label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
    { icon: Fuel, label: 'Fuel', value: car.fuel },
    { icon: Settings, label: 'Transmission', value: car.transmission },
    { icon: Car, label: 'Body Type', value: car.bodyType },
    { icon: Palette, label: 'Color', value: car.color },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your inquiry! We will contact you soon.');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/cars"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={car.images[currentImageIndex]}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                {currentImageIndex + 1} / {car.images.length}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg ${
                    index === currentImageIndex
                      ? 'ring-2 ring-[var(--primary)]'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${car.brand} ${car.model} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">{car.brand}</p>
                <h1 className="text-2xl sm:text-3xl font-bold truncate">{car.model}</h1>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="rounded-lg border border-border p-1.5 sm:p-2 text-muted-foreground hover:bg-muted">
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button className="rounded-lg border border-border p-1.5 sm:p-2 text-muted-foreground hover:bg-muted">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div className="mt-3 sm:mt-4">
              <p className="text-3xl sm:text-4xl font-bold text-primary">
                {formatPrice(car.price)}
              </p>
              <p className="text-sm text-muted-foreground">
                Price excludes shipping and import duties
              </p>
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-lg sm:rounded-xl bg-muted p-3 sm:p-4">
                  <spec.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">{spec.label}</p>
                  <p className="text-sm sm:text-base font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
              <a
                href="tel:+821012345678"
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-primary px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-white transition-all hover:scale-105"
              >
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Call
              </a>
              <a
                href="https://wa.me/821012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-green-500 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-white transition-all hover:scale-105"
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                WhatsApp
              </a>
              <a
                href="mailto:info@jungcar.com"
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-border px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium transition-all hover:bg-muted"
              >
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Email
              </a>
            </div>

            <div className="mt-6 sm:mt-8">
              <h2 className="text-base sm:text-lg font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm sm:text-base text-muted-foreground">
                {car.description}
              </p>
            </div>

            <div className="mt-6 sm:mt-8">
              <h2 className="text-base sm:text-lg font-semibold">Specifications</h2>
              <div className="mt-3 sm:mt-4 divide-y divide-[var(--border)] rounded-lg sm:rounded-xl border border-border text-sm">
                <div className="flex justify-between p-2.5 sm:p-3">
                  <span className="text-muted-foreground">Engine</span>
                  <span className="font-medium text-right">{car.engine}</span>
                </div>
                <div className="flex justify-between p-2.5 sm:p-3">
                  <span className="text-muted-foreground">Drivetrain</span>
                  <span className="font-medium">{car.drivetrain}</span>
                </div>
                <div className="flex justify-between p-2.5 sm:p-3">
                  <span className="text-muted-foreground">Doors</span>
                  <span className="font-medium">{car.doors}</span>
                </div>
                <div className="flex justify-between p-2.5 sm:p-3">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-medium">{car.seats}</span>
                </div>
                <div className="flex justify-between p-2.5 sm:p-3">
                  <span className="text-muted-foreground">VIN</span>
                  <span className="font-medium font-mono text-xs sm:text-sm">{car.vin}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 sm:mt-16">
          <div className="rounded-xl sm:rounded-2xl bg-card border border-border p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold">Interested in this vehicle?</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg sm:rounded-xl bg-muted px-3 py-2.5 sm:px-4 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg sm:rounded-xl bg-muted px-3 py-2.5 sm:px-4 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg sm:rounded-xl bg-muted px-3 py-2.5 sm:px-4 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-lg sm:rounded-xl bg-muted px-3 py-2.5 sm:px-4 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-lg sm:rounded-xl bg-primary py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-10 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold">Similar Vehicles</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            You might also be interested in these vehicles
          </p>
          <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCars.map((relatedCar) => (
              <CarCard key={relatedCar.id} {...relatedCar} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
