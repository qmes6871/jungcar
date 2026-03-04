#!/usr/bin/env node
/**
 * SSANCAR 경매 차량 전체 크롤러
 * - ssancar.com의 모든 경매차량 크롤링 (1,830대+)
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// ============ 설정 ============
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/ssancar-auction.json`;
const CARS_PER_PAGE = 15;
const MAX_RETRIES = 3;
const CONCURRENT_LIMIT = 5; // 동시 처리 수
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('='.repeat(60));
  console.log('SSANCAR 경매 차량 전체 크롤러');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const allCars = [];

  console.log('\n[1단계] SSANCAR 경매 페이지 접속...');

  await page.goto('https://www.ssancar.com/bbs/board.php?bo_table=list', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await delay(3000);

  // 총 차량 수 확인
  const totalCount = await page.evaluate(() => {
    const el = document.querySelector('.count');
    if (el) {
      const text = el.textContent.replace(/[,\s]/g, '');
      const match = text.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  });

  const totalPages = Math.ceil(totalCount / CARS_PER_PAGE);
  console.log(`  총 차량: ${totalCount}대`);
  console.log(`  총 페이지: ${totalPages}페이지`);

  // 모든 페이지 크롤링
  console.log('\n[2단계] 모든 페이지 크롤링...');

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    try {
      if (pageNum > 1) {
        await page.goto(`https://www.ssancar.com/bbs/board.php?bo_table=list&page=${pageNum}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        await delay(1500);
      }

      const cars = await page.evaluate((pageNum) => {
        const carList = document.querySelector('.car_list');
        if (!carList) return [];

        const items = carList.querySelectorAll(':scope > li');
        const result = [];

        items.forEach((item, idx) => {
          const link = item.querySelector('a');
          const img = item.querySelector('img');
          const text = item.innerText || '';

          const href = link?.href || '';
          const carNoMatch = href.match(/car_no=(\d+)/);
          const carNo = carNoMatch ? carNoMatch[1] : `${pageNum}_${idx + 1}`;

          // Stock NO 추출
          const stockMatch = text.match(/Stock NO\.\s*(\d+)/i);
          const stockNo = stockMatch ? stockMatch[1] : '';

          // 이미지 URL
          let imgUrl = img?.src || '';

          // 차량명 추출 (Stock NO 다음 줄)
          const lines = text.split('\n').map(l => l.trim()).filter(l => l);
          let name = '';
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('Stock NO')) {
              name = lines[i + 1] || 'Unknown';
              break;
            }
          }

          // 연도, 주행거리, 변속기 추출 (예: "2023 61,421km Automatic")
          const infoMatch = text.match(/(\d{4})\s+([\d,]+)\s*km\s+(Automatic|Manual)/i);
          const year = infoMatch ? infoMatch[1] : '';
          const mileage = infoMatch ? parseInt(infoMatch[2].replace(/,/g, '')) : 0;
          const transmission = infoMatch ? infoMatch[3] : '';

          // 연료 추출
          let fuel = '';
          if (text.includes('Diesel')) fuel = 'Diesel';
          else if (text.includes('Gasoline')) fuel = 'Gasoline';
          else if (text.includes('LPG')) fuel = 'LPG';
          else if (text.includes('Electric')) fuel = 'Electric';
          else if (text.includes('Hybrid')) fuel = 'Hybrid';

          // 색상 추출
          const colorMatch = text.match(/(White|Black|Silver|Gray|Grey|Blue|Red|Brown|Green|Beige|Pearl)/i);
          const color = colorMatch ? colorMatch[1] : '';

          // 가격 추출 (예: "Bid 15,603$~")
          const priceMatch = text.match(/Bid\s+([\d,]+)\s*\$/i);
          const priceUSD = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;

          // 제조사 추출
          let manufacturer = 'Other';
          const nameUpper = name.toUpperCase();
          const brandMap = {
            'GENESIS': 'Genesis', 'G80': 'Genesis', 'G90': 'Genesis', 'GV60': 'Genesis', 'GV70': 'Genesis', 'GV80': 'Genesis',
            'GRANDEUR': 'Hyundai', 'SONATA': 'Hyundai', 'AVANTE': 'Hyundai', 'TUCSON': 'Hyundai', 'SANTA': 'Hyundai',
            'PALISADE': 'Hyundai', 'STARIA': 'Hyundai', 'IONIQ': 'Hyundai', 'KONA': 'Hyundai', 'VENUE': 'Hyundai', 'PORTER': 'Hyundai',
            'K3': 'Kia', 'K5': 'Kia', 'K7': 'Kia', 'K8': 'Kia', 'K9': 'Kia',
            'SORENTO': 'Kia', 'SPORTAGE': 'Kia', 'CARNIVAL': 'Kia', 'MORNING': 'Kia', 'RAY': 'Kia', 'EV6': 'Kia', 'EV9': 'Kia', 'NIRO': 'Kia',
            'MOHAVE': 'Kia', 'BONGO': 'Kia', 'SELTOS': 'Kia',
            'SM': 'Renault', 'QM': 'Renault', 'XM': 'Renault',
            'TIVOLI': 'SsangYong', 'KORANDO': 'SsangYong', 'REXTON': 'SsangYong', 'TORRES': 'SsangYong',
            'BMW': 'BMW', 'BENZ': 'Mercedes-Benz', 'MERCEDES': 'Mercedes-Benz',
            'AUDI': 'Audi', 'VOLKSWAGEN': 'Volkswagen', 'PORSCHE': 'Porsche',
            'TOYOTA': 'Toyota', 'LEXUS': 'Lexus', 'HONDA': 'Honda',
            'CHEVROLET': 'Chevrolet', 'FORD': 'Ford', 'JEEP': 'Jeep', 'TAURUS': 'Ford'
          };

          for (const [keyword, brand] of Object.entries(brandMap)) {
            if (nameUpper.includes(keyword)) {
              manufacturer = brand;
              break;
            }
          }

          result.push({
            carNo,
            stockNo,
            name,
            manufacturer,
            year,
            mileage,
            fuel,
            transmission,
            color,
            priceUSD,
            imgUrl,
            detailUrl: href
          });
        });

        return result;
      }, pageNum);

      allCars.push(...cars);

      if (pageNum % 10 === 0 || pageNum === totalPages) {
        console.log(`  [${pageNum}/${totalPages}] 페이지 완료 - 누적: ${allCars.length}대`);
      }

    } catch (err) {
      console.error(`  페이지 ${pageNum} 크롤링 실패: ${err.message}`);
    }
  }

  await browser.close();

  console.log(`\n  총 ${allCars.length}대 크롤링 완료`);

  // 데이터 가공
  console.log('\n[3단계] 데이터 가공...');

  const processedCars = allCars.map((car, index) => ({
    id: index + 1,
    stockNo: car.stockNo,
    prdId: car.carNo,
    crId: car.carNo,
    name: car.name,
    manufacturer: car.manufacturer,
    model: car.name,
    year: car.year,
    mileage: car.mileage,
    transmission: car.transmission,
    fuel: car.fuel,
    color: car.color,
    price: car.priceUSD,
    priceUSD: car.priceUSD,
    location: 'SSANCAR Auction',
    img: car.imgUrl || '/Jungcar/images/placeholder-car.jpg',
    images: car.imgUrl ? [car.imgUrl] : [],
    source: 'ssancar',
    type: 'auction',
    detailUrl: car.detailUrl
  }));

  // JSON 저장
  console.log('\n[4단계] 데이터 저장...');

  const output = {
    crawledAt: new Date().toISOString(),
    totalCount: processedCars.length,
    source: 'ssancar.com',
    type: 'auction',
    cars: processedCars
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`총 경매 차량: ${processedCars.length}대`);
  console.log(`저장 위치: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
