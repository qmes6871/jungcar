#!/usr/bin/env node
/**
 * 오토벨 차량 전체 상세 정보 크롤러
 * - 목록 API로 전체 차량 수집
 * - 각 차량의 상세 API 호출하여 완전한 데이터 수집
 * - 다중 이미지, 옵션, 성능점검 정보 포함
 */

import { chromium } from 'playwright';
import fs from 'fs';

// ============ 설정 ============
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/autobell-cars.json`;
const PAGE_SIZE = 100;
const DETAIL_BATCH_SIZE = 5; // 동시 상세 조회 수 (서버 부하 방지)
const DETAIL_DELAY = 300; // 상세 조회 간 딜레이 (ms)
// ==============================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (msg) => console.log(`[${new Date().toLocaleTimeString('ko-KR')}] ${msg}`);

async function main() {
  console.log('='.repeat(60));
  console.log('오토벨 전체 차량 상세 크롤러');
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
  log('\n[2단계] 상세 정보 수집 (이미지, 옵션, 성능점검 포함)...');

  const carsWithDetails = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allCars.length; i += DETAIL_BATCH_SIZE) {
    const batch = allCars.slice(i, i + DETAIL_BATCH_SIZE);

    const detailPromises = batch.map(async (car) => {
      if (!car.dlrPrdId) {
        return { car, detail: null, images: [], options: [], performance: null };
      }

      try {
        // 상세 정보 API 호출
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

        return {
          car,
          detail: detail?.data || null,
          prdInfo: detail?.data?.prdInfo || null,
          images: detail?.data?.prdImgList || [],
          options: detail?.data?.optionList || [],
          performance: detail?.data?.pfmChkInfo || null,
          accident: detail?.data?.acdtInfo || null,
          insurance: detail?.data?.insuranceInfo || null
        };
      } catch (err) {
        return { car, detail: null, images: [], options: [], performance: null };
      }
    });

    const results = await Promise.all(detailPromises);

    for (const result of results) {
      const { car, prdInfo, images, options, performance, accident, insurance } = result;
      const carId = carsWithDetails.length + 1;
      const detailData = prdInfo || {};

      // 이미지 URL 목록 생성
      const imageList = images.map(img => {
        const imgPath = img.prdImgUrl || img.imgUrl || '';
        if (imgPath) {
          return {
            url: `https://img.autobell.co.kr/?src=https://static.glovis.net${imgPath}&type=w&w=1200&quality=90&ttype=jpg`,
            type: img.imgTpNm || img.imgTpCd || 'exterior',
            order: img.imgOrd || 0
          };
        }
        return null;
      }).filter(Boolean);

      // 썸네일 이미지
      const thumbList = images.slice(0, 5).map(img => {
        const imgPath = img.prdImgUrl || img.imgUrl || '';
        if (imgPath) {
          return `https://img.autobell.co.kr/?src=https://static.glovis.net${imgPath}&type=w&w=400&quality=80&ttype=jpg`;
        }
        return null;
      }).filter(Boolean);

      // 대표 이미지 - glovis.net 원본 URL 직접 사용
      let mainImage = '/images/cars/default.jpg';
      if (car.delePhtUrl && car.delePhtUrl.includes('/picture/')) {
        // 정상적인 이미지 경로 (/picture/dlr/prd/carImg/...)
        const imgPath = car.delePhtUrl.startsWith('/') ? car.delePhtUrl : '/' + car.delePhtUrl;
        mainImage = `https://static.glovis.net${imgPath}`;
      } else if (imageList.length > 0) {
        mainImage = imageList[0].url;
      }
      // 그 외 경우는 기본 이미지 사용 (/images/cars/default.jpg)

      // 옵션 목록
      const optionList = options.map(opt => ({
        name: opt.optNm || opt.optionNm || '',
        category: opt.optCtgNm || opt.ctgNm || '',
        code: opt.optCd || ''
      })).filter(opt => opt.name);

      // 성능점검 정보
      const performanceInfo = performance ? {
        checkDate: performance.pfmChkDt || '',
        mileage: performance.drvDist || 0,
        transmissionStatus: performance.mssStts || '',
        engineStatus: performance.engStts || '',
        overallGrade: performance.totGrd || '',
        specialNote: performance.splNote || ''
      } : null;

      // 사고이력 정보
      const accidentInfo = accident ? {
        totalCount: accident.acdtHstCnt || 0,
        myDamageCount: accident.myDmgCnt || 0,
        otherDamageCount: accident.otDmgCnt || 0,
        floodDamage: accident.fldDmgYn === 'Y',
        totalLoss: accident.totLossYn === 'Y'
      } : null;

      const carData = {
        id: carId,
        prdId: car.dlrPrdId || '',
        crId: car.crId || '',
        // 기본 정보
        name: car.crNm || detailData.crNm || '',
        plateNo: car.crNo || detailData.crNo || '',
        manufacturer: car.mnfcNm || detailData.mnfcNm || '',
        model: car.mdlNm || detailData.mdlNm || '',
        class: car.clsNm || detailData.clsNm || '',
        detailClass: car.dtlClsNm || detailData.dtlClsNm || null,
        // 연식/주행
        year: car.frmYyyy || detailData.frmYyyy || '',
        regDate: car.frstRegDt || detailData.frstRegDt || '',
        mileage: car.drvDist || detailData.drvDist || 0,
        // 사양
        transmission: car.mss || detailData.mss || '',
        fuel: car.fuelNm || detailData.fuelNm || '',
        displacement: detailData.dsplc || car.dsplc || '',
        color: detailData.colorNm || car.colorNm || '',
        seater: detailData.psngrCpct || '',
        // 가격/위치
        price: car.slAmt || detailData.slAmt || 0,
        location: car.locNm || detailData.locNm || '',
        dealerName: car.mrktCmplxNm || detailData.mrktCmplxNm || '',
        dealerContact: detailData.dlrTelNo || '',
        // 상세 설명
        description: car.oneLineDesc || detailData.oneLineDesc || '',
        detailDescription: detailData.prdDesc || '',
        // 이미지
        img: mainImage,
        images: imageList,
        thumbs: thumbList,
        imageCount: imageList.length,
        // 옵션
        options: optionList,
        optionCount: optionList.length,
        // 성능점검
        performance: performanceInfo,
        // 사고이력
        accident: accidentInfo,
        accidentCount: accident?.acdtHstCnt || 0,
        ownerCount: detailData.ownrChgHstCnt || 0,
        // 보증
        warranty: insurance ? {
          hasWarranty: insurance.ewInsuYn === 'Y',
          type: insurance.ewInsuTpNm || '',
          period: insurance.ewInsuPrd || ''
        } : null,
        // 메타
        updatedAt: car.updDt || '',
        viewCount: detailData.inqCnt || 0,
        likeCount: detailData.likeCnt || 0
      };

      carsWithDetails.push(carData);

      if (result.detail) {
        successCount++;
      } else {
        failCount++;
      }
    }

    const progress = Math.min(i + DETAIL_BATCH_SIZE, allCars.length);
    process.stdout.write(`\r  진행: ${progress}/${allCars.length} (성공: ${successCount}, 실패: ${failCount})`);

    // 중간 저장 (500대마다)
    if (progress % 500 === 0) {
      const tempOutput = {
        crawledAt: new Date().toISOString(),
        totalCount: carsWithDetails.length,
        status: 'crawling',
        cars: carsWithDetails
      };
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(tempOutput, null, 2));
      log(`\n  중간 저장: ${carsWithDetails.length}대`);
    }

    await delay(DETAIL_DELAY);
  }

  console.log('\n');
  await browser.close();

  // ==================== 3단계: 최종 저장 ====================
  log('[3단계] 데이터 저장...');

  // 유효한 차량만 필터링 (이름이 있는 차량)
  const validCars = carsWithDetails.filter(car => car.name && car.name.trim() !== '');

  const output = {
    crawledAt: new Date().toISOString(),
    totalCount: validCars.length,
    status: 'complete',
    cars: validCars
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  // 통계
  const carsWithImages = validCars.filter(c => c.imageCount > 0).length;
  const carsWithOptions = validCars.filter(c => c.optionCount > 0).length;
  const carsWithPerformance = validCars.filter(c => c.performance).length;
  const totalImages = validCars.reduce((sum, c) => sum + c.imageCount, 0);
  const totalOptions = validCars.reduce((sum, c) => sum + c.optionCount, 0);

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));
  console.log(`총 차량: ${validCars.length}대`);
  console.log(`상세 정보 성공: ${successCount}개`);
  console.log(`상세 정보 실패: ${failCount}개`);
  console.log('-'.repeat(40));
  console.log(`이미지 보유 차량: ${carsWithImages}대 (총 ${totalImages}장)`);
  console.log(`옵션 정보 차량: ${carsWithOptions}대 (총 ${totalOptions}개 옵션)`);
  console.log(`성능점검 차량: ${carsWithPerformance}대`);
  console.log('-'.repeat(40));
  console.log(`저장 위치: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
