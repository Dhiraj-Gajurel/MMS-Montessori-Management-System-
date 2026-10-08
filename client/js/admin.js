/* ==========================================================================
   MONTESSORI SCHOOL - ADMIN DASHBOARD CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAdminView();
});

function initAdminView() {
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');

  if (Auth.isAuthenticated()) {
    if (loginView) loginView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'flex';
    setupDashboard();
  } else {
    if (loginView) loginView.style.display = 'flex';
    if (dashboardView) dashboardView.style.display = 'none';
    setupLoginForm();
  }
}

/* Admin Login Handler */
function setupLoginForm() {
  const form = document.getElementById('admin-login-form');
  const errorBox = document.getElementById('login-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    try {
      const res = await API.login({ username: email, password });
      Auth.saveSession(res.access_token, res.user);
      window.location.reload();
    } catch (err) {
      errorBox.textContent = err.message || 'Invalid username/email or password';
      errorBox.style.display = 'block';
    }
  });
}

/* Dashboard Tab Navigation & CRUD Loaders */
function setupDashboard() {
  const user = Auth.getUser();
  if (user && document.getElementById('admin-username-display')) {
    document.getElementById('admin-username-display').textContent = user.username || user.email;
  }

  // Logout button handler
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  // Tab switching
  const tabs = document.querySelectorAll('.admin-nav-item');
  const panels = document.querySelectorAll('.admin-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(`panel-${target}`);
      if (targetPanel) targetPanel.classList.add('active');

      loadPanelData(target);
    });
  });

  // Setup rich text editor toolbar
  setupRichTextEditors();

  // Initial stats & default panel load
  loadDashboardStats();
  loadPanelData('programs');
}

/* Stats Counter */
async function loadDashboardStats() {
  try {
    const [progs, res, gallery, subs] = await Promise.all([
      API.getPrograms().catch(() => []),
      API.getResources().catch(() => []),
      API.getGallery().catch(() => []),
      API.getContactSubmissions().catch(() => [])
    ]);

    if (document.getElementById('stat-programs-count')) document.getElementById('stat-programs-count').textContent = progs.length;
    if (document.getElementById('stat-resources-count')) document.getElementById('stat-resources-count').textContent = res.length;
    if (document.getElementById('stat-gallery-count')) document.getElementById('stat-gallery-count').textContent = gallery.length;
    if (document.getElementById('stat-submissions-count')) document.getElementById('stat-submissions-count').textContent = subs.length;
  } catch (err) {
    console.error('Stats load error', err);
  }
}

/* Load Data by Panel Name */
function loadPanelData(panelName) {
  switch (panelName) {
    case 'programs':
      loadAdminPrograms();
      break;
    case 'resources':
      loadAdminResources();
      break;
    case 'gallery':
      loadAdminGallery();
      break;
    case 'events':
      loadAdminEvents();
      break;
    case 'submissions':
      loadAdminSubmissions();
      break;
  }
}

/* -------------------------------------------------------------------------- */
/* PROGRAMS MANAGEMENT */
/* -------------------------------------------------------------------------- */
async function loadAdminPrograms() {
  const tbody = document.getElementById('table-programs-body');
  if (!tbody) return;

  try {
    const programs = await API.getPrograms();
    tbody.innerHTML = programs.map(p => `
      <tr>
        <td><strong>${escapeHtml(p.title)}</strong></td>
        <td><span class="badge badge-primary">${escapeHtml(p.age_group)}</span></td>
        <td>${escapeHtml(p.description.substring(0, 70))}...</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-edit" onclick="openProgramModal(${p.id})">✏️</button>
            <button class="btn-icon btn-delete" onclick="deleteProgram(${p.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error loading programs: ${err.message}</td></tr>`;
  }
}

async function openProgramModal(id = null) {
  const modal = document.getElementById('modal-program');
  const form = document.getElementById('form-program');
  const modalTitle = document.getElementById('modal-program-title');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('program-id').value = id || '';

  if (id) {
    modalTitle.textContent = 'Edit Program';
    try {
      const programs = await API.getPrograms();
      const p = programs.find(item => item.id === id);
      if (p) {
        document.getElementById('prog-title').value = p.title;
        document.getElementById('prog-age').value = p.age_group;
        document.getElementById('prog-desc').value = p.description;
        document.getElementById('prog-objectives').value = p.objectives || '';
        document.getElementById('prog-activities').value = p.activities || '';
      }
    } catch (err) {
      alert('Error fetching program details');
    }
  } else {
    modalTitle.textContent = 'Add New Program';
  }

  modal.classList.add('active');
}

function closeProgramModal() {
  const modal = document.getElementById('modal-program');
  if (modal) modal.classList.remove('active');
}

async function saveProgram(e) {
  e.preventDefault();
  const id = document.getElementById('program-id').value;
  const data = {
    title: document.getElementById('prog-title').value,
    age_group: document.getElementById('prog-age').value,
    description: document.getElementById('prog-desc').value,
    objectives: document.getElementById('prog-objectives').value,
    activities: document.getElementById('prog-activities').value
  };

  try {
    if (id) {
      await API.updateProgram(id, data);
    } else {
      await API.createProgram(data);
    }
    closeProgramModal();
    loadAdminPrograms();
    loadDashboardStats();
  } catch (err) {
    alert(err.message || 'Error saving program');
  }
}

async function deleteProgram(id) {
  if (!confirm('Are you sure you want to delete this program?')) return;
  try {
    await API.deleteProgram(id);
    loadAdminPrograms();
    loadDashboardStats();
  } catch (err) {
    alert(err.message || 'Error deleting program');
  }
}

/* -------------------------------------------------------------------------- */
/* RESOURCES MANAGEMENT */
/* -------------------------------------------------------------------------- */
async function loadAdminResources() {
  const tbody = document.getElementById('table-resources-body');
  if (!tbody) return;

  try {
    const resources = await API.getResources();
    tbody.innerHTML = resources.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.title)}</strong></td>
        <td><span class="badge badge-success">${escapeHtml(r.category)}</span></td>
        <td>${escapeHtml(r.file_type || 'PDF')}</td>
        <td>
          <div class="action-btns">
            <a href="${escapeHtml(r.file_path)}" target="_blank" download class="btn-icon btn-edit" title="Download">📥</a>
            <button class="btn-icon btn-delete" onclick="deleteResource(${r.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error loading resources</td></tr>`;
  }
}

