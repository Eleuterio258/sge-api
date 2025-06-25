# Listar Alunos das Escolas Atribuídas

Este endpoint permite listar todos os alunos das escolas que foram atribuídas ao usuário autenticado.

## Endpoint

```
GET /api/alunos/escolas-atribuidas
```

## Autenticação

Requer token JWT válido no header:
```
Authorization: Bearer <seu_token_jwt>
```

## Permissões

- Super Admin (role 1): Pode ver alunos de todas as escolas
- Admin Escola (role 2): Pode ver alunos das escolas atribuídas
- Gestor Escola Específica (role 4): Pode ver alunos das escolas atribuídas
- Instrutor (role 5): Pode ver alunos das escolas atribuídas

## Resposta de Sucesso

### Para Super Admin (role 1):
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
      "apelido": "Silva",
      "email": "joao@email.com",
      "id_escola": 1,
      "matriculas": [...],
      // ... outros campos do aluno
    }
  ]
}
```

### Para outros roles:
```json
{
  "success": true,
  "message": "Alunos das escolas atribuídas recuperados com sucesso",
  "total_escolas": 2,
  "total_alunos": 75,
  "escolas_alunos": [
    {
      "id_escola": 1,
      "alunos": [
        {
          "id_aluno": 1,
          "numero_ficha": "2024001",
          "nome_completo": "João Silva",
          "apelido": "Silva",
          "email": "joao@email.com",
          "id_escola": 1,
          "matriculas": [...],
          // ... outros campos do aluno
        }
      ],
      "total_alunos_escola": 45
    },
    {
      "id_escola": 2,
      "alunos": [...],
      "total_alunos_escola": 30
    }
  ]
}
```

## Resposta de Erro

### Sem escolas atribuídas:
```json
{
  "success": false,
  "message": "Você não tem escolas atribuídas para visualizar alunos"
}
```

### Erro interno:
```json
{
  "success": false,
  "message": "Erro interno do servidor ao buscar alunos das escolas atribuídas"
}
```

## Exemplo de Uso

### JavaScript/Fetch:
```javascript
const response = await fetch('/api/alunos/escolas-atribuidas', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### Axios:
```javascript
const response = await axios.get('/api/alunos/escolas-atribuidas', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

console.log(response.data);
```

### cURL:
```bash
curl -X GET \
  http://localhost:3000/api/alunos/escolas-atribuidas \
  -H 'Authorization: Bearer seu_token_aqui' \
  -H 'Content-Type: application/json'
```

## Diferenças do Endpoint `/escola/:id_escola`

- `/escola/:id_escola`: Lista alunos de uma escola específica (requer permissão para essa escola)
- `/escolas-atribuidas`: Lista alunos de todas as escolas atribuídas ao usuário (automático baseado nas atribuições)

## Notas

- O endpoint automaticamente filtra as escolas baseado nas atribuições do usuário
- Super Admins veem todos os alunos de todas as escolas
- Inclui dados completos dos alunos com matrículas, parcelas e pagamentos
- A resposta é organizada por escola para facilitar o processamento 