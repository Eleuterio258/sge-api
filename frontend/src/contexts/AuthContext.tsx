// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { User, AuthContextType, LoginResponse, UserRole } from '../types/auth';
import { useNavigation } from '@/hooks/useNavigation';
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuração base do Axios
const apiClient = axios.create({
 baseURL: 'http://localhost:4000/api',
 timeout: 10000,
 headers: {
   'Content-Type': 'application/json',
 },
});

interface AuthProviderProps {
 children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
 const [user, setUser] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [accessToken, setAccessToken] = useState<string | null>(null);
 const [refreshToken, setRefreshToken] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const { navigateToRole, navigateToLogin } = useNavigation();

 // Function to clear auth data
 const clearAuthData = () => {
   setUser(null);
   setAccessToken(null);
   setRefreshToken(null);
   setIsAuthenticated(false);
   localStorage.removeItem('user');
   localStorage.removeItem('accessToken');
   localStorage.removeItem('refreshToken');
 };

 // Function to set auth data
 const setAuthData = (data: LoginResponse) => {
   setUser(data.user);
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
           const userData = JSON.parse(savedUser);
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
       console.error('Error initializing auth:', error);
       clearAuthData();
     } finally {
       setIsLoading(false);
     }
   };

   initializeAuth();
 }, []);

 // Axios interceptors
 useEffect(() => {
   // Request interceptor
   const requestInterceptor = apiClient.interceptors.request.use(
     (config: AxiosRequestConfig) => {
       console.log('Request interceptor - Token atual:', accessToken?.substring(0, 50));
       console.log('Request interceptor - Token válido:', isTokenValid());
       
       if (accessToken && isTokenValid(accessToken)) {
         if (config.headers) {
           config.headers.Authorization = `Bearer ${accessToken}`;
         } else {
           config.headers = { Authorization: `Bearer ${accessToken}` };
         }
         console.log('Token anexado à requisição');
       } else {
         console.log('Token não anexado - inválido ou inexistente');
       }
       
       console.log('Request config final:', {
         url: config.url,
         method: config.method,
         headers: config.headers
       });
       
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
       console.log('Response interceptor - Success:', response.status);
       return response;
     },
     async (error: AxiosError) => {
       console.error('Response interceptor - Error:', {
         status: error.response?.status,
         message: error.message,
         url: error.config?.url
       });

       const originalRequest = error.config as any;

       if (
         error.response?.status === 401 && 
         refreshToken && 
         !originalRequest?._retry
       ) {
         originalRequest._retry = true;
         console.log('Tentando refresh do token...');

         try {
           const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh-token`, {
             refreshToken: refreshToken,
           });

           const { accessToken: newAccessToken } = response.data;
           console.log('Token refreshed com sucesso');
           
           setAccessToken(newAccessToken);
           localStorage.setItem('accessToken', newAccessToken);

           if (originalRequest && originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
             console.log('Reenviando requisição original com novo token');
             return apiClient(originalRequest);
           }
         } catch (refreshError) {
           console.error('Token refresh failed:', refreshError);
           clearAuthData();
           navigateToLogin();
           return Promise.reject(refreshError);
         }
       }

       return Promise.reject(error);
     }
   );

   return () => {
     apiClient.interceptors.request.eject(requestInterceptor);
     apiClient.interceptors.response.eject(responseInterceptor);
   };
 }, [accessToken, refreshToken, navigateToLogin]);

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
  if (user.id_tipo_utilizador === 1) return true; // Super Admin
  return user.schoolId === schoolId;
};

const getCurrentUserSchool = (): string | null => {
  return user?.schoolId || null;
};

const getCurrentUser = async (): Promise<User | null> => {
  if (!accessToken || !isTokenValid(accessToken)) {
    console.log('getCurrentUser: Token inválido');
    return null;
  }

  try {
    const response = await apiClient.get<{ user: User }>('/auth/me');
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

const request = async <T>(config: any): Promise<T> => {
  if (!accessToken || !isTokenValid()) {
    throw new Error('Token inválido ou expirado. Faça login novamente.');
  }

  try {
    // Garantir que o token está nos headers
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${accessToken}`;
    
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