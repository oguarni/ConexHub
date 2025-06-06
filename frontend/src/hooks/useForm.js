import { useState } from 'react';

export const useForm = (initialValues) => {
  const [form, setForm] = useState(initialValues);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialValues);
  };

  const setFormData = (newFormData) => {
    setForm(newFormData);
  };

  return {
    form,
    updateField,
    resetForm,
    setForm: setFormData
  };
};