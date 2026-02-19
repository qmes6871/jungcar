import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  '마세라티': 'Maserati', '람보르기니': 'Lamborghini', '페라리': 'Ferrari', '벤틀리': 'Bentley',
  '롤스로이스': 'Rolls-Royce', '푸조': 'Peugeot', '시트로엥': 'Citroen', '피아트': 'Fiat',
  '크라이슬러': 'Chrysler', '스바루': 'Subaru', '마쓰다': 'Mazda', '미쓰비시': 'Mitsubishi', '대우버스': 'Daewoo Bus',
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
  '봉고': 'Bongo', '포르테': 'Forte', 'EV6': 'EV6', 'EV9': 'EV9', 'EV4': 'EV4',
  'G90': 'G90', 'G80': 'G80', 'G70': 'G70', 'GV80': 'GV80', 'GV70': 'GV70', 'GV60': 'GV60',
  '말리부': 'Malibu', '크루즈': 'Cruze', '트레일블레이저': 'Trailblazer', '트랙스': 'Trax',
  '올란도': 'Orlando', '스파크': 'Spark', '임팔라': 'Impala',
  '티볼리': 'Tivoli', '코란도': 'Korando', '렉스턴': 'Rexton', '토레스': 'Torres',
  'SM6': 'SM6', 'SM5': 'SM5', 'SM3': 'SM3', 'QM6': 'QM6', 'XM3': 'XM3',
  '티구안': 'Tiguan', '골프': 'Golf',
};

// Option name translations
const optionMap = {
  '선루프': 'Sunroof', '파노라마선루프': 'Panoramic Sunroof', '썬루프': 'Sunroof',
  '가죽시트': 'Leather Seats', '통풍시트': 'Ventilated Seats', '열선시트': 'Heated Seats',
  '열선핸들': 'Heated Steering Wheel', '후방카메라': 'Rear Camera', '어라운드뷰': 'Around View Monitor',
  '네비게이션': 'Navigation', '블루투스': 'Bluetooth', '스마트키': 'Smart Key',
  'LED헤드라이트': 'LED Headlights', 'HUD': 'Head-Up Display', '헤드업디스플레이': 'Head-Up Display',
  '크루즈컨트롤': 'Cruise Control', '어댑티브크루즈': 'Adaptive Cruise Control',
  '차선이탈경보': 'Lane Departure Warning', '전방충돌경보': 'Forward Collision Warning',
  '후측방경보': 'Blind Spot Monitor', '주차보조': 'Parking Assist', '자동주차': 'Auto Parking',
  '전동트렁크': 'Power Trunk', '전동사이드미러': 'Power Side Mirrors',
  'JBL': 'JBL Premium Audio', 'BOSE': 'Bose Premium Audio', '하만카돈': 'Harman Kardon Audio',
  '애플카플레이': 'Apple CarPlay', '안드로이드오토': 'Android Auto',
  '무선충전': 'Wireless Charging', '블랙박스': 'Dash Camera', '하이패스': 'Hi-Pass',
};

