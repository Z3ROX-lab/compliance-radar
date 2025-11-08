# 📖 Compliance Radar - Commandes Utiles

Guide de référence rapide pour toutes les commandes essentielles.

## 🚀 Démarrage Rapide

### Windows (PowerShell)
```powershell
# Démarrer la plateforme
.\start.ps1

# Vérifier la santé
.\health-check.ps1

# Arrêter la plateforme
.\stop.ps1
```

### Linux / macOS (Bash)
```bash
# Démarrer la plateforme
./start.sh

# Vérifier la santé
./health-check.sh

# Arrêter la plateforme
./stop.sh
```

## 🐳 Commandes Docker Compose

### Gestion des Services

```bash
# Démarrer tous les services en arrière-plan
docker-compose up -d

# Démarrer avec rebuild (après modification du code)
docker-compose up -d --build

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart backend

# Redémarrer tous les services
docker-compose restart
```

### Voir les Logs

```bash
# Logs de tous les services (temps réel)
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Logs des dernières 100 lignes
docker-compose logs --tail=100

# Logs sans suivre (one-time)
docker-compose logs backend
```

### Status et Monitoring

```bash
# Voir l'état de tous les services
docker-compose ps

# Voir les stats en temps réel
docker stats

# Voir l'utilisation de l'espace
docker system df

# Inspecter un conteneur
docker inspect compliance-radar-backend-1
```

## 🔧 Accès aux Conteneurs

### Backend (FastAPI)

```bash
# Shell interactif
docker-compose exec backend bash

# Exécuter une commande Python
docker-compose exec backend python -c "print('Hello')"

# Lancer les migrations
docker-compose exec backend alembic upgrade head

# Initialiser les données de test
docker-compose exec backend python -m scripts.init_test_data
```

### Base de Données (PostgreSQL)

```bash
# Shell PostgreSQL
docker-compose exec postgres psql -U complianceuser -d compliance_db

# Lister les tables
docker-compose exec postgres psql -U complianceuser -d compliance_db -c "\dt"

# Exécuter une requête SQL
docker-compose exec postgres psql -U complianceuser -d compliance_db -c "SELECT COUNT(*) FROM environments;"

# Backup de la base
docker-compose exec postgres pg_dump -U complianceuser compliance_db > backup.sql

# Restore de la base
cat backup.sql | docker-compose exec -T postgres psql -U complianceuser compliance_db
```

### Redis

```bash
# Shell Redis CLI
docker-compose exec redis redis-cli

# Vérifier la connexion
docker-compose exec redis redis-cli ping

# Voir toutes les clés
docker-compose exec redis redis-cli keys '*'

# Vider le cache (⚠️ attention)
docker-compose exec redis redis-cli FLUSHALL
```

### Ollama (IA)

```bash
# Shell interactif
docker-compose exec ollama bash

# Lister les modèles installés
docker-compose exec ollama ollama list

# Télécharger Llama 3.1 8B (8GB)
docker-compose exec ollama ollama pull llama3.1:8b

# Télécharger un autre modèle
docker-compose exec ollama ollama pull mistral:7b

# Tester l'IA en ligne de commande
docker-compose exec ollama ollama run llama3.1:8b "Explain Kubernetes RBAC"

# Supprimer un modèle
docker-compose exec ollama ollama rm llama3.1:8b
```

## 📊 API et Tests

### Tester l'API

```bash
# Health check
curl http://localhost:8000/health

# Status système
curl http://localhost:8000/api/v1/status

# Lister les environnements
curl http://localhost:8000/api/v1/environments

# Créer un environnement
curl -X POST http://localhost:8000/api/v1/environments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test K8s","type":"kubernetes","description":"Test cluster"}'

# Lancer un scan
curl -X POST http://localhost:8000/api/v1/scans \
  -H "Content-Type: application/json" \
  -d '{"environment_id": 1}'

# Voir les résultats d'un scan
curl http://localhost:8000/api/v1/scans/1

# Demander à l'IA
curl -X POST http://localhost:8000/api/v1/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What are NIS2 requirements?"}'

# Générer une remediation
curl -X POST http://localhost:8000/api/v1/ai/remediation \
  -H "Content-Type: application/json" \
  -d '{"finding_id": 1}'
```

### Tests Automatisés

```bash
# Lancer les tests backend
docker-compose exec backend pytest

# Tests avec coverage
docker-compose exec backend pytest --cov=app

# Tests d'un module spécifique
docker-compose exec backend pytest tests/test_scanners.py

# Tests frontend
docker-compose exec frontend npm test
```

## 🎨 Frontend

