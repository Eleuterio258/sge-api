// components/LoginPage.tsx
import { useState, useEffect } from 'react';
import { Car, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
 
import { useNavigation } from '../hooks/UseNavigation';
import { getRoleBasedRoute, getWelcomeMessage } from '@/Utils/RoleRouting';

export default function LoginPage() {
  const [email, setEmail] = useState('superadmin@example.com');
  const [password, setPassword] = useState('senhaSegura123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const { navigate } = useNavigation();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const redirectPath = getRoleBasedRoute(user.id_tipo_utilizador);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // O redirecionamento é feito automaticamente no contexto
    } catch (err: any) {
      setError(err.message || 'Email ou senha incorretos');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostra loading se estiver redirecionando
  if ((isAuthenticated && user) || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            {user ? `Redirecionando para o painel...` : 'Carregando...'}
          </p>
          {user && (
            <p className="text-sm text-muted-foreground mt-2">
              {getWelcomeMessage(user.id_tipo_utilizador)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">DrivingSchool</h1>
          <p className="text-muted-foreground text-lg">Management System</p>
        </div>

        {/* Login Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          {/* Card Header */}
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              Acesso ao Sistema
            </h3>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>
          
          {/* Card Content */}
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="relative w-full rounded-lg border border-destructive/50 p-4 text-destructive [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <div className="text-sm [&_p]:leading-relaxed">
                    {error}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </>
               ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Desenvolvido para gestão completa de escolas de condução</p>
        <p className="mt-1">© 2024 DrivingSchool - Todos os direitos reservados</p>
      </div>
    </div>
  </div>
);
}