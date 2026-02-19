import { chromium } from 'playwright';

async function checkDetailPage() {
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

    // Get first car ID
    const carId = await page.evaluate(() => {
      const link = document.querySelector('a[onclick*="carInfo"]');
      if (link) {
        const match = link.getAttribute('onclick')?.match(/carInfo\(['"]([^'"]+)['"]\)/);
        return match ? match[1] : null;
      }
      return null;
    });

    console.log('Car ID:', carId);

    if (carId) {
      // Go to detail page
      const detailUrl = 'https://www.sellcarauction.co.kr/newfront/onlineAuc/on/onlineAuc_on_detail.do?i_sCarId=' + carId;
      console.log('Detail URL:', detailUrl);

      await page.goto(detailUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Take screenshot
      await page.screenshot({ path: '/tmp/hubauction-detail-full.png', fullPage: true });
      console.log('Screenshot saved to /tmp/hubauction-detail-full.png');

      // Get page HTML structure
      const structure = await page.evaluate(() => {
        // Find all image-related elements
        const allImgs = Array.from(document.querySelectorAll('img'));
        const imgInfo = allImgs.map(img => ({
          src: img.src,
          dataSrc: img.getAttribute('data-src'),
          alt: img.alt,
          className: img.className,
          parentClass: img.parentElement?.className,
        })).filter(i => i.src && !i.src.includes('icon') && !i.src.includes('btn_') && !i.src.includes('car_info'));

        // Find iframe or popup elements
        const iframes = Array.from(document.querySelectorAll('iframe'));
        const iframeInfo = iframes.map(iframe => ({
          src: iframe.src,
          id: iframe.id,
          name: iframe.name,
        }));

        // Check for onclick handlers that might load images
        const clickableElements = Array.from(document.querySelectorAll('[onclick]'));
        const clickInfo = clickableElements
          .filter(el => el.getAttribute('onclick')?.includes('img') ||
                       el.getAttribute('onclick')?.includes('photo') ||
                       el.getAttribute('onclick')?.includes('image') ||
                       el.getAttribute('onclick')?.includes('pop'))
          .map(el => ({
            tag: el.tagName,
            onclick: el.getAttribute('onclick'),
            text: el.innerText?.substring(0, 50),
          }));

        // Find links to images
        const imgLinks = Array.from(document.querySelectorAll('a[href*=".jpg"], a[href*=".png"], a[href*=".gif"], a[href*="image"], a[href*="photo"]'));
        const imgLinkInfo = imgLinks.map(a => ({
          href: a.href,
          text: a.innerText?.substring(0, 50),
        }));

        // Get the HTML around car image
        const mainImgArea = document.querySelector('.img-area, .photo-area, .car-img, #mainImg, .main-img, .main_img');

        return {
          totalImages: allImgs.length,
          filteredImages: imgInfo.slice(0, 15),
          iframes: iframeInfo,
          clickables: clickInfo.slice(0, 10),
          imgLinks: imgLinkInfo.slice(0, 10),
          mainImgAreaHTML: mainImgArea?.outerHTML?.substring(0, 500),
        };
      });

      console.log('\n=== Filtered Images ===');
      console.log(JSON.stringify(structure.filteredImages, null, 2));

      console.log('\n=== Iframes ===');
      console.log(JSON.stringify(structure.iframes, null, 2));

      console.log('\n=== Clickable Elements (image/photo related) ===');
      console.log(JSON.stringify(structure.clickables, null, 2));

      console.log('\n=== Image Links ===');
      console.log(JSON.stringify(structure.imgLinks, null, 2));

      // Try to find image source patterns in page source
      const pageContent = await page.content();

      // Look for image URL patterns
      const patterns = [
        /upload[^"'\s]*\.(jpg|png|gif)/gi,
        /car[^"'\s]*\.(jpg|png|gif)/gi,
        /img[^"'\s]*\.(jpg|png|gif)/gi,
        /photo[^"'\s]*\.(jpg|png|gif)/gi,
        /data-src=["'][^"']+["']/gi,
        /data-original=["'][^"']+["']/gi,
      ];

      console.log('\n=== URL Patterns in Page Source ===');
      for (const pattern of patterns) {
        const matches = pageContent.match(pattern);
        if (matches && matches.length > 0) {
          const uniqueMatches = [...new Set(matches)].slice(0, 5);
          console.log(`Pattern ${pattern}:`, uniqueMatches);
        }
      }

      // Check if there's a fnPhotoView or similar function
      const functionCheck = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        let photoFunctions = [];
        scripts.forEach(s => {
          const content = s.innerHTML;
          const matches = content.match(/function\s+(fn[A-Za-z]*[Pp]hoto[A-Za-z]*|[a-z]*[Ii]mage[A-Za-z]*|[a-z]*[Pp]ic[A-Za-z]*)\s*\(/g);
          if (matches) {
            photoFunctions.push(...matches);
          }
        });
        return {
          photoFunctions,
          hasLazyLoad: !!window.lazyload || !!window.LazyLoad,
          hasSwiper: !!window.Swiper,
        };
      });

      console.log('\n=== Photo-related Functions ===');
      console.log(JSON.stringify(functionCheck, null, 2));
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

checkDetailPage();
