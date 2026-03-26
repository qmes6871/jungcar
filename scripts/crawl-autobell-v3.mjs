#!/usr/bin/env node
/**
 * 오토벨 차량 크롤러 v3 - 수정된 데이터 추출
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const BASE_URL = 'https://www.autobell.co.kr';
const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/glovis-cars-detail.json`;
const PROGRESS_FILE = `${DATA_DIR}/autobell-progress.json`;

const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 },
  large: { width: 1600, height: 1200 }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (msg) => console.log(`[${new Date().toLocaleTimeString('ko-KR')}] ${msg}`);

function saveProgress(data) { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2)); }
function loadProgress() { return fs.existsSync(PROGRESS_FILE) ? JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')) : null; }

async function downloadImage(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': BASE_URL }}, (response) => {
      if ([301, 302].includes(response.statusCode)) { downloadImage(response.headers.location, retries).then(resolve).catch(reject); return; }
      if (response.statusCode !== 200) { reject(new Error(`HTTP ${response.statusCode}`)); return; }
      const chunks = []; response.on('data', chunk => chunks.push(chunk)); response.on('end', () => resolve(Buffer.concat(chunks))); response.on('error', reject);
    });
    request.on('error', (err) => { if (retries > 0) setTimeout(() => downloadImage(url, retries - 1).then(resolve).catch(reject), 300); else reject(err); });
    request.on('timeout', () => { request.destroy(); reject(new Error('Timeout')); });
  });
}

async function processImage(buffer, carNo, idx) {
  const results = {};
  try {
    await sharp(buffer).resize(400, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toFile(path.join(OUTPUT_DIR, `${carNo}_${idx}_thumb.jpg`));
    results.thumb = `/images/cars/${carNo}_${idx}_thumb.jpg`;
    await sharp(buffer).resize(800, 600, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(path.join(OUTPUT_DIR, `${carNo}_${idx}_main.jpg`));
    results.main = `/images/cars/${carNo}_${idx}_main.jpg`;
    if (idx === 0) {
      await sharp(buffer).resize(1600, 1200, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toFile(path.join(OUTPUT_DIR, `${carNo}_${idx}_large.jpg`));
      await sharp(buffer).resize(800, 600, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(path.join(OUTPUT_DIR, `${carNo}.jpg`));
    }
  } catch (err) {}
  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('오토벨 차량 크롤러 v3');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const progress = loadProgress();
  let processedIds = new Set(progress?.processedIds || []);
  let allCars = progress?.cars || [];
  let totalImages = progress?.totalImages || 0;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    // 1. 메인 페이지 -> 내차사기
    log('메인 페이지 로드...');
    await page.goto(BASE_URL + '/main', { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(3000);

    log('내차사기 클릭...');
    await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent?.includes('내차사기')) { link.click(); return; }
      }
    });
    await delay(5000);

    log(`현재 URL: ${await page.url()}`);

    // 2. 무한 스크롤로 모든 차량 로드 (최대 600번 스크롤)
    log('차량 로드 중...');
    let prevCount = 0, noChange = 0, scrolls = 0;

    while (noChange < 25 && scrolls < 600) {
      // 차량 카드 수 확인 (다양한 선택자 시도)
      const count = await page.evaluate(() => {
        // 차량 카드 컨테이너 찾기
        const cards = document.querySelectorAll('[class*="car-card"], [class*="CarCard"], [class*="product"], [class*="item"]');
        // 가격이 있는 요소 수
        const prices = document.querySelectorAll('[class*="price"]');
        // 차량명이 있는 요소 수
        const names = document.querySelectorAll('[class*="car-name"], [class*="CarName"], [class*="title"]');

        // 이미지가 있는 카드 수
        const cardsWithImg = Array.from(document.querySelectorAll('img')).filter(img => {
          const src = img.src || img.getAttribute('data-src') || '';
          return src.includes('autobell') || src.includes('ci.') || src.includes('car');
        }).length;

        return Math.max(cards.length, prices.length, names.length, cardsWithImg);
      });

      if (count === prevCount) noChange++;
      else { noChange = 0; if (scrolls % 20 === 0) log(`스크롤 ${scrolls}: ${count}대`); }

      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, div[role="button"]')).find(b => b.textContent?.includes('더보기'));
        if (btn) btn.click();
        else window.scrollTo(0, document.body.scrollHeight);
      });

      await delay(2000);
      prevCount = count;
      scrolls++;
    }

    // 3. 데이터 추출 (새로운 방식)
    log('데이터 추출 중...');

    const cars = await page.evaluate((baseUrl) => {
      const result = [];
      const seen = new Set();

      // 모든 이미지 요소에서 차량 카드 찾기
      document.querySelectorAll('img').forEach((img, idx) => {
        const src = img.src || img.getAttribute('data-src') || '';
        if (!src.includes('autobell') && !src.includes('ci.') && !src.includes('/car')) return;
        if (src.includes('icon') || src.includes('logo') || src.includes('banner')) return;

        // 상위 컨테이너 찾기 (여러 단계)
        let container = img.parentElement;
        for (let i = 0; i < 8; i++) {
          if (!container) break;
          container = container.parentElement;
        }
        if (!container) return;

        // 이미 처리한 컨테이너인지 확인
        const containerKey = container.innerHTML.substring(0, 100);
        if (seen.has(containerKey)) return;
        seen.add(containerKey);

        // 텍스트에서 정보 추출
        const text = container.textContent || '';

        // 가격 추출 (만원)
        const priceMatch = text.match(/(\d{1,3}(,\d{3})*)\s*만원?/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;

        // 연식 추출
        const yearMatch = text.match(/(20\d{2}|19\d{2})/);
        const year = yearMatch ? yearMatch[1] : '';

        // 주행거리 추출
        const kmMatch = text.match(/(\d{1,3}(,\d{3})*)\s*km/i);
        const mileage = kmMatch ? `${kmMatch[1]} km` : '';

        // 연료 추출
        const fuelMatch = text.match(/(가솔린|디젤|전기|하이브리드|LPG)/);
        const fuel = fuelMatch ? fuelMatch[1] : '';

        // 차량명 추출 (특정 패턴)
        const carNamePatterns = [
          /제네시스[^\n]+/,
          /현대[^\n]+/,
          /기아[^\n]+/,
          /쉐보레[^\n]+/,
          /르노[^\n]+/,
          /쌍용[^\n]+/,
          /벤츠[^\n]+/,
          /BMW[^\n]+/,
          /아우디[^\n]+/,
          /폭스바겐[^\n]+/,
          /토요타[^\n]+/,
          /혼다[^\n]+/,
          /닛산[^\n]+/,
          /포르쉐[^\n]+/,
          /렉서스[^\n]+/,
          /인피니티[^\n]+/,
          /테슬라[^\n]+/,
          /볼보[^\n]+/,
          /푸조[^\n]+/,
          /랜드로버[^\n]+/,
          /재규어[^\n]+/,
          /포드[^\n]+/,
          /지프[^\n]+/,
          /캐딜락[^\n]+/,
          /링컨[^\n]+/,
          /미니[^\n]+/,
          /마세라티[^\n]+/,
          /페라리[^\n]+/,
          /람보르기니[^\n]+/
        ];

        let name = '';
        for (const pattern of carNamePatterns) {
          const match = text.match(pattern);
          if (match) {
            name = match[0].trim().substring(0, 50);
            break;
          }
        }

        // 이름을 못 찾으면 다른 방법 시도
        if (!name) {
          const strongEl = container.querySelector('strong, h3, h4, [class*="name"], [class*="title"]');
          name = strongEl?.textContent?.trim().substring(0, 50) || '';
        }

        if (!name) return; // 차량명이 없으면 스킵

        // 링크 URL
        const linkEl = container.querySelector('a[href*="buyCarDetail"]');
        const url = linkEl?.href || '';
        const idMatch = url.match(/buyCarDetail\/([^/?]+)/);
        const id = idMatch ? idMatch[1] : `car_${result.length}`;

        // 이미지 URL
        let imgSrc = src;
        if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;

        result.push({ id, name, price, year, mileage, fuel, imgSrc, url: url || `${baseUrl}/buycar/buyCarDetail/${id}` });
      });

      return result;
    }, BASE_URL);

    log(`${cars.length}대 추출됨`);

    // 4. 이미지 처리
    log('이미지 처리 중...');
    let newCars = 0;

    for (const car of cars) {
      if (processedIds.has(car.id)) continue;
      newCars++;
      const carNo = String(allCars.length + 1);

      if (car.imgSrc?.startsWith('http')) {
        try {
          const buf = await downloadImage(car.imgSrc);
          const res = await processImage(buf, carNo, 0);
          car.img = res.thumb || res.main || `/images/cars/${carNo}.jpg`;
          car.images = res.main ? [res.main] : [];
          car.thumbs = res.thumb ? [res.thumb] : [];
          totalImages++;
        } catch { car.img = `/images/cars/${carNo}.jpg`; car.images = []; car.thumbs = []; }
      } else { car.img = `/images/cars/${carNo}.jpg`; car.images = []; car.thumbs = []; }

      allCars.push({
        id: car.id, no: carNo, name: car.name, status: '판매중', year: car.year, transmission: '', displacement: '',
        mileage: car.mileage, color: '', fuel: car.fuel, usage: '', grade: '', auctionRound: '', lane: '', plateNumber: '',
        location: '', price: car.price, hope: null, instant: null, img: car.img, images: car.images, thumbs: car.thumbs, url: car.url
      });
      processedIds.add(car.id);

      if (newCars % 100 === 0) {
        log(`${newCars}대 처리, 이미지: ${totalImages}개`);
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ at: new Date().toISOString(), cnt: allCars.length, cars: allCars }));
        saveProgress({ processedIds: Array.from(processedIds), cars: allCars, totalImages });
      }

      await delay(30);
    }

    // 5. 저장
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ at: new Date().toISOString(), cnt: allCars.length, cars: allCars }, null, 2));
    if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);

    console.log('\n' + '='.repeat(60));
    console.log('완료:', new Date().toLocaleString('ko-KR'));
    console.log(`총: ${allCars.length}대, 새로: ${newCars}대, 이미지: ${totalImages}개`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('오류:', err.message);
    if (allCars.length > 0) {
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ at: new Date().toISOString(), cnt: allCars.length, cars: allCars, error: err.message }));
      saveProgress({ processedIds: Array.from(processedIds), cars: allCars, totalImages });
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
