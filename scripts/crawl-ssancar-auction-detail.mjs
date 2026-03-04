#!/usr/bin/env node
/**
 * SSANCAR 경매 차량 상세 크롤러
 * - 경매 차량 10대의 상세 정보 및 모든 이미지 크롤링
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

// ============ 설정 ============
const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars/ssancar-auction';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/ssancar-auction.json`;

const CAR_COUNT = 10;
const MAX_RETRIES = 3;
const MAX_IMAGES_PER_CAR = 10;

const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 }
};
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

async function processImage(buffer, filename) {
  const results = {};

  try {
    const thumbPath = path.join(OUTPUT_DIR, `${filename}_thumb.jpg`);
    await sharp(buffer)
      .resize(SIZES.thumb.width, SIZES.thumb.height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    results.thumb = `/images/cars/ssancar-auction/${filename}_thumb.jpg`;

    const mainPath = path.join(OUTPUT_DIR, `${filename}_main.jpg`);
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mainPath);
    results.main = `/images/cars/ssancar-auction/${filename}_main.jpg`;
  } catch (err) {
    // Ignore
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('SSANCAR 경매 차량 상세 크롤러');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('\n[1단계] SSANCAR 경매 페이지 접속...');

  await page.goto('https://www.ssancar.com/bbs/board.php?bo_table=list', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await delay(5000);

  // 목록에서 차량 기본 정보 및 상세 URL 추출
  console.log('\n[2단계] 차량 목록 파싱...');

  const carList = await page.evaluate((maxCars) => {
    const carItems = document.querySelectorAll('.car_list > li');
    const cars = [];

    for (let idx = 0; idx < Math.min(carItems.length, maxCars); idx++) {
      const item = carItems[idx];
      const link = item.querySelector('a');
      const nameEl = item.querySelector('.name');
      const stockNoEl = item.querySelector('.tit .num');
      const priceEl = item.querySelector('.money .num');
      const detailEl = item.querySelector('.detail li');

      const href = link?.getAttribute('href') || '';
      const carNoMatch = href.match(/car_no=(\d+)/);
      const carNo = carNoMatch ? carNoMatch[1] : null;

      if (!carNo) continue;

      const stockNo = stockNoEl?.textContent?.trim() || `${idx + 1}`;
      const name = nameEl?.textContent?.trim() || 'Unknown';

      const priceText = priceEl?.textContent?.trim() || '0';
      const priceMatch = priceText.replace(/[,\s]/g, '').match(/(\d+)/);
      const priceUSD = priceMatch ? parseInt(priceMatch[1]) : 0;
      const price = Math.round(priceUSD * 1300 / 10000);

      const spans = detailEl?.querySelectorAll('span') || [];
      let year = '2020', mileage = 0, fuel = 'Gasoline', transmission = 'Automatic', color = '';

      spans.forEach(span => {
        const text = span.textContent?.trim() || '';
        if (text.match(/^\d{4}$/)) year = text;
        else if (text.includes('Km') || text.includes('km')) {
          const kmMatch = text.replace(/[,\s]/g, '').match(/(\d+)/);
          if (kmMatch) mileage = parseInt(kmMatch[1]);
        }
        else if (['Gasoline', 'Diesel', 'LPG', 'Electric', 'Hybrid'].some(f => text.includes(f))) fuel = text;
        else if (text.includes('Automatic') || text.includes('Manual')) transmission = text;
        else if (['Gray', 'Black', 'White', 'Pearl', 'Silver', 'Blue', 'Red'].some(c => text.includes(c))) color = text;
      });

      let manufacturer = '기타';
      const mfMap = {
        'GENESIS': '제네시스', 'G80': '제네시스', 'G90': '제네시스', 'GV': '제네시스',
        'GRANDEUR': '현대', 'SONATA': '현대', 'AVANTE': '현대', 'TUCSON': '현대', 'SANTA': '현대', 'PALISADE': '현대', 'STARIA': '현대', 'IONIQ': '현대',
        'K5': '기아', 'K7': '기아', 'K8': '기아', 'K9': '기아', 'SORENTO': '기아', 'SPORTAGE': '기아', 'CARNIVAL': '기아', 'EV6': '기아',
        'QM': '르노', 'SM': '르노',
        'TESLA': '테슬라', 'BMW': 'BMW', 'BENZ': '벤츠', 'AUDI': '아우디'
      };
      for (const [kw, brand] of Object.entries(mfMap)) {
        if (name.toUpperCase().includes(kw)) { manufacturer = brand; break; }
      }

      cars.push({
        carNo, stockNo, name, manufacturer, year, mileage, fuel, transmission, color, price, priceUSD,
        detailUrl: href.startsWith('http') ? href : `https://www.ssancar.com${href}`
      });
    }

    return cars;
  }, CAR_COUNT);

  console.log(`  ${carList.length}대 차량 파싱 완료`);

  // 각 차량 상세 페이지 방문하여 이미지 추출
  console.log('\n[3단계] 상세 페이지에서 이미지 수집...');

  const processedCars = [];

  for (let i = 0; i < carList.length; i++) {
    const car = carList[i];
    console.log(`\n  [${i + 1}/${carList.length}] ${car.name}`);
    console.log(`    상세 페이지: ${car.detailUrl}`);

    try {
      await page.goto(car.detailUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await delay(2000);

      // 상세 페이지에서 이미지 URL 추출
      const detailData = await page.evaluate((maxImages) => {
        const images = [...document.querySelectorAll('img')]
          .map(img => img.src)
          .filter(src => src.includes('lotteautoauction') && src.includes('AU_CAR_IMG'))
          .slice(0, maxImages);

        // VIN, 차량번호 등 추가 정보
        const bodyText = document.body.innerText;
        const vinMatch = bodyText.match(/[A-Z0-9]{17}/);

        return {
          images: [...new Set(images)], // 중복 제거
          vin: vinMatch ? vinMatch[0] : null
        };
      }, MAX_IMAGES_PER_CAR);

      console.log(`    이미지 ${detailData.images.length}개 발견`);

      // 이미지 다운로드
      const downloadedImages = [];
      const downloadedThumbs = [];

      for (let imgIdx = 0; imgIdx < detailData.images.length; imgIdx++) {
        const imgUrl = detailData.images[imgIdx];
        const filename = `auction_${i + 1}_${imgIdx + 1}`;

        try {
          const buffer = await downloadImage(imgUrl);
          const processed = await processImage(buffer, filename);

          if (processed.main) downloadedImages.push(processed.main);
          if (processed.thumb) downloadedThumbs.push(processed.thumb);

          process.stdout.write(`    이미지 ${imgIdx + 1}/${detailData.images.length} 다운로드 완료\r`);
        } catch (err) {
          // Skip failed image
        }
      }

      console.log(`    총 ${downloadedImages.length}개 이미지 저장 완료`);

      processedCars.push({
        id: 20000 + i + 1,
        stockNo: car.stockNo,
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
        color: car.color,
        price: car.price,
        priceUSD: car.priceUSD,
        location: 'SSANCAR Auction',
        dealerName: 'SSANCAR',
        description: `SSANCAR 경매 차량 (Stock No. ${car.stockNo})`,
        img: downloadedThumbs[0] || '/images/cars/default.jpg',
        images: downloadedImages,
        thumbs: downloadedThumbs,
        originalImages: detailData.images,
        vin: detailData.vin,
        source: 'ssancar-auction',
        type: 'auction',
        detailUrl: car.detailUrl
      });

    } catch (err) {
      console.log(`    오류: ${err.message}`);
      // 기본 정보만 저장
      processedCars.push({
        id: 20000 + i + 1,
        stockNo: car.stockNo,
        prdId: car.carNo,
        crId: car.carNo,
        name: car.name,
        manufacturer: car.manufacturer,
        year: car.year,
        mileage: car.mileage,
        transmission: car.transmission,
        fuel: car.fuel,
        color: car.color,
        price: car.price,
        priceUSD: car.priceUSD,
        location: 'SSANCAR Auction',
        dealerName: 'SSANCAR',
        description: `SSANCAR 경매 차량 (Stock No. ${car.stockNo})`,
        img: '/images/cars/default.jpg',
        images: [],
        thumbs: [],
        source: 'ssancar-auction',
        type: 'auction',
        detailUrl: car.detailUrl
      });
    }
  }

  await browser.close();

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

  // 통계
  const totalImages = processedCars.reduce((sum, car) => sum + car.images.length, 0);

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`총 차량: ${processedCars.length}대`);
  console.log(`총 이미지: ${totalImages}개`);
  console.log(`저장 위치: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
