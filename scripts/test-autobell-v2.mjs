/**
 * 오토벨 스마트옥션 로그인 테스트 v2
 */

import puppeteer from 'puppeteer';

const LOGIN_ID = '13238';
const LOGIN_PW = 'sk&nk0604';
const BASE_URL = 'https://auction.autobell.co.kr';

async function main() {
  console.log('=== 오토벨 스마트옥션 접근 테스트 v2 ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // 메인 페이지로 접근
    console.log('1. 메인 페이지 접근...');
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('   응답 상태:', response?.status());
    console.log('   현재 URL:', page.url());

    await new Promise(r => setTimeout(r, 2000));

    // 전체 페이지 HTML 가져오기
    const fullHtml = await page.content();
    console.log('\n   전체 HTML 길이:', fullHtml.length);

    // login 관련 키워드 찾기
    const loginMatch = fullHtml.match(/login|로그인|userId|userPw|password/gi);
    console.log('   로그인 관련 키워드:', loginMatch?.slice(0, 10));

    // script 내용에서 로그인 함수 찾기
    const scriptMatch = fullHtml.match(/function\s+\w*[Ll]ogin\w*\s*\([^)]*\)\s*\{[^}]+\}/g);
    console.log('   로그인 함수:', scriptMatch?.slice(0, 3));

    // 모든 input 필드
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(el => ({
        id: el.id,
        name: el.name,
        type: el.type,
        className: el.className,
        value: el.value
      }));
    });
    console.log('\n   Input 필드:', JSON.stringify(inputs, null, 2));

    // 모든 form 태그
    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map(el => ({
        id: el.id,
        name: el.name,
        action: el.action,
        method: el.method
      }));
    });
    console.log('\n   Form 태그:', JSON.stringify(forms, null, 2));

    // 버튼 찾기
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn')).map(el => ({
        text: el.textContent?.trim()?.substring(0, 50),
        onclick: el.getAttribute('onclick')?.substring(0, 100),
        href: el.href?.substring(0, 100)
      }));
    });
    console.log('\n   버튼:', JSON.stringify(buttons, null, 2));

    await page.screenshot({ path: '/tmp/autobell-v2-1.png', fullPage: true });

    // 페이지에서 로그인 관련 JavaScript 변수 찾기
    const jsVars = await page.evaluate(() => {
      const result = {};
      // 전역 변수 중 login 관련 찾기
      for (const key in window) {
        if (key.toLowerCase().includes('login') || key.toLowerCase().includes('user') || key.toLowerCase().includes('auth')) {
          try {
            result[key] = typeof window[key];
          } catch (e) {}
        }
      }
      return result;
    });
    console.log('\n   JS 전역 변수 (login/user/auth):', jsVars);

    // href="#" onclick 링크 찾기
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[onclick], div[onclick], span[onclick]')).map(el => ({
        text: el.textContent?.trim()?.substring(0, 30),
        onclick: el.getAttribute('onclick')?.substring(0, 150)
      }));
    });
    console.log('\n   onclick 링크:', JSON.stringify(links.slice(0, 10), null, 2));

    // iframe 확인
    const iframes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('iframe')).map(el => ({
        id: el.id,
        src: el.src,
        name: el.name
      }));
    });
    console.log('\n   IFrame:', JSON.stringify(iframes, null, 2));

    // 주요 CSS 선택자로 요소 찾기
    const elements = await page.evaluate(() => {
      const selectors = [
        '#userId', '#userPw', '#loginId', '#password',
        '.login', '.login-form', '#login', '#loginForm',
        'input[name="userId"]', 'input[name="userPw"]',
        'input[name="id"]', 'input[name="pw"]'
      ];
      const found = {};
      selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
          found[sel] = {
            tagName: el.tagName,
            id: el.id,
            type: el.type,
            className: el.className
          };
        }
      });
      return found;
    });
    console.log('\n   주요 선택자 요소:', JSON.stringify(elements, null, 2));

    // HTML에서 특정 패턴 검색
    if (fullHtml.includes('main.do')) {
      console.log('\n   main.do 발견 - 메인 페이지 URL 있음');
    }
    if (fullHtml.includes('fnLogin') || fullHtml.includes('fn_login')) {
      console.log('   fnLogin 함수 발견');
    }

    // 특정 영역의 HTML 출력
    const bodyInnerHtml = await page.evaluate(() => {
      const main = document.querySelector('main, .main, #main, .content, #content, .wrap, #wrap');
      return main?.innerHTML?.substring(0, 5000) || document.body.innerHTML.substring(0, 5000);
    });
    console.log('\n   메인 콘텐츠 HTML (5000자):\n', bodyInnerHtml);

  } catch (err) {
    console.error('\n오류:', err.message);
    await page.screenshot({ path: '/tmp/autobell-v2-error.png', fullPage: true });
  } finally {
    // 잠시 대기 후 브라우저 종료
    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
  }

  console.log('\n=== 테스트 완료 ===');
}

main();