function openResourceModal() {
  const modal = document.getElementById('modal-resource');
  const form = document.getElementById('form-resource');
  if (form) form.reset();
  if (modal) modal.classList.add('active');
}

function closeResourceModal() {
  const modal = document.getElementById('modal-resource');
  if (modal) modal.classList.remove('active');
}

async function saveResource(e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', document.getElementById('res-title').value);
  formData.append('category', document.getElementById('res-category').value);
  formData.append('description', document.getElementById('res-desc').value);
  formData.append('file_type', document.getElementById('res-type').value);

  const fileInput = document.getElementById('res-file');
  if (fileInput.files.length > 0) {
    formData.append('file', fileInput.files[0]);
  } else {
    formData.append('file_path', document.getElementById('res-url').value);
  }

  try {
    await API.createResource(formData);
    closeResourceModal();
    loadAdminResources();
    loadDashboardStats();
  } catch (err) {
    alert(err.message || 'Error creating resource');
  }
}

async function deleteResource(id) {
  if (!confirm('Are you sure you want to delete this resource?')) return;
  try {
    await API.deleteResource(id);
    loadAdminResources();
    loadDashboardStats();
  } catch (err) {
    alert(err.message || 'Error deleting resource');
  }
}

/* -------------------------------------------------------------------------- */
/* GALLERY MANAGEMENT */
/* -------------------------------------------------------------------------- */
async function loadAdminGallery() {
  const tbody = document.getElementById('table-gallery-body');
  if (!tbody) return;

  try {
    const items = await API.getGallery();
    tbody.innerHTML = items.map(g => `
      <tr>
        <td>
          <img src="${escapeHtml(g.file_path)}" style="width: 50px; height: 40px; object-fit: cover; border-radius: 8px;">
        </td>
        <td><strong>${escapeHtml(g.title)}</strong></td>
        <td><span class="badge badge-primary">${escapeHtml(g.category)}</span></td>
        <td>${escapeHtml(g.media_type)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-delete" onclick="deleteGalleryItem(${g.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Error loading gallery</td></tr>`;
  }
}

function openGalleryModal() {
  const modal = document.getElementById('modal-gallery');
  const form = document.getElementById('form-gallery');
  if (form) form.reset();
  if (modal) modal.classList.add('active');
}

function closeGalleryModal() {
  const modal = document.getElementById('modal-gallery');
  if (modal) modal.classList.remove('active');
}

async function saveGalleryItem(e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', document.getElementById('gal-title').value);
  formData.append('category', document.getElementById('gal-category').value);
  formData.append('description', document.getElementById('gal-desc').value);
  formData.append('media_type', document.getElementById('gal-type').value);

  const fileInput = document.getElementById('gal-file');
  if (fileInput.files.length > 0) {
    formData.append('file', fileInput.files[0]);
  } else {
    formData.append('file_path', document.getElementById('gal-url').value);
  }

  try {
    await API.addGalleryItem(formData);
    closeGalleryModal();
    loadAdminGallery();
    loadDashboardStats();
  } catch (err) {
    alert(err.message || 'Error uploading gallery item');
  }
}

async function deleteGalleryItem(id) {
  if (!confirm('Delete this gallery item?')) return;
  try {
    await API.deleteGalleryItem(id);
    loadAdminGallery();
    loadDashboardStats();
  } catch (err) {
    alert(err.message || 'Error deleting gallery item');
  }
}

/* -------------------------------------------------------------------------- */
/* EVENTS & NEWS MANAGEMENT */
/* -------------------------------------------------------------------------- */
async function loadAdminEvents() {
  const tbody = document.getElementById('table-events-body');
  if (!tbody) return;

  try {
    const events = await API.getEvents();
    tbody.innerHTML = events.map(e => `
      <tr>
        <td><strong>${escapeHtml(e.title)}</strong></td>
        <td><span class="badge badge-warning">${escapeHtml(e.category)}</span></td>
        <td>${escapeHtml(e.event_date || 'N/A')}</td>
        <td>${e.is_important ? '⭐ Yes' : 'No'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-edit" onclick="openEventModal(${e.id})">✏️</button>
            <button class="btn-icon btn-delete" onclick="deleteEvent(${e.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Error loading events</td></tr>`;
  }
}

async function openEventModal(id = null) {
  const modal = document.getElementById('modal-event');
  const form = document.getElementById('form-event');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('event-id').value = id || '';
  document.getElementById('editor-event-content').innerHTML = '';

  if (id) {
    try {
      const events = await API.getEvents();
      const ev = events.find(item => item.id === id);
      if (ev) {
        document.getElementById('evt-title').value = ev.title;
        document.getElementById('evt-category').value = ev.category;
        document.getElementById('evt-date').value = ev.event_date || '';
        document.getElementById('evt-important').checked = ev.is_important;
        document.getElementById('evt-img-url').value = ev.featured_image || '';
        document.getElementById('editor-event-content').innerHTML = ev.content || '';
      }
    } catch (err) {
      alert('Error loading event details');
    }
  }

  modal.classList.add('active');
}

function closeEventModal() {
  const modal = document.getElementById('modal-event');
  if (modal) modal.classList.remove('active');
}

async function saveEvent(e) {
  e.preventDefault();
  const id = document.getElementById('event-id').value;
  const contentHTML = document.getElementById('editor-event-content').innerHTML;

  const formData = new FormData();
  formData.append('title', document.getElementById('evt-title').value);
  formData.append('category', document.getElementById('evt-category').value);
  formData.append('event_date', document.getElementById('evt-date').value);
  formData.append('is_important', document.getElementById('evt-important').checked ? 'true' : 'false');
  formData.append('content', contentHTML);

  const fileInput = document.getElementById('evt-img-file');
  if (fileInput.files.length > 0) {
    formData.append('featured_image', fileInput.files[0]);
  } else {
    formData.append('featured_image_url', document.getElementById('evt-img-url').value);
  }

  try {
    if (id) {
      await API.updateEvent(id, formData);
    } else {
      await API.createEvent(formData);
    }
    closeEventModal();
    loadAdminEvents();
  } catch (err) {
    alert(err.message || 'Error saving event');
  }
}

async function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  try {
    await API.deleteEvent(id);
    loadAdminEvents();
  } catch (err) {
    alert(err.message || 'Error deleting event');
  }
}

/* -------------------------------------------------------------------------- */
/* CONTACT SUBMISSIONS */
/* -------------------------------------------------------------------------- */
async function loadAdminSubmissions() {
  const tbody = document.getElementById('table-submissions-body');
  if (!tbody) return;

  try {
    const submissions = await API.getContactSubmissions();
    if (submissions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No contact submissions received yet.</td></tr>';
      return;
    }

    tbody.innerHTML = submissions.map(s => `
      <tr style="${!s.is_read ? 'font-weight: bold; background: #FFFDF8;' : ''}">
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.email)}<br><small>${escapeHtml(s.phone || '')}</small></td>
        <td>${escapeHtml(s.message)}</td>
        <td><small>${new Date(s.submitted_at).toLocaleDateString()}</small></td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-delete" onclick="deleteSubmission(${s.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Error loading submissions</td></tr>`;
  }
}

async function deleteSubmission(id) {
  if (!confirm('Delete this contact submission?')) return;
  try {
    await API.deleteContactSubmission(id);
    loadAdminSubmissions();
    loadDashboardStats();
  } catch (err) {
    alert(err.message || 'Error deleting submission');
  }
}

/* Simple Rich-Text Editor Helper */
function setupRichTextEditors() {
  const toolbars = document.querySelectorAll('.editor-toolbar');
  toolbars.forEach(toolbar => {
    const buttons = toolbar.querySelectorAll('.toolbar-btn');
    const targetId = toolbar.dataset.target;
    const editor = document.getElementById(targetId);

    if (!editor) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.cmd;
        const value = btn.dataset.value || null;

        if (cmd === 'createLink') {
          const url = prompt('Enter URL link:');
          if (url) document.execCommand(cmd, false, url);
        } else if (cmd === 'formatBlock') {
          document.execCommand(cmd, false, value);
        } else {
          document.execCommand(cmd, false, null);
        }
      });
    });
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
