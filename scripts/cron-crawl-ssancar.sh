#!/bin/bash
# SSANCAR 크롤링 자동화 스크립트
# 매일 오전 10:30 실행
# - 경매 차량: 상세 페이지 포함 크롤링
# - 일반 차량: 목록만 크롤링 (상세 페이지 제외)

SCRIPT_DIR="/var/www/Jungcar/scripts"
LOG_DIR="/var/www/Jungcar/logs"
DATE=$(date '+%Y-%m-%d_%H%M%S')
LOG_FILE="${LOG_DIR}/crawl-ssancar-${DATE}.log"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

echo "======================================" >> "$LOG_FILE"
echo "SSANCAR 크롤링 시작: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "======================================" >> "$LOG_FILE"

# 1. 경매 차량 크롤링 (상세 페이지 포함)
echo "" >> "$LOG_FILE"
echo "[1] 경매 차량 크롤링 (상세 페이지 포함)..." >> "$LOG_FILE"
cd "$SCRIPT_DIR"
node crawl-ssancar-auction-detail.mjs >> "$LOG_FILE" 2>&1
AUCTION_STATUS=$?

if [ $AUCTION_STATUS -eq 0 ]; then
    echo "[1] 경매 차량 크롤링 완료 ✓" >> "$LOG_FILE"
else
    echo "[1] 경매 차량 크롤링 실패 (exit code: $AUCTION_STATUS)" >> "$LOG_FILE"
fi

# 2. 일반 차량 크롤링 (목록만, 상세 제외)
echo "" >> "$LOG_FILE"
echo "[2] 일반 차량 크롤링 (목록만)..." >> "$LOG_FILE"
node crawl-ssancar-stock-full.mjs >> "$LOG_FILE" 2>&1
STOCK_STATUS=$?

if [ $STOCK_STATUS -eq 0 ]; then
    echo "[2] 일반 차량 크롤링 완료 ✓" >> "$LOG_FILE"
else
    echo "[2] 일반 차량 크롤링 실패 (exit code: $STOCK_STATUS)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "======================================" >> "$LOG_FILE"
echo "SSANCAR 크롤링 종료: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "======================================" >> "$LOG_FILE"

# 오래된 로그 삭제 (30일 이상)
find "$LOG_DIR" -name "crawl-ssancar-*.log" -mtime +30 -delete 2>/dev/null
