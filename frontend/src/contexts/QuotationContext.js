import React, { createContext, useContext, useState, useEffect } from 'react';

const QuotationContext = createContext();

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};

export const QuotationProvider = ({ children }) => {
  const [quotationItems, setQuotationItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Load quotation from localStorage on mount
  useEffect(() => {
    const savedQuotation = localStorage.getItem('quotation');
    if (savedQuotation) {
      try {
        setQuotationItems(JSON.parse(savedQuotation));
      } catch (error) {
        console.error('Error loading quotation from localStorage:', error);
        localStorage.removeItem('quotation');
      }
    }
  }, []);

  // Save quotation to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quotation', JSON.stringify(quotationItems));
  }, [quotationItems]);

  const addToQuotation = (product, quantity = 1) => {
    setQuotationItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          category: product.category,
          supplier: product.Supplier?.companyName || product.supplier,
          image: product.image,
          description: product.description,
          minOrder: product.minOrder || 1,
          quantity: Math.max(quantity, product.minOrder || 1)
        }];
      }
    });
  };

  const removeFromQuotation = (productId) => {
    setQuotationItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromQuotation(productId);
      return;
    }

    setQuotationItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(newQuantity, item.minOrder || 1) }
          : item
      )
    );
  };

  const clearQuotation = () => {
    setQuotationItems([]);
    setShippingCost(0);
  };

  const calculateSubtotal = () => {
    return quotationItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingCost;
  };

  const calculateShipping = (cep, products = quotationItems) => {
    // Simulação de cálculo de frete
    if (!cep || products.length === 0) {
      setShippingCost(0);
      return 0;
    }

    // Simular diferentes custos baseado no CEP
    const baseShipping = 25.50;
    const productWeight = products.reduce((total, item) => total + (item.quantity * 0.5), 0); // 0.5kg por produto
    const distanceMultiplier = cep.startsWith('0') ? 1.5 : cep.startsWith('1') ? 1.2 : 1.0;
    
    const calculatedShipping = baseShipping + (productWeight * 2.5) * distanceMultiplier;
    const finalShipping = Math.round(calculatedShipping * 100) / 100;
    
    setShippingCost(finalShipping);
    return finalShipping;
  };

  const getQuotationCount = () => {
    return quotationItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    quotationItems,
    shippingCost,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addToQuotation,
    removeFromQuotation,
    updateQuantity,
    clearQuotation,
    calculateSubtotal,
    calculateTotal,
    calculateShipping,
    getQuotationCount
  };

  return (
    <QuotationContext.Provider value={value}>
      {children}
    </QuotationContext.Provider>
  );
};

export default QuotationProvider;