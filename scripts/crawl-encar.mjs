import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Korean to English mappings
const brandMap = {
  '현대': 'Hyundai', '기아': 'Kia', '제네시스': 'Genesis', '쉐보레': 'Chevrolet',
  '르노삼성': 'Renault Samsung', '쌍용': 'Ssangyong', 'GM대우': 'Chevrolet',
  'BMW': 'BMW', '벤츠': 'Mercedes-Benz', '아우디': 'Audi', '폭스바겐': 'Volkswagen',
  '도요타': 'Toyota', '혼다': 'Honda', '렉서스': 'Lexus', '닛산': 'Nissan',
  '볼보': 'Volvo', '포르쉐': 'Porsche', '랜드로버': 'Land Rover', '재규어': 'Jaguar',
  '포드': 'Ford', '지프': 'Jeep', '테슬라': 'Tesla', '미니': 'Mini',
};

const modelMap = {
  '그랜저': 'Grandeur', '쏘나타': 'Sonata', '아반떼': 'Avante', '투싼': 'Tucson',
  '싼타페': 'Santa Fe', '팰리세이드': 'Palisade', '코나': 'Kona', '아이오닉': 'Ioniq',
  '스타렉스': 'Starex', '스타리아': 'Staria', '캐스퍼': 'Casper', '베뉴': 'Venue',
  'K9': 'K9', 'K8': 'K8', 'K7': 'K7', 'K5': 'K5', 'K3': 'K3',
  '스포티지': 'Sportage', '쏘렌토': 'Sorento', '카니발': 'Carnival', '셀토스': 'Seltos',
  '니로': 'Niro', '스팅어': 'Stinger', '레이': 'Ray', '모닝': 'Morning',
  'G90': 'G90', 'G80': 'G80', 'G70': 'G70', 'GV80': 'GV80', 'GV70': 'GV70',
  '말리부': 'Malibu', '트레일블레이저': 'Trailblazer', '스파크': 'Spark',
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

function translateModel(text) {
  if (!text) return 'Unknown Model';
  let cleaned = text
    .replace(/더\s*뉴\s*/g, '').replace(/뉴\s*/g, '').replace(/올\s*뉴\s*/g, '')
    .trim();

  for (const [kr, en] of Object.entries(modelMap)) {
    if (cleaned.includes(kr)) cleaned = cleaned.replace(kr, en);
  }

  cleaned = cleaned
    .replace(/터보/g, 'Turbo').replace(/프리미엄/g, 'Premium').replace(/럭셔리/g, 'Luxury')
    .replace(/[가-힣]+/g, '').replace(/\s+/g, ' ').trim();

  return cleaned || 'Unknown Model';
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
        '.thumb-photo img', '.detail-photo img', '.photo-view img',
        '[class*="gallery"] img', '[class*="slide"] img', '.swiper-slide img',
        '.photo_list img', '.car_photo img', 'img[src*="ci.encar.com"]',
      ];

      imageSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(img => {
          let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          if (src && src.includes('encar') && !src.includes('logo') && !src.includes('icon')) {
            // Get high-res version
            src = src.replace(/\/thumb\//, '/').replace(/_s\./, '_o.').replace(/_m\./, '_o.');
            if (!result.images.includes(src)) {
              result.images.push(src);
            }
          }
        });
      });

      // Get options from multiple possible locations
      const optionElements = document.querySelectorAll('.option-item, .opt_list li, [class*="option"] span, .car_option li, .sminfo li');
      optionElements.forEach(el => {
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
      const descEl = document.querySelector('.detail_explain, .car_memo, .seller_comment');
      if (descEl) result.description = descEl.innerText?.trim() || '';

      // Get inspection data
      const bodyText = document.body.innerText;
      const inspection = {};

      if (bodyText.includes('무사고')) inspection.accidentHistory = 'None';
      else if (bodyText.includes('사고있음') || bodyText.includes('사고이력')) inspection.accidentHistory = 'Yes';

      if (bodyText.includes('침수없음')) inspection.floodDamage = 'None';
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
  console.log('Starting encar.com crawler with detailed info...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    console.log('Going to encar.com...');
    await page.goto('https://www.encar.com/dc/dc_carsearchlist.do?carType=kor&searchType=model&TG.R=D#!%7B%22action%22%3A%22(And.Hidden.N._.CarType.Y.)%22%2C%22toggle%22%3A%7B%7D%2C%22layer%22%3A%22%22%2C%22sort%22%3A%22ModifiedDate%22%2C%22page%22%3A1%2C%22limit%22%3A50%7D', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(3000);
    console.log('Page loaded:', await page.title());

    await page.waitForSelector('.car_list, .carList, #sr_normal, .item, tr.tr', { timeout: 10000 }).catch(() => {});

    // Scroll to load more cars
    console.log('Scrolling to load more cars...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    console.log('Extracting car data...');
    const cars = await page.evaluate(() => {
      const results = [];
      const carItems = document.querySelectorAll('.area_list .item, .ListCar_item__uuMb0, [class*="item"]');

      carItems.forEach((item, index) => {
        if (index >= 100) return; // Limit to 100 cars

        const text = item.innerText || '';
        if (text.length < 30) return;
        if (!text.includes('만원') && !text.includes('km')) return;

        const img = item.querySelector('img');
        let imgSrc = img?.src || img?.getAttribute('data-src') || '';
        if (imgSrc && !imgSrc.startsWith('http')) {
          imgSrc = 'https:' + imgSrc;
        }

        const link = item.querySelector('a[href*="cardetail"], a[href*="carid"]');
        const href = link?.href || '';

        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        let brand = 'Unknown';
        let model = '';
        const brandMap = {
          '현대': 'Hyundai', '기아': 'Kia', '제네시스': 'Genesis',
          '쉐보레': 'Chevrolet', '르노삼성': 'Renault Samsung', '쌍용': 'Ssangyong',
          'GM대우': 'Chevrolet', 'BMW': 'BMW', '벤츠': 'Mercedes-Benz',
          '아우디': 'Audi', '폭스바겐': 'Volkswagen', '도요타': 'Toyota',
          '혼다': 'Honda', '렉서스': 'Lexus'
        };

        for (const line of lines) {
          for (const [kr, en] of Object.entries(brandMap)) {
            if (line.includes(kr)) {
              brand = en;
              const brandIndex = line.indexOf(kr);
              model = line.substring(brandIndex + kr.length).trim();
              model = model.replace(/^\(.*?\)/, '').trim();
              if (model.length > 40) model = model.substring(0, 40);
              break;
            }
          }
          if (brand !== 'Unknown') break;
        }

        let year = new Date().getFullYear();
        const yearPatterns = [/(\d{2})\/\d{2}식/, /\((\d{2})년형\)/, /(20[0-2][0-9])년/];
        for (const pattern of yearPatterns) {
          const match = text.match(pattern);
          if (match) {
            let y = parseInt(match[1]);
            if (y < 100) y += 2000;
            if (y >= 2010 && y <= 2030) { year = y; break; }
          }
        }

        const mileageMatch = text.match(/([0-9,]+)\s*km/i);
        const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : 0;

        const priceMatch = text.match(/([0-9,]+)\s*만원/);
        let price = 0;
        if (priceMatch) {
          price = parseInt(priceMatch[1].replace(/,/g, '')) * 10000;
        }

        let fuel = 'Gasoline';
        if (text.includes('디젤')) fuel = 'Diesel';
        else if (text.includes('전기')) fuel = 'Electric';
        else if (text.includes('하이브리드')) fuel = 'Hybrid';
        else if (text.includes('LPG')) fuel = 'LPG';

        const transmission = text.includes('수동') ? 'Manual' : 'Automatic';

        let bodyType = 'Sedan';
        if (text.includes('SUV') || text.includes('RV') || /쏘렌토|싼타페|투싼|스포티지|팰리세이드/.test(model)) {
          bodyType = 'SUV';
        } else if (/카니발|스타리아|스타렉스/.test(model)) {
          bodyType = 'Van';
        }

        if ((brand !== 'Unknown' || price > 0) && model) {
          results.push({
            externalId: `encar-${Date.now()}-${index}`,
            brand,
            model,
            year,
            mileage,
            price,
            fuel,
            transmission,
            bodyType,
            color: 'Unknown',
            images: imgSrc ? [imgSrc] : [],
            detailUrl: href,
          });
        }
      });

      return results;
    });

    console.log(`Found ${cars.length} cars from list`);

    // Fetch detailed info for each car
    if (cars.length > 0) {
      console.log('\nFetching detailed information for each car...');
      const batchSize = 5;

      for (let i = 0; i < cars.length; i += batchSize) {
        const batch = cars.slice(i, i + batchSize);
        const detailPromises = batch.map(async (car) => {
          if (car.detailUrl) {
            // Pass the list image URL to ensure it's preserved
            const listImageUrl = car.images?.[0] || '';
            const details = await fetchCarDetails(context, car.detailUrl, listImageUrl);
            if (details) {
              // Use images from details (which includes the list image)
              if (details.images.length > 0) {
                car.images = details.images.slice(0, 20);
              }

              // Add options
              if (details.options.length > 0) {
                car.options = details.options.map(opt => translateOption(opt)).filter(opt => opt);
              } else {
                car.options = [];
              }

              // Add other details
              if (details.color !== 'Unknown') car.color = details.color;
              if (details.engineCC) car.engineCC = details.engineCC;
              if (details.description) car.description = details.description;
              if (details.inspectionData) car.inspectionData = details.inspectionData;
            } else {
              car.options = [];
            }
          } else {
            car.options = [];
          }
        });

        await Promise.all(detailPromises);
        console.log(`  Processed ${Math.min(i + batchSize, cars.length)}/${cars.length} cars...`);
      }

      // Translate models
      cars.forEach(car => {
        car.model = translateModel(car.model);
      });

      console.log('\nSample cars with details:');
      cars.slice(0, 3).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.brand} ${c.model} (${c.year})`);
        console.log(`     - Images: ${c.images.length}`);
        console.log(`     - Options: ${c.options?.length || 0}`);
        console.log(`     - Price: ${(c.price/10000).toLocaleString()}만원`);
      });

      console.log('\nSaving to database...');

      // Clear old encar data
      await prisma.auctionCar.deleteMany({
        where: { externalId: { startsWith: 'encar-' } }
      });

      let savedCount = 0;
      for (const car of cars) {
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
              detailUrl: car.detailUrl || '',
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
      console.log('No cars found to save');
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/tmp/encar-error.png' });
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

main();
