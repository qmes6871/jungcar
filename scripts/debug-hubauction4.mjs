import { chromium } from 'playwright';

async function findMultipleImages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

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

    // Get first car ID
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
        return { carId, imgSrc: img?.src };
      }
      return null;
    });

    console.log('Car Info:', carInfo);

    if (carInfo?.carId) {
      // Go to detail page using the carInfo function
      const detailUrl = 'https://www.sellcarauction.co.kr/newfront/onlineAuc/on/onlineAuc_on_detail.do?i_sCarId=' + carInfo.carId;
      console.log('Going to detail page...');

      await page.goto(detailUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Get the receivecd from the page
      const pageData = await page.evaluate(() => {
        // Try to find receivecd in various ways
        const bodyText = document.body.innerHTML;

        // Look for receivecd in the page
        const receiveMatch = bodyText.match(/receivecd['":\s]+['"]?([A-Z]{2}\d+)['"]?/i);
        const ipMatch = bodyText.match(/(IP\d+)/);

        // Look for carId patterns
        const rcMatch = bodyText.match(/(RC\d+)/);

        // Find hidden form fields
        const hiddenInputs = {};
        document.querySelectorAll('input[type="hidden"]').forEach(i => {
          hiddenInputs[i.name || i.id] = i.value;
        });

        return {
          receivecd: receiveMatch?.[1],
          ipFolder: ipMatch?.[1],
          rcId: rcMatch?.[1],
          hiddenInputs,
        };
      });

      console.log('Page Data:', JSON.stringify(pageData, null, 2));

      // Try to call the image list API with correct parameters
      const receivecd = carInfo.carId.replace('RC', '');
      console.log('Trying receivecd:', receivecd);

      // Try different API calls
      const apiResults = await page.evaluate(async (receivecd) => {
        const results = [];

        // Try 1: POST with receivecd
        try {
          const formData = new FormData();
          formData.append('receivecd', receivecd);

          const resp1 = await fetch('/newfront/receive/rc/receive_rc_image_ajax.do', {
            method: 'POST',
            body: formData,
          });
          const text1 = await resp1.text();
          if (text1 && !text1.includes('<!DOCTYPE')) {
            results.push({ endpoint: 'receive_rc_image_ajax.do', data: text1.substring(0, 500) });
          }
        } catch (e) {}

        // Try 2: With i_sReceiveCd
        try {
          const formData = new FormData();
          formData.append('i_sReceiveCd', receivecd);

          const resp2 = await fetch('/newfront/attach/attach_image_list_ajax.do', {
            method: 'POST',
            body: formData,
          });
          const text2 = await resp2.text();
          if (text2 && !text2.includes('<!DOCTYPE')) {
            results.push({ endpoint: 'attach_image_list_ajax.do', data: text2.substring(0, 500) });
          }
        } catch (e) {}

        // Try 3: Look at the imageDetailPopup function and call it
        try {
          if (typeof imageDetailPopup === 'function') {
            // This function is defined, let's see what it does
            const funcStr = imageDetailPopup.toString();
            results.push({ type: 'function', content: funcStr.substring(0, 1000) });
          }
        } catch (e) {}

        // Try 4: Look for imagePathList
        if (window.imagePathList && Array.isArray(window.imagePathList)) {
          results.push({ type: 'imagePathList', data: window.imagePathList });
        }

        // Try 5: Look for any AJAX function that loads images
        if (typeof cmAjax === 'function') {
          results.push({ type: 'cmAjax', exists: true });
        }

        return results;
      }, receivecd);

      console.log('\nAPI Results:', JSON.stringify(apiResults, null, 2));

      // Let's check the page source for the setImagePathList call
      const pageSource = await page.content();

      // Find setImagePathList function definition and calls
      const setImageMatch = pageSource.match(/function setImagePathList[\s\S]*?(?=function|<\/script>)/);
      console.log('\nsetImagePathList function:', setImageMatch?.[0]?.substring(0, 500));

      // Find where images are loaded
      const imageLoadMatch = pageSource.match(/attachfullpath[^}]+/g);
      console.log('\nattachfullpath references:', imageLoadMatch?.slice(0, 3));

      // Try calling the actual image popup to see what it loads
      console.log('\n=== Triggering popup and checking network ===');

      // Listen for image loads
      const loadedImages = [];
      page.on('response', async (resp) => {
        const url = resp.url();
        if (url.includes('AJSCIMG') || url.includes('upload')) {
          loadedImages.push(url);
        }
      });

      // Click the image or trigger popup
      await page.evaluate(() => {
        if (typeof imageDetailPopup === 'function') {
          imageDetailPopup();
        }
      });
      await page.waitForTimeout(3000);

      console.log('Loaded images after popup:', loadedImages);

      // Check for slick slider images
      const sliderImages = await page.evaluate(() => {
        const images = [];

        // Check slick slides
        document.querySelectorAll('.slick-slide img, .slick-track img').forEach(img => {
          if (img.src && !img.src.includes('no_img')) {
            images.push(img.src);
          }
        });

        // Check modal images
        document.querySelectorAll('.modal img').forEach(img => {
          if (img.src && !img.src.includes('no_img') && img.src.includes('AJSCIMG')) {
            images.push(img.src);
          }
        });

        return images;
      });

      console.log('\nSlider/Modal Images:', sliderImages);

      // Screenshot the popup
      await page.screenshot({ path: '/tmp/hubauction-popup-check.png', fullPage: true });
      console.log('\nScreenshot saved');
    }

  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await browser.close();
  }
}

findMultipleImages();
