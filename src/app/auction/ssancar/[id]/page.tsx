'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Car,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  Heart,
  Loader2,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Palette,
  DollarSign,
  Gavel,
  Hash,
} from 'lucide-react';

interface SsancarCar {
  id: number;
  stockNo: string;
  prdId: string;
  crId: string;
  name: string;
  plateNo: string;
  manufacturer: string;
  model: string;
  class: string;
  detailClass: string | null;
  year: string;
  regDate: string;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string;
  price: number;
  priceUSD: number;
  location: string;
  dealerName: string;
  description: string;
  img: string;
  images: string[];
  thumbs: string[];
  originalImages?: string[];
  vin: string | null;
  source: string;
  type: string;
  detailUrl: string;
}

interface SsancarData {
  crawledAt: string;
  totalCount: number;
  source: string;
  type: string;
  cars: SsancarCar[];
}

export default function SsancarCarDetailPage() {
  const params = useParams();
  const carId = params?.id ? parseInt(params.id as string) : 0;

  const [car, setCar] = useState<SsancarCar | null>(null);
  const [relatedCars, setRelatedCars] = useState<SsancarCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!carId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchCarData() {
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${baseUrl}/Jungcar/data/ssancar-auction.json`);
        if (res.ok) {
          const data: SsancarData = await res.json();
          const foundCar = data.cars.find(c => c.id === carId);

          if (foundCar) {
            setCar(foundCar);
            // 같은 제조사 차량 추천
            const related = data.cars
              .filter(c => c.id !== carId)
              .slice(0, 6);
            setRelatedCars(related);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to fetch car data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCarData();
  }, [carId]);

  const formatMileage = (km: number) => {
    if (!km) return '0km';
    return `${km.toLocaleString()}km`;
  };

  const getImageUrl = (path: string) => {
    if (!path) return '/Jungcar/images/cars/default.jpg';
    if (path.startsWith('http')) return path;
    return `/Jungcar${path}`;
  };

  const nextImage = () => {
    if (car?.images && car.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
    }
  };

  const prevImage = () => {
    if (car?.images && car.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0a4d0e]" />
          <p className="text-gray-600">Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  if (notFound || !car) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <Car className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-bold text-gray-700">Vehicle Not Found</h2>
        <p className="mt-2 text-gray-500">The requested vehicle information does not exist.</p>
        <Link
          href="/auction/ssancar"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0a4d0e] px-6 py-3 text-white hover:bg-[#0d6611]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auction
        </Link>
      </div>
    );
  }

  const currentImage = car.images && car.images.length > 0
    ? car.images[currentImageIndex]
    : car.img;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/auction/ssancar"
              className="flex items-center gap-2 text-gray-600 hover:text-[#0a4d0e]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to SSANCAR Auction</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`rounded-full p-2 transition-colors ${
                  isFavorite ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg"
            >
              {/* Main Image */}
              <div className="relative aspect-[4/3] bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(currentImage)}
                  alt={car.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/Jungcar/images/cars/default.jpg';
                  }}
                />

                {/* Image Navigation Arrows */}
                {car.images && car.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white">
                      {currentImageIndex + 1} / {car.images.length}
                    </div>
                  </>
                )}

                {/* Auction Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-[#D4A843] px-3 py-1.5 text-sm font-bold text-white">
                    <Gavel className="h-4 w-4" />
                    Auction
                  </span>
                  <span className="rounded-full bg-[#0a4d0e] px-3 py-1.5 text-sm font-medium text-white">
                    #{car.stockNo}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {car.images && car.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto bg-gray-900 p-3">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                        currentImageIndex === idx
                          ? 'ring-2 ring-[#D4A843] ring-offset-2 ring-offset-gray-900'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(car.thumbs?.[idx] || img)}
                        alt={`${car.name} - ${idx + 1}`}
                        className="h-16 w-24 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/Jungcar/images/cars/default.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Vehicle Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 rounded-2xl bg-white p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900">Vehicle Description</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">{car.description}</p>
            </motion.div>

            {/* Detailed Specs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 rounded-2xl bg-white p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900">Vehicle Specifications</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <Calendar className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">Year</p>
                  <p className="font-bold text-gray-900">{car.year}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Gauge className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">Mileage</p>
                  <p className="font-bold text-gray-900">{formatMileage(car.mileage)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Fuel className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">Fuel</p>
                  <p className="font-bold text-gray-900">{car.fuel}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Settings className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">Transmission</p>
                  <p className="font-bold text-gray-900">{car.transmission}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Palette className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">Color</p>
                  <p className="font-bold text-gray-900">{car.color || '-'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Hash className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">Stock No.</p>
                  <p className="font-bold text-gray-900">{car.stockNo}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <MapPin className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">Location</p>
                  <p className="font-bold text-gray-900">{car.location}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Building2 className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">Dealer</p>
                  <p className="font-bold text-gray-900 text-sm">{car.dealerName}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Price & Contact */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-20 space-y-6"
            >
              {/* Price Card */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-3 py-1 text-sm font-medium text-[#0a4d0e]">
                  {car.manufacturer}
                </span>
                <h1 className="mt-3 text-xl font-bold text-gray-900 leading-tight">
                  {car.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{car.model}</p>

                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="h-4 w-4" />
                    <span>Starting Bid Price</span>
                  </div>
                  <p className="text-3xl font-bold text-[#D4A843]">
                    ${car.priceUSD.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Approx. {car.price.toLocaleString()}만원
                  </p>
                </div>

                {/* Key Specs */}
                <div className="mt-6 space-y-3 border-t pt-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Year</span>
                    <span className="font-medium text-gray-900">{car.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mileage</span>
                    <span className="font-medium text-gray-900">{formatMileage(car.mileage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fuel</span>
                    <span className="font-medium text-gray-900">{car.fuel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transmission</span>
                    <span className="font-medium text-gray-900">{car.transmission}</span>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900">Interested in this vehicle?</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Contact us for bidding assistance and more information.
                </p>
                <div className="mt-4 space-y-3">
                  <a
                    href="https://wa.me/821012345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-semibold text-white transition-colors hover:bg-[#20bd5a]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Inquiry
                  </a>
                  <a
                    href="tel:+82-10-1234-5678"
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                  >
                    <Phone className="h-5 w-5 text-[#0a4d0e]" />
                    <span className="text-sm font-medium">+82-10-1234-5678</span>
                  </a>
                  <a
                    href="mailto:info@jungcar.com"
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                  >
                    <Mail className="h-5 w-5 text-[#0a4d0e]" />
                    <span className="text-sm font-medium">info@jungcar.com</span>
                  </a>
                </div>
              </div>

              {/* Auction Info */}
              <div className="rounded-2xl bg-[#0a4d0e] p-6 text-white shadow-lg">
                <div className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-[#D4A843]" />
                  <h3 className="font-bold">Auction Information</h3>
                </div>
                <p className="mt-3 text-sm text-white/80">
                  This vehicle is available at SSANCAR Auction. We can assist you with:
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A843]" />
                    Bidding on your behalf
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A843]" />
                    Vehicle inspection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A843]" />
                    Export documentation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A843]" />
                    International shipping
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Vehicles */}
        {relatedCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl font-bold text-gray-900">
              More Auction Vehicles
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {relatedCars.map((relCar) => (
                <Link key={relCar.id} href={`/auction/ssancar/${relCar.id}`}>
                  <div className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
                    <div className="aspect-[4/3] bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(relCar.img)}
                        alt={relCar.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/Jungcar/images/cars/default.jpg';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-gray-900 group-hover:text-[#0a4d0e]">
                        {relCar.name}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#D4A843]">
                        ${relCar.priceUSD.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
