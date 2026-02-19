#!/usr/bin/env node
/**
 * 현대글로비스 HTML 파일 파싱 및 이미지 리사이징
 * - 저장된 HTML 파일에서 차량 정보 추출
 * - 로컬 이미지 파일을 리사이징하여 저장
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// ============ 설정 ============
const INPUT_DIR = '/var/www/Jungcar/other/크롤링';
const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const DATA_DIR = '/var/www/Jungcar/public/data';
const OUTPUT_JSON = `${DATA_DIR}/glovis-cars-detail.json`;
const BASE_URL = 'https://auction.autobell.co.kr';

// 이미지 크기 설정
const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 },
  large: { width: 1600, height: 1200 }
};
// ==============================

async function processImage(inputPath, carNo, imageIndex) {
  const results = {};
  const baseFilename = `${carNo}_${imageIndex}`;

  try {
    const buffer = fs.readFileSync(inputPath);

    // 썸네일
    const thumbPath = path.join(OUTPUT_DIR, `${baseFilename}_thumb.jpg`);
    await sharp(buffer)
      .resize(SIZES.thumb.width, SIZES.thumb.height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    results.thumb = `/Jungcar/images/cars/${baseFilename}_thumb.jpg`;

    // 메인
    const mainPath = path.join(OUTPUT_DIR, `${baseFilename}_main.jpg`);
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mainPath);
    results.main = `/Jungcar/images/cars/${baseFilename}_main.jpg`;

    // 대표 이미지 (첫번째만)
    if (imageIndex === 0) {
      const largePath = path.join(OUTPUT_DIR, `${baseFilename}_large.jpg`);
      await sharp(buffer)
        .resize(SIZES.large.width, SIZES.large.height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(largePath);
      results.large = `/Jungcar/images/cars/${baseFilename}_large.jpg`;

      // 기본 이미지도 저장
      const defaultPath = path.join(OUTPUT_DIR, `${carNo}.jpg`);
      await sharp(buffer)
        .resize(800, 600, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toFile(defaultPath);
      results.default = `/Jungcar/images/cars/${carNo}.jpg`;
    }
  } catch (err) {
    console.log(`    리사이징 에러: ${err.message}`);
  }

  return results;
}

function parseCarList(html, folderNum, filesDir) {
  const $ = cheerio.load(html);
  const items = [];
  let itemIndex = 0;

  $('div.item').each((_, el) => {
    const $el = $(el);
    const $link = $el.find('a.btn_view');

    if (!$link.length) return;

    const gn = $link.attr('gn') || '';
    const rc = $link.attr('rc') || '';
    const acc = $link.attr('acc') || '';
    const atn = $link.attr('atn') || '';
    const prodmancd = $link.attr('prodmancd') || '';
    const reprcarcd = $link.attr('reprcarcd') || '';
    const detacarcd = $link.attr('detacarcd') || '';
    const cargradcd = $link.attr('cargradcd') || '';

    const exhibitNo = $el.find('.entry-info span').first().text().trim();
    const carName = $el.find('.car-name').text().trim();

    // 옵션 정보 추출
    const options = [];
    $el.find('.option span').each((_, span) => {
      const text = $(span).text().trim().replace(/\s+/g, ' ');
      if (text) options.push(text);
    });

    // 가격 정보
    const startPrice = $el.find('.price-box .inner').first().find('.num').text().trim();
    const hopePrice = $el.find('.price-box .inner').eq(1).find('.num').text().trim();
    const instantPrice = $el.find('.price-box .inner').eq(2).find('.num').text().trim();

    // 상태
    const status = $el.find('.state-tag').text().trim() || $el.find('.state-flag span').text().trim();

    // 상세 정보 추출
    const getDetailText = (selector) => $el.find(selector).text().trim();

    // 이미지 파일명 매칭 (폴더 내 파일 순서 기반)
    const imgFiles = fs.readdirSync(filesDir)
      .filter(f => !f.includes('.') || f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'))
      .filter(f => !f.startsWith('ico_') && !f.startsWith('logo') && !f.includes('.js') && !f.includes('.css'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\((\d+)\)/)?.[1] || '0');
        const numB = parseInt(b.match(/\((\d+)\)/)?.[1] || '0');
        return numA - numB;
      });

    const imgFile = imgFiles[itemIndex] || '';

    if (gn && exhibitNo) {
      items.push({
        id: gn,
        no: exhibitNo,
        name: carName,
        status,
        year: options[0]?.replace(/[^0-9]/g, '') || '',
        transmission: options[1] || '',
        displacement: options[2] || '',
        mileage: options[3] || '',
        color: options[4] || '',
        fuel: options[5] || '',
        usage: options[6] || '',
        grade: '',
        auctionRound: atn ? `${atn}회` : '',
        lane: '',
        plateNumber: '',
        location: '',
        price: startPrice ? parseInt(startPrice.replace(/,/g, '')) : null,
        hope: hopePrice ? parseInt(hopePrice.replace(/,/g, '')) : null,
        instant: instantPrice ? parseInt(instantPrice.replace(/,/g, '')) : null,
        imgFile,
        imgPath: imgFile ? `${filesDir}/${imgFile}` : '',
        url: `${BASE_URL}/auction/exhibitView.do?acc=${acc}&gn=${encodeURIComponent(gn)}&rc=${rc}&atn=${atn}`,
        meta: { prodmancd, reprcarcd, detacarcd, cargradcd }
      });

      itemIndex++;
    }
  });

  return items;
}

async function main() {
  console.log('='.repeat(60));
  console.log('현대글로비스 HTML 파싱 및 이미지 리사이징');
  console.log('시작:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  // 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const allCars = [];
  let totalImages = 0;

  // 폴더 1~11 순회
  for (let i = 1; i <= 11; i++) {
    const htmlPath = `${INPUT_DIR}/${i}/${i}.html`;
    const filesDir = `${INPUT_DIR}/${i}/${i}_files`;

    if (!fs.existsSync(htmlPath)) {
      console.log(`\n폴더 ${i}: HTML 파일 없음`);
      continue;
    }

    console.log(`\n폴더 ${i} 처리 중...`);

    const html = fs.readFileSync(htmlPath, 'utf-8');
    const cars = parseCarList(html, i, filesDir);

    console.log(`  ${cars.length}대 차량 발견`);

    // 이미지 리사이징
    for (let j = 0; j < cars.length; j++) {
      const car = cars[j];

      if (car.imgPath && fs.existsSync(car.imgPath)) {
        try {
          const resized = await processImage(car.imgPath, car.no, 0);

          if (resized.main) {
            car.img = resized.thumb || resized.main;
            car.images = [resized.main];
            car.thumbs = resized.thumb ? [resized.thumb] : [];
            totalImages++;
          }
        } catch (err) {
          console.log(`    ${car.no}: 이미지 처리 실패 - ${err.message}`);
          car.img = `/Jungcar/images/cars/${car.no}.jpg`;
          car.images = [];
          car.thumbs = [];
        }
      } else {
        car.img = `/Jungcar/images/cars/${car.no}.jpg`;
        car.images = [];
        car.thumbs = [];
      }

      // imgPath 제거 (저장 불필요)
      delete car.imgPath;
      delete car.imgFile;
    }

    allCars.push(...cars);
    console.log(`  누적: ${allCars.length}대, 이미지: ${totalImages}개`);
  }

  // 결과 저장
  const result = {
    at: new Date().toISOString(),
    cnt: allCars.length,
    cars: allCars
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`총 차량: ${allCars.length}대`);
  console.log(`총 이미지: ${totalImages}개`);
  console.log(`저장 위치: ${OUTPUT_JSON}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
