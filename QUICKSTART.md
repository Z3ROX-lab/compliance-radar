# 🚀 Quick Start - Compliance Radar sur Windows 11

Guide complet pour démarrer Compliance Radar sur votre PC Windows 11 en moins de 10 minutes !

## 📋 Prérequis

### 1. Docker Desktop pour Windows
```powershell
# Télécharger et installer Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Vérifier l'installation
docker --version
docker-compose --version
```

**Configuration Docker Desktop recommandée:**
- RAM: 8 GB minimum (16 GB recommandé)
- CPU: 4 cores minimum
- Disk: 50 GB minimum
- WSL 2 activé (recommandé pour les performances)

### 2. Git (optionnel, si vous clonez depuis GitHub)
```powershell
git --version
```

## 🎯 Démarrage Rapide (3 étapes)

### Étape 1: Préparer l'environnement

Ouvrez PowerShell ou Windows Terminal dans le dossier du projet:

```powershell
cd compliance-radar

# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Étape 2: Démarrer tous les services

```powershell
# Démarrer l'infrastructure complète (15 services)
docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f
```

**Services démarrés:**
- ✅ Frontend React (http://localhost:3000)
- ✅ Backend FastAPI (http://localhost:8000)
- ✅ PostgreSQL + TimescaleDB
- ✅ Redis (cache & queue)
- ✅ Celery Worker (tâches async)
- ✅ Ollama (IA locale - Llama 3.1)
- ✅ LocalStack (AWS simulator)
- ✅ MinIO (S3 storage)
- ✅ Prometheus + Grafana (monitoring)
- ✅ Azurite (Azure simulator)

### Étape 3: Accéder à l'interface

Attendez ~2 minutes que tous les services démarrent, puis:

**🎨 Interface Web:**
```
http://localhost:3000
```

**📡 API Backend:**
```
http://localhost:8000/docs    # Documentation Swagger interactive
http://localhost:8000/health  # Health check
```

**📊 Monitoring Grafana:**
```
http://localhost:3001
User: admin
Password: admin
```

## 🧪 Tester la plateforme

### 1. Vérifier que tout fonctionne

```powershell
# Vérifier le statut des services
docker-compose ps

# Tous les services doivent être "Up" (healthy)
```

### 2. Initialiser les données de test

```powershell
# Créer les environnements de test
docker-compose exec backend python -m scripts.init_test_data

# Créer des ressources AWS vulnérables dans LocalStack
docker-compose exec localstack /docker-entrypoint-initaws.d/init-aws-test-resources.sh
```

### 3. Lancer votre premier scan

**Option A: Via l'interface Web** (recommandé)
1. Ouvrir http://localhost:3000
2. Cliquer sur "New Scan"
3. Sélectionner un environnement
4. Voir les résultats en temps réel !

**Option B: Via l'API**
```powershell
# Créer un environnement
curl -X POST http://localhost:8000/api/v1/environments `
  -H "Content-Type: application/json" `
  -d '{"name":"Test AWS","type":"aws","description":"LocalStack test environment"}'

# Lancer un scan (remplacer <env_id> par l'ID reçu)
curl -X POST http://localhost:8000/api/v1/scans `
  -H "Content-Type: application/json" `
  -d '{"environment_id": 1}'
```

## 🤖 Activer l'IA (Ollama + Llama 3.1)

### 1. Télécharger le modèle Llama 3.1

```powershell
# Entrer dans le conteneur Ollama
docker-compose exec ollama bash

# Télécharger le modèle (8GB)
ollama pull llama3.1:8b

# Vérifier que le modèle est installé
ollama list

# Sortir du conteneur
exit
```

**Temps de téléchargement:** ~5-10 minutes selon votre connexion

### 2. Tester l'IA

**Via l'interface Web:**
1. Cliquer sur l'icône AI Assistant (baguette magique) dans la barre de navigation
2. Poser une question: "Quelles sont les exigences critiques de NIS2?"
3. L'IA répond avec le contexte de vos scans !

**Via l'API:**
```powershell
curl -X POST http://localhost:8000/api/v1/ai/ask `
  -H "Content-Type: application/json" `
  -d '{"question":"Comment corriger les buckets S3 publics?"}'
```

## 🔍 Exploration de la plateforme

### Dashboard Principal
- **Metrics Cards**: Score global, findings critiques, scans actifs
- **Compliance Trend**: Évolution des scores NIS2, ISO 27001, DORA, RGPD
- **Findings by Resource**: Top des ressources vulnérables
- **AI Insights**: Recommandations intelligentes

### Scans
- **Liste des scans**: Filtrer par statut, environnement
- **Créer un scan**: Sélectionner l'environnement, lancer
- **Détails du scan**: Voir tous les findings avec filtres

### Scan Details
- **Compliance Scores**: Scores par régulation
- **Findings**: Liste complète avec accordéons
- **AI Auto-Fix**: Générer du code Terraform/Helm pour corriger
- **Remediation**: Copier le code et appliquer

