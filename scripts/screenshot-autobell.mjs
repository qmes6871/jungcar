#!/usr/bin/env node
import puppeteer from 'puppeteer';
import fs from 'fs';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    console.log('페이지 로드 중...');
    await page.goto('https://www.autobell.co.kr/buycar/buyCarCertiList?tab=1', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 10000));

    // 스크린샷 저장
    await page.screenshot({ path: '/tmp/autobell.png', fullPage: false });
    console.log('스크린샷 저장: /tmp/autobell.png');

    // HTML 저장
    const html = await page.content();
    fs.writeFileSync('/tmp/autobell-page.html', html);
    console.log('HTML 저장: /tmp/autobell-page.html');

    // 페이지 정보
    const info = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyLength: document.body.innerHTML.length,
        links: Array.from(document.querySelectorAll('a')).slice(0, 30).map(a => ({
          text: a.textContent?.trim().substring(0, 50),
          href: a.href
        })),
        classes: Array.from(new Set(
          Array.from(document.querySelectorAll('*'))
            .map(el => el.className)
            .filter(c => typeof c === 'string' && c.length > 0)
        )).slice(0, 50)
      };
    });

    console.log('\n=== 페이지 정보 ===');
    console.log('제목:', info.title);
    console.log('URL:', info.url);
    console.log('Body 길이:', info.bodyLength);
    console.log('\n링크들 (처음 10개):');
    info.links.slice(0, 10).forEach(l => console.log(`  - ${l.text}: ${l.href}`));

  } catch (err) {
    console.error('오류:', err.message);
  } finally {
    await browser.close();
  }
}

main();
