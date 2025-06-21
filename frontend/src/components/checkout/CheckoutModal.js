import React, { useState } from 'react';
import { X, CreditCard, MapPin, User, Mail, Phone } from 'lucide-react';
import { useQuotation } from '../../contexts/QuotationContext';
import useAuthStore from '../../stores/authStore';
import useUIStore from '../../stores/uiStore';

const CheckoutModal = () => {
  const { 
    quotationItems, 
    shippingCost,
    calculateSubtotal, 
    calculateTotal,
    clearQuotation,
    isCheckoutOpen,
    setIsCheckoutOpen
  } = useQuotation();
  
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    
    // Endereço
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    
    // Pagamento
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    
    // PIX
    pixKey: user?.email || '',
    
    // Observações
    notes: ''
  });

  if (!isCheckoutOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCepBlur = async () => {
    if (formData.cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.ws/ws/${formData.cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.name && formData.email && formData.phone;
      case 2:
        return formData.cep && formData.street && formData.number && 
               formData.neighborhood && formData.city && formData.state;
      case 3:
        if (formData.paymentMethod === 'credit') {
          return formData.cardNumber && formData.cardName && 
                 formData.cardExpiry && formData.cardCvv;
        }
        return true; // PIX não precisa validação adicional
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      addNotification({
        type: 'error',
        message: 'Preencha todos os campos obrigatórios'
      });
    }
  };

  const handleFinishOrder = async () => {
    if (!validateStep(3)) {
      addNotification({
        type: 'error',
        message: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    setLoading(true);

    try {
      // Simular processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gerar ID fake do pedido
      const orderId = 'COT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Limpar cotação
      clearQuotation();

      // Fechar modal
      setIsCheckoutOpen(false);

      // Mostrar sucesso
      addNotification({
        type: 'success',
        message: `Cotação ${orderId} finalizada com sucesso! Você receberá um email com os detalhes.`,
        duration: 8000
      });

    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erro ao processar pedido. Tente novamente.'
      });
    }

    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <User className="text-blue-600 mr-2" size={20} />
              <h3 className="font-medium">Dados Pessoais</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <MapPin className="text-blue-600 mr-2" size={20} />
              <h3 className="font-medium">Endereço de Entrega</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP *
              </label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                onBlur={handleCepBlur}
                maxLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Somente números"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                name="complement"
                value={formData.complement}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <CreditCard className="text-blue-600 mr-2" size={20} />
              <h3 className="font-medium">Forma de Pagamento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit' }))}
                className={`p-4 border rounded-lg text-left ${
                  formData.paymentMethod === 'credit' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Cartão de Crédito</div>
                <div className="text-sm text-gray-600">Visa, Mastercard, etc.</div>
              </button>

              <button
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'pix' }))}
                className={`p-4 border rounded-lg text-left ${
                  formData.paymentMethod === 'pix' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">PIX</div>
                <div className="text-sm text-gray-600">Pagamento instantâneo</div>
              </button>
            </div>

            {formData.paymentMethod === 'credit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Cartão *
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formatCardNumber(formData.cardNumber)}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome no Cartão *
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Como está impresso no cartão"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validade *
                    </label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setFormData(prev => ({ ...prev, cardExpiry: value }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM/AA"
                      maxLength={5}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <input
                      type="text"
                      name="cardCvv"
                      value={formData.cardCvv}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'pix' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Pagamento via PIX</h4>
                <p className="text-sm text-blue-700">
                  Após finalizar o pedido, você receberá um QR Code para pagamento via PIX. 
                  O pagamento deve ser feito em até 30 minutos.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observações sobre o pedido (opcional)"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revisar Pedido</h3>
              <p className="text-sm text-gray-600">Confira todos os dados antes de finalizar</p>
            </div>

            {/* Resumo dos itens */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Itens da Cotação</h4>
              <div className="space-y-2">
                {quotationItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo dos valores */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Resumo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>{shippingCost === 0 ? 'Grátis' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Dados de entrega */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Entrega</h4>
              <div className="text-sm text-gray-600">
                <p>{formData.name}</p>
                <p>{formData.street}, {formData.number}</p>
                {formData.complement && <p>{formData.complement}</p>}
                <p>{formData.neighborhood} - {formData.city}/{formData.state}</p>
                <p>CEP: {formData.cep}</p>
                <p className="mt-2 font-medium">
                  Entrega em 5-10 dias úteis
                </p>
              </div>
            </div>

            {/* Forma de pagamento */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Pagamento</h4>
              <div className="text-sm text-gray-600">
                {formData.paymentMethod === 'credit' ? (
                  <p>Cartão de Crédito terminado em {formData.cardNumber.slice(-4)}</p>
                ) : (
                  <p>PIX</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-blue-50">
          <h2 className="text-xl font-semibold text-gray-900">
            Finalizar Cotação - Passo {step} de 4
          </h2>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Voltar
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleFinishOrder}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Finalizar Cotação'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;