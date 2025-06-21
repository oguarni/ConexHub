import React, { createContext, useContext, useReducer, useEffect } from 'react';

const QuotationContext = createContext();

// Actions for the quotation reducer
const QUOTATION_ACTIONS = {
  SET_ITEMS: 'SET_ITEMS',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_QUOTATION: 'CLEAR_QUOTATION',
  SET_SHIPPING_COST: 'SET_SHIPPING_COST',
  SET_CHECKOUT_OPEN: 'SET_CHECKOUT_OPEN',
};

// Reducer function for quotation state management
const quotationReducer = (state, action) => {
  switch (action.type) {
    case QUOTATION_ACTIONS.SET_ITEMS:
      return {
        ...state,
        quotationItems: action.payload,
      };

    case QUOTATION_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.quotationItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedItems = [...state.quotationItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return {
          ...state,
          quotationItems: updatedItems,
        };
      } else {
        // Add new item
        const newItem = {
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
        };
        return {
          ...state,
          quotationItems: [...state.quotationItems, newItem],
        };
      }
    }

    case QUOTATION_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        quotationItems: state.quotationItems.filter(item => item.id !== action.payload.id),
      };

    case QUOTATION_ACTIONS.UPDATE_QUANTITY: {
      const { productId, newQuantity } = action.payload;
      
      if (newQuantity <= 0) {
        return {
          ...state,
          quotationItems: state.quotationItems.filter(item => item.id !== productId),
        };
      }

      return {
        ...state,
        quotationItems: state.quotationItems.map(item =>
          item.id === productId
            ? { ...item, quantity: Math.max(newQuantity, item.minOrder || 1) }
            : item
        ),
      };
    }

    case QUOTATION_ACTIONS.CLEAR_QUOTATION:
      return {
        ...state,
        quotationItems: [],
        shippingCost: 0,
      };

    case QUOTATION_ACTIONS.SET_SHIPPING_COST:
      return {
        ...state,
        shippingCost: action.payload,
      };

    case QUOTATION_ACTIONS.SET_CHECKOUT_OPEN:
      return {
        ...state,
        isCheckoutOpen: action.payload,
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  quotationItems: [],
  shippingCost: 0,
  isCheckoutOpen: false,
};

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};

export const QuotationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quotationReducer, initialState);

  // Load quotation from localStorage on mount
  useEffect(() => {
    const savedQuotation = localStorage.getItem('quotation');
    if (savedQuotation) {
      try {
        const parsedQuotation = JSON.parse(savedQuotation);
        dispatch({ type: QUOTATION_ACTIONS.SET_ITEMS, payload: parsedQuotation });
      } catch (error) {
        console.error('Error loading quotation from localStorage:', error);
        localStorage.removeItem('quotation');
      }
    }
  }, []);

  // Save quotation to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('quotation', JSON.stringify(state.quotationItems));
  }, [state.quotationItems]);

  // Action creators
  const addToQuotation = (product, quantity = 1) => {
    dispatch({
      type: QUOTATION_ACTIONS.ADD_ITEM,
      payload: { product, quantity }
    });
  };

  const removeFromQuotation = (productId) => {
    dispatch({
      type: QUOTATION_ACTIONS.REMOVE_ITEM,
      payload: { id: productId }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    dispatch({
      type: QUOTATION_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, newQuantity }
    });
  };

  const clearQuotation = () => {
    dispatch({ type: QUOTATION_ACTIONS.CLEAR_QUOTATION });
  };

  const setShippingCost = (cost) => {
    dispatch({
      type: QUOTATION_ACTIONS.SET_SHIPPING_COST,
      payload: cost
    });
  };

  const setIsCheckoutOpen = (isOpen) => {
    dispatch({
      type: QUOTATION_ACTIONS.SET_CHECKOUT_OPEN,
      payload: isOpen
    });
  };

  // Computed values
  const calculateSubtotal = () => {
    return state.quotationItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + state.shippingCost;
  };

  const calculateShipping = (cep, products = state.quotationItems) => {
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
    return state.quotationItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    // State
    quotationItems: state.quotationItems,
    shippingCost: state.shippingCost,
    isCheckoutOpen: state.isCheckoutOpen,
    
    // Actions
    setIsCheckoutOpen,
    addToQuotation,
    removeFromQuotation,
    updateQuantity,
    clearQuotation,
    
    // Calculations
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