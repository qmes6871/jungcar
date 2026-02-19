/**
 * 현대글로비스 로컬 HTML 파일에서 차량 데이터 파싱
 * 100대씩 나눠서 처리하고 DB에 저장
 */

import fs from 'fs';
import mysql from 'mysql2/promise';
import { JSDOM } from 'jsdom';

// DB 연결 설정
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'jungcar',
  password: '1234',
  database: 'jungcar',
};

// 브랜드 매핑 (한글 → 영어)
const brandMap = {
  '현대': 'Hyundai',
  '기아': 'Kia',
  '제네시스': 'Genesis',
  '쉐보레(대우)': 'Chevrolet',
  '쉐보레': 'Chevrolet',
  'KG모빌리티(쌍용)': 'KG Mobility',
  'KG모빌리티': 'KG Mobility',
  '쌍용': 'Ssangyong',
  '르노(삼성)': 'Renault Samsung',
  '르노삼성': 'Renault Samsung',
  '벤츠': 'Mercedes-Benz',
  '메르세데스-벤츠': 'Mercedes-Benz',
  'BMW': 'BMW',
  '아우디': 'Audi',
  '폭스바겐': 'Volkswagen',
  '미니': 'Mini',
  '포드': 'Ford',
  '혼다': 'Honda',
  '도요타': 'Toyota',
  '렉서스': 'Lexus',
  '닛산': 'Nissan',
  '볼보': 'Volvo',
  '랜드로버': 'Land Rover',
  '재규어': 'Jaguar',
  '테슬라': 'Tesla',
  '푸조': 'Peugeot',
  '벤틀리': 'Bentley',
  '캐딜락': 'Cadillac',
  '크라이슬러': 'Chrysler',
  '지프': 'Jeep',
  '포르쉐': 'Porsche',
  '링컨': 'Lincoln',
  '인피니티': 'Infiniti',
  '마세라티': 'Maserati',
  '페라리': 'Ferrari',
  '람보르기니': 'Lamborghini',
  '롤스로이스': 'Rolls-Royce',
};

// 연료 매핑
const fuelMap = {
  '휘발유': 'Gasoline',
  '가솔린': 'Gasoline',
  '경유': 'Diesel',
  '디젤': 'Diesel',
  'LPG': 'LPG',
  '전기': 'Electric',
  '하이브리드': 'Hybrid',
  '가솔린+전기': 'Hybrid',
  '디젤+전기': 'Hybrid',
  'CNG': 'CNG',
};

// 색상 매핑
const colorMap = {
  '흰색': 'White',
  '백색': 'White',
  '화이트': 'White',
  '진주': 'Pearl White',
  '검정': 'Black',
  '검정색': 'Black',
  '블랙': 'Black',
  '은색': 'Silver',
  '실버': 'Silver',
  '회색': 'Gray',
  '그레이': 'Gray',
  '빨강': 'Red',
  '레드': 'Red',
  '파랑': 'Blue',
  '블루': 'Blue',
  '청색': 'Blue',
  '남색': 'Navy',
  '녹색': 'Green',
  '그린': 'Green',
  '노랑': 'Yellow',
  '금색': 'Gold',
  '골드': 'Gold',
  '갈색': 'Brown',
  '브라운': 'Brown',
  '베이지': 'Beige',
  '보라': 'Purple',
  '주황': 'Orange',
  '기타': 'Other',
};

