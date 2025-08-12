#!/bin/bash

# Script para verificar el estado de todos los servicios de EmoScan

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    print_step "Verificando $name (puerto $port)..."
    
    if lsof -ti:$port > /dev/null 2>&1; then
        if curl -s "$url" > /dev/null 2>&1; then
            echo "  🟢 $name está corriendo y responde correctamente"
            return 0
        else
            echo "  🟡 $name está corriendo pero no responde en $url"
            return 1
        fi
    else
        echo "  🔴 $name no está corriendo (puerto $port libre)"
        return 2
    fi
}

check_docker() {
    print_step "Verificando contenedores Docker..."
    
    if command -v docker >/dev/null 2>&1; then
        if docker ps --filter "name=postgres_container" --format "table {{.Names}}\t{{.Status}}" | grep -q "postgres_container"; then
            echo "  🟢 PostgreSQL container está corriendo"
            postgres_status=0
        else
            echo "  🔴 PostgreSQL container no está corriendo"
            postgres_status=1
        fi
        
        if docker ps --filter "name=pgadmin4_container" --format "table {{.Names}}\t{{.Status}}" | grep -q "pgadmin4_container"; then
            echo "  🟢 PgAdmin container está corriendo"
            pgadmin_status=0
        else
            echo "  🔴 PgAdmin container no está corriendo"
            pgadmin_status=1
        fi
    else
        echo "  🔴 Docker no está disponible"
        return 1
    fi
    
    return $((postgres_status + pgadmin_status))
}

print_status "🔍 Verificando estado de servicios de EmoScan..."
echo "$(date '+%Y-%m-%d %H:%M:%S')"
echo

# Verificamo cada servicio
emotion_status=0
backend_status=0
frontend_status=0
docker_status=0

check_service "Emotion Service" "8000" "http://localhost:8000/docs" || emotion_status=$?
check_service "Backend API" "4000" "http://localhost:4000/api/docs" || backend_status=$?
check_service "Frontend" "3000" "http://localhost:3000" || frontend_status=$?
check_docker || docker_status=$?

echo
print_status "📊 Resumen del estado:"
echo "┌─────────────────────────┬──────────────┬─────────────────────────────────┐"
echo "│ Servicio                │ Estado       │ URL                             │"
echo "├─────────────────────────┼──────────────┼─────────────────────────────────┤"

# Emotion Service
if [ $emotion_status -eq 0 ]; then
    echo "│ Emotion Service         │ 🟢 Activo    │ http://localhost:8000/docs      │"
elif [ $emotion_status -eq 1 ]; then
    echo "│ Emotion Service         │ 🟡 Problemas │ http://localhost:8000/docs      │"
else
    echo "│ Emotion Service         │ 🔴 Inactivo  │ http://localhost:8000/docs      │"
fi

# Backend
if [ $backend_status -eq 0 ]; then
    echo "│ Backend API             │ 🟢 Activo    │ http://localhost:4000/api/docs  │"
elif [ $backend_status -eq 1 ]; then
    echo "│ Backend API             │ 🟡 Problemas │ http://localhost:4000/api/docs  │"
else
    echo "│ Backend API             │ 🔴 Inactivo  │ http://localhost:4000/api/docs  │"
fi

# Frontend
if [ $frontend_status -eq 0 ]; then
    echo "│ Frontend                │ 🟢 Activo    │ http://localhost:3000           │"
elif [ $frontend_status -eq 1 ]; then
    echo "│ Frontend                │ 🟡 Problemas │ http://localhost:3000           │"
else
    echo "│ Frontend                │ 🔴 Inactivo  │ http://localhost:3000           │"
fi

# Docker
if [ $docker_status -eq 0 ]; then
    echo "│ Docker Services         │ 🟢 Activo    │ Postgres + PgAdmin              │"
else
    echo "│ Docker Services         │ 🔴 Inactivo  │ Postgres + PgAdmin              │"
fi

echo "└─────────────────────────┴──────────────┴─────────────────────────────────┘"