```bash
# Shell frontend
docker-compose exec frontend sh

# Build de production
docker-compose exec frontend npm run build

# Linter
docker-compose exec frontend npm run lint

# Voir les logs frontend
docker-compose logs -f frontend
```

## 🔍 Debugging

### Voir les variables d'environnement

```bash
# Backend
docker-compose exec backend env | grep -E "DATABASE|REDIS|OLLAMA"

# Frontend
docker-compose exec frontend env | grep VITE
```

### Inspecter les réseaux

```bash
# Lister les réseaux
docker network ls

# Inspecter le réseau de Compliance Radar
docker network inspect compliance-radar_default

# Tester la connectivité entre services
docker-compose exec backend ping postgres
docker-compose exec backend curl http://ollama:11434/api/tags
```

### Vérifier les volumes

```bash
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect compliance-radar_postgres_data

# Voir l'espace utilisé
docker system df -v
```

## 🗄️ Base de Données

### Requêtes SQL Utiles

```sql
-- Connexion: docker-compose exec postgres psql -U complianceuser -d compliance_db

-- Voir tous les environnements
SELECT id, name, type, description FROM environments;

-- Voir tous les scans avec leur statut
SELECT a.id, e.name as environment, a.status, a.started_at, a.overall_score
FROM audits a
JOIN environments e ON a.environment_id = e.id
ORDER BY a.started_at DESC;

-- Compter les findings par sévérité
SELECT severity, COUNT(*) as count
FROM findings
GROUP BY severity
ORDER BY
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;

-- Voir les findings critiques
SELECT f.title, f.resource_id, f.scanner, a.id as scan_id
FROM findings f
JOIN audits a ON f.audit_id = a.id
WHERE f.severity = 'critical'
ORDER BY f.created_at DESC
LIMIT 10;

-- Statistiques globales
SELECT
  (SELECT COUNT(*) FROM environments) as total_environments,
  (SELECT COUNT(*) FROM audits) as total_scans,
  (SELECT COUNT(*) FROM findings) as total_findings,
  (SELECT COUNT(*) FROM findings WHERE severity = 'critical') as critical_findings;
```

## 🧹 Nettoyage et Maintenance

### Nettoyage Docker

```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune

# Supprimer les volumes non utilisés (⚠️ attention)
docker volume prune

# Nettoyage complet du système Docker
docker system prune -a --volumes
```

### Reset Complet

```bash
# ⚠️ ATTENTION: Cela supprime TOUTES les données

# Arrêter et tout supprimer
docker-compose down -v

# Supprimer les images
docker-compose down --rmi all

# Supprimer les répertoires de données locaux
rm -rf data/

# Redémarrer from scratch
./start.sh
docker-compose exec backend python -m scripts.init_test_data
```

## 📈 Monitoring et Metrics

### Prometheus

```bash
# Accès Web: http://localhost:9090

# Exemples de requêtes PromQL:

# Requêtes API par seconde
rate(compliance_api_requests_total[5m])

# Durée moyenne des scans
avg(compliance_scan_duration_seconds)

# Nombre de findings par sévérité
compliance_findings_total

# Score de conformité moyen
avg(compliance_score_gauge)
```

### Grafana

```bash
# Accès Web: http://localhost:3001
# Login: admin / admin

# Importer des dashboards
# Settings -> Data Sources -> Add Prometheus (http://prometheus:9090)
# Dashboards -> Import -> ID: 1860 (Node Exporter)
```

## 🎯 Scénarios Courants

### Développer une nouvelle fonctionnalité

```bash
# 1. Modifier le code (backend ou frontend)

# 2. Rebuild et redémarrer
docker-compose up -d --build backend

# 3. Voir les logs
docker-compose logs -f backend

# 4. Tester
curl http://localhost:8000/api/v1/your-new-endpoint
```

### Ajouter un nouveau scanner

```bash
# 1. Créer backend/app/scanners/your_scanner.py

# 2. Rebuild backend
docker-compose up -d --build backend

# 3. Tester le scanner
docker-compose exec backend python -c "
from app.scanners.your_scanner import YourScanner
scanner = YourScanner()
# Test code here
"
```

### Debug un problème

```bash
# 1. Voir les logs de tous les services
docker-compose logs -f

# 2. Identifier le service en erreur
docker-compose ps

# 3. Inspecter le service
docker-compose logs backend --tail=100

# 4. Entrer dans le conteneur
docker-compose exec backend bash

# 5. Vérifier la config
env | grep DATABASE

# 6. Tester la connectivité
ping postgres
curl http://ollama:11434/api/tags
```

## 📚 Ressources

- **Documentation Swagger**: http://localhost:8000/docs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

---

**💡 Tip**: Ajoutez ces commandes à vos favoris ou créez des alias dans votre shell !
