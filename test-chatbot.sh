#!/bin/bash

# Test Script untuk Chatbot Workflow
# Usage: ./test-chatbot.sh

WEBHOOK_URL="http://localhost:5678/webhook/whatsapp-chatbot"
CHAT_ID="6281380630988@c.us"

echo "=========================================="
echo "  Testing WhatsApp Chatbot Workflow"
echo "=========================================="
echo ""

# Function untuk test
test_intent() {
    local intent_name=$1
    local message=$2
    
    echo "🧪 Testing: $intent_name"
    echo "📝 Message: $message"
    echo "---"
    
    response=$(curl -s -X POST $WEBHOOK_URL \
        -H "Content-Type: application/json" \
        -d "{
            \"message\": {
                \"text\": \"$message\",
                \"from\": \"$CHAT_ID\"
            },
            \"from\": \"$CHAT_ID\",
            \"chatId\": \"$CHAT_ID\"
        }")
    
    echo "✅ Response received"
    echo "📄 Response: $response"
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Test cases
echo "Starting tests..."
echo ""

test_intent "Help Intent" "help"
test_intent "Lihat Stok Intent" "lihat stok"
test_intent "Laporan Penjualan Intent" "laporan penjualan"
test_intent "Laporan Inventory Intent" "laporan inventory"
test_intent "Chat AI Intent" "bagaimana penjualan hari ini?"
test_intent "Tambah Stok Intent" "tambah stok beras 10"

echo "=========================================="
echo "  Testing Completed!"
echo "=========================================="

