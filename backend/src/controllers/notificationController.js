import notificationService from '../services/notificationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class NotificationController {
  getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const notifications = await notificationService.getNotificationHistory(
      userId, 
      parseInt(limit)
    );

    res.json({
      success: true,
      notifications
    });
  });

  getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount
    });
  });

  markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;

    await notificationService.markNotificationAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  });

  testNotification = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type = 'test', message = 'Teste de notificação' } = req.body;

    const sent = notificationService.sendToUser(userId, {
      type,
      title: 'Notificação de Teste',
      message,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      sent,
      message: sent ? 'Test notification sent' : 'User not connected'
    });
  });
}

export default new NotificationController();