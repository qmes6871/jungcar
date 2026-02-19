import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USERNAME = '13238';
const PASSWORD = 'sk&nk0604';
const BASE_URL = 'https://autobell.co.kr';

// Korean to English mappings
const brandMap = {
  '현대': 'Hyundai', '기아': 'Kia', '제네시스': 'Genesis', '쉐보레': 'Chevrolet',
  '르노삼성': 'Renault Samsung', '르노코리아': 'Renault Korea', '쌍용': 'Ssangyong',
  'KG모빌리티': 'KG Mobility', 'GM대우': 'GM Daewoo', 'BMW': 'BMW',
  '벤츠': 'Mercedes-Benz', '메르세데스': 'Mercedes-Benz', '아우디': 'Audi',
  '폭스바겐': 'Volkswagen', '도요타': 'Toyota', '혼다': 'Honda', '렉서스': 'Lexus',
  '닛산': 'Nissan', '볼보': 'Volvo', '포르쉐': 'Porsche', '랜드로버': 'Land Rover',
  '재규어': 'Jaguar', '포드': 'Ford', '지프': 'Jeep', '테슬라': 'Tesla',
  '미니': 'Mini', '인피니티': 'Infiniti', '링컨': 'Lincoln', '캐딜락': 'Cadillac',
  '마세라티': 'Maserati', '람보르기니': 'Lamborghini', '페라리': 'Ferrari',
  '벤틀리': 'Bentley', '롤스로이스': 'Rolls-Royce',
};

const fuelMap = {
  '가솔린': 'Gasoline', '휘발유': 'Gasoline', '디젤': 'Diesel', '경유': 'Diesel',
  '전기': 'Electric', '하이브리드': 'Hybrid', 'LPG': 'LPG',
  '가솔린+전기': 'Hybrid', '디젤+전기': 'Hybrid', 'CNG': 'CNG',
};

const transmissionMap = {
  '자동': 'Automatic', '오토': 'Automatic', 'A/T': 'Automatic', 'AT': 'Automatic',
  '수동': 'Manual', 'M/T': 'Manual', 'MT': 'Manual', 'CVT': 'CVT',
};

const modelMap = {
  '그랜저': 'Grandeur', '쏘나타': 'Sonata', '아반떼': 'Avante', '투싼': 'Tucson',
  '싼타페': 'Santa Fe', '팰리세이드': 'Palisade', '코나': 'Kona', '아이오닉': 'Ioniq',
  '스타렉스': 'Starex', '스타리아': 'Staria', '포터': 'Porter', '캐스퍼': 'Casper',
  'K9': 'K9', 'K8': 'K8', 'K7': 'K7', 'K5': 'K5', 'K3': 'K3',
  '스포티지': 'Sportage', '쏘렌토': 'Sorento', '모하비': 'Mohave', '카니발': 'Carnival',
  '셀토스': 'Seltos', '니로': 'Niro', '스팅어': 'Stinger', '레이': 'Ray', '모닝': 'Morning',
  '봉고': 'Bongo', 'EV6': 'EV6', 'EV9': 'EV9',
  'G90': 'G90', 'G80': 'G80', 'G70': 'G70', 'GV80': 'GV80', 'GV70': 'GV70', 'GV60': 'GV60',
  '말리부': 'Malibu', '트레일블레이저': 'Trailblazer', '트랙스': 'Trax', '스파크': 'Spark',
  'S클래스': 'S-Class', 'E클래스': 'E-Class', 'C클래스': 'C-Class', 'A클래스': 'A-Class',
  'GLE': 'GLE', 'GLC': 'GLC', 'GLA': 'GLA', 'GLB': 'GLB',
  '3시리즈': '3-Series', '5시리즈': '5-Series', '7시리즈': '7-Series',
  'X1': 'X1', 'X3': 'X3', 'X5': 'X5', 'X6': 'X6', 'X7': 'X7',
};

