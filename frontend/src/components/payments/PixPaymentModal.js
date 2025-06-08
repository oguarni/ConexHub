import React, { useState, useEffect } from 'react';
import { X, Copy, Clock, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const PixPaymentModal = ({ 
  isOpen, 
  onClose, 
  quote = null, 
  order = null, 
  onPaymentCreated = null 
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState('form'); // 'form', 'qrcode', 'confirmation'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pixPayment, setPixPayment] = useState(null);
  const [formData, setFormData] = useState({
    pixKey: '',
    pixKeyType: 'email',
    receiverName: '',
    receiverDocument: '',
    expirationMinutes: 30
  });
  const [timeLeft, setTimeLeft] = useState(null);
  const [copied, setCopied] = useState(false);

  // Countdown timer for payment expiration
  useEffect(() => {
    if (pixPayment && pixPayment.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiration = new Date(pixPayment.expiresAt).getTime();
        const difference = expiration - now;

        if (difference > 0) {
          setTimeLeft(difference);
        } else {
          setTimeLeft(0);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [pixPayment]);

  // Format time remaining
  const formatTimeLeft = (time) => {
    if (!time) return '00:00';
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate PIX key format
  const validatePixKey = (key, type) => {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
      case 'phone':
        return /^\+55\d{10,11}$/.test(key);
      case 'cpf':
        return /^\d{11}$/.test(key.replace(/\D/g, ''));
      case 'cnpj':
        return /^\d{14}$/.test(key.replace(/\D/g, ''));
      case 'random':
        return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key);
      default:
        return false;
    }
  };

  // Create PIX payment
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!validatePixKey(formData.pixKey, formData.pixKeyType)) {
        throw new Error(t('invalidPixKeyFormat'));
      }

      if (!formData.receiverName.trim()) {
        throw new Error(t('receiverNameRequired'));
      }

      if (!formData.receiverDocument.trim()) {
        throw new Error(t('receiverDocumentRequired'));
      }

      // Determine endpoint based on quote or order
      const endpoint = quote 
        ? `/api/pix/quotes/${quote.id}/payment`
        : `/api/pix/orders/${order.id}/payment`;

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('failedToCreatePixPayment'));
      }

      setPixPayment(data.data.pixPayment);
      setStep('qrcode');
      
      if (onPaymentCreated) {
        onPaymentCreated(data.data.pixPayment);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy PIX code to clipboard
  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixPayment.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy PIX code:', err);
    }
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/pix/payments/${pixPayment.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success && data.data.pixPayment.status === 'paid') {
        setStep('confirmation');
      }
    } catch (err) {
      console.error('Failed to check payment status:', err);
    }
  };

  // Reset modal state when closing
  const handleClose = () => {
    setStep('form');
    setPixPayment(null);
    setError('');
    setFormData({
      pixKey: '',
      pixKeyType: 'email',
      receiverName: '',
      receiverDocument: '',
      expirationMinutes: 30
    });
    onClose();
  };

  if (!isOpen) return null;

  const amount = quote?.totalAmount || order?.totalAmount || 0;
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('pixPayment')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Amount */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-green-600 mb-1">{t('paymentAmount')}</p>
              <p className="text-2xl font-bold text-green-800">{formattedAmount}</p>
              {quote && (
                <p className="text-sm text-green-600 mt-1">
                  {t('quote')} #{quote.quoteNumber}
                </p>
              )}
              {order && (
                <p className="text-sm text-green-600 mt-1">
                  {t('order')} #{order.orderNumber}
                </p>
              )}
            </div>
          </div>

          {/* Step 1: Payment Form */}
          {step === 'form' && (
            <form onSubmit={handleCreatePayment} className="space-y-4">
              {/* PIX Key Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pixKeyType')}
                </label>
                <select
                  name="pixKeyType"
                  value={formData.pixKeyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="email">{t('email')}</option>
                  <option value="phone">{t('phone')}</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="random">{t('randomKey')}</option>
                </select>
              </div>

              {/* PIX Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pixKey')}
                </label>
                <input
                  type="text"
                  name="pixKey"
                  value={formData.pixKey}
                  onChange={handleInputChange}
                  placeholder={t('enterPixKey')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Receiver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('receiverName')}
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  placeholder={t('enterReceiverName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Receiver Document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('receiverDocument')} (CPF/CNPJ)
                </label>
                <input
                  type="text"
                  name="receiverDocument"
                  value={formData.receiverDocument}
                  onChange={handleInputChange}
                  placeholder={t('enterReceiverDocument')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expirationTime')} ({t('minutes')})
                </label>
                <select
                  name="expirationMinutes"
                  value={formData.expirationMinutes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="15">15 {t('minutes')}</option>
                  <option value="30">30 {t('minutes')}</option>
                  <option value="60">1 {t('hour')}</option>
                  <option value="120">2 {t('hours')}</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('generating') : t('generatePixPayment')}
              </button>
            </form>
          )}

          {/* Step 2: QR Code Display */}
          {step === 'qrcode' && pixPayment && (
            <div className="space-y-4">
              {/* Timer */}
              {timeLeft !== null && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-700">
                      {t('expiresIn')}: <span className="font-mono font-bold">
                        {formatTimeLeft(timeLeft)}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img
                    src={pixPayment.qrCodeImage}
                    alt="PIX QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {t('scanQrCodeToPay')}
                </p>
              </div>

              {/* PIX Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pixCode')} ({t('copyAndPaste')})
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={pixPayment.qrCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-xs font-mono"
                  />
                  <button
                    onClick={handleCopyPixCode}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 flex items-center"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-1">{t('copiedToClipboard')}</p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h4 className="font-medium text-blue-900 mb-2">{t('paymentInstructions')}</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>{t('instruction1')}</li>
                  <li>{t('instruction2')}</li>
                  <li>{t('instruction3')}</li>
                </ol>
              </div>

              <button
                onClick={checkPaymentStatus}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {t('checkPaymentStatus')}
              </button>
            </div>
          )}

          {/* Step 3: Payment Confirmation */}
          {step === 'confirmation' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('paymentConfirmed')}
              </h3>
              <p className="text-gray-600">
                {t('paymentProcessedSuccessfully')}
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {t('close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PixPaymentModal;