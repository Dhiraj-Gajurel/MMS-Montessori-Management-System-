/* ==========================================================================
   MONTESSORI SCHOOL - AUTHENTICATION & SESSION MANAGEMENT
   ========================================================================== */

const Auth = {
  TOKEN_KEY: 'montessori_admin_token',
  USER_KEY: 'montessori_admin_user',
  INACTIVITY_LIMIT: 15 * 60 * 1000, // 15 minutes session timeout
  inactivityTimer: null,

  init() {
    this.resetInactivityTimer();
    this.setupEventListeners();
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  saveSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.resetInactivityTimer();
  },

  logout(reason = 'Logged out successfully') {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    
    // Redirect to login view or home
    if (window.location.pathname.includes('admin.html')) {
      alert(reason);
      window.location.reload();
    }
  },

  resetInactivityTimer() {
    if (!this.isAuthenticated()) return;
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);

    this.inactivityTimer = setTimeout(() => {
      this.logout('Session expired due to inactivity. Please log in again.');
    }, this.INACTIVITY_LIMIT);
  },

  setupEventListeners() {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(evt => {
      window.addEventListener(evt, () => this.resetInactivityTimer(), { passive: true });
    });
  }
};

// Initialize auth session watchers
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
