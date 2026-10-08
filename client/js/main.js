/* ==========================================================================
   MONTESSORI SCHOOL - PUBLIC SITE CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  highlightActiveNavLink();
  
  // Page specific initializers
  if (document.getElementById('programs-container')) {
    loadPrograms();
  }
  if (document.getElementById('gallery-grid-container')) {
    loadGallery('all');
    setupGalleryFilters();
  }
  if (document.getElementById('resources-container')) {
    loadResources('all');
    setupResourceFilters();
  }
  if (document.getElementById('events-container')) {
    loadEvents('all');
  }
  if (document.getElementById('contact-form')) {
    setupContactForm();
  }
  if (document.getElementById('home-programs-preview')) {
    loadHomePreviews();
  }
});

/* Mobile Navigation Toggle */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close when clicking outside or link
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }
}

/* Highlight Active Nav Link */
function highlightActiveNavLink() {
  const links = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* Load Programs (Programs Page & Home Preview) */
async function loadPrograms() {
  const container = document.getElementById('programs-container');
  if (!container) return;

  try {
    const programs = await API.getPrograms();
    renderProgramsList(programs, container);
  } catch (err) {
    console.warn('Backend unavailable, using default Montessori programs', err);
    // Dynamic rendering fallback if API server is connecting
  }
}

function renderProgramsList(programs, container) {
  if (!programs || programs.length === 0) {
    container.innerHTML = '<p class="text-muted">No programs currently listed.</p>';
    return;
  }

  const iconsMap = {
    'blocks': '🧩',
    'script': '✏️',
    'numbers': '🔢'
  };

  container.innerHTML = programs.map(p => `
    <div class="program-card">
      <span class="program-age">${escapeHtml(p.age_group)}</span>
      <div style="font-size: 2.5rem; margin-bottom: 10px;">${iconsMap[p.icon] || '🏫'}</div>
      <h3 class="card-title">${escapeHtml(p.title)}</h3>
      <p class="card-text">${escapeHtml(p.description)}</p>
      
      ${p.objectives ? `
        <div style="margin-top: 15px;">
          <h4 style="font-size: 1.05rem; color: var(--color-blue); margin-bottom: 5px;">Learning Objectives:</h4>
          <p style="font-size: 0.95rem; color: var(--text-muted);">${escapeHtml(p.objectives)}</p>
        </div>
      ` : ''}

      ${p.activities ? `
        <div style="margin-top: 15px;">
          <h4 style="font-size: 1.05rem; color: var(--color-green); margin-bottom: 5px;">Activities & Exercises:</h4>
          <p style="font-size: 0.95rem; color: var(--text-muted);">${escapeHtml(p.activities)}</p>
        </div>
      ` : ''}
    </div>
  `).join('');
}

/* Load Home Page Previews */
async function loadHomePreviews() {
  const progPreview = document.getElementById('home-programs-preview');
  const eventsPreview = document.getElementById('home-events-preview');
  const galleryPreview = document.getElementById('home-gallery-preview');

  try {
    if (progPreview) {
      const programs = await API.getPrograms();
      renderProgramsList(programs.slice(0, 3), progPreview);
    }
    if (eventsPreview) {
      const events = await API.getEvents();
      renderEventsList(events.slice(0, 3), eventsPreview);
    }
    if (galleryPreview) {
      const gallery = await API.getGallery();
      renderGalleryGrid(gallery.slice(0, 4), galleryPreview);
    }
  } catch (err) {
    console.log('Home preview fallback', err);
  }
}

/* Gallery & Lightbox */
async function loadGallery(category = 'all') {
  const container = document.getElementById('gallery-grid-container');
  if (!container) return;

  try {
    const items = await API.getGallery(category);
    renderGalleryGrid(items, container);
  } catch (err) {
    console.error('Gallery load error', err);
  }
}

function setupGalleryFilters() {
  const buttons = document.querySelectorAll('.gallery-filter .filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category || 'all';
      loadGallery(cat);
    });
  });
}

