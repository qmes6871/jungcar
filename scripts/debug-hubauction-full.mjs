import { chromium } from 'playwright';

const USERNAME = '812701';
const PASSWORD = 'sk&nk060';
const BASE_URL = 'https://www.sellcarauction.co.kr';

async function main() {
  console.log('Investigating Hub Auction detail page for ALL information...');

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

    // Get a car ID and list image
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
        return { carId, listImgSrc: img?.src };
      }
      return null;
    });

    console.log('Car Info:', carInfo);

    if (carInfo?.carId) {
      // Navigate to detail page
      const detailUrl = `${BASE_URL}/newfront/onlineAuc/on/onlineAuc_on_detail.do?i_sCarId=${carInfo.carId}`;
      console.log('Going to detail page:', detailUrl);

      await page.goto(detailUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Take full screenshot
      await page.screenshot({ path: '/tmp/hubauction-detail-fullpage.png', fullPage: true });
      console.log('Full page screenshot saved');

      // Look for image loading mechanism
      const pageData = await page.evaluate(() => {
        // Find all sections on the page
        const sections = [];

        // 1. Get the main image area
        const mainImgArea = document.querySelector('.img-area, .car-image, .slider-car-img');
        sections.push({
          name: 'Main Image Area',
          className: mainImgArea?.className,
          innerHTML: mainImgArea?.innerHTML?.substring(0, 500),
        });

        // 2. Get performance check section (성능점검)
        const perfSection = document.querySelector('[class*="perf"], [class*="check"], [class*="inspect"]');
        sections.push({
          name: 'Performance Section',
          className: perfSection?.className,
          text: perfSection?.innerText?.substring(0, 500),
        });

        // 3. Get options section (옵션정보)
        let optionsText = '';
        document.querySelectorAll('th, td').forEach(cell => {
          if (cell.innerText?.includes('옵션')) {
            const next = cell.nextElementSibling;
            if (next) optionsText += next.innerText + ' | ';
          }
        });
        sections.push({
          name: 'Options',
          text: optionsText || 'Not found in tables',
        });

        // 4. Get must-read notes (필독사항)
        const notesSection = document.querySelector('[class*="note"], [class*="remark"], [class*="must"]');
        sections.push({
          name: 'Notes Section',
          className: notesSection?.className,
          text: notesSection?.innerText?.substring(0, 500),
        });

        // 5. Find all tables on the page
        const tables = document.querySelectorAll('table');
        const tableInfo = [];
        tables.forEach((table, idx) => {
          const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
          tableInfo.push({
            index: idx,
            headers: headers.slice(0, 10),
            rowCount: table.querySelectorAll('tr').length,
          });
        });
        sections.push({
          name: 'Tables',
          tables: tableInfo,
        });

        // 6. Look for slick slider or image carousel
        const slickSlider = document.querySelector('.slick-slider, .slick-list');
        const sliderImages = [];
        if (slickSlider) {
          slickSlider.querySelectorAll('img').forEach(img => {
            sliderImages.push(img.src);
          });
        }
        sections.push({
          name: 'Slider Images',
          images: sliderImages,
        });

        // 7. Find all onclick handlers related to images
        const imageHandlers = [];
        document.querySelectorAll('[onclick]').forEach(el => {
          const onclick = el.getAttribute('onclick');
          if (onclick?.includes('image') || onclick?.includes('photo') || onclick?.includes('pop')) {
            imageHandlers.push({
              tag: el.tagName,
              text: el.innerText?.substring(0, 30),
              onclick: onclick.substring(0, 100),
            });
          }
        });
        sections.push({
          name: 'Image Handlers',
          handlers: imageHandlers,
        });

        // 8. Get all hidden inputs
        const hiddenInputs = {};
        document.querySelectorAll('input[type="hidden"]').forEach(input => {
          if (input.name || input.id) {
            hiddenInputs[input.name || input.id] = input.value?.substring(0, 100);
          }
        });
        sections.push({
          name: 'Hidden Inputs',
          inputs: hiddenInputs,
        });

        return sections;
      });

      console.log('\n=== Page Structure ===');
      pageData.forEach(section => {
        console.log(`\n--- ${section.name} ---`);
        console.log(JSON.stringify(section, null, 2));
      });

      // Try to find image API by checking script content
      const scriptAnalysis = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        const imageRelated = [];

        scripts.forEach((script, idx) => {
          const content = script.innerHTML;
          if (content.length > 0) {
            // Look for image-related functions or AJAX calls
            const matches = content.match(/(attach|image|photo|imgPath|AJSCIMG)[^;]*;/gi);
            if (matches) {
              imageRelated.push({
                scriptIndex: idx,
                matches: matches.slice(0, 5).map(m => m.substring(0, 150)),
              });
            }
          }
        });

        return imageRelated;
      });

      console.log('\n=== Script Analysis ===');
      console.log(JSON.stringify(scriptAnalysis, null, 2));

      // Get the full URL path of the main image to understand the pattern
      console.log('\n=== Image URL Pattern ===');
      console.log('List image URL:', carInfo.listImgSrc);

      if (carInfo.listImgSrc) {
        // Try to find the folder structure
        const match = carInfo.listImgSrc.match(/(.*\/IP\d+\/)/);
        if (match) {
          console.log('Image folder:', match[1]);

          // The folder contains all images for this car
          // We need to find an API to list files or try common patterns
          const basePath = match[1];
          console.log('Checking if we can access the image folder...');

          // Try to get image list from the page's AJAX call
          const ajaxData = await page.evaluate(async (carId) => {
            // Try to call the attach list API
            try {
              const formData = new FormData();
              formData.append('receivecd', carId.replace('RC', ''));

              const resp = await fetch('/newfront/receive/rc/receive_rc_image_list_ajax.do', {
                method: 'POST',
                body: formData,
              });
              const text = await resp.text();
              return { endpoint: 'receive_rc_image_list_ajax', response: text.substring(0, 2000) };
            } catch (e) {
              return { error: e.message };
            }
          }, carInfo.carId);

          console.log('\n=== AJAX Image List ===');
          console.log(JSON.stringify(ajaxData, null, 2));
        }
      }

      // Check page source for image references
      const pageSource = await page.content();
      const uploadImageUrls = pageSource.match(/https?:\/\/[^"'\s]*AJSCIMG[^"'\s]*\.(jpg|png|gif)/gi);
      console.log('\n=== All AJSCIMG URLs in page ===');
      console.log([...new Set(uploadImageUrls || [])].slice(0, 20));

    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main();