const optionMap = {
  '선루프': 'Sunroof', '파노라마선루프': 'Panoramic Sunroof', '썬루프': 'Sunroof',
  '가죽시트': 'Leather Seats', '통풍시트': 'Ventilated Seats', '열선시트': 'Heated Seats',
  '열선핸들': 'Heated Steering Wheel', '후방카메라': 'Rear Camera', '어라운드뷰': 'Around View Monitor',
  '네비게이션': 'Navigation', '블루투스': 'Bluetooth', '스마트키': 'Smart Key',
  'LED헤드라이트': 'LED Headlights', 'HUD': 'Head-Up Display', '크루즈컨트롤': 'Cruise Control',
  '차선이탈경보': 'Lane Departure Warning', '전방충돌경보': 'Forward Collision Warning',
  '후측방경보': 'Blind Spot Monitor', '주차보조': 'Parking Assist',
  '전동트렁크': 'Power Trunk', 'JBL': 'JBL Premium Audio', 'BOSE': 'Bose Premium Audio',
  '애플카플레이': 'Apple CarPlay', '안드로이드오토': 'Android Auto',
  '무선충전': 'Wireless Charging', '블랙박스': 'Dash Camera',
};

function extractBrand(text) {
  for (const [kr, en] of Object.entries(brandMap)) {
    if (text && text.includes(kr)) return en;
  }
  for (const en of Object.values(brandMap)) {
    if (text && text.includes(en)) return en;
  }
  return 'Unknown';
}

function translateModel(text) {
  if (!text) return 'Unknown Model';

  let cleanedText = text
    .replace(/더\s*뉴\s*/g, '').replace(/뉴\s*/g, '').replace(/올\s*뉴\s*/g, '')
    .replace(/디\s*올\s*뉴\s*/g, '').replace(/하이브리드\s*/g, 'Hybrid ')
    .trim();

  for (const [kr, en] of Object.entries(modelMap)) {
    if (cleanedText.includes(kr)) cleanedText = cleanedText.replace(kr, en);
  }

  cleanedText = cleanedText
    .replace(/클래스/g, '-Class').replace(/시리즈/g, '-Series')
    .replace(/터보/g, 'Turbo').replace(/프리미엄/g, 'Premium')
    .replace(/럭셔리/g, 'Luxury').replace(/익스클루시브/g, 'Exclusive')
    .replace(/[가-힣]+/g, '').replace(/\s+/g, ' ').trim();

  return cleanedText || 'Unknown Model';
}

function translateOption(text) {
  if (!text) return text;
  for (const [kr, en] of Object.entries(optionMap)) {
    if (text.includes(kr)) return en;
  }
  return text.replace(/[가-힣]+/g, '').trim() || text;
}

