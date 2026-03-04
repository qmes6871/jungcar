#!/bin/bash
#
# 매일 오전 9시 자동 크롤링 스크립트
# - 오토벨 일반차량 (매일)
# - 현대글로비스 경매 차량 (화/목)
# - 오토허브 경매 차량 (수)
#

LOG_DIR="/var/www/Jungcar/logs"
SCRIPT_DIR="/var/www/Jungcar/scripts"
DATE=$(date '+%Y-%m-%d_%H%M')
DAY_OF_WEEK=$(date '+%u')  # 1=월, 2=화, 3=수, 4=목, 5=금, 6=토, 7=일

# 로그 디렉토리 생성
mkdir -p $LOG_DIR

echo "========================================"
echo "일일 크롤링 시작: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

cd /var/www/Jungcar

# 1. 오토벨 일반차량 크롤링 (매일)
echo ""
echo "[1/3] 오토벨 일반차량 크롤링 시작..."
node $SCRIPT_DIR/crawl-autobell-general.mjs >> $LOG_DIR/crawl-$DATE.log 2>&1
AUTOBELL_STATUS=$?

if [ $AUTOBELL_STATUS -eq 0 ]; then
    echo "  -> 오토벨 일반차량 완료"
else
    echo "  -> 오토벨 일반차량 실패 (exit code: $AUTOBELL_STATUS)"
fi

# 2. 현대글로비스 크롤링 (화/목요일만)
if [ $DAY_OF_WEEK -eq 2 ] || [ $DAY_OF_WEEK -eq 4 ]; then
    echo ""
    echo "[2/3] 현대글로비스 크롤링 시작 (경매일)..."
    node $SCRIPT_DIR/crawl-glovis-web.mjs >> $LOG_DIR/crawl-$DATE.log 2>&1
    GLOVIS_STATUS=$?

    if [ $GLOVIS_STATUS -eq 0 ]; then
        echo "  -> 현대글로비스 완료"
    else
        echo "  -> 현대글로비스 실패 (exit code: $GLOVIS_STATUS)"
    fi
else
    echo ""
    echo "[2/3] 현대글로비스 스킵 (오늘은 경매일 아님)"
fi

# 3. 오토허브 크롤링 (수요일만)
if [ $DAY_OF_WEEK -eq 3 ]; then
    echo ""
    echo "[3/3] 오토허브 크롤링 시작 (경매일)..."
    node $SCRIPT_DIR/crawl-autohub-simple.mjs >> $LOG_DIR/crawl-$DATE.log 2>&1
    AUTOHUB_STATUS=$?

    if [ $AUTOHUB_STATUS -eq 0 ]; then
        echo "  -> 오토허브 완료"
    else
        echo "  -> 오토허브 실패 (exit code: $AUTOHUB_STATUS)"
    fi
else
    echo ""
    echo "[3/3] 오토허브 스킵 (오늘은 경매일 아님)"
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
