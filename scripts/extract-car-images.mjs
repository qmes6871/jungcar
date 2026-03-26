#!/usr/bin/env node
/**
 * 차량 이미지 추출 및 매핑 스크립트
 * - HTML에서 차량 ID와 이미지 파일 매핑
 * - 이미지를 public 폴더로 복사
 * - JSON 데이터 업데이트
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const INPUT_DIR = '/var/www/Jungcar/other/크롤링';
const OUTPUT_DIR = '/var/www/Jungcar/public/images/cars';
const JSON_PATH = '/var/www/Jungcar/public/data/glovis-cars.json';

// 출력 폴더 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 차량 ID -> 이미지 파일 매핑
const carImageMap = new Map();

console.log('차량 이미지 추출 시작...\n');

// 각 폴더 처리
for (let i = 1; i <= 11; i++) {
  const htmlPath = `${INPUT_DIR}/${i}/${i}.html`;
  const filesDir = `${INPUT_DIR}/${i}/${i}_files`;

  if (!fs.existsSync(htmlPath)) {
    console.log(`폴더 ${i}: HTML 없음`);
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);

  let count = 0;

  // 각 차량 아이템 처리
  $('a.btn_view').each((idx, el) => {
    const $el = $(el);
    const gn = $el.attr('gn');
    if (!gn) return;

    // 이미지 src 찾기
    const imgSrc = $el.find('.thumbnail img').attr('src');
    if (!imgSrc) return;

    // 파일명 추출 (./1_files/OBmZCjL58I(1) -> OBmZCjL58I(1))
    const imgFileName = imgSrc.split('/').pop();
    if (!imgFileName) return;

    const imgPath = `${filesDir}/${imgFileName}`;

    if (fs.existsSync(imgPath)) {
      carImageMap.set(gn, imgPath);
      count++;
    }
  });

  console.log(`폴더 ${i}: ${count}개 이미지 매핑`);
}

console.log(`\n총 ${carImageMap.size}개 이미지 매핑 완료`);

// JSON 데이터 로드
const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
let processedCount = 0;
let skippedCount = 0;

console.log('\n이미지 복사 및 압축 중...');

// 각 차량에 이미지 추가
for (const car of jsonData.cars) {
  const srcPath = carImageMap.get(car.id);

  if (srcPath && fs.existsSync(srcPath)) {
    // 출품번호를 파일명으로 사용
    const destFileName = `${car.no}.jpg`;
    const destPath = `${OUTPUT_DIR}/${destFileName}`;

    try {
      // 이미지 복사 및 압축 (sharp 없이 cp 사용)
      fs.copyFileSync(srcPath, destPath);

      // 이미지 경로 추가
      car.img = `/images/cars/${destFileName}`;
      processedCount++;

      if (processedCount % 100 === 0) {
        console.log(`  ${processedCount}개 처리됨...`);
      }
    } catch (err) {
      skippedCount++;
    }
  } else {
    skippedCount++;
  }
}

// JSON 저장
fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData), 'utf-8');

console.log(`\n완료!`);
console.log(`- 처리된 이미지: ${processedCount}개`);
console.log(`- 스킵된 차량: ${skippedCount}개`);
console.log(`- 이미지 폴더: ${OUTPUT_DIR}`);
console.log(`- JSON 업데이트: ${JSON_PATH}`);
