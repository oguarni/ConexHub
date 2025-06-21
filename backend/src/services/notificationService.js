import { EventEmitter } from 'events';
import { User, Supplier, Order, Quote } from '../models/index.js';

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map(); // userId -> WebSocket connection
  }

  addConnection(userId, ws) {
    this.connections.set(userId, ws);
    
    ws.on('close', () => {
      this.connections.delete(userId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
      this.connections.delete(userId);
    });

    // Send connection confirmation
    this.sendToUser(userId, {
      type: 'connection',
      message: 'Conectado ao sistema de notificações',
      timestamp: new Date().toISOString()
    });
  }

  sendToUser(userId, notification) {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === 1) { // WebSocket.OPEN
      try {
        connection.send(JSON.stringify(notification));
        return true;
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
        this.connections.delete(userId);
        return false;
      }
    }
    return false;
  }

  broadcastToRole(role, notification) {
    // This would require storing user roles with connections
    // For now, we'll implement individual notifications
    this.connections.forEach((connection, userId) => {
      this.sendToUser(userId, notification);
    });
  }

  // Order-related notifications
  async notifyNewOrder(order) {
    try {
      const orderWithDetails = await Order.findByPk(order.id, {
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: Supplier, attributes: ['id', 'companyName'] }
        ]
      });

      // Notify supplier
      if (orderWithDetails.Supplier) {
        const supplierUser = await User.findOne({
          where: { id: orderWithDetails.Supplier.userId }
        });
        
        if (supplierUser) {
          this.sendToUser(supplierUser.id, {
            type: 'new_order',
            title: 'Novo Pedido Recebido',
            message: `Você recebeu um novo pedido de ${orderWithDetails.User.name}`,
            data: {
              orderId: order.id,
              customerName: orderWithDetails.User.name,
              total: order.totalAmount
            },
            timestamp: new Date().toISOString()
          });
        }
      }

      // Notify admins
      const admins = await User.findAll({ where: { role: 'admin' } });
      admins.forEach(admin => {
        this.sendToUser(admin.id, {
          type: 'admin_new_order',
          title: 'Novo Pedido na Plataforma',
          message: `Pedido #${order.id} foi criado`,
          data: {
            orderId: order.id,
            customerName: orderWithDetails.User.name,
            supplierName: orderWithDetails.Supplier?.companyName,
            total: order.totalAmount
          },
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('Error sending new order notifications:', error);
    }
  }

  async notifyOrderStatusChange(order, oldStatus, newStatus) {
    try {
      const orderWithDetails = await Order.findByPk(order.id, {
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: Supplier, attributes: ['id', 'companyName'] }
        ]
      });

      // Notify customer
      this.sendToUser(orderWithDetails.User.id, {
        type: 'order_status_change',
        title: 'Status do Pedido Atualizado',
        message: `Seu pedido #${order.id} foi ${this.getStatusText(newStatus)}`,
        data: {
          orderId: order.id,
          oldStatus,
          newStatus,
          supplierName: orderWithDetails.Supplier?.companyName
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending order status change notifications:', error);
    }
  }

  // Quote-related notifications
  async notifyNewQuote(quote) {
    try {
      const quoteWithDetails = await Quote.findByPk(quote.id, {
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: Supplier, attributes: ['id', 'companyName'] }
        ]
      });

      // Notify supplier
      if (quoteWithDetails.Supplier) {
        const supplierUser = await User.findOne({
          where: { id: quoteWithDetails.Supplier.userId }
        });
        
        if (supplierUser) {
          this.sendToUser(supplierUser.id, {
            type: 'new_quote_request',
            title: 'Nova Solicitação de Cotação',
            message: `${quoteWithDetails.User.name} solicitou uma cotação`,
            data: {
              quoteId: quote.id,
              customerName: quoteWithDetails.User.name,
              productName: quoteWithDetails.productName
            },
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error sending new quote notifications:', error);
    }
  }

  async notifyQuoteResponse(quote) {
    try {
      const quoteWithDetails = await Quote.findByPk(quote.id, {
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: Supplier, attributes: ['id', 'companyName'] }
        ]
      });

      // Notify customer
      this.sendToUser(quoteWithDetails.User.id, {
        type: 'quote_response',
        title: 'Cotação Recebida',
        message: `${quoteWithDetails.Supplier.companyName} respondeu sua cotação`,
        data: {
          quoteId: quote.id,
          supplierName: quoteWithDetails.Supplier.companyName,
          totalPrice: quote.totalPrice
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending quote response notifications:', error);
    }
  }

  // Supplier-related notifications
  async notifySupplierVerification(supplierId, verified) {
    try {
      const supplier = await Supplier.findByPk(supplierId, {
        include: [{ model: User, attributes: ['id', 'name', 'email'] }]
      });

      if (supplier && supplier.User) {
        this.sendToUser(supplier.User.id, {
          type: 'supplier_verification',
          title: verified ? 'Fornecedor Verificado' : 'Verificação Pendente',
          message: verified 
            ? 'Parabéns! Seu perfil de fornecedor foi verificado e aprovado'
            : 'Sua solicitação de verificação está sendo analisada',
          data: {
            supplierId,
            verified,
            companyName: supplier.companyName
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending supplier verification notifications:', error);
    }
  }

  // System notifications
  async notifySystemMaintenance(message, scheduledTime) {
    const notification = {
      type: 'system_maintenance',
      title: 'Manutenção Programada',
      message,
      data: {
        scheduledTime
      },
      timestamp: new Date().toISOString()
    };

    // Broadcast to all connected users
    this.connections.forEach((connection, userId) => {
      this.sendToUser(userId, notification);
    });
  }

  async notifyLowStock(product, supplierId) {
    try {
      const supplier = await Supplier.findByPk(supplierId, {
        include: [{ model: User, attributes: ['id'] }]
      });

      if (supplier && supplier.User) {
        this.sendToUser(supplier.User.id, {
          type: 'low_stock',
          title: 'Estoque Baixo',
          message: `O produto "${product.name}" está com estoque baixo`,
          data: {
            productId: product.id,
            productName: product.name,
            currentStock: product.stock,
            minQuantity: product.minQuantity
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending low stock notifications:', error);
    }
  }

  // Utility methods
  getStatusText(status) {
    const statusMap = {
      'pending': 'confirmado',
      'processing': 'sendo processado',
      'shipped': 'enviado',
      'delivered': 'entregue',
      'cancelled': 'cancelado'
    };
    return statusMap[status] || status;
  }

  // Get notification history for a user (would require a notifications table)
  async getNotificationHistory(userId, limit = 20) {
    // This would require implementing a notifications table to store history
    // For now, return empty array
    return [];
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, userId) {
    // This would require implementing a notifications table
    // For now, just return success
    return true;
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    // This would require implementing a notifications table
    // For now, return 0
    return 0;
  }
}

export default new NotificationService();