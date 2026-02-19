import { chromium } from 'playwright';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';
const BASE_URL = 'https://www.sellcarauction.co.kr';

const optionMap = {
  '선루프': 'Sunroof', '파노라마선루프': 'Panoramic Sunroof', '네비': 'Navigation',
  '뒷좌석모니터': 'Rear Monitor', 'HID': 'HID Headlights', 'LED': 'LED Lights',
  '스마트키': 'Smart Key', '어라운드뷰': 'Around View', '파워트렁크': 'Power Trunk',
  '파워슬라이딩도어': 'Power Sliding Door', 'HUD': 'Head-Up Display',
  '후측방경보': 'Blind Spot Monitor', 'LDWS': 'Lane Departure Warning',
  '내장하이패스': 'Built-in Hi-Pass', '스마트크루즈': 'Smart Cruise',
  '열선시트': 'Heated Seats', '메모리시트': 'Memory Seat', '통풍시트': 'Ventilated Seats',
};

function translateOption(text) {
  if (!text) return text;
  for (const [kr, en] of Object.entries(optionMap)) {
    if (text.includes(kr)) return en;
  }
  return text.replace(/[가-힣]+/g, '').trim() || text;
}

async function fetchCarDetails(mainPage, carId, listImageUrl) {
  try {
    // Navigate to detail page by calling carInfo function
    await mainPage.evaluate((id) => {
      if (typeof carInfo === 'function') {
        carInfo(id);
      }
    }, carId);

    await mainPage.waitForTimeout(3000);

    const details = await mainPage.evaluate(() => {
      const result = {
        images: [],
        options: [],
        description: '',
        engineCC: null,
        grade: '',
        inspectionData: null,
      };

      // Get all images from imagePathList
      if (typeof imagePathList !== 'undefined' && Array.isArray(imagePathList)) {
        imagePathList.forEach(path => {
          const fullUrl = 'http://www.sellcarauction.co.kr' + path;
          if (!result.images.includes(fullUrl)) {
            result.images.push(fullUrl);
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

      // Get performance info
      const inspection = {};
      document.querySelectorAll('th, td').forEach(cell => {
        const text = cell.innerText?.trim();
        if (text?.includes('전손/침수') || text?.includes('보험이력')) {
          const nextSibling = cell.nextElementSibling;
          if (nextSibling) {
            const value = nextSibling.innerText?.trim();
            if (value.includes('전손사고 : N')) inspection.totalLoss = 'No';
            else if (value.includes('전손사고 : Y')) inspection.totalLoss = 'Yes';
            if (value.includes('침수전손사고 : N') && value.includes('침수분손사고 : N')) {
              inspection.floodDamage = 'None';
            } else if (value.includes('침수') && value.includes(': Y')) {
              inspection.floodDamage = 'Yes';
            }
          }
        }

        if (text === '평가점') {
          const nextSibling = cell.nextElementSibling;
          if (nextSibling) result.grade = nextSibling.innerText?.trim();
        }

        if (text?.includes('특기사항') || text?.includes('점검자 의견')) {
          const nextSibling = cell.nextElementSibling;
          if (nextSibling) {
            const notes = nextSibling.innerText?.trim();
            if (notes && notes.length > 1) result.description += notes + ' ';
          }
        }
      });

      const bodyText = document.body.innerText;
      const ccMatch = bodyText.match(/(\d{1,2}[,.]?\d{3})\s*cc/i);
      if (ccMatch) result.engineCC = parseInt(ccMatch[1].replace(/[,.]/g, ''));

      if (Object.keys(inspection).length > 0) result.inspectionData = inspection;

      return result;
    });

    if (details.images.length === 0 && listImageUrl) {
      details.images.push(listImageUrl);
    }

    // Go back
    await mainPage.goBack({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await mainPage.waitForTimeout(1500);

    return details;
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return { images: listImageUrl ? [listImageUrl] : [], options: [], inspectionData: null };
  }
}

async function main() {
  console.log('Testing Improved Hub Auction Crawler (3 cars)...');

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

    // Navigate to list
    await page.evaluate(() => {
      if (typeof checkAuthority === 'function') checkAuthority('AC1');
    });
    await page.waitForTimeout(5000);

    // Get 3 cars from list
    const cars = await page.evaluate(() => {
      const results = [];
      const carItems = Array.from(document.querySelectorAll('.car-item')).slice(0, 3);

      carItems.forEach(item => {
        const img = item.querySelector('img');
        const link = item.querySelector('a[onclick*="carInfo"]');
        let carId = '';
        if (link) {
          const match = link.getAttribute('onclick')?.match(/carInfo\(['"]([^'"]+)['"]\)/);
          if (match) carId = match[1];
        }

        const row = item.closest('tr') || item.parentElement;
        const text = row?.innerText || '';
        const nameMatch = text.match(/(현대|기아|제네시스|벤츠|BMW)[^\n]*/);

        results.push({
          carId,
          listImg: img?.src || '',
          name: nameMatch ? nameMatch[0].substring(0, 50) : 'Unknown',
        });
      });

      return results;
    });

    console.log(`\nFound ${cars.length} cars to test`);

    // Fetch details for each car
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      console.log(`\n=== Car ${i + 1}: ${car.name} ===`);
      console.log(`Car ID: ${car.carId}`);
      console.log(`List Image: ${car.listImg.substring(0, 60)}...`);

      const details = await fetchCarDetails(page, car.carId, car.listImg);

      console.log(`\n  Images: ${details.images.length}`);
      if (details.images.length > 0) {
        console.log(`    First 5 images:`);
        details.images.slice(0, 5).forEach((img, j) => {
          console.log(`      ${j + 1}. ${img.split('/').pop()}`);
        });
      }

      console.log(`\n  Options: ${details.options.length}`);
      if (details.options.length > 0) {
        const translatedOptions = details.options.map(o => translateOption(o)).filter(o => o);
        console.log(`    Raw: ${details.options.slice(0, 10).join(', ')}`);
        console.log(`    Translated: ${translatedOptions.slice(0, 10).join(', ')}`);
      }

      console.log(`\n  Grade: ${details.grade || 'Not found'}`);
      console.log(`  Engine CC: ${details.engineCC || 'Not found'}`);
      console.log(`  Inspection: ${JSON.stringify(details.inspectionData)}`);
      console.log(`  Notes: ${details.description?.substring(0, 100) || 'None'}...`);
    }

    console.log('\n✓ Test completed!');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main();
