# Compliance Radar - Script d'arrêt pour Windows
# Usage: .\stop.ps1

Write-Host "🛑 Arrêt de Compliance Radar..." -ForegroundColor Yellow

# Arrêter les services
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Services arrêtés avec succès!" -ForegroundColor Green
    Write-Host "`n💡 Les données sont conservées dans les volumes Docker" -ForegroundColor Cyan
    Write-Host "Pour tout supprimer (y compris les données): docker-compose down -v" -ForegroundColor Yellow
} else {
    Write-Host "✗ Erreur lors de l'arrêt des services" -ForegroundColor Red
    exit 1
}
