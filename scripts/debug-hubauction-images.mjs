import { chromium } from 'playwright';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';
const BASE_URL = 'https://www.sellcarauction.co.kr';

async function main() {
  console.log('Finding ALL images for Hub Auction cars...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Monitor network requests
  const networkRequests = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('attach') || url.includes('image') || url.includes('list') || url.includes('ajax')) {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json') || contentType.includes('html')) {
          const body = await response.text();
          if (body.length < 5000 && !body.includes('<!DOCTYPE')) {
            networkRequests.push({ url, body: body.substring(0, 500) });
          }
        }
      } catch (e) {}
    }
  });

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

    // Get 5 cars with their list images
    const carsFromList = await page.evaluate(() => {
      const cars = [];
      const carItems = Array.from(document.querySelectorAll('.car-item')).slice(0, 5);

      carItems.forEach(item => {
        const img = item.querySelector('img');
        const link = item.querySelector('a[onclick*="carInfo"]');

        let carId = '';
        if (link) {
          const match = link.getAttribute('onclick')?.match(/carInfo\(['"]([^'"]+)['"]\)/);
          if (match) carId = match[1];
        }

        if (carId && img?.src) {
          cars.push({
            carId,
            listImg: img.src,
          });
        }
      });

      return cars;
    });

    console.log('\n=== Cars from List ===');
    carsFromList.forEach((c, i) => {
      console.log(`${i + 1}. ${c.carId}: ${c.listImg}`);
    });

    // Check each image folder for multiple images
    console.log('\n=== Checking Image Folder Pattern ===');

    for (const car of carsFromList.slice(0, 2)) {
      console.log(`\n--- Car: ${car.carId} ---`);

      // Extract base info from image URL
      // Pattern: http://www.sellcarauction.co.kr/AJSCIMG/upload/upload_file/INSPECT/2026/202601/IP202601200013/AT176887363077659_M.jpg
      const urlParts = car.listImg.match(/(.*\/IP\d+\/)([^\/]+)_M\.(jpg|JPG)/i);
      if (urlParts) {
        const baseFolder = urlParts[1];
        const atNumber = urlParts[2];
        const ext = urlParts[3];

        console.log('Base folder:', baseFolder);
        console.log('AT number:', atNumber);

        // Try different image patterns
        const imagesToTry = [
          car.listImg, // Original M
          car.listImg.replace('_M.', '_L.'), // Large
          car.listImg.replace('_M.', '_S.'), // Small
          `${baseFolder}${atNumber}_01.${ext}`,
          `${baseFolder}${atNumber}_02.${ext}`,
          `${baseFolder}${atNumber}_03.${ext}`,
        ];

        console.log('Images to try:', imagesToTry);

        // Check which images exist
        for (const imgUrl of imagesToTry) {
          const exists = await page.evaluate(async (url) => {
            try {
              const resp = await fetch(url, { method: 'HEAD' });
              return { url, status: resp.status, exists: resp.status === 200 };
            } catch (e) {
              return { url, error: e.message };
            }
          }, imgUrl);
          console.log(`  ${exists.exists ? '✓' : '✗'} ${imgUrl.split('/').pop()}`);
        }
      }

      // Also try to find images via API
      const receiveCode = car.carId.replace('RC', '');
      console.log('\nTrying API with receivecd:', receiveCode);

      // Try different API endpoints
      const apiResults = await page.evaluate(async (code) => {
        const results = [];

        const endpoints = [
          { url: '/newfront/attach/attach_list_ajax.do', params: `receivecd=${code}` },
          { url: '/newfront/receive/rc/receive_rc_attach_list_ajax.do', params: `receivecd=${code}` },
          { url: '/newfront/onlineAuc/on/onlineAuc_attach_list_ajax.do', params: `i_sCarId=RC${code}` },
        ];

        for (const endpoint of endpoints) {
          try {
            const resp = await fetch(endpoint.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: endpoint.params,
            });
            const text = await resp.text();
            if (text && !text.includes('<!DOCTYPE') && text.length < 5000) {
              results.push({
                endpoint: endpoint.url,
                params: endpoint.params,
                response: text.substring(0, 500),
              });
            }
          } catch (e) {
            results.push({ endpoint: endpoint.url, error: e.message });
          }
        }

        return results;
      }, receiveCode);

      console.log('API Results:', JSON.stringify(apiResults, null, 2));
    }

    // Let's also check the inspection page which might have more images
    console.log('\n=== Checking Receive/Inspection Page ===');

    const firstCar = carsFromList[0];
    const receiveUrl = `${BASE_URL}/newfront/receive/rc/receive_rc_detail.do?i_sReceiveCd=${firstCar.carId.replace('RC', '')}`;
    console.log('Receive page URL:', receiveUrl);

    await page.goto(receiveUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);

    const receivePageInfo = await page.evaluate(() => {
      // Get all images on this page
      const allImgs = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        className: img.className,
      })).filter(i => i.src.includes('AJSCIMG') || i.src.includes('upload'));

      // Get slider images
      const sliderImgs = Array.from(document.querySelectorAll('.slick-slide img, .slider img')).map(img => img.src);

      // Check imagePathList
      const imagePathList = typeof window.imagePathList !== 'undefined' ? window.imagePathList : null;

      return {
        allImgs: allImgs.slice(0, 20),
        sliderImgs,
        imagePathList,
        pageTitle: document.title,
      };
    });

    console.log('Receive page info:', JSON.stringify(receivePageInfo, null, 2));

    console.log('\n=== Network Requests with Data ===');
    networkRequests.forEach(req => {
      console.log(`URL: ${req.url}`);
      console.log(`Body: ${req.body}\n`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main();
