# Test Script untuk Chatbot Workflow (PowerShell)
# Usage: .\test-chatbot.ps1

$WEBHOOK_URL = "http://localhost:5678/webhook/whatsapp-chatbot"
$CHAT_ID = "6281380630988@c.us"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Testing WhatsApp Chatbot Workflow" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function untuk test
function Test-Intent {
    param(
        [string]$IntentName,
        [string]$Message
    )
    
    Write-Host "🧪 Testing: $IntentName" -ForegroundColor Yellow
    Write-Host "📝 Message: $Message" -ForegroundColor Gray
    Write-Host "---"
    
    $body = @{
        message = @{
            text = $Message
            from = $CHAT_ID
        }
        from = $CHAT_ID
        chatId = $CHAT_ID
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $WEBHOOK_URL -Method Post -Body $body -ContentType "application/json"
        Write-Host "✅ Response received" -ForegroundColor Green
        Write-Host "📄 Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
}

# Test cases
Write-Host "Starting tests..." -ForegroundColor Cyan
Write-Host ""

Test-Intent -IntentName "Help Intent" -Message "help"
Test-Intent -IntentName "Lihat Stok Intent" -Message "lihat stok"
Test-Intent -IntentName "Laporan Penjualan Intent" -Message "laporan penjualan"
Test-Intent -IntentName "Laporan Inventory Intent" -Message "laporan inventory"
Test-Intent -IntentName "Chat AI Intent" -Message "bagaimana penjualan hari ini?"
Test-Intent -IntentName "Tambah Stok Intent" -Message "tambah stok beras 10"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Testing Completed!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

