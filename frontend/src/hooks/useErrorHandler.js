import { useCallback } from 'react';
import { useAppContext } from '../contexts';

export const useErrorHandler = () => {
  const { addNotification } = useAppContext();

  const handleError = useCallback((error, context = '') => {
    // Se o erro já foi processado pelo ApiErrorHandler
    if (error.type && error.userMessage) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.userMessage,
        details: error.details,
        autoHide: !error.requiresAuth // Não auto-hide se precisar de auth
      });

      // Log adicional para contexto
      if (context) {
        console.error(`Error in ${context}:`, error);
      }

      return error;
    }

    // Fallback para erros não processados
    const message = error.message || 'Erro inesperado';
    addNotification({
      type: 'error',
      title: 'Erro',
      message,
      autoHide: true
    });

    console.error(`Unprocessed error in ${context}:`, error);
    return error;
  }, [addNotification]);

  const handleSuccess = useCallback((message, title = 'Sucesso') => {
    addNotification({
      type: 'success',
      title,
      message,
      autoHide: true
    });
  }, [addNotification]);

  const handleWarning = useCallback((message, title = 'Atenção') => {
    addNotification({
      type: 'warning',
      title,
      message,
      autoHide: true
    });
  }, [addNotification]);

  return {
    handleError,
    handleSuccess,
    handleWarning
  };
};