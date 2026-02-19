'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Car, Loader2, Gavel, ExternalLink } from 'lucide-react';

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

export default function AuctionCarsPage() {
  const [data, setData] = useState<GlovisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('no-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    async function fetchCars() {
      try {
        const res = await fetch('/Jungcar/data/glovis-cars.json');
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

  const statuses = useMemo(() => {
    if (!data) return ['전체'];
    const unique = [...new Set(data.cars.map(c => c.status).filter(Boolean))];
    return ['전체', ...unique];
  }, [data]);

  const filteredCars = useMemo(() => {
    if (!data) return [];
    let result = [...data.cars];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(car =>
        car.name.toLowerCase().includes(q) ||
        car.no.includes(q)
      );
    }

    if (statusFilter !== '전체') {
      result = result.filter(car => car.status === statusFilter);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'no-asc':
        result.sort((a, b) => parseInt(a.no) - parseInt(b.no));
        break;
      case 'no-desc':
        result.sort((a, b) => parseInt(b.no) - parseInt(a.no));
        break;
    }

    return result;
  }, [data, searchQuery, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

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
                현대글로비스 경매 차량
              </h1>
              <p className="text-white/60">
                총 {data?.cnt.toLocaleString()}대 | 업데이트: {data?.at ? new Date(data.at).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="차량명 또는 출품번호 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-[#0a4d0e] focus:outline-none focus:ring-1 focus:ring-[#0a4d0e]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0a4d0e] focus:outline-none"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0a4d0e] focus:outline-none"
            >
              <option value="no-asc">출품번호 ↑</option>
              <option value="no-desc">출품번호 ↓</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
            </select>

            <span className="text-sm text-gray-500">
              {filteredCars.length.toLocaleString()}대
            </span>
          </div>
        </div>
      </section>

      {/* Car List */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedCars.map((car, idx) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                {/* Image */}
                {car.img && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={car.img}
                      alt={car.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-[#0a4d0e]/10 px-2 py-0.5 text-xs font-medium text-[#0a4d0e]">
                      #{car.no}
                    </span>
                    {car.status && (
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[car.status] || 'bg-gray-100 text-gray-600'}`}>
                        {car.status}
                      </span>
                    )}
                  </div>

                  {/* Car Name */}
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px]">
                    {car.name}
                  </h3>

                  {/* Info */}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    {car.year && <span>{car.year}년</span>}
                    {car.km && <span>• {car.km}</span>}
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">시작가</p>
                      <p className="text-lg font-bold text-[#0a4d0e]">
                        {car.price ? `${car.price.toLocaleString()}만원` : '-'}
                      </p>
                    </div>
                    {car.hope && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">희망가</p>
                        <p className="text-sm font-medium text-gray-600">
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
                    className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-[#0a4d0e] py-2 text-xs font-medium text-white transition-colors hover:bg-[#0a4d0e]/90"
                  >
                    상세보기
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-4 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
