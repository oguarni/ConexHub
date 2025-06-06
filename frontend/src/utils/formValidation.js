import { validateCNPJ, validateEmail, validatePassword, formatCNPJ, formatPhone } from './validation';

// Sistema de validação baseado em classes com interface fluente
export class FormValidator {
  constructor() {
    this.rules = new Map();
    this.customValidators = new Map();
    this.conditionalRules = new Map();
  }

  // ✅ Adicionar regra de validação simples
  addRule(field, validator, message, options = {}) {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    
    this.rules.get(field).push({ 
      validator, 
      message, 
      required: options.required || false,
      async: options.async || false
    });
    
    return this; // Fluent interface
  }

  // ✅ Adicionar regra condicional
  addConditionalRule(field, condition, validator, message) {
    if (!this.conditionalRules.has(field)) {
      this.conditionalRules.set(field, []);
    }
    
    this.conditionalRules.get(field).push({
      condition,
      validator,
      message
    });
    
    return this;
  }

  // ✅ Validação síncrona principal
  validate(data) {
    const errors = {};
    
    // Validações normais
    for (const [field, rules] of this.rules) {
      const value = data[field];
      
      for (const rule of rules) {
        if (rule.async) continue; // Skip async rules
        
        if (!rule.validator(value, data)) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(rule.message);
        }
      }
    }
    
    // Validações condicionais
    for (const [field, conditionalRules] of this.conditionalRules) {
      const value = data[field];
      
      for (const rule of conditionalRules) {
        if (rule.condition(data) && !rule.validator(value, data)) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(rule.message);
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      flatErrors: this.flattenErrors(errors)
    };
  }

  // ✅ Validação assíncrona para casos especiais
  async validateAsync(data) {
    const syncResult = this.validate(data);
    const asyncErrors = {};
    
    // Executar validações assíncronas
    for (const [field, rules] of this.rules) {
      const value = data[field];
      
      for (const rule of rules) {
        if (rule.async) {
          try {
            const isValid = await rule.validator(value, data);
            if (!isValid) {
              if (!asyncErrors[field]) asyncErrors[field] = [];
              asyncErrors[field].push(rule.message);
            }
          } catch (error) {
            if (!asyncErrors[field]) asyncErrors[field] = [];
            asyncErrors[field].push(`Erro de validação: ${error.message}`);
          }
        }
      }
    }
    
    // Combinar erros síncronos e assíncronos
    const combinedErrors = { ...syncResult.errors, ...asyncErrors };
    
    return {
      isValid: Object.keys(combinedErrors).length === 0,
      errors: combinedErrors,
      flatErrors: this.flattenErrors(combinedErrors)
    };
  }

