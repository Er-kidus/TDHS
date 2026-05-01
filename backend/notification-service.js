const WebSocket = require('ws');
const { pool, query, verifyToken } = require('./database');

class NotificationService {
  constructor() {
    this.clients = new Map(); // userId -> WebSocket connection
    this.wss = null;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket connection established');

      // Handle authentication
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'auth') {
            const token = data.token;
            const decoded = verifyToken(token);
            
            if (decoded) {
              // Store connection with user ID
              this.clients.set(decoded.id, ws);
              ws.userId = decoded.id;
              ws.userRole = decoded.role;
              ws.pharmacyId = decoded.pharmacyId;
              
              // Send confirmation
              ws.send(JSON.stringify({
                type: 'auth_success',
                userId: decoded.id,
                message: 'Authenticated successfully'
              }));

              // Send any pending notifications
              await this.sendPendingNotifications(decoded.id);
            } else {
              ws.send(JSON.stringify({
                type: 'auth_error',
                message: 'Invalid token'
              }));
              ws.close();
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        if (ws.userId) {
          this.clients.delete(ws.userId);
          console.log(`User ${ws.userId} disconnected`);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to notification service'
      }));
    });

    console.log('WebSocket notification service initialized');
  }

  async sendNotification(userId, notification) {
    const ws = this.clients.get(userId);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
      return true;
    } else {
      // Store notification for later delivery
      await this.storePendingNotification(userId, notification);
      return false;
    }
  }

  async broadcastToPharmacy(pharmacyId, notification) {
    const promises = [];
    
    for (const [userId, ws] of this.clients) {
      if (ws.pharmacyId === pharmacyId && ws.readyState === WebSocket.OPEN) {
        promises.push(
          new Promise(resolve => {
            ws.send(JSON.stringify({
              type: 'notification',
              data: notification
            }));
            resolve(true);
          })
        );
      }
    }

    await Promise.all(promises);
  }

  async broadcastToRole(role, notification) {
    const promises = [];
    
    for (const [userId, ws] of this.clients) {
      if (ws.userRole === role && ws.readyState === WebSocket.OPEN) {
        promises.push(
          new Promise(resolve => {
            ws.send(JSON.stringify({
              type: 'notification',
              data: notification
            }));
            resolve(true);
          })
        );
      }
    }

    await Promise.all(promises);
  }

  async storePendingNotification(userId, notification) {
    try {
      await query(
        'INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at) VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)',
        [userId, notification.type, notification.title, notification.message, JSON.stringify(notification.data || {})]
      );
    } catch (error) {
      console.error('Error storing pending notification:', error);
    }
  }

  async sendPendingNotifications(userId) {
    try {
      const result = await query(
        'SELECT id, type, title, message, data FROM notifications WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC LIMIT 10',
        [userId]
      );

      const ws = this.clients.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        for (const row of result.rows) {
          ws.send(JSON.stringify({
            type: 'notification',
            data: {
              id: row.id,
              type: row.type,
              title: row.title,
              message: row.message,
              data: row.data,
              created_at: row.created_at
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }

  // Notification helpers
  async notifyLowStock(pharmacyId, medicationName, currentStock, reorderLevel) {
    const notification = {
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${medicationName} is running low on stock (${currentStock} remaining, reorder at ${reorderLevel})`,
      data: {
        medicationName,
        currentStock,
        reorderLevel,
        urgency: currentStock < reorderLevel / 2 ? 'high' : 'medium'
      },
      priority: 'high'
    };

    await this.broadcastToPharmacy(pharmacyId, notification);
  }

  async notifyNewPrescription(pharmacyId, prescriptionDetails) {
    const notification = {
      type: 'new_prescription',
      title: 'New Prescription Received',
      message: `New prescription for ${prescriptionDetails.patientName}: ${prescriptionDetails.medicationName}`,
      data: prescriptionDetails,
      priority: 'medium'
    };

    await this.broadcastToPharmacy(pharmacyId, notification);
  }

  async notifyPrescriptionFilled(pharmacyId, prescriptionNumber, patientName) {
    const notification = {
      type: 'prescription_filled',
      title: 'Prescription Filled',
      message: `Prescription ${prescriptionNumber} for ${patientName} has been filled`,
      data: {
        prescriptionNumber,
        patientName,
        timestamp: new Date().toISOString()
      },
      priority: 'low'
    };

    await this.broadcastToPharmacy(pharmacyId, notification);
  }

  async notifySystemAlert(title, message, severity = 'info') {
    const notification = {
      type: 'system_alert',
      title,
      message,
      data: {
        severity,
        timestamp: new Date().toISOString()
      },
      priority: severity === 'critical' ? 'high' : 'medium'
    };

    // Broadcast to all connected clients
    for (const [userId, ws] of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));
      }
    }
  }

  getConnectedClients() {
    const clients = [];
    for (const [userId, ws] of this.clients) {
      clients.push({
        userId,
        role: ws.userRole,
        pharmacyId: ws.pharmacyId,
        connected: ws.readyState === WebSocket.OPEN
      });
    }
    return clients;
  }
}

// Create notifications table
async function initializeNotificationTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      )
    `);

    // Create index for performance
    await query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read)');

    console.log('Notification system initialized');
  } catch (error) {
    console.error('Error initializing notification system:', error);
  }
}

module.exports = {
  NotificationService,
  initializeNotificationTable
};
