#!/usr/bin/env node
/**
 * 오토벨 차량 크롤러 - 상세 정보 포함
 * - 목록 API로 전체 차량 수집
 * - 각 차량의 상세 API 호출하여 완전한 데이터 수집
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ============ 설정 ============
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/autobell-cars.json`;
const PAGE_SIZE = 100;
const DETAIL_BATCH_SIZE = 10; // 동시 상세 조회 수
const DETAIL_DELAY = 100; // 상세 조회 간 딜레이 (ms)
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (msg) => console.log(`[${new Date().toLocaleTimeString('ko-KR')}] ${msg}`);

async function main() {
  console.log('='.repeat(60));
  console.log('오토벨 전체 차량 크롤러 (상세 정보 포함)');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  log('사이트 접속 중...');
  await page.goto('https://www.autobell.co.kr/buy/list', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await delay(3000);

  // 전체 차량 보기 버튼 클릭
  const viewAllBtn = await page.$('text=/차량.*대.*보기/');
  if (viewAllBtn) {
    log('전체 차량 보기 버튼 클릭...');
    await viewAllBtn.click();
    await delay(5000);
  }

  log('현재 URL: ' + page.url());

  // ==================== 1단계: 목록 수집 ====================
  log('\n[1단계] 차량 목록 수집...');

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

    log(`  페이지 ${currentPage}: ${result.data.prdLst.length}대 (총 ${allCars.length}/${totalCount})`);

    if (allCars.length >= totalCount) {
      break;
    }

    currentPage++;
    await delay(200);
  }

  log(`목록 수집 완료: ${allCars.length}대`);

  // ==================== 2단계: 상세 정보 수집 ====================
  log('\n[2단계] 상세 정보 수집...');

  const carsWithDetails = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allCars.length; i += DETAIL_BATCH_SIZE) {
    const batch = allCars.slice(i, i + DETAIL_BATCH_SIZE);

    const detailPromises = batch.map(async (car) => {
      if (!car.dlrPrdId) {
        return { car, detail: null };
      }

      try {
        const detail = await page.evaluate(async (prdId) => {
          const res = await fetch('https://autobell.co.kr/api/buycar/detail.do', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              dlrPrdId: prdId
            }),
            credentials: 'include'
          });
          return await res.json();
        }, car.dlrPrdId);

        return { car, detail: detail?.data || null };
      } catch (err) {
        return { car, detail: null };
      }
    });

    const results = await Promise.all(detailPromises);

    for (const { car, detail } of results) {
      const carId = carsWithDetails.length + 1;

      // 상세 정보가 있으면 병합
      const detailData = detail?.prdInfo || {};
      const options = detail?.optionList || [];
      const images = detail?.prdImgList || [];

      const carData = {
        id: carId,
        prdId: car.dlrPrdId,
        crId: car.crId,
        name: car.crNm || detailData.crNm || '',
        plateNo: car.crNo || detailData.crNo || '',
        manufacturer: car.mnfcNm || detailData.mnfcNm || '',
        model: car.mdlNm || detailData.mdlNm || '',
        class: car.clsNm || detailData.clsNm || '',
        detailClass: car.dtlClsNm || detailData.dtlClsNm || null,
        year: car.frmYyyy || detailData.frmYyyy || '',
        regDate: car.frstRegDt || detailData.frstRegDt || '',
        mileage: car.drvDist || detailData.drvDist || 0,
        transmission: car.mss || detailData.mss || '',
        fuel: car.fuelNm || detailData.fuelNm || '',
        price: car.slAmt || detailData.slAmt || 0,
        location: car.locNm || detailData.locNm || '',
        dealerName: car.mrktCmplxNm || detailData.mrktCmplxNm || '',
        description: car.oneLineDesc || detailData.oneLineDesc || '',
        // 상세 정보 추가
        color: detailData.colorNm || car.colorNm || '',
        displacement: detailData.dsplc || car.dsplc || '',
        seater: detailData.psngrCpct || '',
        accidentHistory: detailData.acdtHstCnt || 0,
        ownerHistory: detailData.ownrChgHstCnt || 0,
        // 옵션 정보
        options: options.map(opt => opt.optNm || opt.optionNm).filter(Boolean),
        // 이미지 정보
        img: car.delePhtUrl ? `/images/cars/${carId}_thumb.jpg` : '/images/cars/default.jpg',
        images: images.map((img, idx) => ({
          url: img.prdImgUrl || img.imgUrl,
          type: img.imgTpNm || 'exterior'
        })),
        // 원본 이미지 URL (CDN용)
        originalImgUrl: car.delePhtUrl ? `https://static.glovis.net${car.delePhtUrl}` : null,
        thumbs: [],
        updatedAt: car.updDt || ''
      };

      carsWithDetails.push(carData);

      if (detail) {
        successCount++;
      } else {
        failCount++;
      }
    }

    process.stdout.write(`\r  진행: ${Math.min(i + DETAIL_BATCH_SIZE, allCars.length)}/${allCars.length} (성공: ${successCount}, 실패: ${failCount})`);

    await delay(DETAIL_DELAY);
  }

  console.log('\n');
  await browser.close();

  // ==================== 3단계: 저장 ====================
  log('[3단계] 데이터 저장...');

  const output = {
    crawledAt: new Date().toISOString(),
    totalCount: carsWithDetails.length,
    cars: carsWithDetails
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`총 차량: ${carsWithDetails.length}대`);
  console.log(`상세 정보 성공: ${successCount}개`);
  console.log(`상세 정보 실패: ${failCount}개`);
  console.log(`저장 위치: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
