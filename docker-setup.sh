#!/bin/bash

# SGE Condução - Docker Setup Script
# Este script facilita o gerenciamento do ambiente Docker

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  SGE Condução - Docker Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Função para verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi

    print_message "Docker e Docker Compose encontrados!"
}

# Função para criar arquivo .env se não existir
create_env_file() {
    if [ ! -f .env ]; then
        print_message "Criando arquivo .env..."
        cat > .env << EOF
# SGE Condução Environment Variables
NODE_ENV=production
JWT_SECRET=sge_conducao_jwt_secret_key_2024_very_secure_and_long_key_for_production
JWT_EXPIRES_IN=360d
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DB_HOST=mysql
DB_USER=sge_user
DB_PASSWORD=sge_password_2024
DB_NAME=sge_conducao
DB_PORT=3306
DB_SSL=false

# MinIO Configuration
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=sge-files
MINIO_REGION=us-east-1
MINIO_USE_SSL=false

# Application Configuration
CORS_ORIGIN=*
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
API_URL=http://localhost:4000
EOF
        print_message "Arquivo .env criado com sucesso!"
    else
        print_message "Arquivo .env já existe."
    fi
}

# Função para iniciar os serviços
start_services() {
    print_message "Iniciando serviços Docker..."
    docker-compose up -d
    
    print_message "Aguardando MySQL inicializar..."
    sleep 30
    
    print_message "Verificando status dos serviços..."
    docker-compose ps
}

# Função para parar os serviços
stop_services() {
    print_message "Parando serviços Docker..."
    docker-compose down
}

# Função para reiniciar os serviços
restart_services() {
    print_message "Reiniciando serviços Docker..."
    docker-compose restart
}

# Função para ver logs
show_logs() {
    if [ -z "$1" ]; then
        print_message "Mostrando logs de todos os serviços..."
        docker-compose logs -f
    else
        print_message "Mostrando logs do serviço: $1"
        docker-compose logs -f "$1"
    fi
}

# Função para fazer backup do banco
backup_database() {
    print_message "Fazendo backup do banco de dados..."
    docker-compose exec mysql mysqldump -u sge_user -psge_password_2024 sge_conducao > backup_$(date +%Y%m%d_%H%M%S).sql
    print_message "Backup criado com sucesso!"
}

# Função para restaurar banco
restore_database() {
    if [ -z "$1" ]; then
        print_error "Por favor, especifique o arquivo de backup: $0 restore <arquivo.sql>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Arquivo de backup não encontrado: $1"
        exit 1
    fi
    
    print_message "Restaurando banco de dados de: $1"
    docker-compose exec -T mysql mysql -u sge_user -psge_password_2024 sge_conducao < "$1"
    print_message "Restauração concluída!"
}

# Função para testar conexões
test_connections() {
    print_message "Testando conexões do sistema..."
    
    # Testar MySQL
    print_message "Testando conexão MySQL..."
    if docker-compose exec mysql mysqladmin ping -h localhost -u sge_user -psge_password_2024 --silent; then
        print_message "✅ MySQL: Conexão OK"
    else
        print_error "❌ MySQL: Falha na conexão"
    fi
    
    # Testar MinIO
    print_message "Testando conexão MinIO..."
    if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
        print_message "✅ MinIO: Conexão OK"
    else
        print_error "❌ MinIO: Falha na conexão"
    fi
    
    # Testar API
    print_message "Testando conexão API..."
    if curl -f http://localhost:4000/api/status > /dev/null 2>&1; then
        print_message "✅ API: Conexão OK"
    else
        print_error "❌ API: Falha na conexão"
    fi
    
    # Executar script de teste Node.js se disponível
    if [ -f "api/test-connections.js" ]; then
        print_message "Executando testes detalhados..."
        docker-compose exec backend node test-connections.js
    fi
}

# Função para limpar tudo
clean_all() {
    print_warning "Esta ação irá remover todos os containers, volumes e imagens!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "Removendo todos os containers, volumes e imagens..."
        docker-compose down -v --rmi all
        docker system prune -af
        print_message "Limpeza concluída!"
    else
        print_message "Operação cancelada."
    fi
}

# Função para mostrar status
show_status() {
    print_message "Status dos serviços:"
    docker-compose ps
    
    echo
    print_message "Informações do sistema:"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:4000"
    echo "MinIO Console: http://localhost:9001"
    echo "MySQL: localhost:3306"
    
    echo
    print_message "Credenciais:"
    echo "MySQL User: sge_user"
    echo "MySQL Password: sge_password_2024"
    echo "MinIO User: minioadmin"
    echo "MinIO Password: minioadmin123"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo
    echo "Comandos disponíveis:"
    echo "  start     - Iniciar todos os serviços"
    echo "  stop      - Parar todos os serviços"
    echo "  restart   - Reiniciar todos os serviços"
    echo "  logs      - Mostrar logs (todos os serviços)"
    echo "  logs [service] - Mostrar logs de um serviço específico"
    echo "  backup    - Fazer backup do banco de dados"
    echo "  restore <file> - Restaurar banco de dados"
    echo "  status    - Mostrar status dos serviços"
    echo "  test      - Testar conexões do sistema"
    echo "  clean     - Limpar tudo (containers, volumes, imagens)"
    echo "  help      - Mostrar esta ajuda"
    echo
    echo "Exemplos:"
    echo "  $0 start"
    echo "  $0 logs backend"
    echo "  $0 test"
    echo "  $0 restore backup_20241201_143000.sql"
}

# Função principal
main() {
    print_header
    
    case "${1:-help}" in
        start)
            check_docker
            create_env_file
            start_services
            show_status
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        backup)
            backup_database
            ;;
        restore)
            restore_database "$2"
            ;;
        status)
            show_status
            ;;
        test)
            test_connections
            ;;
        clean)
            clean_all
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Executar função principal
main "$@" 