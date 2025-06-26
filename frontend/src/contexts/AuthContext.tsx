// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { User, AuthContextType, LoginResponse, UserRole } from '../types/auth';
import { useNavigation } from '@/hooks/UseNavigation';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the API client instance
const apiClient = axios.create({
  baseURL: 'http://18.206.244.149:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AuthProviderProps {
  children: ReactNode;
}

// Extended User interface to include assigned schools
interface ExtendedUser extends User {
  escolas_atribuidas?: Array<{
    id_escola: number;
    nome_escola: string;
    ativo: number;
  }>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [interceptorsReady, setInterceptorsReady] = useState(false);
  const { navigateToRole, navigateToLogin } = useNavigation();

  // Function to clear auth data
  const clearAuthData = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setInterceptorsReady(false);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Function to set auth data
  const setAuthData = (data: LoginResponse) => {
    setUser(data.user as ExtendedUser);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setIsAuthenticated(true);

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  };

  // Function to check if token is valid
  const isTokenValid = (token?: string): boolean => {
    const tokenToCheck = token || accessToken;
    if (!tokenToCheck) return false;
    
    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;
      console.log('Token validation:', { 
        exp: payload.exp, 
        current: currentTime, 
        valid: isValid,
        tokenPreview: tokenToCheck.substring(0, 50) 
      });
      return isValid;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  };

  // Setup interceptors immediately when tokens change
  useEffect(() => {
    console.log('Setting up interceptors with token:', accessToken?.substring(0, 50));

    // Clear existing interceptors first
    apiClient.interceptors.request.clear();
    apiClient.interceptors.response.clear();

    // Request interceptor
    const requestInterceptor = apiClient.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        console.log('🔍 Request interceptor triggered');
        console.log('Current token:', accessToken?.substring(0, 50));
        console.log('Token valid:', isTokenValid());
        
        if (accessToken && isTokenValid(accessToken)) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log('✅ Token attached to request');
        } else {
          console.log('❌ No valid token to attach');
        }
        
        console.log('Request URL:', config.url);
        console.log('Has Auth Header:', !!config.headers.Authorization);
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
        console.log('✅ Response success:', response.status, response.config.url);
        return response;
      },
      async (error: AxiosError) => {
        console.error('❌ Response error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (
          error.response?.status === 401 && 
          refreshToken && 
          !originalRequest?._retry
        ) {
          originalRequest._retry = true;
          console.log('🔄 Attempting token refresh...');

          try {
            const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh-token`, {
              refreshToken: refreshToken,
            });

            const { accessToken: newAccessToken } = response.data;
            console.log('✅ Token refreshed successfully');
            
            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            console.log('🔄 Retrying original request with new token');
            return apiClient(originalRequest);
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            clearAuthData();
            navigateToLogin();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Mark interceptors as ready
    setInterceptorsReady(true);
    console.log('🔧 Interceptors set up and ready');

    // Cleanup function
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
      setInterceptorsReady(false);
      console.log('🧹 Interceptors cleaned up');
    };
  }, [accessToken, refreshToken, navigateToLogin]);

  // Initial auth check
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedAccessToken = localStorage.getItem('accessToken');
        const savedRefreshToken = localStorage.getItem('refreshToken');

        console.log('Inicializando auth:', {
          hasUser: !!savedUser,
          hasAccessToken: !!savedAccessToken,
          hasRefreshToken: !!savedRefreshToken
        });

        if (savedUser && savedAccessToken && savedRefreshToken) {
          if (isTokenValid(savedAccessToken)) {
            const userData = JSON.parse(savedUser) as ExtendedUser;
            setUser(userData);
            setAccessToken(savedAccessToken);
            setRefreshToken(savedRefreshToken);
            setIsAuthenticated(true);
            console.log('Auth inicializado com sucesso:', userData);
          } else {
            console.log('Token inválido, limpando dados');
            clearAuthData();
          }
        } else {
          console.log('Dados de auth não encontrados');
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Tentando fazer login...');
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        senha: password,
      });

      console.log('Login bem-sucedido:', response.data);
      setAuthData(response.data);
      
      // Redirecionar baseado no role do usuário
      const userRole = response.data.user.id_tipo_utilizador;
      navigateToRole(userRole);
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.status === 401) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (err.response?.status >= 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Tempo limite de conexão esgotado.';
        } else if (err.message === 'Network Error') {
          errorMessage = 'Erro de rede. Verifique sua conexão.';
        }
      }
      
      setError(errorMessage);
      clearAuthData();
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', {
          refreshToken: refreshToken,
        });
      }
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error);
    } finally {
      clearAuthData();
      setIsLoading(false);
      navigateToLogin();
    }
  };

  const canAccessSchool = (schoolId: string): boolean => {
    if (!user) return false;
    if (user.id_tipo_utilizador === 1) return true; // Super Admin can access all schools
    
    // Check if user has access to the specific school
    const userSchools = user.escolas_atribuidas || [];
    return userSchools.some(school => school.id_escola.toString() === schoolId && school.ativo === 1);
  };

  const getCurrentUserSchool = (): string | null => {
    if (!user) return null;
    
    // Super Admin doesn't have a specific school
    if (user.id_tipo_utilizador === 1) return null;
    
    // Get the first active school assignment
    const userSchools = user.escolas_atribuidas || [];
    const activeSchool = userSchools.find(school => school.ativo === 1);
    
    return activeSchool ? activeSchool.id_escola.toString() : null;
  };

  const getCurrentUser = async (): Promise<User | null> => {
    if (!accessToken || !isTokenValid(accessToken)) {
      console.log('getCurrentUser: Token inválido');
      return null;
    }

    try {
      const response = await apiClient.get<{ user: ExtendedUser }>('/auth/me');
      const userData = response.data.user;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthData();
        navigateToLogin();
      }
      return null;
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put<{ user: User }>('/auth/profile', profileData);
      const updatedUser = response.data.user;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Dados inválidos fornecidos');
        } else if (error.response?.status === 403) {
          throw new Error('Não tem permissão para atualizar este perfil');
        } else if (error.response?.status === 401) {
          clearAuthData();
          navigateToLogin();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }
      throw new Error('Erro ao atualizar perfil');
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    canAccessSchool,
    getCurrentUserSchool,
    accessToken,
    refreshToken,
    isTokenValid: () => accessToken ? isTokenValid(accessToken) : false,
    getCurrentUser,
    updateProfile,
    apiClient,
    error,
    isAuthenticated,
    interceptorsReady, // Add this to the context
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthenticatedRequest() {
  const { apiClient, accessToken, isTokenValid } = useAuth();

  const request = async (config: any) => {
    if (!accessToken || !isTokenValid()) {
      throw new Error('Token inválido ou expirado. Faça login novamente.');
    }

    try {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      
      const response = await apiClient(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            throw new Error('Não autorizado. Faça login novamente.');
          } else if (status === 403) {
            throw new Error('Acesso negado. Você não tem permissão para esta ação.');
          } else if (status === 404) {
            throw new Error('Recurso não encontrado.');
          } else if (status >= 500) {
            throw new Error('Erro no servidor. Tente novamente mais tarde.');
          }
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Tempo limite de conexão esgotado.');
        } else if (error.message === 'Network Error') {
          throw new Error('Erro de rede. Verifique sua conexão.');
        }
      }
      throw new Error('Erro inesperado ao fazer requisição autenticada.');
    }
  };

  return { request, apiClient };
}