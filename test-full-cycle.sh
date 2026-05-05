#!/bin/bash
# Full MVP Cycle Test (using deployed backend)

BACKEND="http://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io"
PROJECT_ID="28ada9a2-6a05-4847-8aba-d51bcec3f4b6"
TRACKING_NUMBER_ID="f94ec95c-7af2-427f-bf0c-ca535fff7c5d"

echo "=== MVP Full Cycle Test ==="
echo ""

# Test 1: Health Check
echo "1. Testing health endpoint..."
HEALTH=$(curl -s "${BACKEND}/health")
echo "   Response: $HEALTH"
if echo "$HEALTH" | grep -q '"ok":true'; then
  echo "   ✅ Backend is healthy"
else
  echo "   ❌ Backend health check failed"
  exit 1
fi

# Test 2: Assign Number
echo ""
echo "2. Testing /assign-number..."
ASSIGN=$(curl -s -X POST "${BACKEND}/assign-number" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"${PROJECT_ID}\",\"sessionId\":\"test-session-$(date +%s)\",\"ymUid\":\"ym-test-001\",\"landingUrl\":\"https://example.com\",\"referrer\":\"https://google.com\",\"utmSource\":\"google\",\"utmMedium\":\"cpc\",\"utmCampaign\":\"test-campaign\"}")

echo "   Response: $ASSIGN"
VISIT_ID=$(echo "$ASSIGN" | grep -o '"visitId":"[^"]*"' | cut -d'"' -f4)
echo "   Visit ID: $VISIT_ID"

if [ -z "$VISIT_ID" ]; then
  echo "   ❌ Failed to assign number"
  exit 1
else
  echo "   ✅ Number assigned successfully"
fi

# Test 3: Call Webhook
echo ""
echo "3. Testing /call-webhook..."
WEBHOOK=$(curl -s -X POST "${BACKEND}/call-webhook" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"${PROJECT_ID}\",\"trackingNumberId\":\"${TRACKING_NUMBER_ID}\",\"visitId\":\"${VISIT_ID}\",\"clientPhone\":\"+79007654321\",\"calledAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"callStatus\":\"completed\",\"durationSeconds\":120}")

echo "   Response: $WEBHOOK"
if echo "$WEBHOOK" | grep -q '"attributed":true'; then
  echo "   ✅ Call attributed successfully"
else
  echo "   ❌ Call attribution failed"
fi

echo ""
echo "=== Test Complete ==="
echo "Full MVP cycle is working! ✅"
