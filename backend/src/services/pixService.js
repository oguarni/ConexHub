const crypto = require('crypto');
const QRCode = require('qrcode');
const { PixPayment } = require('../models');

class PixService {
  // Generate EMV QR Code string for PIX
  static generatePixEMV(pixKey, amount, receiverName, description, transactionId) {
    // EMV format for PIX QR Code
    const merchantName = receiverName.substring(0, 25).toUpperCase();
    const merchantCity = 'DOIS VIZINHOS';
    const transactionAmount = amount.toFixed(2);
    
    // Build EMV string according to PIX specifications
    const emvData = {
      '00': '01', // Payload Format Indicator
      '01': '12', // Point of Initiation Method (Dynamic)
      '26': {
        '00': 'br.gov.bcb.pix',
        '01': pixKey,
        '02': description.substring(0, 72)
      },
      '52': '0000', // Merchant Category Code
      '53': '986', // Transaction Currency (BRL)
      '54': transactionAmount,
      '58': 'BR', // Country Code
      '59': merchantName,
      '60': merchantCity,
      '62': {
        '05': transactionId.substring(0, 25)
      }
    };

    // Convert to EMV format
    let emvString = '';
    
    Object.entries(emvData).forEach(([id, value]) => {
      if (typeof value === 'object') {
        // Handle nested objects (like 26 and 62)
        let nestedString = '';
        Object.entries(value).forEach(([nestedId, nestedValue]) => {
          const nestedLength = nestedValue.length.toString().padStart(2, '0');
          nestedString += `${nestedId}${nestedLength}${nestedValue}`;
        });
        const length = nestedString.length.toString().padStart(2, '0');
        emvString += `${id}${length}${nestedString}`;
      } else {
        const length = value.length.toString().padStart(2, '0');
        emvString += `${id}${length}${value}`;
      }
    });

    // Add CRC (simple implementation)
    emvString += '6304';
    const crc = this.calculateCRC16(emvString);
    emvString += crc;

    return emvString;
  }

  // Simple CRC16 calculation for PIX
  static calculateCRC16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // Generate PIX QR Code image
  static async generateQRCodeImage(emvString) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(emvString, {
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Failed to generate QR Code: ${error.message}`);
    }
  }

  // Generate unique transaction ID
  static generateTransactionId() {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CXH${timestamp.slice(-8)}${random}`;
  }

  // Create PIX payment
  static async createPixPayment({
    pixKey,
    pixKeyType,
    amount,
    description,
    payerName,
    payerDocument,
    receiverName,
    receiverDocument,
    quoteId = null,
    orderId = null,
    expirationMinutes = 30,
    metadata = {}
  }) {
    try {
      // Generate transaction ID
      const transactionId = this.generateTransactionId();
      
      // Generate EMV QR Code string
      const emvString = this.generatePixEMV(
        pixKey,
        amount,
        receiverName,
        description,
        transactionId
      );
      
      // Generate QR Code image
      const qrCodeImage = await this.generateQRCodeImage(emvString);
      
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);
      
      // Create PIX payment record
      const pixPayment = await PixPayment.create({
        pixKey,
        pixKeyType,
        amount,
        description,
        payerName,
        payerDocument,
        receiverName,
        receiverDocument,
        transactionId,
        qrCode: emvString,
        qrCodeImage,
        status: 'pending',
        expiresAt,
        quoteId,
        orderId,
        metadata
      });

      return pixPayment;
    } catch (error) {
      throw new Error(`Failed to create PIX payment: ${error.message}`);
    }
  }

  // Get PIX payment by ID
  static async getPixPayment(pixPaymentId) {
    try {
      const pixPayment = await PixPayment.findByPk(pixPaymentId, {
        include: ['Quote', 'Order']
      });
      
      if (!pixPayment) {
        throw new Error('PIX payment not found');
      }
      
      return pixPayment;
    } catch (error) {
      throw new Error(`Failed to get PIX payment: ${error.message}`);
    }
  }

  // Update PIX payment status
  static async updatePixPaymentStatus(pixPaymentId, status, endToEndId = null) {
    try {
      const pixPayment = await PixPayment.findByPk(pixPaymentId);
      
      if (!pixPayment) {
        throw new Error('PIX payment not found');
      }
      
      const updateData = { status };
      
      if (status === 'paid') {
        updateData.paidAt = new Date();
        updateData.endToEndId = endToEndId;
      }
      
      await pixPayment.update(updateData);
      
      return pixPayment;
    } catch (error) {
      throw new Error(`Failed to update PIX payment status: ${error.message}`);
    }
  }

  // Check if PIX payment is expired
  static isPixPaymentExpired(pixPayment) {
    return new Date() > new Date(pixPayment.expiresAt);
  }

  // Get PIX payments by quote ID
  static async getPixPaymentsByQuote(quoteId) {
    try {
      const pixPayments = await PixPayment.findAll({
        where: { quoteId },
        order: [['createdAt', 'DESC']]
      });
      
      return pixPayments;
    } catch (error) {
      throw new Error(`Failed to get PIX payments for quote: ${error.message}`);
    }
  }

  // Get PIX payments by order ID
  static async getPixPaymentsByOrder(orderId) {
    try {
      const pixPayments = await PixPayment.findAll({
        where: { orderId },
        order: [['createdAt', 'DESC']]
      });
      
      return pixPayments;
    } catch (error) {
      throw new Error(`Failed to get PIX payments for order: ${error.message}`);
    }
  }

  // Validate PIX key format
  static validatePixKey(pixKey, pixKeyType) {
    switch (pixKeyType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(pixKey);
      
      case 'phone':
        const phoneRegex = /^\+55\d{10,11}$/;
        return phoneRegex.test(pixKey);
      
      case 'cpf':
        const cpfRegex = /^\d{11}$/;
        return cpfRegex.test(pixKey.replace(/\D/g, ''));
      
      case 'cnpj':
        const cnpjRegex = /^\d{14}$/;
        return cnpjRegex.test(pixKey.replace(/\D/g, ''));
      
      case 'random':
        const randomKeyRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
        return randomKeyRegex.test(pixKey);
      
      default:
        return false;
    }
  }

  // Format amount for display
  static formatAmount(amount) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
}

module.exports = PixService;