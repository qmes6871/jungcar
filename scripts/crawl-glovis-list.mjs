#!/usr/bin/env node
/**
 * 현대글로비스 경매 차량 목록 파서
 * - 폴더 1~11의 HTML 파일에서 차량 정보 추출
 * - 차량 ID, 제목, 가격, 상태만 추출 (용량 최소화)
 */

import * as cheerio from 'cheerio';
import fs from 'fs';

const BASE_URL = 'https://auction.autobell.co.kr';
const INPUT_DIR = '/var/www/Jungcar/other/크롤링';

const cars = [];

function parseCarList(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('a.btn_view').each((_, el) => {
    const $el = $(el);
    const gn = $el.attr('gn') || '';
    const rc = $el.attr('rc') || '';
    const acc = $el.attr('acc') || '';
    const atn = $el.attr('atn') || '';

    const exhibitNo = $el.find('.entry-info span').first().text().trim();
    const carName = $el.find('.car-name').text().trim();

    const options = [];
    $el.find('.option span').each((_, span) => {
      const text = $(span).text().trim().replace(/\s+/g, ' ');
      if (text) options.push(text);
    });

    const startPrice = $el.find('.price-box .inner').first().find('.num').text().trim();
    const hopePrice = $el.find('.price-box .inner').eq(1).find('.num').text().trim();
    const status = $el.find('.state-tag').text().trim() || $el.find('.state-flag span').text().trim();

    if (gn) {
      items.push({
        id: gn,
        no: exhibitNo,
        name: carName,
        year: options[0] || '',
        km: options[3] || '',
        price: startPrice ? parseInt(startPrice.replace(/,/g, '')) : null,
        hope: hopePrice ? parseInt(hopePrice.replace(/,/g, '')) : null,
        status,
        url: `${BASE_URL}/auction/exhibitView.do?acc=${acc}&gn=${encodeURIComponent(gn)}&rc=${rc}&atn=${atn}`
      });
    }
  });

  return items;
}

function parseAllFolders() {
  console.log('현대글로비스 전체 차량 파싱 시작...\n');

  for (let i = 1; i <= 11; i++) {
    const htmlPath = `${INPUT_DIR}/${i}/${i}.html`;

    if (!fs.existsSync(htmlPath)) {
      console.log(`폴더 ${i}: 파일 없음`);
      continue;
    }

    const html = fs.readFileSync(htmlPath, 'utf-8');
    const pageCars = parseCarList(html);
    cars.push(...pageCars);
    console.log(`폴더 ${i}: ${pageCars.length}대 (누적: ${cars.length}대)`);
  }

  // 결과 저장
  const dir = '/var/www/Jungcar/public/data';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const result = {
    at: new Date().toISOString(),
    cnt: cars.length,
    cars
  };

  const outputPath = `${dir}/glovis-cars.json`;
  fs.writeFileSync(outputPath, JSON.stringify(result), 'utf-8');

  const fileSize = fs.statSync(outputPath).size;
  console.log(`\n완료! 총 ${cars.length}대`);
  console.log(`저장: ${outputPath} (${(fileSize/1024).toFixed(1)}KB)`);
}

parseAllFolders();
