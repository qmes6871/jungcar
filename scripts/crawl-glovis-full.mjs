#!/usr/bin/env node
/**
 * 현대글로비스 경매 전체 차량 크롤러
 * - 전체 차량 목록 크롤링
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
const LIST_URL = 'https://auction.autobell.co.kr/auction/exhibitList.do?atn=1039&acc=20&auctListStat=&flag=Y';

const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/glovis-cars-detail.json`;

const DELAY_MS = 500; // 요청 간 딜레이
const BATCH_SIZE = 100; // 배치당 차량 수
const MAX_RETRIES = 3; // 재시도 횟수

// 이미지 크기 설정
const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 },
  large: { width: 1600, height: 1200 }
};
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 이미지 다운로드 함수
async function downloadImage(url, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

      // 기본 이미지도 저장
      const defaultPath = path.join(OUTPUT_DIR, `${carNo}.jpg`);
      await sharp(buffer)
        .resize(800, 600, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toFile(defaultPath);
      results.default = `/images/cars/${carNo}.jpg`;
    }
  } catch (err) {
    console.log(`    리사이징 에러: ${err.message}`);
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('현대글로비스 전체 차량 크롤러');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  // 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 브라우저 시작
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const allCars = [];
  let pageNum = 1;
  let hasMore = true;

  try {
    console.log('\n[1단계] 차량 목록 수집...');

    // 첫 페이지 로드
    await page.goto(LIST_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(2000);

    // 전체 차량 수 확인
    const totalCount = await page.evaluate(() => {
      const countEl = document.querySelector('.total-count, .result-count, .list-count');
      if (countEl) {
        const text = countEl.textContent || '';
        const match = text.match(/(\d[\d,]*)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
      }
      return 0;
    });

    console.log(`예상 총 차량 수: ${totalCount || '확인 불가'}`);

    // 페이지 순회하며 차량 수집
    while (hasMore) {
      console.log(`\n페이지 ${pageNum} 처리 중...`);

      // 현재 페이지의 차량 정보 추출
      const pageCars = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.exhibit-list .item, .car-list .item, .list-area .item').forEach(item => {
          const link = item.querySelector('a.btn_view, a[gn]');
          if (!link) return;

          const gn = link.getAttribute('gn') || '';
          const rc = link.getAttribute('rc') || '';
          const acc = link.getAttribute('acc') || '';
          const atn = link.getAttribute('atn') || '';

          const noEl = item.querySelector('.entry-info span, .exhib-no, .no');
          const nameEl = item.querySelector('.car-name, .name, .title');
          const statusEl = item.querySelector('.state-tag, .state-flag span, .status');

          const optionEls = item.querySelectorAll('.option span, .spec span');
          const options = Array.from(optionEls).map(el => el.textContent?.trim()).filter(Boolean);

          const startPriceEl = item.querySelector('.price-box .inner:first-child .num, .start-price .num');
          const hopePriceEl = item.querySelector('.price-box .inner:nth-child(2) .num, .hope-price .num');

          // 이미지 URL
          const imgEl = item.querySelector('img');
          const imgSrc = imgEl?.src || imgEl?.getAttribute('data-src') || '';

          if (gn) {
            items.push({
              id: gn,
              no: noEl?.textContent?.trim() || '',
              name: nameEl?.textContent?.trim() || '',
              status: statusEl?.textContent?.trim() || '',
              year: options[0] || '',
              transmission: options[1] || '',
              displacement: options[2] || '',
              mileage: options[3] || '',
              color: options[4] || '',
              fuel: options[5] || '',
              startPrice: startPriceEl?.textContent?.trim() || '',
              hopePrice: hopePriceEl?.textContent?.trim() || '',
              imgSrc: imgSrc,
              meta: { gn, rc, acc, atn }
            });
          }
        });
        return items;
      });

      console.log(`  ${pageCars.length}대 발견`);
      allCars.push(...pageCars);

      // 다음 페이지 확인
      const hasNextPage = await page.evaluate(() => {
        const nextBtn = document.querySelector('.pagination .next:not(.disabled), .paging .next:not(.disabled), a.next:not(.disabled)');
        return !!nextBtn;
      });

      if (hasNextPage && pageCars.length > 0) {
        // 다음 페이지로 이동
        await page.evaluate(() => {
          const nextBtn = document.querySelector('.pagination .next, .paging .next, a.next');
          if (nextBtn) nextBtn.click();
        });
        await delay(2000);
        pageNum++;
      } else {
        hasMore = false;
      }

      // 중간 저장 (10 페이지마다)
      if (pageNum % 10 === 0) {
        console.log(`  중간 저장: ${allCars.length}대`);
      }
    }

    console.log(`\n총 ${allCars.length}대 차량 수집 완료\n`);

    // 상세 정보 및 이미지 크롤링
    console.log('[2단계] 상세 정보 및 이미지 수집...\n');

    const detailedCars = [];
    let processed = 0;
    let imageCount = 0;

    for (const car of allCars) {
      processed++;
      const carNo = car.no || String(processed);

      console.log(`[${processed}/${allCars.length}] ${carNo} - ${car.name.substring(0, 30)}...`);

      try {
        // 상세 페이지 URL 구성
        const detailUrl = `${BASE_URL}/auction/exhibitView.do?acc=${car.meta.acc}&gn=${encodeURIComponent(car.meta.gn)}&rc=${car.meta.rc}&atn=${car.meta.atn}`;

        // 상세 정보 가져오기 (AJAX)
        const detailData = await page.evaluate(async (meta) => {
          try {
            const res = await fetch(`/auction/exhibitDetail.ajax`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `gn=${encodeURIComponent(meta.gn)}&rc=${meta.rc}&acc=${meta.acc}&atn=${meta.atn}`
            });
            const html = await res.text();

            // HTML에서 이미지 URL 추출
            const imgMatches = html.match(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi);
            const images = imgMatches ? [...new Set(imgMatches)] : [];

            // 추가 정보 추출
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const getTextByLabel = (label) => {
              const cells = doc.querySelectorAll('th, td, dt, dd');
              for (let i = 0; i < cells.length; i++) {
                if (cells[i].textContent?.includes(label) && cells[i + 1]) {
                  return cells[i + 1].textContent?.trim() || '';
                }
              }
              return '';
            };

            return {
              images,
              grade: getTextByLabel('등급') || getTextByLabel('성능등급'),
              usage: getTextByLabel('용도'),
              plateNumber: getTextByLabel('차량번호'),
              location: getTextByLabel('경매장'),
              lane: getTextByLabel('레인'),
              auctionRound: getTextByLabel('회차')
            };
          } catch (e) {
            return { images: [], error: e.message };
          }
        }, car.meta);

        // 이미지 다운로드 및 리사이징
        const localImages = [];
        const localThumbs = [];

        // 최대 5개 이미지 처리
        const imagesToProcess = (detailData.images || []).slice(0, 5);

        for (let i = 0; i < imagesToProcess.length; i++) {
          const imgUrl = imagesToProcess[i];
          try {
            const buffer = await downloadImage(imgUrl);
            const resized = await processImage(buffer, carNo, i);

            if (resized.main) {
              localImages.push(resized.main);
              imageCount++;
            }
            if (resized.thumb) {
              localThumbs.push(resized.thumb);
            }

            await delay(100);
          } catch (err) {
            console.log(`    이미지 ${i + 1} 실패: ${err.message}`);
          }
        }

        // 차량 데이터 구성
        const carData = {
          id: car.id,
          no: carNo,
          name: car.name,
          status: car.status,
          year: car.year.replace(/[^0-9]/g, ''),
          transmission: car.transmission,
          displacement: car.displacement,
          mileage: car.mileage,
          color: car.color,
          fuel: car.fuel,
          usage: detailData.usage || '',
          grade: detailData.grade || '',
          auctionRound: detailData.auctionRound || '',
          lane: detailData.lane || '',
          plateNumber: detailData.plateNumber || '',
          location: detailData.location || '',
          price: car.startPrice ? parseInt(car.startPrice.replace(/[^0-9]/g, '')) || null : null,
          hope: car.hopePrice ? parseInt(car.hopePrice.replace(/[^0-9]/g, '')) || null : null,
          instant: null,
          img: localThumbs[0] || localImages[0] || `/images/cars/${carNo}.jpg`,
          images: localImages,
          thumbs: localThumbs,
          url: `${BASE_URL}/auction/exhibitView.do?acc=${car.meta.acc}&gn=${encodeURIComponent(car.meta.gn)}&rc=${car.meta.rc}&atn=${car.meta.atn}`,
          meta: car.meta
        };

        detailedCars.push(carData);
        console.log(`    이미지 ${localImages.length}개 저장 완료`);

      } catch (err) {
        console.log(`    오류: ${err.message}`);
        detailedCars.push({
          ...car,
          img: `/images/cars/${carNo}.jpg`,
          images: [],
          thumbs: [],
          error: err.message
        });
      }

      await delay(DELAY_MS);

      // 배치 저장 (100대마다)
      if (processed % BATCH_SIZE === 0) {
        const result = {
          at: new Date().toISOString(),
          cnt: detailedCars.length,
          cars: detailedCars
        };
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2));
        console.log(`\n  [저장] ${processed}대 처리, ${imageCount}개 이미지\n`);
      }
    }

    // 최종 저장
    const result = {
      at: new Date().toISOString(),
      cnt: detailedCars.length,
      cars: detailedCars
    };
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('완료:', new Date().toLocaleString('ko-KR'));
    console.log(`총 차량: ${detailedCars.length}대`);
    console.log(`총 이미지: ${imageCount}개`);
    console.log(`저장 위치: ${OUTPUT_JSON}`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('크롤링 실패:', err);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
