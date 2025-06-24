# Credenciais Iniciais do Sistema

## 1. Banco de Dados
As credenciais do banco de dados devem ser configuradas no arquivo `.env` na raiz do projeto. Exemplo:

```
DB_HOST=135.181.249.37
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
DB_PORT=3306
```

> **Atenção:** Nunca compartilhe seu arquivo `.env` com terceiros ou versionamento público.

## 2. Usuários Administrativos Iniciais
O script `seed/seed.js` cria automaticamente os seguintes usuários administrativos no banco de dados:

| Tipo de Usuário | Email                      | Senha            |
|-----------------|---------------------------|------------------|
| Super Admin     | superadmin@example.com     | senhaSegura123   |
| Admin Escola    | adminescola@example.com    | senhaEscola123   |

Essas credenciais podem ser usadas para acessar o sistema após rodar o seed.

---

Se desejar alterar as senhas ou e-mails, edite o arquivo `seed/seed.js` antes de executar o script de seed. 