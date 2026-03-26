#!/usr/bin/env node
/**
 * 현대글로비스 경매 전체 차량 크롤러
 * - Puppeteer로 전체 차량 목록 크롤링
 * - 이미지 다운로드 및 리사이징
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

// ============ 설정 ============
const BASE_URL = 'https://auction.autobell.co.kr';
const LIST_URL = 'https://auction.autobell.co.kr/auction/exhibitList.do';

const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/glovis-cars-detail.json`;
const PROGRESS_FILE = `${DATA_DIR}/crawl-progress.json`;

const ITEMS_PER_PAGE = 100; // 페이지당 아이템 수
const DELAY_MS = 300; // 요청 간 딜레이
const IMAGE_DELAY_MS = 100; // 이미지 다운로드 간 딜레이
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 50; // 저장 간격

// 이미지 크기 설정
const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 },
  large: { width: 1600, height: 1200 }
};
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 진행 상황 저장
function saveProgress(data) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

// 진행 상황 로드
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return null;
}

// 이미지 다운로드 함수
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
        }, 1000);
      } else {
        reject(err);
      }
    });

    request.on('timeout', () => {
      request.destroy();
      if (retries > 0) {
        setTimeout(() => {
          downloadImage(url, retries - 1).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(new Error('Timeout'));
      }
    });
  });
}

// 이미지 리사이징 함수
async function processImage(buffer, carNo, imageIndex) {
  const results = {};
  const baseFilename = `${carNo}_${imageIndex}`;

  try {
    // 썸네일
    const thumbPath = path.join(OUTPUT_DIR, `${baseFilename}_thumb.jpg`);
    await sharp(buffer)
      .resize(SIZES.thumb.width, SIZES.thumb.height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    results.thumb = `/images/cars/${baseFilename}_thumb.jpg`;

    // 메인
    const mainPath = path.join(OUTPUT_DIR, `${baseFilename}_main.jpg`);
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mainPath);
    results.main = `/images/cars/${baseFilename}_main.jpg`;

    // 대표 이미지 (첫번째만)
    if (imageIndex === 0) {
      const largePath = path.join(OUTPUT_DIR, `${baseFilename}_large.jpg`);
      await sharp(buffer)
        .resize(SIZES.large.width, SIZES.large.height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(largePath);
      results.large = `/images/cars/${baseFilename}_large.jpg`;

      // 기본 이미지
      const defaultPath = path.join(OUTPUT_DIR, `${carNo}.jpg`);
      await sharp(buffer)
        .resize(800, 600, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toFile(defaultPath);
      results.default = `/images/cars/${carNo}.jpg`;
    }
  } catch (err) {
    // 무시
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('현대글로비스 전체 차량 크롤러 (7351대)');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  // 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 기존 진행 상황 확인
  const progress = loadProgress();
  let allCars = progress?.cars || [];
  let startPage = progress?.lastPage ? progress.lastPage + 1 : 1;
  let totalProcessed = allCars.length;
  let totalImages = progress?.totalImages || 0;

  if (progress) {
    console.log(`\n이전 진행 상황에서 재개: ${totalProcessed}대 완료, 페이지 ${startPage}부터 시작`);
  }

  // 브라우저 시작
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // 쿠키 설정 (세션 유지)
  await page.setCookie({
    name: 'JSESSIONID',
    value: 'dummy',
    domain: 'auction.autobell.co.kr'
  });

  try {
    // 초기 페이지 로드
    console.log('\n[1단계] 초기 페이지 로드...');
    await page.goto(LIST_URL + '?atn=1039&acc=20&flag=Y', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(3000);

    // 전체 차량 수 확인
    const totalCount = await page.evaluate(() => {
      // 다양한 선택자 시도
      const selectors = [
        '.total-count',
        '.result-count',
        '.list-count',
        '.count',
        '#totalCount',
        '.total span',
        '.search-result .count'
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.textContent || '';
          const match = text.match(/(\d[\d,]*)/);
          if (match) return parseInt(match[1].replace(/,/g, ''));
        }
      }

      // 폼에서 찾기
      const totalInput = document.querySelector('input[name="totalCount"], input#totalCount');
      if (totalInput) return parseInt(totalInput.value) || 0;

      return 0;
    });

    const estimatedTotal = totalCount || 7351;
    const totalPages = Math.ceil(estimatedTotal / ITEMS_PER_PAGE);

    console.log(`총 차량 수: ${estimatedTotal}대`);
    console.log(`총 페이지: ${totalPages}페이지`);
    console.log(`페이지당: ${ITEMS_PER_PAGE}대\n`);

    // 페이지 순회
    for (let pageNum = startPage; pageNum <= totalPages; pageNum++) {
      console.log(`\n[페이지 ${pageNum}/${totalPages}] 처리 중...`);

      // 페이지 이동 (rowFrom으로 페이지네이션)
      const rowFrom = (pageNum - 1) * ITEMS_PER_PAGE + 1;

      await page.evaluate((rf) => {
        const form = document.getElementById('exhibitForm') || document.forms[0];
        if (form) {
          const rowFromInput = form.querySelector('#rowFrom, input[name="rowFrom"]');
          if (rowFromInput) rowFromInput.value = rf;

          // 폼 제출 또는 AJAX 호출
          if (typeof fn_search === 'function') {
            fn_search();
          } else if (form.submit) {
            form.submit();
          }
        }
      }, rowFrom);

      await delay(2000);

      // 현재 페이지의 차량 정보 추출
      const pageCars = await page.evaluate((baseUrl) => {
        const items = [];

        document.querySelectorAll('.item, .car-item, .exhibit-item').forEach((item, idx) => {
          const link = item.querySelector('a.btn_view, a[gn]');
          if (!link) return;

          const gn = link.getAttribute('gn') || '';
          const rc = link.getAttribute('rc') || '';
          const acc = link.getAttribute('acc') || '';
          const atn = link.getAttribute('atn') || '';
          const prodmancd = link.getAttribute('prodmancd') || '';
          const reprcarcd = link.getAttribute('reprcarcd') || '';
          const detacarcd = link.getAttribute('detacarcd') || '';
          const cargradcd = link.getAttribute('cargradcd') || '';

          const noEl = item.querySelector('.entry-info span, .exhib-no');
          const nameEl = item.querySelector('.car-name, .name');
          const statusEl = item.querySelector('.state-tag, .state-flag span');

          // 옵션 정보
          const options = [];
          item.querySelectorAll('.option span').forEach(span => {
            const text = span.textContent?.trim();
            if (text) options.push(text);
          });

          // 가격
          const priceBoxes = item.querySelectorAll('.price-box .inner .num');
          const startPrice = priceBoxes[0]?.textContent?.trim() || '';
          const hopePrice = priceBoxes[1]?.textContent?.trim() || '';
          const instantPrice = priceBoxes[2]?.textContent?.trim() || '';

          // 이미지
          const imgEl = item.querySelector('.car-img img, .thumb img, img');
          let imgSrc = imgEl?.src || imgEl?.getAttribute('data-src') || '';
          if (imgSrc && !imgSrc.startsWith('http')) {
            imgSrc = baseUrl + imgSrc;
          }

          if (gn) {
            items.push({
              id: gn,
              no: noEl?.textContent?.trim() || '',
              name: nameEl?.textContent?.trim() || '',
              status: statusEl?.textContent?.trim() || '',
              year: options[0]?.replace(/[^0-9]/g, '') || '',
              transmission: options[1] || '',
              displacement: options[2] || '',
              mileage: options[3] || '',
              color: options[4] || '',
              fuel: options[5] || '',
              usage: options[6] || '',
              startPrice,
              hopePrice,
              instantPrice,
              imgSrc,
              meta: { gn, rc, acc, atn, prodmancd, reprcarcd, detacarcd, cargradcd }
            });
          }
        });

        return items;
      }, BASE_URL);

      console.log(`  ${pageCars.length}대 발견`);

      // 이미지 다운로드 및 리사이징
      for (const car of pageCars) {
        totalProcessed++;
        const carNo = car.no || String(totalProcessed);

        // 이미지 다운로드
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

        // 최종 데이터 구성
        const carData = {
          id: car.id,
          no: carNo,
          name: car.name,
          status: car.status,
          year: car.year,
          transmission: car.transmission,
          displacement: car.displacement,
          mileage: car.mileage,
          color: car.color,
          fuel: car.fuel,
          usage: car.usage,
          grade: '',
          auctionRound: car.meta.atn ? `${car.meta.atn}회` : '',
          lane: '',
          plateNumber: '',
          location: '',
          price: car.startPrice ? parseInt(car.startPrice.replace(/[^0-9]/g, '')) || null : null,
          hope: car.hopePrice ? parseInt(car.hopePrice.replace(/[^0-9]/g, '')) || null : null,
          instant: car.instantPrice ? parseInt(car.instantPrice.replace(/[^0-9]/g, '')) || null : null,
          img: car.img,
          images: car.images,
          thumbs: car.thumbs,
          url: `${BASE_URL}/auction/exhibitView.do?acc=${car.meta.acc}&gn=${encodeURIComponent(car.meta.gn)}&rc=${car.meta.rc}&atn=${car.meta.atn}`,
          meta: car.meta
        };

        allCars.push(carData);
        await delay(IMAGE_DELAY_MS);
      }

      // 진행 상황 출력
      const percent = ((totalProcessed / estimatedTotal) * 100).toFixed(1);
      console.log(`  누적: ${totalProcessed}대 (${percent}%), 이미지: ${totalImages}개`);

      // 주기적 저장
      if (pageNum % 5 === 0 || totalProcessed % SAVE_INTERVAL === 0) {
        const result = {
          at: new Date().toISOString(),
          cnt: allCars.length,
          cars: allCars
        };
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result));
        saveProgress({ lastPage: pageNum, cars: allCars, totalImages });
        console.log(`  [저장 완료]`);
      }

      await delay(DELAY_MS);

      // 페이지에 더 이상 데이터가 없으면 종료
      if (pageCars.length === 0) {
        console.log('\n더 이상 데이터가 없습니다.');
        break;
      }
    }

    // 최종 저장
    const result = {
      at: new Date().toISOString(),
      cnt: allCars.length,
      cars: allCars
    };
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2));

    // 진행 파일 삭제
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

    // 오류 시에도 저장
    if (allCars.length > 0) {
      const result = {
        at: new Date().toISOString(),
        cnt: allCars.length,
        cars: allCars,
        error: err.message
      };
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result));
      console.log(`\n오류 발생, ${allCars.length}대 저장됨`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