async function fetchCarDetails(context, detailUrl, listImageUrl) {
  if (!detailUrl) return null;

  const detailPage = await context.newPage();
  try {
    await detailPage.goto(detailUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await detailPage.waitForTimeout(1500);

    const details = await detailPage.evaluate((listImg) => {
      const result = {
        images: [],
        options: [],
        description: '',
        color: 'Unknown',
        engineCC: null,
        inspectionData: null,
      };

      // Start with the list image (we know this works)
      if (listImg && listImg.startsWith('http')) {
        result.images.push(listImg);
      }

      // Get all car images from detail page
      const imageSelectors = [
        '.photo-list img', '.detail-photo img', '.car-photo img',
        '[class*="gallery"] img', '[class*="slide"] img', '.swiper-slide img',
        '.thumb-list img', 'img[src*="autobell"]',
      ];

      imageSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(img => {
          let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy');
          if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon') && !src.includes('blank')) {
            src = src.replace(/\/thumb\//, '/').replace(/_s\./, '_l.').replace(/_m\./, '_l.');
            if (!result.images.includes(src)) {
              result.images.push(src);
            }
          }
        });
      });

      // Get options from multiple possible locations
      document.querySelectorAll('.option-item, .opt-list li, [class*="option"] span, .car-option li').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 1 && text.length < 50 && !result.options.includes(text)) {
          result.options.push(text);
        }
      });

      // Also try table-based options
      document.querySelectorAll('th, td').forEach(cell => {
        const text = cell.innerText?.trim();
        if (text?.includes('옵션') || text?.includes('편의장치')) {
          const nextSibling = cell.nextElementSibling;
          if (nextSibling) {
            const optText = nextSibling.innerText?.trim();
            if (optText && optText.length > 2 && optText.length < 300) {
              optText.split(/[,\/\n]/).forEach(opt => {
                const trimmed = opt.trim();
                if (trimmed.length > 1 && trimmed.length < 50 && !result.options.includes(trimmed)) {
                  result.options.push(trimmed);
                }
              });
            }
          }
        }
      });

      // Get color
      const colorMatch = document.body.innerText.match(/색상\s*[:：]?\s*([\uAC00-\uD7A3]+)/);
      if (colorMatch) result.color = colorMatch[1];

      // Get engine displacement
      const ccMatch = document.body.innerText.match(/(\d{1,2}[,.]?\d{3})\s*cc/i);
      if (ccMatch) result.engineCC = parseInt(ccMatch[1].replace(/[,.]/g, ''));

      // Get description
      const descEl = document.querySelector('.car-desc, .description, .memo');
      if (descEl) result.description = descEl.innerText?.trim() || '';

      // Get inspection data
      const bodyText = document.body.innerText;
      const inspection = {};

      if (bodyText.includes('무사고')) inspection.accidentHistory = 'None';
      else if (bodyText.includes('사고있음') || bodyText.includes('사고이력')) inspection.accidentHistory = 'Yes';

      if (bodyText.includes('침수없음') || bodyText.includes('침수무')) inspection.floodDamage = 'None';
      else if (bodyText.includes('침수')) inspection.floodDamage = 'Yes';

      if (Object.keys(inspection).length > 0) {
        result.inspectionData = inspection;
      }

      return result;
    }, listImageUrl);

    return details;
  } catch (error) {
    console.log(`  Error fetching details: ${error.message}`);
    // Return at least the list image
    return {
      images: listImageUrl ? [listImageUrl] : [],
      options: [],
      description: '',
      color: 'Unknown',
      engineCC: null,
      inspectionData: null,
    };
  } finally {
    await detailPage.close();
  }
}

