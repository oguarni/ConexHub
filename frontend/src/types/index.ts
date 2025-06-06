// ✅ Tipos principais da aplicação
export interface User {
  readonly id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  sector?: IndustrialSector;
  isApproved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'buyer' | 'supplier';

export type IndustrialSector = 
  | 'metalurgia'
  | 'automotivo' 
  | 'petrochemical'
  | 'alimenticio'
  | 'textil'
  | 'construcao'
  | 'eletroeletronico'
  | 'farmaceutico'
  | 'papel'
  | 'outros';

export interface Product {
  readonly id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: ProductCategory;
  image: string;
  supplier: string;
  supplierId: string;
  minQuantity: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = 
  | 'Maquinário'
  | 'Matéria-Prima'
  | 'Componentes'
  | 'Ferramentas'
  | 'Equipamentos';

export interface Quote {
  readonly id: string;
  productId: string;
  productName: string;
  productImage?: string;
  buyerId: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unit: string;
  urgency: QuoteUrgency;
  status: QuoteStatus;
  unitPrice?: number;
  totalPrice?: number;
  deliveryTime?: number;
  deliveryAddress?: string;
  specifications?: string;
  message?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = 'pending' | 'responded' | 'accepted' | 'rejected';
export type QuoteUrgency = 'normal' | 'urgent' | 'express';

export interface Order {
  readonly id: string;
  orderNumber: string;
  quoteId: string;
  productId: string;
  productName: string;
  buyerId: string;
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  deliveryAddress?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// ✅ Tipos para formulários
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  companyName: string;
  role: UserRole;
  address: string;
  phone: string;
  sector: IndustrialSector;
}

export interface ProductForm {
  name: string;
  description: string;
  price: string;
  unit: string;
  category: ProductCategory;
  image: string;
  minQuantity: number;
}

export interface QuoteForm {
  quantity: number;
  urgency: QuoteUrgency;
  deliveryAddress: string;
  specifications?: string;
  message?: string;
}

// ✅ Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse extends ApiResponse {
  token: string;
  user: User;
}

// ✅ Tipos para filtros e busca
export interface ProductFilters {
  search?: string;
  category?: ProductCategory | 'Todas';
  minPrice?: string;
  maxPrice?: string;
  supplier?: string;
  page?: number;
  limit?: number;
}

export interface QuoteFilters {
  status?: QuoteStatus;
  urgency?: QuoteUrgency;
  dateFrom?: string;
  dateTo?: string;
}

// ✅ Tipos para contextos
export interface UIState {
  isMenuOpen: boolean;
  selectedCategory: ProductCategory | 'Todas';
  searchTerm: string;
  notifications: Notification[];
  modals: {
    showAuth: boolean;
    showQuotes: boolean;
    showQuoteModal: boolean;
    showAdmin: boolean;
    showQuoteSuccess: boolean;
    showQuoteComparison: boolean;
    showOrders: boolean;
  };
  isLogin: boolean;
}

export interface Notification {
  readonly id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  description?: string;
  autoHide?: boolean;
  duration?: number;
  timestamp: string;
}

// ✅ Tipos para hooks
export interface UseFormReturn<T> {
  form: T;
  updateField: (field: keyof T, value: T[keyof T]) => void;
  resetForm: () => void;
  setForm: (newForm: T) => void;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string;
  validationErrors: Record<string, string>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterForm) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  getUserDisplayInfo: () => UserDisplayInfo | null;
}

export interface UserDisplayInfo {
  name: string;
  company: string;
  role: UserRole;
  roleLabel: string;
  cnpj: string;
  email: string;
}

// ✅ Tipos para componentes
export interface ProductCardProps {
  product: Product;
  user: User | null;
  onRequestQuote: (product: Product) => void;
}

export interface SearchAndFiltersProps {
  onFiltersChange: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
  showAdvancedFilters?: boolean;
  className?: string;
}

export interface LoadingProps {
  text?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'gray';
}

// ✅ Tipos para validação
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  flatErrors: string[];
}

export interface ValidationRule<T = any> {
  validator: (value: T, data?: Record<string, any>) => boolean;
  message: string;
  required?: boolean;
  async?: boolean;
}

// ✅ Tipos para erro handling
export interface ProcessedError {
  status: number;
  code: string;
  message: string;
  details: any;
  errors: any;
  timestamp: string;
  type: ErrorType;
  userMessage: string;
  retryable: boolean;
  requiresAuth?: boolean;
  retryAfter?: number;
}

export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'UNPROCESSABLE_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'SECURITY_ERROR'
  | 'COMPONENT_ERROR'
  | 'UNKNOWN_ERROR';

// ✅ Tipos para performance
export interface PerformanceData {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  timeSinceMount: number;
  renderFrequency: number;
  isSlowRender: boolean;
  hasExcessiveRenders: boolean;
}

// ✅ Utilitários de tipo
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ✅ Tipos de evento
export type FormEvent = React.FormEvent<HTMLFormElement>;
export type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type ClickEvent = React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>;
export type KeyboardEvent = React.KeyboardEvent<HTMLElement>;

// ✅ Constants com tipagem
export const USER_ROLES: Record<UserRole, string> = {
  admin: 'Administrador',
  buyer: 'Comprador',
  supplier: 'Fornecedor'
} as const;

export const QUOTE_STATUSES: Record<QuoteStatus, string> = {
  pending: 'Aguardando resposta',
  responded: 'Cotação recebida',
  accepted: 'Cotação aceita',
  rejected: 'Cotação rejeitada'
} as const;

export const ORDER_STATUSES: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
} as const;