function extractBrand(text) {
  if (!text) return 'Unknown';
  for (const [kr, en] of Object.entries(brandMap)) {
    if (text.includes(kr)) return en;
  }
  return 'Unknown';
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
    .replace(/스페셜/g, 'Special').replace(/르블랑/g, 'Le Blanc').replace(/비전/g, 'Vision')
    .replace(/디젤/g, 'Diesel').replace(/가솔린/g, 'Gasoline').replace(/[가-힣]+/g, '')
    .replace(/\s+/g, ' ').trim();

  return cleaned || 'Unknown Model';
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

function translateOption(text) {
  if (!text) return text;
  for (const [kr, en] of Object.entries(optionMap)) {
    if (text.includes(kr)) return en;
  }
  // Clean Korean and return
  return text.replace(/[가-힣]+/g, '').trim() || text;
}

async function fetchCarDetails(mainPage, carId, listImageUrl, context) {
  try {
    // Navigate to detail page by calling carInfo function (this properly loads images)
    await mainPage.evaluate((id) => {
      if (typeof carInfo === 'function') {
        carInfo(id);
      }
    }, carId);

    await mainPage.waitForTimeout(3000); // Wait for page to fully load with images

    // Extract detailed information
    const details = await mainPage.evaluate(() => {
      const result = {
        images: [],
        options: [],
        description: '',
        engineCC: null,
        grade: '',
        inspectionData: null,
        damageInfo: '',
      };

      // Get all images from imagePathList (this is populated when navigating via carInfo)
      if (typeof imagePathList !== 'undefined' && Array.isArray(imagePathList)) {
        imagePathList.forEach(path => {
          const fullUrl = 'http://www.sellcarauction.co.kr' + path;
          if (!result.images.includes(fullUrl)) {
            result.images.push(fullUrl);
          }
        });
      }

      // Also get images from slider if imagePathList is empty
      if (result.images.length === 0) {
        document.querySelectorAll('.slick-slide img, .slider img, img[src*="AJSCIMG"]').forEach(img => {
          const src = img.src;
          if (src && src.includes('AJSCIMG') && !src.includes('no_img')) {
            // Get the original (not _L or _S) version
            const cleanUrl = src.replace(/_[LS]\.jpg$/i, '.jpg');
            if (!result.images.includes(cleanUrl)) {
              result.images.push(cleanUrl);
            }
          }
        });
      }

      // Get options from the table
      const optionCategories = ['편의', 'SR(선루프)', '시트', '전동시트', '기타옵션'];
      document.querySelectorAll('th, td').forEach(cell => {
        const text = cell.innerText?.trim();
        if (optionCategories.some(cat => text === cat || text?.includes(cat))) {
          const nextSibling = cell.nextElementSibling;
          if (nextSibling) {
            const optText = nextSibling.innerText?.trim();
            if (optText && optText.length > 1 && optText.length < 300) {
              // Split by spaces and common delimiters
              optText.split(/[\s,\/\n]+/).forEach(opt => {
                const trimmed = opt.trim();
                if (trimmed.length > 1 && trimmed.length < 50 && !result.options.includes(trimmed)) {
                  result.options.push(trimmed);
                }
              });
            }
          }
        }
      });

      // Get performance evaluation info
      const inspection = {};

      // Look for flood/total loss info
      document.querySelectorAll('th, td').forEach(cell => {
        const text = cell.innerText?.trim();
        if (text?.includes('전손/침수') || text?.includes('보험이력')) {
          const nextSibling = cell.nextElementSibling;
          if (nextSibling) {
            const value = nextSibling.innerText?.trim();
            if (value.includes('전손사고 : N')) {
              inspection.totalLoss = 'No';
            } else if (value.includes('전손사고 : Y')) {
              inspection.totalLoss = 'Yes';
            }
            if (value.includes('침수전손사고 : N') && value.includes('침수분손사고 : N')) {
              inspection.floodDamage = 'None';
            } else if (value.includes('침수') && value.includes(': Y')) {
              inspection.floodDamage = 'Yes';
            }
          }
        }

        // Get evaluation score
        if (text === '평가점') {
          const nextSibling = cell.nextElementSibling;
          if (nextSibling) {
            result.grade = nextSibling.innerText?.trim();
          }
        }

        // Get special notes
        if (text?.includes('특기사항') || text?.includes('점검자 의견')) {
          const nextSibling = cell.nextElementSibling;
          if (nextSibling) {
            const notes = nextSibling.innerText?.trim();
            if (notes && notes.length > 1) {
              result.description += notes + ' ';
            }
          }
        }
      });

      // Get engine displacement from body text
      const bodyText = document.body.innerText;
      const ccMatch = bodyText.match(/(\d{1,2}[,.]?\d{3})\s*cc/i);
      if (ccMatch) result.engineCC = parseInt(ccMatch[1].replace(/[,.]/g, ''));

      if (Object.keys(inspection).length > 0) {
        result.inspectionData = inspection;
      }

      return result;
    });

    // If no images were found from the page, use the list image
    if (details.images.length === 0 && listImageUrl) {
      details.images.push(listImageUrl);
    }

    // Go back to list page for next car
    await mainPage.goBack({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await mainPage.waitForTimeout(1500);

    return details;
  } catch (error) {
    console.log(`  Error fetching details for ${carId}:`, error.message);
    // Return at least the list image
    return {
      images: listImageUrl ? [listImageUrl] : [],
      options: [],
      description: '',
      engineCC: null,
      grade: '',
      inspectionData: null,
      damageInfo: '',
    };
  }
}

async function main() {
  console.log('Starting Hub Auction crawler with detailed info...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Login
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/newfront/login.do`, { waitUntil: 'networkidle' });

    await page.evaluate(() => {
      const radio = document.getElementById('i_sLoginGubun2');
      if (radio) radio.click();
    });
    await page.waitForTimeout(500);

    await page.evaluate(({ user, pass }) => {
      const userInput = document.getElementById('i_sUserId');
      const passInput = document.getElementById('i_sPswd');
      if (userInput) userInput.value = user;
      if (passInput) passInput.value = pass;
    }, { user: USERNAME, pass: PASSWORD });

    await page.evaluate(() => {
      if (typeof fnLoginCheck === 'function') fnLoginCheck();
    });

    await page.waitForTimeout(4000);
    console.log('Login successful');

    // Navigate to exhibit list
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
    console.log(`Total cars: ${totalCars}`);

    const allCars = [];
    let currentPage = 1;
    const carsPerPage = 10;
    const maxPages = Math.min(Math.ceil(totalCars / carsPerPage), 100); // Limit to 100 pages (1000 cars)

    while (currentPage <= maxPages) {
      console.log(`Scraping page ${currentPage}/${maxPages}...`);

      // Extract cars from table rows
      const carsOnPage = await page.evaluate(() => {
        const cars = [];
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const carItems = Array.from(document.querySelectorAll('.car-item'));

        rows.forEach((row, idx) => {
          try {
            const carItem = carItems[idx];
            let imgSrc = '';
            let carId = '';

            if (carItem) {
              const img = carItem.querySelector('img');
              if (img) imgSrc = img.src;

              const link = carItem.querySelector('a[onclick*="carInfo"]');
              if (link) {
                const match = link.getAttribute('onclick')?.match(/carInfo\(['"]([^'"]+)['"]\)/);
                if (match) carId = match[1];
              }
            }

            const fullText = row.innerText || '';

            const nameMatch = fullText.match(/(현대|기아|제네시스|벤츠|BMW|쌍용|쉐보레|르노삼성|아우디|폭스바겐|포드|볼보|혼다|테슬라|렉서스|닛산|도요타|랜드로버|재규어|지프|미니|인피니티|포르쉐|캐딜락|마세라티)[^\n]+/);
            const name = nameMatch ? nameMatch[0].trim() : '';

            const yearMatch = fullText.match(/(\d{4})\s/);
            const mileageMatch = fullText.match(/([\d,]+)km/);
            const transmissionMatch = fullText.match(/오토|수동|자동/);
            const fuelMatch = fullText.match(/휘발유|경유|전기|하이브리드|가솔린|디젤|LPG/);
            const colorMatch = fullText.match(/흰색|검정|은색|회색|파랑|빨강|기타|블랙|화이트|실버|그레이/);

            const exhibitMatch = fullText.match(/출품번호\s*:\s*(\d+)/);
            const priceMatch = fullText.match(/시작가\s*:\s*([\d,]+)/);

            if (name) {
              cars.push({
                name,
                year: yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear(),
                mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : 0,
                transmission: transmissionMatch ? transmissionMatch[0] : '오토',
                fuel: fuelMatch ? fuelMatch[0] : '휘발유',
                color: colorMatch ? colorMatch[0] : '기타',
                exhibitNo: exhibitMatch ? exhibitMatch[1] : '',
                price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) * 10000 : 0,
                imgSrc,
                carId,
                fullText: fullText.substring(0, 500),
              });
            }
          } catch (e) {
            console.error('Error parsing row:', e);
          }
        });

        return cars;
      });

      console.log(`  Found ${carsOnPage.length} cars`);
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
      // Skip 양산
      if (car.fullText?.includes('양산') || car.name?.includes('양산')) continue;

      // Skip duplicates
      const key = car.exhibitNo || car.carId || car.name;
      if (seenIds.has(key)) continue;
      seenIds.add(key);

      const brand = extractBrand(car.name);
      if (brand === 'Unknown') continue;

      const model = translateModel(car.name);
      const fuel = translateFuel(car.fuel);
      const color = translateColor(car.color);
      const transmission = car.transmission?.includes('오토') || car.transmission?.includes('자동') ? 'Automatic' : 'Manual';

      // Determine body type
      let bodyType = 'Sedan';
      if (/SUV|투싼|싼타페|쏘렌토|스포티지|팰리세이드|코나|베뉴|셀토스|티볼리|코란도|렉스턴|티구안|QM6|XM3|픽업/.test(car.name)) {
        bodyType = 'SUV';
      } else if (/카니발|스타리아|스타렉스|승합/.test(car.name)) {
        bodyType = 'Van';
      } else if (/화물|트럭|포터|봉고|밴/.test(car.name)) {
        bodyType = 'Truck';
      }

      const images = [];
      if (car.imgSrc && car.imgSrc.startsWith('http') && !car.imgSrc.includes('no_img')) {
        images.push(car.imgSrc);
      }

      processedCars.push({
        externalId: `hubauction-${car.exhibitNo || car.carId || Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        brand,
        model,
        year: car.year,
        mileage: car.mileage,
        startPrice: car.price,
        fuel,
        transmission,
        bodyType,
        color,
        images,
        detailUrl: car.carId ? `${BASE_URL}/newfront/onlineAuc/on/onlineAuc_on_detail.do?i_sCarId=${car.carId}` : '',
        status: 'active',
        carId: car.carId,
        options: [],
        inspectionData: null,
        engineCC: null,
        grade: '',
        damageInfo: '',
      });
    }

    console.log(`Processed ${processedCars.length} unique cars`);

    // Fetch detailed info for each car (sequential processing via click navigation)
    console.log('\nFetching detailed information for each car (via click navigation)...');

    // Go back to list page first
    await page.goto(`${BASE_URL}/newfront/onlineAuc/on/onlineAuc_on_list.do`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => {
      if (typeof checkAuthority === 'function') checkAuthority('AC1');
    });
    await page.waitForTimeout(5000);

    let detailsFetched = 0;
    const maxDetails = processedCars.length; // Fetch details for ALL cars

    for (let i = 0; i < maxDetails; i++) {
      const car = processedCars[i];
      if (car.carId) {
        const listImageUrl = car.images?.[0] || '';
        const details = await fetchCarDetails(page, car.carId, listImageUrl, context);

        if (details) {
          // Use images from details
          if (details.images.length > 0) {
            car.images = details.images.slice(0, 25); // Max 25 images
          }

          // Add options (translate to English)
          if (details.options.length > 0) {
            car.options = details.options.map(opt => translateOption(opt)).filter(opt => opt);
          }

          // Add other details
          if (details.engineCC) car.engineCC = details.engineCC;
          if (details.grade) car.grade = details.grade;
          if (details.inspectionData) car.inspectionData = details.inspectionData;
          if (details.description) car.damageInfo = details.description;

          detailsFetched++;
        }

        // Log progress
        if ((i + 1) % 10 === 0) {
          console.log(`  Processed ${i + 1}/${maxDetails} cars... (${car.images?.length || 0} images, ${car.options?.length || 0} options)`);
        }

        // Every 20 cars, ensure we're still on the list page
        if ((i + 1) % 20 === 0 && i + 1 < maxDetails) {
          const currentUrl = page.url();
          if (!currentUrl.includes('list')) {
            await page.goto(`${BASE_URL}/newfront/onlineAuc/on/onlineAuc_on_list.do`, { waitUntil: 'networkidle', timeout: 30000 });
            await page.evaluate(() => {
              if (typeof checkAuthority === 'function') checkAuthority('AC1');
            });
            await page.waitForTimeout(3000);
          }
        }
      }
    }

    console.log(`  Successfully fetched details for ${detailsFetched}/${maxDetails} cars`);

    // For remaining cars without detailed fetch, keep the list image
    for (let i = maxDetails; i < processedCars.length; i++) {
      // These cars already have their list image, just ensure options array exists
      processedCars[i].options = processedCars[i].options || [];
    }

    if (processedCars.length > 0) {
      console.log('\nSample cars with details:');
      processedCars.slice(0, 3).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.brand} ${c.model} (${c.year})`);
        console.log(`     - Images: ${c.images.length}`);
        console.log(`     - Options: ${c.options.length}`);
        console.log(`     - Price: ${(c.startPrice/10000).toLocaleString()}만원`);
      });

      // Save to database
      console.log('\nSaving to database...');
      const deleted = await prisma.auctionCar.deleteMany({});
      console.log(`Cleared ${deleted.count} old entries`);

      let saved = 0;
      for (const car of processedCars) {
        try {
          await prisma.auctionCar.create({
            data: {
              externalId: car.externalId,
              brand: car.brand,
              model: car.model,
              year: car.year,
              mileage: car.mileage,
              startPrice: car.startPrice,
              fuel: car.fuel,
              transmission: car.transmission,
              bodyType: car.bodyType,
              color: car.color,
              images: JSON.stringify(car.images),
              detailUrl: car.detailUrl,
              status: car.status,
              engineCC: car.engineCC,
              grade: car.grade,
              options: JSON.stringify(car.options),
              inspectionData: car.inspectionData ? JSON.stringify(car.inspectionData) : null,
              damageInfo: car.damageInfo || null,
            },
          });
          saved++;
          if (saved % 100 === 0) console.log(`  Saved ${saved}/${processedCars.length}...`);
        } catch (err) {
          console.error('Error:', err.message);
        }
      }

      console.log(`\n✓ Successfully saved ${saved} cars to database`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/tmp/hubauction-error.png' });
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

main();
