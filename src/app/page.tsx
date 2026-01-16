'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Globe, Truck, CheckCircle, Car, Play, ChevronDown, Star, Zap, MapPin } from 'lucide-react';
import CarCard from '@/components/CarCard';

// Dummy data for featured cars
const featuredCars = [
  {
    id: 1,
    brand: 'Hyundai',
    model: 'Sonata DN8',
    year: 2023,
    mileage: 15000,
    price: 28500,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    images: ['https://images.unsplash.com/photo-1590656371803-0ae2ae004989?w=800'],
  },
  {
    id: 2,
    brand: 'Kia',
    model: 'K5 DL3',
    year: 2022,
    mileage: 28000,
    price: 24500,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    images: ['https://images.unsplash.com/photo-1688893287874-ac7fbd686c24?w=800'],
  },
  {
    id: 3,
    brand: 'Genesis',
    model: 'G80 RG3',
    year: 2023,
    mileage: 12000,
    price: 52000,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    images: ['https://images.unsplash.com/photo-1714348938045-0c74379cd4d9?w=800'],
  },
  {
    id: 4,
    brand: 'Hyundai',
    model: 'Tucson NX4',
    year: 2022,
    mileage: 32000,
    price: 31000,
    fuel: 'Diesel',
    transmission: 'Automatic',
    images: ['https://images.unsplash.com/photo-1616627091698-50d033ce0980?w=800'],
  },
];

const brands = [
  { name: 'Hyundai', logo: '/images/brands/hyundai.svg' },
  { name: 'Kia', logo: '/images/brands/kia.svg' },
  { name: 'Genesis', logo: '/images/brands/genesis.svg' },
  { name: 'Chevrolet', logo: '/images/brands/chevrolet.svg' },
  { name: 'Renault', logo: '/images/brands/renault.svg' },
  { name: 'SsangYong', logo: '/images/brands/ssangyong.svg' },
];

const features = [
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'All vehicles undergo thorough inspection before export',
  },
  {
    icon: Globe,
    title: 'Worldwide Shipping',
    description: 'We export to over 50 countries with reliable logistics',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Efficient shipping process with real-time tracking',
  },
];

