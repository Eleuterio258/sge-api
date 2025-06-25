# 🔧 Correções na Criação de Alunos (SGE API)

## 🚨 Problemas Identificados e Corrigidos

### 1. **Porta Incorreta**
- **Problema**: Requisições sendo enviadas para porta 3000
- **Solução**: API configurada para porta 4000
- **Arquivo**: `api/index.js` linha 18

### 2. **Falta de Validação de Dados**
- **Problema**: Não havia validação de campos obrigatórios
- **Solução**: Adicionada validação completa em `alunoController.js`
- **Campos validados**:
  - `id_escola` (obrigatório)
  - `numero_ficha` (obrigatório, único)
  - `nome_completo` (obrigatório)
  - `numero_identificacao` (obrigatório, único)
  - `telefone_principal` (obrigatório)
  - `email` (formato válido, único)
  - `data_nascimento` (formato YYYY-MM-DD)

### 3. **Verificação de Duplicatas**
- **Problema**: Não verificava se dados únicos já existiam
- **Solução**: Adicionadas verificações para:
  - `numero_ficha`
  - `numero_identificacao`
  - `email`

### 4. **Tratamento de Erros Melhorado**
- **Problema**: Mensagens de erro genéricas
- **Solução**: Tratamento específico para:
  - `ER_DUP_ENTRY`: Duplicatas
  - `ER_NO_REFERENCED_ROW_2`: Escola não encontrada
  - Validação de dados

### 5. **Controle de Acesso por Escola**
- **Problema**: Usuários podiam criar alunos para qualquer escola
- **Solução**: Adicionado middleware `authorizeSchool`

## 📁 Arquivos Modificados

### 1. `api/controllers/alunoController.js`
```javascript
// ✅ Adicionada função de validação
const validateAlunoData = (data) => { ... }

// ✅ Melhorado createAluno com validações
exports.createAluno = async (req, res) => { ... }
```

### 2. `api/models/Aluno.js`
```javascript
// ✅ Novos métodos para verificar duplicatas
static async getByNumeroFicha(numero_ficha) { ... }
static async getByNumeroIdentificacao(numero_identificacao) { ... }
static async getByEmail(email) { ... }
```

### 3. `api/routes/alunoRoutes.js`
```javascript
// ✅ Adicionado authorizeSchool middleware
router.post("/", authenticateToken, authorizeRoles(1, 2, 4), authorizeSchool, alunoController.createAluno);
```

## 🧪 Como Testar

### 1. **Teste Básico**
```bash
cd api
node test-aluno.js
```

### 2. **Teste com Requisição Corrigida**
```bash
cd api
node corrected-request.js
```

### 3. **Teste Manual com cURL**
```bash
curl -X POST http://http://135.181.249.37:4000/api/alunos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "id_escola": 1,
    "numero_ficha": "FICHA005",
    "nome_completo": "Teste Aluno",
    "numero_identificacao": "123456789A",
    "telefone_principal": "+258841234567"
  }'
```

## 📋 Exemplo de Requisição Válida

```javascript
const alunoData = {
    "id_escola": 1,
    "numero_ficha": "FICHA006",
    "nome_completo": "João Silva",
    "apelido": "Santos",
    "data_nascimento": "1995-03-20",
    "estado_civil": "Solteiro(a)",
    "nome_pai": "Manuel Silva",
    "nome_mae": "Maria Santos",
    "local_nascimento": "Maputo",
    "tipo_identificacao": "BI",
    "numero_identificacao": "123456789B",
    "pais_origem": "Moçambique",
    "profissao": "Engenheiro",
    "endereco": "Av. 25 de Setembro, 456",
    "numero_casa": "15",
    "telefone_principal": "+258841234567",
    "telefone_alternativo": "+258821234567",
    "email": "joao.silva@example.com",
    "genero": "Masculino",
    "foto_url": "http://example.com/joao.jpg"
};
```

## 🚀 Resposta de Sucesso

```json
{
    "message": "Aluno criado com sucesso",
    "alunoId": 4,
    "aluno": {
        "id_aluno": 4,
        "id_escola": 1,
        "numero_ficha": "FICHA006",
        "nome_completo": "João Silva",
        // ... outros campos
    }
}
```

## ❌ Exemplos de Erros

### Validação de Dados
```json
{
    "message": "Dados inválidos",
    "errors": [
        "id_escola é obrigatório",
        "email deve ter um formato válido"
    ]
}
```

### Duplicata
```json
{
    "message": "Número de ficha já existe no sistema"
}
```

### Escola Não Encontrada
```json
{
    "message": "Escola não encontrada"
}
```

## 🔐 Permissões Necessárias

- **Super Admin (role: 1)**: Pode criar alunos em qualquer escola
- **Admin Escola (role: 2)**: Pode criar alunos em qualquer escola
- **Gestor Escola Específica (role: 4)**: Pode criar alunos apenas na escola atribuída

## 📝 Notas Importantes

1. **Porta**: Sempre use porta 4000 para requisições
2. **Token**: Certifique-se de que o token JWT é válido
3. **Escola**: O usuário deve ter acesso à escola especificada
4. **Campos Únicos**: `numero_ficha`, `numero_identificacao` e `email` devem ser únicos
5. **Formato de Data**: Use YYYY-MM-DD para `data_nascimento` 