import { chromium } from 'playwright';

async function findImageAPI() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture network requests
  const requests = [];
  page.on('request', req => requests.push({ url: req.url(), method: req.method() }));
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('image') || url.includes('photo') || url.includes('attach') ||
        url.includes('ajax') || url.includes('list')) {
      console.log('Response:', url);
      try {
        if (resp.headers()['content-type']?.includes('json')) {
          const json = await resp.json();
          console.log('JSON Response:', JSON.stringify(json).substring(0, 500));
        }
      } catch (e) {}
    }
  });

  try {
    // Login first
    await page.goto('https://www.sellcarauction.co.kr/newfront/login.do', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const radio = document.getElementById('i_sLoginGubun2');
      if (radio) radio.click();
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const userInput = document.getElementById('i_sUserId');
      const passInput = document.getElementById('i_sPswd');
      if (userInput) userInput.value = '812701';
      if (passInput) passInput.value = 'sk&nk060';
    });
    await page.evaluate(() => {
      if (typeof fnLoginCheck === 'function') fnLoginCheck();
    });
    await page.waitForTimeout(4000);

    // Navigate to exhibit list
    await page.evaluate(() => {
      if (typeof checkAuthority === 'function') checkAuthority('AC1');
    });
    await page.waitForTimeout(5000);

    // Get multiple car IDs and their images from list
    const carsFromList = await page.evaluate(() => {
      const cars = [];
      const carItems = document.querySelectorAll('.car-item');

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
            imgSrc: img.src,
          });
        }
      });

      return cars.slice(0, 5);
    });

    console.log('\n=== Cars from List with Images ===');
    console.log(JSON.stringify(carsFromList, null, 2));

    // Analyze image URL pattern
    if (carsFromList.length > 0) {
      const imgUrl = carsFromList[0].imgSrc;
      console.log('\n=== Image URL Pattern Analysis ===');
      console.log('Full URL:', imgUrl);

      // Pattern: http://www.sellcarauction.co.kr/AJSCIMG/upload/upload_file/INSPECT/2026/202601/IP202601200013/AT176887363077659_M.jpg
      // carId: RC202601200013
      // The IP folder matches the last part of carId

      const carId = carsFromList[0].carId;
      console.log('Car ID:', carId);

      // Try to find more images by changing suffix
      const baseUrl = imgUrl.replace('_M.jpg', '');
      console.log('Base URL:', baseUrl);

      // Try to access the detail page and intercept AJAX calls
      console.log('\n=== Visiting Detail Page ===');

      const detailUrl = 'https://www.sellcarauction.co.kr/newfront/onlineAuc/on/onlineAuc_on_detail.do?i_sCarId=' + carId;
      await page.goto(detailUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Look for setImagePathList function call
      const pageSource = await page.content();

      // Find the script that sets imagePathList
      const setImageMatch = pageSource.match(/setImagePathList\s*\(\s*(\[[^\]]*\])\s*\)/);
      if (setImageMatch) {
        console.log('Found setImagePathList call:', setImageMatch[1]);
      }

      // Check if there's an API to get images
      const receiveCode = carId.replace('RC', 'IP');
      console.log('\nTrying to find images with code:', receiveCode);

      // Try to call the image API directly
      const imageApiResult = await page.evaluate(async (code) => {
        try {
          // Try different API endpoints
          const endpoints = [
            '/newfront/receive/rc/get_image_list_ajax.do',
            '/newfront/receive/rc/receive_rc_image_list.do',
            '/newfront/onlineAuc/on/get_image_list_ajax.do',
            '/newfront/attach/getAttachList.do',
          ];

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'receivecd=' + code.replace('IP', ''),
              });
              const text = await response.text();
              if (text && text.length > 10) {
                return { endpoint, response: text.substring(0, 1000) };
              }
            } catch (e) {
              continue;
            }
          }

          return { error: 'No API found' };
        } catch (e) {
          return { error: e.message };
        }
      }, receiveCode);

      console.log('\nImage API Result:', imageApiResult);

      // Look for attach info in page
      const attachInfo = await page.evaluate(() => {
        // Find hidden inputs or data attributes with attach info
        const hiddenInputs = Array.from(document.querySelectorAll('input[type="hidden"]'));
        const attachInputs = hiddenInputs
          .filter(i => i.name?.includes('attach') || i.id?.includes('attach') ||
                      i.value?.includes('upload') || i.value?.includes('AJSC'))
          .map(i => ({ name: i.name, id: i.id, value: i.value }));

        // Check for data in scripts
        const scripts = Array.from(document.querySelectorAll('script'));
        let attachData = null;
        scripts.forEach(s => {
          const content = s.innerHTML;
          const match = content.match(/(AJSCIMG|upload_file|\/INSPECT\/)[^"'\s<>]+/g);
          if (match) {
            attachData = match;
          }
        });

        return { attachInputs, attachData };
      });

      console.log('\nAttach Info:', JSON.stringify(attachInfo, null, 2));

      // Try to construct multiple image URLs
      console.log('\n=== Trying to find multiple images ===');

      // Pattern analysis: AT176887363077659_M.jpg
      // The AT prefix with timestamp might have multiple images

      // Try to list files in the folder or find pattern
      const folderPath = imgUrl.match(/(.*\/IP\d+\/)/);
      if (folderPath) {
        console.log('Folder path:', folderPath[1]);

        // Try different image indices
        const atMatch = imgUrl.match(/AT(\d+)_M\.jpg/);
        if (atMatch) {
          const atNumber = atMatch[1];
          console.log('AT number:', atNumber);

          // Images might have sequential suffixes like _1, _2, etc. or different AT numbers
        }
      }

      // Check list view for multiple images per car
      console.log('\n=== Going back to list to check HTML ===');
      await page.goBack({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Get all image URLs from the first car item
      const firstCarHTML = await page.evaluate(() => {
        const carItem = document.querySelector('.car-item');
        return carItem ? carItem.outerHTML : null;
      });

      console.log('First Car HTML:', firstCarHTML?.substring(0, 1000));
    }

  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await browser.close();
  }
}

findImageAPI();
