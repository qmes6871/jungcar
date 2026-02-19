import { chromium } from 'playwright';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';
const BASE_URL = 'https://www.sellcarauction.co.kr';

async function main() {
  console.log('Directly checking Hub Auction images...');

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

    // Get first car with image
    const carInfo = await page.evaluate(() => {
      const carItem = document.querySelector('.car-item');
      if (carItem) {
        const img = carItem.querySelector('img');
        const link = carItem.querySelector('a[onclick*="carInfo"]');
        let carId = '';
        if (link) {
          const match = link.getAttribute('onclick')?.match(/carInfo\(['"]([^'"]+)['"]\)/);
          if (match) carId = match[1];
        }

        // Also get the table row text for this car
        const row = carItem.closest('tr') || carItem.parentElement;
        const rowText = row?.innerText?.substring(0, 500) || '';

        return { carId, listImg: img?.src, rowText };
      }
      return null;
    });

    console.log('Car Info:', carInfo);

    if (carInfo?.listImg) {
      // Test direct image access with proper fetch
      console.log('\n=== Testing Direct Image Access ===');
      const imageTest = await page.evaluate(async (imgUrl) => {
        try {
          const resp = await fetch(imgUrl);
          const contentType = resp.headers.get('content-type');
          const contentLength = resp.headers.get('content-length');
          return {
            url: imgUrl,
            status: resp.status,
            contentType,
            contentLength,
            isImage: contentType?.includes('image'),
          };
        } catch (e) {
          return { url: imgUrl, error: e.message };
        }
      }, carInfo.listImg);

      console.log('Image test result:', imageTest);
    }

    // Now click on the car to go to detail page using the site's navigation
    console.log('\n=== Navigating to Detail via Click ===');

    // Click on the car info
    await page.evaluate((carId) => {
      if (typeof carInfo === 'function') {
        carInfo(carId);
      }
    }, carInfo.carId);

    await page.waitForTimeout(5000);

    // Check if we're on detail page and get images
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Take screenshot
    await page.screenshot({ path: '/tmp/hubauction-clicked.png', fullPage: true });

    // Get all information from detail page
    const detailInfo = await page.evaluate(() => {
      // Get all images
      const allImgs = Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => src.includes('AJSCIMG') || src.includes('upload'));

      // Get slider images
      const sliderImgs = Array.from(document.querySelectorAll('.slick-slide img, .slider img'))
        .map(img => img.src)
        .filter(src => !src.includes('no_img'));

      // Get imagePathList
      const imagePathList = typeof window.imagePathList !== 'undefined' ? window.imagePathList : [];

      // Get all table data
      const tables = [];
      document.querySelectorAll('table').forEach((table, idx) => {
        const rows = [];
        table.querySelectorAll('tr').forEach(tr => {
          const cells = [];
          tr.querySelectorAll('th, td').forEach(cell => {
            cells.push(cell.innerText.trim().substring(0, 100));
          });
          if (cells.join('').length > 0) {
            rows.push(cells);
          }
        });
        if (rows.length > 0) {
          tables.push({ index: idx, rows: rows.slice(0, 10) });
        }
      });

      // Get options info
      let optionsInfo = '';
      document.querySelectorAll('th, td').forEach(cell => {
        const text = cell.innerText.trim();
        if (text.includes('옵션') || text.includes('편의장치') || text.includes('안전장치')) {
          const next = cell.nextElementSibling;
          if (next) {
            optionsInfo += text + ': ' + next.innerText.trim() + '\n';
          }
        }
      });

      // Get performance info
      let perfInfo = '';
      document.querySelectorAll('th, td').forEach(cell => {
        const text = cell.innerText.trim();
        if (text.includes('사고') || text.includes('침수') || text.includes('변경') || text.includes('특기사항')) {
          const next = cell.nextElementSibling;
          if (next) {
            perfInfo += text + ': ' + next.innerText.trim() + '\n';
          }
        }
      });

      return {
        pageUrl: window.location.href,
        allImgs,
        sliderImgs,
        imagePathList,
        optionsInfo,
        perfInfo,
        tableCount: tables.length,
        sampleTables: tables.slice(0, 3),
      };
    });

    console.log('\n=== Detail Page Info ===');
    console.log('All Images:', detailInfo.allImgs);
    console.log('Slider Images:', detailInfo.sliderImgs);
    console.log('imagePathList:', detailInfo.imagePathList);
    console.log('\nOptions Info:', detailInfo.optionsInfo || 'None found');
    console.log('\nPerformance Info:', detailInfo.perfInfo || 'None found');
    console.log('\nTable count:', detailInfo.tableCount);
    console.log('Sample tables:', JSON.stringify(detailInfo.sampleTables, null, 2));

    // Try clicking on "크게보기" to see if it loads images
    console.log('\n=== Clicking Image Popup Button ===');

    const popupResult = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a')).find(a =>
        a.innerText.includes('크게보기') || a.onclick?.toString().includes('image')
      );
      if (btn) {
        try {
          btn.click();
          return { clicked: true, text: btn.innerText };
        } catch (e) {
          return { error: e.message };
        }
      }
      return { error: 'Button not found' };
    });

    console.log('Popup click result:', popupResult);

    await page.waitForTimeout(2000);

    // Check for popup window or new images
    const afterPopup = await page.evaluate(() => {
      // Check if modal is visible
      const modals = Array.from(document.querySelectorAll('.modal')).filter(m =>
        window.getComputedStyle(m).display !== 'none'
      );

      // Get images in modals
      const modalImgs = [];
      modals.forEach(m => {
        m.querySelectorAll('img').forEach(img => {
          if (img.src && !img.src.includes('no_img')) {
            modalImgs.push(img.src);
          }
        });
      });

      return {
        visibleModals: modals.length,
        modalImages: modalImgs,
      };
    });

    console.log('After popup:', afterPopup);

    await page.screenshot({ path: '/tmp/hubauction-popup-click.png', fullPage: true });

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main();
