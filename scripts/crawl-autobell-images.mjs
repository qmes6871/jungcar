#!/usr/bin/env node
/**
 * 오토벨 차량 이미지 다운로드 및 리사이징
 * - 이미 수집된 JSON 데이터 기반
 * - 병렬 다운로드로 빠른 처리
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

// ============ 설정 ============
const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_FILE = '/var/www/Jungcar/public/data/autobell-cars.json';

const CONCURRENT = 30; // 동시 다운로드 수
const MAX_RETRIES = 2;

const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 }
};
// ==============================

function downloadImage(url, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.autobell.co.kr/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, retries).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => downloadImage(url, retries - 1).then(resolve).catch(reject), 300);
      } else {
        reject(err);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function processImage(buffer, carId) {
  try {
    // 썸네일
    await sharp(buffer)
      .resize(SIZES.thumb.width, SIZES.thumb.height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(path.join(OUTPUT_DIR, `${carId}_thumb.jpg`));

    // 메인
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(path.join(OUTPUT_DIR, `${carId}_main.jpg`));

    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('오토벨 차량 이미지 다운로드');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  // 데이터 로드
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  console.log(`\n총 ${data.totalCount}대 차량`);

  // 이미지 URL 재구성을 위해 원본 데이터 다시 로드
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  console.log('\n사이트 접속 중...');
  await page.goto('https://www.autobell.co.kr/buy/list', { waitUntil: 'networkidle', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));

  const btn = await page.$('text=/차량.*대.*보기/');
  if (btn) await btn.click();
  await new Promise(r => setTimeout(r, 5000));

  // 모든 차량의 이미지 URL 수집
  console.log('\n이미지 URL 수집 중...');

  const imageUrls = [];
  let currentPage = 1;

  while (imageUrls.length < data.totalCount) {
    const result = await page.evaluate(async (params) => {
      const res = await fetch('https://autobell.co.kr/api/buycar/selectGeneralList.do', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isMobile: 'N',
          cho: [],
          carType: [],
          crMnfcCd: '', crMnfcNm: '', crMdlCd: '', crMdlNm: '',
          crDtlMdlCd: [], crDtlMdlNm: [], crClsCd: [], crClsNm: [],
          crDtlClsCd: [], crDtlClsNm: [], selectedModels: [],
          yearRange: {min: 1990, max: 2026},
          distanceRange: {min: 0, max: 990000},
          priceRange: {min: 0, max: 9999999},
          loc: [], carOption: [], color: [], fuel: [], mss: [], svc: [],
          brndGrpTp: '', brndGrpId: '', brndCmpnId: '', mrktCmplxSeqNo: '',
          acdt: [], searchTerm: '',
          currentPage: params.page,
          countPerPage: 100,
          countPerMore: 100,
          type: 'normal', viewType: '0', tab: '0',
          subTab: '', detailTab: '', listType: 'card',
          homeSvc: 'N', ewInsuSvc: 'N', order: 'upd_dt',
          selected: [], selectedList: [],
          advConditionStack: [], smpConditionStack: [],
          filterTab: '1'
        }),
        credentials: 'include'
      });
      const json = await res.json();
      return json.data?.prdLst?.map(car => car.delePhtUrl) || [];
    }, { page: currentPage });

    if (result.length === 0) break;
    imageUrls.push(...result);
    process.stdout.write(`\r  ${imageUrls.length}/${data.totalCount} URL 수집`);
    currentPage++;
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n\n${imageUrls.length}개 URL 수집 완료`);
  await browser.close();

  // 이미지 다운로드
  console.log('\n이미지 다운로드 및 리사이징...');

  let success = 0, fail = 0;

  for (let i = 0; i < imageUrls.length; i += CONCURRENT) {
    const batch = imageUrls.slice(i, i + CONCURRENT);

    const promises = batch.map(async (phtUrl, batchIdx) => {
      const carId = i + batchIdx + 1;

      if (!phtUrl) return false;

      // 올바른 URL 형식으로 구성
      // /picture/dlr/prd/carImg/{crId}/normal/{hash} -> /picture/dlr/prd/carImg/{crId}/normal/thumb/{hash}_M
      const parts = phtUrl.split('/');
      const hash = parts.pop();
      const thumbUrl = `https://img.autobell.co.kr/?src=${encodeURIComponent('https://static.glovis.net' + parts.join('/') + '/thumb/' + hash + '_M')}&type=w&w=3000&quality=90&ttype=jpg`;

      try {
        const buffer = await downloadImage(thumbUrl);
        const ok = await processImage(buffer, carId);
        return ok;
      } catch (err) {
        return false;
      }
    });

    const results = await Promise.all(promises);
    success += results.filter(r => r).length;
    fail += results.filter(r => !r).length;

    process.stdout.write(`\r  진행: ${i + batch.length}/${imageUrls.length} (성공: ${success}, 실패: ${fail})`);
  }

  // JSON 업데이트
  console.log('\n\n데이터 업데이트 중...');

  data.cars = data.cars.map((car, idx) => {
    const carId = idx + 1;
    const hasImage = fs.existsSync(path.join(OUTPUT_DIR, `${carId}_thumb.jpg`));

    return {
      ...car,
      img: hasImage ? `/images/cars/${carId}_thumb.jpg` : '/images/cars/default.jpg',
      images: hasImage ? [`/images/cars/${carId}_main.jpg`] : [],
      thumbs: hasImage ? [`/images/cars/${carId}_thumb.jpg`] : []
    };
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`이미지 성공: ${success}개`);
  console.log(`이미지 실패: ${fail}개`);
  console.log('='.repeat(60));
}

main().catch(console.error);
