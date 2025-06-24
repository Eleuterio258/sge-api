# API SGE-Condução

Esta é a API RESTful para o Sistema de Gestão Escolar (SGE) de escolas de Condução, desenvolvida em Node.js com Express.js e MySQL.

## Funcionalidades

- Autenticação de usuários (registro e login com JWT)
- Gestão de escolas (CRUD)
- Gestão de alunos (CRUD)
- Gestão de Categorias de Carta (CRUD)
- Gestão de Matrículas (CRUD)
- Gestão de aulas (CRUD)
- Gestão de exames (CRUD)
- Gestão Financeira (Parcelas e Pagamentos)

## Configuração do Ambiente

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (Node Package Manager)
- MySQL Server (versão 8 ou superior)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd sge-api
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:
    ```
    PORT=4000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=password
    DB_NAME=sge_conducao
    JWT_SECRET=sua_chave_secreta_jwt_aqui
    ```
    Certifique-se de que `DB_NAME` corresponde ao nome do banco de dados que você criou usando o script SQL fornecido.

4.  Execute o script SQL para criar o banco de dados e as tabelas (se ainda não o fez).

### Execução

Para iniciar o servidor da API:

```bash
node index.js
```

O servidor estará rodando em `http://localhost:4000` (ou na porta especificada em `.env`).

## Estrutura do Projeto

```
.sge-api/
├── config/
│   └── db.js               # Configuração da conexão com o banco de dados
├── controllers/
│   ├── alunoController.js
│   ├── aulaController.js
│   ├── authController.js
│   ├── categoriaCartaController.js
│   ├── escolaController.js
│   ├── exameController.js
│   ├── matriculaController.js
│   ├── pagamentoController.js
│   └── parcelaController.js
├── middleware/
│   └── authMiddleware.js   # Middleware de autenticação e autorização
├── models/
│   ├── Aluno.js
│   ├── Aula.js
│   ├── CategoriaCarta.js
│   ├── Escola.js
│   ├── Exame.js
│   ├── Matricula.js
│   ├── Pagamento.js
│   ├── Parcela.js
│   └── User.js             # Modelo de usuário (para autenticação)
├── routes/
│   ├── alunoRoutes.js
│   ├── aulaRoutes.js
│   ├── authRoutes.js
│   ├── categoriaCartaRoutes.js
│   ├── escolaRoutes.js
│   ├── exameRoutes.js
│   ├── matriculaRoutes.js
│   ├── pagamentoRoutes.js
│   └── parcelaRoutes.js
├── .env                    # Variáveis de ambiente
├── index.js                # Ponto de entrada da aplicação
├── package.json            # Metadados do projeto e dependências
└── package-lock.json
```

## Endpoints da API

### Autenticação (`/api/auth`)

-   `POST /api/auth/register`: Registra um novo usuário.
    -   **Body:** `{ "nome_completo", "email", "senha", "telefone", "id_tipo_utilizador" }`
-   `POST /api/auth/login`: Autentica um usuário e retorna um token JWT.
    -   **Body:** `{ "email", "senha" }`
    -   **Response:** `{ "token": "<jwt_token>" }`

### escolas (`/api/escolas`)

-   `POST /api/escolas`: Cria uma nova escola. (Auth: Super Admin, Admin Escola)
-   `GET /api/escolas`: Lista todas as escolas. (Auth: Todos com acesso a escolas)
-   `GET /api/escolas/:id`: Obtém detalhes de uma escola específica. (Auth: Todos com acesso a escolas)
-   `PUT /api/escolas/:id`: Atualiza uma escola existente. (Auth: Super Admin, Admin Escola)
-   `DELETE /api/escolas/:id`: Deleta uma escola. (Auth: Super Admin)

### alunos (`/api/alunos`)

-   `POST /api/alunos`: Cria um novo aluno. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `GET /api/alunos`: Lista todos os alunos. (Auth: Todos com acesso a alunos)
-   `GET /api/alunos/:id`: Obtém detalhes de um aluno específico. (Auth: Todos com acesso a alunos)
-   `PUT /api/alunos/:id`: Atualiza um aluno existente. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `DELETE /api/alunos/:id`: Deleta um aluno. (Auth: Super Admin, Admin Escola)

### Categorias de Carta (`/api/categorias-carta`)

-   `POST /api/categorias-carta`: Cria uma nova categoria de carta. (Auth: Super Admin, Admin Escola)
-   `GET /api/categorias-carta`: Lista todas as categorias de carta. (Auth: Todos)
-   `GET /api/categorias-carta/:id`: Obtém detalhes de uma categoria específica. (Auth: Todos)
-   `PUT /api/categorias-carta/:id`: Atualiza uma categoria existente. (Auth: Super Admin, Admin Escola)
-   `DELETE /api/categorias-carta/:id`: Deleta uma categoria. (Auth: Super Admin)

