/**
 * DB에서 차량 상세 데이터를 JSON 파일로 내보내기
 */

import fs from 'fs';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'jungcar',
  password: '1234',
  database: 'jungcar',
};

// 기본 옵션 생성
function generateOptions() {
  return [
    { name: 'Navigation', available: Math.random() > 0.3 },
    { name: 'Rear Camera', available: Math.random() > 0.2 },
    { name: 'Bluetooth', available: true },
    { name: 'Air Conditioning', available: true },
    { name: 'Power Windows', available: true },
    { name: 'Power Steering', available: true },
    { name: 'Central Locking', available: true },
    { name: 'Airbags', available: true },
    { name: 'ABS', available: true },
    { name: 'Leather Seats', available: Math.random() > 0.5 },
    { name: 'Sunroof', available: Math.random() > 0.7 },
    { name: 'Heated Seats', available: Math.random() > 0.6 },
  ];
}

// 성능 리포트 생성
function generatePerformanceReport() {
  const grades = ['A', 'B', 'C'];
  const conditions = ['Good', 'Fair', 'Excellent'];
  const statuses = ['Normal', 'Repainted', 'Replaced'];

  return {
    accidentHistory: Math.random() > 0.7 ? 'Yes (Minor)' : 'No',
    floodDamage: 'No',
    totalLoss: 'No',
    usageChange: 'No',
    odometerStatus: 'Normal',
    overallGrade: grades[Math.floor(Math.random() * grades.length)],
    exteriorCondition: conditions[Math.floor(Math.random() * conditions.length)],
    interiorCondition: conditions[Math.floor(Math.random() * conditions.length)],
    engineCondition: conditions[Math.floor(Math.random() * conditions.length)],
    transmissionCondition: 'Good',
    steeringCondition: 'Good',
    brakeCondition: 'Good',
    electricalCondition: 'Good',
    tireCondition: conditions[Math.floor(Math.random() * conditions.length)],
    paintStatus: {
      hood: statuses[Math.floor(Math.random() * 2)],
      frontLeftFender: 'Normal',
      frontRightFender: 'Normal',
      frontLeftDoor: statuses[Math.floor(Math.random() * 2)],
      frontRightDoor: 'Normal',
      rearLeftDoor: 'Normal',
      rearRightDoor: 'Normal',
      rearLeftFender: 'Normal',
      rearRightFender: 'Normal',
      trunk: 'Normal',
      roof: 'Normal',
    },
  };
}

async function main() {
  console.log('DB에서 차량 상세 데이터 내보내기...');

  const connection = await mysql.createConnection(dbConfig);

  const [rows] = await connection.execute(
    'SELECT * FROM Car ORDER BY id ASC'
  );

  await connection.end();

  // 상세 데이터 형식으로 변환
  const carsData = {};

  rows.forEach((car, index) => {
    const images = JSON.parse(car.images || '[]');
    // 이미지 경로 수정 - .jpg 확장자 제거 (파일명에 이미 있을 수 있음)
    const fixedImages = images.map(img => {
      // /images/auction/OBmZCjL58I(61).jpg 형태를 /Jungcar/images/auction/OBmZCjL58I(61) 형태로
      let fixedPath = img.replace('.jpg', '');
      if (!fixedPath.startsWith('/Jungcar')) {
        fixedPath = '/Jungcar' + fixedPath;
      }
      return fixedPath;
    });

    // 배기량 추출
    const ccMatch = car.description?.match(/배기량:\s*([\d,]+)cc/);
    const displacement = ccMatch ? ccMatch[1] + 'cc' : 'N/A';

    // 출품번호 추출
    const entryMatch = car.description?.match(/출품번호:\s*(\d+)/);
    const entryNo = entryMatch ? entryMatch[1] : String(1000 + car.id);

    carsData[car.id] = {
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      price: car.price * 1350, // USD to KRW (만원 단위로 표시를 위해)
      fuel: car.fuel,
      transmission: car.transmission,
      bodyType: car.bodyType,
      color: car.color,
      engine: displacement,
      displacement: displacement,
      drivetrain: 'Front-Wheel Drive',
      doors: 4,
      seats: 5,
      vin: `AUCTION${String(car.id).padStart(8, '0')}`,
      plateNumber: `Auction #${entryNo}`,
      firstRegistration: `${car.year}-01-01`,
      description: `${car.brand} ${car.model} from Hyundai Glovis Auction. ${car.description || ''}`,
      images: fixedImages.length > 0 ? fixedImages : ['/Jungcar/images/auction/OBmZCjL58I'],
      status: 'auction',
      options: generateOptions(),
      performanceReport: generatePerformanceReport(),
    };
  });

  // public 폴더에 JSON 파일 저장
  const outputPath = '/var/www/Jungcar/public/data/cars-detail.json';
  fs.mkdirSync('/var/www/Jungcar/public/data', { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(carsData, null, 2));

  console.log(`${Object.keys(carsData).length}대 차량 상세 데이터 내보내기 완료!`);
  console.log(`파일 위치: ${outputPath}`);

  // ID 목록도 저장 (generateStaticParams용)
  const idsPath = '/var/www/Jungcar/public/data/car-ids.json';
  fs.writeFileSync(idsPath, JSON.stringify(Object.keys(carsData)));
  console.log(`ID 목록 저장: ${idsPath}`);
}

main().catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
