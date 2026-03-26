import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';
const BASE_URL = 'https://www.sellcarauction.co.kr';

// Korean to English mappings
const brandMap = {
  '현대': 'Hyundai', '기아': 'Kia', '제네시스': 'Genesis', '쉐보레': 'Chevrolet',
  '쉐보레(한국GM)': 'Chevrolet', '르노삼성': 'Renault Samsung', '르노코리아': 'Renault Korea',
  '쌍용': 'Ssangyong', 'KG모빌리티': 'KG Mobility', 'GM대우': 'GM Daewoo', 'BMW': 'BMW',
  '벤츠': 'Mercedes-Benz', '메르세데스': 'Mercedes-Benz', '아우디': 'Audi', '폭스바겐': 'Volkswagen',
  '도요타': 'Toyota', '혼다': 'Honda', '렉서스': 'Lexus', '닛산': 'Nissan', '볼보': 'Volvo',
  '포르쉐': 'Porsche', '랜드로버': 'Land Rover', '재규어': 'Jaguar', '포드': 'Ford', '지프': 'Jeep',
  '테슬라': 'Tesla', '미니': 'Mini', '인피니티': 'Infiniti', '링컨': 'Lincoln', '캐딜락': 'Cadillac',
  '마세라티': 'Maserati', '푸조': 'Peugeot', '시트로엥': 'Citroen', '피아트': 'Fiat',
  '크라이슬러': 'Chrysler', '스바루': 'Subaru', '마쓰다': 'Mazda', '대우버스': 'Daewoo Bus',
};

const fuelMap = {
  '가솔린': 'Gasoline', '휘발유': 'Gasoline', '디젤': 'Diesel', '경유': 'Diesel',
  '전기': 'Electric', '하이브리드': 'Hybrid', 'LPG': 'LPG', '가솔린+전기': 'Hybrid',
  '디젤+전기': 'Hybrid', 'CNG': 'CNG', 'LPi': 'LPG',
};

const colorMap = {
  '흰색': 'White', '백색': 'White', '화이트': 'White', '검정': 'Black', '검정색': 'Black',
  '블랙': 'Black', '은색': 'Silver', '실버': 'Silver', '회색': 'Gray', '그레이': 'Gray',
  '진주': 'Pearl White', '빨강': 'Red', '레드': 'Red', '파랑': 'Blue', '블루': 'Blue',
  '남색': 'Navy', '갈색': 'Brown', '브라운': 'Brown', '베이지': 'Beige', '노랑': 'Yellow',
  '녹색': 'Green', '그린': 'Green', '주황': 'Orange', '보라': 'Purple', '금색': 'Gold',
  '골드': 'Gold', '청색': 'Blue', '기타': 'Other',
};

const modelMap = {
  '그랜저': 'Grandeur', '그랜져': 'Grandeur', '쏘나타': 'Sonata', '아반떼': 'Avante',
  '투싼': 'Tucson', '싼타페': 'Santa Fe', '팰리세이드': 'Palisade', '코나': 'Kona',
  '아이오닉': 'Ioniq', '스타렉스': 'Starex', '스타리아': 'Staria', '포터': 'Porter',
  '베라크루즈': 'Veracruz', '벨로스터': 'Veloster', '엑센트': 'Accent', '에쿠스': 'Equus',
  '캐스퍼': 'Casper', '넥쏘': 'Nexo', '베뉴': 'Venue',
  'K9': 'K9', 'K8': 'K8', 'K7': 'K7', 'K5': 'K5', 'K3': 'K3',
  '스포티지': 'Sportage', '쏘렌토': 'Sorento', '모하비': 'Mohave', '카니발': 'Carnival',
  '셀토스': 'Seltos', '니로': 'Niro', '스팅어': 'Stinger', '레이': 'Ray', '모닝': 'Morning',
  '봉고': 'Bongo', '포르테': 'Forte', 'EV6': 'EV6', 'EV9': 'EV9',
  'G90': 'G90', 'G80': 'G80', 'G70': 'G70', 'GV80': 'GV80', 'GV70': 'GV70', 'GV60': 'GV60',
  '말리부': 'Malibu', '크루즈': 'Cruze', '트레일블레이저': 'Trailblazer', '트랙스': 'Trax',
  '올란도': 'Orlando', '스파크': 'Spark', '임팔라': 'Impala',
  '티볼리': 'Tivoli', '코란도': 'Korando', '렉스턴': 'Rexton', '토레스': 'Torres',
  'SM6': 'SM6', 'SM5': 'SM5', 'SM3': 'SM3', 'QM6': 'QM6', 'XM3': 'XM3',
  '티구안': 'Tiguan', '골프': 'Golf', '3시리즈': '3 Series', '5시리즈': '5 Series',
};

