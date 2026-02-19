import { chromium } from 'playwright';

async function checkImagePopup() {
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

    // Navigate to exhibit list to get a car ID
    await page.evaluate(() => {
      if (typeof checkAuthority === 'function') checkAuthority('AC1');
    });
    await page.waitForTimeout(5000);

    // Get first car info including image
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
        return {
          carId,
          listImgSrc: img?.src,
        };
      }
      return null;
    });

    console.log('Car Info:', carInfo);

    if (carInfo?.carId) {
      // Go to detail page
      const detailUrl = 'https://www.sellcarauction.co.kr/newfront/onlineAuc/on/onlineAuc_on_detail.do?i_sCarId=' + carInfo.carId;
      console.log('Detail URL:', detailUrl);

      await page.goto(detailUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Get the script content to find image loading logic
      const scriptInfo = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        let relevantScripts = [];

        scripts.forEach(s => {
          const content = s.innerHTML;
          if (content.includes('imagePathList') || content.includes('imgPath') ||
              content.includes('imageDetail') || content.includes('setImage')) {
            relevantScripts.push(content.substring(0, 2000));
          }
        });

        // Check for global variables
        const globalVars = {
          imagePathList: typeof imagePathList !== 'undefined' ? imagePathList : undefined,
          imgPathList: typeof imgPathList !== 'undefined' ? imgPathList : undefined,
          carImageList: typeof carImageList !== 'undefined' ? carImageList : undefined,
        };

        return { relevantScripts, globalVars };
      });

      console.log('\n=== Relevant Script Content ===');
      scriptInfo.relevantScripts.forEach((s, i) => {
        console.log(`\n--- Script ${i + 1} ---`);
        console.log(s);
      });

      console.log('\n=== Global Variables ===');
      console.log(JSON.stringify(scriptInfo.globalVars, null, 2));

      // Try to find network requests for images
      console.log('\n=== Trying to trigger image popup ===');

      // Listen for network requests
      const imageRequests = [];
      page.on('request', req => {
        const url = req.url();
        if (url.includes('image') || url.includes('photo') || url.includes('upload')) {
          imageRequests.push(url);
        }
      });

      // Click on image popup button
      const popupResult = await page.evaluate(() => {
        try {
          // Check if there's a imageDetailPopup function
          if (typeof imageDetailPopup === 'function') {
            imageDetailPopup();
            return { success: true, method: 'imageDetailPopup' };
          }
          return { success: false, message: 'imageDetailPopup not found' };
        } catch (e) {
          return { success: false, message: e.message };
        }
      });

      console.log('Popup trigger result:', popupResult);
      await page.waitForTimeout(2000);

      // Take screenshot after popup
      await page.screenshot({ path: '/tmp/hubauction-popup.png', fullPage: true });
      console.log('Popup screenshot saved');

      // Check for popup images
      const popupImages = await page.evaluate(() => {
        // Check for modal/popup
        const modals = document.querySelectorAll('.modal, .popup, [class*="modal"], [class*="popup"], [role="dialog"]');
        const modalInfo = Array.from(modals).map(m => ({
          className: m.className,
          display: window.getComputedStyle(m).display,
        }));

        // Get all images now
        const allImgs = Array.from(document.querySelectorAll('img'));
        const imgSrcs = allImgs
          .map(img => img.src)
          .filter(src => src &&
                  !src.includes('no_img') &&
                  !src.includes('blank') &&
                  !src.includes('/images/') &&
                  (src.includes('upload') || src.includes('car') || src.includes('.jpg') || src.includes('.png')));

        return { modalInfo, imgSrcs };
      });

      console.log('\n=== After Popup ===');
      console.log('Modals:', JSON.stringify(popupImages.modalInfo, null, 2));
      console.log('Images found:', popupImages.imgSrcs);

      // Check the page URL for image API
      const pageHTML = await page.content();

      // Look for AJAX calls or API endpoints
      const apiPatterns = pageHTML.match(/\/[a-zA-Z]+\/[a-zA-Z]+\.(do|json|ajax)[^"'\s]*/g);
      console.log('\n=== API Endpoints Found ===');
      console.log([...new Set(apiPatterns || [])].slice(0, 20));

      // Look for image paths in HTML
      const imgPaths = pageHTML.match(/['"](\/[^"'\s]*(?:upload|car|photo|img)[^"'\s]*\.(jpg|png|gif))['"]/gi);
      console.log('\n=== Image Paths in HTML ===');
      console.log([...new Set(imgPaths || [])].slice(0, 20));
    }

  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await browser.close();
  }
}

checkImagePopup();
