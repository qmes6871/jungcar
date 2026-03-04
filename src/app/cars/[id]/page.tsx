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
  ExternalLink,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
  originalImg: string;
}

interface CarsResponse {
  crawledAt: string;
  totalCount: number;
  cars: CarData[];
}

export default function CarDetailPage() {
  const params = useParams();
  const carId = params?.id ? parseInt(params.id as string) : 0;

  const [car, setCar] = useState<CarData | null>(null);
  const [relatedCars, setRelatedCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!carId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchCarData() {
      try {
        // Use full URL for client-side fetch
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${baseUrl}/Jungcar/data/autobell-cars.json`);
        if (res.ok) {
          const data: CarsResponse = await res.json();
          const foundCar = data.cars.find(c => c.id === carId);

          if (foundCar) {
            setCar(foundCar);
            // 같은 제조사 차량 추천
            const related = data.cars
              .filter(c => c.id !== carId && c.manufacturer === foundCar.manufacturer)
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

  const formatPrice = (price: number) => {
    if (!price) return '-';
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1)}억원`;
    }
    return `${price.toLocaleString()}만원`;
  };

  const formatMileage = (km: number) => {
    if (!km) return '0km';
    return `${km.toLocaleString()}km`;
  };

  const getImageUrl = (carData: CarData) => {
    // 이미 전체 URL인 경우 그대로 사용
    if (carData.img && carData.img.startsWith('http')) {
      return carData.img;
    }
    // 로컬 경로인 경우 basePath 추가
    if (carData.img && !carData.img.includes('default')) {
      return `/Jungcar${carData.img}`;
    }
    // crId가 있으면 오토벨 CDN URL 생성
    if (carData.crId) {
      const encodedPath = encodeURIComponent(`https://static.glovis.net/picture/dlr/prd/carImg/${carData.crId}/normal/thumb/`);
      return `https://img.autobell.co.kr/?src=${encodedPath}&type=w&w=1200&quality=90&ttype=jpg`;
    }
    return '/Jungcar/images/cars/default.jpg';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0a4d0e]" />
          <p className="text-gray-600">차량 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (notFound || !car) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <Car className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-bold text-gray-700">차량을 찾을 수 없습니다</h2>
        <p className="mt-2 text-gray-500">요청하신 차량 정보가 존재하지 않습니다.</p>
        <Link
          href="/cars"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0a4d0e] px-6 py-3 text-white hover:bg-[#0d6611]"
        >
          <ArrowLeft className="h-4 w-4" />
          차량 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/cars"
              className="flex items-center gap-2 text-gray-600 hover:text-[#0a4d0e]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">차량 목록</span>
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
          {/* 왼쪽: 이미지 */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg"
            >
              <div className="aspect-[4/3] bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(car)}
                  alt={car.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/cars/default.jpg';
                  }}
                />
              </div>
            </motion.div>

            {/* 차량 설명 */}
            {car.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 rounded-2xl bg-white p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900">판매자 설명</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{car.description}</p>
              </motion.div>
            )}

            {/* 상세 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 rounded-2xl bg-white p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900">차량 정보</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <Calendar className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">연식</p>
                  <p className="font-bold text-gray-900">{car.year}년</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Gauge className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">주행거리</p>
                  <p className="font-bold text-gray-900">{formatMileage(car.mileage)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Fuel className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">연료</p>
                  <p className="font-bold text-gray-900">{car.fuel}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Settings className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">변속기</p>
                  <p className="font-bold text-gray-900">{car.transmission}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <MapPin className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">지역</p>
                  <p className="font-bold text-gray-900">{car.location}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Building2 className="h-5 w-5 text-[#0a4d0e]" />
                  <p className="mt-2 text-sm text-gray-500">매장</p>
                  <p className="font-bold text-gray-900 text-sm">{car.dealerName}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 오른쪽: 가격 및 문의 */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-20 space-y-6"
            >
              {/* 가격 카드 */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-3 py-1 text-sm font-medium text-[#0a4d0e]">
                  {car.manufacturer}
                </span>
                <h1 className="mt-3 text-xl font-bold text-gray-900 leading-tight">
                  {car.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{car.class}</p>

                <div className="mt-6 border-t pt-6">
                  <p className="text-sm text-gray-500">판매가격</p>
                  <p className="text-3xl font-bold text-[#D4A843]">
                    {formatPrice(car.price)}
                  </p>
                </div>

                {/* 오토벨 링크 */}
                <a
                  href={`https://www.autobell.co.kr/buycar/detail?dlrPrdId=${car.prdId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d0e] py-4 font-semibold text-white transition-colors hover:bg-[#0d6611]"
                >
                  <ExternalLink className="h-5 w-5" />
                  오토벨에서 상세보기
                </a>
              </div>

              {/* 문의 카드 */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-gray-900">구매 문의</h3>
                <p className="mt-2 text-sm text-gray-500">
                  차량에 대해 궁금한 점이 있으시면 문의해주세요.
                </p>
                <div className="mt-4 space-y-3">
                  <a
                    href="tel:+82-10-1234-5678"
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                  >
                    <Phone className="h-5 w-5 text-[#0a4d0e]" />
                    <span className="text-sm font-medium">010-1234-5678</span>
                  </a>
                  <a
                    href="mailto:info@jungcar.com"
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                  >
                    <Mail className="h-5 w-5 text-[#0a4d0e]" />
                    <span className="text-sm font-medium">info@jungcar.com</span>
                  </a>
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] py-3 font-medium text-[#3C1E1E] transition-colors hover:bg-[#FDD800]">
                    <MessageCircle className="h-5 w-5" />
                    카카오톡 문의
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 추천 차량 */}
        {relatedCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl font-bold text-gray-900">
              {car.manufacturer} 추천 차량
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {relatedCars.map((relCar) => (
                <Link key={relCar.id} href={`/cars/${relCar.id}`}>
                  <div className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
                    <div className="aspect-[4/3] bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(relCar)}
                        alt={relCar.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/cars/default.jpg';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-gray-900 group-hover:text-[#0a4d0e]">
                        {relCar.model}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#D4A843]">
                        {formatPrice(relCar.price)}
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
