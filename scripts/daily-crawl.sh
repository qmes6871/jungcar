#!/bin/bash
#
# 매일 오전 9시 자동 크롤링 스크립트
# - 현대글로비스 경매 차량
# - 오토허브 경매 차량
#

LOG_DIR="/var/www/Jungcar/logs"
SCRIPT_DIR="/var/www/Jungcar/scripts"
DATE=$(date '+%Y-%m-%d_%H%M')

# 로그 디렉토리 생성
mkdir -p $LOG_DIR

echo "========================================"
echo "일일 크롤링 시작: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

cd /var/www/Jungcar

# 1. 현대글로비스 크롤링
echo ""
echo "[1/2] 현대글로비스 크롤링 시작..."
node $SCRIPT_DIR/crawl-glovis-web.mjs >> $LOG_DIR/crawl-$DATE.log 2>&1
GLOVIS_STATUS=$?

if [ $GLOVIS_STATUS -eq 0 ]; then
    echo "  -> 현대글로비스 완료"
else
    echo "  -> 현대글로비스 실패 (exit code: $GLOVIS_STATUS)"
fi

# 2. 오토허브 크롤링
echo ""
echo "[2/2] 오토허브 크롤링 시작..."
node $SCRIPT_DIR/crawl-autohub-simple.mjs >> $LOG_DIR/crawl-$DATE.log 2>&1
AUTOHUB_STATUS=$?

if [ $AUTOHUB_STATUS -eq 0 ]; then
    echo "  -> 오토허브 완료"
else
    echo "  -> 오토허브 실패 (exit code: $AUTOHUB_STATUS)"
fi

# 결과 요약
echo ""
echo "========================================"
echo "크롤링 완료: $(date '+%Y-%m-%d %H:%M:%S')"
echo "로그 파일: $LOG_DIR/crawl-$DATE.log"
echo "========================================"

# 오래된 로그 파일 정리 (30일 이상)
find $LOG_DIR -name "crawl-*.log" -mtime +30 -delete 2>/dev/null

exit 0
