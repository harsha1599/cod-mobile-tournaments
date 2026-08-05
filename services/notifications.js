/**
 * Notification Service - Handle in-app notifications
 * Manages toast notifications and alerts
 */

class NotificationService {
  constructor() {
    this.notifications = [];
    this.notificationDuration = 5000; // 5 seconds default
  }

  /**
   * Show success notification
   */
  success(message, duration = this.notificationDuration) {
    this.show(message, 'success', duration);
  }

  /**
   * Show error notification
   */
  error(message, duration = this.notificationDuration) {
    this.show(message, 'error', duration);
  }

  /**
   * Show warning notification
   */
  warning(message, duration = this.notificationDuration) {
    this.show(message, 'warning', duration);
  }

  /**
   * Show info notification
   */
  info(message, duration = this.notificationDuration) {
    this.show(message, 'info', duration);
  }

  /**
   * Core show notification method
   */
  show(message, type = 'info', duration = this.notificationDuration) {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };

    this.notifications.push(notification);
    this.displayNotification(notification);

    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }

    return notification.id;
  }

  /**
   * Display notification in DOM
   */
  displayNotification(notification) {
    const container = this.getNotificationContainer();
    const notificationEl = this.createNotificationElement(notification);
    container.appendChild(notificationEl);

    // Trigger animation
    setTimeout(() => notificationEl.classList.add('show'), 10);
  }

  /**
   * Create notification DOM element
   */
  createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification notification-${notification.type}`;
    div.id = `notification-${notification.id}`;
    div.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${this.escapeHtml(notification.message)}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    return div;
  }

  /**
   * Get or create notification container
   */
  getNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Remove notification
   */
  remove(id) {
    const notificationEl = document.getElementById(`notification-${id}`);
    if (notificationEl) {
      notificationEl.classList.remove('show');
      setTimeout(() => notificationEl.remove(), 300);
    }
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.forEach(n => this.remove(n.id));
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default new NotificationService();