function extractBrand(text) {
  if (!text) return 'Unknown';
  for (const [kr, en] of Object.entries(brandMap)) {
    if (text.includes(kr)) return en;
  }
  return 'Other';
}

function translateModel(text) {
  if (!text) return 'Unknown Model';
  let cleaned = text
    .replace(/더\s*뉴\s*/g, '').replace(/뉴\s*/g, '').replace(/올\s*뉴\s*/g, '')
    .replace(/\(\d+년~[^)]*\)/g, '').replace(/\d+인승/g, '').trim();

  for (const [kr] of Object.entries(brandMap)) {
    cleaned = cleaned.replace(kr, '').trim();
  }

  for (const [kr, en] of Object.entries(modelMap)) {
    if (cleaned.includes(kr)) cleaned = cleaned.replace(kr, en);
  }

  cleaned = cleaned
    .replace(/터보/g, 'Turbo').replace(/프리미엄/g, 'Premium').replace(/럭셔리/g, 'Luxury')
    .replace(/스마트/g, 'Smart').replace(/프레스티지/g, 'Prestige').replace(/익스클루시브/g, 'Exclusive')
    .replace(/디젤/g, 'Diesel').replace(/가솔린/g, 'Gasoline')
    .replace(/\s+/g, ' ').trim();

  return cleaned || text;
}

function translateFuel(text) {
  if (!text) return 'Gasoline';
  for (const [kr, en] of Object.entries(fuelMap)) {
    if (text.includes(kr)) return en;
  }
  return 'Gasoline';
}

function translateColor(text) {
  if (!text) return 'Unknown';
  for (const [kr, en] of Object.entries(colorMap)) {
    if (text.includes(kr)) return en;
  }
  return text || 'Unknown';
}

