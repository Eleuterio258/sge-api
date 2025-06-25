# Documentação da API SGE-Condução

## Visão Geral

A API SGE-Condução é uma API RESTful desenvolvida em Node.js com Express.js e MySQL para gerenciar escolas de condução.

**URL Base:** `http://135.181.249.37:4000/api`

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Todas as requisições (exceto login e registro) devem incluir o header:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticação

#### POST /auth/register
Registra um novo usuário.

**Body:**
```json
{
  "nome_completo": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "telefone": "+258841234567",
  "id_tipo_utilizador": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "userId": 1,
    "email": "joao@example.com"
  }
}
```

#### POST /auth/login
Autentica um usuário.

**Body:**
```json
{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id_utilizador": 1,
      "nome_completo": "João Silva",
      "email": "joao@example.com",
      "id_tipo_utilizador": 2,
      "escolas_atribuidas": [...]
    },
    "expiresIn": "15m"
  }
}
```

#### POST /auth/refresh-token
Renova o token de acesso.

**Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /auth/logout
Faz logout do usuário.

**Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Escolas

#### GET /escolas
Lista todas as escolas (requer autenticação).

**Query Parameters:**
- `page` (number): Número da página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Termo de busca

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_escola": 1,
      "nome_escola": "Escola de Condução Central",
      "endereco": "Av. Julius Nyerere, 100",
      "distrito": "Maputo",
      "provincia": "Maputo Cidade",
      "telefone": "+258841234567",
      "email": "central@escola.com",
      "nuit": "123456789",
      "logo_url": "http://135.181.249.37:4000/uploads/logo-123.png"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### POST /escolas
Cria uma nova escola (requer Super Admin ou Admin Local).

**Body:**
```json
{
  "nome_escola": "Nova Escola",
  "endereco": "Rua Nova, 123",
  "distrito": "Maputo",
  "provincia": "Maputo Cidade",
  "telefone": "+258841234567",
  "email": "nova@escola.com",
  "nuit": "987654321"
}
```

#### GET /escolas/:id
Obtém detalhes de uma escola específica.

#### PUT /escolas/:id
Atualiza uma escola existente.

#### DELETE /escolas/:id
Remove uma escola (apenas Super Admin).

### Alunos

#### GET /alunos
Lista todos os alunos.

**Query Parameters:**
- `page` (number): Número da página
- `limit` (number): Itens por página
- `id_escola` (number): Filtrar por escola
- `search` (string): Buscar por nome

#### GET /alunos/escolas-atribuidas
Lista alunos das escolas atribuídas ao usuário autenticado.

**Permissões:**
- Super Admin (role 1): Vê alunos de todas as escolas
- Outros roles: Vê apenas alunos das escolas atribuídas

**Response (Super Admin):**
```json
{
  "success": true,
  "message": "Alunos de todas as escolas (Super Admin)",
  "total_alunos": 150,
  "alunos": [
    {
      "id_aluno": 1,
      "numero_ficha": "2024001",
      "nome_completo": "João Silva",
      "email": "joao@email.com",
      "id_escola": 1,
      "matriculas": [...]
    }
  ]
}
```

**Response (Outros roles):**
```json
{
  "success": true,
  "message": "Alunos das escolas atribuídas recuperados com sucesso",
  "total_escolas": 2,
  "total_alunos": 75,
  "escolas_alunos": [
    {
      "id_escola": 1,
      "alunos": [...],
      "total_alunos_escola": 45
    }
  ]
}
```

#### GET /alunos/escola/:id_escola
Lista alunos de uma escola específica (requer permissão para a escola).

#### POST /alunos
Cria um novo aluno.

**Body:**
```json
{
  "nome_completo": "Maria Santos",
  "data_nascimento": "1995-05-15",
  "numero_identificacao": "123456789",
  "tipo_identificacao": "BI",
  "endereco": "Rua das Flores, 456",
  "telefone": "+258841234567",
  "email": "maria@example.com",
  "id_escola": 1
}
```

#### GET /alunos/:id
Obtém detalhes de um aluno específico.

#### PUT /alunos/:id
Atualiza um aluno existente.

#### DELETE /alunos/:id
Remove um aluno.

### Matrículas

#### GET /matriculas
Lista todas as matrículas.

