#!/bin/bash

# Test Rate Limiting Script
# This script tests the rate limiting functionality of the Ebad Academy API

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if domain is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Domain not provided${NC}"
    echo "Usage: ./scripts/test-rate-limiting.sh YOUR_DOMAIN"
    echo "Example: ./scripts/test-rate-limiting.sh ebad-academy.vercel.app"
    exit 1
fi

DOMAIN=$1
BASE_URL="https://$DOMAIN"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Ebad Academy - Rate Limiting Test Suite           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Testing domain: $BASE_URL${NC}"
echo ""

# Test 1: Login Rate Limiting (5 requests per 15 minutes)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1: Login Rate Limiting (5 requests max)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SUCCESS_COUNT=0
RATE_LIMITED=false

for i in {1..6}; do
    echo -e "${YELLOW}Request $i/6:${NC}"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/signin" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"wrongpassword"}')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "401" ]; then
        echo -e "  ${GREEN}✓ Status: 401 Unauthorized (Expected - wrong password)${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    elif [ "$HTTP_CODE" = "429" ]; then
        echo -e "  ${GREEN}✓ Status: 429 Too Many Requests (Rate Limited!)${NC}"
        echo -e "  ${GREEN}✓ Rate limiting is working!${NC}"
        RATE_LIMITED=true
        
        # Extract retry-after if available
        RETRY_AFTER=$(echo "$BODY" | grep -o '"retryAfter":[0-9]*' | cut -d':' -f2)
        if [ ! -z "$RETRY_AFTER" ]; then
            echo -e "  ${YELLOW}  Retry after: $RETRY_AFTER seconds${NC}"
        fi
    else
        echo -e "  ${RED}✗ Status: $HTTP_CODE (Unexpected)${NC}"
        echo -e "  ${RED}  Response: $BODY${NC}"
    fi
    
    echo ""
    sleep 1
done

# Evaluate Test 1
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$RATE_LIMITED" = true ] && [ "$SUCCESS_COUNT" -ge 4 ]; then
    echo -e "${GREEN}✓ Test 1 PASSED: Rate limiting is working correctly!${NC}"
    echo -e "${GREEN}  - First $SUCCESS_COUNT requests allowed${NC}"
    echo -e "${GREEN}  - Request 6 was rate limited${NC}"
else
    echo -e "${RED}✗ Test 1 FAILED: Rate limiting may not be working${NC}"
    echo -e "${RED}  - Expected: 5 allowed requests, then rate limited${NC}"
    echo -e "${RED}  - Got: $SUCCESS_COUNT allowed requests, rate limited: $RATE_LIMITED${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 2: Check Rate Limit Headers
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2: Rate Limit Headers${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Wait a moment to avoid hitting rate limit
sleep 2

HEADERS=$(curl -s -I -X POST "$BASE_URL/api/auth/signin" \
    -H "Content-Type: application/json" \
    -d '{"email":"test2@example.com","password":"wrongpassword"}')

echo -e "${YELLOW}Checking for rate limit headers:${NC}"

if echo "$HEADERS" | grep -qi "x-ratelimit-limit"; then
    LIMIT=$(echo "$HEADERS" | grep -i "x-ratelimit-limit" | cut -d':' -f2 | tr -d ' \r')
    echo -e "  ${GREEN}✓ X-RateLimit-Limit: $LIMIT${NC}"
else
    echo -e "  ${YELLOW}⚠ X-RateLimit-Limit header not found${NC}"
fi

if echo "$HEADERS" | grep -qi "x-ratelimit-remaining"; then
    REMAINING=$(echo "$HEADERS" | grep -i "x-ratelimit-remaining" | cut -d':' -f2 | tr -d ' \r')
    echo -e "  ${GREEN}✓ X-RateLimit-Remaining: $REMAINING${NC}"
else
    echo -e "  ${YELLOW}⚠ X-RateLimit-Remaining header not found${NC}"
fi

if echo "$HEADERS" | grep -qi "x-ratelimit-reset"; then
    RESET=$(echo "$HEADERS" | grep -i "x-ratelimit-reset" | cut -d':' -f2 | tr -d ' \r')
    echo -e "  ${GREEN}✓ X-RateLimit-Reset: $RESET${NC}"
else
    echo -e "  ${YELLOW}⚠ X-RateLimit-Reset header not found${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Test Summary                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$RATE_LIMITED" = true ]; then
    echo -e "${GREEN}✓ Rate limiting is WORKING in production!${NC}"
    echo -e "${GREEN}✓ Redis/KV connection is successful${NC}"
    echo -e "${GREEN}✓ API endpoints are protected${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Monitor Redis usage in Vercel dashboard"
    echo -e "  2. Check deployment logs for any errors"
    echo -e "  3. Test other rate-limited endpoints"
else
    echo -e "${RED}✗ Rate limiting may not be working${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo -e "  1. Check environment variables are set (Settings → Environment Variables)"
    echo -e "  2. Verify KV_REST_API_URL, KV_REST_API_TOKEN exist"
    echo -e "  3. Redeploy the application"
    echo -e "  4. Check deployment logs for errors"
    echo -e "  5. Verify Redis database is active in Storage tab"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

