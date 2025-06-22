import express from 'express';

const router = express.Router();

/**
 * @route POST /api/errors
 * @desc Log frontend errors
 * @access Public (no auth required for error logging)
 */
router.post('/', async (req, res) => {
  try {
    const errorData = req.body;
    
    // Log to console for development
    console.error('Frontend Error:', {
      message: errorData.message,
      stack: errorData.stack,
      timestamp: errorData.timestamp,
      userAgent: errorData.userAgent,
      url: errorData.url,
      errorId: errorData.errorId,
      userId: req.user?.id || 'anonymous'
    });

    // In production, you might want to:
    // - Save to database
    // - Send to error tracking service (Sentry, LogRocket, etc.)
    // - Send alerts for critical errors

    res.status(200).json({
      success: true,
      message: 'Error logged successfully',
      errorId: errorData.errorId
    });
    
  } catch (error) {
    console.error('Failed to log frontend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log error'
    });
  }
});

export default router;