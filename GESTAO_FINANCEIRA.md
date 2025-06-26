# Gestão Financeira - Sistema de Gestão de Escolas de Condução

## Visão Geral

A funcionalidade de Gestão Financeira permite aos Super Administradores monitorar e gerir o estado financeiro dos alunos, incluindo dívidas, pagamentos e relatórios detalhados.

## Funcionalidades Principais

### 1. Dashboard Financeiro
- **Estatísticas em Tempo Real**: Visualização de métricas financeiras importantes
- **Progresso de Pagamentos**: Barra de progresso mostrando percentual de pagamentos realizados
- **Alertas Inteligentes**: Sistema de alertas para situações que precisam de atenção
- **Resumo de Parcelas**: Status detalhado de todas as parcelas

### 2. Relatórios de Alunos em Dívida
- **Lista Completa**: Todos os alunos com parcelas pendentes
- **Filtros Avançados**: 
  - Por escola
  - Por status da parcela (Pendente, Vencida, Paga)
  - Por dias de atraso (1+, 7+, 30+, 90+ dias)
- **Exportação CSV**: Geração de relatórios para análise externa

### 3. Detalhes Financeiros por Aluno
- **Resumo Financeiro**: Valor total, pago, pendente e percentual
- **Histórico de Parcelas**: Status de cada parcela individual
- **Informações de Contato**: Dados para follow-up

## Acesso e Permissões

### Super Administrador (ID: 1)
- ✅ Acesso completo a todos os relatórios financeiros
- ✅ Visualização de alunos de todas as escolas
- ✅ Exportação de relatórios
- ✅ Gestão financeira completa

### Outros Usuários
- ❌ Acesso bloqueado
- ❌ Redirecionamento para página de erro de acesso

## Estrutura de Dados

### Interfaces TypeScript
```typescript
interface Aluno {
  id_aluno: number;
  nome_completo: string;
  numero_ficha: string;
  telefone_principal: string;
  email?: string;
  id_escola: number;
  nome_escola?: string;
  matriculas: Matricula[];
}

interface EstatisticasFinanceiras {
  total_alunos: number;
  alunos_com_dividas: number;
  valor_total_devido: number;
  valor_total_recebido: number;
  percentual_recebido: number;
  parcelas_vencidas: number;
  parcelas_pendentes: number;
}
```

## APIs Utilizadas

### Backend Endpoints
- `GET /api/alunos/dividas` - Lista alunos com dívidas
- `GET /api/dashboard/payment-stats` - Estatísticas de pagamentos
- `GET /api/pagamentos/matricula/:matriculaId` - Pagamentos por matrícula

### Modelos de Dados
- **Aluno**: Informações básicas do aluno
- **Matricula**: Dados da matrícula e custos
- **Parcela**: Parcelas individuais e status
- **Pagamento**: Histórico de pagamentos realizados

## Componentes Frontend

### 1. SystemReports.tsx
- Página principal de relatórios financeiros
- Integração com dashboard e filtros
- Modal de detalhes do aluno

### 2. FinancialDashboard.tsx
- Componente de dashboard com estatísticas
- Barra de progresso de pagamentos
- Alertas e recomendações

### 3. Types (financial.ts)
- Definições TypeScript para tipagem
- Interfaces para dados financeiros

## Funcionalidades de Filtro

### Filtros Disponíveis
1. **Escola**: Filtrar por escola específica
2. **Status da Parcela**: 
   - Pendente
   - Vencida
   - Paga
3. **Dias de Atraso**:
   - 1+ dias
   - 7+ dias
   - 30+ dias
   - 90+ dias

### Lógica de Filtros
- Filtros são aplicados em tempo real
- Contador de resultados atualizado dinamicamente
- Exportação respeita filtros aplicados

## Exportação de Relatórios

### Formato CSV
O relatório exportado inclui:
- Nome do aluno
- Número de ficha
- Telefone
- Email
- Escola
- Total devido
- Número de parcelas pendentes

### Nome do Arquivo
`relatorio-alunos-dividas-YYYY-MM-DD.csv`

## Alertas e Recomendações

### Tipos de Alerta
1. **Parcelas Vencidas**: Alerta vermelho para parcelas em atraso
2. **Baixo Percentual**: Alerta laranja para pagamentos abaixo de 50%
3. **Muitos Alunos**: Alerta azul para mais de 10 alunos em dívida
4. **Excelente Performance**: Alerta verde para pagamentos acima de 80%

## Navegação

### Menu Lateral
- **Relatórios Financeiro**: Item no menu do Super Admin
- **Rota**: `/admin/reports`
- **Ícone**: BarChart3 (Lucide React)

### Breadcrumb
```
Dashboard > Relatórios Financeiro
```

## Responsividade

### Breakpoints
- **Mobile**: Layout em coluna única
- **Tablet**: Grid 2 colunas para estatísticas
- **Desktop**: Grid 4 colunas para estatísticas

### Componentes Responsivos
- Cards de estatísticas
- Tabela de alunos
- Filtros
- Modal de detalhes

## Performance

### Otimizações
- Carregamento assíncrono de dados
- Filtros aplicados no frontend
- Paginação virtual para grandes listas
- Cache de dados estatísticos

### Limitações
- Máximo 1000 alunos por consulta
- Timeout de 10 segundos para APIs
- Cache expira em 5 minutos

## Manutenção

### Logs
- Erros de API são logados no console
- Métricas de performance monitoradas
- Acessos registrados para auditoria

### Backup
- Dados financeiros incluídos no backup diário
- Relatórios exportados mantidos por 30 dias
- Logs de auditoria preservados por 1 ano

## Próximas Funcionalidades

### Planejadas
- [ ] Gráficos interativos (Chart.js)
- [ ] Notificações por email para dívidas
- [ ] Relatórios por período
- [ ] Integração com sistemas de pagamento
- [ ] Dashboard para gestores financeiros

### Em Desenvolvimento
- [ ] Relatórios em PDF
- [ ] Alertas automáticos
- [ ] Histórico de mudanças de status

## Suporte

### Contato
Para dúvidas sobre a funcionalidade de gestão financeira:
- Email: suporte@sge-conducao.com
- Documentação: `/docs/gestao-financeira`
- Issues: GitHub Issues

### Troubleshooting
1. **Dados não carregam**: Verificar conexão com API
2. **Filtros não funcionam**: Limpar cache do navegador
3. **Exportação falha**: Verificar permissões de download
4. **Performance lenta**: Verificar quantidade de dados 