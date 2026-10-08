/* ==========================================================================
   MONTESSORI SCHOOL - API CONNECTOR
   ========================================================================== */

const API_BASE_URL = window.location.origin.includes('http') 
  ? `${window.location.origin}/api` 
  : 'http://127.0.0.1:5000/api';

const API = {
  // Helper for requests
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('montessori_admin_token');
    
    const headers = {
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Only set Content-Type to JSON if body is NOT FormData
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      if (typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },

  // Auth Endpoints
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  // Programs Endpoints
  getPrograms() {
    return this.request('/programs');
  },
  createProgram(data) {
    return this.request('/programs', { method: 'POST', body: data });
  },
  updateProgram(id, data) {
    return this.request(`/programs/${id}`, { method: 'PUT', body: data });
  },
  deleteProgram(id) {
    return this.request(`/programs/${id}`, { method: 'DELETE' });
  },

  // Resources Endpoints
  getResources(category = 'all') {
    return this.request(`/resources?category=${encodeURIComponent(category)}`);
  },
  createResource(formDataOrData) {
    return this.request('/resources', { method: 'POST', body: formDataOrData });
  },
  updateResource(id, formDataOrData) {
    return this.request(`/resources/${id}`, { method: 'PUT', body: formDataOrData });
  },
  deleteResource(id) {
    return this.request(`/resources/${id}`, { method: 'DELETE' });
  },

  // Gallery Endpoints
  getGallery(category = 'all') {
    return this.request(`/gallery?category=${encodeURIComponent(category)}`);
  },
  addGalleryItem(formDataOrData) {
    return this.request('/gallery', { method: 'POST', body: formDataOrData });
  },
  deleteGalleryItem(id) {
    return this.request(`/gallery/${id}`, { method: 'DELETE' });
  },

  // Events Endpoints
  getEvents(category = 'all') {
    return this.request(`/events?category=${encodeURIComponent(category)}`);
  },
  createEvent(formDataOrData) {
    return this.request('/events', { method: 'POST', body: formDataOrData });
  },
  updateEvent(id, formDataOrData) {
    return this.request(`/events/${id}`, { method: 'PUT', body: formDataOrData });
  },
  deleteEvent(id) {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  },

  // Contact Submissions
  submitContact(data) {
    return this.request('/contact', { method: 'POST', body: data });
  },
  getContactSubmissions() {
    return this.request('/contact');
  },
  markContactRead(id) {
    return this.request(`/contact/${id}/read`, { method: 'PUT' });
  },
  deleteContactSubmission(id) {
    return this.request(`/contact/${id}`, { method: 'DELETE' });
  }
};
