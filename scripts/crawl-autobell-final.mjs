#!/usr/bin/env node
/**
 * 오토벨 일반 판매 차량 크롤러 (최종 버전)
 * - 전체 7351대 차량 크롤링
 * - 이미지 다운로드 및 리사이징
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

const IMAGE_DELAY_MS = 30;
const MAX_RETRIES = 3;
const SCROLL_PAUSE = 3000;
const PAGE_LOAD_TIMEOUT = 120000;

// 이미지 크기 설정
const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 },
  large: { width: 1600, height: 1200 }
};
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function log(msg) {
  const timestamp = new Date().toLocaleTimeString('ko-KR');
  console.log(`[${timestamp}] ${msg}`);
}

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
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': BASE_URL,
        'Accept': 'image/*,*/*;q=0.8'
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
        }, 300);
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
    results.thumb = `/images/cars/${baseFilename}_thumb.jpg`;

    const mainPath = path.join(OUTPUT_DIR, `${baseFilename}_main.jpg`);
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mainPath);
    results.main = `/images/cars/${baseFilename}_main.jpg`;

    if (imageIndex === 0) {
      const largePath = path.join(OUTPUT_DIR, `${baseFilename}_large.jpg`);
      await sharp(buffer)
        .resize(SIZES.large.width, SIZES.large.height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(largePath);
      results.large = `/images/cars/${baseFilename}_large.jpg`;

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
  console.log('오토벨 일반 판매 차량 크롤러');
  console.log('목표: 7,351대 차량 크롤링');
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
    log(`이전 진행 상황에서 재개: ${allCars.length}대 완료`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    log('페이지 로드 중 (최대 2분 대기)...');
    await page.goto(LIST_URL, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_LOAD_TIMEOUT
    });

    // 페이지 완전 로드 대기
    log('JavaScript 렌더링 대기 중...');
    await delay(10000);

    // 더 로드되기를 대기
    await page.waitForFunction(() => {
      return document.querySelectorAll('a[href*="buyCarDetail"]').length > 0 ||
             document.querySelectorAll('[class*="car"]').length > 0;
    }, { timeout: 30000 }).catch(() => {
      log('차량 목록 대기 타임아웃 - 계속 진행');
    });

    await delay(3000);

    // 총 차량 수 확인
    const totalCount = await page.evaluate(() => {
      // 페이지에서 총 수량 찾기
      const countEls = document.querySelectorAll('[class*="count"], [class*="total"], [class*="result"]');
      for (const el of countEls) {
        const text = el.textContent || '';
        const match = text.match(/(\d{1,3}(,\d{3})*|\d+)\s*(대|건|개)/);
        if (match) {
          return parseInt(match[1].replace(/,/g, ''));
        }
      }
      return 7351;
    });

    log(`총 차량 수: ${totalCount}대`);

    // 무한 스크롤로 모든 차량 로드
    log('차량 목록 로드 중 (무한 스크롤)...');

    let previousCount = 0;
    let noChangeCount = 0;
    let scrollCount = 0;
    const maxScrolls = Math.ceil(totalCount / 20) + 50; // 예상 스크롤 수 + 여유

    while (noChangeCount < 10 && scrollCount < maxScrolls) {
      const currentCount = await page.evaluate(() => {
        return document.querySelectorAll('a[href*="buyCarDetail"]').length;
      });

      if (currentCount === previousCount) {
        noChangeCount++;
      } else {
        noChangeCount = 0;
        log(`스크롤 ${scrollCount + 1}: ${currentCount}대 로드됨`);
      }

      // 더보기 버튼 클릭 시도
      await page.evaluate(() => {
        const btns = document.querySelectorAll('button, a');
        for (const btn of btns) {
          const text = btn.textContent?.toLowerCase() || '';
          if (text.includes('더보기') || text.includes('more') || text.includes('다음')) {
            btn.click();
            return true;
          }
        }
        // 스크롤
        window.scrollTo(0, document.body.scrollHeight);
        return false;
      });

      await delay(SCROLL_PAUSE);
      previousCount = currentCount;
      scrollCount++;

      // 목표의 90% 이상 도달 시 종료
      if (currentCount >= totalCount * 0.9) {
        log(`목표의 90% 이상 로드됨 (${currentCount}/${totalCount})`);
        break;
      }
    }

    // 차량 데이터 추출
    log('차량 데이터 추출 중...');

    const extractedCars = await page.evaluate((baseUrl) => {
      const cars = [];
      const seen = new Set();

      document.querySelectorAll('a[href*="buyCarDetail"]').forEach((link, idx) => {
        const href = link.getAttribute('href') || '';
        const idMatch = href.match(/buyCarDetail\/([^/?]+)/);
        const id = idMatch ? idMatch[1] : '';

        if (!id || seen.has(id)) return;
        seen.add(id);

        // 상위 컨테이너 찾기
        let container = link;
        for (let i = 0; i < 5; i++) {
          if (container.parentElement) {
            container = container.parentElement;
          }
        }

        // 정보 추출
        const getText = (el) => el?.textContent?.trim() || '';
        const nameEl = container.querySelector('strong, h3, h4, [class*="name"], [class*="title"]');
        const priceEl = container.querySelector('[class*="price"]');
        const imgEl = container.querySelector('img');
        const infoText = getText(container);

        // 가격 추출
        let price = null;
        const priceText = getText(priceEl) || infoText;
        const priceMatch = priceText.match(/(\d{1,3}(,\d{3})*)\s*(만원|만)/);
        if (priceMatch) {
          price = parseInt(priceMatch[1].replace(/,/g, ''));
        }

        // 연식 추출
        const yearMatch = infoText.match(/(20\d{2}|19\d{2})년?/);
        const year = yearMatch ? yearMatch[1] : '';

        // 주행거리 추출
        const kmMatch = infoText.match(/(\d{1,3}(,\d{3})*)\s*km/i);
        const mileage = kmMatch ? kmMatch[1] + ' km' : '';

        // 이미지 URL
        let imgSrc = imgEl?.src || imgEl?.getAttribute('data-src') || '';
        if (imgSrc && !imgSrc.startsWith('http')) {
          imgSrc = 'https:' + imgSrc;
        }

        cars.push({
          id,
          name: getText(nameEl) || `차량 ${idx + 1}`,
          price,
          year,
          mileage,
          imgSrc,
          url: href.startsWith('http') ? href : baseUrl + href
        });
      });

      return cars;
    }, BASE_URL);

    log(`총 ${extractedCars.length}대 추출됨`);

    // 이미지 다운로드 및 리사이징
    log('이미지 다운로드 및 리사이징 중...');

    let newCars = 0;
    for (const car of extractedCars) {
      if (processedIds.has(car.id)) continue;

      newCars++;
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
          car.img = `/images/cars/${carNo}.jpg`;
          car.images = [];
          car.thumbs = [];
        }
      } else {
        car.img = `/images/cars/${carNo}.jpg`;
        car.images = [];
        car.thumbs = [];
      }

      const carData = {
        id: car.id,
        no: carNo,
        name: car.name,
        status: '판매중',
        year: car.year || '',
        transmission: '',
        displacement: '',
        mileage: car.mileage || '',
        color: '',
        fuel: '',
        usage: '',
        grade: '',
        auctionRound: '',
        lane: '',
        plateNumber: '',
        location: '',
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

      if (newCars % 100 === 0) {
        log(`${newCars}/${extractedCars.length}대 처리, 이미지: ${totalImages}개`);

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
    console.log(`새로 추가: ${newCars}대`);
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
      log(`오류 발생, ${allCars.length}대 저장됨`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
