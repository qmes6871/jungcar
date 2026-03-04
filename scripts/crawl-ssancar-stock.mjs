#!/usr/bin/env node
/**
 * SSANCAR Stock 차량 크롤러
 * - ssancar.com의 일반차량(Stock) 10대 크롤링
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

// ============ 설정 ============
const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars/ssancar';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/ssancar-stock.json`;

const CAR_COUNT = 10; // 크롤링할 차량 수
const MAX_RETRIES = 3;

// 이미지 크기 설정
const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 }
};
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 이미지 다운로드 함수
function downloadImage(url, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.ssancar.com/'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, retries).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });

    request.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => {
          downloadImage(url, retries - 1).then(resolve).catch(reject);
        }, 500);
      } else {
        reject(err);
      }
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// 이미지 리사이징 함수
async function processImage(buffer, carId) {
  const results = {};

  try {
    // 썸네일
    const thumbPath = path.join(OUTPUT_DIR, `${carId}_thumb.jpg`);
    await sharp(buffer)
      .resize(SIZES.thumb.width, SIZES.thumb.height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    results.thumb = `/images/cars/ssancar/${carId}_thumb.jpg`;

    // 메인
    const mainPath = path.join(OUTPUT_DIR, `${carId}_main.jpg`);
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mainPath);
    results.main = `/images/cars/ssancar/${carId}_main.jpg`;
  } catch (err) {
    console.error(`  이미지 처리 실패: ${err.message}`);
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('SSANCAR Stock 차량 크롤러');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  // 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('\n[1단계] SSANCAR 사이트 접속...');

  await page.goto('https://www.ssancar.com/page/stock_list.php', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await delay(3000);

  console.log('  현재 URL:', page.url());

  // 차량 목록 AJAX 호출
  console.log('\n[2단계] 차량 목록 API 호출...');

  const result = await page.evaluate(async (carCount) => {
    const formData = new FormData();
    formData.append('maker', '');
    formData.append('model', '');
    formData.append('gearbox', '');
    formData.append('fuel', '');
    formData.append('color', '');
    formData.append('yearFrom', '2010');
    formData.append('yearTo', '2026');
    formData.append('priceFrom', '0');
    formData.append('priceTo', '100000');
    formData.append('millageFrom', '0');
    formData.append('millageTo', '500000');
    formData.append('list', carCount.toString());
    formData.append('pages', '1');
    formData.append('sorts', 'upd');

    const res = await fetch('https://www.ssancar.com/page/ajax_car_list.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    return await res.text();
  }, CAR_COUNT);

  // 페이지에서 직접 차량 정보 추출
  console.log('\n[3단계] 페이지에서 차량 데이터 파싱...');

  const cars = await page.evaluate((maxCars) => {
    const carItems = document.querySelectorAll('.car_list > li');
    const carList = [];

    for (let idx = 0; idx < Math.min(carItems.length, maxCars); idx++) {
      const item = carItems[idx];
      const link = item.querySelector('a');
      const img = item.querySelector('.img_area img');
      const nameEl = item.querySelector('.name');
      const priceEl = item.querySelector('.money .num');
      const detailEl = item.querySelector('.detail li');

      // 차량 상세 페이지 URL에서 차량 번호 추출
      const href = link?.getAttribute('href') || '';
      const cNoMatch = href.match(/c_no=(\d+)/);
      const carNo = cNoMatch ? cNoMatch[1] : `ssancar_${idx + 1}`;

      // 이미지 URL
      let imgUrl = img?.getAttribute('src') || '';
      if (imgUrl.includes('no_image')) {
        imgUrl = '';
      }

      // 차량명
      const name = nameEl?.textContent?.trim() || 'Unknown';

      // 가격 (달러 -> 만원 변환: 대략 1300원 = 1달러, /10000 for 만원)
      const priceText = priceEl?.textContent?.trim() || '0';
      const priceMatch = priceText.replace(/[,\s]/g, '').match(/(\d+)/);
      const priceUSD = priceMatch ? parseInt(priceMatch[1]) : 0;
      const price = Math.round(priceUSD * 1300 / 10000); // 만원 단위

      // 기타 정보 파싱
      const detailText = detailEl?.textContent || '';
      const spans = detailEl?.querySelectorAll('span') || [];

      let year = '2020';
      let mileage = 0;
      let fuel = 'Gasoline';
      let transmission = 'Automatic';

      spans.forEach(span => {
        const text = span.textContent?.trim() || '';
        if (text.match(/^\d{4}$/)) {
          year = text;
        } else if (text.includes('km')) {
          const kmMatch = text.replace(/[,\s]/g, '').match(/(\d+)/);
          if (kmMatch) mileage = parseInt(kmMatch[1]);
        } else if (text.includes('Gasoline') || text.includes('Diesel') || text.includes('LPG') || text.includes('Electric') || text.includes('Hybrid')) {
          fuel = text;
        } else if (text.includes('Automatic') || text.includes('Manual')) {
          transmission = text;
        }
      });

      // 제조사 추출 (차량명에서)
      let manufacturer = '기타';
      const manufacturerMap = {
        'HYUNDAI': '현대',
        'KIA': '기아',
        'GENESIS': '제네시스',
        'BMW': 'BMW',
        'MERCEDES': '벤츠',
        'BENZ': '벤츠',
        'AUDI': '아우디',
        'VOLKSWAGEN': '폭스바겐',
        'VOLVO': '볼보',
        'LEXUS': '렉서스',
        'TOYOTA': '토요타',
        'HONDA': '혼다',
        'CHEVROLET': '쉐보레',
        'RENAULT': '르노',
        'SSANGYONG': 'KG모빌리티',
        'PORSCHE': '포르쉐',
        'TESLA': '테슬라',
        'JEEP': '지프',
        'LAND ROVER': '랜드로버',
        'FORD': '포드'
      };

      for (const [eng, kor] of Object.entries(manufacturerMap)) {
        if (name.toUpperCase().includes(eng)) {
          manufacturer = kor;
          break;
        }
      }

      carList.push({
        carNo,
        name,
        manufacturer,
        year,
        mileage,
        fuel,
        transmission,
        price,
        imgUrl,
        detailUrl: href.startsWith('http') ? href : `https://www.ssancar.com${href}`
      });
    }

    return carList;
  }, CAR_COUNT);

  console.log(`  ${cars.length}대 차량 파싱 완료`);

  await browser.close();

  // 이미지 다운로드 및 처리
  console.log('\n[4단계] 이미지 다운로드 및 리사이징...');

  const processedCars = [];

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const carId = `ssancar_${i + 1}`;

    console.log(`  [${i + 1}/${cars.length}] ${car.name}`);

    let images = { thumb: '', main: '' };

    if (car.imgUrl) {
      try {
        const buffer = await downloadImage(car.imgUrl);
        images = await processImage(buffer, carId);
        console.log(`    이미지 다운로드 성공`);
      } catch (err) {
        console.log(`    이미지 다운로드 실패: ${err.message}`);
      }
    }

    processedCars.push({
      id: 10000 + i + 1,  // 다른 차량과 ID 충돌 방지
      prdId: car.carNo,
      crId: car.carNo,
      name: car.name,
      plateNo: '',
      manufacturer: car.manufacturer,
      model: car.name,
      class: '',
      detailClass: null,
      year: car.year,
      regDate: '',
      mileage: car.mileage,
      transmission: car.transmission,
      fuel: car.fuel,
      price: car.price,
      location: 'SSANCAR',
      dealerName: 'SSANCAR',
      description: `SSANCAR Stock 차량`,
      img: images.thumb || '/images/cars/default.jpg',
      images: images.main ? [images.main] : [],
      thumbs: images.thumb ? [images.thumb] : [],
      originalImg: car.imgUrl,
      source: 'ssancar',
      detailUrl: car.detailUrl
    });
  }

  // JSON 저장
  console.log('\n[5단계] 데이터 저장...');

  const output = {
    crawledAt: new Date().toISOString(),
    totalCount: processedCars.length,
    source: 'ssancar.com',
    cars: processedCars
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`총 차량: ${processedCars.length}대`);
  console.log(`저장 위치: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
