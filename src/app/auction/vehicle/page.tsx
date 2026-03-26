'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Loader2, Gavel, Car, Gauge, Fuel, Filter, X } from 'lucide-react';

interface AuctionCar {
  id: number;
  stockNo: string;
  prdId: string;
  crId: string;
  name: string;
  manufacturer: string;
  model: string;
  year: string;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string;
  price: number;
  priceUSD: number;
  location: string;
  img: string;
  images: string[];
  source: string;
  type: string;
  detailUrl: string;
}

interface AuctionData {
  crawledAt: string;
  totalCount: number;
  source: string;
  type: string;
  cars: AuctionCar[];
}

const manufacturers = [
  'All',
  'Hyundai',
  'Kia',
  'Genesis',
  'SsangYong',
  'Renault',
  'Chevrolet',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Other',
];

export default function AuctionVehiclePage() {
  const [data, setData] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [fuelFilter, setFuelFilter] = useState('All');
  const [sortBy, setSortBy] = useState('stock-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2026]);
  const itemsPerPage = 32;

  useEffect(() => {
    async function fetchCars() {
      try {
        const res = await fetch('/data/vehicle-auction.json');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  const fuels = useMemo(() => {
    if (!data) return ['All'];
    const unique = [...new Set(data.cars.map(c => c.fuel).filter(Boolean))];
    return ['All', ...unique];
  }, [data]);

  const filteredCars = useMemo(() => {
    if (!data) return [];
    let result = [...data.cars];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(car =>
        car.name.toLowerCase().includes(q) ||
        car.stockNo.includes(q) ||
        car.manufacturer.toLowerCase().includes(q)
      );
    }

    if (brandFilter !== 'All') {
      result = result.filter(car => car.manufacturer === brandFilter);
    }

    if (fuelFilter !== 'All') {
      result = result.filter(car => car.fuel === fuelFilter);
    }

    result = result.filter(car => {
      const price = car.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    result = result.filter(car => {
      const year = parseInt(car.year) || 0;
      return year >= yearRange[0] && year <= yearRange[1];
    });

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'stock-asc':
        result.sort((a, b) => parseInt(a.stockNo) - parseInt(b.stockNo));
        break;
      case 'stock-desc':
        result.sort((a, b) => parseInt(b.stockNo) - parseInt(a.stockNo));
        break;
      case 'year-desc':
        result.sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0'));
        break;
      case 'mileage-asc':
        result.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        break;
    }

    return result;
  }, [data, searchQuery, brandFilter, fuelFilter, sortBy, priceRange, yearRange]);

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, brandFilter, fuelFilter, sortBy, priceRange, yearRange]);

  const resetFilters = () => {
    setSearchQuery('');
    setBrandFilter('All');
    setFuelFilter('All');
    setPriceRange([0, 100000]);
    setYearRange([2000, 2026]);
    setSortBy('stock-asc');
  };

  const formatPriceLabel = (price: number) => {
    if (!price) return '$0';
    return `$${price.toLocaleString()}`;
  };

  const formatPrice = (price: number) => {
    if (!price) return '-';
    return `$${price.toLocaleString()}`;
  };

  const formatMileage = (km: number) => {
    if (!km) return '-';
    return `${km.toLocaleString()} km`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a4d0e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <section className="bg-[#0a4d0e] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Gavel className="h-8 w-8 text-[#D4A843]" />
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Auction Vehicles
              </h1>
              <p className="text-white/60">
                Total {data?.totalCount.toLocaleString()} vehicles | Updated: {data?.crawledAt ? new Date(data.crawledAt).toLocaleDateString('en-US') : '-'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, stock no, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-[#0a4d0e] focus:outline-none focus:ring-1 focus:ring-[#0a4d0e]"
              />
            </div>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0a4d0e] focus:outline-none"
            >
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Fuel Filter */}
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0a4d0e] focus:outline-none"
            >
              {fuels.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0a4d0e] focus:outline-none"
            >
              <option value="stock-asc">Stock No. ↑</option>
              <option value="stock-desc">Stock No. ↓</option>
              <option value="price-asc">Price Low → High</option>
              <option value="price-desc">Price High → Low</option>
              <option value="year-desc">Newest First</option>
              <option value="mileage-asc">Lowest Mileage</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                showFilters ? 'bg-[#0a4d0e] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Advanced
            </button>

            <span className="text-sm font-medium text-[#0a4d0e]">
              {filteredCars.length.toLocaleString()} vehicles
            </span>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price: {formatPriceLabel(priceRange[0])} ~ {formatPriceLabel(priceRange[1])}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1 accent-[#0a4d0e]"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 accent-[#0a4d0e]"
                  />
                </div>
              </div>

              {/* Year Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year: {yearRange[0]} ~ {yearRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="2000"
                    max="2026"
                    value={yearRange[0]}
                    onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                    className="flex-1 accent-[#0a4d0e]"
                  />
                  <input
                    type="range"
                    min="2000"
                    max="2026"
                    value={yearRange[1]}
                    onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                    className="flex-1 accent-[#0a4d0e]"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0a4d0e] transition-colors"
                >
                  <X className="h-4 w-4" />
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Car List */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedCars.map((car, idx) => (
              <Link key={car.id} href={`/auction/vehicle/${car.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={car.img || '/images/placeholder-car.jpg'}
                      alt={car.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-car.jpg';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#D4A843] px-2.5 py-1 text-xs font-semibold text-white">
                        <Gavel className="h-3 w-3" />
                        #{car.stockNo}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700 backdrop-blur-sm">
                        {car.manufacturer}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Car Name */}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-[#0a4d0e]">
                      {car.name}
                    </h3>

                    {/* Info */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Car className="h-3.5 w-3.5" />
                        <span>{car.year || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Gauge className="h-3.5 w-3.5" />
                        <span>{formatMileage(car.mileage)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Fuel className="h-3.5 w-3.5" />
                        <span>{car.fuel || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <span className="h-3.5 w-3.5 text-center">⚙</span>
                        <span>{car.transmission || '-'}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-400">Starting Bid</p>
                      <p className="text-xl font-bold text-[#D4A843]">
                        {formatPrice(car.price)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {paginatedCars.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Car className="h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">No vehicles found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-lg bg-[#0a4d0e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a4d0e]/90"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
