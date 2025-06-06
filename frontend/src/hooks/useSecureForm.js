export const useSecureForm = (validationSchema) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    try {
      const fieldSchema = validationSchema[name];
      if (fieldSchema) {
        SecurityValidator.validateInput(value, fieldSchema.type, fieldSchema.options);
      }
      
      setErrors(prev => ({ ...prev, [name]: null }));
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, [name]: error.message }));
      return false;
    }
  }, [validationSchema]);

  const setValue = useCallback((name, value) => {
    // Sanitize input
    const sanitizedValue = DOMPurify.sanitize(value);
    setValues(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Validate
    validateField(name, sanitizedValue);
  }, [validateField]);

  const submit = useCallback(async (onSubmit) => {
    try {
      setIsSubmitting(true);
      
      // Validate all fields
      const isValid = Object.keys(validationSchema).every(field => 
        validateField(field, values[field])
      );
      
      if (!isValid) {
        throw new Error('Formulário contém erros');
      }
      
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validationSchema, validateField]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    submit,
    isValid: Object.values(errors).every(error => !error)
  };
};

// components/SecureFormField.js
const SecureFormField = memo(({ 
  name, 
  type, 
  validation, 
  value, 
  onChange, 
  error,
  ...props 
}) => {
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    
    // Rate limiting para inputs
    try {
      SecurityValidator.checkRateLimit(`input-${name}`, 100, 1000);
    } catch (err) {
      console.warn('Input rate limited:', name);
      return;
    }
    
    onChange(name, newValue);
  }, [name, onChange]);

  return (
    <div className="mb-4">
      <input
        type={type}
        value={value || ''}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});