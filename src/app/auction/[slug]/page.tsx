'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Gavel,
  MapPin,
  Calendar,
  Clock,
  Car,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Phone,
  MessageCircle,
  Building,
  Users,
  Shield,
  FileCheck,
  Search,
  SlidersHorizontal,
  Loader2,
  Fuel,
  Gauge,
  X,
  Cog,
  Palette,
  Tag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Settings,
  ClipboardCheck,
  Hash,
  FileText,
} from 'lucide-react';

interface CarDetail {
  exhibitNo: string;
  parkingNo: string;
  carNo: string;
  vinNo: string;
  engineType: string;
  displacement: string;
  history: string;
  carType: string;
  evalFrame: string;
  evalExterior: string;
  inspector: string;
  storage: string;
  note: string;
  convenienceOptions: string;
  sunroof: string;
  seatOptions: string;
  powerSeat: string;
  funcEvalDetail: string;
  totalLoss: boolean;
  floodTotal: boolean;
  floodPartial: boolean;
  remarks: string;
}

interface AuctionCar {
  id: string;
  brand: string;
  model: string;
  nameKr: string;
  year: number;
  mileage: number;
  mileageFormatted: string;
  price: number;
  priceFormatted: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  image: string;
  images?: string[];
  status: string;
  detail?: CarDetail;
}

interface CarsData {
  updatedAt: string;
  totalCount: number;
  cars: AuctionCar[];
}

// Glovis data interface
interface GlovisCar {
  id: string;
  no: string;
  name: string;
  year: string;
  km: string;
  price: number | null;
  hope: number | null;
  status: string;
  url: string;
  img?: string;
}

interface GlovisData {
  at: string;
  cnt: number;
  cars: GlovisCar[];
}

const statusColors: Record<string, string> = {
  '유찰': 'bg-gray-100 text-gray-700',
  '낙찰': 'bg-green-100 text-green-700',
  '낙찰(부)': 'bg-yellow-100 text-yellow-700',
  '상담체결': 'bg-blue-100 text-blue-700',
  '진행중': 'bg-purple-100 text-purple-700',
};

const auctionData: Record<string, {
  name: string;
  nameKr: string;
  location: string;
  address: string;
  days: string;
  time: string;
  vehicles: string;
  description: string;
  features: string[];
  vehicleTypes: string[];
  images: string[];
  mapUrl: string;
}> = {
  'hyundai-glovis': {
    name: 'Hyundai Glovis Auction',
    nameKr: '현대 글로비스 경매장',
    location: 'Shihwa, Ansan',
    address: '경기도 안산시 단원구 시화공단 1로 200',
    days: 'Every Tuesday & Thursday',
    time: '09:00 AM KST',
    vehicles: '3,000+',
    description: 'One of the largest auto auction houses in Korea operated by Hyundai Motor Group. Offers a wide range of vehicles including sedans, SUVs, trucks, and specialty vehicles. Known for its comprehensive vehicle inspection reports and transparent bidding process.',
    features: [
      'Largest auction volume in Korea',
      'Comprehensive vehicle inspection',
      'Real-time online bidding available',
      'Detailed condition reports',
      'Professional vehicle appraisal',
      'Secure payment system',
    ],
    vehicleTypes: [
      'Sedans',
      'SUVs & Crossovers',
      'Trucks & Commercial',
      'Luxury Vehicles',
      'Electric & Hybrid',
      'Specialty Vehicles',
    ],
    images: [
      '/Jungcar/images/auction/1.jpg',
      '/Jungcar/images/auction/2.jpg',
      '/Jungcar/images/auction/3.jpg',
    ],
    mapUrl: 'https://maps.google.com/?q=37.3219,126.7319',
  },
  'autohub': {
    name: 'AutoHub Auction',
    nameKr: '오토허브 경매장',
    location: 'Gimpo, Gyeonggi-do',
    address: '경기도 김포시 양촌읍 황금로 200',
    days: 'Every Wednesday',
    time: '10:00 AM KST',
    vehicles: '2,000+',
    description: 'A major Korean auto auction platform offering competitive prices on quality used vehicles. Known for its thorough vehicle inspection process and transparent bidding system. Features modern facilities and a wide selection of domestic and imported vehicles.',
    features: [
      'Modern auction facilities',
      'Thorough inspection process',
      'Wide vehicle selection',
      'Competitive pricing',
      'Export support services',
      'Buyer protection program',
    ],
    vehicleTypes: [
      'Sedans',
      'SUVs & Crossovers',
      'Vans & MPVs',
      'Trucks',
      'Imported Vehicles',
      'Premium & Luxury',
    ],
    images: [
      '/Jungcar/images/auction/4.jpg',
      '/Jungcar/images/auction/5.jpg',
      '/Jungcar/images/auction/6.jpg',
    ],
    mapUrl: 'https://maps.google.com/?q=37.6185,126.6856',
  },
};

