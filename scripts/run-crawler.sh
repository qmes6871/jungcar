#!/bin/bash
cd /var/www/Jungcar
/usr/bin/node scripts/crawl-hubauction.mjs >> /var/log/hubauction-crawler.log 2>&1
