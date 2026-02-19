#!/usr/bin/env node
/**
 * 오토벨 차량 크롤러 - 네비게이션 방식
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
    results.thumb = `/Jungcar/images/cars/${carNo}_${idx}_thumb.jpg`;
    await sharp(buffer).resize(800, 600, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(path.join(OUTPUT_DIR, `${carNo}_${idx}_main.jpg`));
    results.main = `/Jungcar/images/cars/${carNo}_${idx}_main.jpg`;
    if (idx === 0) {
      await sharp(buffer).resize(1600, 1200, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toFile(path.join(OUTPUT_DIR, `${carNo}_${idx}_large.jpg`));
      await sharp(buffer).resize(800, 600, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(path.join(OUTPUT_DIR, `${carNo}.jpg`));
    }
  } catch (err) {}
  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('오토벨 차량 크롤러 (네비게이션 방식)');
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
    // 1. 메인 페이지 로드
    log('메인 페이지 로드 중...');
    await page.goto(BASE_URL + '/main', { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(3000);

    // 2. "내차사기" 메뉴 클릭
    log('내차사기 메뉴 클릭...');
    await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent?.includes('내차사기') || link.href?.includes('buycar') || link.href?.includes('searchList')) {
          link.click();
          return true;
        }
      }
      return false;
    });
    await delay(5000);

    // 3. 현재 URL 확인
    const currentUrl = await page.url();
    log(`현재 URL: ${currentUrl}`);

    // 4. 스크린샷
    await page.screenshot({ path: '/tmp/autobell-nav.png' });

    // 5. 페이지 정보 확인
    const pageInfo = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="Detail"], a[href*="detail"]'));
      const cards = document.querySelectorAll('[class*="card"], [class*="item"]');

      let totalCount = 0;
      const countMatch = document.body.textContent?.match(/총\s*(\d[\d,]*)\s*(대|건)/);
      if (countMatch) totalCount = parseInt(countMatch[1].replace(/,/g, ''));

      return { linkCount: links.length, cardCount: cards.length, totalCount };
    });

    log(`링크: ${pageInfo.linkCount}, 카드: ${pageInfo.cardCount}, 총: ${pageInfo.totalCount || '?'}`);

    // 6. 무한 스크롤
    if (pageInfo.linkCount === 0) {
      log('링크를 찾을 수 없음. 다른 방법 시도...');

      // 검색 페이지 직접 이동 시도
      const searchUrl = 'https://autobell.co.kr/buycar/searchList?tab=0&viewType=0';
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await delay(5000);
    }

    log('차량 로드 중 (무한 스크롤)...');
    let prevCount = 0, noChange = 0, scrolls = 0;

    while (noChange < 20 && scrolls < 400) {
      const count = await page.evaluate(() => document.querySelectorAll('a[href*="Detail"], [class*="car"]').length);

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

    // 7. 데이터 추출
    log('데이터 추출 중...');
    const cars = await page.evaluate((baseUrl) => {
      const result = [];
      const seen = new Set();

      document.querySelectorAll('a[href*="Detail"], a[href*="detail"]').forEach((a, i) => {
        const href = a.href || '';
        const id = href.match(/Detail\/([^/?]+)/i)?.[1] || href.match(/\/(\d+)$/)?.[1] || String(i);
        if (seen.has(id)) return;
        seen.add(id);

        const container = a.closest('[class*="card"]') || a.closest('[class*="item"]') || a.parentElement;
        const text = container?.textContent || '';
        const img = container?.querySelector('img');

        result.push({
          id,
          name: container?.querySelector('strong, h3, h4')?.textContent?.trim() || `차량 ${result.length + 1}`,
          price: parseInt(text.match(/(\d{1,3}(,\d{3})*)\s*만/)?.[1]?.replace(/,/g, '') || '0') || null,
          year: text.match(/(20\d{2}|19\d{2})/)?.[1] || '',
          mileage: (text.match(/(\d{1,3}(,\d{3})*)\s*km/i)?.[0] || ''),
          imgSrc: img?.src?.startsWith('http') ? img.src : (img?.src ? 'https:' + img.src : ''),
          url: href.startsWith('http') ? href : baseUrl + href
        });
      });

      return result;
    }, BASE_URL);

    log(`${cars.length}대 추출됨`);

    // 8. 이미지 처리
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
          car.img = res.thumb || res.main || `/Jungcar/images/cars/${carNo}.jpg`;
          car.images = res.main ? [res.main] : [];
          car.thumbs = res.thumb ? [res.thumb] : [];
          totalImages++;
        } catch { car.img = `/Jungcar/images/cars/${carNo}.jpg`; car.images = []; car.thumbs = []; }
      } else { car.img = `/Jungcar/images/cars/${carNo}.jpg`; car.images = []; car.thumbs = []; }

      allCars.push({
        id: car.id, no: carNo, name: car.name, status: '판매중', year: car.year, transmission: '', displacement: '',
        mileage: car.mileage, color: '', fuel: '', usage: '', grade: '', auctionRound: '', lane: '', plateNumber: '',
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

    // 9. 저장
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
