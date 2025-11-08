# Compliance Radar - Script de démarrage pour Windows
# Usage: .\start.ps1

Write-Host "🚀 Démarrage de Compliance Radar..." -ForegroundColor Green

# Vérifier que Docker est installé
Write-Host "`n📦 Vérification de Docker..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker installé: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Installez Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Vérifier que Docker Desktop est démarré
Write-Host "`n🐋 Vérification que Docker Desktop est démarré..." -ForegroundColor Cyan
try {
    docker ps | Out-Null
    Write-Host "✓ Docker Desktop est démarré" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Desktop n'est pas démarré" -ForegroundColor Red
    Write-Host "Démarrez Docker Desktop et relancez ce script" -ForegroundColor Yellow
    exit 1
}

# Créer les fichiers .env s'ils n'existent pas
Write-Host "`n⚙️  Configuration des fichiers d'environnement..." -ForegroundColor Cyan

if (-not (Test-Path "backend\.env")) {
    Write-Host "Création de backend\.env..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env" -ErrorAction SilentlyContinue
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "Création de frontend\.env..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env" -ErrorAction SilentlyContinue
}

Write-Host "✓ Fichiers de configuration prêts" -ForegroundColor Green

# Créer les répertoires nécessaires
Write-Host "`n📁 Création des répertoires..." -ForegroundColor Cyan
$directories = @("data/postgres", "data/minio", "data/redis", "data/grafana")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "✓ Répertoires créés" -ForegroundColor Green

# Démarrer les services
Write-Host "`n🐳 Démarrage des services Docker Compose..." -ForegroundColor Cyan
Write-Host "Cela peut prendre quelques minutes la première fois..." -ForegroundColor Yellow

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Services démarrés avec succès!" -ForegroundColor Green

    Write-Host "`n⏳ Attente que les services soient prêts (30 secondes)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30

    Write-Host "`n📊 Statut des services:" -ForegroundColor Cyan
    docker-compose ps

    Write-Host "`n✨ Compliance Radar est prêt!" -ForegroundColor Green
    Write-Host "`n🌐 Accès à la plateforme:" -ForegroundColor Cyan
    Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "   API:       http://localhost:8000/docs" -ForegroundColor White
    Write-Host "   Grafana:   http://localhost:3001 (admin/admin)" -ForegroundColor White

    Write-Host "`n🤖 Pour télécharger le modèle IA Llama 3.1:" -ForegroundColor Cyan
    Write-Host "   docker-compose exec ollama ollama pull llama3.1:8b" -ForegroundColor White

    Write-Host "`n📖 Consultez QUICKSTART.md pour plus d'informations" -ForegroundColor Yellow

    Write-Host "`n📝 Logs en temps réel:" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f" -ForegroundColor White

    Write-Host "`n🛑 Pour arrêter:" -ForegroundColor Cyan
    Write-Host "   .\stop.ps1 ou docker-compose down" -ForegroundColor White

} else {
    Write-Host "`n✗ Erreur lors du démarrage des services" -ForegroundColor Red
    Write-Host "Consultez les logs avec: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
