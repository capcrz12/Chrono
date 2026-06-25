$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Chrono: desarrollo local (sin Docker) ===" -ForegroundColor Cyan
Set-Location $root

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Creado .env desde .env.example"
}

Write-Host "Compilando paquete shared..."
npm run shared:build

Write-Host ""
Write-Host "Iniciando servicios en ventanas separadas..." -ForegroundColor Yellow
Write-Host "  - API:    http://localhost:3000"
Write-Host "  - Swagger http://localhost:3000/api/docs"
Write-Host "  - Expo:   http://localhost:8081"
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run api:dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run worker:dev"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npm run mobile:dev"

Write-Host "Servicios iniciados. Cierra las ventanas de PowerShell para detenerlos." -ForegroundColor Green
