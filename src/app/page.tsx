'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Globe,
  Truck,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Gavel,
  Car,
  Gauge,
  Fuel,
} from 'lucide-react';

interface CarData {
  id: number;
  name: string;
  manufacturer: string;
  model: string;
  year: string;
  mileage: number;
  fuel: string;
  price: number;
  priceUSD?: number;
  crId: string;
  img: string;
  source?: string;
}

const stats = [
  { value: '5,000+', label: 'Cars Exported' },
  { value: '50+', label: 'Countries' },
  { value: '10+', label: 'Years Experience' },
  { value: '98%', label: 'Satisfaction' },
];

const auctionImages = [
  { src: '/images/auction/1.jpg', alt: 'Korea Auto Auction', label: 'Auto Auction' },
  { src: '/images/auction/2.jpg', alt: 'Auction Floor', label: 'Auction Floor' },
  { src: '/images/auction/3.jpg', alt: 'Vehicle Inspection', label: 'Vehicle Inspection' },
  { src: '/images/auction/4.jpg', alt: 'Auction Center', label: 'Auction Center' },
  { src: '/images/auction/5.jpg', alt: 'Vehicle Yard', label: 'Vehicle Yard' },
  { src: '/images/auction/6.jpg', alt: 'Premium Vehicles', label: 'Premium Vehicles' },
];

const auctionSchedule = [
  {
    name: 'KOREA Auction',
    slug: 'vehicle',
    location: 'Korea',
    days: 'Every Monday & Friday',
    time: '10:00 AM KST',
    vehicles: '1,830+',
    color: '#0a4d0e',
  },
];

