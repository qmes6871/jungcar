'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Gavel,
  CalendarDays,
  Car,
  ClipboardList,
  Search,
  MessageCircle,
  CreditCard,
  FileCheck,
  Ship,
  CheckCircle,
  ArrowRight,
  Clock,
  MapPin,
  Info,
} from 'lucide-react';

const auctionHouses = [
  {
    name: 'Hyundai Glovis Auction',
    nameKr: '현대 글로비스 경매장',
    description:
      'One of the largest auto auction houses in Korea operated by Hyundai Motor Group. Offers a wide range of vehicles including sedans, SUVs, trucks, and specialty vehicles — all types except vans.',
    schedule: 'Every Tuesday, Thursday & Friday',
    vehicles: 'All vehicle types except vans',
    volume: '3,000+ vehicles per session',
    images: [
      '/Jungcar/images/auction/1.jpg',
      '/Jungcar/images/auction/2.jpg',
      '/Jungcar/images/auction/3.jpg',
    ],
  },
  {
    name: 'AutoHub Auction',
    nameKr: '오토허브 경매장',
    description:
      'A major Korean auto auction platform offering competitive prices on quality used vehicles. Known for its thorough vehicle inspection process and transparent bidding system.',
    schedule: 'Every Wednesday',
    vehicles: 'All vehicle types',
    volume: '1,500+ vehicles per session',
    images: [
      '/Jungcar/images/auction/4.jpg',
      '/Jungcar/images/auction/5.jpg',
      '/Jungcar/images/auction/6.jpg',
    ],
  },
];

const purchaseSteps = [
  {
    number: '01',
    icon: Search,
    title: 'Tell Us What You Need',
    description:
      'Share your preferred brand, model, year, budget, and specifications. Our team will search upcoming auction listings for the best match.',
  },
  {
    number: '02',
    icon: CalendarDays,
    title: 'Auction Schedule Confirmation',
    description:
      'We check the upcoming auction schedule and notify you of matching vehicles. You can review photos and inspection reports before the auction.',
  },
  {
    number: '03',
    icon: Gavel,
    title: 'We Bid on Your Behalf',
    description:
      'Our experienced buyers attend the auction and bid on your chosen vehicle. We leverage our expertise to secure the best possible price.',
  },
  {
    number: '04',
    icon: FileCheck,
    title: 'Inspection & Confirmation',
    description:
      'After winning the bid, we conduct a thorough secondary inspection. You receive a detailed report with photos and videos for your review.',
  },
  {
    number: '05',
    icon: CreditCard,
    title: 'Payment & Documentation',
    description:
      'Once you confirm the purchase, complete the payment via bank transfer. We prepare all necessary export documents and certificates.',
  },
  {
    number: '06',
    icon: Ship,
    title: 'Shipping & Delivery',
    description:
      'We handle all export procedures, customs clearance, and international shipping. Track your vehicle in real-time until it arrives at your port.',
  },
];

export default function AuctionPage() {
  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative flex items-center justify-center py-32 sm:py-40">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Jungcar/images/hero-banner.jpg"
            alt="Korean Auto Auction"
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
              <Gavel className="h-4 w-4" />
              Korean Auto Auction
            </span>
            <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Auto <span className="text-[#D4A843]">Auction</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
              Get the best deals on quality Korean vehicles through Korea&apos;s
              top auto auction houses
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 1: HOW TO USE AUCTION ===== */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Auction Guide
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
              How to Use <span className="text-[#D4A843]">Auction</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              Korea operates major auto auction houses with thousands of
              vehicles available every week
            </p>
          </motion.div>

          <div className="mt-16 space-y-20">
            {auctionHouses.map((auction, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Auction House Header */}
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                  {/* Info */}
                  <div className={`flex-1 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a4d0e]">
                        <Gavel className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[#0a4d0e]">
                          {auction.name}
                        </h3>
                        <p className="text-sm text-[#0a4d0e]/40">
                          {auction.nameKr}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 leading-relaxed text-[#0a4d0e]/60">
                      {auction.description}
                    </p>

                    {/* Details Cards */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="flex items-start gap-3 rounded-xl border border-[#0a4d0e]/10 bg-[#f5f5f5] p-4">
                        <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D4A843]" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]/40">
                            Schedule
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#0a4d0e]">
                            {auction.schedule}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-[#0a4d0e]/10 bg-[#f5f5f5] p-4">
                        <Car className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D4A843]" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]/40">
                            Vehicles
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#0a4d0e]">
                            {auction.vehicles}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-[#0a4d0e]/10 bg-[#f5f5f5] p-4">
                        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D4A843]" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]/40">
                            Volume
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#0a4d0e]">
                            {auction.volume}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div className={`flex-1 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={auction.images[0]}
                          alt={`${auction.name} 1`}
                          className="h-56 w-full rounded-2xl object-cover sm:h-64"
                        />
                      </div>
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={auction.images[1]}
                          alt={`${auction.name} 2`}
                          className="h-36 w-full rounded-2xl object-cover sm:h-44"
                        />
                      </div>
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={auction.images[2]}
                          alt={`${auction.name} 3`}
                          className="h-36 w-full rounded-2xl object-cover sm:h-44"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: HOW TO BUY THROUGH JUNGCAR ===== */}
      <section className="py-20 sm:py-28 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Purchase Guide
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
              How to Buy Through{' '}
              <span className="text-[#D4A843]">JungCar</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              We handle everything from auction bidding to international
              delivery — here&apos;s how it works
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchaseSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group rounded-2xl border border-[#0a4d0e]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#0a4d0e]/20 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#0a4d0e]/10 transition-colors group-hover:bg-[#0a4d0e]">
                    <step.icon className="h-6 w-6 text-[#0a4d0e] group-hover:text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#D4A843]">
                      Step {step.number}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-[#0a4d0e]">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#0a4d0e]/60">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#0a4d0e] p-8 sm:p-12 lg:p-16">
            <div className="absolute right-0 top-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-[#D4A843]/10" />
            <div className="absolute left-0 bottom-0 -mb-16 -ml-16 h-56 w-56 rounded-full bg-[#D4A843]/10" />

            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Ready to Find Your Car at Auction?
                </h2>
                <p className="mt-2 text-white/60">
                  Contact us today and let our experts secure the best deal for
                  you at Korea&apos;s top auto auctions.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/821012345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4A843] px-6 py-3.5 font-semibold text-[#0a4d0e] transition-all hover:bg-[#e0b84f] hover:shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3.5 font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
                >
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