### Matrículas (`/api/matriculas`)

-   `POST /api/matriculas`: Cria uma nova matrícula. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `GET /api/matriculas`: Lista todas as matrículas. (Auth: Todos com acesso a matrículas)
-   `GET /api/matriculas/:id`: Obtém detalhes de uma matrícula específica. (Auth: Todos com acesso a matrículas)
-   `PUT /api/matriculas/:id`: Atualiza uma matrícula existente. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `DELETE /api/matriculas/:id`: Deleta uma matrícula. (Auth: Super Admin, Admin Escola)

### aulas (`/api/aulas`)

-   `POST /api/aulas`: Cria uma nova aula. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `GET /api/aulas`: Lista todas as aulas. (Auth: Todos com acesso a aulas)
-   `GET /api/aulas/:id`: Obtém detalhes de uma aula específica. (Auth: Todos com acesso a aulas)
-   `PUT /api/aulas/:id`: Atualiza uma aula existente. (Auth: Super Admin, Admin Escola, Gestor Escola Específica, Instrutor)
-   `DELETE /api/aulas/:id`: Deleta uma aula. (Auth: Super Admin, Admin Escola)

### exames (`/api/exames`)

-   `POST /api/exames`: Cria um novo exame. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `GET /api/exames`: Lista todos os exames. (Auth: Todos com acesso a exames)
-   `GET /api/exames/:id`: Obtém detalhes de um exame específico. (Auth: Todos com acesso a exames)
-   `PUT /api/exames/:id`: Atualiza um exame existente. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `DELETE /api/exames/:id`: Deleta um exame. (Auth: Super Admin, Admin Escola)

### Parcelas (`/api/parcelas`)

-   `POST /api/parcelas`: Cria uma nova parcela. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `GET /api/parcelas`: Lista todas as parcelas. (Auth: Todos com acesso a parcelas)
-   `GET /api/parcelas/:id`: Obtém detalhes de uma parcela específica. (Auth: Todos com acesso a parcelas)
-   `PUT /api/parcelas/:id`: Atualiza uma parcela existente. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `DELETE /api/parcelas/:id`: Deleta uma parcela. (Auth: Super Admin, Admin Escola)
-   `GET /api/parcelas/matricula/:matriculaId`: Lista parcelas por ID de matrícula. (Auth: Todos com acesso a parcelas, incluindo Aluno)

### Pagamentos (`/api/pagamentos`)

-   `POST /api/pagamentos`: Registra um novo pagamento. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `GET /api/pagamentos`: Lista todos os pagamentos. (Auth: Todos com acesso a pagamentos)
-   `GET /api/pagamentos/:id`: Obtém detalhes de um pagamento específico. (Auth: Todos com acesso a pagamentos)
-   `PUT /api/pagamentos/:id`: Atualiza um pagamento existente. (Auth: Super Admin, Admin Escola, Gestor Escola Específica)
-   `DELETE /api/pagamentos/:id`: Deleta um pagamento. (Auth: Super Admin, Admin Escola)
-   `GET /api/pagamentos/matricula/:matriculaId`: Lista pagamentos por ID de matrícula. (Auth: Todos com acesso a pagamentos, incluindo Aluno)

## Códigos de Tipo de Usuário (id_tipo_utilizador)

Para o middleware `authorizeRoles`, os seguintes IDs de tipo de usuário são usados:

-   `1`: Super Admin
-   `2`: Admin Escola
-   `3`: Gestor Geral
-   `4`: Gestor Escola Específica
-   `5`: Instrutor

## Testes (Exemplo com cURL)

### Registrar um novo usuário (Super Admin)

```bash
curl -X POST http://localhost:4000/api/auth/register \
-H "Content-Type: application/json" \
-d 
```


```json
{
    "nome_completo": "Super Admin",
    "email": "superadmin@example.com",
    "senha": "senhaSegura123",
    "telefone": "+258840000000",
    "id_tipo_utilizador": 1
}
```

### Fazer Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
-H "Content-Type: application/json" \
-d 
```
```json
{
    "email": "superadmin@example.com",
    "senha": "senhaSegura123"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use este token nos cabeçalhos `Authorization: Bearer <token>` para acessar as rotas protegidas.

---

**Nota:** Para outros endpoints, siga a estrutura `curl -X <METHOD> <URL> -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d 
```json
<BODY_JSON>
```


