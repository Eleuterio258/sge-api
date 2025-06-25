# Guia de Instalação - Backend SGE-Condução

## Pré-requisitos

- **Node.js** (versão 14 ou superior)
- **npm** (Node Package Manager)
- **MySQL** (versão 8 ou superior)
- **Git**

## Passo a Passo da Instalação

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd sge-api
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Banco de Dados

#### 3.1. Criar Banco de Dados MySQL

```sql
CREATE DATABASE sge_conducao CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

#### 3.2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Servidor
PORT=4000
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=sge_conducao

# Configurações JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_aqui_2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Configurações CORS
CORS_ORIGIN=*

# Configurações de Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Inicializar Banco de Dados

#### 4.1. Criar Tabelas e Dados Iniciais

```bash
# Inicializar banco de dados com dados de exemplo
npm run init-db:seed
```

Este comando irá:
- Criar todas as tabelas necessárias
- Inserir tipos de usuário
- Criar uma escola de exemplo
- Criar usuários de teste

#### 4.2. Usuários Padrão Criados

- **Super Admin:**
  - Email: `superadmin@example.com`
  - Senha: `senhaSegura123`

- **Admin Escola:**
  - Email: `adminescola@example.com`
  - Senha: `senhaEscola123`

### 5. Executar a Aplicação

#### 5.1. Modo Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: `http://135.181.249.37:4000`

#### 5.2. Modo Produção

```bash
npm start
```

### 6. Verificar Instalação

#### 6.1. Testar Health Check

```bash
curl http://135.181.249.37:4000/
```

Resposta esperada:
```json
{
  "message": "API SGE-Condução está online!",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

#### 6.2. Testar Login

```bash
curl -X POST http://135.181.249.37:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "senha": "senhaSegura123"
  }'
```

## Estrutura de Diretórios

```
api/
├── config/              # Configurações (banco de dados, etc.)
├── controllers/         # Controladores da API
├── middleware/          # Middlewares (autenticação, validação)
├── models/             # Modelos de dados
├── routes/             # Rotas da API
├── scripts/            # Scripts utilitários
├── seed/               # Dados iniciais
├── uploads/            # Arquivos enviados
├── utils/              # Utilitários
├── index.js            # Arquivo principal
├── package.json        # Dependências
└── .env                # Variáveis de ambiente
```

## Comandos Úteis

```bash
# Desenvolvimento com auto-reload
npm run dev

# Produção
npm start

# Executar seed apenas
npm run seed

# Limpar dados (unseed)
npm run unseed

# Inicializar banco sem seed
npm run init-db

# Inicializar banco com seed
npm run init-db:seed
```

## Configuração de Produção

### 1. Variáveis de Ambiente de Produção

```env
NODE_ENV=production
PORT=4000
DB_HOST=seu_host_producao
DB_USER=seu_usuario_producao
DB_PASSWORD=sua_senha_producao
DB_NAME=sge_conducao
JWT_SECRET=chave_super_secreta_producao
CORS_ORIGIN=https://seu-dominio.com
```

### 2. Usando PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start index.js --name "sge-api"

# Monitorar
pm2 monit

# Ver logs
pm2 logs sge-api

# Reiniciar
pm2 restart sge-api

# Parar
pm2 stop sge-api
```

### 3. Usando Docker

```bash
# Construir imagem
docker build -t sge-api .

# Executar container
docker run -p 4000:4000 --env-file .env sge-api

# Usando docker-compose
docker-compose up --build
```

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com MySQL

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solução:**
- Verificar se o MySQL está rodando
- Verificar credenciais no arquivo `.env`
- Verificar se o banco `sge_conducao` existe

#### 2. Erro de Porta em Uso

```
Error: listen EADDRINUSE :::4000
```

**Solução:**
- Mudar a porta no arquivo `.env`
- Ou parar o processo que está usando a porta 4000

#### 3. Erro de Permissões

```
Error: EACCES: permission denied
```

**Solução:**
- Verificar permissões do diretório
- Executar com `sudo` se necessário

#### 4. Erro de Módulos Não Encontrados

```
Error: Cannot find module 'express'
```

**Solução:**
```bash
npm install
```

### Logs e Debug

#### Habilitar Logs Detalhados

```env
NODE_ENV=development
DEBUG=*
```

#### Verificar Logs

```bash
# Logs do console
npm run dev

# Logs do PM2
pm2 logs sge-api

# Logs do Docker
docker logs <container_id>
```

## Segurança

### 1. Configurações de Segurança

- Use senhas fortes para o banco de dados
- Configure um JWT_SECRET único e seguro
- Limite o CORS_ORIGIN em produção
- Use HTTPS em produção

### 2. Firewall

```bash
# Permitir apenas a porta necessária
sudo ufw allow 4000
```

### 3. Backup do Banco

```bash
# Backup
mysqldump -u root -p sge_conducao > backup.sql

# Restore
mysql -u root -p sge_conducao < backup.sql
```

## Suporte

Para problemas ou dúvidas:

1. Verificar logs da aplicação
2. Verificar documentação da API (`API_DOCS.md`)
3. Verificar issues do repositório
4. Contatar a equipe de desenvolvimento

## Próximos Passos

Após a instalação bem-sucedida:

1. Testar todos os endpoints da API
2. Configurar o frontend para conectar com o backend
3. Configurar monitoramento e logs
4. Implementar backup automático
5. Configurar CI/CD se necessário 