import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AlertCircle } from "lucide-react";

const SystemReports: React.FC = () => {
  const { user } = useAuth();
  // Bloqueio de acesso para não Super Admin
  if (!user || user.id_tipo_utilizador !== 1) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro de Acesso
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Você não tem permissão para acessar esta funcionalidade. Apenas Super Admins podem acessar relatórios do sistema.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Relatórios do Sistema</h1>
      <p className="text-muted-foreground">Em breve: relatórios do sistema.</p>
    </div>
  );
};

export default SystemReports; 