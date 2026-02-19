#!/usr/bin/env node
/**
 * 오토벨 일반차량 전체 크롤러 (7,443대)
 * - API 직접 호출로 빠른 크롤링
 * - 병렬 이미지 다운로드 및 리사이징
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

// ============ 설정 ============
const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/autobell-cars.json`;

const PAGE_SIZE = 100; // 페이지당 차량 수
const CONCURRENT_IMAGES = 20; // 동시 이미지 다운로드 수
const MAX_RETRIES = 3;

// 이미지 크기 설정
const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 },
  large: { width: 1600, height: 1200 }
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
        'Referer': 'https://www.autobell.co.kr/'
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
    results.thumb = `/images/cars/${carId}_thumb.jpg`;

    // 메인
    const mainPath = path.join(OUTPUT_DIR, `${carId}_main.jpg`);
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mainPath);
    results.main = `/images/cars/${carId}_main.jpg`;

    // 기본 이미지
    const defaultPath = path.join(OUTPUT_DIR, `${carId}.jpg`);
    await sharp(buffer)
      .resize(800, 600, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(defaultPath);
    results.default = `/images/cars/${carId}.jpg`;
  } catch (err) {
    // 무시
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('오토벨 전체 차량 크롤러 (7,443대)');
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

  console.log('\n[1단계] 사이트 접속 및 전체 차량 페이지 이동...');

  // 먼저 사이트 방문
  await page.goto('https://www.autobell.co.kr/buy/list', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await delay(3000);

  // '차량 X대 보기' 버튼 클릭해서 전체 차량 페이지로 이동
  const viewAllBtn = await page.$('text=/차량.*대.*보기/');
  if (viewAllBtn) {
    console.log('  전체 차량 보기 버튼 클릭...');
    await viewAllBtn.click();
    await delay(5000);
  }

  console.log('  현재 URL:', page.url());

  // 차량 데이터 수집
  console.log('\n[2단계] 차량 목록 수집...');

  const allCars = [];
  let currentPage = 1;
  let totalCount = 0;

  while (true) {
    const result = await page.evaluate(async (params) => {
      const res = await fetch('https://autobell.co.kr/api/buycar/selectGeneralList.do', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          isMobile: 'N',
          cho: [],
          carType: [],
          crMnfcCd: '',
          crMnfcNm: '',
          crMdlCd: '',
          crMdlNm: '',
          crDtlMdlCd: [],
          crDtlMdlNm: [],
          crClsCd: [],
          crClsNm: [],
          crDtlClsCd: [],
          crDtlClsNm: [],
          selectedModels: [],
          yearRange: {min: 1990, max: 2026},
          distanceRange: {min: 0, max: 990000},
          priceRange: {min: 0, max: 9999999},
          loc: [],
          carOption: [],
          color: [],
          fuel: [],
          mss: [],
          svc: [],
          brndGrpTp: '',
          brndGrpId: '',
          brndCmpnId: '',
          mrktCmplxSeqNo: '',
          acdt: [],
          searchTerm: '',
          currentPage: params.currentPage,
          countPerPage: params.pageSize,
          countPerMore: params.pageSize,
          type: 'normal',
          viewType: '0',
          tab: '0',
          subTab: '',
          detailTab: '',
          listType: 'card',
          homeSvc: 'N',
          ewInsuSvc: 'N',
          order: 'upd_dt',
          selected: [],
          selectedList: [],
          advConditionStack: [],
          smpConditionStack: [],
          filterTab: '1'
        }),
        credentials: 'include'
      });
      return await res.json();
    }, { currentPage, pageSize: PAGE_SIZE });

    if (!result.data || !result.data.prdLst || result.data.prdLst.length === 0) {
      break;
    }

    totalCount = result.data.totalCount;
    allCars.push(...result.data.prdLst);

    console.log(`  페이지 ${currentPage}: ${result.data.prdLst.length}대 (총 ${allCars.length}/${totalCount})`);

    if (allCars.length >= totalCount) {
      break;
    }

    currentPage++;
    await delay(200);
  }

  console.log(`\n총 ${allCars.length}대 차량 데이터 수집 완료`);

  await browser.close();

  // 이미지 다운로드 및 처리
  console.log('\n[3단계] 이미지 다운로드 및 리사이징...');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allCars.length; i += CONCURRENT_IMAGES) {
    const batch = allCars.slice(i, i + CONCURRENT_IMAGES);

    const promises = batch.map(async (car, batchIdx) => {
      const carId = i + batchIdx + 1;

      if (!car.delePhtUrl) {
        return { carId, success: false };
      }

      const imgUrl = `https://img.autobell.co.kr/?src=https://static.glovis.net${car.delePhtUrl}&type=w&w=1200&quality=90&ttype=jpg`;

      try {
        const buffer = await downloadImage(imgUrl);
        const resized = await processImage(buffer, carId);
        return { carId, success: true, images: resized };
      } catch (err) {
        return { carId, success: false };
      }
    });

    const results = await Promise.all(promises);
    successCount += results.filter(r => r.success).length;
    failCount += results.filter(r => !r.success).length;

    process.stdout.write(`\r  진행: ${i + batch.length}/${allCars.length} (성공: ${successCount}, 실패: ${failCount})`);
  }

  console.log('\n');

  // 차량 데이터 변환 및 저장
  console.log('[4단계] 데이터 저장...');

  const cars = allCars.map((car, idx) => {
    const carId = idx + 1;
    const hasImage = fs.existsSync(path.join(OUTPUT_DIR, `${carId}_thumb.jpg`));

    return {
      id: carId,
      prdId: car.dlrPrdId,
      crId: car.crId,
      name: car.crNm,
      plateNo: car.crNo,
      manufacturer: car.mnfcNm,
      model: car.mdlNm,
      class: car.clsNm,
      detailClass: car.dtlClsNm,
      year: car.frmYyyy,
      regDate: car.frstRegDt,
      mileage: car.drvDist,
      transmission: car.mss,
      fuel: car.fuelNm,
      price: car.slAmt,
      location: car.locNm,
      dealerName: car.mrktCmplxNm,
      description: car.oneLineDesc,
      img: hasImage ? `/images/cars/${carId}_thumb.jpg` : '/images/cars/default.jpg',
      images: hasImage ? [`/images/cars/${carId}_main.jpg`] : [],
      thumbs: hasImage ? [`/images/cars/${carId}_thumb.jpg`] : [],
      updatedAt: car.updDt
    };
  });

  // JSON 저장
  const output = {
    crawledAt: new Date().toISOString(),
    totalCount: cars.length,
    cars: cars
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`총 차량: ${cars.length}대`);
  console.log(`이미지 성공: ${successCount}개`);
  console.log(`저장 위치: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
