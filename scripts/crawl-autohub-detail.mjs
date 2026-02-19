#!/usr/bin/env node
/**
 * 오토허브 옥션 상세정보 크롤러
 * - 차량 목록 + 상세 페이지 정보 수집
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';
const BASE_URL = 'https://www.sellcarauction.co.kr';
const OUTPUT_DIR = '/var/www/Jungcar/public/data';

async function main() {
  console.log('='.repeat(60));
  console.log('오토허브 옥션 상세정보 크롤러 시작');
  console.log('시간:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // 로그인
    console.log('\n[1/3] 로그인 중...');
    await page.goto(`${BASE_URL}/newfront/login.do`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => { document.getElementById('i_sLoginGubun2')?.click(); });
    await page.waitForTimeout(500);
    await page.evaluate(({ user, pass }) => {
      document.getElementById('i_sUserId').value = user;
      document.getElementById('i_sPswd').value = pass;
    }, { user: USERNAME, pass: PASSWORD });
    await page.evaluate(() => { fnLoginCheck(); });
    await page.waitForTimeout(4000);
    console.log('  로그인 완료');

    // 출품리스트 이동
    console.log('\n[2/3] 출품리스트 로딩...');
    await page.evaluate(() => { checkAuthority('AC1'); });
    await page.waitForTimeout(5000);

    // 전체 차량 수 확인
    const totalCars = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/총\s*(\d+)건/);
      return match ? parseInt(match[1]) : 0;
    });
    console.log(`  총 ${totalCars}대 차량 발견`);

    // 모든 페이지에서 차량 ID 수집
    const carIds = [];
    const carsPerPage = 10;
    const totalPages = Math.ceil(totalCars / carsPerPage);

    console.log(`  ${totalPages}페이지에서 차량 ID 수집 중...`);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const idsOnPage = await page.evaluate(() => {
        const ids = [];
        const links = document.querySelectorAll('a[onclick*="carInfo"]');
        links.forEach(link => {
          const onclick = link.getAttribute('onclick') || '';
          const match = onclick.match(/carInfo\(['"]([^'"]+)['"]\)/);
          if (match) ids.push(match[1]);
        });
        return ids;
      });
      carIds.push(...idsOnPage);

      if (pageNum < totalPages) {
        await page.evaluate((np) => { CmPageMove(String(np)); }, pageNum + 1);
        await page.waitForTimeout(1500);
      }

      if (pageNum % 20 === 0) {
        console.log(`    ${pageNum}/${totalPages} 페이지 완료 (${carIds.length}개 ID 수집)`);
      }
    }

    // 중복 제거
    const uniqueCarIds = [...new Set(carIds)];
    console.log(`  총 ${uniqueCarIds.length}개 차량 ID 수집 완료`);

    // 각 차량 상세 정보 수집
    console.log('\n[3/3] 상세정보 수집 중...');
    const allCars = [];
    const maxCars = uniqueCarIds.length;

    // 첫 페이지로 돌아가기
    await page.evaluate(() => { checkAuthority('AC1'); });
    await page.waitForTimeout(3000);

    for (let i = 0; i < maxCars; i++) {
      const carId = uniqueCarIds[i];

      // 진행상황 출력 (100개마다)
      if (i % 100 === 0 || i < 10) {
        console.log(`  [${i + 1}/${maxCars}] 차량 ${carId} 수집 중...`);
      }

      try {
        // 상세 페이지로 이동
        await page.evaluate((id) => { carInfo(id); }, carId);
        await page.waitForTimeout(3000);

        // 상세 정보 추출
        const carDetail = await page.evaluate((baseUrl) => {
          const text = document.body.innerText;
          const detail = {};

          // 기본 정보
          detail.exhibitNo = text.match(/출품번호\s*(\d+)/)?.[1] || '';
          detail.parkingNo = text.match(/주차번호\s*([A-Z0-9-]+)/)?.[1] || '';
          detail.carNo = text.match(/차량번호\s*([^\n]+)/)?.[1]?.trim() || '';
          detail.vinNo = text.match(/차대번호\s*([A-Z0-9]+)/)?.[1] || '';
          detail.year = text.match(/연식\s*(\d{4})/)?.[1] || '';
          detail.engineType = text.match(/원동기형식\s*([^\n]+)/)?.[1]?.trim() || '';
          detail.fuel = text.match(/연료\s*([^\n]+)/)?.[1]?.trim() || '';
          detail.mileage = text.match(/주행거리\s*([\d,]+)/)?.[1] || '';
          detail.displacement = text.match(/배기량\s*([\d,]+)/)?.[1] || '';
          detail.history = text.match(/경력\s*([^\n]+)/)?.[1]?.trim() || '';
          detail.transmission = text.match(/변속기\s*([^\n]+)/)?.[1]?.trim() || '';
          detail.color = text.match(/색상\s*([^\(]+)/)?.[1]?.trim() || '';
          detail.carType = text.match(/차종\s*([^\n]+)/)?.[1]?.trim() || '';

          // 차량명
          const titleMatch = text.match(/\[(\d+)\]\s*([^\n]+)/);
          if (titleMatch) {
            detail.name = titleMatch[2].trim();
          }

          // 시작가
          detail.startPrice = text.match(/시작가\s*:\s*([\d,]+)/)?.[1] || '';

          // 성능평가정보
          const evalMatch = text.match(/평가점\s*골격\s*:\s*([A-Z])\s*외관\s*:\s*([A-Z])/);
          if (evalMatch) {
            detail.evalFrame = evalMatch[1];
            detail.evalExterior = evalMatch[2];
          }
          detail.inspector = text.match(/점검원\s*([^\n]+)/)?.[1]?.trim() || '';
          detail.storage = text.match(/보관물품\s*([^\n]+)/)?.[1]?.trim() || '';
          detail.note = text.match(/비고\s*([^\n]+)/)?.[1]?.trim() || '';

          // 옵션 정보 - 편의
          const convMatch = text.match(/편의\s*([^\n]*(?:네비|HID|스마트키|어라운드뷰|파워트렁크|HUD|후측방|LDWS|하이패스|크루즈)[^\n]*)/);
          detail.convenienceOptions = convMatch ? convMatch[1].trim() : '';

          // 선루프
          const srMatch = text.match(/SR\(선루프\)\s*([^\n]+)/);
          detail.sunroof = srMatch ? srMatch[1].trim() : '';

          // 시트
          const seatMatch = text.match(/시트\s*([^\n]*(?:열선|메모리|통풍)[^\n]*)/);
          detail.seatOptions = seatMatch ? seatMatch[1].trim() : '';

          // 전동시트
          const powerSeatMatch = text.match(/전동시트\s*([^\n]+)/);
          detail.powerSeat = powerSeatMatch ? powerSeatMatch[1].trim() : '';

          // 기능평가 상세
          const funcEvalMatch = text.match(/기능평가정보 상세\s*([^\n]+)/);
          detail.funcEvalDetail = funcEvalMatch ? funcEvalMatch[1].trim() : '';

          // 전손/침수
          detail.totalLoss = text.includes('전손사고 : Y');
          detail.floodTotal = text.includes('침수전손사고 : Y');
          detail.floodPartial = text.includes('침수분손사고 : Y');

          // 특기사항
          const remarkMatch = text.match(/특기사항\/점검자 의견\s*([^\n]+)/);
          detail.remarks = remarkMatch ? remarkMatch[1].trim() : '';

          // 이미지들
          const imgs = document.querySelectorAll('img');
          detail.images = Array.from(imgs)
            .filter(img => img.src && img.src.includes('INSPECT') && img.src.includes('_L.jpg'))
            .map(img => img.src)
            .slice(0, 20);

          // 썸네일 이미지
          const thumbImg = Array.from(imgs).find(img => img.src && img.src.includes('INSPECT') && img.src.includes('_M.jpg'));
          detail.thumbnail = thumbImg ? thumbImg.src : (detail.images[0] || '');

          return detail;
        }, BASE_URL);

        if (carDetail.exhibitNo || carDetail.name) {
          allCars.push(carDetail);
        }

        // 목록으로 돌아가기
        await page.goBack();
        await page.waitForTimeout(2000);

      } catch (err) {
        console.log(`    에러: ${err.message}`);
        // 오류 시 목록으로 재이동
        await page.evaluate(() => { checkAuthority('AC1'); });
        await page.waitForTimeout(3000);
      }
    }

    console.log(`\n총 ${allCars.length}대 상세정보 수집 완료`);

    // 결과 저장
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const result = {
      updatedAt: new Date().toISOString(),
      totalCount: allCars.length,
      cars: allCars.map(car => ({
        id: car.exhibitNo,
        name: car.name || '',
        nameKr: car.name || '',
        brand: extractBrand(car.name),
        model: extractModel(car.name),
        year: parseInt(car.year) || new Date().getFullYear(),
        mileage: parseInt((car.mileage || '0').replace(/,/g, '')),
        mileageFormatted: car.mileage ? car.mileage + ' km' : '',
        price: parseInt((car.startPrice || '0').replace(/,/g, '')),
        priceFormatted: car.startPrice ? car.startPrice + '만원' : 'Price TBD',
        fuel: translateFuel(car.fuel),
        transmission: car.transmission?.includes('오토') ? 'Automatic' : 'Manual',
        bodyType: getBodyType(car.name),
        color: translateColor(car.color),
        image: car.thumbnail || '/Jungcar/images/auction/car-placeholder.jpg',
        images: car.images || [],
        status: 'Available',

        // 상세 정보
        detail: {
          exhibitNo: car.exhibitNo,
          parkingNo: car.parkingNo,
          carNo: car.carNo,
          vinNo: car.vinNo,
          engineType: car.engineType,
          displacement: car.displacement,
          history: car.history,
          carType: car.carType,

          // 성능평가
          evalFrame: car.evalFrame || '-',
          evalExterior: car.evalExterior || '-',
          inspector: car.inspector,
          storage: car.storage,
          note: car.note,

          // 옵션
          convenienceOptions: car.convenienceOptions,
          sunroof: car.sunroof,
          seatOptions: car.seatOptions,
          powerSeat: car.powerSeat,

          // 상태
          funcEvalDetail: car.funcEvalDetail,
          totalLoss: car.totalLoss,
          floodTotal: car.floodTotal,
          floodPartial: car.floodPartial,
          remarks: car.remarks,
        }
      }))
    };

    const outputPath = path.join(OUTPUT_DIR, 'autohub-cars.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    const fileSize = fs.statSync(outputPath).size;
    console.log(`\n저장 완료: ${outputPath} (${(fileSize / 1024).toFixed(1)}KB)`);

    // 샘플 출력
    if (result.cars.length > 0) {
      console.log('\n샘플 차량:');
      result.cars.slice(0, 3).forEach((c, i) => {
        console.log(`  ${i + 1}. [${c.id}] ${c.name}`);
        console.log(`     이미지: ${c.images?.length || 0}장, 옵션: ${c.detail.convenienceOptions?.substring(0, 30)}...`);
      });
    }

  } catch (error) {
    console.error('크롤링 에러:', error.message);
    await page.screenshot({ path: '/tmp/autohub-detail-error.png' });
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(60));
  console.log('크롤링 완료:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));
}

// Helper functions
function extractBrand(name) {
  if (!name) return 'Other';
  const brands = {
    '현대': 'Hyundai', '기아': 'Kia', '제네시스': 'Genesis',
    '벤츠': 'Mercedes-Benz', 'BMW': 'BMW', '아우디': 'Audi',
    '폭스바겐': 'Volkswagen', '도요타': 'Toyota', '혼다': 'Honda',
    '렉서스': 'Lexus', '닛산': 'Nissan', '볼보': 'Volvo',
    '쉐보레': 'Chevrolet', '쌍용': 'Ssangyong', '르노': 'Renault',
    '포드': 'Ford', '지프': 'Jeep', '테슬라': 'Tesla',
    '랜드로버': 'Land Rover', '재규어': 'Jaguar', '포르쉐': 'Porsche',
    '링컨': 'Lincoln', '캐딜락': 'Cadillac', '마세라티': 'Maserati',
    '미니': 'Mini', '인피니티': 'Infiniti',
  };
  for (const [kr, en] of Object.entries(brands)) {
    if (name.includes(kr)) return en;
  }
  return 'Other';
}

function extractModel(name) {
  if (!name) return '';
  // 브랜드명 제거 후 반환
  return name.replace(/^(현대|기아|제네시스|벤츠|BMW|아우디|폭스바겐|도요타|혼다|렉서스|닛산|볼보|쉐보레|쌍용|르노|포드|지프|테슬라|랜드로버|재규어|포르쉐|링컨|캐딜락|마세라티|미니|인피니티)\s*/, '').trim();
}

