#!/usr/bin/env node
/**
 * 오토벨 차량 검색 크롤러
 * - buycar/searchList 페이지에서 전체 차량 크롤링
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

// ============ 설정 ============
const BASE_URL = 'https://www.autobell.co.kr';
// 전체 차량 검색 URL
const LIST_URL = 'https://www.autobell.co.kr/buycar/searchList?tab=0&viewType=0&listType=card&order=upd_dt';

const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/glovis-cars-detail.json`;
const PROGRESS_FILE = `${DATA_DIR}/autobell-progress.json`;

const IMAGE_DELAY_MS = 30;
const MAX_RETRIES = 3;
const SCROLL_PAUSE = 2000;

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
  console.log('오토벨 차량 검색 크롤러');
  console.log('목표: 전체 차량 크롤링');
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    log('페이지 로드 중...');
    await page.goto(LIST_URL, {
      waitUntil: 'networkidle2',
      timeout: 120000
    });

    await delay(5000);

    // 스크린샷 (디버깅용)
    await page.screenshot({ path: '/tmp/autobell-search.png' });
    log('스크린샷 저장: /tmp/autobell-search.png');

    // 페이지 정보 확인
    const pageInfo = await page.evaluate(() => {
      const url = window.location.href;
      const title = document.title;

      // 차량 카드 찾기
      const cards = document.querySelectorAll('[class*="card"], [class*="item"], [class*="product"]');
      const links = document.querySelectorAll('a[href*="Detail"], a[href*="detail"]');

      // 총 차량 수 찾기
      let totalCount = 0;
      document.querySelectorAll('*').forEach(el => {
        const text = el.textContent || '';
        const match = text.match(/총\s*(\d[\d,]*)\s*(대|건)/);
        if (match) {
          totalCount = parseInt(match[1].replace(/,/g, ''));
        }
      });

      return {
        url,
        title,
        cardCount: cards.length,
        linkCount: links.length,
        totalCount,
        sampleLinks: Array.from(links).slice(0, 5).map(a => a.href)
      };
    });

    log(`현재 URL: ${pageInfo.url}`);
    log(`페이지 제목: ${pageInfo.title}`);
    log(`카드 수: ${pageInfo.cardCount}, 링크 수: ${pageInfo.linkCount}`);
    log(`총 차량 수: ${pageInfo.totalCount || '확인 불가'}`);

    if (pageInfo.sampleLinks.length > 0) {
      log('샘플 링크:');
      pageInfo.sampleLinks.forEach(l => log(`  - ${l}`));
    }

    const targetCount = pageInfo.totalCount || 7351;
    log(`\n목표 차량 수: ${targetCount}대`);

    // 무한 스크롤 또는 페이지네이션
    log('차량 로드 중...');

    let previousCount = 0;
    let noChangeCount = 0;
    let scrollCount = 0;

    while (noChangeCount < 15 && scrollCount < 500) {
      const currentCount = await page.evaluate(() => {
        return document.querySelectorAll('a[href*="Detail"], a[href*="detail"], [class*="car-card"]').length;
      });

      if (currentCount === previousCount) {
        noChangeCount++;
      } else {
        noChangeCount = 0;
        if (scrollCount % 10 === 0) {
          log(`스크롤 ${scrollCount}: ${currentCount}대 로드됨`);
        }
      }

      // 더보기 버튼 클릭
      const clicked = await page.evaluate(() => {
        const btns = document.querySelectorAll('button, a, div[role="button"]');
        for (const btn of btns) {
          const text = (btn.textContent || '').toLowerCase();
          if (text.includes('더보기') || text.includes('더 보기') || text.includes('more')) {
            btn.click();
            return true;
          }
        }
        return false;
      });

      if (!clicked) {
        // 스크롤
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }

      await delay(SCROLL_PAUSE);
      previousCount = currentCount;
      scrollCount++;

      // 중간 저장
      if (scrollCount % 50 === 0 && currentCount > 0) {
        log(`[중간] ${currentCount}대 로드됨`);
      }

      if (currentCount >= targetCount * 0.95) {
        log(`목표 근접: ${currentCount}/${targetCount}`);
        break;
      }
    }

    // 최종 차량 수
    const finalCount = await page.evaluate(() => {
      return document.querySelectorAll('a[href*="Detail"], a[href*="detail"]').length;
    });
    log(`최종 로드: ${finalCount}대`);

    // 차량 데이터 추출
    log('차량 데이터 추출 중...');

    const extractedCars = await page.evaluate((baseUrl) => {
      const cars = [];
      const seen = new Set();

      // 모든 차량 링크 찾기
      document.querySelectorAll('a[href*="Detail"], a[href*="detail"]').forEach((link, idx) => {
        const href = link.getAttribute('href') || '';
        const idMatch = href.match(/[Dd]etail\/([^/?]+)|\/(\d+)$/);
        const id = idMatch ? (idMatch[1] || idMatch[2]) : String(idx);

        if (seen.has(id)) return;
        seen.add(id);

        // 컨테이너 찾기
        let container = link.closest('[class*="card"]') || link.closest('[class*="item"]') || link.parentElement?.parentElement;

        const getText = (selector) => {
          const el = container?.querySelector(selector);
          return el?.textContent?.trim() || '';
        };

        const getImg = () => {
          const img = container?.querySelector('img') || link.querySelector('img');
          let src = img?.src || img?.getAttribute('data-src') || '';
          if (src && src.startsWith('//')) src = 'https:' + src;
          return src;
        };

        // 텍스트에서 정보 추출
        const allText = container?.textContent || '';
        const priceMatch = allText.match(/(\d{1,3}(,\d{3})*)\s*만원?/);
        const yearMatch = allText.match(/(20\d{2}|19\d{2})년?/);
        const kmMatch = allText.match(/(\d{1,3}(,\d{3})*)\s*km/i);

        cars.push({
          id,
          name: getText('strong, h3, h4, [class*="name"], [class*="title"]') || `차량 ${cars.length + 1}`,
          price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null,
          year: yearMatch ? yearMatch[1] : '',
          mileage: kmMatch ? `${kmMatch[1]} km` : '',
          imgSrc: getImg(),
          url: href.startsWith('http') ? href : baseUrl + href
        });
      });

      return cars;
    }, BASE_URL);

    log(`총 ${extractedCars.length}대 추출됨`);

    // 이미지 다운로드
    log('이미지 처리 중...');

    let newCars = 0;
    for (const car of extractedCars) {
      if (processedIds.has(car.id)) continue;

      newCars++;
      const carNo = String(allCars.length + 1);

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
        year: car.year,
        transmission: '',
        displacement: '',
        mileage: car.mileage,
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

        // 저장
        const result = { at: new Date().toISOString(), cnt: allCars.length, cars: allCars };
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result));
        saveProgress({ processedIds: Array.from(processedIds), cars: allCars, totalImages });
      }

      await delay(IMAGE_DELAY_MS);
    }

    // 최종 저장
    const result = { at: new Date().toISOString(), cnt: allCars.length, cars: allCars };
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2));

    if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);

    console.log('\n' + '='.repeat(60));
    console.log('크롤링 완료:', new Date().toLocaleString('ko-KR'));
    console.log(`총 차량: ${allCars.length}대`);
    console.log(`새로 추가: ${newCars}대`);
    console.log(`총 이미지: ${totalImages}개`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('\n오류:', err.message);
    if (allCars.length > 0) {
      const result = { at: new Date().toISOString(), cnt: allCars.length, cars: allCars, error: err.message };
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result));
      saveProgress({ processedIds: Array.from(processedIds), cars: allCars, totalImages });
      log(`${allCars.length}대 저장됨`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