function renderGalleryGrid(items, container) {
  if (!items || items.length === 0) {
    container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">No items found in this category.</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="gallery-item" onclick="openLightbox('${escapeHtml(item.file_path)}', '${escapeHtml(item.title)}', '${escapeHtml(item.description || '')}')">
      <img src="${escapeHtml(item.file_path)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'">
      <span class="gallery-badge">${escapeHtml(item.category)}</span>
      <div class="gallery-overlay">
        <h4 style="font-size: 1.1rem; color: #fff;">${escapeHtml(item.title)}</h4>
        <p style="font-size: 0.85rem; color: #ddd;">${escapeHtml(item.description || '')}</p>
      </div>
    </div>
  `).join('');
}

function openLightbox(src, title, desc) {
  let modal = document.getElementById('lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
      <div class="lightbox-content">
        <img id="lightbox-img" src="" alt="">
        <div style="padding: 15px; color: #fff; background: #1A202C; text-align: center;">
          <h3 id="lightbox-title" style="color: #fff;"></h3>
          <p id="lightbox-desc" style="color: #CBD5E1; font-size: 0.9rem; margin-top: 4px;"></p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox-desc').textContent = desc;
  modal.classList.add('active');
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.remove('active');
}

/* Resources */
async function loadResources(category = 'all') {
  const container = document.getElementById('resources-container');
  if (!container) return;

  try {
    const resources = await API.getResources(category);
    renderResourcesList(resources, container);
  } catch (err) {
    console.error('Resources error', err);
  }
}

function setupResourceFilters() {
  const buttons = document.querySelectorAll('.resource-filter .filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category || 'all';
      loadResources(cat);
    });
  });
}

function renderResourcesList(resources, container) {
  if (!resources || resources.length === 0) {
    container.innerHTML = '<p class="text-muted">No downloadable resources found.</p>';
    return;
  }

  container.innerHTML = resources.map(r => `
    <div class="resource-card">
      <div class="resource-info">
        <span class="resource-cat">${escapeHtml(r.category)} &bull; ${escapeHtml(r.file_type || 'PDF')}</span>
        <h3 class="resource-title">${escapeHtml(r.title)}</h3>
        <p class="resource-desc">${escapeHtml(r.description || '')}</p>
      </div>
      <a href="${escapeHtml(r.file_path)}" target="_blank" download class="btn btn-green">
        📥 Download
      </a>
    </div>
  `).join('');
}

/* Events */
async function loadEvents(category = 'all') {
  const container = document.getElementById('events-container');
  if (!container) return;

  try {
    const events = await API.getEvents(category);
    renderEventsList(events, container);
  } catch (err) {
    console.error('Events error', err);
  }
}

function renderEventsList(events, container) {
  if (!events || events.length === 0) {
    container.innerHTML = '<p class="text-muted">No upcoming events or announcements.</p>';
    return;
  }

  container.innerHTML = events.map(e => `
    <div class="event-card">
      ${e.featured_image ? `
        <img src="${escapeHtml(e.featured_image)}" class="event-img" alt="${escapeHtml(e.title)}" onerror="this.src='https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800'">
      ` : ''}
      <div class="event-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="event-date-badge">📅 ${escapeHtml(e.event_date || 'Upcoming')}</span>
          ${e.is_important ? '<span class="badge badge-warning">Important Notice</span>' : ''}
        </div>
        <h3 class="event-title">${escapeHtml(e.title)}</h3>
        <div class="card-text">${e.content}</div>
      </div>
    </div>
  `).join('');
}

/* Contact Form Submission */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      showFeedback(feedback, 'Please fill in all required fields.', 'red');
      return;
    }

    try {
      const res = await API.submitContact({ name, email, phone, message });
      showFeedback(feedback, res.message || 'Thank you! Message sent.', 'green');
      form.reset();
    } catch (err) {
      showFeedback(feedback, err.message || 'Error submitting message. Please try again.', 'red');
    }
  });
}

function showFeedback(el, msg, color) {
  if (!el) return;
  el.style.display = 'block';
  el.style.padding = '12px 18px';
  el.style.borderRadius = '12px';
  el.style.marginTop = '15px';
  el.style.fontWeight = 'bold';
  el.style.backgroundColor = color === 'green' ? '#EFFFF1' : '#FFEAEB';
  el.style.color = color === 'green' ? '#6BCB77' : '#FF4B4B';
  el.textContent = msg;
}

/* Helper XSS Protection */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
