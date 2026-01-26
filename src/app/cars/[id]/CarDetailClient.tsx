'use client';

import { useState } from 'react';
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
  Check,
  X,
  Shield,
  ClipboardList,
  AlertTriangle,
  Paintbrush,
  Cog,
  FileText,
} from 'lucide-react';
import CarCard from '@/components/CarCard';
import type { CarData, CarPerformanceReport, CarOption } from './page';

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
  const [activeTab, setActiveTab] = useState<'specs' | 'options' | 'report'>('specs');
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

  const report = car.performanceReport;

  return (
    <div className="overflow-hidden bg-[#f5f5f5]">
      {/* Back Button */}
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-4 sm:px-6 lg:px-8">
        <Link
          href="/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0a4d0e]/60 hover:text-[#0a4d0e] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Main Info */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={car.images[currentImageIndex]}
                alt={`${car.brand} ${car.model}`}
                className="h-full w-full object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[#0a4d0e]/60 p-2 text-white transition-colors hover:bg-[#0a4d0e]/80"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[#0a4d0e]/60 p-2 text-white transition-colors hover:bg-[#0a4d0e]/80"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#0a4d0e]/60 px-3 py-1 text-sm text-white">
                {currentImageIndex + 1} / {car.images.length}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-xl ${
                    index === currentImageIndex
                      ? 'ring-2 ring-[#0a4d0e]'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`${car.brand} ${car.model} - ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Car Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-[#0a4d0e]/50">{car.brand}</p>
                <h1 className="text-2xl font-bold text-[#0a4d0e] sm:text-3xl">{car.model}</h1>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="rounded-lg border border-[#0a4d0e]/15 p-2 text-[#0a4d0e]/40 hover:bg-white hover:text-[#0a4d0e] transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="rounded-lg border border-[#0a4d0e]/15 p-2 text-[#0a4d0e]/40 hover:bg-white hover:text-red-500 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
                {formatPrice(car.price)}
              </p>
              <p className="text-sm text-[#0a4d0e]/40">
                Price excludes shipping and import duties
              </p>
            </div>

            {/* Quick Specs */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-xl bg-white p-3 shadow-sm">
                  <spec.icon className="h-4 w-4 text-[#D4A843]" />
                  <p className="mt-1.5 text-[10px] uppercase tracking-wider text-[#0a4d0e]/40">{spec.label}</p>
                  <p className="text-sm font-semibold text-[#0a4d0e]">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Contact Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="tel:+821012345678"
                className="flex items-center gap-2 rounded-xl bg-[#0a4d0e] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <a
                href="https://wa.me/821012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#20BD5A] hover:shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href="mailto:info@jungcar.com"
                className="flex items-center gap-2 rounded-xl border border-[#0a4d0e]/20 bg-white px-5 py-3 text-sm font-semibold text-[#0a4d0e] transition-all hover:bg-[#0a4d0e]/5"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>

            {/* Description */}
            <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#0a4d0e]">Description</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#0a4d0e]/60">
                {car.description}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tabs: Specs / Options / Performance Report */}
        <div className="mt-10">
          <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm sm:inline-flex">
            <button
              onClick={() => setActiveTab('specs')}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === 'specs'
                  ? 'bg-[#0a4d0e] text-white shadow-sm'
                  : 'text-[#0a4d0e]/60 hover:text-[#0a4d0e] hover:bg-[#0a4d0e]/5'
              }`}
            >
              <Cog className="h-4 w-4" />
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === 'options'
                  ? 'bg-[#0a4d0e] text-white shadow-sm'
                  : 'text-[#0a4d0e]/60 hover:text-[#0a4d0e] hover:bg-[#0a4d0e]/5'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Vehicle Options
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === 'report'
                  ? 'bg-[#0a4d0e] text-white shadow-sm'
                  : 'text-[#0a4d0e]/60 hover:text-[#0a4d0e] hover:bg-[#0a4d0e]/5'
              }`}
            >
              <FileText className="h-4 w-4" />
              Performance Report
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* === SPECIFICATIONS === */}
            {activeTab === 'specs' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0a4d0e]">
                  <Cog className="h-5 w-5 text-[#D4A843]" />
                  Vehicle Specifications
                </h2>
                <div className="mt-4 divide-y divide-[#0a4d0e]/10 rounded-xl border border-[#0a4d0e]/10 text-sm">
                  {[
                    ['Brand', car.brand],
                    ['Model', car.model],
                    ['Year', car.year.toString()],
                    ['Mileage', `${car.mileage.toLocaleString()} km`],
                    ['Fuel Type', car.fuel],
                    ['Engine', car.engine],
                    ['Displacement', car.displacement],
                    ['Transmission', car.transmission],
                    ['Drivetrain', car.drivetrain],
                    ['Body Type', car.bodyType],
                    ['Color', car.color],
                    ['Doors', car.doors.toString()],
                    ['Seats', car.seats.toString()],
                    ['First Registration', car.firstRegistration],
                    ['VIN', car.vin],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between p-3">
                      <span className="text-[#0a4d0e]/50">{label}</span>
                      <span className="font-semibold text-[#0a4d0e]">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* === VEHICLE OPTIONS === */}
            {activeTab === 'options' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0a4d0e]">
                  <ClipboardList className="h-5 w-5 text-[#D4A843]" />
                  Vehicle Options
                </h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {car.options.map((option) => (
                    <div
                      key={option.name}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                        option.available
                          ? 'border-[#0a4d0e]/15 bg-[#0a4d0e]/5'
                          : 'border-[#0a4d0e]/5 bg-[#f5f5f5] opacity-50'
                      }`}
                    >
                      {option.available ? (
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0a4d0e]">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0a4d0e]/20">
                          <X className="h-3.5 w-3.5 text-[#0a4d0e]/40" />
                        </div>
                      )}
                      <span className={option.available ? 'font-medium text-[#0a4d0e]' : 'text-[#0a4d0e]/40 line-through'}>
                        {option.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* === PERFORMANCE REPORT === */}
            {activeTab === 'report' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Overall Grade */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-[#0a4d0e]">
                    <FileText className="h-5 w-5 text-[#D4A843]" />
                    Vehicle Performance Report
                  </h2>
                  <p className="mt-1 text-sm text-[#0a4d0e]/50">
                    Official Korean vehicle inspection record
                  </p>

                  <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#0a4d0e]/5 p-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-[#0a4d0e]">
                      <span className="text-2xl font-bold text-white">{report.overallGrade}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0a4d0e]">Overall Condition Grade</p>
                      <p className="text-xs text-[#0a4d0e]/50">Based on official performance inspection</p>
                    </div>
                  </div>
                </div>

                {/* History Check */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-[#0a4d0e]">
                    <AlertTriangle className="h-5 w-5 text-[#D4A843]" />
                    Vehicle History
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Accident History', report.accidentHistory],
                      ['Flood Damage', report.floodDamage],
                      ['Total Loss', report.totalLoss],
                      ['Usage Change', report.usageChange],
                      ['Odometer Status', report.odometerStatus],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-xl border border-[#0a4d0e]/10 p-3">
                        <span className="text-sm text-[#0a4d0e]/60">{label}</span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold ${
                          value === 'None' || value === 'Normal'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {(value === 'None' || value === 'Normal') ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mechanical Condition */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-[#0a4d0e]">
                    <Shield className="h-5 w-5 text-[#D4A843]" />
                    Mechanical Condition
                  </h3>
                  <div className="mt-4 divide-y divide-[#0a4d0e]/10 rounded-xl border border-[#0a4d0e]/10 text-sm">
                    {[
                      ['Exterior', report.exteriorCondition],
                      ['Interior', report.interiorCondition],
                      ['Engine', report.engineCondition],
                      ['Transmission', report.transmissionCondition],
                      ['Steering', report.steeringCondition],
                      ['Brake', report.brakeCondition],
                      ['Electrical', report.electricalCondition],
                      ['Tires', report.tireCondition],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between p-3">
                        <span className="text-[#0a4d0e]/50">{label}</span>
                        <ConditionBadge value={value as string} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paint Status */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-[#0a4d0e]">
                    <Paintbrush className="h-5 w-5 text-[#D4A843]" />
                    Paint / Body Panel Status
                  </h3>
                  <div className="mt-4 divide-y divide-[#0a4d0e]/10 rounded-xl border border-[#0a4d0e]/10 text-sm">
                    {[
                      ['Hood', report.paintStatus.hood],
                      ['Front Left Fender', report.paintStatus.frontLeftFender],
                      ['Front Right Fender', report.paintStatus.frontRightFender],
                      ['Front Left Door', report.paintStatus.frontLeftDoor],
                      ['Front Right Door', report.paintStatus.frontRightDoor],
                      ['Rear Left Door', report.paintStatus.rearLeftDoor],
                      ['Rear Right Door', report.paintStatus.rearRightDoor],
                      ['Rear Left Quarter Panel', report.paintStatus.rearLeftFender],
                      ['Rear Right Quarter Panel', report.paintStatus.rearRightFender],
                      ['Trunk', report.paintStatus.trunk],
                      ['Roof', report.paintStatus.roof],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between p-3">
                        <span className="text-[#0a4d0e]/50">{label}</span>
                        <PaintBadge value={value as string} />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="mt-10">
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#0a4d0e]">Interested in this vehicle?</h2>
            <p className="mt-2 text-sm text-[#0a4d0e]/50">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#0a4d0e]/60 mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-4 py-3 text-sm text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20 focus:border-[#0a4d0e]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0a4d0e]/60 mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-4 py-3 text-sm text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20 focus:border-[#0a4d0e]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0a4d0e]/60 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-4 py-3 text-sm text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20 focus:border-[#0a4d0e]"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#0a4d0e]/60 mb-1.5">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-4 py-3 text-sm text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20 focus:border-[#0a4d0e]"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0a4d0e] py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Related Vehicles */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-[#0a4d0e]">Similar Vehicles</h2>
          <p className="mt-2 text-sm text-[#0a4d0e]/50">
            You might also be interested in these vehicles
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCars.map((relatedCar) => (
              <CarCard key={relatedCar.id} {...relatedCar} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionBadge({ value }: { value: string }) {
  const isExcellent = value.toLowerCase().includes('excellent');
  const isGood = value.toLowerCase().includes('good');

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isExcellent
          ? 'bg-green-100 text-green-700'
          : isGood
          ? 'bg-blue-100 text-blue-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {value}
    </span>
  );
}

function PaintBadge({ value }: { value: string }) {
  const isNormal = value === 'Normal';

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isNormal
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {value}
    </span>
  );
}