export default function AuctionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const auction = auctionData[slug];

  // Car data state
  const [carsData, setCarsData] = useState<CarsData | null>(null);
  const [glovisData, setGlovisData] = useState<GlovisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCar, setSelectedCar] = useState<AuctionCar | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'eval' | 'options' | 'notice'>('info');
  const itemsPerPage = 12;

  // Reset modal state when car changes
  useEffect(() => {
    if (selectedCar) {
      setCurrentImageIndex(0);
      setActiveTab('info');
    }
  }, [selectedCar]);

  useEffect(() => {
    if (slug === 'autohub') {
      setLoading(true);
      fetch('/Jungcar/data/autohub-cars.json')
        .then(res => res.json())
        .then(data => {
          setCarsData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (slug === 'hyundai-glovis') {
      setLoading(true);
      fetch('/Jungcar/data/glovis-cars.json')
        .then(res => res.json())
        .then(data => {
          setGlovisData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  const brands = useMemo(() => {
    if (!carsData) return ['All'];
    const uniqueBrands = [...new Set(carsData.cars.map(c => c.brand))].sort();
    return ['All', ...uniqueBrands];
  }, [carsData]);

  const statuses = useMemo(() => {
    if (!glovisData) return ['All'];
    const unique = [...new Set(glovisData.cars.map(c => c.status).filter(Boolean))];
    return ['All', ...unique];
  }, [glovisData]);

  const filteredGlovisCars = useMemo(() => {
    if (!glovisData) return [];
    let result = [...glovisData.cars];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(car =>
        car.name.toLowerCase().includes(q) ||
        car.no.includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(car => car.status === statusFilter);
    }

    return result;
  }, [glovisData, searchQuery, statusFilter]);

  const totalGlovisPages = Math.ceil(filteredGlovisCars.length / itemsPerPage);
  const paginatedGlovisCars = filteredGlovisCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredCars = useMemo(() => {
    if (!carsData) return [];
    let result = [...carsData.cars];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(car =>
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.nameKr.toLowerCase().includes(q)
      );
    }

    if (brandFilter !== 'All') {
      result = result.filter(car => car.brand === brandFilter);
    }

    return result;
  }, [carsData, searchQuery, brandFilter]);

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, brandFilter, statusFilter]);

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a4d0e]">Auction Not Found</h1>
          <p className="mt-2 text-[#0a4d0e]/60">The auction you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/auction"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0a4d0e] px-6 py-3 font-semibold text-white hover:bg-[#0d6611]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative flex items-center justify-center py-24 sm:py-32">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={auction.images[0]}
            alt={auction.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a4d0e]/95 via-[#0a4d0e]/80 to-[#0a4d0e]/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/auction"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Auctions
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Gavel className="h-8 w-8 text-[#D4A843]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  {auction.name}
                </h1>
                <p className="mt-1 text-lg text-white/60">{auction.nameKr}</p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-lg text-white/80">
              {auction.description}
            </p>

            {/* Quick Info */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-[#D4A843]" />
                <span className="text-sm text-white">{auction.location}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-[#D4A843]" />
                <span className="text-sm text-white">{auction.days}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Clock className="h-4 w-4 text-[#D4A843]" />
                <span className="text-sm text-white">{auction.time}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#D4A843]/20 px-4 py-2 backdrop-blur-sm">
                <Car className="h-4 w-4 text-[#D4A843]" />
                <span className="text-sm font-semibold text-[#D4A843]">{auction.vehicles} vehicles/session</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {auction.images.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${auction.name} ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES & VEHICLE TYPES ===== */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[#0a4d0e]/10 bg-white p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a4d0e]/10">
                  <Shield className="h-6 w-6 text-[#0a4d0e]" />
                </div>
                <h2 className="text-xl font-bold text-[#0a4d0e]">Auction Features</h2>
              </div>
              <div className="space-y-4">
                {auction.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#D4A843] mt-0.5" />
                    <span className="text-[#0a4d0e]/70">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vehicle Types */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[#0a4d0e]/10 bg-white p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a4d0e]/10">
                  <Car className="h-6 w-6 text-[#0a4d0e]" />
                </div>
                <h2 className="text-xl font-bold text-[#0a4d0e]">Vehicle Types</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {auction.vehicleTypes.map((type, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-[#D4A843]" />
                    <span className="text-sm font-medium text-[#0a4d0e]">{type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== VEHICLE LISTING (Hyundai Glovis) ===== */}
      {slug === 'hyundai-glovis' && (
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
                Auction Vehicles
              </span>
              <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e]">
                Current <span className="text-[#D4A843]">Inventory</span>
              </h2>
              <p className="mt-2 text-[#0a4d0e]/60">
                {glovisData ? `${glovisData.cnt.toLocaleString()} vehicles available` : 'Loading vehicles...'}
              </p>
            </motion.div>

            {/* Search & Filter */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0a4d0e]/40" />
                <input
                  type="text"
                  placeholder="Search by car name or entry number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-white py-3 pl-12 pr-4 text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-[#0a4d0e]/15 bg-white px-4 py-3 text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>
                ))}
              </select>
              <span className="text-sm text-[#0a4d0e]/60">
                {filteredGlovisCars.length.toLocaleString()} vehicles
              </span>
            </div>

            {/* Cars Grid */}
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#0a4d0e]" />
                <p className="mt-4 text-lg font-semibold text-[#0a4d0e]">Loading vehicles...</p>
              </div>
            ) : paginatedGlovisCars.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedGlovisCars.map((car, idx) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="group overflow-hidden rounded-2xl border border-[#0a4d0e]/10 bg-white shadow-sm transition-all hover:border-[#0a4d0e]/30 hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        {car.img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={car.img}
                            alt={car.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-[#0a4d0e] px-3 py-1 text-xs font-medium text-white">
                            #{car.no}
                          </span>
                        </div>
                        {car.status && (
                          <div className="absolute top-3 right-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[car.status] || 'bg-gray-100 text-gray-600'}`}>
                              {car.status}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-sm font-bold text-[#0a4d0e] line-clamp-2 min-h-[40px]">
                          {car.name}
                        </h3>

                        {/* Specs */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#0a4d0e]/60">
                          {car.year && <span>{car.year}년</span>}
                          {car.km && <span>• {car.km}</span>}
                        </div>

                        {/* Price */}
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <p className="text-xs text-[#0a4d0e]/50">Starting Price</p>
                            <p className="text-lg font-bold text-[#D4A843]">
                              {car.price ? `${car.price.toLocaleString()}만원` : '-'}
                            </p>
                          </div>
                          {car.hope && (
                            <div className="text-right">
                              <p className="text-xs text-[#0a4d0e]/50">Hope Price</p>
                              <p className="text-sm font-medium text-[#0a4d0e]/70">
                                {car.hope.toLocaleString()}만원
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Link */}
                        <a
                          href={car.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#0a4d0e] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a4d0e]/90"
                        >
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalGlovisPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-[#0a4d0e]/20 bg-white px-4 py-2 text-sm font-medium text-[#0a4d0e] disabled:opacity-50 hover:bg-[#f5f5f5]"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalGlovisPages) }, (_, i) => {
                        let page;
                        if (totalGlovisPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalGlovisPages - 2) {
                          page = totalGlovisPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              currentPage === page
                                ? 'bg-[#0a4d0e] text-white'
                                : 'border border-[#0a4d0e]/20 bg-white text-[#0a4d0e] hover:bg-[#f5f5f5]'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalGlovisPages, p + 1))}
                      disabled={currentPage === totalGlovisPages}
                      className="rounded-lg border border-[#0a4d0e]/20 bg-white px-4 py-2 text-sm font-medium text-[#0a4d0e] disabled:opacity-50 hover:bg-[#f5f5f5]"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <Car className="mx-auto h-16 w-16 text-[#0a4d0e]/20" />
                <p className="mt-4 text-lg font-semibold text-[#0a4d0e]">No vehicles found</p>
                <p className="mt-2 text-[#0a4d0e]/60">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== VEHICLE LISTING (AutoHub only) ===== */}
      {slug === 'autohub' && (
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
                Available Vehicles
              </span>
              <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e]">
                Current <span className="text-[#D4A843]">Inventory</span>
              </h2>
              <p className="mt-2 text-[#0a4d0e]/60">
                {carsData ? `${carsData.totalCount} vehicles available for auction` : 'Loading vehicles...'}
              </p>
            </motion.div>

            {/* Search & Filter */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0a4d0e]/40" />
                <input
                  type="text"
                  placeholder="Search by brand or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-white py-3 pl-12 pr-4 text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20"
                />
              </div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="rounded-xl border border-[#0a4d0e]/15 bg-white px-4 py-3 text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20"
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <span className="text-sm text-[#0a4d0e]/60">
                {filteredCars.length} vehicles
              </span>
            </div>

            {/* Cars Grid */}
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#0a4d0e]" />
                <p className="mt-4 text-lg font-semibold text-[#0a4d0e]">Loading vehicles...</p>
              </div>
            ) : paginatedCars.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedCars.map((car, idx) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedCar(car)}
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#0a4d0e]/10 bg-white shadow-sm transition-all hover:border-[#0a4d0e]/30 hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/Jungcar/images/auction/car-placeholder.jpg';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-[#0a4d0e] px-3 py-1 text-xs font-medium text-white">
                            {car.brand}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0a4d0e]">
                            {car.year}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-[#0a4d0e] line-clamp-1">
                          {car.brand} {car.model}
                        </h3>
                        <p className="mt-1 text-sm text-[#0a4d0e]/60 line-clamp-1">
                          {car.nameKr}
                        </p>

                        {/* Specs */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-sm text-[#0a4d0e]/70">
                            <Gauge className="h-4 w-4 text-[#D4A843]" />
                            <span>{car.mileageFormatted}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#0a4d0e]/70">
                            <Fuel className="h-4 w-4 text-[#D4A843]" />
                            <span>{car.fuel}</span>
                          </div>
                        </div>

                        {/* Price & Status */}
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-[#0a4d0e]/50">Starting Price</p>
                            <p className="text-lg font-bold text-[#D4A843]">
                              {car.priceFormatted}
                            </p>
                          </div>
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            {car.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-[#0a4d0e]/20 bg-white px-4 py-2 text-sm font-medium text-[#0a4d0e] disabled:opacity-50 hover:bg-[#f5f5f5]"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              currentPage === page
                                ? 'bg-[#0a4d0e] text-white'
                                : 'border border-[#0a4d0e]/20 bg-white text-[#0a4d0e] hover:bg-[#f5f5f5]'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-[#0a4d0e]/20 bg-white px-4 py-2 text-sm font-medium text-[#0a4d0e] disabled:opacity-50 hover:bg-[#f5f5f5]"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <Car className="mx-auto h-16 w-16 text-[#0a4d0e]/20" />
                <p className="mt-4 text-lg font-semibold text-[#0a4d0e]">No vehicles found</p>
                <p className="mt-2 text-[#0a4d0e]/60">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== LOCATION INFO ===== */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#0a4d0e]/10 bg-[#f5f5f5] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a4d0e]">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0a4d0e]">Location & Schedule</h2>
                <p className="text-sm text-[#0a4d0e]/60">Visit us at our auction center</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 text-[#D4A843] mt-1" />
                <div>
                  <p className="font-semibold text-[#0a4d0e]">Address</p>
                  <p className="mt-1 text-sm text-[#0a4d0e]/60">{auction.address}</p>
                  <a
                    href={auction.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#0a4d0e] hover:text-[#D4A843]"
                  >
                    View on Map
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 flex-shrink-0 text-[#D4A843] mt-1" />
                <div>
                  <p className="font-semibold text-[#0a4d0e]">Auction Days</p>
                  <p className="mt-1 text-sm text-[#0a4d0e]/60">{auction.days}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 flex-shrink-0 text-[#D4A843] mt-1" />
                <div>
                  <p className="font-semibold text-[#0a4d0e]">Start Time</p>
                  <p className="mt-1 text-sm text-[#0a4d0e]/60">{auction.time}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#0a4d0e] p-8 sm:p-12">
            <div className="absolute right-0 top-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-[#D4A843]/10" />
            <div className="absolute left-0 bottom-0 -mb-16 -ml-16 h-56 w-56 rounded-full bg-[#D4A843]/10" />

            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Ready to Bid at {auction.name}?
                </h2>
                <p className="mt-2 text-white/60">
                  Let us help you find and secure your ideal vehicle at the next auction session.
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
                  href="/cars"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3.5 font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
                >
                  View Cars
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CAR DETAIL MODAL ===== */}
      {selectedCar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedCar(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCar(null)}
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left: Image Gallery */}
            <div className="relative w-full bg-gray-900 lg:w-1/2">
              {/* Main Image */}
              <div className="relative aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedCar.images?.[currentImageIndex] || selectedCar.image}
                  alt={`${selectedCar.brand} ${selectedCar.model}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/Jungcar/images/auction/car-placeholder.jpg';
                  }}
                />
                {/* Image Navigation */}
                {selectedCar.images && selectedCar.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : selectedCar.images!.length - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i < selectedCar.images!.length - 1 ? i + 1 : 0)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                      {currentImageIndex + 1} / {selectedCar.images.length}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnail Strip */}
              {selectedCar.images && selectedCar.images.length > 1 && (
                <div className="flex gap-1 overflow-x-auto bg-gray-900 p-2">
                  {selectedCar.images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 overflow-hidden rounded ${currentImageIndex === idx ? 'ring-2 ring-[#D4A843]' : 'opacity-60 hover:opacity-100'}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-14 w-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Car Title Overlay */}
              <div className="bg-gradient-to-t from-gray-900 to-gray-900/80 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#D4A843] px-2 py-0.5 text-xs font-bold text-white">#{selectedCar.id}</span>
                  <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white">{selectedCar.status}</span>
                </div>
                <h2 className="mt-2 text-lg font-bold text-white">{selectedCar.nameKr}</h2>
                <p className="text-2xl font-bold text-[#D4A843]">{selectedCar.priceFormatted}</p>
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex w-full flex-col overflow-hidden lg:w-1/2">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {[
                  { key: 'info', label: '차량정보', icon: Info },
                  { key: 'eval', label: '성능평가', icon: ClipboardCheck },
                  { key: 'options', label: '옵션정보', icon: Settings },
                  { key: 'notice', label: '필독사항', icon: AlertTriangle },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`flex flex-1 items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'border-b-2 border-[#0a4d0e] bg-white text-[#0a4d0e]'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* 차량정보 Tab */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: '출품번호', value: selectedCar.detail?.exhibitNo || selectedCar.id, icon: Hash },
                        { label: '주차번호', value: selectedCar.detail?.parkingNo || '-', icon: MapPin },
                        { label: '차량번호', value: selectedCar.detail?.carNo || '-', icon: Tag },
                        { label: '차대번호', value: selectedCar.detail?.vinNo || '-', icon: FileText },
                        { label: '연식', value: selectedCar.year, icon: Calendar },
                        { label: '주행거리', value: selectedCar.mileageFormatted, icon: Gauge },
                        { label: '연료', value: selectedCar.fuel, icon: Fuel },
                        { label: '변속기', value: selectedCar.transmission, icon: Cog },
                        { label: '배기량', value: selectedCar.detail?.displacement ? selectedCar.detail.displacement + 'cc' : '-', icon: Settings },
                        { label: '색상', value: selectedCar.color, icon: Palette },
                        { label: '차종', value: selectedCar.detail?.carType || selectedCar.bodyType, icon: Car },
                        { label: '경력', value: selectedCar.detail?.history || '-', icon: FileCheck },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                          <item.icon className="h-4 w-4 flex-shrink-0 text-[#0a4d0e]/60" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-500">{item.label}</p>
                            <p className="truncate text-sm font-semibold text-gray-900">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 성능평가 Tab */}
                {activeTab === 'eval' && (
                  <div className="space-y-4">
                    {/* 평가점 */}
                    <div className="rounded-xl bg-[#0a4d0e]/5 p-4">
                      <h4 className="mb-3 font-semibold text-[#0a4d0e]">평가점</h4>
                      <div className="flex gap-4">
                        <div className="flex-1 rounded-lg bg-white p-3 text-center shadow-sm">
                          <p className="text-xs text-gray-500">골격</p>
                          <p className="text-2xl font-bold text-[#0a4d0e]">{selectedCar.detail?.evalFrame || '-'}</p>
                        </div>
                        <div className="flex-1 rounded-lg bg-white p-3 text-center shadow-sm">
                          <p className="text-xs text-gray-500">외관</p>
                          <p className="text-2xl font-bold text-[#0a4d0e]">{selectedCar.detail?.evalExterior || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* 점검 정보 */}
                    <div className="space-y-2">
                      {[
                        { label: '점검원', value: selectedCar.detail?.inspector },
                        { label: '보관물품', value: selectedCar.detail?.storage },
                        { label: '비고', value: selectedCar.detail?.note },
                      ].map((item, idx) => item.value && item.value !== '-' && (
                        <div key={idx} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                          <span className="text-sm text-gray-600">{item.label}</span>
                          <span className="text-sm font-medium text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* 기능평가 상세 */}
                    {selectedCar.detail?.funcEvalDetail && (
                      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-orange-700">
                          <AlertTriangle className="h-4 w-4" />
                          기능평가 상세
                        </h4>
                        <p className="text-sm text-orange-800">{selectedCar.detail.funcEvalDetail}</p>
                      </div>
                    )}

                    {/* 사고이력 */}
                    <div className="flex gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedCar.detail?.totalLoss ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        전손: {selectedCar.detail?.totalLoss ? 'Y' : 'N'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedCar.detail?.floodTotal ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        침수전손: {selectedCar.detail?.floodTotal ? 'Y' : 'N'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedCar.detail?.floodPartial ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        침수분손: {selectedCar.detail?.floodPartial ? 'Y' : 'N'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 옵션정보 Tab */}
                {activeTab === 'options' && (
                  <div className="space-y-4">
                    {/* 편의옵션 */}
                    {selectedCar.detail?.convenienceOptions && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">편의 옵션</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCar.detail.convenienceOptions.split(' ').filter(Boolean).map((opt, idx) => (
                            <span key={idx} className="rounded-full bg-[#0a4d0e]/10 px-3 py-1 text-xs font-medium text-[#0a4d0e]">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 선루프 */}
                    {selectedCar.detail?.sunroof && (
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                        <span className="text-sm text-gray-600">선루프 (SR)</span>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {selectedCar.detail.sunroof}
                        </span>
                      </div>
                    )}

                    {/* 시트옵션 */}
                    {selectedCar.detail?.seatOptions && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">시트 옵션</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCar.detail.seatOptions.split(' ').filter(Boolean).map((opt, idx) => (
                            <span key={idx} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 전동시트 */}
                    {selectedCar.detail?.powerSeat && (
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                        <span className="text-sm text-gray-600">전동시트</span>
                        <span className="text-sm font-medium text-gray-900">{selectedCar.detail.powerSeat}</span>
                      </div>
                    )}

                    {!selectedCar.detail?.convenienceOptions && !selectedCar.detail?.sunroof && !selectedCar.detail?.seatOptions && (
                      <p className="py-8 text-center text-gray-500">옵션 정보가 없습니다</p>
                    )}
                  </div>
                )}

                {/* 필독사항 Tab */}
                {activeTab === 'notice' && (
                  <div className="space-y-4">
                    {/* 특기사항 */}
                    {selectedCar.detail?.remarks && selectedCar.detail.remarks !== '-' && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-red-700">
                          <AlertTriangle className="h-4 w-4" />
                          특기사항 / 점검자 의견
                        </h4>
                        <p className="text-sm text-red-800">{selectedCar.detail.remarks}</p>
                      </div>
                    )}

                    {/* 일반 필독사항 */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <h4 className="mb-3 font-semibold text-gray-700">필독 사항</h4>
                      <ul className="space-y-2 text-xs text-gray-600">
                        <li className="flex gap-2"><span className="text-[#0a4d0e]">●</span> 비금속 또는 탈,부착 가능부품은 점검사항에서 제외됩니다.</li>
                        <li className="flex gap-2"><span className="text-[#0a4d0e]">●</span> 중고차 특성상 부분도색과 경미한 판금은 표기하지 않습니다.</li>
                        <li className="flex gap-2"><span className="text-[#0a4d0e]">●</span> 시트/실내내장재 등 사용감 및 스크레치는 표기하지 않습니다.</li>
                        <li className="flex gap-2"><span className="text-[#0a4d0e]">●</span> 사진과 성능체크가 상이할 경우, 사진을 우선 적용합니다.</li>
                        <li className="flex gap-2"><span className="text-[#0a4d0e]">●</span> [실차검수필요] 대상차량은 현장검수 필수입니다.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact CTA */}
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="flex gap-3">
                  <a
                    href="https://wa.me/821012345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0a4d0e] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d6611]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp 문의
                  </a>
                  <a
                    href="tel:+821012345678"
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#0a4d0e] px-4 py-3 text-sm font-semibold text-[#0a4d0e] transition-colors hover:bg-[#0a4d0e]/5"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
