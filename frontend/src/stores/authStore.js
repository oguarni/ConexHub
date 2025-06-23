import { create } from 'zustand';
import { persist, subscribeWithSelector, devtools } from 'zustand/middleware';
import { apiService } from '../services/api';

const useAuthStore = create(
  subscribeWithSelector(
    devtools(
      persist(
        (set, get) => ({
          // Auth state
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,

          // Sample users for demo (fallback when API fails)
          sampleUsers: {
            'joao@empresa.com': {
              id: 1,
              name: 'João Silva',
              email: 'joao@empresa.com', 
              role: 'buyer',
              companyName: 'Empresa Demo Ltda',
              address: 'Rua das Empresas, 123',
              phone: '(11) 99999-1234'
            },
            'carlos@fornecedor.com': {
              id: 2,
              name: 'Carlos Fornecedor',
              email: 'carlos@fornecedor.com',
              role: 'supplier',
              companyName: 'Carlos Santos - Fornecedor',
              address: 'Av. dos Fornecedores, 456', 
              phone: '(11) 99999-5678'
            },
            'admin@b2bmarketplace.com': {
              id: 3,
              name: 'Admin',
              email: 'admin@b2bmarketplace.com',
              role: 'admin',
              companyName: 'B2B Marketplace Admin',
              address: 'Sede Principal',
              phone: '(11) 99999-0000'
            }
          },

          // Actions
          setLoading: (loading) => set({ loading }),

          setError: (error) => set({ error }),

          clearError: () => set({ error: null }),

          setUser: (user, token) => {
            set({
              user,
              token,
              isAuthenticated: !!user,
              error: null,
            });

            // Store in localStorage as backup
            if (user && token) {
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
            }
          },

          login: async (email, password) => {
            set({ loading: true, error: null });

            try {
              // Try API first
              try {
                const data = await apiService.login(email, password);
                get().setUser(data.user, data.token);
                
                // Show success notification
                window.dispatchEvent(new CustomEvent('notification:show', {
                  detail: { 
                    type: 'success', 
                    message: 'Login realizado com sucesso!' 
                  }
                }));
                
                return { success: true };
              } catch (apiError) {
                // If API fails, check sample users
                const { sampleUsers } = get();
                const sampleUser = sampleUsers[email];
                
                if (sampleUser && ((email === 'joao@empresa.com' && password === 'buyer123') || 
                                   (email === 'carlos@fornecedor.com' && password === 'supplier123') ||
                                   (email === 'admin@b2bmarketplace.com' && password === 'admin123'))) {
                  const demoToken = 'demo-token-' + Date.now();
                  get().setUser(sampleUser, demoToken);
                  
                  window.dispatchEvent(new CustomEvent('notification:show', {
                    detail: { 
                      type: 'success', 
                      message: 'Login realizado com sucesso!' 
                    }
                  }));
                  
                  return { success: true };
                } else {
                  throw new Error('Credenciais inválidas. Use: joao@empresa.com/buyer123, carlos@fornecedor.com/supplier123, ou admin@b2bmarketplace.com/admin123');
                }
              }
            } catch (error) {
              console.error('Login error:', error);
              set({ error: error.message || 'Login failed' });
              return { success: false, error: error.message };
            } finally {
              set({ loading: false });
            }
          },

          register: async (userData) => {
            set({ loading: true, error: null });

            try {
              const data = await apiService.register(userData);
              get().setUser(data.user, data.token);
              
              window.dispatchEvent(new CustomEvent('notification:show', {
                detail: { 
                  type: 'success', 
                  message: 'Registro realizado com sucesso!' 
                }
              }));
              
              return { success: true };
            } catch (error) {
              console.error('Registration error:', error);
              set({ error: error.message || 'Registration failed' });
              return { success: false, error: error.message };
            } finally {
              set({ loading: false });
            }
          },

          logout: () => {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Clear any persisted data
            // Note: Zustand persist will handle this automatically
          },

          // Initialize from localStorage on app start
          initializeAuth: () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
              try {
                const user = JSON.parse(userData);
                set({
                  user,
                  token,
                  isAuthenticated: true,
                });
              } catch (error) {
                console.error('Error loading user data:', error);
                get().logout();
              }
            }

            // Listen for auth errors from API interceptor
            const handleAuthError = (event) => {
              console.log('Auth error detected, logging out user');
              get().logout();
              
              // Show auth modal for re-login
              window.dispatchEvent(new CustomEvent('ui:show-auth', {
                detail: { message: event.detail?.message || 'Sessão expirada. Faça login novamente.' }
              }));
            };

            window.addEventListener('auth:error', handleAuthError);
            
            // Store cleanup function for potential future use
            get()._authErrorCleanup = () => {
              window.removeEventListener('auth:error', handleAuthError);
            };
          },

          // Refresh token if needed
          refreshToken: async () => {
            const { token } = get();
            if (!token) return;

            try {
              const data = await apiService.refreshToken(token);
              get().setUser(data.user, data.token);
            } catch (error) {
              console.error('Token refresh failed:', error);
              get().logout();
            }
          },

          // Update user profile
          updateProfile: async (profileData) => {
            set({ loading: true, error: null });

            try {
              const updatedUser = await apiService.updateProfile(profileData);
              const { token } = get();
              get().setUser(updatedUser, token);
              
              window.dispatchEvent(new CustomEvent('notification:show', {
                detail: { 
                  type: 'success', 
                  message: 'Perfil atualizado com sucesso!' 
                }
              }));
              
              return { success: true };
            } catch (error) {
              console.error('Profile update error:', error);
              set({ error: error.message || 'Profile update failed' });
              return { success: false, error: error.message };
            } finally {
              set({ loading: false });
            }
          },

          // Password reset
          requestPasswordReset: async (email) => {
            set({ loading: true, error: null });

            try {
              await apiService.requestPasswordReset(email);
              
              window.dispatchEvent(new CustomEvent('notification:show', {
                detail: { 
                  type: 'success', 
                  message: 'Email de recuperação enviado!' 
                }
              }));
              
              return { success: true };
            } catch (error) {
              console.error('Password reset request error:', error);
              set({ error: error.message || 'Password reset request failed' });
              return { success: false, error: error.message };
            } finally {
              set({ loading: false });
            }
          },

          // Reset password with token
          resetPassword: async (token, newPassword) => {
            set({ loading: true, error: null });

            try {
              await apiService.resetPassword(token, newPassword);
              
              window.dispatchEvent(new CustomEvent('notification:show', {
                detail: { 
                  type: 'success', 
                  message: 'Senha alterada com sucesso!' 
                }
              }));
              
              return { success: true };
            } catch (error) {
              console.error('Password reset error:', error);
              set({ error: error.message || 'Password reset failed' });
              return { success: false, error: error.message };
            } finally {
              set({ loading: false });
            }
          },

          // Check if user has specific role
          hasRole: (role) => {
            const { user } = get();
            return user?.role === role;
          },

          // Check if user is admin
          isAdmin: () => get().hasRole('admin'),

          // Check if user is supplier
          isSupplier: () => get().hasRole('supplier'),

          // Check if user is buyer
          isBuyer: () => get().hasRole('buyer'),

          // RBAC permission checking (matches backend RBAC system)
          hasPermission: (permission) => {
            const { user } = get();
            if (!user || !user.role) return false;
            
            // Define role permissions (should match backend RBAC)
            const rolePermissions = {
              admin: [
                'users:read', 'users:write', 'users:delete',
                'suppliers:read', 'suppliers:write', 'suppliers:delete', 'suppliers:approve', 'suppliers:reject',
                'products:read', 'products:write', 'products:delete', 'products:approve',
                'orders:read', 'orders:write', 'orders:delete', 'orders:update_status',
                'quotes:read', 'quotes:write', 'quotes:delete', 'quotes:respond',
                'analytics:read', 'reports:read',
                'system:read', 'system:write', 'config:read', 'config:write',
                'constants:read', 'constants:write'
              ],
              supplier: [
                'profile:read', 'profile:write',
                'products:read', 'products:write', 'products:delete_own',
                'orders:read_own', 'orders:update_status_own',
                'quotes:read_own', 'quotes:respond',
                'constants:read'
              ],
              buyer: [
                'profile:read', 'profile:write',
                'products:read',
                'orders:read_own', 'orders:write',
                'quotes:read_own', 'quotes:write', 'quotes:accept', 'quotes:reject',
                'constants:read'
              ]
            };
            
            const userPermissions = rolePermissions[user.role] || [];
            return userPermissions.includes(permission);
          },

          // Check multiple permissions
          hasAnyPermission: (permissions) => {
            return permissions.some(permission => get().hasPermission(permission));
          },

          // Check all permissions
          hasAllPermissions: (permissions) => {
            return permissions.every(permission => get().hasPermission(permission));
          },
        }),
        {
          name: 'auth-store',
          partialize: (state) => ({
            user: state.user,
            token: state.token,
            isAuthenticated: state.isAuthenticated,
          }),
        }
      ),
      {
        name: 'auth-store',
      }
    )
  )
);

// Custom hooks for specific auth concerns
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
  const hasAllPermissions = useAuthStore((state) => state.hasAllPermissions);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export const useUserRole = () => {
  const hasRole = useAuthStore((state) => state.hasRole);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isSupplier = useAuthStore((state) => state.isSupplier);
  const isBuyer = useAuthStore((state) => state.isBuyer);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
  const hasAllPermissions = useAuthStore((state) => state.hasAllPermissions);
  const user = useAuthStore((state) => state.user);

  return {
    role: user?.role,
    hasRole,
    isAdmin,
    isSupplier,
    isBuyer,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default useAuthStore;