export const categories = [
  'All', 
  'Machinery', 
  'Raw Materials', 
  'Components', 
  'Tools', 
  'Equipment'
];

export const industrialSectors = [
  { value: 'metalurgia', label: 'Metalurgia' },
  { value: 'automotivo', label: 'Automotivo' },
  { value: 'petrochemical', label: 'Petroquímico' },
  { value: 'alimenticio', label: 'Alimentício' },
  { value: 'textil', label: 'Têxtil' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'eletroeletronico', label: 'Eletroeletrônico' },
  { value: 'farmaceutico', label: 'Farmacêutico' },
  { value: 'papel', label: 'Papel e Celulose' },
  { value: 'outros', label: 'Outros' }
];

export const urgencyLevels = {
  normal: { label: 'Normal', days: 30, color: 'blue' },
  urgent: { label: 'Urgente', days: 15, color: 'yellow' },
  express: { label: 'Express', days: 7, color: 'red' }
};

export const quoteStatuses = {
  pending: { 
    label: 'Aguardando resposta', 
    color: 'yellow',
    icon: 'Clock' 
  },
  responded: { 
    label: 'Cotação recebida', 
    color: 'blue',
    icon: 'FileText' 
  },
  accepted: { 
    label: 'Cotação aceita', 
    color: 'green',
    icon: 'CheckCircle' 
  },
  rejected: { 
    label: 'Cotação rejeitada', 
    color: 'red',
    icon: 'XCircle' 
  }
};

export const userRoles = {
  admin: {
    label: 'Administrador',
    permissions: ['admin', 'buy', 'sell', 'manage_products', 'approve_suppliers']
  },
  buyer: {
    label: 'Comprador',
    permissions: ['buy']
  },
  supplier: {
    label: 'Fornecedor', 
    permissions: ['sell', 'manage_products']
  }
};

export const orderStatuses = {
  pending: { label: 'Pendente', color: 'yellow' },
  confirmed: { label: 'Confirmado', color: 'blue' },
  processing: { label: 'Processando', color: 'purple' },
  shipped: { label: 'Enviado', color: 'orange' },
  delivered: { label: 'Entregue', color: 'green' },
  cancelled: { label: 'Cancelado', color: 'red' }
};

// Shipping calculation zones based on CEP
export const shippingZones = {
  local: { cepRange: ['80000-87999'], price: 15.90, days: 2 },
  regional: { cepRange: ['88000-89999'], price: 25.90, days: 5 },
  national: { cepRange: ['00000-99999'], price: 35.90, days: 10 }
};

// B2B specific constants
export const minimumOrderValues = {
  metalurgia: 1000,
  automotivo: 2000,
  petrochemical: 5000,
  default: 500
};

export const leadTimes = {
  machinery: 30,
  'raw-materials': 15,
  components: 10,
  tools: 7,
  equipment: 45
};

export const calculateShipping = (cep) => {
  const cleanCep = cep.replace(/\D/g, '');
  const cepNumber = parseInt(cleanCep);
  
  if (cepNumber >= 80000 && cepNumber <= 87999) {
    return shippingZones.local;
  } else if (cepNumber >= 88000 && cepNumber <= 89999) {
    return shippingZones.regional;
  } else {
    return shippingZones.national;
  }
};