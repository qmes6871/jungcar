'use client';

import { useEffect, useState } from 'react';

// 허용된 IP 목록 (국내여도 접속 허용)
const ALLOWED_IPS = ['59.7.56.21'];

export default function GeoBlock() {
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkCountry() {
      try {
        // api.country.is - 무료, 빠름, 국가 코드와 IP 반환
        const res = await fetch('https://api.country.is/', {
          cache: 'no-store',
        });
        const data = await res.json();

        // 허용된 IP는 차단하지 않음
        if (ALLOWED_IPS.includes(data.ip)) {
          setBlocked(false);
        } else if (data.country === 'KR') {
          setBlocked(true);
        }
      } catch (error) {
        // API 오류 시 차단하지 않음
        console.error('GeoIP check failed:', error);
      } finally {
        setChecking(false);
      }
    }

    checkCountry();
  }, []);

  if (checking) {
    return null; // 체크 중에는 아무것도 표시하지 않음
  }

  if (blocked) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0a4d0e] to-[#1a6b1e]">
        <div className="text-center px-6 max-w-md">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-3xl font-bold text-[#D4A843] mb-4">
            Access Restricted
          </h1>
          <p className="text-white/90 text-lg mb-2">
            This service is not available in your region.
          </p>
          <p className="text-white/70">
            해당 서비스는 국내에서 이용하실 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
