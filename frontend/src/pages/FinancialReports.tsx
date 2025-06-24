import React from "react";
import axios from "axios";

const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api', // Troque para 3000 se necessário
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const FinancialReports: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Relatórios Financeiros</h1>
      <p className="text-muted-foreground">Em breve: relatórios financeiros detalhados.</p>
    </div>
  );
};

export default FinancialReports; 