#!/usr/bin/env node
/**
 * 오토벨 일반 판매 차량 크롤러 v2
 * - Puppeteer로 페이지 렌더링 후 데이터 추출
 * - 무한 스크롤 / 더보기 방식 지원
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

// ============ 설정 ============
const BASE_URL = 'https://www.autobell.co.kr';
const LIST_URL = 'https://www.autobell.co.kr/buycar/buyCarCertiList?tab=1';

const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/glovis-cars-detail.json`;
const PROGRESS_FILE = `${DATA_DIR}/autobell-progress.json`;

const DELAY_MS = 1000;
const IMAGE_DELAY_MS = 50;
const MAX_RETRIES = 3;
const SCROLL_PAUSE = 2000;
const MAX_SCROLL_ATTEMPTS = 200; // 최대 스크롤 시도

// 이미지 크기 설정
const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 },
  large: { width: 1600, height: 1200 }
};
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function saveProgress(data) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return null;
}

async function downloadImage(url, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': BASE_URL
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

async function processImage(buffer, carNo, imageIndex) {
  const results = {};
  const baseFilename = `${carNo}_${imageIndex}`;

  try {
    const thumbPath = path.join(OUTPUT_DIR, `${baseFilename}_thumb.jpg`);
    await sharp(buffer)
      .resize(SIZES.thumb.width, SIZES.thumb.height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    results.thumb = `/Jungcar/images/cars/${baseFilename}_thumb.jpg`;

    const mainPath = path.join(OUTPUT_DIR, `${baseFilename}_main.jpg`);
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mainPath);
    results.main = `/Jungcar/images/cars/${baseFilename}_main.jpg`;

    if (imageIndex === 0) {
      const largePath = path.join(OUTPUT_DIR, `${baseFilename}_large.jpg`);
      await sharp(buffer)
        .resize(SIZES.large.width, SIZES.large.height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(largePath);
      results.large = `/Jungcar/images/cars/${baseFilename}_large.jpg`;

      const defaultPath = path.join(OUTPUT_DIR, `${carNo}.jpg`);
      await sharp(buffer)
        .resize(800, 600, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toFile(defaultPath);
    }
  } catch (err) {
    // 무시
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('오토벨 일반 판매 차량 크롤러 v2');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const progress = loadProgress();
  let processedIds = new Set(progress?.processedIds || []);
  let allCars = progress?.cars || [];
  let totalImages = progress?.totalImages || 0;

  if (progress) {
    console.log(`\n이전 진행 상황에서 재개: ${allCars.length}대 완료`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // 이미지 요청 차단 (속도 향상)
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    console.log('\n[1단계] 페이지 로드...');
    await page.goto(LIST_URL, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(5000);

    // 페이지 정보 추출
    const pageInfo = await page.evaluate(() => {
      // __NUXT__ 데이터 확인
      const nuxt = window.__NUXT__;
      let totalCount = 7351;

      if (nuxt?.data) {
        for (const key in nuxt.data) {
          const d = nuxt.data[key];
          if (d?.autobellAndcarCount) {
            totalCount = parseInt(d.autobellAndcarCount) || 7351;
            break;
          }
        }
      }

      // 현재 보이는 차량 수
      const visibleCars = document.querySelectorAll('[class*="car-item"], [class*="vehicle"], [class*="product"]').length;

      return { totalCount, visibleCars };
    });

    console.log(`총 차량 수: ${pageInfo.totalCount}대`);
    console.log(`현재 보이는 차량: ${pageInfo.visibleCars}대\n`);

    // 무한 스크롤로 모든 차량 로드
    console.log('[2단계] 차량 목록 로드 중 (무한 스크롤)...\n');

    let previousCount = 0;
    let scrollAttempts = 0;
    let noChangeCount = 0;

    while (scrollAttempts < MAX_SCROLL_ATTEMPTS && noChangeCount < 5) {
      // 현재 차량 수 확인
      const currentCount = await page.evaluate(() => {
        return document.querySelectorAll('a[href*="/buycar/buyCarDetail/"], [class*="car-item"] a, [class*="product"] a').length;
      });

      if (currentCount === previousCount) {
        noChangeCount++;
      } else {
        noChangeCount = 0;
      }

      console.log(`  스크롤 ${scrollAttempts + 1}: ${currentCount}대 로드됨`);

      // "더보기" 버튼 클릭 시도
      const hasMoreButton = await page.evaluate(() => {
        const moreBtn = document.querySelector('button[class*="more"], [class*="load-more"], .btn-more');
        if (moreBtn && !moreBtn.disabled) {
          moreBtn.click();
          return true;
        }
        return false;
      });

      if (!hasMoreButton) {
        // 스크롤 다운
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      }

      await delay(SCROLL_PAUSE);
      previousCount = currentCount;
      scrollAttempts++;

      // 진행 상황 저장 (50번마다)
      if (scrollAttempts % 50 === 0) {
        console.log(`\n  [중간 저장] ${currentCount}대 로드됨\n`);
      }

      // 목표 도달 확인
      if (currentCount >= pageInfo.totalCount * 0.95) {
        console.log('\n  대부분의 차량이 로드되었습니다.');
        break;
      }
    }

    // 모든 차량 데이터 추출
    console.log('\n[3단계] 차량 데이터 추출...');

    const extractedCars = await page.evaluate((baseUrl) => {
      const cars = [];
      const seen = new Set();

      // 다양한 선택자 시도
      const selectors = [
        'a[href*="/buycar/buyCarDetail/"]',
        '[class*="car-item"]',
        '[class*="product-card"]',
        '[class*="vehicle-item"]'
      ];

      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach(el => {
          // 링크에서 ID 추출
          const link = el.tagName === 'A' ? el : el.querySelector('a[href*="buyCarDetail"]');
          if (!link) return;

          const href = link.getAttribute('href') || '';
          const idMatch = href.match(/buyCarDetail\/([^/?]+)/);
          const id = idMatch ? idMatch[1] : '';

          if (!id || seen.has(id)) return;
          seen.add(id);

          // 차량 정보 추출
          const container = el.closest('[class*="item"]') || el.closest('[class*="card"]') || el;

          const getText = (selector) => {
            const found = container.querySelector(selector);
            return found ? found.textContent?.trim() : '';
          };

          const getImg = () => {
            const img = container.querySelector('img[src*="autobell"], img[data-src], img');
            return img?.src || img?.getAttribute('data-src') || '';
          };

          // 차량 정보 파싱
          const nameEl = container.querySelector('[class*="name"], [class*="title"], h3, h4, strong');
          const priceEl = container.querySelector('[class*="price"]');
          const infoEls = container.querySelectorAll('[class*="info"] span, [class*="spec"] span');

          const info = Array.from(infoEls).map(s => s.textContent?.trim()).filter(Boolean);

          cars.push({
            id,
            name: nameEl?.textContent?.trim() || '',
            price: parseInt(priceEl?.textContent?.replace(/[^0-9]/g, '')) || null,
            imgSrc: getImg(),
            year: info.find(i => /^\d{4}$/.test(i)) || '',
            mileage: info.find(i => /km/i.test(i)) || '',
            fuel: info.find(i => /(가솔린|디젤|전기|하이브리드|LPG)/i.test(i)) || '',
            location: info.find(i => /(서울|경기|인천|부산|대구|광주|대전|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)/.test(i)) || '',
            url: href.startsWith('http') ? href : baseUrl + href
          });
        });
      }

      return cars;
    }, BASE_URL);

    console.log(`총 ${extractedCars.length}대 추출됨\n`);

    // 이미지 다운로드 및 리사이징
    console.log('[4단계] 이미지 다운로드 및 리사이징...\n');

    let processed = 0;
    for (const car of extractedCars) {
      if (processedIds.has(car.id)) continue;

      processed++;
      const carNo = String(allCars.length + 1);

      // 이미지 처리
      if (car.imgSrc && car.imgSrc.startsWith('http')) {
        try {
          const buffer = await downloadImage(car.imgSrc);
          const resized = await processImage(buffer, carNo, 0);

          if (resized.main) {
            car.img = resized.thumb || resized.main;
            car.images = [resized.main];
            car.thumbs = resized.thumb ? [resized.thumb] : [];
            totalImages++;
          }
        } catch (err) {
          car.img = `/Jungcar/images/cars/${carNo}.jpg`;
          car.images = [];
          car.thumbs = [];
        }
      } else {
        car.img = `/Jungcar/images/cars/${carNo}.jpg`;
        car.images = [];
        car.thumbs = [];
      }

      const carData = {
        id: car.id,
        no: carNo,
        name: car.name,
        status: '판매중',
        year: car.year,
        transmission: '',
        displacement: '',
        mileage: car.mileage,
        color: '',
        fuel: car.fuel,
        usage: '',
        grade: '',
        auctionRound: '',
        lane: '',
        plateNumber: '',
        location: car.location,
        price: car.price,
        hope: null,
        instant: null,
        img: car.img,
        images: car.images || [],
        thumbs: car.thumbs || [],
        url: car.url
      };

      allCars.push(carData);
      processedIds.add(car.id);

      if (processed % 100 === 0) {
        const percent = ((processed / extractedCars.length) * 100).toFixed(1);
        console.log(`  ${processed}/${extractedCars.length}대 처리 (${percent}%), 이미지: ${totalImages}개`);

        // 중간 저장
        const result = {
          at: new Date().toISOString(),
          cnt: allCars.length,
          cars: allCars
        };
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result));
        saveProgress({ processedIds: Array.from(processedIds), cars: allCars, totalImages });
      }

      await delay(IMAGE_DELAY_MS);
    }

    // 최종 저장
    const result = {
      at: new Date().toISOString(),
      cnt: allCars.length,
      cars: allCars
    };
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2));

    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }

    console.log('\n' + '='.repeat(60));
    console.log('크롤링 완료:', new Date().toLocaleString('ko-KR'));
    console.log(`총 차량: ${allCars.length}대`);
    console.log(`총 이미지: ${totalImages}개`);
    console.log(`저장 위치: ${OUTPUT_JSON}`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('\n크롤링 오류:', err.message);

    if (allCars.length > 0) {
      const result = {
        at: new Date().toISOString(),
        cnt: allCars.length,
        cars: allCars,
        error: err.message
      };
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result));
      saveProgress({ processedIds: Array.from(processedIds), cars: allCars, totalImages });
      console.log(`\n오류 발생, ${allCars.length}대 저장됨`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
