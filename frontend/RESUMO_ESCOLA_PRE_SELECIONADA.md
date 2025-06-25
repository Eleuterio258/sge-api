# Resumo: Escola Pré-selecionada na Nova Matrícula

## O que foi implementado

Foi implementada uma funcionalidade que automaticamente pré-seleciona a escola correta no formulário de "Nova Matrícula" baseado nas escolas que o usuário está autorizado a gerir.

## Funcionalidades Implementadas

### 1. **Filtragem de Escolas por Permissões**
- **Super Admin (role 1)**: Pode ver e selecionar todas as escolas
- **Outros roles (2, 3, 4, 5)**: Vê apenas escolas atribuídas ao usuário

### 2. **Pré-seleção Automática**
- **Super Admin**: Não pré-seleciona escola (deve escolher manualmente)
- **Outros roles**: Pré-seleciona automaticamente a primeira escola atribuída

### 3. **Feedback Visual**
- Mensagem informativa para usuários não-Super Admin
- Indicação clara de que a escola foi pré-selecionada
- Diferenciação visual entre tipos de usuário

## Arquivos Modificados

### `frontend/src/pages/admin/StudentsPageDetails.tsx`

#### 1. **Importação do Contexto de Usuário**
```typescript
const { accessToken, isTokenValid, user } = useAuth();
```

#### 2. **Função para Filtrar Escolas do Usuário**
```typescript
const getUserEscolas = (): Escola[] => {
  if (!user) return [];
  
  // Se for Super Admin, pode ver todas as escolas
  if (user.id_tipo_utilizador === 1) {
    return escolas;
  }
  
  // Para outros roles, filtrar apenas escolas atribuídas
  const userEscolas = user.escolas_atribuidas || [];
  return escolas.filter(escola => 
    userEscolas.some(userEscola => 
      userEscola.id_escola === escola.id_escola && userEscola.ativo === 1
    )
  );
};
```

#### 3. **Função para Obter Escola Padrão**
```typescript
const getDefaultEscola = (): number => {
  if (!user) return 0;
  
  // Se for Super Admin, não pré-selecionar
  if (user.id_tipo_utilizador === 1) {
    return 0;
  }
  
  // Para outros roles, usar a primeira escola atribuída
  const userEscolas = user.escolas_atribuidas || [];
  const activeSchool = userEscolas.find(school => school.ativo === 1);
  
  return activeSchool ? activeSchool.id_escola : 0;
};
```

#### 4. **Estado Inicial com Escola Padrão**
```typescript
const [novaMatricula, setNovaMatricula] = useState<NovaMatriculaData>({
  id_escola: getDefaultEscola(),
  // ... outros campos
});
```

#### 5. **useEffect para Atualizar Escola Padrão**
```typescript
useEffect(() => {
  const defaultEscola = getDefaultEscola();
  if (defaultEscola > 0 && novaMatricula.id_escola === 0) {
    setNovaMatricula(prev => ({
      ...prev,
      id_escola: defaultEscola
    }));
  }
}, [user, escolas]);
```

#### 6. **Filtragem no Select de Escolas**
```typescript
<select value={novaMatricula.id_escola} onChange={...}>
  <option value={0}>Selecione uma escola</option>
  {getUserEscolas().map(escola => (
    <option key={escola.id_escola} value={escola.id_escola}>
      {escola.nome_escola}
    </option>
  ))}
</select>
```

#### 7. **Mensagens Informativas**
```typescript
{user && user.id_tipo_utilizador !== 1 && novaMatricula.id_escola > 0 && (
  <p className="text-xs text-blue-600 mt-1">
    ✓ Escola pré-selecionada com base nas suas atribuições
  </p>
)}
{user && user.id_tipo_utilizador === 1 && (
  <p className="text-xs text-gray-500 mt-1">
    Super Admin: Pode selecionar qualquer escola
  </p>
)}
```

## Comportamento por Tipo de Usuário

### **Super Admin (role 1)**
- ✅ Vê todas as escolas disponíveis
- ❌ Não tem escola pré-selecionada
- ℹ️ Mensagem: "Super Admin: Pode selecionar qualquer escola"
- 🔄 Deve escolher manualmente a escola

### **Admin Local (role 2)**
- ✅ Vê apenas escolas atribuídas
- ✅ Escola pré-selecionada automaticamente
- ℹ️ Mensagem: "✓ Escola pré-selecionada com base nas suas atribuições"
- 🔄 Pode alterar se tiver múltiplas escolas

### **Outros Roles (3, 4, 5)**
- ✅ Vê apenas escolas atribuídas
- ✅ Escola pré-selecionada automaticamente
- ℹ️ Mensagem: "✓ Escola pré-selecionada com base nas suas atribuições"
- 🔄 Pode alterar se tiver múltiplas escolas

## Vantagens da Implementação

### 1. **Segurança**
- Respeita permissões do usuário
- Não permite acesso a escolas não autorizadas
- Validação automática de atribuições

### 2. **Usabilidade**
- Reduz cliques desnecessários
- Interface mais intuitiva
- Feedback visual claro

### 3. **Eficiência**
- Pré-seleção automática
- Filtragem inteligente
- Menos erros de seleção

### 4. **Flexibilidade**
- Super Admin mantém controle total
- Outros usuários têm experiência otimizada
- Permite alteração se necessário

## Fluxo de Funcionamento

### 1. **Carregamento da Página**
- Busca dados do usuário logado
- Carrega lista de escolas
- Aplica filtros baseados em permissões

### 2. **Inicialização do Formulário**
- Determina escola padrão baseada no role
- Pré-seleciona escola para usuários não-Super Admin
- Exibe mensagens informativas

### 3. **Interação do Usuário**
- Super Admin: Escolhe escola manualmente
- Outros: Escola já selecionada, pode alterar se necessário
- Feedback visual em tempo real

### 4. **Validação e Submissão**
- Valida se escola selecionada é permitida
- Submete dados com escola correta
- Mantém consistência de permissões

## Testes Recomendados

### 1. **Teste com Super Admin**
- [ ] Verifica se vê todas as escolas
- [ ] Confirma que não há pré-seleção
- [ ] Testa seleção manual de diferentes escolas

### 2. **Teste com Admin Local**
- [ ] Verifica se vê apenas escolas atribuídas
- [ ] Confirma pré-seleção automática
- [ ] Testa alteração de escola se múltiplas disponíveis

### 3. **Teste com Usuário sem Escolas**
- [ ] Verifica comportamento quando não há escolas atribuídas
- [ ] Confirma mensagens de erro apropriadas

### 4. **Teste de Segurança**
- [ ] Verifica se não consegue acessar escolas não autorizadas
- [ ] Confirma validação no backend

## Próximos Passos

1. **Testar funcionalidade** em ambiente de desenvolvimento
2. **Validar permissões** com diferentes tipos de usuário
3. **Implementar melhorias** baseadas em feedback
4. **Adicionar logs** para auditoria de seleções
5. **Otimizar performance** para grandes volumes de escolas

## Conclusão

A implementação da escola pré-selecionada na nova matrícula melhora significativamente a experiência do usuário, especialmente para administradores locais que trabalham com escolas específicas. A funcionalidade mantém a segurança do sistema enquanto otimiza o fluxo de trabalho, reduzindo erros e melhorando a eficiência operacional. 