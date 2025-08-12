#!/bin/bash

# Script para levantar todos los servicios de desarrollo de EmoScan

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificamos que estamos en el directorio correcto
if [ ! -d "emotion-service" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "No estás en el directorio raíz del proyecto emoscan"
    print_error "Asegúrate de ejecutar este script desde la carpeta que contiene: emotion-service, backend, frontend"
    exit 1
fi

print_status "🚀 Iniciando servicios de desarrollo de EmoScan..."

# Función para limpiar procesos al salir
cleanup() {
    print_warning "🛑 Deteniendo todos los servicios..."
    
    if lsof -ti:8000 > /dev/null 2>&1; then
        print_step "Cerrando emotion-service (puerto 8000)"
        kill $(lsof -ti:8000) 2>/dev/null || true
    fi
    
    if lsof -ti:4000 > /dev/null 2>&1; then
        print_step "Cerrando backend (puerto 4000)"
        kill $(lsof -ti:4000) 2>/dev/null || true
    fi
    
    if lsof -ti:3000 > /dev/null 2>&1; then
        print_step "Cerrando frontend (puerto 3000)"
        kill $(lsof -ti:3000) 2>/dev/null || true
    fi
    
    print_step "Bajando contenedores Docker..."
    cd backend && docker compose down > /dev/null 2>&1 || true
    cd ..
    
    print_status "✅ Todos los servicios han sido detenidos correctamente"
    exit 0
}

# Configurar trap para limpiar al salir
trap cleanup SIGINT SIGTERM EXIT

# 1. Iniciar emotion-service
print_step "1️⃣ Iniciando emotion-service..."
cd emotion-service

if [ ! -d "venv" ]; then
    print_error "No se encontró el entorno virtual en emotion-service/venv"
    print_error "Crea primero el entorno virtual con: python -m venv venv"
    exit 1
fi

if [ ! -f "venv/pyvenv.cfg" ]; then
    print_error "El entorno virtual parece estar corrupto"
    exit 1
fi

print_status "Activando entorno virtual y iniciando emotion-service..."
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
EMOTION_SERVICE_PID=$!

sleep 3
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_warning "Emotion-service puede tardar un poco en estar listo..."
fi

cd ..

# 2. Iniciar backend
print_step "2️⃣ Iniciando backend (Docker + Node.js)..."
cd backend

print_status "Levantando contenedores Docker..."
docker compose up -d

print_status "Esperando a que la base de datos esté lista..."
sleep 5

print_status "Iniciando servidor Node.js..."
npm run dev &
BACKEND_PID=$!

cd ..

# 3. Iniciar frontend
print_step "3️⃣ Iniciando frontend..."
cd frontend

print_status "Iniciando Next.js..."
npm run dev &
FRONTEND_PID=$!

cd ..

# Mantener el script corriendo hasta que se presione Ctrl+C
wait