'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Car, Search, Filter, ChevronLeft, ChevronRight, MapPin, Calendar, Gauge, Fuel, X } from 'lucide-react';

interface CarData {
  id: number;
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
  price: number;
  location: string;
  dealerName: string;
  description: string;
  img: string;
  images: string[];
  thumbs: string[];
  originalImg?: string;
  source?: string;
  detailUrl?: string;
}

interface CarsResponse {
  crawledAt: string;
  totalCount: number;
  cars: CarData[];
}

const ITEMS_PER_PAGE = 24;

// 제조사 목록
const MANUFACTURERS = [
  '전체', 'Hyundai', 'Kia', 'Genesis', 'Chevrolet', 'SsangYong',
  'Renault', 'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Volvo', 'Lexus',
  'Toyota', 'Honda', 'Ford', 'Jeep', 'Land Rover', 'Porsche', 'Tesla', 'Other'
];

// 연료 타입
const FUEL_TYPES = ['전체', 'Gasoline', 'Diesel', 'Hybrid', 'LPG', 'Electric'];

export default function CarsPage() {
  const [carsData, setCarsData] = useState<CarsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 필터
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('전체');
  const [selectedFuel, setSelectedFuel] = useState('전체');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2026]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // 차량 재고 데이터 로드
    fetch('/data/ssancar-stock.json')
      .then(res => res.json())
      .then(data => {
        setCarsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load cars:', err);
        setLoading(false);
      });
  }, []);

  // 필터링된 차량 목록
  const filteredCars = useMemo(() => {
    if (!carsData?.cars) return [];

    return carsData.cars.filter(car => {
      // 검색어 필터
      if (searchTerm && !(car.name || '').toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // 제조사 필터
      if (selectedManufacturer !== '전체' && car.manufacturer !== selectedManufacturer) {
        return false;
      }

      // 연료 필터
      if (selectedFuel !== '전체' && !(car.fuel || '').includes(selectedFuel)) {
        return false;
      }

      // 가격 필터
      const price = car.price || 0;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // 연식 필터
      const year = parseInt(car.year) || 0;
      if (year < yearRange[0] || year > yearRange[1]) {
        return false;
      }

      return true;
    });
  }, [carsData, searchTerm, selectedManufacturer, selectedFuel, priceRange, yearRange]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 페이지 변경시 스크롤
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedManufacturer, selectedFuel, priceRange, yearRange]);

  const formatPrice = (car: CarData) => {
    const price = car.price;
    if (!price) return '-';
    // USD 가격 표시
    if (car.source === 'vehicle') {
      return `$${price.toLocaleString()}`;
    }
    // Autobell은 만원 단위
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1)}억`;
    }
    return `${price.toLocaleString()}만원`;
  };

  const formatPriceValue = (price: number) => {
    if (!price) return '-';
    return `$${price.toLocaleString()}`;
  };

  const formatMileage = (km: number) => {
    if (!km) return '0km';
    return `${km.toLocaleString()}km`;
  };

  // 이미지 URL 생성
  const getImageUrl = (car: CarData) => {
    // 이미 전체 URL인 경우 그대로 사용
    if (car.img && car.img.startsWith('http')) {
      return car.img;
    }
    // 로컬 이미지가 있으면 사용
    if (car.img && !car.img.includes('default')) {
      return `${car.img}`;
    }
    // 원본 이미지 사용
    if (car.source === 'vehicle' && car.originalImg) {
      return car.originalImg;
    }
    // 오토벨 원본 이미지 사용
    if (car.crId) {
      const encodedPath = encodeURIComponent(`https://static.glovis.net/picture/dlr/prd/carImg/${car.crId}/normal/thumb/`);
      return `https://img.autobell.co.kr/?src=${encodedPath}&type=w&w=800&quality=80&ttype=jpg`;
    }
    return '/images/cars/default.jpg';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <section className="relative flex items-center justify-center py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a4d0e] via-[#0d6611] to-[#0a4d0e]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 px-4 py-1.5 text-sm font-medium text-[#D4A843]">
              <Car className="h-4 w-4" />
              {carsData ? `${carsData.totalCount.toLocaleString()}대 차량` : 'Loading...'}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Premium <span className="text-[#D4A843]">Used Cars</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/80">
              Premium Used Cars from Korea
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FILTERS ===== */}
      <section className="sticky top-0 z-40 bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* 검색 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="차량명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-[#0a4d0e] focus:outline-none focus:ring-1 focus:ring-[#0a4d0e]"
              />
            </div>

            {/* 제조사 */}
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a4d0e] focus:outline-none"
            >
              {MANUFACTURERS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* 연료 */}
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a4d0e] focus:outline-none"
            >
              {FUEL_TYPES.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* 필터 토글 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                showFilters ? 'bg-[#0a4d0e] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              상세 필터
            </button>

            {/* 결과 수 */}
            <span className="text-sm text-gray-500">
              {filteredCars.length.toLocaleString()}대
            </span>
          </div>

          {/* 상세 필터 */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {/* 가격 범위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격: {formatPriceValue(priceRange[0])} ~ {formatPriceValue(priceRange[1])}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    step="100"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="99999"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* 연식 범위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연식: {yearRange[0]}년 ~ {yearRange[1]}년
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="2000"
                    max="2026"
                    value={yearRange[0]}
                    onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="2000"
                    max="2026"
                    value={yearRange[1]}
                    onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* 필터 초기화 */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedManufacturer('전체');
                    setSelectedFuel('전체');
                    setPriceRange([0, 99999]);
                    setYearRange([2000, 2026]);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0a4d0e]"
                >
                  <X className="h-4 w-4" />
                  필터 초기화
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ===== CAR LIST ===== */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0a4d0e] border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedCars.map((car, idx) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <Link href={`/cars/${car.id}`}>
                      <div className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl">
                        {/* 이미지 */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageUrl(car)}
                            alt={car.name || 'Car'}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/cars/default.jpg';
                            }}
                          />
                          <div className="absolute top-3 left-3">
                            <span className="rounded-full bg-[#0a4d0e] px-3 py-1 text-xs font-medium text-white">
                              {car.manufacturer || 'Other'}
                            </span>
                          </div>
                        </div>

                        {/* 정보 */}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[48px] group-hover:text-[#0a4d0e]">
                            {car.name || 'Unknown'}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {car.year || '-'}년
                            </span>
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3.5 w-3.5" />
                              {formatMileage(car.mileage)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Fuel className="h-3.5 w-3.5" />
                              {car.fuel || '-'}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xl font-bold text-[#D4A843]">
                              {formatPrice(car)}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin className="h-3.5 w-3.5" />
                              {car.location || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#0a4d0e] text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <span className="ml-4 text-sm text-gray-500">
                    {currentPage} / {totalPages} 페이지
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