// 차체 유형 판별
function getBodyType(modelName) {
  const suvKeywords = ['투싼', '싼타페', '팰리세이드', '코나', '베뉴', '스포티지', '쏘렌토', '모하비', '셀토스', 'GV80', 'GV70', 'GV60', '티볼리', '코란도', '렉스턴', '토레스', 'QM6', 'XM3', '티구안', 'Q5', 'Q7', 'X3', 'X5', 'GLC', 'GLE', '트레일블레이저', '트랙스', '이쿼녹스', '올란도'];
  const vanKeywords = ['카니발', '스타리아', '스타렉스', '포터', '봉고', '승합', '밴'];
  const truckKeywords = ['트럭', '화물', '덤프'];
  const hatchbackKeywords = ['모닝', '스파크', '레이', '캐스퍼', 'i30', '벨로스터', '골프'];

  if (suvKeywords.some(kw => modelName.includes(kw))) return 'SUV';
  if (vanKeywords.some(kw => modelName.includes(kw))) return 'Van';
  if (truckKeywords.some(kw => modelName.includes(kw))) return 'Truck';
  if (hatchbackKeywords.some(kw => modelName.includes(kw))) return 'Hatchback';
  return 'Sedan';
}

// 가격을 USD로 변환 (1 USD = 약 1,350 KRW 기준)
function convertToUSD(priceInManwon) {
  const krw = priceInManwon * 10000; // 만원 → 원
  return Math.round(krw / 1350); // 원 → USD
}

// HTML 파싱
async function parseHTML(htmlPath) {
  console.log(`파일 읽는 중: ${htmlPath}`);
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const cars = [];
  const items = document.querySelectorAll('.item');

  console.log(`총 ${items.length}개 아이템 발견\n`);

  items.forEach((item, index) => {
    try {
      // 차량명 파싱: [브랜드] 모델명
      const carNameEl = item.querySelector('.car-name');
      if (!carNameEl) return;

      const fullName = carNameEl.textContent.trim();
      const brandMatch = fullName.match(/\[([^\]]+)\]/);
      if (!brandMatch) return;

      const korBrand = brandMatch[1];
      const brand = brandMap[korBrand] || korBrand;
      const model = fullName.replace(/\[[^\]]+\]\s*/, '').trim();

      // 옵션 정보 파싱
      const optionEl = item.querySelector('.option');
      if (!optionEl) return;

      const options = Array.from(optionEl.querySelectorAll('span')).map(s => s.textContent.trim());

      // 연식
      const year = parseInt(options[0]) || 2020;

      // 변속기
      const transmissionKor = options[1] || 'A/T';
      const transmission = transmissionKor.includes('A/T') || transmissionKor.includes('오토') ? 'Automatic' : 'Manual';

      // 배기량 (cc)
      const ccMatch = options[2]?.match(/([\d,]+)cc/);
      const engineCC = ccMatch ? parseInt(ccMatch[1].replace(/,/g, '')) : null;

      // 주행거리
      const mileageText = options[3] || '0';
      const mileageMatch = mileageText.match(/([\d,]+)/);
      const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : 0;

      // 색상
      const colorKor = options[4]?.trim() || '기타';
      const color = colorMap[colorKor] || colorKor;

      // 연료
      const fuelKor = options[5]?.trim() || '휘발유';
      const fuel = fuelMap[fuelKor] || 'Gasoline';

      // 가격 파싱
      const priceEl = item.querySelector('.price-box .price .num');
      const priceText = priceEl?.textContent?.trim() || '0';
      const priceManwon = parseInt(priceText.replace(/,/g, '')) || 0;
      const priceUSD = convertToUSD(priceManwon);

      // 출품번호
      const entryNoEl = item.querySelector('.entry-info span');
      const entryNo = entryNoEl?.textContent?.trim() || '';

      // 이미지
      const imgEl = item.querySelector('.thumbnail img');
      let imgSrc = imgEl?.getAttribute('src') || '';

      // 로컬 파일 경로를 웹 경로로 변환
      if (imgSrc.includes('현대글로비스_files')) {
        const fileName = imgSrc.split('/').pop();
        imgSrc = `/images/auction/${fileName}.jpg`;
      }

      // 차체 유형
      const bodyType = getBodyType(model);

      cars.push({
        brand,
        model,
        year,
        mileage,
        price: priceUSD,
        fuel,
        transmission,
        bodyType,
        color,
        images: imgSrc ? [imgSrc] : [],
        description: `출품번호: ${entryNo}, 배기량: ${engineCC || 'N/A'}cc, 원가: ${priceManwon}만원`,
        status: 'available',
        featured: false,
        entryNo,
        engineCC,
        priceKRW: priceManwon,
      });
    } catch (err) {
      console.error(`아이템 ${index} 파싱 오류:`, err.message);
    }
  });

  return cars;
}

