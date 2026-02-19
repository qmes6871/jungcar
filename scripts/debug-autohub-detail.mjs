import { chromium } from 'playwright';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 로그인
  console.log('로그인 중...');
  await page.goto('https://www.sellcarauction.co.kr/newfront/login.do');
  await page.waitForTimeout(2000);
  await page.evaluate(() => { document.getElementById('i_sLoginGubun2')?.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(({ user, pass }) => {
    document.getElementById('i_sUserId').value = user;
    document.getElementById('i_sPswd').value = pass;
  }, { user: USERNAME, pass: PASSWORD });
  await page.evaluate(() => { fnLoginCheck(); });
  await page.waitForTimeout(4000);
  console.log('로그인 완료');

  // 출품리스트로 이동
  await page.evaluate(() => { checkAuthority('AC1'); });
  await page.waitForTimeout(5000);

  // 첫번째 차량 상세페이지로 이동
  console.log('상세 페이지로 이동...');
  await page.evaluate(() => {
    const link = document.querySelector('a[onclick*="carInfo"]');
    if (link) link.click();
  });
  await page.waitForTimeout(5000);

  console.log('현재 URL:', page.url());

  // 스크린샷
  await page.screenshot({ path: '/tmp/autohub-detail.png', fullPage: true });
  console.log('스크린샷: /tmp/autohub-detail.png');

  // 페이지 구조 확인
  const pageContent = await page.evaluate(() => {
    return document.body.innerText.substring(0, 8000);
  });
  console.log('\n=== 페이지 내용 ===\n');
  console.log(pageContent);

  // 주요 섹션 확인
  const sections = await page.evaluate(() => {
    const result = {};

    // 탭 메뉴 확인
    const tabs = document.querySelectorAll('.tab-menu a, .nav-tabs a, [role="tab"]');
    result.tabs = Array.from(tabs).map(t => t.textContent.trim());

    // 테이블 정보
    const tables = document.querySelectorAll('table');
    result.tableCount = tables.length;

    // 이미지들
    const imgs = document.querySelectorAll('img');
    result.carImages = Array.from(imgs)
      .filter(img => img.src && img.src.includes('INSPECT'))
      .map(img => img.src)
      .slice(0, 10);

    return result;
  });

  console.log('\n=== 섹션 정보 ===');
  console.log('탭:', sections.tabs);
  console.log('테이블 수:', sections.tableCount);
  console.log('차량 이미지:', sections.carImages);

  await browser.close();
}

main().catch(console.error);
