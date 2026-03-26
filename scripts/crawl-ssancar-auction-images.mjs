#!/usr/bin/env node
/**
 * SSANCAR 경매 차량 이미지 크롤러
 * - 기존 경매 데이터에서 상세페이지 방문하여 모든 이미지 URL 수집
 */

import * as cheerio from 'cheerio';
import fs from 'fs';

// ============ 설정 ============
const DATA_DIR = '/var/www/Jungcar/public/data';
const INPUT_JSON = `${DATA_DIR}/ssancar-auction.json`;
const OUTPUT_JSON = `${DATA_DIR}/ssancar-auction.json`;
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 100;
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchDetailPage(url, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Referer': 'https://www.ssancar.com/'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (err) {
    if (retries > 0) {
      await delay(1000);
      return fetchDetailPage(url, retries - 1);
    }
    throw err;
  }
}

function extractImages(html) {
  // sellcarauction 이미지 URL 추출 (중복 제거)
  const imageRegex = /http:\/\/www\.sellcarauction\.co\.kr\/[^"'\s]+\.(jpg|jpeg|png|JPG|JPEG|PNG)/gi;
  const matches = html.match(imageRegex) || [];

  // 중복 제거 및 _M 썸네일 제외 (원본 이미지만)
  const uniqueImages = [...new Set(matches)]
    .filter(url => !url.includes('_M.jpg') && !url.includes('_S.jpg'))
    .slice(0, 20); // 최대 20장

  return uniqueImages;
}

async function main() {
  console.log('='.repeat(60));
  console.log('SSANCAR 경매 차량 이미지 크롤러');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  // 기존 데이터 로드
  if (!fs.existsSync(INPUT_JSON)) {
    console.error('경매 데이터 파일을 찾을 수 없습니다:', INPUT_JSON);
    process.exit(1);
  }

  const auctionData = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));
  const cars = auctionData.cars;

  console.log(`\n총 ${cars.length.toLocaleString()}대 차량 이미지 크롤링 시작`);

  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let totalImages = 0;

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];

    // 이미 여러 이미지가 있으면 스킵
    if (car.images && car.images.length > 1) {
      processedCount++;
      continue;
    }

    const detailUrl = car.detailUrl;
    if (!detailUrl) {
      processedCount++;
      continue;
    }

    try {
      const html = await fetchDetailPage(detailUrl);
      const images = extractImages(html);

      if (images.length > 0) {
        car.images = images;
        car.img = images[0];
        successCount++;
        totalImages += images.length;
      }

      processedCount++;

      if (processedCount % 50 === 0 || processedCount === 1) {
        console.log(`  [${processedCount.toLocaleString()}/${cars.length.toLocaleString()}] ${car.name.substring(0, 30)}... => ${images.length}장`);
      }

      // 속도 제한
      await delay(100);

    } catch (err) {
      errorCount++;
      processedCount++;
      if (errorCount % 10 === 0) {
        console.log(`  오류 ${errorCount}개: ${err.message}`);
      }
    }

    // 중간 저장
    if (processedCount % SAVE_INTERVAL === 0) {
      const tempOutput = {
        ...auctionData,
        crawledAt: new Date().toISOString(),
        status: 'in_progress',
        cars: cars
      };
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(tempOutput, null, 2));
      console.log(`  [저장] ${processedCount.toLocaleString()}대 처리됨`);
    }
  }

  // 최종 저장
  const finalOutput = {
    crawledAt: new Date().toISOString(),
    totalCount: cars.length,
    source: 'ssancar.com',
    type: 'auction',
    cars: cars
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(finalOutput, null, 2));

  // 통계
  const avgImages = successCount > 0 ? (totalImages / successCount).toFixed(1) : 0;

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`총 차량: ${cars.length.toLocaleString()}대`);
  console.log(`이미지 업데이트: ${successCount.toLocaleString()}대`);
  console.log(`총 이미지: ${totalImages.toLocaleString()}장 (평균 ${avgImages}장/대)`);
  console.log(`오류: ${errorCount}건`);
  console.log(`저장: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
