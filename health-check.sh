#!/bin/bash
# Compliance Radar - Health check script
# Usage: ./health-check.sh

echo "🏥 Checking Compliance Radar health..."

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2

    if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo "✓ $name : OK"
        return 0
    else
        echo "✗ $name : ERROR"
        return 1
    fi
}

all_healthy=true

echo ""
echo "📊 Docker Services:"
docker-compose ps

echo ""
echo "🔍 Testing endpoints:"

# Frontend
check_endpoint "Frontend" "http://localhost:3000" || all_healthy=false

# Backend Health
check_endpoint "Backend Health" "http://localhost:8000/health" || all_healthy=false

# Backend API Docs
check_endpoint "Backend API Docs" "http://localhost:8000/docs" || all_healthy=false

# Grafana
check_endpoint "Grafana" "http://localhost:3001" || all_healthy=false

# Prometheus
check_endpoint "Prometheus" "http://localhost:9090" || all_healthy=false

echo ""
echo "📦 Checking critical services:"

# PostgreSQL
if docker-compose exec -T postgres pg_isready -U complianceuser > /dev/null 2>&1; then
    echo "✓ PostgreSQL : OK"
else
    echo "✗ PostgreSQL : ERROR"
    all_healthy=false
fi

# Redis
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✓ Redis : OK"
else
    echo "✗ Redis : ERROR"
    all_healthy=false
fi

# Ollama
if check_endpoint "Ollama" "http://localhost:11434/api/tags"; then
    models=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "")
    if [ -n "$models" ]; then
        echo "  Models installed: $models"
    else
        echo "  ⚠️  No models installed. Run: docker-compose exec ollama ollama pull llama3.1:8b"
    fi
fi

echo ""
echo "💾 Resource usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
if [ "$all_healthy" = true ]; then
    echo "✅ All services are operational!"
    echo ""
    echo "🌐 Quick access:"
    echo "   Frontend:  http://localhost:3000"
    echo "   API:       http://localhost:8000/docs"
    echo "   Grafana:   http://localhost:3001"
else
    echo "⚠️  Some services have issues"
    echo "Check logs with: docker-compose logs -f <service>"
fi
