// contexts/QuotesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBuyerQuotesQuery, useRequestQuoteMutation, useAcceptQuoteMutation, useRejectQuoteMutation } from '../hooks/queries/useQuotesQuery';
import { useForm } from '../hooks/useForm';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const QuotesContext = createContext();

export const QuotesProvider = ({ children }) => {
  const { auth } = useAuth();
  const { addNotification, updateUI } = useUI();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastQuoteId, setLastQuoteId] = useState('');
  
  // TanStack Query hooks
  const { 
    data: quotesResponse, 
    isLoading: quotesLoading, 
    error: quotesError,
    refetch: refetchQuotes
  } = useBuyerQuotesQuery({}, { enabled: !!auth.user });
  
  const requestQuoteMutation = useRequestQuoteMutation({
    onSuccess: (newQuote) => {
      setLastQuoteId(newQuote.quoteNumber || newQuote.id);
    }
  });
  const acceptQuoteMutation = useAcceptQuoteMutation();
  const rejectQuoteMutation = useRejectQuoteMutation();
  
  // Create quotes object to maintain compatibility
  const quotes = React.useMemo(() => ({
    quotes: quotesResponse?.quotes || [],
    loading: quotesLoading,
    error: quotesError?.message || '',
    lastQuoteId,
    loadUserQuotes: refetchQuotes,
    createQuote: async (quoteData) => {
      try {
        const result = await requestQuoteMutation.mutateAsync(quoteData);
        return { success: true, quote: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    updateQuoteStatus: async (quoteId, status, data = {}) => {
      try {
        if (status === 'accepted') {
          await acceptQuoteMutation.mutateAsync({ quoteId, acceptanceData: data });
        } else if (status === 'rejected') {
          await rejectQuoteMutation.mutateAsync({ quoteId, reason: data.reason });
        }
        return true;
      } catch (error) {
        return false;
      }
    }
  }), [quotesResponse, quotesLoading, quotesError, lastQuoteId, refetchQuotes, requestQuoteMutation, acceptQuoteMutation, rejectQuoteMutation]);
  
  const quoteForm = useForm({ 
    quantity: 1,
    urgency: 'normal',
    deliveryAddress: '',
    specifications: '',
    message: ''
  });

  // Quotes are automatically loaded by useBuyerQuotesQuery when user is available

  const handleRequestQuote = (product) => {
    if (!auth.user) {
      updateUI({ showAuth: true });
      return;
    }

    if (!auth.hasPermission('buy')) {
      addNotification({
        type: 'error',
        title: 'Acesso negado',
        message: 'Apenas compradores podem solicitar cotações'
      });
      return;
    }

    setSelectedProduct(product);
    quoteForm.setForm({ 
      quantity: product.minQuantity || 1,
      urgency: 'normal',
      deliveryAddress: auth.user.address || '',
      specifications: '',
      message: ''
    });
    updateUI({ showQuoteModal: true });
  };

  const handleSubmitQuote = async () => {
    if (!selectedProduct) return;

    const quoteData = {
      productId: selectedProduct.id,
      ...quoteForm.form,
      totalEstimate: selectedProduct.price * quoteForm.form.quantity
    };

    const result = await quotes.createQuote(quoteData);
    if (result.success) {
      updateUI({ showQuoteModal: false });
      setSelectedProduct(null);
      quoteForm.resetForm();
      addNotification({
        type: 'success',
        title: 'Cotação solicitada!',
        message: `ID: ${quotes.lastQuoteId} - O fornecedor responderá em até 48h`
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Erro ao solicitar cotação',
        message: quotes.error || 'Tente novamente'
      });
    }
  };

  const handleAcceptQuote = async (quoteId, response = {}) => {
    const success = await quotes.updateQuoteStatus(quoteId, 'accepted', response);
    if (success) {
      addNotification({
        type: 'success',
        title: 'Cotação aceita!',
        message: 'O fornecedor foi notificado'
      });
    }
  };

  const handleRejectQuote = async (quoteId, reason = '') => {
    const success = await quotes.updateQuoteStatus(quoteId, 'rejected', { reason });
    if (success) {
      addNotification({
        type: 'info',
        title: 'Cotação rejeitada',
        message: 'O fornecedor foi notificado'
      });
    }
  };

  const contextValue = {
    ...quotes,
    quoteForm,
    selectedProduct,
    setSelectedProduct,
    handleRequestQuote,
    handleSubmitQuote,
    handleAcceptQuote,
    handleRejectQuote
  };

  return (
    <QuotesContext.Provider value={contextValue}>
      {children}
    </QuotesContext.Provider>
  );
};

export const useQuotesContext = () => {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotesContext deve ser usado dentro de QuotesProvider');
  }
  return context;
};