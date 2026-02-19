import { chromium } from 'playwright';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';
const BASE_URL = 'https://www.sellcarauction.co.kr';

async function fetchCarDetails(page, carId, listImageUrl, context) {
  const detailPage = await context.newPage();
  try {
    const detailUrl = `${BASE_URL}/newfront/onlineAuc/on/onlineAuc_on_detail.do?i_sCarId=${carId}`;

    await detailPage.goto(detailUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await detailPage.waitForTimeout(1500);

    // Extract detailed information
    const details = await detailPage.evaluate((listImg) => {
      const result = {
        images: [],
        options: [],
        description: '',
        engineCC: null,
        grade: '',
        inspectionData: null,
        damageInfo: '',
      };

      // Start with the list image (we know this works)
      if (listImg && listImg.startsWith('http') && !listImg.includes('no_img')) {
        result.images.push(listImg);
      }

      // Try to get options from the detailed spec table
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('th, td');
          cells.forEach((cell, idx) => {
            const text = cell.innerText?.trim();
            // Look for option-related rows
            if (text?.includes('옵션') || text?.includes('장치') || text?.includes('편의')) {
              const nextCell = cells[idx + 1];
              if (nextCell) {
                const optText = nextCell.innerText?.trim();
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
        });
      });

      // Get vehicle specs from body text
      const bodyText = document.body.innerText;

      // Get engine displacement
      const ccMatch = bodyText.match(/(\d{1,2}[,.]?\d{3})\s*cc/i);
      if (ccMatch) result.engineCC = parseInt(ccMatch[1].replace(/[,.]/g, ''));

      // Get grade/trim info
      const gradeMatch = bodyText.match(/등급[:\s]*([가-힣a-zA-Z0-9\s\-]+)/);
      if (gradeMatch) {
        result.grade = gradeMatch[1].trim().substring(0, 50);
      }

      // Try to parse performance inspection data
      const inspection = {};
      const perfSection = document.body.innerHTML;

      if (perfSection.includes('사고이력')) {
        if (perfSection.includes('무') && !perfSection.includes('사고이력 유')) {
          inspection.accidentHistory = 'None';
        } else if (perfSection.includes('유') || perfSection.includes('사고있음')) {
          inspection.accidentHistory = 'Yes';
        }
      }

      if (perfSection.includes('침수')) {
        if (perfSection.includes('침수 무') || perfSection.includes('침수무')) {
          inspection.floodDamage = 'None';
        } else if (perfSection.includes('침수 유') || perfSection.includes('침수유')) {
          inspection.floodDamage = 'Yes';
        }
      }

      if (Object.keys(inspection).length > 0) {
        result.inspectionData = inspection;
      }

      return result;
    }, listImageUrl);

    // Try to generate additional image URLs based on known pattern
    if (listImageUrl && listImageUrl.includes('AJSCIMG')) {
      // Try _L (large) version
      const largeImg = listImageUrl.replace('_M.jpg', '_L.jpg').replace('_M.JPG', '_L.JPG');
      if (!details.images.includes(largeImg)) {
        details.images.push(largeImg);
      }

      // Try to get more images by checking common suffixes
      const baseUrl = listImageUrl.replace(/_M\.(jpg|JPG)$/, '');
      const ext = listImageUrl.match(/\.(jpg|JPG)$/)?.[1] || 'jpg';

      for (let i = 1; i <= 5; i++) {
        const numberedImg = `${baseUrl}_${i}.${ext}`;
        if (!details.images.includes(numberedImg)) {
          details.images.push(numberedImg);
        }
      }
    }

    return details;
  } catch (error) {
    console.log(`  Error fetching details for ${carId}:`, error.message);
    return {
      images: listImageUrl ? [listImageUrl] : [],
      options: [],
      description: '',
      engineCC: null,
      grade: '',
      inspectionData: null,
      damageInfo: '',
    };
  } finally {
    await detailPage.close();
  }
}

async function main() {
  console.log('Testing Hub Auction crawler (3 cars only)...');

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

    // Get first 3 cars
    const carsOnPage = await page.evaluate(() => {
      const cars = [];
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
        const fullText = row?.innerText || item.innerText || '';

        const nameMatch = fullText.match(/(현대|기아|제네시스|벤츠|BMW)[^\n]*/);
        const name = nameMatch ? nameMatch[0].trim() : 'Unknown';

        const yearMatch = fullText.match(/(\d{4})\s/);
        const mileageMatch = fullText.match(/([\d,]+)km/);

        cars.push({
          carId,
          imgSrc: img?.src || '',
          name,
          year: yearMatch ? parseInt(yearMatch[1]) : 2024,
          mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : 0,
        });
      });

      return cars;
    });

    console.log(`\nFound ${carsOnPage.length} cars to test:`);
    carsOnPage.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} (${c.year}) - ID: ${c.carId}`);
      console.log(`     List Image: ${c.imgSrc}`);
    });

    // Fetch details for each car
    console.log('\nFetching details...');
    for (const car of carsOnPage) {
      if (car.carId) {
        console.log(`\n--- ${car.name} ---`);
        const details = await fetchCarDetails(page, car.carId, car.imgSrc, context);
        console.log(`  Images: ${details.images.length}`);
        details.images.forEach((img, i) => {
          console.log(`    ${i + 1}. ${img.substring(0, 80)}...`);
        });
        console.log(`  Options: ${details.options.length}`);
        if (details.options.length > 0) {
          console.log(`    Sample: ${details.options.slice(0, 5).join(', ')}`);
        }
        console.log(`  Engine CC: ${details.engineCC}`);
        console.log(`  Grade: ${details.grade}`);
        console.log(`  Inspection: ${JSON.stringify(details.inspectionData)}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

main();