const stats = [
  { value: '5,000+', label: 'Cars Exported' },
  { value: '50+', label: 'Countries' },
  { value: '10+', label: 'Years Experience' },
  { value: '98%', label: 'Customer Satisfaction' },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section - Clean & Bold */}
      <section className="relative min-h-screen bg-white overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Accent Shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-50 to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-orange-500/10 to-yellow-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-screen items-center gap-8 py-20 lg:grid-cols-2 lg:gap-12">

            {/* Left Content */}
            <div className="relative z-10 pt-16 lg:pt-0 order-2 lg:order-1">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="h-px w-12 bg-gradient-to-r from-blue-600 to-cyan-500" />
                <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Premium Auto Export
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:mt-6 sm:text-5xl lg:text-7xl"
              >
                Korean Cars,
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Global Reach
                  </span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="absolute -bottom-1 left-0 h-2 w-full origin-left bg-gradient-to-r from-blue-200 to-cyan-200 -skew-x-6 sm:-bottom-2 sm:h-4"
                  />
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 max-w-md text-base text-gray-600 leading-relaxed sm:mt-8 sm:text-lg lg:text-xl"
              >
                Export premium Hyundai, Kia & Genesis vehicles to 50+ countries.
                Quality inspected, competitively priced, delivered fast.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4"
              >
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/20 sm:gap-3 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                >
                  View All Cars
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="/how-to-buy"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600 sm:px-6 sm:py-4 sm:text-base"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10">
                    <Play className="h-3 w-3 text-blue-600 ml-0.5 sm:h-4 sm:w-4" />
                  </div>
                  How It Works
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 sm:mt-16 sm:grid-cols-4 sm:pt-8"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  >
                    <p className="text-xl font-black text-gray-900 sm:text-2xl lg:text-3xl">{stat.value}</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500 uppercase tracking-wider sm:text-xs">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Content - Car Showcase */}
            <div className="relative order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                {/* Main Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-2xl shadow-gray-300/50">
                  <Image
                    src="https://images.unsplash.com/photo-1714348938045-0c74379cd4d9?w=1200"
                    alt="Genesis GV80"
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Car Info Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="absolute bottom-6 left-6 right-6"
                  >
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80">Featured Vehicle</p>
                        <p className="text-2xl font-bold text-white">Genesis GV80</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white/80">Starting from</p>
                        <p className="text-2xl font-bold text-white">$65,000</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating Badge - Top Right (hidden on mobile) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="absolute -top-4 -right-4 hidden sm:block sm:-right-6"
                >
                  <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Quality Verified</p>
                      <p className="text-xs text-gray-500">150-point inspection</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Badge - Bottom Left (hidden on mobile) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="absolute -bottom-4 -left-4 hidden sm:block sm:-left-6"
                >
                  <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Free Shipping</p>
                      <p className="text-xs text-gray-500">To 50+ countries</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Small Car Thumbnails */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="mt-4 flex gap-2 sm:mt-6 sm:gap-3"
              >
                {[
                  { img: 'https://images.unsplash.com/photo-1590656371803-0ae2ae004989?w=300', name: 'Sonata' },
                  { img: 'https://images.unsplash.com/photo-1688893287874-ac7fbd686c24?w=300', name: 'K5' },
                  { img: 'https://images.unsplash.com/photo-1714348938323-534552cbfad9?w=300', name: 'G80' },
                ].map((car, index) => (
                  <div
                    key={index}
                    className="group relative h-16 w-20 cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-transform hover:scale-105 sm:h-20 sm:w-24 sm:rounded-xl"
                  >
                    <Image
                      src={car.img}
                      alt={car.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  </div>
                ))}
                <Link
                  href="/cars"
                  className="flex h-16 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500 sm:h-20 sm:w-24 sm:rounded-xl"
                >
                  <span className="text-xl sm:text-2xl">+</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Brand Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white/80 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-xs font-medium text-gray-500 sm:text-sm">Trusted brands we export</p>
              <div className="flex items-center gap-4 sm:gap-8">
                {['Hyundai', 'Kia', 'Genesis'].map((brand) => (
                  <span key={brand} className="text-sm font-bold text-gray-400 transition-colors hover:text-gray-900 sm:text-lg">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose <span className="gradient-text">Jungcar</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              We make exporting Korean cars simple, reliable, and affordable
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card-hover rounded-2xl bg-card p-6 border border-border"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Featured Vehicles
              </h2>
              <p className="mt-2 text-muted-foreground">
                Handpicked quality vehicles ready for export
              </p>
            </div>
            <Link
              href="/cars"
              className="hidden items-center gap-2 text-sm font-medium text-primary hover:underline sm:flex"
            >
              View All Cars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCars.map((car) => (
              <CarCard key={car.id} {...car} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white"
            >
              View All Cars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Popular Brands
            </h2>
            <p className="mt-2 text-muted-foreground">
              We specialize in major Korean automobile brands
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 md:grid-cols-6">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/cars?brand=${brand.name}`}
                  className="flex h-24 items-center justify-center rounded-2xl bg-card border border-border transition-all hover:border-primary hover:shadow-lg"
                >
                  <span className="text-lg font-semibold text-foreground">
                    {brand.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--primary)] to-blue-700 p-8 lg:p-16">
            <div className="absolute right-0 top-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-white/10" />
            <div className="absolute left-0 bottom-0 -mb-20 -ml-20 h-60 w-60 rounded-full bg-white/10" />

            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Find Your Perfect Car?
              </h2>
              <p className="mt-4 max-w-xl text-lg text-blue-100">
                Browse our extensive inventory of quality Korean vehicles.
                Contact us for personalized assistance with your purchase.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/cars"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-primary transition-all hover:scale-105"
                >
                  Browse Inventory
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Verified Seller</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Quality Inspection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Export Documentation</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
