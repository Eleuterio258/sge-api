import React from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { EstatisticasFinanceiras } from "../types/financial";

interface FinancialDashboardProps {
  estatisticas: EstatisticasFinanceiras;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ estatisticas }) => {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    });
  };

  const calcularPercentualRecebido = (): number => {
    if (estatisticas.valor_total_devido === 0) return 0;
    return (estatisticas.valor_total_recebido / estatisticas.valor_total_devido) * 100;
  };

  const percentualRecebido = calcularPercentualRecebido();

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Alunos com Dívidas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alunos com Dívidas</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.alunos_com_dividas}</p>
            </div>
          </div>
        </div>

        {/* Total Devido */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Devido</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(estatisticas.valor_total_devido)}</p>
            </div>
          </div>
        </div>

        {/* Total Recebido */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recebido</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(estatisticas.valor_total_recebido)}</p>
            </div>
          </div>
        </div>

        {/* Parcelas Vencidas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Parcelas Vencidas</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.parcelas_vencidas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso do Pagamento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso de Pagamentos</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Percentual Pago</span>
            <span className="text-sm font-medium text-gray-900">{percentualRecebido.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(percentualRecebido, 100)}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Valor Pago:</p>
              <p className="font-semibold text-green-600">{formatCurrency(estatisticas.valor_total_recebido)}</p>
            </div>
            <div>
              <p className="text-gray-600">Valor Pendente:</p>
              <p className="font-semibold text-red-600">{formatCurrency(estatisticas.valor_total_devido - estatisticas.valor_total_recebido)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumo de Parcelas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Parcelas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de Parcelas:</span>
              <span className="font-semibold">{estatisticas.parcelas_pendentes + (estatisticas.valor_total_recebido > 0 ? Math.ceil(estatisticas.valor_total_recebido / 1000) : 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Parcelas Pendentes:</span>
              <span className="font-semibold text-yellow-600">{estatisticas.parcelas_pendentes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Parcelas Vencidas:</span>
              <span className="font-semibold text-red-600">{estatisticas.parcelas_vencidas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Parcelas Pagas:</span>
              <span className="font-semibold text-green-600">{estatisticas.valor_total_recebido > 0 ? Math.ceil(estatisticas.valor_total_recebido / 1000) : 0}</span>
            </div>
          </div>
        </div>

        {/* Alertas e Recomendações */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Recomendações</h3>
          <div className="space-y-3">
            {estatisticas.parcelas_vencidas > 0 && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Parcelas Vencidas</p>
                  <p className="text-xs text-red-600">{estatisticas.parcelas_vencidas} parcelas precisam de atenção urgente</p>
                </div>
              </div>
            )}
            
            {percentualRecebido < 50 && (
              <div className="flex items-start space-x-2">
                <TrendingDown className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Baixo Percentual de Pagamento</p>
                  <p className="text-xs text-orange-600">Apenas {percentualRecebido.toFixed(1)}% do total foi pago</p>
                </div>
              </div>
            )}

            {estatisticas.alunos_com_dividas > 10 && (
              <div className="flex items-start space-x-2">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Muitos Alunos em Dívida</p>
                  <p className="text-xs text-blue-600">{estatisticas.alunos_com_dividas} alunos precisam de acompanhamento</p>
                </div>
              </div>
            )}

            {percentualRecebido >= 80 && (
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Excelente Performance</p>
                  <p className="text-xs text-green-600">{percentualRecebido.toFixed(1)}% de pagamentos realizados</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard; 