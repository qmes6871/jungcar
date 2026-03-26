#!/usr/bin/env node
/**
 * SSANCAR Stock 차량 크롤러 (Ajax API 버전)
 * - ajax_car_list.php API 사용
 */

import * as cheerio from 'cheerio';
import fs from 'fs';

// ============ 설정 ============
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/ssancar-stock.json`;
const CARS_PER_PAGE = 15;
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 500;
const TARGET_COUNT = 65000;
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function parseCarsFromAjax(html) {
  const $ = cheerio.load(`<ul>${html}</ul>`);
  const cars = [];

  $('li').each((_, item) => {
    const $item = $(item);
    const link = $item.find('a');
    const img = $item.find('img');
    const nameSpan = $item.find('.tit .name');
    const priceEl = $item.find('.money .num');
    const detailLi = $item.find('.detail li');

    const href = link.attr('href') || '';
    const cNoMatch = href.match(/c_no=(\d+)/);
    const carNo = cNoMatch ? cNoMatch[1] : '';

    if (!carNo) return;

    let imgUrl = img.attr('src') || '';
    if (imgUrl.includes('no_image')) imgUrl = '';

    const name = nameSpan.text().trim();
    if (!name) return;

    const priceText = priceEl.text().trim() || '0';
    const priceMatch = priceText.replace(/[,\s]/g, '').match(/(\d+)/);
    const priceUSD = priceMatch ? parseInt(priceMatch[1]) : 0;

    // 상세 정보 파싱
    const detailText = detailLi.text();
    const spans = detailLi.find('span');
    let year = '';
    let mileage = 0;
    let fuel = '';
    let transmission = '';

    spans.each((_, span) => {
      const t = $(span).text().trim();
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
      'BONGO': 'Kia',
      'SM': 'Renault', 'QM': 'Renault', 'RENAULT': 'Renault',
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

    cars.push({
      carNo, name, manufacturer, year, mileage, fuel, transmission, priceUSD, imgUrl,
      detailUrl: href.startsWith('http') ? href : `https://www.ssancar.com${href}`
    });
  });

  return cars;
}

async function fetchPage(pageNum) {
  const response = await fetch('https://www.ssancar.com/page/ajax_car_list.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*',
      'Origin': 'https://www.ssancar.com',
      'Referer': 'https://www.ssancar.com/page/stock_list.php'
    },
    body: `pages=${pageNum}&list=${CARS_PER_PAGE}`
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.text();
}

async function main() {
  console.log('='.repeat(60));
  console.log('SSANCAR Stock 차량 크롤러 (Ajax API 버전)');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 기존 데이터 로드
  let allCars = [];
  let existingCarNos = new Set();
  let startPage = 0;

  if (fs.existsSync(OUTPUT_JSON)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf8'));
      if (existingData.cars && existingData.cars.length > 0) {
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

        allCars.forEach(car => existingCarNos.add(car.carNo));
        startPage = Math.floor(allCars.length / CARS_PER_PAGE);
        console.log(`\n[이어서 크롤링] 기존 ${allCars.length.toLocaleString()}대 로드, ${startPage}페이지부터 재개`);
      }
    } catch (e) {
      console.log('[기존 데이터 없음] 처음부터 크롤링 시작');
    }
  }

  const targetPages = Math.ceil(TARGET_COUNT / CARS_PER_PAGE);
  console.log(`  목표: ${TARGET_COUNT.toLocaleString()}대`);
  console.log(`  시작 페이지: ${startPage}`);

  let emptyPageCount = 0;
  const MAX_EMPTY_PAGES = 10;
  let lastSaveCount = allCars.length;

  for (let pageNum = startPage; pageNum <= targetPages; pageNum++) {
    if (allCars.length >= TARGET_COUNT) {
      console.log(`\n  목표 대수 ${TARGET_COUNT.toLocaleString()}대 도달!`);
      break;
    }

    if (emptyPageCount >= MAX_EMPTY_PAGES) {
      console.log(`\n  연속 ${MAX_EMPTY_PAGES}페이지 빈 데이터, 종료.`);
      break;
    }

    let retries = 0;
    let success = false;

    while (!success && retries < MAX_RETRIES) {
      try {
        const html = await fetchPage(pageNum);
        const cars = parseCarsFromAjax(html);

        const newCars = cars.filter(car => !existingCarNos.has(car.carNo));
        newCars.forEach(car => existingCarNos.add(car.carNo));
        allCars.push(...newCars);
        success = true;

        if (cars.length === 0) {
          emptyPageCount++;
        } else {
          emptyPageCount = 0;
        }

        if (pageNum % 100 === 0 || pageNum === startPage) {
          console.log(`  [페이지 ${pageNum.toLocaleString()}] 누적: ${allCars.length.toLocaleString()}대 (+${newCars.length})`);
        }

        await delay(80);

      } catch (err) {
        retries++;
        console.error(`  페이지 ${pageNum} 실패 (${retries}/${MAX_RETRIES}): ${err.message}`);
        await delay(2000);
      }
    }

    // 중간 저장 (500대마다)
    if (allCars.length - lastSaveCount >= SAVE_INTERVAL) {
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
      console.log(`  [저장] ${allCars.length.toLocaleString()}대`);
      lastSaveCount = allCars.length;
    }
  }

  const finalCars = allCars.slice(0, TARGET_COUNT);
  console.log(`\n  총 ${finalCars.length.toLocaleString()}대 크롤링 완료`);

  // 최종 저장
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
  console.log(`저장: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
