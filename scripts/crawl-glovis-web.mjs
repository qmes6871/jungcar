#!/usr/bin/env node
/**
 * 현대글로비스(오토벨) 경매 차량 웹 크롤러
 * - auction.autobell.co.kr 로그인 후 차량 목록 크롤링
 * - 매일 자동 실행용
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const USERNAME = '13238';
const PASSWORD = 'sk&nk0604';
const BASE_URL = 'https://auction.autobell.co.kr';
const OUTPUT_DIR = '/var/www/Jungcar/public/data';

async function main() {
  console.log('='.repeat(50));
  console.log('현대글로비스 경매 차량 크롤러 시작');
  console.log('시간:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(50));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();
  const allCars = [];

  try {
    // 1. 로그인 페이지 이동
    console.log('\n로그인 페이지 접속 중...');
    await page.goto(`${BASE_URL}/member/login.do`, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(2000);

    // 2. 로그인
    console.log('로그인 중...');

    // 아이디 입력
    await page.evaluate((user) => {
      const userInput = document.querySelector('input[name="userId"], input[name="id"], #userId, #id');
      if (userInput) userInput.value = user;
    }, USERNAME);

    // 비밀번호 입력
    await page.evaluate((pass) => {
      const passInput = document.querySelector('input[name="userPwd"], input[name="password"], input[type="password"], #userPwd, #password');
      if (passInput) passInput.value = pass;
    }, PASSWORD);

    await page.waitForTimeout(500);

    // 로그인 버튼 클릭
    await page.evaluate(() => {
      const loginBtn = document.querySelector('button[type="submit"], input[type="submit"], .btn-login, .login-btn, a.btn_login');
      if (loginBtn) loginBtn.click();

      // 또는 폼 제출
      const form = document.querySelector('form');
      if (form && !loginBtn) form.submit();
    });

    await page.waitForTimeout(4000);
    console.log('로그인 완료');

    // 3. 경매 차량 목록 페이지로 이동
    console.log('\n경매 차량 목록 페이지 접속 중...');
    await page.goto(`${BASE_URL}/auction/exhibitList.do`, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(3000);

    // 4. 페이지별 크롤링
    let currentPage = 1;
    const maxPages = 30;
    let consecutiveEmpty = 0;

    while (currentPage <= maxPages && consecutiveEmpty < 3) {
      console.log(`\n[페이지 ${currentPage}] 크롤링 중...`);

      // 현재 페이지의 차량 정보 추출
      const carsOnPage = await page.evaluate((baseUrl) => {
        const cars = [];

        // 차량 카드 선택 (a.btn_view)
        const items = document.querySelectorAll('a.btn_view');

        items.forEach(item => {
          try {
            const gn = item.getAttribute('gn') || '';
            const rc = item.getAttribute('rc') || '';
            const acc = item.getAttribute('acc') || '';
            const atn = item.getAttribute('atn') || '';

            // 출품번호
            const noEl = item.querySelector('.entry-info span');
            const no = noEl ? noEl.textContent.trim() : '';

            // 차량명
            const nameEl = item.querySelector('.car-name');
            const name = nameEl ? nameEl.textContent.trim() : '';

            // 옵션 정보 (연식, 연료, 변속기, 주행거리)
            const options = [];
            item.querySelectorAll('.option span').forEach(span => {
              const text = span.textContent.trim().replace(/\s+/g, ' ');
              if (text) options.push(text);
            });

            // 시작가
            const startPriceEl = item.querySelector('.price-box .inner:first-child .num');
            const startPrice = startPriceEl ? startPriceEl.textContent.trim().replace(/,/g, '') : '';

            // 희망가
            const hopePriceEl = item.querySelector('.price-box .inner:nth-child(2) .num');
            const hopePrice = hopePriceEl ? hopePriceEl.textContent.trim().replace(/,/g, '') : '';

            // 상태
            const statusEl = item.querySelector('.state-tag') || item.querySelector('.state-flag span');
            const status = statusEl ? statusEl.textContent.trim() : '';

            // 이미지
            const imgEl = item.querySelector('.img-box img');
            let img = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : '';
            if (img && !img.startsWith('http')) {
              img = baseUrl + img;
            }

            if (gn && name) {
              cars.push({
                id: gn,
                no: no,
                name: name,
                year: options[0] || '',
                km: options[3] || '',
                price: startPrice ? parseInt(startPrice) : null,
                hope: hopePrice ? parseInt(hopePrice) : null,
                status: status,
                url: `${baseUrl}/auction/exhibitView.do?acc=${acc}&gn=${encodeURIComponent(gn)}&rc=${rc}&atn=${atn}`,
                img: img
              });
            }
          } catch (e) {
            // 개별 항목 에러 무시
          }
        });

        return cars;
      }, BASE_URL);

      console.log(`  -> ${carsOnPage.length}대 발견`);

      if (carsOnPage.length === 0) {
        consecutiveEmpty++;
      } else {
        consecutiveEmpty = 0;
        allCars.push(...carsOnPage);
      }

      // 다음 페이지로 이동
      if (currentPage < maxPages) {
        const hasNextPage = await page.evaluate((nextPageNum) => {
          // 페이지 번호 링크 찾기
          const pageLinks = document.querySelectorAll('.paging a, .pagination a, .page-list a');
          for (const link of pageLinks) {
            const text = link.textContent.trim();
            const onclick = link.getAttribute('onclick') || '';

            if (text === String(nextPageNum) || onclick.includes(`(${nextPageNum})`) || onclick.includes(`'${nextPageNum}'`)) {
              link.click();
              return true;
            }
          }

          // goPage 함수 직접 호출 시도
          if (typeof goPage === 'function') {
            goPage(nextPageNum);
            return true;
          }

          return false;
        }, currentPage + 1);

        if (hasNextPage) {
          await page.waitForTimeout(2500);
          currentPage++;
        } else {
          console.log('  -> 다음 페이지 없음');
          break;
        }
      } else {
        break;
      }
    }

    // 5. 중복 제거
    const uniqueCars = [];
    const seenIds = new Set();

    for (const car of allCars) {
      const key = car.id || car.no;
      if (!seenIds.has(key) && car.name) {
        seenIds.add(key);
        uniqueCars.push(car);
      }
    }

    console.log(`\n총 ${uniqueCars.length}대 크롤링 완료 (중복 제거됨)`);

    // 6. 결과 저장
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const result = {
      at: new Date().toISOString(),
      cnt: uniqueCars.length,
      cars: uniqueCars
    };

    const outputPath = path.join(OUTPUT_DIR, 'glovis-cars.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    const fileSize = fs.statSync(outputPath).size;
    console.log(`저장 완료: ${outputPath} (${(fileSize / 1024).toFixed(1)}KB)`);

    // 샘플 출력
    if (uniqueCars.length > 0) {
      console.log('\n샘플 차량:');
      uniqueCars.slice(0, 3).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name} (${c.year}) - ${c.price ? c.price + '만원' : '가격미정'}`);
      });
    }

  } catch (error) {
    console.error('크롤링 에러:', error.message);
    await page.screenshot({ path: '/tmp/glovis-error.png' });
    console.log('에러 스크린샷: /tmp/glovis-error.png');
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(50));
  console.log('크롤링 완료:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(50));
}

main().catch(console.error);