// 100대씩 DB에 저장
async function saveCarsInBatches(connection, cars, batchSize = 100) {
  const totalBatches = Math.ceil(cars.length / batchSize);
  let savedTotal = 0;

  // 기존 차량 삭제
  console.log('기존 차량 데이터 삭제 중...');
  const [deleteResult] = await connection.execute('DELETE FROM Car');
  console.log(`${deleteResult.affectedRows}개 기존 데이터 삭제 완료\n`);

  const insertSQL = `
    INSERT INTO Car (brand, model, year, mileage, price, fuel, transmission, bodyType, color, images, description, status, featured, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, cars.length);
    const batch = cars.slice(start, end);

    console.log(`\n========== 배치 ${i + 1}/${totalBatches} (${start + 1}~${end}번 차량) ==========`);

    let batchSaved = 0;
    for (const car of batch) {
      try {
        await connection.execute(insertSQL, [
          car.brand,
          car.model,
          car.year,
          car.mileage,
          car.price,
          car.fuel,
          car.transmission,
          car.bodyType,
          car.color,
          JSON.stringify(car.images),
          car.description,
          car.status,
          car.featured ? 1 : 0,
        ]);
        batchSaved++;
      } catch (err) {
        console.error(`  저장 실패 - ${car.brand} ${car.model}: ${err.message}`);
      }
    }

    savedTotal += batchSaved;

    // 배치 완료 보고
    console.log(`\n✅ 배치 ${i + 1} 완료!`);
    console.log(`   - 이번 배치: ${batchSaved}/${batch.length}대 저장`);
    console.log(`   - 누적 저장: ${savedTotal}/${cars.length}대`);
    console.log(`   - 진행률: ${Math.round((savedTotal / cars.length) * 100)}%`);

    // 샘플 차량 출력
    if (batch.length > 0) {
      const sample = batch[0];
      console.log(`   - 첫 번째 차량: ${sample.brand} ${sample.model} (${sample.year}) - $${sample.price.toLocaleString()}`);
    }
  }

  return savedTotal;
}

async function main() {
  console.log('=== 현대글로비스 차량 데이터 파싱 시작 ===\n');

  const htmlPath = '/var/www/Jungcar/other/크롤링/현대글로비스.html';

  // HTML 파싱
  const cars = await parseHTML(htmlPath);
  console.log(`\n총 ${cars.length}대 차량 파싱 완료`);

  if (cars.length === 0) {
    console.log('파싱된 차량이 없습니다.');
    return;
  }

  // 브랜드별 통계
  const brandStats = {};
  cars.forEach(car => {
    brandStats[car.brand] = (brandStats[car.brand] || 0) + 1;
  });
  console.log('\n브랜드별 차량 수:');
  Object.entries(brandStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([brand, count]) => {
      console.log(`  ${brand}: ${count}대`);
    });

  // DB 연결
  console.log('\n\nDB 연결 중...');
  const connection = await mysql.createConnection(dbConfig);
  console.log('DB 연결 성공!');

  // DB에 저장
  console.log('\n\n=== DB 저장 시작 (100대씩) ===');
  const saved = await saveCarsInBatches(connection, cars, 100);

  console.log('\n\n========================================');
  console.log(`🎉 작업 완료! 총 ${saved}/${cars.length}대 저장됨`);
  console.log('========================================');

  await connection.end();
}

main().catch(async (err) => {
  console.error('오류:', err);
  process.exit(1);
});
