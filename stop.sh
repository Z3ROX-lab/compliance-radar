#!/bin/bash
# Compliance Radar - Stop script for Linux/Mac
# Usage: ./stop.sh

echo "🛑 Stopping Compliance Radar..."

docker-compose down

if [ $? -eq 0 ]; then
    echo "✓ Services stopped successfully!"
    echo ""
    echo "💡 Data is preserved in Docker volumes"
    echo "To remove everything (including data): docker-compose down -v"
else
    echo "✗ Error stopping services"
    exit 1
fi
