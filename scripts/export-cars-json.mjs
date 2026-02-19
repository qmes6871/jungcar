/**
 * DB에서 차량 데이터를 JSON 파일로 내보내기
 * 빌드 전에 실행해서 정적 데이터 생성
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

async function main() {
  console.log('DB에서 차량 데이터 내보내기...');

  const connection = await mysql.createConnection(dbConfig);

  const [rows] = await connection.execute(
    'SELECT * FROM Car ORDER BY createdAt DESC'
  );

  await connection.end();

  // 데이터 형식 변환
  const cars = (rows).map(car => ({
    id: car.id,
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    price: car.price,
    fuel: car.fuel,
    transmission: car.transmission,
    bodyType: car.bodyType,
    color: car.color,
    images: JSON.parse(car.images || '[]'),
    description: car.description,
    status: car.status,
    featured: car.featured,
    drivetrain: 'FWD',
  }));

  // public 폴더에 JSON 파일 저장
  const outputPath = '/var/www/Jungcar/public/data/cars.json';

  // 디렉토리 생성
  fs.mkdirSync('/var/www/Jungcar/public/data', { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(cars, null, 2));

  console.log(`${cars.length}대 차량 데이터 내보내기 완료!`);
  console.log(`파일 위치: ${outputPath}`);
}

main().catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
