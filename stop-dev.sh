#!/bin/bash

# Script para detenemos todos los servicios de desarrollo de EmoScan

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

print_status "🛑 Deteniendo todos los servicios de EmoScan..."

# Detenemos emotion-service (puerto 8000)
print_step "1️⃣ Deteniendo emotion-service..."
if lsof -ti:8000 > /dev/null 2>&1; then
    kill $(lsof -ti:8000) 2>/dev/null || true
    print_status "✅ Emotion-service detenido"
else
    print_warning "⚠️ Emotion-service no estaba corriendo"
fi

# Detenemos backend (puerto 4000)
print_step "2️⃣ Deteniendo backend..."
if lsof -ti:4000 > /dev/null 2>&1; then
    kill $(lsof -ti:4000) 2>/dev/null || true
    print_status "✅ Backend detenido"
else
    print_warning "⚠️ Backend no estaba corriendo"
fi

# Detenemos frontend (puerto 3000)
print_step "3️⃣ Deteniendo frontend..."
if lsof -ti:3000 > /dev/null 2>&1; then
    kill $(lsof -ti:3000) 2>/dev/null || true
    print_status "✅ Frontend detenido"
else
    print_warning "⚠️ Frontend no estaba corriendo"
fi

# Detenemos Docker Compose
print_step "4️⃣ Deteniendo contenedores Docker..."
if [ -d "backend" ]; then
    cd backend
    if [ -f "docker-compose.yml" ]; then
        docker compose down
        print_status "✅ Contenedores Docker detenidos"
    else
        print_warning "⚠️ No se encontró docker-compose.yml"
    fi
    cd ..
else
    print_warning "⚠️ No se encontró la carpeta backend"
fi

# Verificamos que no queden procesos corriendo
print_step "5️⃣ Verificando procesos restantes..."
remaining_processes=0

if lsof -ti:8000 > /dev/null 2>&1; then
    print_warning "⚠️ Aún hay procesos en puerto 8000"
    remaining_processes=1
fi

if lsof -ti:4000 > /dev/null 2>&1; then
    print_warning "⚠️ Aún hay procesos en puerto 4000"
    remaining_processes=1
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    print_warning "⚠️ Aún hay procesos en puerto 3000"
    remaining_processes=1
fi

if [ $remaining_processes -eq 0 ]; then
    print_status "🎉 ¡Todos los servicios han sido detenidos correctamente!"
else
    print_warning "Algunos procesos pueden seguir corriendo. Puedes usar 'kill -9 <PID>' si es necesario."
fi

echo
print_status "📊 Estado final de puertos:"
echo "  • Puerto 8000 (emotion-service): $(lsof -ti:8000 > /dev/null 2>&1 && echo "🔴 Ocupado" || echo "🟢 Libre")"
echo "  • Puerto 4000 (backend): $(lsof -ti:4000 > /dev/null 2>&1 && echo "🔴 Ocupado" || echo "🟢 Libre")"
echo "  • Puerto 3000 (frontend): $(lsof -ti:3000 > /dev/null 2>&1 && echo "🔴 Ocupado" || echo "🟢 Libre")"