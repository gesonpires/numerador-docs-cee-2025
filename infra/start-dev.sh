#!/bin/bash

echo "🚀 Iniciando ambiente de desenvolvimento do CEE-SC Enumerador..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Subir apenas o banco de dados primeiro
echo "📊 Subindo banco de dados PostgreSQL..."
docker compose up -d db

# Aguardar o banco estar pronto
echo "⏳ Aguardando banco de dados ficar pronto..."
sleep 10

# Verificar se o banco está rodando
if ! docker compose ps db | grep -q "Up"; then
    echo "❌ Falha ao subir o banco de dados."
    exit 1
fi

echo "✅ Banco de dados rodando em http://localhost:5432"
echo ""
echo "📋 Próximos passos:"
echo "1. [backend] cd ../backend && npm install"
echo "2. [backend] npm run prisma:migrate"
echo "3. [backend] npm run prisma:seed"
echo "4. [backend] npm run dev"
echo ""
echo "5. [frontend] cd ../frontend && npm install"
echo "6. [frontend] npm run dev"
echo ""
echo "🌐 URLs:"
echo "- Banco: postgresql://postgres:postgres@localhost:5432/ceesc"
echo "- API: http://localhost:3001"
echo "- Web: http://localhost:3000"
