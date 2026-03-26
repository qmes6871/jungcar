#!/usr/bin/env node
/**
 * SSANCAR Stock 차량 크롤러
 * - ssancar.com의 일반차량(Stock) 크롤링
 * - 페이지네이션 URL 방식으로 크롤링
 */

import { chromium } from 'playwright';
import fs from 'fs';

// ============ 설정 ============
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/ssancar-stock.json`;
const CARS_PER_PAGE = 15;
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 1000; // 1000대마다 중간 저장
const TARGET_COUNT = 56502; // 크롤링 목표 대수 (기존 46,502 + 10,000)
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('='.repeat(60));
  console.log('SSANCAR Stock 차량 전체 크롤러');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 기존 데이터 로드 (이어서 크롤링)
  let allCars = [];
  let startPage = 1;

  if (fs.existsSync(OUTPUT_JSON)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf8'));
      if (existingData.cars && existingData.cars.length > 0) {
        // 기존 데이터를 allCars 형식으로 변환
        allCars = existingData.cars.map(car => ({
          carNo: car.prdId,
          name: car.name,
          manufacturer: car.manufacturer,
          year: car.year,
          mileage: car.mileage,
          fuel: car.fuel,
          transmission: car.transmission,
          priceUSD: car.priceUSD,
          imgUrl: car.img === '/images/placeholder-car.jpg' ? '' : car.img,
          detailUrl: car.detailUrl
        }));
        startPage = Math.floor(allCars.length / CARS_PER_PAGE) + 1;
        console.log(`\n[이어서 크롤링] 기존 ${allCars.length.toLocaleString()}대 로드, ${startPage}페이지부터 재개`);
      }
    } catch (e) {
      console.log('[기존 데이터 없음] 처음부터 크롤링 시작');
    }
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('\n[1단계] SSANCAR Stock 페이지 접속...');

  await page.goto('https://www.ssancar.com/page/stock_list.php', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await delay(3000);

  // 총 차량 수 확인
  const totalCount = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const countMatch = bodyText.match(/([\d,]+)\s*,?\s*car/i);
    if (countMatch) {
      return parseInt(countMatch[1].replace(/,/g, ''));
    }
    return 0;
  });

  const targetPages = Math.ceil(TARGET_COUNT / CARS_PER_PAGE);
  console.log(`  총 차량: ${totalCount.toLocaleString()}대`);
  console.log(`  목표 크롤링: ${TARGET_COUNT.toLocaleString()}대 (${targetPages.toLocaleString()} 페이지)`);

  console.log('\n[2단계] 페이지 크롤링 시작...');
  console.log(`  시작 페이지: ${startPage.toLocaleString()}`);

  for (let pageNum = startPage; pageNum <= targetPages; pageNum++) {
    // 목표 대수 도달시 중단
    if (allCars.length >= TARGET_COUNT) {
      console.log(`  목표 대수 ${TARGET_COUNT.toLocaleString()}대 도달! 크롤링 완료.`);
      break;
    }
    let retries = 0;
    let success = false;

    while (!success && retries < MAX_RETRIES) {
      try {
        if (pageNum > 1) {
          await page.goto(`https://www.ssancar.com/page/stock_list.php?page=${pageNum}`, {
            waitUntil: 'networkidle',
            timeout: 30000
          });
          await delay(500);
        }

        const cars = await page.evaluate(() => {
          const items = document.querySelectorAll('.car_list > li');
          const result = [];

          items.forEach((item) => {
            const link = item.querySelector('a');
            const img = item.querySelector('img');
            const nameEl = item.querySelector('.name');
            const priceEl = item.querySelector('.money .num');
            const detailEl = item.querySelector('.detail li');

            const href = link?.getAttribute('href') || '';
            const cNoMatch = href.match(/c_no=(\d+)/);
            const carNo = cNoMatch ? cNoMatch[1] : '';

            if (!carNo) return;

            let imgUrl = img?.getAttribute('src') || '';
            if (imgUrl.includes('no_image')) imgUrl = '';

            const name = nameEl?.textContent?.trim() || '';
            if (!name) return;

            const priceText = priceEl?.textContent?.trim() || '0';
            const priceMatch = priceText.replace(/[,\s]/g, '').match(/(\d+)/);
            const priceUSD = priceMatch ? parseInt(priceMatch[1]) : 0;

            const spans = detailEl?.querySelectorAll('span') || [];
            let year = '';
            let mileage = 0;
            let fuel = '';
            let transmission = '';

            spans.forEach(span => {
              const t = span.textContent?.trim() || '';
              if (t.match(/^\d{4}$/)) year = t;
              else if (t.includes('km')) {
                const km = t.replace(/[,\s]/g, '').match(/(\d+)/);
                if (km) mileage = parseInt(km[1]);
              }
              else if (['Gasoline', 'Diesel', 'LPG', 'Electric', 'Hybrid'].some(f => t.includes(f))) fuel = t;
              else if (t.includes('Automatic') || t.includes('Manual')) transmission = t;
            });

            let manufacturer = 'Other';
            const nameUpper = name.toUpperCase();
            const brands = {
              'GENESIS': 'Genesis', 'G80': 'Genesis', 'G90': 'Genesis', 'GV': 'Genesis',
              'GRANDEUR': 'Hyundai', 'SONATA': 'Hyundai', 'AVANTE': 'Hyundai', 'TUCSON': 'Hyundai',
              'SANTA': 'Hyundai', 'PALISADE': 'Hyundai', 'STARIA': 'Hyundai', 'IONIQ': 'Hyundai',
              'KONA': 'Hyundai', 'PORTER': 'Hyundai', 'CASPER': 'Hyundai', 'VENUE': 'Hyundai',
              'K3': 'Kia', 'K5': 'Kia', 'K7': 'Kia', 'K8': 'Kia', 'K9': 'Kia',
              'SORENTO': 'Kia', 'SPORTAGE': 'Kia', 'CARNIVAL': 'Kia', 'MORNING': 'Kia',
              'RAY': 'Kia', 'EV6': 'Kia', 'EV9': 'Kia', 'NIRO': 'Kia', 'MOHAVE': 'Kia', 'SELTOS': 'Kia',
              'SM': 'Renault', 'QM': 'Renault',
              'TIVOLI': 'SsangYong', 'KORANDO': 'SsangYong', 'REXTON': 'SsangYong', 'TORRES': 'SsangYong',
              'BMW': 'BMW', 'BENZ': 'Mercedes-Benz', 'MERCEDES': 'Mercedes-Benz',
              'AUDI': 'Audi', 'VOLKSWAGEN': 'Volkswagen', 'PORSCHE': 'Porsche', 'VOLVO': 'Volvo',
              'TOYOTA': 'Toyota', 'LEXUS': 'Lexus', 'HONDA': 'Honda',
              'CHEVROLET': 'Chevrolet', 'FORD': 'Ford', 'JEEP': 'Jeep',
              'HYUNDAI': 'Hyundai', 'KIA': 'Kia'
            };

            for (const [kw, br] of Object.entries(brands)) {
              if (nameUpper.includes(kw)) { manufacturer = br; break; }
            }

            result.push({
              carNo, name, manufacturer, year, mileage, fuel, transmission, priceUSD, imgUrl,
              detailUrl: href.startsWith('http') ? href : `https://www.ssancar.com${href}`
            });
          });

          return result;
        });

        allCars.push(...cars);
        success = true;

        if (pageNum % 100 === 0 || pageNum === 1 || pageNum === targetPages) {
          console.log(`  [${pageNum.toLocaleString()}/${targetPages.toLocaleString()}] 누적: ${allCars.length.toLocaleString()}대`);
        }

      } catch (err) {
        retries++;
        console.error(`  페이지 ${pageNum} 실패 (${retries}/${MAX_RETRIES}): ${err.message}`);
        await delay(2000);
      }
    }

    // 중간 저장
    if (allCars.length > 0 && allCars.length % SAVE_INTERVAL < CARS_PER_PAGE) {
      const tempOutput = {
        crawledAt: new Date().toISOString(),
        totalCount: allCars.length,
        source: 'ssancar.com',
        type: 'stock',
        status: 'in_progress',
        cars: allCars.map((car, index) => ({
          id: index + 1,
          prdId: car.carNo,
          crId: car.carNo,
          name: car.name,
          manufacturer: car.manufacturer,
          model: car.name,
          year: car.year,
          mileage: car.mileage,
          transmission: car.transmission,
          fuel: car.fuel,
          price: car.priceUSD,
          priceUSD: car.priceUSD,
          location: 'SSANCAR Stock',
          img: car.imgUrl || '/images/placeholder-car.jpg',
          images: car.imgUrl ? [car.imgUrl] : [],
          source: 'ssancar',
          type: 'stock',
          detailUrl: car.detailUrl
        }))
      };
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(tempOutput, null, 2));
      console.log(`  [중간저장] ${allCars.length.toLocaleString()}대`);
    }
  }

  await browser.close();

  // 목표 대수만큼 자르기
  const finalCars = allCars.slice(0, TARGET_COUNT);
  console.log(`\n  총 ${finalCars.length.toLocaleString()}대 크롤링 완료`);

  // 데이터 가공
  console.log('\n[3단계] 데이터 가공...');

  const processedCars = finalCars.map((car, index) => ({
    id: index + 1,
    prdId: car.carNo,
    crId: car.carNo,
    name: car.name,
    manufacturer: car.manufacturer,
    model: car.name,
    year: car.year,
    mileage: car.mileage,
    transmission: car.transmission,
    fuel: car.fuel,
    price: car.priceUSD,
    priceUSD: car.priceUSD,
    location: 'SSANCAR Stock',
    img: car.imgUrl || '/images/placeholder-car.jpg',
    images: car.imgUrl ? [car.imgUrl] : [],
    source: 'ssancar',
    type: 'stock',
    detailUrl: car.detailUrl
  }));

  // JSON 저장
  console.log('\n[4단계] 데이터 저장...');

  const output = {
    crawledAt: new Date().toISOString(),
    totalCount: processedCars.length,
    source: 'ssancar.com',
    type: 'stock',
    cars: processedCars
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`총 Stock 차량: ${processedCars.length.toLocaleString()}대`);
  console.log(`저장 위치: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
