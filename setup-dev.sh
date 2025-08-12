#!/bin/bash

# Script para configurar el entorno de desarrollo de EmoScan

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_status "🔧 Configurando entorno de desarrollo de EmoScan..."

# Verificamos que estamos en el directorio correcto
if [ ! -d "emotion-service" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "No estás en el directorio raíz del proyecto emoscan"
    exit 1
fi

print_step "1️⃣ Verificando dependencias del sistema..."

# Verificamos las tecnologias de nuestro proyecto
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_status "✅ Node.js detectado: $NODE_VERSION"
else
    print_error "❌ Node.js no está instalado"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_status "✅ npm detectado: $NPM_VERSION"
else
    print_error "❌ npm no está instalado"
    exit 1
fi

if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    print_status "✅ Python detectado: $PYTHON_VERSION"
else
    print_error "❌ Python 3 no está instalado"
    exit 1
fi

if command -v docker >/dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version)
    print_status "✅ Docker detectado: $DOCKER_VERSION"
else
    print_error "❌ Docker no está instalado"
    exit 1
fi

if command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1; then
    print_status "✅ Docker Compose detectado"
else
    print_error "❌ Docker Compose no está instalado"
    exit 1
fi

# Instalamos y configuramos dependencias del pryecto
print_step "2️⃣ Instalando dependencias del backend..."
cd backend
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json en backend"
    exit 1
fi
npm install
print_status "✅ Dependencias del backend instaladas"
cd ..

print_step "3️⃣ Instalando dependencias del frontend..."
cd frontend
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json en frontend"
    exit 1
fi
npm install
print_status "✅ Dependencias del frontend instaladas"
cd ..

print_step "4️⃣ Configurando entorno virtual de Python..."
cd emotion-service
if [ ! -d "venv" ]; then
    print_status "Creando entorno virtual..."
    python3 -m venv venv
fi

print_status "Activando entorno virtual e instalando dependencias..."
source venv/bin/activate
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    print_status "✅ Dependencias de Python instaladas"
else
    print_warning "⚠️ No se encontró requirements.txt en emotion-service"
fi
cd ..

# Hacemos ejecutables los scripts
print_step "6️⃣ Configurando permisos de scripts..."
chmod +x start-dev.sh 2>/dev/null || true
chmod +x stop-dev.sh 2>/dev/null || true
chmod +x check-status.sh 2>/dev/null || true
chmod +x setup-dev.sh 2>/dev/null || true
print_status "✅ Permisos de scripts configurados"

# Verificamos configuración de Docker
print_step "7️⃣ Verificando configuración de Docker..."
cd backend
if [ -f "docker-compose.yml" ]; then
    print_status "✅ docker-compose.yml encontrado"
    # Verificamos que Docker está corriendo
    if docker info >/dev/null 2>&1; then
        print_status "✅ Docker daemon está corriendo"
    else
        print_warning "⚠️ Docker daemon no está corriendo. Inicia Docker antes de usar los scripts."
    fi
else
    print_error "❌ docker-compose.yml no encontrado en backend"
fi
cd ..

echo
print_status "🎉 ¡Configuración completada!"
echo
echo "🚀 Comandos disponibles:"
echo "   • npm run dev          - Iniciar todos los servicios"
echo "   • npm run dev:stop     - Detener todos los servicios"
echo "   • npm run dev:restart  - Reiniciar todos los servicios"
echo "   • npm run status       - Verificamos estado de servicios"
echo "   • npm run setup        - Ejecutar este script de configuración"