### AI Assistant
- **Questions libres**: "Expliquez RBAC dans Kubernetes"
- **Analyse de findings**: "Comment corriger cette vulnérabilité?"
- **Plans de remediation**: "Générez un plan pour passer à 90% NIS2"

## 📊 Monitoring

### Grafana Dashboards

Accédez à http://localhost:3001 (admin/admin)

**Dashboards disponibles:**
- Compliance Radar Overview
- API Performance
- Database Metrics
- Celery Tasks
- System Resources

### Prometheus Metrics

Accédez à http://localhost:9090

**Métriques disponibles:**
- `compliance_scan_duration_seconds`
- `compliance_findings_total`
- `compliance_api_requests_total`
- `compliance_score_gauge`

## 🛠️ Commandes Utiles

### Gestion des services

```powershell
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f backend

# Voir les logs de tous les services
docker-compose logs -f

# Reconstruire les images après modification du code
docker-compose up -d --build

# Voir l'utilisation des ressources
docker stats
```

### Accès aux conteneurs

```powershell
# Accéder au backend
docker-compose exec backend bash

# Accéder à la base de données
docker-compose exec postgres psql -U complianceuser -d compliance_db

# Accéder à Redis
docker-compose exec redis redis-cli

# Accéder à Ollama
docker-compose exec ollama bash
```

### Nettoyage

```powershell
# Arrêter et supprimer tous les conteneurs
docker-compose down

# Supprimer aussi les volumes (ATTENTION: perte de données)
docker-compose down -v

# Nettoyer les images Docker non utilisées
docker system prune -a
```

## 🐛 Troubleshooting

### Problème: Les services ne démarrent pas

```powershell
# Vérifier Docker Desktop
# Assurez-vous que Docker Desktop est démarré

# Vérifier les ports disponibles
netstat -ano | findstr "3000 8000 5432 6379"

# Si un port est occupé, arrêter le processus ou modifier docker-compose.yml
```

### Problème: Frontend ne se connecte pas au Backend

```powershell
# Vérifier que le backend est accessible
curl http://localhost:8000/health

# Vérifier les logs du frontend
docker-compose logs frontend

# Reconstruire le frontend
docker-compose up -d --build frontend
```

### Problème: Ollama ne télécharge pas le modèle

```powershell
# Vérifier l'espace disque
docker system df

# Télécharger manuellement
docker-compose exec ollama ollama pull llama3.1:8b

# Si ça échoue, vérifier les logs
docker-compose logs ollama
```

### Problème: Base de données ne démarre pas

```powershell
# Vérifier les logs
docker-compose logs postgres

# Réinitialiser la base (ATTENTION: perte de données)
docker-compose down -v
docker volume rm compliance-radar_postgres_data
docker-compose up -d postgres
```

### Problème: Manque de mémoire RAM

```powershell
# Augmenter la RAM allouée à Docker Desktop
# Settings -> Resources -> Memory: 8GB minimum

# Ou désactiver certains services optionnels
docker-compose up -d frontend backend postgres redis celery-worker
```

## 🎯 Prochaines Étapes

### 1. Configurer vos propres environnements

- **Kubernetes**: Configurer kubeconfig pour votre cluster
- **AWS**: Ajouter vos credentials AWS (ou utiliser LocalStack)
- **Azure/GCP**: Configurer les service principals

### 2. Personnaliser les scanners

Modifiez `backend/app/scanners/` pour:
- Ajouter de nouveaux checks
- Personnaliser les mappings de régulations
- Créer vos propres règles de compliance

### 3. Étendre l'IA

- Entraîner le modèle sur vos données
- Ajouter des documents de compliance dans ChromaDB
- Créer des prompts personnalisés

### 4. Déployer en production

Consultez `DEPLOYMENT.md` pour:
- Configuration SSL/TLS
- Authentification/autorisation
- Scaling horizontal
- Backup et disaster recovery

## 📚 Documentation Complète

- **README.md**: Vue d'ensemble du projet
- **ARCHITECTURE.md**: Architecture technique détaillée
- **GETTING_STARTED.md**: Guide complet pour développeurs
- **API Documentation**: http://localhost:8000/docs

## 💬 Support

- **GitHub Issues**: https://github.com/Z3ROX-lab/compliance-radar/issues
- **Documentation**: Consultez les fichiers .md dans le repo

## 🎉 Félicitations !

Vous avez maintenant une plateforme de compliance multi-cloud complète qui tourne sur votre PC !

**Prochaines étapes recommandées:**
1. ✅ Créer votre premier environnement
2. ✅ Lancer votre premier scan
3. ✅ Tester l'AI Assistant
4. ✅ Générer une remediation automatique
5. ✅ Explorer les dashboards Grafana

**Besoin d'aide ?** Consultez la documentation ou créez une issue sur GitHub !

---

*Compliance Radar - The Revolutionary Open-Source Multi-Cloud Compliance Platform* 🚀