async function main() {
  console.log('Starting AutoHub Auction crawler...');
  console.log('Target: sellcarauction.co.kr');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Login
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/newfront/login.do`, { waitUntil: 'networkidle', timeout: 60000 });

    // Select member type (individual)
    await page.evaluate(() => {
      const radio = document.getElementById('i_sLoginGubun2');
      if (radio) radio.click();
    });
    await page.waitForTimeout(500);

    // Fill login form
    await page.evaluate(({ user, pass }) => {
      const userInput = document.getElementById('i_sUserId');
      const passInput = document.getElementById('i_sPswd');
      if (userInput) userInput.value = user;
      if (passInput) passInput.value = pass;
    }, { user: USERNAME, pass: PASSWORD });

    // Submit login
    await page.evaluate(() => {
      if (typeof fnLoginCheck === 'function') fnLoginCheck();
    });

    await page.waitForTimeout(4000);
    console.log('Login successful');

    // Navigate to exhibit list (내차 잘 사기 > 출품리스트)
    console.log('Navigating to exhibit list...');
    await page.evaluate(() => {
      if (typeof checkAuthority === 'function') checkAuthority('AC1');
    });
    await page.waitForTimeout(5000);

    // Get total count
    const totalCars = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/총\s*(\d+)건/);
      return match ? parseInt(match[1]) : 0;
    });
    console.log(`Total cars found: ${totalCars}`);

    const allCars = [];
    let currentPage = 1;
    const carsPerPage = 10;
    const maxPages = Math.ceil(totalCars / carsPerPage); // 전체 페이지 크롤링 (제한 없음)

    while (currentPage <= maxPages) {
      console.log(`Scraping page ${currentPage}/${maxPages}...`);

      // Extract cars from current page
      const carsOnPage = await page.evaluate((baseUrl) => {
        const cars = [];

        // Get all car images
        const carImages = Array.from(document.querySelectorAll('.car-item img.img-fluid')).map(img => img.src);

        // Get text from car_img_area's siblings (car info areas)
        const imgAreas = document.querySelectorAll('.car_img_area');

        imgAreas.forEach((area, idx) => {
          try {
            // Get the parent row which contains both image and info
            const row = area.closest('.row');
            if (!row) return;

            const fullText = row.innerText || '';
            if (fullText.trim().length < 20) return;

            // Extract car info from text
            const nameMatch = fullText.match(/(현대|기아|제네시스|벤츠|BMW|쌍용|쉐보레|르노|아우디|폭스바겐|포드|볼보|혼다|테슬라|렉서스|닛산|도요타|랜드로버|재규어|지프|미니|포르쉐|캐딜락|링컨|마세라티|메르세데스)[^\n]+/);
            const name = nameMatch ? nameMatch[0].trim() : '';

            if (!name) return;

            const yearMatch = fullText.match(/(\d{4})\s+[\d,]+km/);
            const mileageMatch = fullText.match(/([\d,]+)km/i);
            const transmissionMatch = fullText.match(/오토|수동|자동/);
            const fuelMatch = fullText.match(/휘발유|경유|전기|하이브리드|가솔린|디젤|LPG/);
            const colorMatch = fullText.match(/흰색|검정|은색|회색|파랑|빨강|기타|블랙|화이트|실버|그레이|진주|베이지/);
            const exhibitMatch = fullText.match(/출품번호\s*:\s*(\d+)/);
            const priceMatch = fullText.match(/시작가\s*:\s*([\d,]+)/);

            // Get image from the car-item inside this area
            let imgSrc = '';
            const imgEl = area.querySelector('img.img-fluid');
            if (imgEl && imgEl.src && !imgEl.src.includes('logo') && !imgEl.src.includes('icon')) {
              imgSrc = imgEl.src;
            }

            cars.push({
              name,
              nameKr: name,
              year: yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear(),
              mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : 0,
              transmission: transmissionMatch ? transmissionMatch[0] : '오토',
              fuel: fuelMatch ? fuelMatch[0] : '휘발유',
              color: colorMatch ? colorMatch[0] : '기타',
              exhibitNo: exhibitMatch ? exhibitMatch[1] : '',
              price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0,
              imgSrc,
              carId: exhibitMatch ? exhibitMatch[1] : '',
            });
          } catch (e) {
            // Skip errored items
          }
        });

        return cars;
      }, BASE_URL);

      console.log(`  Found ${carsOnPage.length} cars on page ${currentPage}`);
      allCars.push(...carsOnPage);

      // Go to next page
      if (currentPage < maxPages) {
        try {
          const nextPage = currentPage + 1;
          await page.evaluate((np) => {
            if (typeof CmPageMove === 'function') {
              CmPageMove(String(np));
            }
          }, nextPage);
          await page.waitForTimeout(2500);
          currentPage++;
        } catch (e) {
          console.log('Pagination error:', e.message);
          break;
        }
      } else {
        break;
      }
    }

    console.log(`\nTotal cars extracted: ${allCars.length}`);

    // Process and deduplicate
    const processedCars = [];
    const seenIds = new Set();

    for (const car of allCars) {
      // Skip duplicates
      const key = car.exhibitNo || car.carId || car.name;
      if (seenIds.has(key)) continue;
      seenIds.add(key);

      const brand = extractBrand(car.name);
      // Unknown 브랜드도 포함 (필터링 제거)

      const model = translateModel(car.name);
      const fuel = translateFuel(car.fuel);
      const color = translateColor(car.color);
      const transmission = car.transmission?.includes('오토') || car.transmission?.includes('자동') || car.transmission?.includes('A/T') ? 'Automatic' : 'Manual';

      // Determine body type
      let bodyType = 'Sedan';
      if (/SUV|투싼|싼타페|쏘렌토|스포티지|팰리세이드|코나|베뉴|셀토스|티볼리|코란도|렉스턴|티구안|QM6|XM3/.test(car.name)) {
        bodyType = 'SUV';
      } else if (/카니발|스타리아|스타렉스|승합/.test(car.name)) {
        bodyType = 'Van';
      } else if (/화물|트럭|포터|봉고/.test(car.name)) {
        bodyType = 'Truck';
      }

      processedCars.push({
        id: car.exhibitNo || car.carId || `car-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        brand,
        model,
        nameKr: car.name,
        year: car.year,
        mileage: car.mileage,
        mileageFormatted: car.mileage.toLocaleString() + ' km',
        price: car.price,
        priceFormatted: car.price > 0 ? car.price.toLocaleString() + '만원' : 'Price TBD',
        fuel,
        transmission,
        bodyType,
        color,
        image: car.imgSrc || '/images/auction/car-placeholder.jpg',
        status: 'Available',
      });
    }

    console.log(`Processed ${processedCars.length} unique cars`);

    // Save to JSON file
    const outputDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'autohub-cars.json');
    const outputData = {
      updatedAt: new Date().toISOString(),
      totalCount: processedCars.length,
      cars: processedCars,
    };

    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`\nSaved ${processedCars.length} cars to ${outputFile}`);

    // Print sample
    if (processedCars.length > 0) {
      console.log('\nSample cars:');
      processedCars.slice(0, 5).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.brand} ${c.model} (${c.year}) - ${c.priceFormatted}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/tmp/autohub-error.png' });
  } finally {
    await browser.close();
  }
}

main();
