param(
  [string]$PostgresUser = "postgres",
  [string]$PsqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Chrono: configuración de PostgreSQL local ===" -ForegroundColor Cyan

if (-not (Test-Path $PsqlPath)) {
  Write-Host "No se encontró psql en: $PsqlPath" -ForegroundColor Red
  Write-Host "Ajusta -PsqlPath o instala PostgreSQL 17."
  exit 1
}

$password = $env:PGPASSWORD
if (-not $password) {
  $secure = Read-Host "Contraseña del usuario postgres" -AsSecureString
  $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  )
  $env:PGPASSWORD = $password
}

$sqlFile = Join-Path $PSScriptRoot "setup-db.sql"
& $PsqlPath -U $PostgresUser -h localhost -f $sqlFile

if ($LASTEXITCODE -ne 0) {
  Write-Host "Error al configurar la base de datos." -ForegroundColor Red
  exit $LASTEXITCODE
}

if (-not (Test-Path (Join-Path $root ".env"))) {
  Copy-Item (Join-Path $root ".env.example") (Join-Path $root ".env")
  Write-Host "Creado .env desde .env.example"
}

Write-Host ""
Write-Host "Listo. Base de datos 'chrono' configurada." -ForegroundColor Green
Write-Host "Siguiente paso: npm run dev:local" -ForegroundColor Yellow
