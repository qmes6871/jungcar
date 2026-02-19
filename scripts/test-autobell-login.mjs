/**
 * 오토벨 스마트옥션 로그인 및 출품리스트 접근 테스트
 */

import puppeteer from 'puppeteer';

const LOGIN_ID = '13238';
const LOGIN_PW = 'sk&nk0604';
const BASE_URL = 'https://auction.autobell.co.kr';

async function main() {
  console.log('=== 오토벨 스마트옥션 접근 테스트 ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // 1. 메인 페이지 접근
    console.log('1. 메인 페이지 접근 중...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('   현재 URL:', page.url());

    // 스크린샷 저장
    await page.screenshot({ path: '/tmp/autobell-1-main.png', fullPage: true });
    console.log('   스크린샷 저장: /tmp/autobell-1-main.png');

    // 2. 로그인 페이지 찾기
    console.log('\n2. 로그인 페이지 탐색 중...');

    // 로그인 관련 링크/버튼 찾기
    const loginLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a, button').forEach(el => {
        const text = el.textContent?.toLowerCase() || '';
        const href = el.href || '';
        if (text.includes('로그인') || text.includes('login') || href.includes('login')) {
          links.push({ text: el.textContent?.trim(), href: el.href || 'button' });
        }
      });
      return links;
    });
    console.log('   로그인 관련 요소:', loginLinks);

    // 로그인 페이지로 이동 시도
    const loginUrls = [
      BASE_URL + '/member/login.do',
      BASE_URL + '/login.do',
      BASE_URL + '/member/loginForm.do',
      BASE_URL + '/comm/login.do',
    ];

    let loginPageFound = false;
    for (const url of loginUrls) {
      try {
        console.log(`   ${url} 시도 중...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        const hasLoginForm = await page.evaluate(() => {
          return document.querySelector('input[type="password"]') !== null ||
                 document.querySelector('#userPw') !== null ||
                 document.querySelector('#password') !== null;
        });
        if (hasLoginForm) {
          console.log('   로그인 폼 발견!');
          loginPageFound = true;
          break;
        }
      } catch (e) {
        console.log(`   ${url} 실패`);
      }
    }

    await page.screenshot({ path: '/tmp/autobell-2-login.png', fullPage: true });
    console.log('   스크린샷 저장: /tmp/autobell-2-login.png');

    // 페이지 HTML 일부 출력
    const pageContent = await page.content();
    console.log('\n   페이지 내용 (처음 2000자):');
    console.log(pageContent.substring(0, 2000));

    // 3. 로그인 시도
    if (loginPageFound) {
      console.log('\n3. 로그인 시도 중...');

      // ID/PW 입력 필드 찾기
      const inputFields = await page.evaluate(() => {
        const inputs = [];
        document.querySelectorAll('input').forEach(el => {
          inputs.push({
            id: el.id,
            name: el.name,
            type: el.type,
            placeholder: el.placeholder
          });
        });
        return inputs;
      });
      console.log('   입력 필드:', inputFields);

      // 로그인 폼 입력 시도
      const idSelectors = ['#userId', '#id', '#username', '#user_id', 'input[name="userId"]', 'input[name="id"]'];
      const pwSelectors = ['#userPw', '#password', '#pw', '#user_pw', 'input[name="userPw"]', 'input[name="password"]'];

      for (const sel of idSelectors) {
        try {
          await page.type(sel, LOGIN_ID);
          console.log(`   ID 입력 성공: ${sel}`);
          break;
        } catch (e) {}
      }

      for (const sel of pwSelectors) {
        try {
          await page.type(sel, LOGIN_PW);
          console.log(`   PW 입력 성공: ${sel}`);
          break;
        } catch (e) {}
      }

      await page.screenshot({ path: '/tmp/autobell-3-filled.png', fullPage: true });

      // 로그인 버튼 클릭
      const loginBtnSelectors = ['.btn-login', '.login-btn', 'button[type="submit"]', 'input[type="submit"]', '.btnLogin'];
      for (const sel of loginBtnSelectors) {
        try {
          await page.click(sel);
          console.log(`   로그인 버튼 클릭: ${sel}`);
          break;
        } catch (e) {}
      }

      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 3000));

      console.log('   로그인 후 URL:', page.url());
      await page.screenshot({ path: '/tmp/autobell-4-afterlogin.png', fullPage: true });
      console.log('   스크린샷 저장: /tmp/autobell-4-afterlogin.png');
    }

    // 4. 출품리스트 페이지 접근 시도
    console.log('\n4. 출품리스트 페이지 접근 시도...');

    const listUrls = [
      BASE_URL + '/auction/exhibitList.do',
      BASE_URL + '/auction/exhibitList.do?atn=1039&acc=20&auctListStat=&flag=Y',
      BASE_URL + '/smartauction/exhibitList.do',
      BASE_URL + '/exhibit/list.do',
    ];

    for (const url of listUrls) {
      try {
        console.log(`   ${url} 시도 중...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

        // 차량 목록이 있는지 확인
        const hasCarList = await page.evaluate(() => {
          const text = document.body.innerText || '';
          return text.includes('출품') ||
                 text.includes('차량') ||
                 document.querySelector('.car-item') !== null ||
                 document.querySelector('.item') !== null ||
                 document.querySelector('table tbody tr') !== null;
        });

        if (hasCarList) {
          console.log('   출품리스트 발견!');
          await page.screenshot({ path: '/tmp/autobell-5-list.png', fullPage: true });
          console.log('   스크린샷 저장: /tmp/autobell-5-list.png');

          // 페이지 내용 분석
          const listInfo = await page.evaluate(() => {
            const items = document.querySelectorAll('.item, .car-item, table tbody tr');
            return {
              itemCount: items.length,
              pageText: document.body.innerText.substring(0, 3000)
            };
          });
          console.log(`   발견된 아이템 수: ${listInfo.itemCount}`);
          console.log('\n   페이지 텍스트:');
          console.log(listInfo.pageText);
          break;
        }
      } catch (e) {
        console.log(`   ${url} 실패: ${e.message}`);
      }
    }

  } catch (err) {
    console.error('\n오류 발생:', err.message);
    await page.screenshot({ path: '/tmp/autobell-error.png', fullPage: true });
  } finally {
    await browser.close();
  }

  console.log('\n=== 테스트 완료 ===');
  console.log('스크린샷 확인: /tmp/autobell-*.png');
}

main();
