import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Ações do carrinho
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_SHIPPING: 'SET_SHIPPING',
  LOAD_CART: 'LOAD_CART'
};

// Reducer do carrinho
const cartReducer = (state, action) => {
  console.log('🔄 CartReducer:', action.type, action.payload);
  
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };

    case CART_ACTIONS.SET_SHIPPING:
      return {
        ...state,
        shipping: action.payload
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

// Estado inicial do carrinho
const initialState = {
  items: [],
  shipping: {
    cep: '',
    method: 'standard',
    cost: 0,
    estimatedDays: 5
  }
};

// Provider do carrinho
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('b2b_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('b2b_cart', JSON.stringify(state));
  }, [state]);

  // Funções do carrinho
  const addToCart = (product, quantity = 1) => {
    console.log('🛒 CartContext: Adding to cart', {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      currentItems: state.items.length
    });
    
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        unit: product.unit,
        minOrder: product.minOrder,
        stock: product.stock,
        quantity
      }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { id: productId }
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const setShipping = (shippingData) => {
    dispatch({
      type: CART_ACTIONS.SET_SHIPPING,
      payload: shippingData
    });
  };

  // Simulador de frete
  const calculateShipping = async (cep) => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulação de cálculo de frete
    const baseShipping = 15.90;
    const total = getSubtotal();
    
    // Frete grátis acima de R$ 500
    if (total >= 500) {
      return {
        standard: { cost: 0, days: 7, name: 'Grátis' },
        express: { cost: 12.90, days: 3, name: 'Expresso' }
      };
    }
    
    return {
      standard: { cost: baseShipping, days: 7, name: 'Padrão' },
      express: { cost: baseShipping + 10, days: 3, name: 'Expresso' }
    };
  };

  // Cálculos
  const getSubtotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return getSubtotal() + state.shipping.cost;
  };

  const value = {
    // Estado
    items: state.items,
    shipping: state.shipping,
    
    // Ações
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setShipping,
    calculateShipping,
    
    // Cálculos
    getSubtotal,
    getItemsCount,
    getTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar o carrinho
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
};