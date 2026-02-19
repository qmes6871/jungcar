'use client';

import { useState, useEffect } from 'react';
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
  Phone,
  Mail,
  MessageCircle,
  Share2,
  Heart,
  Loader2,
  ExternalLink,
  MapPin,
  Hash,
  Gavel,
  Tag,
  Cog,
} from 'lucide-react';

interface GlovisCarDetail {
  id: string;
  no: string;
  name: string;
  status: string;
  year: string;
  transmission: string;
  displacement: string;
  mileage: string;
  color: string;
  fuel: string;
  usage: string;
  grade: string;
  auctionRound: string;
  lane: string;
  plateNumber: string;
  location: string;
  price: number | null;
  hope: number | null;
  instant: number | null;
  img: string;
  url: string;
}

interface GlovisData {
  at: string;
  cnt: number;
  cars: GlovisCarDetail[];
}

const statusColors: Record<string, string> = {
  '유찰': 'bg-gray-100 text-gray-700',
  '낙찰': 'bg-green-100 text-green-700',
  '낙찰(부)': 'bg-yellow-100 text-yellow-700',
  '상담체결': 'bg-blue-100 text-blue-700',
  '진행중': 'bg-purple-100 text-purple-700',
};

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<GlovisCarDetail | null>(null);
  const [relatedCars, setRelatedCars] = useState<GlovisCarDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchCarData() {
      try {
        const res = await fetch('/Jungcar/data/glovis-cars-detail.json');
        if (res.ok) {
          const data: GlovisData = await res.json();
          const foundCar = data.cars.find(c => c.no === params.id);
          if (foundCar) {
            setCar(foundCar);
            // Get related cars (same brand or nearby numbers)
            const related = data.cars
              .filter(c => c.no !== params.id)
              .slice(0, 6);
            setRelatedCars(related);
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch car data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCarData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a4d0e]" />
      </div>
    );
  }

  if (notFound || !car) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5]">
        <h1 className="text-2xl font-bold text-[#0a4d0e]">차량을 찾을 수 없습니다</h1>
        <p className="mt-2 text-[#0a4d0e]/60">출품번호: {params.id}</p>
        <Link
          href="/cars"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0a4d0e] px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          차량 목록으로
        </Link>
      </div>
    );
  }

  // Parse brand from name
  const brandMatch = car.name.match(/^\[([^\]]+)\]/);
  const brand = brandMatch ? brandMatch[1] : '';
  const modelName = car.name.replace(/^\[[^\]]+\]\s*/, '');

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Back Button */}
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-4 sm:px-6 lg:px-8">
        <Link
          href="/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0a4d0e]/60 hover:text-[#0a4d0e] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          차량 목록으로
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Main Info */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={car.img}
                alt={car.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Jungcar/images/placeholder-car.jpg';
                }}
              />
              {car.status && (
                <div className={`absolute top-4 left-4 rounded-full px-3 py-1 text-sm font-medium ${statusColors[car.status] || 'bg-gray-100 text-gray-700'}`}>
                  {car.status}
                </div>
              )}
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
                {brand && <p className="text-sm text-[#0a4d0e]/50">{brand}</p>}
                <h1 className="text-2xl font-bold text-[#0a4d0e] sm:text-3xl">{modelName}</h1>
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

            {/* Auction Info Badge */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0a4d0e]/10 px-3 py-1 text-xs font-medium text-[#0a4d0e]">
                <Hash className="h-3 w-3" />
                출품번호 {car.no}
              </span>
              {car.auctionRound && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D4A843]/20 px-3 py-1 text-xs font-medium text-[#D4A843]">
                  <Gavel className="h-3 w-3" />
                  {car.auctionRound}
                </span>
              )}
              {car.lane && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {car.lane}
                </span>
              )}
              {car.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  <MapPin className="h-3 w-3" />
                  {car.location}
                </span>
              )}
            </div>

            {/* Prices */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#0a4d0e] p-4 text-white">
                <p className="text-xs opacity-70">시작가</p>
                <p className="mt-1 text-2xl font-bold">
                  {car.price ? `${car.price.toLocaleString()}` : '-'}
                  <span className="text-sm font-normal ml-0.5">만원</span>
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs text-[#0a4d0e]/50">희망가</p>
                <p className="mt-1 text-xl font-bold text-[#0a4d0e]">
                  {car.hope ? `${car.hope.toLocaleString()}` : '-'}
                  <span className="text-sm font-normal text-[#0a4d0e]/60 ml-0.5">만원</span>
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs text-[#0a4d0e]/50">즉시체결가</p>
                <p className="mt-1 text-xl font-bold text-[#D4A843]">
                  {car.instant ? `${car.instant.toLocaleString()}` : '-'}
                  <span className="text-sm font-normal text-[#0a4d0e]/60 ml-0.5">만원</span>
                </p>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { icon: Calendar, label: '연식', value: car.year ? `${car.year}년` : '-' },
                { icon: Gauge, label: '주행거리', value: car.mileage || '-' },
                { icon: Fuel, label: '연료', value: car.fuel || '-' },
                { icon: Settings, label: '변속기', value: car.transmission || '-' },
                { icon: Car, label: '배기량', value: car.displacement || '-' },
                { icon: Palette, label: '색상', value: car.color || '-' },
              ].map((spec) => (
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
                전화문의
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
                href={car.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-[#0a4d0e]/20 bg-white px-5 py-3 text-sm font-semibold text-[#0a4d0e] transition-all hover:bg-[#0a4d0e]/5"
              >
                <ExternalLink className="h-4 w-4" />
                경매사이트
              </a>
            </div>
          </motion.div>
        </div>

        {/* Detailed Specs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#0a4d0e]">
              <Cog className="h-5 w-5 text-[#D4A843]" />
              차량 정보
            </h2>
            <div className="mt-4 divide-y divide-[#0a4d0e]/10 rounded-xl border border-[#0a4d0e]/10 text-sm">
              {[
                ['출품번호', car.no],
                ['차량명', car.name],
                ['연식', car.year ? `${car.year}년` : '-'],
                ['주행거리', car.mileage || '-'],
                ['변속기', car.transmission || '-'],
                ['배기량', car.displacement || '-'],
                ['연료', car.fuel || '-'],
                ['색상', car.color || '-'],
                ['용도', car.usage || '-'],
                ['성능등급', car.grade || '-'],
                ['차량번호', car.plateNumber || '-'],
                ['경매회차', car.auctionRound || '-'],
                ['레인', car.lane || '-'],
                ['경매장', car.location || '-'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between p-3">
                  <span className="text-[#0a4d0e]/50">{label}</span>
                  <span className="font-semibold text-[#0a4d0e]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Grade Info */}
        {car.grade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#0a4d0e]">
                <Tag className="h-5 w-5 text-[#D4A843]" />
                성능등급
              </h2>
              <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#0a4d0e]/5 p-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-[#0a4d0e]">
                  <span className="text-2xl font-bold text-white">{car.grade}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0a4d0e]">차량 성능등급</p>
                  <p className="text-xs text-[#0a4d0e]/50">현대글로비스 경매장 평가 등급</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Inquiry Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10"
        >
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#0a4d0e]">이 차량에 관심이 있으신가요?</h2>
            <p className="mt-2 text-sm text-[#0a4d0e]/50">
              아래 양식을 작성해주시면 빠르게 연락드리겠습니다.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert('문의가 접수되었습니다!'); }} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#0a4d0e]/60 mb-1.5">이름 *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-4 py-3 text-sm text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20 focus:border-[#0a4d0e]"
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0a4d0e]/60 mb-1.5">이메일 *</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-4 py-3 text-sm text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20 focus:border-[#0a4d0e]"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0a4d0e]/60 mb-1.5">전화번호</label>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-4 py-3 text-sm text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20 focus:border-[#0a4d0e]"
                  placeholder="010-1234-5678"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#0a4d0e]/60 mb-1.5">문의내용 *</label>
                <textarea
                  required
                  rows={4}
                  defaultValue={`${car.year} ${car.name} (출품번호: ${car.no}) 차량에 관심이 있습니다.`}
                  className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-4 py-3 text-sm text-[#0a4d0e] focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/20 focus:border-[#0a4d0e]"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#0a4d0e] py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg"
                >
                  문의하기
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Related Vehicles */}
        {relatedCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10"
          >
            <h2 className="text-xl font-bold text-[#0a4d0e]">다른 차량</h2>
            <p className="mt-2 text-sm text-[#0a4d0e]/50">
              이 차량도 확인해보세요
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCars.slice(0, 3).map((relatedCar) => (
                <Link
                  key={relatedCar.id}
                  href={`/cars/${relatedCar.no}`}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={relatedCar.img}
                      alt={relatedCar.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <span className="inline-flex items-center gap-1 rounded bg-[#0a4d0e]/10 px-2 py-0.5 text-xs font-medium text-[#0a4d0e]">
                      #{relatedCar.no}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-1">
                      {relatedCar.name}
                    </h3>
                    <p className="mt-1 text-lg font-bold text-[#0a4d0e]">
                      {relatedCar.price ? `${relatedCar.price.toLocaleString()}만원` : '-'}
                    </p>
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
