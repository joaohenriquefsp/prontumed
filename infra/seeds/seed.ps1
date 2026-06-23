# seed.ps1 — Popula os bancos de dados do ProntuMed com dados de desenvolvimento
# Executa os arquivos SQL diretamente nos containers Docker via docker exec
#
# Pré-requisitos: docker compose up -d (infra rodando) + migrações aplicadas
#
# Uso: .\infra\seeds\seed.ps1

$ErrorActionPreference = "Stop"
$seedDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Run-Seed {
  param(
    [string]$Container,
    [string]$Database,
    [string]$SqlFile
  )
  $filename = Split-Path -Leaf $SqlFile
  Write-Host "  -> $filename em $Database..." -NoNewline
  Get-Content $SqlFile -Raw | docker exec -i $Container psql -U clinicos -d $Database -v ON_ERROR_STOP=1 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host " ERRO" -ForegroundColor Red
    throw "Falha ao aplicar $filename"
  }
  Write-Host " OK" -ForegroundColor Green
}

Write-Host ""
Write-Host "ProntuMed — Seeds de desenvolvimento" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Container names conforme docker-compose.yml
$containers = @("postgres-identity", "postgres-patients", "postgres-appointments")
foreach ($c in $containers) {
  $status = docker inspect -f '{{.State.Running}}' $c 2>$null
  if ($status -ne "true") {
    Write-Host "Container $c nao esta rodando. Execute 'docker compose up -d' primeiro." -ForegroundColor Red
    exit 1
  }
}

Write-Host "[1/3] Usuarios (db_identity)..."
Run-Seed -Container "postgres-identity" -Database "db_identity" `
         -SqlFile "$seedDir\01-identity-seed.sql"

Write-Host "[2/3] Pacientes (db_patients)..."
Run-Seed -Container "postgres-patients" -Database "db_patients" `
         -SqlFile "$seedDir\02-patients-seed.sql"

Write-Host "[3/3] Grade e consultas (db_appointments)..."
Run-Seed -Container "postgres-appointments" -Database "db_appointments" `
         -SqlFile "$seedDir\03-appointments-seed.sql"

Write-Host ""
Write-Host "Seeds aplicados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciais de acesso ao portal:" -ForegroundColor Yellow
Write-Host "  Admin:        admin@prontumed.com    / Prontumed@123"
Write-Host "  Dr. Lucas:    lucas@prontumed.com    / Prontumed@123"
Write-Host "  Dra. Marina:  marina@prontumed.com   / Prontumed@123"
Write-Host "  Dr. Rafael:   rafael@prontumed.com   / Prontumed@123"
Write-Host "  Recep. Ana:   ana@prontumed.com      / Prontumed@123"
Write-Host "  Paciente:     fernanda@prontumed.com / Prontumed@123"
Write-Host ""
