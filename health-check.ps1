# Compliance Radar - Script de vérification santé
# Usage: .\health-check.ps1

Write-Host "🏥 Vérification de la santé de Compliance Radar..." -ForegroundColor Cyan

# Fonction pour vérifier un endpoint HTTP
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $Name : OK" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ $Name : ERREUR" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n📊 Services Docker:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n🔍 Tests des endpoints:" -ForegroundColor Cyan

$allHealthy = $true

# Frontend
if (-not (Test-Endpoint "Frontend" "http://localhost:3000")) {
    $allHealthy = $false
}

# Backend Health
if (-not (Test-Endpoint "Backend Health" "http://localhost:8000/health")) {
    $allHealthy = $false
}

# Backend API Docs
if (-not (Test-Endpoint "Backend API Docs" "http://localhost:8000/docs")) {
    $allHealthy = $false
}

# Grafana
if (-not (Test-Endpoint "Grafana" "http://localhost:3001")) {
    $allHealthy = $false
}

# Prometheus
if (-not (Test-Endpoint "Prometheus" "http://localhost:9090")) {
    $allHealthy = $false
}

Write-Host "`n📦 Vérification des services critiques:" -ForegroundColor Cyan

# PostgreSQL
try {
    docker-compose exec -T postgres pg_isready -U complianceuser | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL : OK" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL : ERREUR" -ForegroundColor Red
        $allHealthy = $false
    }
} catch {
    Write-Host "✗ PostgreSQL : ERREUR" -ForegroundColor Red
    $allHealthy = $false
}

# Redis
try {
    $redisResult = docker-compose exec -T redis redis-cli ping
    if ($redisResult -match "PONG") {
        Write-Host "✓ Redis : OK" -ForegroundColor Green
    } else {
        Write-Host "✗ Redis : ERREUR" -ForegroundColor Red
        $allHealthy = $false
    }
} catch {
    Write-Host "✗ Redis : ERREUR" -ForegroundColor Red
    $allHealthy = $false
}

# Ollama
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Ollama : OK" -ForegroundColor Green
        $models = ($response.Content | ConvertFrom-Json).models
        if ($models -and $models.Count -gt 0) {
            Write-Host "  Modèles installés: $($models.name -join ', ')" -ForegroundColor Gray
        } else {
            Write-Host "  ⚠️  Aucun modèle installé. Exécutez: docker-compose exec ollama ollama pull llama3.1:8b" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ Ollama : ERREUR" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host "`n💾 Utilisation des ressources:" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

if ($allHealthy) {
    Write-Host "`n✅ Tous les services sont opérationnels!" -ForegroundColor Green
    Write-Host "`n🌐 Accès rapides:" -ForegroundColor Cyan
    Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "   API:       http://localhost:8000/docs" -ForegroundColor White
    Write-Host "   Grafana:   http://localhost:3001" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Certains services ont des problèmes" -ForegroundColor Yellow
    Write-Host "Consultez les logs avec: docker-compose logs -f <service>" -ForegroundColor White
}
