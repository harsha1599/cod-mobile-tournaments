/**
 * Analytics Service - Track user events and analytics
 * Sends analytics data to tracking service
 */

class AnalyticsService {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = null;
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Track event
   */
  trackEvent(eventName, eventData = {}) {
    const event = {
      id: this.generateEventId(),
      name: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.events.push(event);
    this.sendEvent(event);

    if (import.meta.env.VITE_DEBUG_MODE) {
      console.log(`[Analytics] Event tracked: ${eventName}`, eventData);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName = '') {
    const page = pageName || document.title;
    this.trackEvent('page_view', {
      page,
      url: window.location.href,
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action, category = '', label = '') {
    this.trackEvent('user_action', {
      action,
      category,
      label,
    });
  }

  /**
   * Track error
   */
  trackError(errorName, errorMessage = '', errorStack = '') {
    this.trackEvent('error', {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
    });
  }

  /**
   * Send event to analytics service
   */
  async sendEvent(event) {
    try {
      // Send to your analytics endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * Batch send events
   */
  async batchSendEvents() {
    if (this.events.length === 0) return;

    try {
      const eventsToSend = [...this.events];
      // await fetch('/api/analytics/batch', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: eventsToSend }),
      // });
      this.events = [];
    } catch (error) {
      console.error('Failed to batch send analytics events:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get session ID
   */
  getSessionId() {
    return this.sessionId;
  }
}

export default new AnalyticsService();
