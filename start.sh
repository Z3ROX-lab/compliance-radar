#!/bin/bash
# Compliance Radar - Startup script for Linux/Mac
# Usage: ./start.sh

set -e

echo "🚀 Starting Compliance Radar..."

# Check if Docker is installed
echo ""
echo "📦 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed"
    echo "Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo "✓ Docker installed: $DOCKER_VERSION"

# Check if Docker is running
echo ""
echo "🐋 Checking if Docker is running..."
if ! docker ps &> /dev/null; then
    echo "✗ Docker is not running"
    echo "Start Docker and run this script again"
    exit 1
fi
echo "✓ Docker is running"

# Create .env files if they don't exist
echo ""
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cp backend/.env.example backend/.env 2>/dev/null || true
fi

if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env..."
    cp frontend/.env.example frontend/.env 2>/dev/null || true
fi

echo "✓ Configuration files ready"

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p data/postgres data/minio data/redis data/grafana
echo "✓ Directories created"

# Start services
echo ""
echo "🐳 Starting Docker Compose services..."
echo "This may take a few minutes on first run..."

docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Services started successfully!"

    echo ""
    echo "⏳ Waiting for services to be ready (30 seconds)..."
    sleep 30

    echo ""
    echo "📊 Service status:"
    docker-compose ps

    echo ""
    echo "✨ Compliance Radar is ready!"
    echo ""
    echo "🌐 Access the platform:"
    echo "   Frontend:  http://localhost:3000"
    echo "   API:       http://localhost:8000/docs"
    echo "   Grafana:   http://localhost:3001 (admin/admin)"

    echo ""
    echo "🤖 To download Llama 3.1 AI model:"
    echo "   docker-compose exec ollama ollama pull llama3.1:8b"

    echo ""
    echo "📖 See QUICKSTART.md for more information"

    echo ""
    echo "📝 View logs in real-time:"
    echo "   docker-compose logs -f"

    echo ""
    echo "🛑 To stop:"
    echo "   ./stop.sh or docker-compose down"

else
    echo ""
    echo "✗ Error starting services"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
