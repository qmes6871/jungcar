#!/usr/bin/env node
/**
 * 오토허브 차량 이미지 다운로드 및 리사이징
 * - 썸네일: 400x300
 * - 메인: 800x600
 * - 원본 유지 (최대 1600px)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const DATA_FILE = '/var/www/Jungcar/public/data/autohub-cars.json';
const IMAGE_DIR = '/var/www/Jungcar/public/images/cars';
const BASE_PATH = '/images/cars';

// 이미지 크기 설정
const SIZES = {
  thumb: { width: 400, height: 300 },
  main: { width: 800, height: 600 },
  large: { width: 1600, height: 1200 }
};

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function processImage(buffer, carId, imageIndex) {
  const results = {};
  const baseFilename = `${carId}_${imageIndex}`;

  try {
    // 썸네일
    const thumbPath = path.join(IMAGE_DIR, `${baseFilename}_thumb.jpg`);
    await sharp(buffer)
      .resize(SIZES.thumb.width, SIZES.thumb.height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    results.thumb = `${BASE_PATH}/${baseFilename}_thumb.jpg`;

    // 메인
    const mainPath = path.join(IMAGE_DIR, `${baseFilename}_main.jpg`);
    await sharp(buffer)
      .resize(SIZES.main.width, SIZES.main.height, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mainPath);
    results.main = `${BASE_PATH}/${baseFilename}_main.jpg`;

    // 라지 (첫번째 이미지만)
    if (imageIndex === 0) {
      const largePath = path.join(IMAGE_DIR, `${baseFilename}_large.jpg`);
      await sharp(buffer)
        .resize(SIZES.large.width, SIZES.large.height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(largePath);
      results.large = `${BASE_PATH}/${baseFilename}_large.jpg`;
    }

  } catch (err) {
    console.log(`    리사이징 에러: ${err.message}`);
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('이미지 다운로드 및 리사이징 시작');
  console.log('시간:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));

  // 이미지 디렉토리 생성
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  }

  // 데이터 로드
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  console.log(`총 ${data.cars.length}대 차량`);

  // 이미지가 있는 차량만 처리
  const carsWithImages = data.cars.filter(c => c.images && c.images.length > 0);
  console.log(`이미지 보유 차량: ${carsWithImages.length}대\n`);

  let processed = 0;
  let downloadedImages = 0;
  let errors = 0;

  for (const car of carsWithImages) {
    processed++;
    const carId = car.id;

    // 이미 로컬 이미지가 있으면 스킵
    if (car.image?.startsWith(BASE_PATH)) {
      continue;
    }

    console.log(`[${processed}/${carsWithImages.length}] ${carId} - ${car.images.length}개 이미지`);

    const localImages = [];
    const localThumbs = [];

    // 최대 5개 이미지만 처리 (용량 절약)
    const imagesToProcess = car.images.slice(0, 5);

    for (let i = 0; i < imagesToProcess.length; i++) {
      const imgUrl = imagesToProcess[i];

      try {
        // 다운로드
        const buffer = await downloadImage(imgUrl);

        // 리사이징
        const resized = await processImage(buffer, carId, i);

        if (resized.main) {
          localImages.push(resized.main);
          downloadedImages++;
        }
        if (resized.thumb) {
          localThumbs.push(resized.thumb);
        }

        // 딜레이 (서버 부하 방지)
        await new Promise(r => setTimeout(r, 200));

      } catch (err) {
        errors++;
        // 에러 시 원본 URL 유지
        localImages.push(imgUrl);
      }
    }

    // 차량 데이터 업데이트
    if (localImages.length > 0) {
      car.image = localThumbs[0] || localImages[0];
      car.images = localImages;
      car.thumbs = localThumbs;
    }

    // 진행 상황 저장 (50대마다)
    if (processed % 50 === 0) {
      data.updatedAt = new Date().toISOString();
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log(`  [저장] ${processed}대 처리, ${downloadedImages}개 이미지 다운로드`);
    }

    // 진행률 표시
    if (processed % 10 === 0) {
      console.log(`  진행: ${processed}/${carsWithImages.length} (${((processed/carsWithImages.length)*100).toFixed(1)}%)`);
    }
  }

  // 최종 저장
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('완료:', new Date().toLocaleString('ko-KR'));
  console.log(`처리: ${processed}대`);
  console.log(`다운로드: ${downloadedImages}개 이미지`);
  console.log(`에러: ${errors}개`);
  console.log('='.repeat(60));
}

main().catch(console.error);
