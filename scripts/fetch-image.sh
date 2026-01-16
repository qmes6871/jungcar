#!/bin/bash

# Unsplash Image Fetcher
# Usage: ./fetch-image.sh <search_query> [output_filename]

UNSPLASH_ACCESS_KEY="N_6ZSDULJ4987zNR0U05StNecsTxFeUbo1-2b6j7jAI"
API_URL="https://api.unsplash.com/photos/random"

# Check if search query is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <search_query> [output_filename]"
    echo "Example: $0 'mountain landscape' mountain.jpg"
    exit 1
fi

SEARCH_QUERY="$1"
OUTPUT_FILE="${2:-image_$(date +%Y%m%d_%H%M%S).jpg}"

echo "Searching for: $SEARCH_QUERY"

# Fetch random image URL from Unsplash API
RESPONSE=$(curl -s -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY" \
    "$API_URL?query=$(echo "$SEARCH_QUERY" | sed 's/ /%20/g')")

# Check if API call was successful
if echo "$RESPONSE" | grep -q '"errors"'; then
    echo "Error: $(echo "$RESPONSE" | grep -o '"errors":\[[^]]*\]')"
    exit 1
fi

# Extract image URL (full size)
IMAGE_URL=$(echo "$RESPONSE" | grep -o '"full":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$IMAGE_URL" ]; then
    echo "Error: Could not find image URL in response"
    exit 1
fi

echo "Downloading image..."

# Download the image
curl -s -L -o "$OUTPUT_FILE" "$IMAGE_URL"

if [ $? -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
    echo "Image saved to: $OUTPUT_FILE"
    echo "Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
else
    echo "Error: Failed to download image"
    exit 1
fi
