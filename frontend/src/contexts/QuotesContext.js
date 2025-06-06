// contexts/QuotesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuotes } from '../hooks/useQuotes';
import { useForm } from '../hooks/useForm';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const QuotesContext = createContext();

export const QuotesProvider = ({ children }) => {
  const quotes = useQuotes();
  const { auth } = useAuth();
  const { addNotification, updateUI } = useUI();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const quoteForm = useForm({ 
    quantity: 1,
    urgency: 'normal',
    deliveryAddress: '',
    specifications: '',
    message: ''
  });

  // Load quotes when user changes
  useEffect(() => {
    if (auth.user) {
      quotes.loadUserQuotes();
    }
  }, [auth.user]);

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