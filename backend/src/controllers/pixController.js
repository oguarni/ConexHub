import PixService from '../services/pixService.js';
import { Quote, Order, User, Supplier } from '../models/index.js';
import { validationResult } from 'express-validator';

class PixController {
  // Create PIX payment for quote
  static async createPixPaymentForQuote(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { quoteId } = req.params;
      const {
        pixKey,
        pixKeyType,
        receiverName,
        receiverDocument,
        expirationMinutes = 30
      } = req.body;

      // Validate PIX key format
      if (!PixService.validatePixKey(pixKey, pixKeyType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PIX key format'
        });
      }

      // Get quote details
      const quote = await Quote.findByPk(quoteId, {
        include: [
          {
            model: User,
            as: 'Buyer',
            attributes: ['id', 'name', 'email', 'cnpj']
          },
          {
            model: User,
            as: 'Supplier',
            attributes: ['id', 'name', 'email', 'cnpj']
          }
        ]
      });

      if (!quote) {
        return res.status(404).json({
          success: false,
          message: 'Quote not found'
        });
      }

      // Check if user is the buyer of this quote
      if (quote.buyerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only pay for your own quotes'
        });
      }

      // Check if quote is accepted
      if (quote.status !== 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Quote must be accepted before payment'
        });
      }

      // Create PIX payment
      const pixPayment = await PixService.createPixPayment({
        pixKey,
        pixKeyType,
        amount: quote.totalAmount,
        description: `ConexHub - Pagamento Cotação #${quote.quoteNumber}`,
        payerName: quote.Buyer.name,
        payerDocument: quote.Buyer.cnpj,
        receiverName,
        receiverDocument,
        quoteId: quote.id,
        expirationMinutes,
        metadata: {
          quoteNumber: quote.quoteNumber,
          productName: 'B2B Quote Payment',
          platform: 'ConexHub'
        }
      });

      res.status(201).json({
        success: true,
        message: 'PIX payment created successfully',
        data: {
          pixPayment: {
            id: pixPayment.id,
            transactionId: pixPayment.transactionId,
            amount: pixPayment.amount,
            formattedAmount: PixService.formatAmount(pixPayment.amount),
            qrCode: pixPayment.qrCode,
            qrCodeImage: pixPayment.qrCodeImage,
            status: pixPayment.status,
            expiresAt: pixPayment.expiresAt,
            pixKey: pixPayment.pixKey,
            receiverName: pixPayment.receiverName
          },
          quote: {
            id: quote.id,
            quoteNumber: quote.quoteNumber,
            totalAmount: quote.totalAmount
          }
        }
      });

    } catch (error) {
      console.error('Error creating PIX payment for quote:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Create PIX payment for order
  static async createPixPaymentForOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { orderId } = req.params;
      const {
        pixKey,
        pixKeyType,
        receiverName,
        receiverDocument,
        expirationMinutes = 30
      } = req.body;

      // Validate PIX key format
      if (!PixService.validatePixKey(pixKey, pixKeyType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PIX key format'
        });
      }

      // Get order details
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'Buyer',
            attributes: ['id', 'name', 'email', 'cnpj']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user is the buyer of this order
      if (order.buyerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only pay for your own orders'
        });
      }

      // Check if order is pending payment
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Order is not pending payment'
        });
      }

      // Create PIX payment
      const pixPayment = await PixService.createPixPayment({
        pixKey,
        pixKeyType,
        amount: order.totalAmount,
        description: `ConexHub - Pagamento Pedido #${order.orderNumber}`,
        payerName: order.Buyer.name,
        payerDocument: order.Buyer.cnpj,
        receiverName,
        receiverDocument,
        orderId: order.id,
        expirationMinutes,
        metadata: {
          orderNumber: order.orderNumber,
          productName: 'B2B Order Payment',
          platform: 'ConexHub'
        }
      });

      res.status(201).json({
        success: true,
        message: 'PIX payment created successfully',
        data: {
          pixPayment: {
            id: pixPayment.id,
            transactionId: pixPayment.transactionId,
            amount: pixPayment.amount,
            formattedAmount: PixService.formatAmount(pixPayment.amount),
            qrCode: pixPayment.qrCode,
            qrCodeImage: pixPayment.qrCodeImage,
            status: pixPayment.status,
            expiresAt: pixPayment.expiresAt,
            pixKey: pixPayment.pixKey,
            receiverName: pixPayment.receiverName
          },
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount
          }
        }
      });

    } catch (error) {
      console.error('Error creating PIX payment for order:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get PIX payment details
  static async getPixPayment(req, res) {
    try {
      const { pixPaymentId } = req.params;

      const pixPayment = await PixService.getPixPayment(pixPaymentId);

      // Check authorization (user must be payer or receiver)
      const isAuthorized = req.user.role === 'admin' ||
                          (pixPayment.Quote && pixPayment.Quote.buyerId === req.user.id) ||
                          (pixPayment.Quote && pixPayment.Quote.supplierId === req.user.id) ||
                          (pixPayment.Order && pixPayment.Order.buyerId === req.user.id);

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if payment is expired
      const isExpired = PixService.isPixPaymentExpired(pixPayment);

      res.json({
        success: true,
        data: {
          pixPayment: {
            id: pixPayment.id,
            transactionId: pixPayment.transactionId,
            amount: pixPayment.amount,
            formattedAmount: PixService.formatAmount(pixPayment.amount),
            qrCode: pixPayment.qrCode,
            qrCodeImage: pixPayment.qrCodeImage,
            status: pixPayment.status,
            expiresAt: pixPayment.expiresAt,
            paidAt: pixPayment.paidAt,
            pixKey: pixPayment.pixKey,
            receiverName: pixPayment.receiverName,
            description: pixPayment.description,
            isExpired
          }
        }
      });

    } catch (error) {
      console.error('Error getting PIX payment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update PIX payment status (webhook simulation)
  static async updatePixPaymentStatus(req, res) {
    try {
      const { pixPaymentId } = req.params;
      const { status, endToEndId } = req.body;

      // In a real implementation, this would be called by the payment provider webhook
      // For now, we'll simulate manual status updates
      
      const validStatuses = ['pending', 'paid', 'cancelled', 'expired', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const pixPayment = await PixService.updatePixPaymentStatus(pixPaymentId, status, endToEndId);

      // If payment is confirmed, update related quote/order status
      if (status === 'paid') {
        if (pixPayment.quoteId) {
          await Quote.update(
            { status: 'paid' },
            { where: { id: pixPayment.quoteId } }
          );
        }
        
        if (pixPayment.orderId) {
          await Order.update(
            { status: 'paid' },
            { where: { id: pixPayment.orderId } }
          );
        }
      }

      res.json({
        success: true,
        message: 'PIX payment status updated successfully',
        data: {
          pixPayment: {
            id: pixPayment.id,
            status: pixPayment.status,
            paidAt: pixPayment.paidAt,
            endToEndId: pixPayment.endToEndId
          }
        }
      });

    } catch (error) {
      console.error('Error updating PIX payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get user's PIX payments
  static async getUserPixPayments(req, res) {
    try {
      const { status } = req.query;
      const userId = req.user.id;

      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      // Get PIX payments for quotes where user is buyer or supplier
      const quotes = await Quote.findAll({
        where: {
          [req.user.role === 'buyer' ? 'buyerId' : 'supplierId']: userId
        },
        attributes: ['id']
      });

      const quoteIds = quotes.map(q => q.id);

      const pixPayments = await PixService.getPixPaymentsByQuote(quoteIds[0]); // Simplified for demo

      res.json({
        success: true,
        data: {
          pixPayments: pixPayments.map(payment => ({
            id: payment.id,
            transactionId: payment.transactionId,
            amount: payment.amount,
            formattedAmount: PixService.formatAmount(payment.amount),
            status: payment.status,
            createdAt: payment.createdAt,
            expiresAt: payment.expiresAt,
            paidAt: payment.paidAt,
            description: payment.description,
            isExpired: PixService.isPixPaymentExpired(payment)
          }))
        }
      });

    } catch (error) {
      console.error('Error getting user PIX payments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Validate PIX key
  static async validatePixKey(req, res) {
    try {
      const { pixKey, pixKeyType } = req.body;

      const isValid = PixService.validatePixKey(pixKey, pixKeyType);

      res.json({
        success: true,
        data: {
          isValid,
          pixKey,
          pixKeyType
        }
      });

    } catch (error) {
      console.error('Error validating PIX key:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

export default PixController;