async function main() {
  console.log('Starting autobell.co.kr Smart Auction crawler with detailed info...');
  console.log('Username:', USERNAME);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    console.log('Going to autobell.co.kr...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Main page loaded:', await page.title());

    // Click login button
    console.log('Looking for login button...');
    const loginBtn = await page.$('a:has-text("로그인")');
    if (loginBtn) {
      await loginBtn.click();
      await page.waitForTimeout(2000);
    }

    // Fill login form
    console.log('Filling login form...');
    const userField = await page.$('#user-id_common');
    const passField = await page.$('#user-pw');

    if (userField && passField) {
      await userField.fill(USERNAME);
      await passField.fill(PASSWORD);

      const submitBtn = await page.$('button:has-text("로그인"), .btn-login, [type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }

      await page.waitForTimeout(3000);
      console.log('After login URL:', page.url());
    }

    // Navigate to Smart Auction page
    console.log('Going to Smart Auction...');
    await page.goto('https://autobell.co.kr/autoAuction/auctionGate', { waitUntil: 'networkidle', timeout: 30000 });

    // Try various auction URLs
    const auctionUrls = [
      'https://autobell.co.kr/autoAuction/auctionList',
      'https://autobell.co.kr/autoAuction/list',
      'https://autobell.co.kr/autoAuction/carList',
      'https://autobell.co.kr/autoAuction/exhibitList',
    ];

    for (const url of auctionUrls) {
      try {
        console.log('Trying URL:', url);
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        if (response && response.status() === 200) {
          const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
          if (bodyText.includes('만원') || bodyText.includes('km') || bodyText.includes('차량')) {
            console.log('Found car listings page');
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Scroll to load all cars
    console.log('Scrolling to load more cars...');
    let previousHeight = 0;
    for (let scrollAttempt = 0; scrollAttempt < 10; scrollAttempt++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const currentHeight = await page.evaluate(() => document.body.scrollHeight);
      if (currentHeight === previousHeight) break;
      previousHeight = currentHeight;
    }

    // Click "더보기" button
    for (let i = 0; i < 5; i++) {
      const loadMoreBtn = await page.$('button:has-text("더보기"), a:has-text("더보기"), .more-btn');
      if (loadMoreBtn) {
        await loadMoreBtn.click();
        await page.waitForTimeout(2000);
      } else {
        break;
      }
    }

    console.log('Extracting car data...');
    const cars = await page.evaluate(() => {
      const results = [];
      const carCards = document.querySelectorAll('[class*="CarCard"], [class*="carCard"], .card-item, .product-card, article, [class*="item"], [class*="list"]');

      let elements = Array.from(carCards);
      if (elements.length < 3) {
        const allDivs = document.querySelectorAll('div');
        elements = Array.from(allDivs).filter(div => {
          const text = div.innerText || '';
          const hasPrice = text.includes('만원');
          const hasKm = text.includes('km');
          const hasBrand = text.includes('현대') || text.includes('기아') || text.includes('제네시스') ||
                          text.includes('BMW') || text.includes('벤츠') || text.includes('쌍용');
          const isReasonableLength = text.length > 50 && text.length < 1000;
          return hasPrice && hasKm && hasBrand && isReasonableLength;
        });
      }

      elements.forEach((el, index) => {
        if (index >= 300) return;

        const text = el.innerText || '';
        const img = el.querySelector('img');
        let imgSrc = img?.src || img?.getAttribute('data-src') || '';
        const link = el.querySelector('a[href*="detail"], a[href*="car"]') || el.closest('a');
        const href = link?.href || '';

        results.push({
          rawText: text.substring(0, 600),
          image: imgSrc,
          link: href,
        });
      });

      return results;
    });

    console.log(`Found ${cars.length} potential car items`);

    // Process cars
    const processedCars = [];

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const text = car.rawText;

      if (!text.includes('만원') && !text.includes('km') && !text.includes('KM')) continue;

      const brand = extractBrand(text);
      if (brand === 'Unknown') continue;

      let model = '';
      for (const [kr] of Object.entries(brandMap)) {
        if (text.includes(kr)) {
          const idx = text.indexOf(kr);
          const afterBrand = text.substring(idx + kr.length, idx + kr.length + 50);
          const modelMatch = afterBrand.match(/[\s]*([가-힣a-zA-Z0-9\s]+)/);
          if (modelMatch) {
            model = modelMatch[1].trim().split('\n')[0].substring(0, 30);
          }
          break;
        }
      }

      let year = new Date().getFullYear();
      let mileage = 0;

      const combinedMatch = text.match(/(20[1-2][0-9])(\d{1,3}(?:,\d{3})*)\s*km/i);
      if (combinedMatch) {
        year = parseInt(combinedMatch[1]);
        mileage = parseInt(combinedMatch[2].replace(/,/g, ''));
      } else {
        const yearPatterns = [/(\d{2})\/\d{2}식/, /(\d{2})년식/, /\((\d{2})년\)/, /\b(20[0-2][0-9])년/];
        for (const pattern of yearPatterns) {
          const match = text.match(pattern);
          if (match) {
            let y = parseInt(match[1]);
            if (y < 100) y += 2000;
            if (y >= 2010 && y <= 2030) { year = y; break; }
          }
        }

        const mileageMatch = text.match(/\b(\d{1,3}(?:,\d{3})+)\s*(?:km|KM)\b/i) ||
                             text.match(/\b(\d{4,6})\s*(?:km|KM)\b/i);
        if (mileageMatch) {
          mileage = parseInt(mileageMatch[1].replace(/,/g, ''));
        }
      }

      if (mileage > 500000) mileage = 0;

      const priceMatch = text.match(/([0-9,]+)\s*만원/);
      let price = 0;
      if (priceMatch) {
        price = parseInt(priceMatch[1].replace(/,/g, '')) * 10000;
      }

      let fuel = 'Gasoline';
      for (const [kr, en] of Object.entries(fuelMap)) {
        if (text.includes(kr)) { fuel = en; break; }
      }

      let transmission = 'Automatic';
      for (const [kr, en] of Object.entries(transmissionMap)) {
        if (text.includes(kr)) { transmission = en; break; }
      }

      let bodyType = 'Sedan';
      const modelLower = model.toLowerCase();
      if (text.includes('SUV') || text.includes('RV') ||
          modelLower.includes('투싼') || modelLower.includes('싼타페') ||
          modelLower.includes('쏘렌토') || modelLower.includes('스포티지')) {
        bodyType = 'SUV';
      } else if (modelLower.includes('카니발') || modelLower.includes('스타리아')) {
        bodyType = 'Van';
      }

      let image = car.image;
      if (image && !image.startsWith('http')) {
        image = image.startsWith('//') ? 'https:' + image : BASE_URL + image;
      }

      if (brand !== 'Unknown' && (price > 0 || mileage > 0)) {
        processedCars.push({
          externalId: `autobell-auction-${Date.now()}-${i}`,
          brand,
          model: translateModel(model),
          year,
          mileage,
          price,
          fuel,
          transmission,
          bodyType,
          color: 'Unknown',
          images: image ? [image] : [],
          detailUrl: car.link || '',
          options: [],
        });
      }
    }

    // Deduplicate
    const seenCars = new Set();
    const uniqueCars = processedCars.filter(car => {
      const key = `${car.brand}-${car.model}-${car.year}-${car.mileage}-${car.price}`;
      if (seenCars.has(key)) return false;
      seenCars.add(key);
      return true;
    });

    console.log(`\nProcessed ${uniqueCars.length} unique cars`);

    // Fetch detailed info for each car
    if (uniqueCars.length > 0) {
      console.log('\nFetching detailed information for each car...');
      const batchSize = 5;

      for (let i = 0; i < uniqueCars.length; i += batchSize) {
        const batch = uniqueCars.slice(i, i + batchSize);
        const detailPromises = batch.map(async (car) => {
          if (car.detailUrl) {
            const details = await fetchCarDetails(context, car.detailUrl);
            if (details) {
              // Merge images
              if (details.images.length > 0) {
                const existingImages = car.images;
                const newImages = details.images.filter(img => !existingImages.includes(img));
                car.images = [...existingImages, ...newImages].slice(0, 20);
              }

              // Add options
              if (details.options.length > 0) {
                car.options = details.options.map(opt => translateOption(opt)).filter(opt => opt);
              }

              // Add other details
              if (details.color !== 'Unknown') car.color = details.color;
              if (details.engineCC) car.engineCC = details.engineCC;
              if (details.inspectionData) car.inspectionData = details.inspectionData;
            }
          }
        });

        await Promise.all(detailPromises);
        console.log(`  Processed ${Math.min(i + batchSize, uniqueCars.length)}/${uniqueCars.length} cars...`);
      }

      console.log('\nSample cars with details:');
      uniqueCars.slice(0, 3).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.brand} ${c.model} (${c.year})`);
        console.log(`     - Images: ${c.images.length}`);
        console.log(`     - Options: ${c.options.length}`);
      });

      console.log('\nSaving to database...');

      const deleted = await prisma.auctionCar.deleteMany({
        where: { externalId: { startsWith: 'autobell-auction-' } }
      });
      console.log(`Cleared ${deleted.count} old autobell auction entries`);

      let savedCount = 0;
      for (const car of uniqueCars) {
        try {
          await prisma.auctionCar.create({
            data: {
              externalId: car.externalId,
              brand: car.brand,
              model: car.model,
              year: car.year,
              mileage: car.mileage,
              startPrice: car.price,
              fuel: car.fuel,
              transmission: car.transmission,
              bodyType: car.bodyType,
              color: car.color,
              images: JSON.stringify(car.images),
              detailUrl: car.detailUrl,
              status: 'active',
              engineCC: car.engineCC || null,
              options: JSON.stringify(car.options || []),
              inspectionData: car.inspectionData ? JSON.stringify(car.inspectionData) : null,
            },
          });
          savedCount++;
          console.log(`Saved: ${car.brand} ${car.model} (${car.year}) - ${car.images.length} images`);
        } catch (err) {
          console.error('Error saving:', err.message);
        }
      }

      console.log(`\n✓ Saved ${savedCount} cars to database`);
    } else {
      console.log('\nNo valid cars found to save');
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/tmp/autobell-auction-error.png' });
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

main();
