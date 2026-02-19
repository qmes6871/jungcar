#!/usr/bin/env node
/**
 * 오토허브 옥션 배치 상세정보 크롤러
 * - 안정적인 배치 처리
 * - 자동 저장 및 재시작 지원
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';
const BASE_URL = 'https://www.sellcarauction.co.kr';
const OUTPUT_FILE = '/var/www/Jungcar/public/data/autohub-cars.json';
const BATCH_SIZE = 10; // 한번에 처리할 차량 수

const brandMap = {
  '현대': 'Hyundai', '기아': 'Kia', '제네시스': 'Genesis', '쉐보레': 'Chevrolet',
  '르노삼성': 'Renault', '르노코리아': 'Renault', '쌍용': 'Ssangyong',
  'KG모빌리티': 'KG Mobility', 'BMW': 'BMW', '벤츠': 'Mercedes-Benz',
  '메르세데스': 'Mercedes-Benz', '아우디': 'Audi', '폭스바겐': 'Volkswagen',
  '도요타': 'Toyota', '혼다': 'Honda', '렉서스': 'Lexus', '닛산': 'Nissan',
  '볼보': 'Volvo', '포르쉐': 'Porsche', '랜드로버': 'Land Rover',
  '재규어': 'Jaguar', '포드': 'Ford', '지프': 'Jeep', '테슬라': 'Tesla',
  '미니': 'Mini', '인피니티': 'Infiniti', '링컨': 'Lincoln', '캐딜락': 'Cadillac',
  '마세라티': 'Maserati',
};

async function main() {
  // 기존 데이터 로드
  let existingData = { cars: [], totalCount: 0 };
  try {
    existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE));
  } catch (e) {}

  // 이미 상세정보가 있는 차량 ID
  const detailedIds = new Set(
    existingData.cars
      .filter(c => c.images && c.images.length > 5)
      .map(c => c.id)
  );

  console.log('='.repeat(60));
  console.log('오토허브 배치 상세 크롤러');
  console.log('기존 차량:', existingData.totalCount);
  console.log('상세정보 완료:', detailedIds.size);
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
  let processedInSession = 0;
  let newDetailsCount = 0;

  try {
    // 로그인
    console.log('\n로그인 중...');
    await page.goto(`${BASE_URL}/newfront/login.do`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => { document.getElementById('i_sLoginGubun2')?.click(); });
    await page.waitForTimeout(500);
    await page.evaluate(({ user, pass }) => {
      document.getElementById('i_sUserId').value = user;
      document.getElementById('i_sPswd').value = pass;
    }, { user: USERNAME, pass: PASSWORD });
    await page.evaluate(() => { fnLoginCheck(); });
    await page.waitForTimeout(4000);
    console.log('로그인 완료');

    // 출품리스트
    console.log('출품리스트 로딩...');
    await page.evaluate(() => { checkAuthority('AC1'); });
    await page.waitForTimeout(5000);

    const totalCars = await page.evaluate(() => {
      const match = document.body.innerText.match(/총\s*(\d+)건/);
      return match ? parseInt(match[1]) : 0;
    });
    console.log(`총 ${totalCars}대`);

    const totalPages = Math.ceil(totalCars / 10);

    // 페이지별 처리
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      // 현재 페이지의 차량 정보 수집
      const pageCarIds = await page.evaluate(() => {
        const ids = [];
        document.querySelectorAll('a[onclick*="carInfo"]').forEach(link => {
          const match = link.getAttribute('onclick')?.match(/carInfo\(['"]([^'"]+)['"]\)/);
          if (match && !ids.includes(match[1])) ids.push(match[1]);
        });
        return ids.slice(0, 10);
      });

      // 상세정보 없는 차량만 필터링
      const needDetail = pageCarIds.filter(id => !detailedIds.has(id));

      if (needDetail.length === 0) {
        // 다음 페이지로
        if (pageNum < totalPages) {
          await page.evaluate((np) => { CmPageMove(String(np)); }, pageNum + 1);
          await page.waitForTimeout(1500);
        }
        continue;
      }

      console.log(`\n[페이지 ${pageNum}] ${needDetail.length}대 상세정보 수집`);

      for (let i = 0; i < needDetail.length; i++) {
        const carId = needDetail[i];
        processedInSession++;

        try {
          // 차량 클릭
          const clicked = await page.evaluate((targetId) => {
            const links = document.querySelectorAll('a[onclick*="carInfo"]');
            for (const link of links) {
              if (link.getAttribute('onclick')?.includes(targetId)) {
                link.click();
                return true;
              }
            }
            return false;
          }, carId);

          if (!clicked) continue;
          await page.waitForTimeout(3000);

          // 상세정보 추출
          const detail = await page.evaluate(() => {
            const text = document.body.innerText;
            const d = {};

            d.exhibitNo = text.match(/출품번호\s*(\d+)/)?.[1] || '';
            d.parkingNo = text.match(/주차번호\s*([A-Z0-9-]+)/)?.[1] || '';
            d.carNo = text.match(/차량번호\s*([^\n]+)/)?.[1]?.trim() || '';
            d.vinNo = text.match(/차대번호\s*([A-Z0-9]+)/)?.[1] || '';
            d.year = text.match(/연식\s*(\d{4})/)?.[1] || '';
            d.engineType = text.match(/원동기형식\s*([^\n]+)/)?.[1]?.trim() || '';
            d.fuel = text.match(/연료\s*([^\n]+)/)?.[1]?.trim() || '';
            d.mileage = text.match(/주행거리\s*([\d,]+)/)?.[1] || '';
            d.displacement = text.match(/배기량\s*([\d,]+)/)?.[1] || '';
            d.history = text.match(/경력\s*([^\n]+)/)?.[1]?.trim() || '';
            d.transmission = text.match(/변속기\s*([^\n]+)/)?.[1]?.trim() || '';
            d.color = text.match(/색상\s*([^\(]+)/)?.[1]?.trim() || '';
            d.carType = text.match(/차종\s*([^\n]+)/)?.[1]?.trim() || '';

            const titleMatch = text.match(/\[(\d+)\]\s*([^\n]+)/);
            d.name = titleMatch ? titleMatch[2].trim() : '';
            d.startPrice = text.match(/시작가\s*:\s*([\d,]+)/)?.[1] || '';

            const evalMatch = text.match(/평가점\s*골격\s*:\s*([A-Z])\s*외관\s*:\s*([A-Z])/);
            if (evalMatch) {
              d.evalFrame = evalMatch[1];
              d.evalExterior = evalMatch[2];
            }
            d.inspector = text.match(/점검원\s*([^\n]+)/)?.[1]?.trim() || '';
            d.storage = text.match(/보관물품\s*([^\n]+)/)?.[1]?.trim() || '';
            d.note = text.match(/비고\s*([^\n]+)/)?.[1]?.trim() || '';

            const convMatch = text.match(/편의\s*([^\n]*(?:네비|HID|스마트키|어라운드뷰|파워트렁크|HUD|후측방|LDWS|하이패스|크루즈)[^\n]*)/);
            d.convenienceOptions = convMatch ? convMatch[1].trim() : '';

            d.sunroof = text.match(/SR\(선루프\)\s*([^\n]+)/)?.[1]?.trim() || '';
            d.seatOptions = text.match(/시트\s*([^\n]*(?:열선|메모리|통풍)[^\n]*)/)?.[1]?.trim() || '';
            d.powerSeat = text.match(/전동시트\s*([^\n]+)/)?.[1]?.trim() || '';
            d.funcEvalDetail = text.match(/기능평가정보 상세\s*([^\n]+)/)?.[1]?.trim() || '';

            d.totalLoss = text.includes('전손사고 : Y');
            d.floodTotal = text.includes('침수전손사고 : Y');
            d.floodPartial = text.includes('침수분손사고 : Y');
            d.remarks = text.match(/특기사항\/점검자 의견\s*([^\n]+)/)?.[1]?.trim() || '';

            d.images = Array.from(document.querySelectorAll('img'))
              .filter(img => img.src?.includes('INSPECT') && img.src?.includes('_L.jpg'))
              .map(img => img.src)
              .slice(0, 20);

            const thumb = Array.from(document.querySelectorAll('img'))
              .find(img => img.src?.includes('INSPECT') && img.src?.includes('_M.jpg'));
            d.thumbnail = thumb?.src || d.images[0] || '';

            return d;
          });

          if (detail.exhibitNo || detail.name) {
            // 기존 데이터 업데이트
            const idx = existingData.cars.findIndex(c => c.id === detail.exhibitNo || c.id === carId);
            const newCar = formatCar(detail);

            if (idx >= 0) {
              existingData.cars[idx] = newCar;
            } else {
              existingData.cars.push(newCar);
            }

            detailedIds.add(detail.exhibitNo || carId);
            newDetailsCount++;
          }

          // 목록으로 복귀
          await page.evaluate(() => { checkAuthority('AC1'); });
          await page.waitForTimeout(2500);

          // 현재 페이지로 이동
          if (pageNum > 1) {
            await page.evaluate((np) => { CmPageMove(String(np)); }, pageNum);
            await page.waitForTimeout(1500);
          }

        } catch (err) {
          console.log(`  에러: ${err.message.substring(0, 50)}`);
          // 복구
          try {
            await page.evaluate(() => { checkAuthority('AC1'); });
            await page.waitForTimeout(3000);
            if (pageNum > 1) {
              await page.evaluate((np) => { CmPageMove(String(np)); }, pageNum);
              await page.waitForTimeout(2000);
            }
          } catch (e) {}
        }

        // 진행상황
        if (processedInSession % 10 === 0) {
          console.log(`  진행: ${processedInSession}개 처리, ${newDetailsCount}개 상세정보 추가`);
          // 저장
          saveData(existingData);
        }
      }

      // 다음 페이지
      if (pageNum < totalPages) {
        try {
          await page.evaluate((np) => { CmPageMove(String(np)); }, pageNum + 1);
          await page.waitForTimeout(2000);
        } catch (e) {
          await page.evaluate(() => { checkAuthority('AC1'); });
          await page.waitForTimeout(3000);
          await page.evaluate((np) => { CmPageMove(String(np)); }, pageNum + 1);
          await page.waitForTimeout(2000);
        }
      }

      // 배치 저장
      if (pageNum % 5 === 0) {
        saveData(existingData);
        console.log(`  [저장] ${existingData.cars.length}대, 상세: ${detailedIds.size}대`);
      }
    }

  } catch (error) {
    console.error('에러:', error.message);
  } finally {
    await browser.close();
    saveData(existingData);
    console.log('\n' + '='.repeat(60));
    console.log('완료:', new Date().toLocaleString('ko-KR'));
    console.log('총 차량:', existingData.cars.length);
    console.log('상세정보:', detailedIds.size);
    console.log('='.repeat(60));
  }
}

function saveData(data) {
  data.updatedAt = new Date().toISOString();
  data.totalCount = data.cars.length;
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
}

function formatCar(d) {
  const brand = extractBrand(d.name);
  return {
    id: d.exhibitNo,
    name: d.name || '',
    nameKr: d.name || '',
    brand,
    model: d.name?.replace(/^(현대|기아|제네시스|벤츠|BMW|아우디|폭스바겐|도요타|혼다|렉서스|닛산|볼보|쉐보레|쌍용|르노|포드|지프|테슬라|랜드로버|재규어|포르쉐|링컨|캐딜락|마세라티|미니|인피니티|KG모빌리티|메르세데스)\s*/, '').trim() || '',
    year: parseInt(d.year) || new Date().getFullYear(),
    mileage: parseInt((d.mileage || '0').replace(/,/g, '')),
    mileageFormatted: d.mileage ? d.mileage + ' km' : '',
    price: parseInt((d.startPrice || '0').replace(/,/g, '')),
    priceFormatted: d.startPrice ? d.startPrice + '만원' : 'Price TBD',
    fuel: translateFuel(d.fuel),
    transmission: d.transmission?.includes('오토') ? 'Automatic' : 'Manual',
    bodyType: getBodyType(d.name),
    color: translateColor(d.color),
    image: d.thumbnail || '/Jungcar/images/auction/car-placeholder.jpg',
    images: d.images || [],
    status: 'Available',
    detail: {
      exhibitNo: d.exhibitNo,
      parkingNo: d.parkingNo,
      carNo: d.carNo,
      vinNo: d.vinNo,
      engineType: d.engineType,
      displacement: d.displacement,
      history: d.history,
      carType: d.carType,
      evalFrame: d.evalFrame || '-',
      evalExterior: d.evalExterior || '-',
      inspector: d.inspector,
      storage: d.storage,
      note: d.note,
      convenienceOptions: d.convenienceOptions,
      sunroof: d.sunroof,
      seatOptions: d.seatOptions,
      powerSeat: d.powerSeat,
      funcEvalDetail: d.funcEvalDetail,
      totalLoss: d.totalLoss,
      floodTotal: d.floodTotal,
      floodPartial: d.floodPartial,
      remarks: d.remarks,
    }
  };
}

function extractBrand(name) {
  if (!name) return 'Other';
  for (const [kr, en] of Object.entries(brandMap)) {
    if (name.includes(kr)) return en;
  }
  return 'Other';
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
  const colors = { '흰색': 'White', '백색': 'White', '검정': 'Black', '은색': 'Silver', '회색': 'Gray', '파랑': 'Blue', '빨강': 'Red', '진주': 'Pearl' };
  for (const [kr, en] of Object.entries(colors)) {
    if (color.includes(kr)) return en;
  }
  return color || 'Other';
}

function getBodyType(name) {
  if (!name) return 'Sedan';
  if (/SUV|투싼|싼타페|쏘렌토|스포티지|팰리세이드|코나|셀토스|티볼리|렉스턴|티구안|QM6|모하비|베뉴|코란도|토레스/.test(name)) return 'SUV';
  if (/카니발|스타리아|스타렉스|승합/.test(name)) return 'Van';
  if (/화물|트럭|포터|봉고/.test(name)) return 'Truck';
  return 'Sedan';
}

main().catch(console.error);
