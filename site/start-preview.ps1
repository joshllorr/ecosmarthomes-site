$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$projectWranglerHome = Join-Path $PSScriptRoot '.wrangler-home'
New-Item -ItemType Directory -Force -Path $projectWranglerHome | Out-Null

$env:CLOUDFLARE_CF_FETCH_ENABLED = 'false'
$env:WRANGLER_HOME = $projectWranglerHome
$env:XDG_CONFIG_HOME = $projectWranglerHome

Write-Host 'Starting EcoSmartHomes preview with Node 22 + project-local Wrangler config...'
Write-Host "Project root: $PSScriptRoot"
Write-Host "Wrangler home: $projectWranglerHome"

npx -y node@22 ./node_modules/wrangler/bin/wrangler.js dev --port 8787 --log-level info