  // ✅ Validar campo individual
  validateField(field, value, data = {}) {
    const fieldRules = this.rules.get(field) || [];
    const conditionalRules = this.conditionalRules.get(field) || [];
    const errors = [];
    
    // Validações normais
    for (const rule of fieldRules) {
      if (!rule.async && !rule.validator(value, { ...data, [field]: value })) {
        errors.push(rule.message);
      }
    }
    
    // Validações condicionais
    for (const rule of conditionalRules) {
      const fullData = { ...data, [field]: value };
      if (rule.condition(fullData) && !rule.validator(value, fullData)) {
        errors.push(rule.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ✅ Helper para achatar erros
  flattenErrors(errors) {
    const flat = [];
    for (const [field, fieldErrors] of Object.entries(errors)) {
      if (Array.isArray(fieldErrors)) {
        flat.push(...fieldErrors);
      } else {
        flat.push(fieldErrors);
      }
    }
    return flat;
  }

  // ✅ Limpar todas as regras
  clear() {
    this.rules.clear();
    this.conditionalRules.clear();
    return this;
  }
}

// ✅ Validadores predefinidos
export const Validators = {
  required: (value) => value !== null && value !== undefined && value !== '',
  
  email: (value) => !value || validateEmail(value),
  
  cnpj: (value) => !value || validateCNPJ(value),
  
  password: (minLength = 6) => (value) => 
    !value || (value.length >= minLength),
  
  minLength: (min) => (value) => 
    !value || value.toString().length >= min,
  
  maxLength: (max) => (value) => 
    !value || value.toString().length <= max,
  
  numeric: (value) => !value || !isNaN(parseFloat(value)),
  
  positiveNumber: (value) => 
    !value || (!isNaN(parseFloat(value)) && parseFloat(value) > 0),
  
  phone: (value) => !value || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value),
  
  url: (value) => !value || /^https?:\/\/.+/.test(value),
  
  match: (fieldToMatch) => (value, data) => 
    !value || value === data[fieldToMatch],
  
  custom: (fn) => fn
};

// ✅ Validadores específicos para B2B
export const B2BValidators = {
  companyName: (value) => 
    !value || (value.trim().length >= 2 && value.trim().length <= 100),
  
  businessEmail: (value) => {
    if (!value) return true;
    return validateEmail(value) && !value.includes('@gmail.com') && !value.includes('@hotmail.com');
  },
  
  strongPassword: (value) => {
    if (!value) return true;
    return value.length >= 8 && 
           /[A-Z]/.test(value) && 
           /[a-z]/.test(value) && 
           /\d/.test(value);
  },
  
  sector: (value) => {
    const validSectors = [
      'metalurgia', 'automotivo', 'quimica', 'construcao', 
      'alimentos', 'textil', 'eletronicos', 'outros'
    ];
    return !value || validSectors.includes(value);
  }
};

// ✅ Fábrica de validadores para diferentes formulários
export class ValidatorFactory {
  static createAuthValidator(isLogin = false) {
    const validator = new FormValidator()
      .addRule('email', Validators.required, 'Email é obrigatório')
      .addRule('email', Validators.email, 'Email inválido')
      .addRule('password', Validators.required, 'Senha é obrigatória');

    if (!isLogin) {
      validator
        .addRule('name', Validators.required, 'Nome é obrigatório')
        .addRule('name', Validators.minLength(2), 'Nome muito curto')
        .addRule('companyName', Validators.required, 'Razão social é obrigatória')
        .addRule('companyName', B2BValidators.companyName, 'Razão social inválida')
        .addRule('cnpj', Validators.required, 'CNPJ é obrigatório')
        .addRule('cnpj', Validators.cnpj, 'CNPJ inválido')
        .addRule('role', Validators.required, 'Tipo de usuário é obrigatório')
        .addRule('phone', Validators.required, 'Telefone é obrigatório')
        .addRule('phone', Validators.phone, 'Telefone inválido')
        .addRule('address', Validators.required, 'Endereço é obrigatório')
        .addRule('address', Validators.minLength(10), 'Endereço muito curto')
        .addRule('sector', Validators.required, 'Setor é obrigatório')
        .addRule('sector', B2BValidators.sector, 'Setor inválido');
    }

    return validator;
  }

  static createProductValidator() {
    return new FormValidator()
      .addRule('name', Validators.required, 'Nome do produto é obrigatório')
      .addRule('name', Validators.minLength(3), 'Nome muito curto')
      .addRule('name', Validators.maxLength(100), 'Nome muito longo')
      .addRule('category', Validators.required, 'Categoria é obrigatória')
      .addRule('price', Validators.required, 'Preço é obrigatório')
      .addRule('price', Validators.positiveNumber, 'Preço deve ser um número positivo')
      .addRule('description', Validators.minLength(10), 'Descrição muito curta')
      .addRule('description', Validators.maxLength(500), 'Descrição muito longa')
      .addRule('minQuantity', Validators.positiveNumber, 'Quantidade mínima inválida')
      .addRule('unit', Validators.required, 'Unidade é obrigatória');
  }

  static createQuoteValidator() {
    return new FormValidator()
      .addRule('quantity', Validators.required, 'Quantidade é obrigatória')
      .addRule('quantity', Validators.positiveNumber, 'Quantidade deve ser positiva')
      .addRule('urgency', Validators.required, 'Urgência é obrigatória')
      .addRule('deliveryAddress', Validators.required, 'Endereço de entrega é obrigatório')
      .addRule('deliveryAddress', Validators.minLength(10), 'Endereço muito curto')
      .addRule('specifications', Validators.maxLength(1000), 'Especificações muito longas')
      .addRule('message', Validators.maxLength(500), 'Mensagem muito longa');
  }
}

// ✅ Hook personalizado para validação em tempo real
export const useFormValidation = (validator, initialData = {}) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isValid, setIsValid] = React.useState(false);

  // Validar campo individual
  const validateField = React.useCallback((field, value) => {
    const result = validator.validateField(field, value, data);
    
    setErrors(prev => ({
      ...prev,
      [field]: result.errors
    }));
    
    return result.isValid;
  }, [validator, data]);

  // Validar formulário completo
  const validateForm = React.useCallback(() => {
    const result = validator.validate(data);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, [validator, data]);

  // Atualizar campo
  const setField = React.useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Validar se o campo já foi tocado
    if (touched[field]) {
      setTimeout(() => validateField(field, value), 0);
    }
  }, [touched, validateField]);

  // Marcar campo como tocado
  const touchField = React.useCallback((field) => {
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, data[field]);
    }
  }, [touched, validateField, data]);

  // Reset form
  const resetForm = React.useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
    setIsValid(false);
  }, [initialData]);

  // Validar em mudanças de dados
  React.useEffect(() => {
    const result = validator.validate(data);
    setIsValid(result.isValid);
  }, [data, validator]);

  return {
    data,
    errors,
    touched,
    isValid,
    setField,
    touchField,
    validateField,
    validateForm,
    resetForm,
    setData
  };
};

// ✅ Formatadores automáticos
export const FormFormatters = {
  cnpj: (value) => formatCNPJ(value),
  phone: (value) => formatPhone(value),
  currency: (value) => {
    const num = value.replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num / 100);
  },
  cep: (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  }
};

// ✅ Exemplo de uso avançado
/*
const MyForm = () => {
  const validator = ValidatorFactory.createAuthValidator(false);
  const {
    data,
    errors,
    touched,
    isValid,
    setField,
    touchField,
    validateForm,
    resetForm
  } = useFormValidation(validator, {
    name: '',
    email: '',
    password: '',
    cnpj: '',
    companyName: '',
    role: '',
    phone: '',
    address: '',
    sector: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = await validator.validateAsync(data);
    
    if (validation.isValid) {
      // Submit form
    } else {
      // Show errors
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={data.cnpj}
        onChange={(e) => setField('cnpj', FormFormatters.cnpj(e.target.value))}
        onBlur={() => touchField('cnpj')}
      />
      {touched.cnpj && errors.cnpj && (
        <span className="error">{errors.cnpj[0]}</span>
      )}
    </form>
  );
};
*/