**Query Parameters:**
- `page` (number): Número da página
- `limit` (number): Itens por página
- `id_escola` (number): Filtrar por escola
- `status_matricula` (string): Filtrar por status

#### POST /matriculas
Cria uma nova matrícula.

**Body:**
```json
{
  "id_aluno": 1,
  "id_escola": 1,
  "id_categoria_carta": 2,
  "data_inicio_curso": "2024-01-15",
  "horario_inicio_curso": "08:00:00",
  "duracao_contrato_meses": 6,
  "custo_total_curso": 15000.00
}
```

#### GET /matriculas/:id
Obtém detalhes de uma matrícula específica.

#### PUT /matriculas/:id
Atualiza uma matrícula existente.

#### DELETE /matriculas/:id
Remove uma matrícula.

### Pagamentos

#### GET /pagamentos
Lista todos os pagamentos.

**Query Parameters:**
- `page` (number): Número da página
- `limit` (number): Itens por página
- `id_matricula` (number): Filtrar por matrícula
- `data_inicio` (date): Data inicial
- `data_fim` (date): Data final

#### POST /pagamentos
Registra um novo pagamento.

**Body:**
```json
{
  "id_matricula": 1,
  "id_parcela": 1,
  "valor_pago": 5000.00,
  "metodo_pagamento": "M-Pesa",
  "observacoes": "Pagamento da primeira parcela"
}
```

#### GET /pagamentos/:id
Obtém detalhes de um pagamento específico.

#### PUT /pagamentos/:id
Atualiza um pagamento existente.

#### DELETE /pagamentos/:id
Remove um pagamento.

### Parcelas

#### GET /parcelas
Lista todas as parcelas.

#### POST /parcelas
Cria uma nova parcela.

**Body:**
```json
{
  "id_matricula": 1,
  "numero_parcela": 1,
  "valor_devido": 5000.00,
  "data_vencimento": "2024-02-15"
}
```

#### GET /parcelas/matricula/:matriculaId
Lista parcelas de uma matrícula específica.

### Exames

#### GET /exames
Lista todos os exames.

#### POST /exames
Cria um novo exame.

**Body:**
```json
{
  "id_matricula": 1,
  "numero_tentativa": 1,
  "tipo_exame": "Teórico",
  "data_exame": "2024-03-15",
  "resultado": "Aprovado",
  "observacoes": "Aluno aprovado com 85%"
}
```

### Categorias de Carta

#### GET /categorias-carta
Lista todas as categorias de carta.

#### POST /categorias-carta
Cria uma nova categoria.

**Body:**
```json
{
  "codigo_categoria": "B",
  "descricao": "Veículos ligeiros",
  "tipo": "Condução",
  "preco": 15000.00
}
```

### Dashboard

#### GET /dashboard/stats/general
Obtém estatísticas gerais do sistema.

#### GET /dashboard/stats/schools
Obtém estatísticas por escola (requer Super Admin ou Admin Local).

#### GET /dashboard/stats/payments
Obtém estatísticas de pagamentos (requer Super Admin, Admin Local ou Financeiro).

#### GET /dashboard/stats/exams
Obtém estatísticas de exames.

#### GET /dashboard/charts
Obtém dados para gráficos.

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `409` - Conflito
- `500` - Erro interno do servidor

## Tipos de Usuário

- `1` - Super Admin
- `2` - Admin Local
- `3` - Gestor Financeiro
- `5` - Secretário
- `6` - Estudante

## Exemplos de Uso

### Login e uso da API

```bash
# 1. Fazer login
curl -X POST http://135.181.249.37:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@example.com", "senha": "senhaSegura123"}'

# 2. Usar o token retornado
curl -X GET http://135.181.249.37:4000/api/escolas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Criar uma escola

```bash
curl -X POST http://135.181.249.37:4000/api/escolas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_escola": "Escola de Condução Norte",
    "endereco": "Av. Norte, 456",
    "distrito": "Maputo",
    "provincia": "Maputo Cidade",
    "telefone": "+258841234567",
    "email": "norte@escola.com",
    "nuit": "987654321"
  }'
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Servidor
PORT=4000
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
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

### Instalação e Execução

```bash
# 1. Instalar dependências
npm install

# 2. Inicializar banco de dados
npm run init-db:seed

# 3. Executar em desenvolvimento
npm run dev

# 4. Executar em produção
npm start
```

## Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento. 