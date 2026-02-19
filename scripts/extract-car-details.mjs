#!/usr/bin/env node
/**
 * 현대글로비스 경매 차량 상세정보 추출 스크립트
 * - HTML에서 모든 차량 상세정보 추출
 * - 연식, 변속기, 배기량, 색상, 연료, 용도, 성능등급, 차량번호 등
 */

import * as cheerio from 'cheerio';
import fs from 'fs';

const INPUT_DIR = '/var/www/Jungcar/other/크롤링';
const OUTPUT_PATH = '/var/www/Jungcar/public/data/glovis-cars-detail.json';

const cars = [];

function parseCarDetails(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('a.btn_view').each((_, el) => {
    const $el = $(el);
    const gn = $el.attr('gn') || '';
    const rc = $el.attr('rc') || '';
    const acc = $el.attr('acc') || '';
    const atn = $el.attr('atn') || '';
    const prodmancd = $el.attr('prodmancd') || '';
    const reprcarcd = $el.attr('reprcarcd') || '';
    const detacarcd = $el.attr('detacarcd') || '';
    const cargradcd = $el.attr('cargradcd') || '';

    if (!gn) return;

    // 출품번호
    const exhibitNo = $el.find('.entry-info span').first().text().trim();

    // 차량명
    const carName = $el.find('.car-name').text().trim();

    // 상태 (유찰, 낙찰, 상담체결 등)
    const status = $el.find('.state-tag').text().trim() ||
                   $el.find('.state-flag span').text().trim();

    // 옵션 정보 (연식, 변속기, 배기량, 주행거리, 색상, 연료, 용도, 성능등급)
    const options = [];
    $el.find('.option span').each((_, span) => {
      const text = $(span).text().trim().replace(/\s+/g, ' ');
      if (text) options.push(text);
    });

    // 필터 옵션 (회차, 레인, 차량번호)
    const filterOptions = [];
    $el.find('.filter-option .tag-badge').each((_, span) => {
      const text = $(span).text().trim();
      if (text) filterOptions.push(text);
    });

    // 가격 정보
    const priceBoxes = $el.find('.price-box .inner');
    let startPrice = null;
    let hopePrice = null;
    let instantPrice = null;

    priceBoxes.each((idx, box) => {
      const label = $(box).find('span').first().text().trim();
      const price = $(box).find('.num').text().trim();
      const priceNum = price ? parseInt(price.replace(/,/g, '')) : null;

      if (label.includes('시작가')) {
        startPrice = priceNum;
      } else if (label.includes('희망가')) {
        hopePrice = priceNum;
      } else if (label.includes('즉시체결가')) {
        instantPrice = priceNum;
      }
    });

    // 이미지
    const imgSrc = $el.find('.thumbnail img').attr('src');
    const imgFileName = imgSrc ? imgSrc.split('/').pop() : null;

    // 지역 태그 (양산, 시화 등)
    const location = $el.find('.tag-badge.type02').text().trim() || '';

    // 상세 정보 파싱
    const year = options[0] || '';
    const transmission = options[1] || '';  // A/T, M/T
    const displacement = options[2] || '';  // 998cc
    const mileage = options[3] || '';       // 174,443 km
    const color = options[4] || '';         // 검정
    const fuel = options[5] || '';          // 휘발유
    const usage = options[6] || '';         // 법인상품용
    const grade = options[7] || '';         // A/3

    // 필터 정보 파싱
    const auctionRound = filterOptions[0] || '';  // 1039회
    const lane = filterOptions[1] || '';          // 레인 A
    const plateNumber = filterOptions[2] || '';   // 51라6719

    items.push({
      id: gn,
      no: exhibitNo,
      name: carName,
      status,
      year,
      transmission,
      displacement,
      mileage,
      color,
      fuel,
      usage,
      grade,
      auctionRound,
      lane,
      plateNumber,
      location,
      price: startPrice,
      hope: hopePrice,
      instant: instantPrice,
      imgFile: imgFileName,
      url: `https://auction.autobell.co.kr/auction/exhibitView.do?acc=${acc}&gn=${encodeURIComponent(gn)}&rc=${rc}&atn=${atn}`,
      meta: {
        prodmancd,
        reprcarcd,
        detacarcd,
        cargradcd
      }
    });
  });

  return items;
}

function main() {
  console.log('현대글로비스 차량 상세정보 추출 시작...\n');

  for (let i = 1; i <= 11; i++) {
    const htmlPath = `${INPUT_DIR}/${i}/${i}.html`;

    if (!fs.existsSync(htmlPath)) {
      console.log(`폴더 ${i}: 파일 없음`);
      continue;
    }

    const html = fs.readFileSync(htmlPath, 'utf-8');
    const pageCars = parseCarDetails(html);
    cars.push(...pageCars);
    console.log(`폴더 ${i}: ${pageCars.length}대 (누적: ${cars.length}대)`);
  }

  // 이미지 경로 추가
  cars.forEach(car => {
    if (car.no) {
      car.img = `/Jungcar/images/cars/${car.no}.jpg`;
    }
  });

  // 결과 저장
  const result = {
    at: new Date().toISOString(),
    cnt: cars.length,
    cars
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result), 'utf-8');

  const fileSize = fs.statSync(OUTPUT_PATH).size;
  console.log(`\n완료! 총 ${cars.length}대`);
  console.log(`저장: ${OUTPUT_PATH} (${(fileSize/1024).toFixed(1)}KB)`);

  // 샘플 출력
  console.log('\n샘플 데이터:');
  console.log(JSON.stringify(cars[0], null, 2));
}

main();
