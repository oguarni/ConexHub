import { useState } from 'react';
import { apiService } from '../services/api';

export const useQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastQuoteId, setLastQuoteId] = useState('');

  const loadUserQuotes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiService.getUserQuotes();
      setQuotes(data.quotes || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
      setError('Erro ao carregar cotações');
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData) => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiService.createQuote(quoteData);
      setLastQuoteId(data.quote.quoteNumber || data.quote.id);
      
      // Recarregar cotações do usuário
      await loadUserQuotes();
      
      return { success: true, quote: data.quote };
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar cotação');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId, status, response = {}) => {
    try {
      setLoading(true);
      setError('');
      
      await apiService.respondQuote(quoteId, { status, ...response });
      await loadUserQuotes();
      
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao atualizar cotação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuotes = () => quotes.length;
  
  const getPendingQuotes = () => quotes.filter(q => q.status === 'pending');
  
  const getRespondedQuotes = () => quotes.filter(q => q.status === 'responded');
  
  const getAcceptedQuotes = () => quotes.filter(q => q.status === 'accepted');

  const clearError = () => setError('');

  return {
    quotes,
    selectedProduct,
    setSelectedProduct,
    loading,
    error,
    lastQuoteId,
    loadUserQuotes,
    createQuote,
    updateQuoteStatus,
    getTotalQuotes,
    getPendingQuotes,
    getRespondedQuotes,
    getAcceptedQuotes,
    clearError
  };
};