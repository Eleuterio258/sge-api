# SGE Condução - Docker Setup com MySQL

## 🐳 Visão Geral

Este projeto agora inclui uma configuração Docker completa com MySQL local, MinIO para armazenamento de arquivos e todos os serviços necessários para rodar o sistema de gestão de escolas de condução.

## 📋 Pré-requisitos

- Docker (versão 20.10+)
- Docker Compose (versão 2.0+)
- 4GB RAM disponível
- 10GB espaço em disco

## 🚀 Início Rápido

### 1. Clone o repositório
```bash
git clone <repository-url>
cd sge-api
```

### 2. Execute o script de setup
```bash
# Tornar o script executável (Linux/Mac)
chmod +x docker-setup.sh

# Iniciar todos os serviços
./docker-setup.sh start
```

### 3. Acesse as aplicações
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001
- **MySQL**: localhost:3306

## 🛠️ Serviços Incluídos

### 1. MySQL Database
- **Imagem**: mysql:8.0
- **Porta**: 3306
- **Usuário**: sge_user
- **Senha**: sge_password_2024
- **Database**: sge_conducao
- **Persistência**: Volume Docker

### 2. MinIO Object Storage
- **Imagem**: minio/minio:latest
- **Porta API**: 9000
- **Porta Console**: 9001
- **Usuário**: minioadmin
- **Senha**: minioadmin123
- **Bucket**: sge-files

### 3. Backend API
- **Porta**: 4000
- **Framework**: Node.js/Express
- **Banco**: MySQL local
- **Storage**: MinIO

### 4. Frontend
- **Porta**: 3000
- **Framework**: React/TypeScript
- **Build**: Nginx

## 📁 Estrutura de Volumes

```yaml
volumes:
  mysql_data:     # Dados do MySQL
  minio_data:     # Arquivos do MinIO
```

## 🔧 Comandos Úteis

### Script de Gerenciamento
```bash
# Iniciar serviços
./docker-setup.sh start

# Parar serviços
./docker-setup.sh stop

# Reiniciar serviços
./docker-setup.sh restart

# Ver logs
./docker-setup.sh logs
./docker-setup.sh logs backend
./docker-setup.sh logs mysql

# Status dos serviços
./docker-setup.sh status

# Backup do banco
./docker-setup.sh backup

# Restaurar banco
./docker-setup.sh restore backup_20241201_143000.sql

# Limpar tudo
./docker-setup.sh clean
```

### Comandos Docker Compose Diretos
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Acessar MySQL
docker-compose exec mysql mysql -u sge_user -psge_password_2024 sge_conducao

# Backup manual
docker-compose exec mysql mysqldump -u sge_user -psge_password_2024 sge_conducao > backup.sql
```

## 🔐 Credenciais

### MySQL
- **Host**: mysql (dentro da rede Docker) ou localhost (externo)
- **Porta**: 3306
- **Usuário**: sge_user
- **Senha**: sge_password_2024
- **Database**: sge_conducao

### MinIO
- **Endpoint**: minio (dentro da rede Docker) ou localhost (externo)
- **Porta**: 9000
- **Console**: http://localhost:9001
- **Access Key**: minioadmin
- **Secret Key**: minioadmin123

## 🌐 Redes Docker

```yaml
networks:
  sge_network:
    driver: bridge
```

Todos os serviços estão na mesma rede `sge_network` para comunicação interna.

## 📊 Monitoramento

### Verificar Status
```bash
docker-compose ps
```

### Verificar Logs
```bash
# Todos os serviços
docker-compose logs

# Serviço específico
docker-compose logs mysql
docker-compose logs backend
docker-compose logs frontend
docker-compose logs minio
```

### Verificar Recursos
```bash
# Uso de CPU e memória
docker stats

# Espaço em disco
docker system df
```

## 🔄 Backup e Restauração

### Backup Automático
```bash
./docker-setup.sh backup
```

### Backup Manual
```bash
docker-compose exec mysql mysqldump -u sge_user -psge_password_2024 sge_conducao > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restauração
```bash
./docker-setup.sh restore backup_20241201_143000.sql
```

## 🛡️ Segurança

### Variáveis de Ambiente
- Todas as senhas estão definidas no `docker-compose.yml`
- Para produção, use arquivo `.env` separado
- JWT secret configurado para produção

### Firewall
- Apenas portas necessárias expostas
- Comunicação interna via rede Docker

## 🔧 Troubleshooting

### MySQL não inicia
```bash
# Verificar logs
docker-compose logs mysql

# Verificar se a porta 3306 está livre
netstat -tulpn | grep 3306

# Reiniciar apenas MySQL
docker-compose restart mysql
```

### Backend não conecta ao MySQL
```bash
# Verificar se MySQL está rodando
docker-compose ps mysql

# Testar conexão
docker-compose exec backend ping mysql

# Verificar variáveis de ambiente
docker-compose exec backend env | grep DB_
```

### Frontend não carrega
```bash
# Verificar se backend está rodando
docker-compose ps backend

# Verificar logs do frontend
docker-compose logs frontend

# Verificar se a porta 3000 está livre
netstat -tulpn | grep 3000
```

### Problemas de Permissão (Linux)
```bash
# Ajustar permissões dos volumes
sudo chown -R 1000:1000 ./volumes

# Ou usar sudo para Docker
sudo docker-compose up -d
```

## 📈 Performance

### Otimizações Recomendadas
- **MySQL**: Ajustar `innodb_buffer_pool_size` para 70% da RAM
- **MinIO**: Usar SSD para melhor performance
- **Backend**: Aumentar `max_old_space_size` se necessário

### Monitoramento
```bash
# Verificar uso de recursos
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Verificar logs de performance
docker-compose logs backend | grep -i "slow\|timeout\|error"
```

## 🚀 Deploy em Produção

### 1. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
# Editar .env com valores de produção
```

### 2. Usar Volumes Externos
```yaml
volumes:
  mysql_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/mysql
  minio_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/minio
```

### 3. Configurar Backup Automático
```bash
# Adicionar ao crontab
0 2 * * * /path/to/sge-api/docker-setup.sh backup
```

### 4. Monitoramento
- Configurar alertas para uso de recursos
- Monitorar logs de erro
- Backup automático diário

## 📝 Logs e Debugging

### Níveis de Log
- **ERROR**: Erros críticos
- **WARN**: Avisos importantes
- **INFO**: Informações gerais
- **DEBUG**: Informações detalhadas

### Comandos de Debug
```bash
# Logs em tempo real
docker-compose logs -f --tail=100

# Logs de erro apenas
docker-compose logs | grep -i error

# Logs de um período específico
docker-compose logs --since="2024-01-01T00:00:00"
```

## 🔄 Atualizações

### Atualizar Imagens
```bash
# Pull das últimas imagens
docker-compose pull

# Rebuild e restart
docker-compose up -d --build
```

### Atualizar Código
```bash
# Pull do código
git pull

# Rebuild
docker-compose up -d --build
```

## 📞 Suporte

Para problemas específicos:
1. Verificar logs: `./docker-setup.sh logs`
2. Verificar status: `./docker-setup.sh status`
3. Consultar documentação
4. Abrir issue no GitHub

---

**Nota**: Este setup é ideal para desenvolvimento e testes. Para produção, considere usar um banco MySQL gerenciado e configurações de segurança adicionais. 