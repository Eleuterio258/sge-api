// components/UnauthorizedPage.tsx
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRoute } from '../utils/roleRouting';

export default function UnauthorizedPage() {
  const { goBack, navigate } = useNavigation();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      const homePath = getRoleBasedRoute(user.id_tipo_utilizador);
      navigate(homePath, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Início
          </button>
        </div>
      </div>
    </div>
  );
}