function translateFuel(fuel) {
  if (!fuel) return 'Gasoline';
  if (fuel.includes('경유') || fuel.includes('디젤')) return 'Diesel';
  if (fuel.includes('전기')) return 'Electric';
  if (fuel.includes('하이브리드')) return 'Hybrid';
  if (fuel.includes('LPG')) return 'LPG';
  return 'Gasoline';
}

function translateColor(color) {
  if (!color) return 'Unknown';
  const colors = {
    '흰색': 'White', '백색': 'White', '검정': 'Black', '은색': 'Silver',
    '회색': 'Gray', '파랑': 'Blue', '빨강': 'Red', '노랑': 'Yellow',
    '녹색': 'Green', '갈색': 'Brown', '베이지': 'Beige', '진주': 'Pearl',
  };
  for (const [kr, en] of Object.entries(colors)) {
    if (color.includes(kr)) return en;
  }
  return color || 'Other';
}

function getBodyType(name) {
  if (!name) return 'Sedan';
  if (/SUV|투싼|싼타페|쏘렌토|스포티지|팰리세이드|코나|셀토스|티볼리|렉스턴|티구안|QM6/.test(name)) return 'SUV';
  if (/카니발|스타리아|스타렉스|승합/.test(name)) return 'Van';
  if (/화물|트럭|포터|봉고/.test(name)) return 'Truck';
  return 'Sedan';
}

main().catch(console.error);
