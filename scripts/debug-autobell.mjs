#!/usr/bin/env node
/**
 * 오토벨 페이지 구조 분석
 */

import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log('페이지 로드 중...');
    await page.goto('https://www.autobell.co.kr/buycar/buyCarCertiList?tab=1', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // 5초 대기
    await new Promise(r => setTimeout(r, 5000));

    // 페이지 HTML 일부 추출
    const pageInfo = await page.evaluate(() => {
      const body = document.body.innerHTML;

      // 차량 관련 클래스 찾기
      const allElements = document.querySelectorAll('*');
      const carClasses = new Set();
      const carLinks = [];

      allElements.forEach(el => {
        const className = el.className;
        if (typeof className === 'string' && (
          className.includes('car') ||
          className.includes('vehicle') ||
          className.includes('product') ||
          className.includes('item')
        )) {
          carClasses.add(className.split(' ').filter(c =>
            c.includes('car') || c.includes('vehicle') || c.includes('product') || c.includes('item')
          ).join(' '));
        }
      });

      // 차량 링크 찾기
      document.querySelectorAll('a[href*="Detail"], a[href*="detail"]').forEach(a => {
        carLinks.push(a.href);
      });

      // NUXT 데이터 확인
      let nuxtData = null;
      if (window.__NUXT__) {
        nuxtData = JSON.stringify(window.__NUXT__).substring(0, 5000);
      }

      return {
        title: document.title,
        carClasses: Array.from(carClasses).slice(0, 20),
        carLinks: carLinks.slice(0, 10),
        nuxtData,
        bodyLength: body.length
      };
    });

    console.log('\n=== 페이지 정보 ===');
    console.log('제목:', pageInfo.title);
    console.log('Body 길이:', pageInfo.bodyLength);
    console.log('\n차량 관련 클래스들:');
    pageInfo.carClasses.forEach(c => console.log('  -', c));
    console.log('\n차량 링크들:');
    pageInfo.carLinks.forEach(l => console.log('  -', l));
    console.log('\nNUXT 데이터 일부:');
    if (pageInfo.nuxtData) {
      console.log(pageInfo.nuxtData.substring(0, 2000));
    } else {
      console.log('  (없음)');
    }

  } catch (err) {
    console.error('오류:', err.message);
  } finally {
    await browser.close();
  }
}

main();
