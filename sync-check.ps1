# ================================
# EcoSmartHomes Deluxe Sync Module
# ================================

# Endpoints
$workerUrl = "https://ecosmarthomes-site.joehr4838.workers.dev/status"
$prodUrl   = "https://www.ecosmarthomes.ie/status"

# Log file (local)
$logPath = "$PSScriptRoot\sync-log.txt"

# Timestamp
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$workerJson = $null
$prodJson = $null

try {
    $workerRes = Invoke-WebRequest $workerUrl -UseBasicParsing -TimeoutSec 10
    $workerJson = $workerRes.Content
    Write-Host "[$timestamp] [OK] Cloudflare Worker Edge Status: ONLINE"
} catch {
    Write-Host "[$timestamp] [WARN] Cloudflare Worker Edge unreachable: $_"
}

try {
    $prodRes = Invoke-WebRequest $prodUrl -UseBasicParsing -TimeoutSec 10
    $prodJson = $prodRes.Content
    Write-Host "[$timestamp] [OK] Production Vercel Domain Status: ONLINE"
} catch {
    Write-Host "[$timestamp] [INFO] Production Domain DNS pending deployment"
}

# Compare if both are online
if ($workerJson -and $prodJson) {
    if ($workerJson -eq $prodJson) {
        $msg = "[$timestamp] [OK] Sync OK - Worker & Vercel match"
        Write-Host $msg
        Add-Content -Path $logPath -Value $msg
    } else {
        $msg = "[$timestamp] [WARN] Drift detected - Worker & Vercel differ"
        Write-Host $msg
        Add-Content -Path $logPath -Value $msg
    }
} elseif ($workerJson) {
    $msg = "[$timestamp] [OK] Cloudflare Worker Edge verified active"
    Add-Content -Path $logPath -Value $msg
}