const teamMembers = [
  { name: 'Marina', role: 'Manager', image: '/images/staff/KakaoTalk_20260119_134736058.jpg' },
  { name: 'Sofia Oh', role: 'Manager', image: '/images/staff/KakaoTalk_20260119_134736058_01.jpg' },
  { name: 'Logan Lee', role: 'Manager', image: '/images/staff/manager-new.jpeg' },
  { name: 'Daniel Kim', role: 'Manager', image: '/images/staff/KakaoTalk_20260119_134736058_03.jpg' },
  { name: 'Elena Jung', role: 'Manager', image: '/images/staff/KakaoTalk_20260119_134736058_04.jpg' },
  { name: 'Led Kim', role: 'Manager', image: '/images/staff/KakaoTalk_20260119_134736058_05.jpg' },
  { name: 'Marat', role: 'Manager', image: '/images/staff/KakaoTalk_20260119_134736058_06.jpg' },
];

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<CarData[]>([]);

  useEffect(() => {
    // 차량 재고 데이터 로드
    fetch('/data/ssancar-stock.json')
      .then(res => res.json())
      .then(data => {
        const cars = data.cars
          .filter((car: CarData) => car.name && car.manufacturer && car.priceUSD)
          .slice(0, 8)
          .map((car: CarData & { priceUSD?: number }) => ({
            ...car,
            model: car.name,
            price: car.priceUSD || car.price
          }));
        setFeaturedCars(cars);
      })
      .catch(err => console.error('Failed to load cars:', err));
  }, []);

  const formatPrice = (car: CarData) => {
    const price = car.priceUSD || car.price;
    if (!price) return '-';
    return `$${price.toLocaleString()}`;
  };

  const getImageUrl = (car: CarData) => {
    // 차량 이미지 (http:// 또는 https://로 시작)
    if (car.img && (car.img.startsWith('http://') || car.img.startsWith('https://'))) {
      return car.img;
    }
    if (car.img && !car.img.includes('default') && !car.img.includes('placeholder')) {
      return `${car.img}`;
    }
    if (car.crId) {
      const encodedPath = encodeURIComponent(`https://static.glovis.net/picture/dlr/prd/carImg/${car.crId}/normal/thumb/`);
      return `https://img.autobell.co.kr/?src=${encodedPath}&type=w&w=800&quality=80&ttype=jpg`;
    }
    return '/images/cars/default.jpg';
  };

  return (
    <div className="overflow-hidden">
      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative min-h-screen flex items-center">
        {/* Full-width background image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-banner.png"
            alt="Premium Korean Vehicles"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a4d0e]/90 via-[#0a4d0e]/70 to-[#0a4d0e]/40" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 px-4 py-1.5 text-sm font-medium text-[#D4A843] backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4A843] animate-pulse" />
                Premium Korean Auto Export
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl"
            >
              Your Gateway to
              <br />
              <span className="text-[#D4A843]">Korean Cars</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg"
            >
              Export premium Hyundai, Kia, BMW, Mercedes-Benz, Audi and more
              from Korea&apos;s largest auto auctions. Quality inspected,
              competitively priced, delivered worldwide.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/cars"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#D4A843] px-6 py-3.5 text-sm font-bold text-[#0a4d0e] transition-all hover:bg-[#e0b84f] hover:shadow-xl hover:shadow-[#D4A843]/25 sm:px-8 sm:text-base"
              >
                Browse Inventory
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
              </Link>
              <Link
                href="/auction"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10 sm:px-8 sm:text-base"
              >
                <Gavel className="h-4 w-4 sm:h-5 sm:w-5" />
                Auction Service
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <p className="text-2xl font-black text-white sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50 sm:text-sm">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ===== FEATURED CARS SECTION ===== */}
      {featuredCars.length > 0 && (
        <section className="py-20 sm:py-28 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
                Available Now
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Featured <span className="text-[#0a4d0e]">Vehicles</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Browse our latest selection of quality Korean vehicles ready for export
              </p>
            </motion.div>

            {/* Cars grid */}
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/cars/${car.id}`}>
                    <div className="group overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(car)}
                          alt={car.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/cars/default.jpg';
                          }}
                        />
                        {/* Manufacturer badge */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0a4d0e] backdrop-blur-sm">
                            {car.manufacturer}
                          </span>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#0a4d0e]">
                          {car.model}
                        </h3>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Car className="h-3.5 w-3.5" />
                            {car.year || '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge className="h-3.5 w-3.5" />
                            {car.mileage ? car.mileage.toLocaleString() : '0'}km
                          </span>
                          <span className="flex items-center gap-1">
                            <Fuel className="h-3.5 w-3.5" />
                            {car.fuel || '-'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-lg font-bold text-[#D4A843]">
                            {formatPrice(car)}
                          </p>
                          <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0a4d0e]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View all button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 text-center"
            >
              <Link
                href="/cars"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#0a4d0e] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg hover:shadow-[#0a4d0e]/20"
              >
                View All 10,000+ Vehicles
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== SECTION 2: AUCTION GALLERIES ===== */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Our Auction Partners
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Korea&apos;s Largest{' '}
              <span className="text-[#0a4d0e]">Auto Auctions</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We source vehicles directly from Korea&apos;s most reputable auto
              auction houses, ensuring competitive prices and verified quality
            </p>
          </motion.div>

          {/* Gallery grid */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {auctionImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a4d0e]/70 via-[#0a4d0e]/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-full p-5 transition-transform duration-500 group-hover:translate-y-0">
                  <p className="text-sm font-semibold text-white">{img.label}</p>
                </div>
                {/* Corner accent */}
                <div className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a4d0e]/80 backdrop-blur-sm">
                  <Gavel className="h-4 w-4 text-[#D4A843]" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link
              href="/auction"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#0a4d0e] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg hover:shadow-[#0a4d0e]/20"
            >
              Learn More About Auctions
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 3: AUCTION SCHEDULE ===== */}
      <section className="py-20 sm:py-28 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Weekly Schedule
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0a4d0e] sm:text-4xl lg:text-5xl">
              Auction <span className="text-[#D4A843]">Calendar</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              Stay updated with Korea&apos;s major auto auction schedules. We attend every session
              to find the best vehicles for our clients.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {auctionSchedule.map((auction, index) => (
              <Link key={index} href={`/auction/${auction.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-[#0a4d0e]/10 bg-white p-6 shadow-sm transition-all hover:border-[#0a4d0e]/30 hover:shadow-lg cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a4d0e]/10">
                      <Gavel className="h-6 w-6 text-[#0a4d0e]" />
                    </div>
                    <span className="rounded-full bg-[#0a4d0e]/10 px-3 py-1 text-xs font-medium text-[#0a4d0e]/70">
                      {auction.vehicles} cars
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="mt-5 text-lg font-bold text-[#0a4d0e]">{auction.name}</h3>

                  {/* Details */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-[#0a4d0e]/60">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-[#0a4d0e]" />
                      {auction.location}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#0a4d0e]/60">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-[#0a4d0e]" />
                      {auction.days}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#0a4d0e]/60">
                      <Clock className="h-4 w-4 flex-shrink-0 text-[#0a4d0e]" />
                      {auction.time}
                    </div>
                  </div>

                  {/* Hover accent */}
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0a4d0e] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Bottom note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center text-sm text-[#0a4d0e]/40"
          >
            Schedules may vary on national holidays. Contact us for the latest updates.
          </motion.p>
        </div>
      </section>

      {/* ===== SECTION 4: TEAM ===== */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Our People
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Meet the <span className="text-[#0a4d0e]">JungCar Team</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our experienced professionals are dedicated to delivering the best
              Korean vehicles to customers worldwide
            </p>
          </motion.div>

          {/* First row - 3 members */}
          <div className="mt-14 grid gap-6 grid-cols-1 sm:grid-cols-3">
            {teamMembers.slice(0, 3).map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all hover:shadow-xl hover:shadow-[#0a4d0e]/5 hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#0a4d0e]">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[#0a4d0e]/60">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second row - 4 members */}
          <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.slice(3, 7).map((member, index) => (
              <motion.div
                key={index + 3}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index + 3) * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all hover:shadow-xl hover:shadow-[#0a4d0e]/5 hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#0a4d0e]">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[#0a4d0e]/60">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#0a4d0e]/10 bg-white p-8 shadow-lg sm:p-12 lg:p-20">
            {/* Decorative elements */}
            <div className="absolute right-0 top-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-[#0a4d0e]/5" />
            <div className="absolute left-0 bottom-0 -mb-20 -ml-20 h-60 w-60 rounded-full bg-[#0a4d0e]/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#0a4d0e]/5 blur-3xl" />

            <div className="relative text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-[#0a4d0e] sm:text-4xl lg:text-5xl">
                  Ready to Find Your{' '}
                  <span className="text-[#D4A843]">Perfect Car?</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-[#0a4d0e]/60 sm:text-lg">
                  Browse our inventory or let our auction experts find the ideal
                  vehicle for you. We ship to over 50 countries worldwide.
                </p>

                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link
                    href="/cars"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#0a4d0e] px-8 py-3.5 font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg hover:shadow-[#0a4d0e]/25"
                  >
                    Browse Inventory
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0a4d0e]/30 px-8 py-3.5 font-semibold text-[#0a4d0e] transition-all hover:border-[#0a4d0e]/60 hover:bg-[#0a4d0e]/5"
                  >
                    Contact Us
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-muted-foreground">
            {[
              { icon: Shield, text: 'Quality Guaranteed' },
              { icon: CheckCircle, text: 'Verified Vehicles' },
              { icon: Globe, text: 'Global Shipping' },
              { icon: Truck, text: 'Fast Delivery' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-[#0a4d0e]" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
