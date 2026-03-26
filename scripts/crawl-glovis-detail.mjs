/**
 * 현대글로비스 경매 차량 상세 이미지 크롤러
 *
 * 사용법:
 * 1. npm install puppeteer (설치 안 되어있으면)
 * 2. node scripts/crawl-glovis-detail.mjs
 *
 * 로그인이 필요한 경우 아래 LOGIN_ID, LOGIN_PW를 설정하세요.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// ============ 설정 ============
const LOGIN_ID = ''; // 로그인 ID (필요시 입력)
const LOGIN_PW = ''; // 로그인 비밀번호 (필요시 입력)
const NEED_LOGIN = false; // 로그인 필요 여부

const BASE_URL = 'https://auction.autobell.co.kr';
const LIST_URL = 'https://auction.autobell.co.kr/auction/exhibitList.do?atn=1039&acc=20&auctListStat=&flag=Y';

const OUTPUT_DIR = '/var/www/Jungcar/public/images/auction';
const OUTPUT_JSON = '/var/www/Jungcar/scripts/crawled-cars.json';

const MAX_CARS = 10; // 크롤링할 최대 차량 수 (테스트용, 전체는 0으로 설정)
const DELAY_MS = 2000; // 요청 간 딜레이 (밀리초)
// ==============================

// 이미지 다운로드 함수
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 리다이렉트 처리
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// 딜레이 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('=== 현대글로비스 경매 크롤러 시작 ===\n');

  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 브라우저 시작
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // User-Agent 설정
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // 로그인 (필요한 경우)
    if (NEED_LOGIN && LOGIN_ID && LOGIN_PW) {
      console.log('로그인 중...');
      await page.goto(BASE_URL + '/member/login.do', { waitUntil: 'networkidle2' });
      await page.type('#userId', LOGIN_ID);
      await page.type('#userPw', LOGIN_PW);
      await page.click('.btn-login');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log('로그인 완료\n');
    }

    // 리스트 페이지 이동
    console.log('출품 리스트 페이지 로딩 중...');
    await page.goto(LIST_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(3000);

    // 차량 리스트 수집
    const carItems = await page.evaluate(() => {
      const items = document.querySelectorAll('.item');
      return Array.from(items).map((item, index) => {
        const link = item.querySelector('a.btn_view');
        const nameEl = item.querySelector('.car-name');
        const entryEl = item.querySelector('.entry-info span');

        return {
          index,
          gn: link?.getAttribute('gn') || '',
          rc: link?.getAttribute('rc') || '',
          acc: link?.getAttribute('acc') || '',
          atn: link?.getAttribute('atn') || '',
          name: nameEl?.textContent?.trim() || '',
          entryNo: entryEl?.textContent?.trim() || '',
        };
      });
    });

    console.log(`총 ${carItems.length}대 차량 발견\n`);

    const carsToProcess = MAX_CARS > 0 ? carItems.slice(0, MAX_CARS) : carItems;
    const results = [];

    // 각 차량 상세 페이지 크롤링
    for (let i = 0; i < carsToProcess.length; i++) {
      const car = carsToProcess[i];
      console.log(`[${i + 1}/${carsToProcess.length}] ${car.name} (출품번호: ${car.entryNo}) 크롤링 중...`);

      try {
        // 상세 팝업 열기 (JavaScript 클릭 시뮬레이션)
        const detailImages = await page.evaluate(async (carData) => {
          // 팝업 열기 함수 호출 (사이트의 JavaScript 함수)
          if (typeof fn_exhibitView === 'function') {
            fn_exhibitView(carData.gn, carData.rc, carData.acc, carData.atn);
          }

          // 팝업 로딩 대기
          await new Promise(resolve => setTimeout(resolve, 2000));

          // 이미지 수집
          const images = [];
          const imgElements = document.querySelectorAll('.popup-exhibit .swiper-slide img, .exhibit-popup .swiper-slide img, .detail-popup img');
          imgElements.forEach(img => {
            if (img.src && !img.src.includes('dummy')) {
              images.push(img.src);
            }
          });

          // 팝업 닫기
          const closeBtn = document.querySelector('.popup-exhibit .btn-close, .exhibit-popup .btn-close, .popup-close');
          if (closeBtn) closeBtn.click();

          return images;
        }, car);

        // 이미지가 없으면 다른 방법 시도
        let images = detailImages;
        if (images.length === 0) {
          // 직접 상세 API 호출 시도
          const apiUrl = `${BASE_URL}/auction/exhibitDetail.ajax?gn=${encodeURIComponent(car.gn)}&rc=${car.rc}&acc=${car.acc}&atn=${car.atn}`;

          const apiResponse = await page.evaluate(async (url) => {
            try {
              const res = await fetch(url);
              return await res.text();
            } catch (e) {
              return null;
            }
          }, apiUrl);

          if (apiResponse) {
            // HTML에서 이미지 URL 추출
            const imgMatches = apiResponse.match(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|gif|webp)/gi);
            if (imgMatches) {
              images = [...new Set(imgMatches)];
            }
          }
        }

        // 이미지 다운로드
        const downloadedImages = [];
        for (let j = 0; j < images.length; j++) {
          const imgUrl = images[j];
          const ext = path.extname(imgUrl).split('?')[0] || '.jpg';
          const filename = `car-${car.entryNo}-${j + 1}${ext}`;
          const filepath = path.join(OUTPUT_DIR, filename);

          try {
            await downloadImage(imgUrl, filepath);
            downloadedImages.push(`/images/auction/${filename}`);
            console.log(`  - 이미지 ${j + 1}/${images.length} 다운로드 완료`);
          } catch (err) {
            console.log(`  - 이미지 ${j + 1} 다운로드 실패: ${err.message}`);
          }
        }

        results.push({
          ...car,
          images: downloadedImages,
          originalImages: images,
        });

        console.log(`  총 ${downloadedImages.length}개 이미지 저장 완료\n`);

      } catch (err) {
        console.log(`  오류 발생: ${err.message}\n`);
        results.push({
          ...car,
          images: [],
          error: err.message,
        });
      }

      await delay(DELAY_MS);
    }

    // 결과 저장
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));
    console.log(`\n=== 크롤링 완료 ===`);
    console.log(`결과 저장: ${OUTPUT_JSON}`);
    console.log(`이미지 저장: ${OUTPUT_DIR}`);

  } catch (err) {
    console.error('크롤링 실패:', err);
  } finally {
    await browser.close();
  }
}

main();
