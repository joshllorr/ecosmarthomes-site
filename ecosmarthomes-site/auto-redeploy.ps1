# ==========================================
# EcoSmartHomes Auto-Redeploy Module
# ==========================================

# Candidate Endpoints
$workerUrls = @(
    "https://ecosmarthomes-site.joehr4838.workers.dev/status",
    "https://ecosmarthomes-site.joshllorr.workers.dev/status"
)
$prodUrl   = "https://www.ecosmarthomes.ie/status"

# Vercel Deploy Hook (replace with your actual hook URL or set $env:VERCEL_DEPLOY_HOOK)
$vercelHook = if ($env:VERCEL_DEPLOY_HOOK) { $env:VERCEL_DEPLOY_HOOK } else { "https://api.vercel.com/v1/integrations/deploy/prj_xxxxxxx/xxxxx" }

# Log file
$logPath = "$PSScriptRoot\auto-redeploy-log.txt"

# Timestamp
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

function Get-StatusJson($url) {
    try {
        $raw = (Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 10).Content
        return $raw, ($raw | ConvertFrom-Json)
    } catch {
        return $null, $null
    }
}

function Get-WorkerStatusJson {
    foreach ($url in $workerUrls) {
        $raw, $obj = Get-StatusJson $url
        if ($obj) { return $raw, $obj }
    }
    return $null, $null
}

# Fetch both status endpoints
$workerRaw, $worker = Get-WorkerStatusJson
$prodRaw,   $prod   = Get-StatusJson $prodUrl

if (-not $worker) {
    $msg = "[$timestamp] [WARN] Cloudflare Worker Edge unreachable"
    Write-Host $msg
    Add-Content -Path $logPath -Value $msg
    return
}

if (-not $prod) {
    $msg = "[$timestamp] [INFO] Production Vercel Domain DNS pending deployment"
    Write-Host $msg
    Add-Content -Path $logPath -Value $msg
    return
}

# Compare JSON
if ($workerRaw -eq $prodRaw) {
    $msg = "[$timestamp] [OK] No drift - Worker and Vercel in sync"
    Write-Host $msg
    Add-Content -Path $logPath -Value $msg
    return
}

# Drift detected — trigger Vercel redeploy
$msg = "[$timestamp] [WARN] Drift detected - triggering Vercel redeploy..."
Write-Host $msg
Add-Content -Path $logPath -Value $msg

if ($vercelHook -like "*prj_xxxxxxx*") {
    $msgHook = "[$timestamp] [INFO] Set VERCEL_DEPLOY_HOOK to enable automated webhooks"
    Write-Host $msgHook
    Add-Content -Path $logPath -Value $msgHook
    return
}

try {
    Invoke-WebRequest -Uri $vercelHook -Method Post -UseBasicParsing | Out-Null
    $msg2 = "[$timestamp] [OK] Vercel redeploy triggered successfully"
    Write-Host $msg2
    Add-Content -Path $logPath -Value $msg2
} catch {
    $msg3 = "[$timestamp] [FAIL] Failed to trigger Vercel redeploy"
    Write-Host $msg3
    Add-Content -Path $logPath -Value $msg3
}
