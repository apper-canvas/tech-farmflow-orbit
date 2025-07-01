import notificationsData from '@/services/mockData/notifications.json';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { toast } from 'react-toastify';

// Simulate API delay for realistic loading states
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let notifications = [...notificationsData];

// Email transporter configuration (would use real SMTP in production)
const emailTransporter = nodemailer.createTransporter({
  host: 'localhost', // Mock SMTP server
  port: 587,
  secure: false,
  auth: {
    user: 'farm@example.com',
    pass: 'password'
  }
});

// Scheduled notification jobs storage
const scheduledJobs = new Map();

const notificationService = {
  async getAll() {
    await delay(250);
    return [...notifications];
  },
  
  async getById(id) {
    await delay(200);
    const notification = notifications.find(n => n.Id === id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return { ...notification };
  },
  
  async getByTaskId(taskId) {
    await delay(200);
    const notification = notifications.find(n => n.taskId === taskId);
    return notification ? { ...notification } : null;
  },
  
  async create(notificationData) {
    await delay(350);
    const newId = Math.max(...notifications.map(n => n.Id), 0) + 1;
    const newNotification = {
      Id: newId,
      ...notificationData,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    notifications.push(newNotification);
    
    // Schedule the notification
    await this.scheduleNotification(newNotification);
    
    return { ...newNotification };
  },
  
  async update(id, notificationData) {
    await delay(300);
    const index = notifications.findIndex(n => n.Id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    // Cancel existing scheduled job
    this.cancelScheduledNotification(id);
    
    notifications[index] = { ...notifications[index], ...notificationData };
    
    // Reschedule if still active
    if (notifications[index].isActive) {
      await this.scheduleNotification(notifications[index]);
    }
    
    return { ...notifications[index] };
  },
  
  async delete(id) {
    await delay(250);
    const index = notifications.findIndex(n => n.Id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    // Cancel scheduled job
    this.cancelScheduledNotification(id);
    
    notifications.splice(index, 1);
    return true;
  },
  
  async scheduleNotification(notification) {
    try {
      const task = notification.task;
      if (!task) return;
      
      const dueDate = new Date(task.dueDate);
      const reminderTime = notification.reminderTime || 24;
      const notificationTime = new Date(dueDate.getTime() - (reminderTime * 60 * 60 * 1000));
      
      // Only schedule if notification time is in the future
      if (notificationTime > new Date()) {
        const cronExpression = this.getCronExpression(notificationTime);
        
        const job = cron.schedule(cronExpression, async () => {
          // Send in-app notification
          if (notification.inAppEnabled) {
            toast.info(`Reminder: ${task.title} is due in ${reminderTime} hours`, {
              autoClose: 8000,
              icon: "🔔"
            });
          }
          
          // Send email notification
          if (notification.emailEnabled) {
            await this.sendEmailNotification(notification, task);
          }
          
          // Mark job as completed
          scheduledJobs.delete(notification.Id);
        }, {
          scheduled: false
        });
        
        scheduledJobs.set(notification.Id, job);
        job.start();
      }
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  },
  
  cancelScheduledNotification(notificationId) {
    const job = scheduledJobs.get(notificationId);
    if (job) {
      job.stop();
      job.destroy();
      scheduledJobs.delete(notificationId);
    }
  },
  
  getCronExpression(date) {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${minute} ${hour} ${day} ${month} *`;
  },
  
  async sendEmailNotification(notification, task) {
    try {
      const mailOptions = {
        from: 'FarmFlow <notifications@farmflow.com>',
        to: 'farmer@example.com', // Would get user email from profile
        subject: `Task Reminder: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">Task Reminder</h2>
            <p>This is a reminder that your task "<strong>${task.title}</strong>" is due soon.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Task:</strong> ${task.title}</p>
              <p><strong>Type:</strong> ${task.type}</p>
              <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
              ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ''}
            </div>
            <p>Don't forget to complete this task on time!</p>
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The FarmFlow Team
            </p>
          </div>
        `
      };
      
      await emailTransporter.sendMail(mailOptions);
      console.log('Email notification sent successfully');
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  },
  
  // Get all pending notifications for a specific date range
  async getPendingNotifications(startDate, endDate) {
    await delay(200);
    return notifications.filter(notification => {
      if (!notification.isActive) return false;
      const notificationDate = new Date(notification.task.dueDate);
      return notificationDate >= startDate && notificationDate <= endDate;
    });
  },
  
  // Mark notification as sent
  async markAsSent(id) {
    await delay(150);
    const index = notifications.findIndex(n => n.Id === id);
    if (index !== -1) {
      notifications[index].lastSent = new Date().toISOString();
      notifications[index].sentCount = (notifications[index].sentCount || 0) + 1;
    }
    return true;
  }
};

export default notificationService;