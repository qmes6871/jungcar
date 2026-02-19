#!/usr/bin/env node
/**
 * 오토벨 일반 판매 차량 크롤러
 * - 매매단지몰 + 법인상사몰 전체 차량 크롤링
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
const LIST_URL = 'https://www.autobell.co.kr/buycar/buyCarCertiList';
const IMAGE_BASE = 'https://ci.autobell.co.kr/ci/';

const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/glovis-cars-detail.json`;
const PROGRESS_FILE = `${DATA_DIR}/autobell-progress.json`;

const ITEMS_PER_PAGE = 100;
const DELAY_MS = 500;
const IMAGE_DELAY_MS = 50;
const MAX_RETRIES = 3;

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
      if (retries > 0) {
        setTimeout(() => {
          downloadImage(url, retries - 1).then(resolve).catch(reject);
        }, 500);
      } else {
        reject(new Error('Timeout'));
      }
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
      results.default = `/Jungcar/images/cars/${carNo}.jpg`;
    }
  } catch (err) {
    // 무시
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('오토벨 일반 판매 차량 크롤러');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const progress = loadProgress();
  let allCars = progress?.cars || [];
  let startPage = progress?.lastPage ? progress.lastPage + 1 : 1;
  let totalImages = progress?.totalImages || 0;

  if (progress) {
    console.log(`\n이전 진행 상황에서 재개: ${allCars.length}대 완료, 페이지 ${startPage}부터 시작`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log('\n[1단계] 초기 페이지 로드...');
    await page.goto(LIST_URL + '?tab=1', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(3000);

    // 전체 차량 수 확인
    const totalCount = await page.evaluate(() => {
      // __NUXT__ 또는 window 객체에서 데이터 찾기
      const nuxtData = window.__NUXT__?.data || {};
      for (const key in nuxtData) {
        const data = nuxtData[key];
        if (data?.autobellAndcarCount) {
          return parseInt(data.autobellAndcarCount) || 0;
        }
      }

      // HTML에서 찾기
      const countEl = document.querySelector('.total-count, .result-count, [class*="count"]');
      if (countEl) {
        const match = countEl.textContent?.match(/(\d[\d,]*)/);
        if (match) return parseInt(match[1].replace(/,/g, ''));
      }

      return 7351;
    });

    console.log(`총 차량 수: ${totalCount}대`);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    console.log(`총 페이지: ${totalPages}페이지\n`);

    // API 엔드포인트 찾기
    const apiEndpoint = await page.evaluate(() => {
      // 네트워크 요청에서 API 엔드포인트 추출
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent || '';
        const apiMatch = text.match(/\/api\/[^"']+carList[^"']*/);
        if (apiMatch) return apiMatch[0];
      }
      return '/api/buycar/autobellAndCarList';
    });

    console.log(`API 엔드포인트: ${apiEndpoint}`);

    // 페이지 순회
    for (let pageNum = startPage; pageNum <= totalPages; pageNum++) {
      console.log(`\n[페이지 ${pageNum}/${totalPages}] 처리 중...`);

      // API 호출로 데이터 가져오기
      const pageCars = await page.evaluate(async (params) => {
        const { pageNum, pageSize, baseUrl, imageBase } = params;

        try {
          // 여러 API 엔드포인트 시도
          const endpoints = [
            `/api/buycar/autobellAndCarList?pageNo=${pageNum}&recordSize=${pageSize}`,
            `/api/buycar/buyCarCertiList?tab=1&pageNo=${pageNum}&recordSize=${pageSize}`,
            `/buycar/api/carList?pageNo=${pageNum}&pageSize=${pageSize}`
          ];

          for (const endpoint of endpoints) {
            try {
              const res = await fetch(baseUrl + endpoint, {
                headers: { 'Content-Type': 'application/json' }
              });
              if (res.ok) {
                const data = await res.json();
                const list = data.data?.list || data.list || data.result?.list || [];

                if (list.length > 0) {
                  return list.map((car, idx) => ({
                    id: car.dlrPrdId || car.crId || `${pageNum}_${idx}`,
                    no: car.crNo || car.carNo || String((pageNum - 1) * pageSize + idx + 1),
                    name: `[${car.mnfcNm || car.maker || ''}] ${car.mdlNm || car.model || ''} ${car.dtlMdlNm || car.grade || ''}`.trim(),
                    status: car.saleStatus || '판매중',
                    year: String(car.frmYyyy || car.year || ''),
                    transmission: car.msnNm || car.transmission || '',
                    displacement: car.dspl ? `${car.dspl}cc` : '',
                    mileage: car.drvDist ? `${car.drvDist.toLocaleString()} km` : '',
                    color: car.clrNm || car.color || '',
                    fuel: car.fuelNm || car.fuel || '',
                    usage: car.useNm || '',
                    price: car.saleAmt || car.price || null,
                    imgSrc: car.imgUrl ? (car.imgUrl.startsWith('http') ? car.imgUrl : imageBase + car.imgUrl) : '',
                    location: car.locNm || car.area || '',
                    plateNumber: car.crNo || '',
                    url: `${baseUrl}/buycar/buyCarDetail/${car.dlrPrdId || car.crId}`
                  }));
                }
              }
            } catch (e) {
              continue;
            }
          }

          // 페이지 DOM에서 직접 추출
          const items = [];
          document.querySelectorAll('.car-item, .vehicle-item, [class*="car-card"], [class*="product-item"]').forEach((item, idx) => {
            const nameEl = item.querySelector('[class*="name"], [class*="title"], h3, h4');
            const priceEl = item.querySelector('[class*="price"]');
            const imgEl = item.querySelector('img');
            const linkEl = item.querySelector('a[href*="detail"], a[href*="car"]');

            if (nameEl) {
              items.push({
                id: linkEl?.href?.match(/\/(\d+)/)?.[1] || `${pageNum}_${idx}`,
                no: String((pageNum - 1) * pageSize + idx + 1),
                name: nameEl.textContent?.trim() || '',
                price: parseInt(priceEl?.textContent?.replace(/[^0-9]/g, '')) || null,
                imgSrc: imgEl?.src || '',
                url: linkEl?.href || ''
              });
            }
          });

          return items;
        } catch (e) {
          return [];
        }
      }, { pageNum, pageSize: ITEMS_PER_PAGE, baseUrl: BASE_URL, imageBase: IMAGE_BASE });

      console.log(`  ${pageCars.length}대 발견`);

      if (pageCars.length === 0) {
        // 스크롤로 더 로드 시도
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await delay(2000);

        // 다음 페이지 버튼 클릭 시도
        const hasNextPage = await page.evaluate((pn) => {
          const nextBtn = document.querySelector(`[class*="page"]:not(.active) a[href*="page=${pn}"], button[class*="next"], .pagination .next`);
          if (nextBtn) {
            nextBtn.click();
            return true;
          }
          return false;
        }, pageNum + 1);

        if (hasNextPage) {
          await delay(2000);
          continue;
        } else {
          console.log('  더 이상 페이지 없음');
          break;
        }
      }

      // 이미지 다운로드 및 리사이징
      for (const car of pageCars) {
        const carNo = car.no || String(allCars.length + 1);

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
          status: car.status || '판매중',
          year: car.year || '',
          transmission: car.transmission || '',
          displacement: car.displacement || '',
          mileage: car.mileage || '',
          color: car.color || '',
          fuel: car.fuel || '',
          usage: car.usage || '',
          grade: '',
          auctionRound: '',
          lane: '',
          plateNumber: car.plateNumber || '',
          location: car.location || '',
          price: car.price,
          hope: null,
          instant: null,
          img: car.img,
          images: car.images || [],
          thumbs: car.thumbs || [],
          url: car.url
        };

        allCars.push(carData);
        await delay(IMAGE_DELAY_MS);
      }

      const percent = ((allCars.length / totalCount) * 100).toFixed(1);
      console.log(`  누적: ${allCars.length}대 (${percent}%), 이미지: ${totalImages}개`);

      // 주기적 저장
      if (pageNum % 5 === 0) {
        const result = {
          at: new Date().toISOString(),
          cnt: allCars.length,
          cars: allCars
        };
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result));
        saveProgress({ lastPage: pageNum, cars: allCars, totalImages });
        console.log(`  [저장 완료]`);
      }

      // 다음 페이지로 이동
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(DELAY_MS);
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
      console.log(`\n오류 발생, ${allCars.length}대 저장됨`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
