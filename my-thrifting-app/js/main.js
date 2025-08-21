(function () {
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  const safeUUID = () =>
  (window.crypto && typeof window.crypto.randomUUID === 'function')
    ? window.crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now();

  const navButtons = $$('.sidebar-nav .sidebar-item');
  const views = {
    dashboardView: $('#dashboardView'),
    bulletinView: $('#bulletinView'),
    calendarView: $('#calendarView'),
    profileView: $('#profileView'),
  };

  const notifBell = $('#notificationBell');
  const notifCountEl = $('#notifCount');

  // Dashboard
  const dashboardContent = $('#dashboardContent');
  const welcomeHeading = $('#welcomeHeading');

  // Bulletin
  const bulletinList = $('#bulletinList');
  const bulletinPostsContainer = $('#bulletinPosts');
  const newBulletinForm = $('#newBulletinForm');
  const bulletinTitle = $('#bulletinTitle');
  const bulletinBody = $('#bulletinBody');
  const bulletinDate = $('#bulletinDate');
  const bulletinTime = $('#bulletinTime');
  const bulletinImage = $('#bulletinImage');
  const bulletinType = $('#bulletinType');
  const newBulletinFormContainer = $('#newBulletinFormContainer'); // you need this
  const toggleNewPostBtn = $('#toggleNewBulletinForm');
  const refreshBulletinButton = $('#refreshBulletinButton');


  // Calendar
  const calendarGrid = $('#calendarGrid');
  const calendarContent = $('#calendarContent');
  const calendarFilter = $('#calendarFilter');
  const calendarSavedOnly = $('#calendarSavedOnly');

  // Profile
  const profileCard = $('.profile-card');
  const profileImage = $('#profileImage');
  const profileName = $('#profileName');
  const profileEmail = $('#profileEmail');
  const profileBio = $('#profileBio');
  const editProfileButton = $('#editProfileButton');
  const profileEditFormContainer = $('#profileEditFormContainer');
  const profileEditForm = $('#profileEditForm');
  const editProfileName = $('#editProfileName');
  const editProfileEmail = $('#editProfileEmail');
  const editProfileBio = $('#editProfileBio');
  const editProfileImage = $('#editProfileImage');
  const cancelEditProfileButton = $('#cancelEditProfileButton');

  // -------- STATE & STORAGE --------
  const LS_KEYS = {
    POSTS: 'thriftPosts',
    PROFILE: 'thriftProfile',
    LAST_SEEN_TS: 'thriftLastSeen',
    SAVED: 'thriftSavedEventIds',
  };

  const getSavedIds = () => storage.get(LS_KEYS.SAVED, []);
  const setSavedIds = (ids) => storage.set(LS_KEYS.SAVED, ids);
  const isSaved = (id) => getSavedIds().includes(id);
  const toggleSaved = (id) => {
  let ids = getSavedIds();
  ids = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
  setSavedIds(ids);
};
function cleanupSavedOrphans() {
  const posts = storage.get(LS_KEYS.POSTS, []);
  const valid = new Set(posts.map(p => p.id));
  setSavedIds(getSavedIds().filter(id => valid.has(id)));
}

  function updateHeaderName() {
  const profile = storage.get(LS_KEYS.PROFILE, {});
  const name = (profile?.name || '').trim() || 'Name';
  if (welcomeHeading) welcomeHeading.textContent = `Welcome, ${name}!`;
}

  const nowIso = () => new Date().toISOString();

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn(`Failed to set ${key} in localStorage:`, e);
      }
    },
  };

  // Seed sample data if empty
  function ensureSeeds() {
    const posts = storage.get(LS_KEYS.POSTS, null);
    if (!posts) {
      const seed = [
        {
          id: safeUUID(),
          title: 'RGV Night Market',
          body: 'Vendors wanted! Live music and food trucks.',
          date: isoForDayOffset(3), // 3 days from now
          time: '18:00',
          type: 'market',
          image: '',
          createdAt: nowIso(),
        },
        {
          id: safeUUID(),
          title: 'Community Swap',
          body: 'Bring clothes to swap! Family-friendly.',
          date: isoForDayOffset(10),
          time: '11:00',
          type: 'swap',
          image: '',
          createdAt: nowIso(),
        },
      ];
      storage.set(LS_KEYS.POSTS, seed);
    }
    
    const profile = storage.get(LS_KEYS.PROFILE, null);
    if (!profile) {
      storage.set(LS_KEYS.PROFILE, {
        name: 'Name',
        email: 'email@example.com',
        bio: 'Tell people about your shop or interests!',
        image: 'images/default-profile.png',
      });
    }

    if (!storage.get(LS_KEYS.LAST_SEEN_TS, null)) {
      storage.set(LS_KEYS.LAST_SEEN_TS, nowIso());
    }
  }

  function isoForDayOffset(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // -------- NAVIGATION --------
  function showView(viewId) {
    Object.entries(views).forEach(([id, el]) => {
      if (!el) return;
      if (id === viewId) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', 'true');
      }
    });

    // aria-selected for nav buttons
    navButtons.forEach((btn) => {
      const target = btn.getAttribute('data-view') || `${btn.id}View`;
      btn.setAttribute('aria-selected', target === viewId ? 'true' : 'false');
    });

    // Load view-specific data
    if (viewId === 'dashboardView') renderDashboard();
    if (viewId === 'bulletinView') renderBulletin();
    if (viewId === 'calendarView') renderFullCalendar();
    if (viewId === 'profileView') renderProfile();

    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  function handleNavClick(e) {
    const btn = e.currentTarget;
    const targetView = btn.getAttribute('data-view') || `${btn.id}View`;
    showView(targetView);
  }

  // -------- NOTIFICATIONS --------
  function updateNotifications() {
    const posts = storage.get(LS_KEYS.POSTS, []);
    const lastSeen = new Date(storage.get(LS_KEYS.LAST_SEEN_TS, nowIso()));
    const unread = posts.filter((p) => new Date(p.createdAt) > lastSeen).length;
    notifCountEl.textContent = String(unread);
    notifBell.title = `${unread} new ${unread === 1 ? 'post' : 'posts'}`;
  }

  function markSeen() {
    storage.set(LS_KEYS.LAST_SEEN_TS, nowIso());
    updateNotifications();
  }

  // -------- DASHBOARD --------
  function renderDashboard() {
    const posts = storage.get(LS_KEYS.POSTS, []);
    const now = new Date();

    const upcoming = posts
      .filter((p) => new Date(`${p.date}T${p.time || '00:00'}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .slice(0, 5);

    const recent = [...posts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const savedIds = new Set(getSavedIds());
    const savedUpcoming = posts
      .filter((p) => savedIds.has(p.id) && new Date(`${p.date}T${p.time || '00:00'}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .slice(0, 5); 

    dashboardContent.innerHTML = `
      <div class="grid two">
        <div class="card">
          <h3>Upcoming Events</h3>
          <ul class="list">
            ${upcoming.map(eventLi).join('') || '<li>No upcoming events yet.</li>'}
          </ul>
        </div>
        <div class="card">
          <h3>Recent Bulletin Posts</h3>
          <ul class="list">
            ${recent.map(postLi).join('') || '<li>No posts yet.</li>'}
          </ul>
        </div>
        <div class="card">
          <h3>Saved Upcoming Events</h3>
          <ul class="list">
            ${savedUpcoming.map(eventLi).join('') || '<li>No saved events.</li>'}
          </ul>
        </div>
      </div>
    `;
  }

  function eventLi(p) {
    const when = new Date(`${p.date}T${p.time || '00:00'}`);
    const dateStr = when.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `<li>
      <strong>${escapeHTML(p.title)}</strong>
      <span class="muted">• ${dateStr} • ${p.type ?? 'event'}</span>
    </li>`;
  }

  function postLi(p) {
    const when = new Date(p.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
    });
    return `<li>
      <strong>${escapeHTML(p.title)}</strong>
      <span class="muted">• posted ${when}</span>
    </li>`;
  }

  // -------- BULLETIN --------
  const filterSavedOnly = $('#filterSavedOnly');

  if (filterSavedOnly) {
    filterSavedOnly.addEventListener('change', renderBulletin);
  }

  function renderBulletin() {
    const posts = storage.get(LS_KEYS.POSTS, []);
    const list = filterSavedOnly?.checked ? posts.filter(p => isSaved(p.id)) : posts;

    bulletinList.innerHTML = `
      <div class="muted">
        ${filterSavedOnly?.checked ? 'Saved posts' : 'Total posts'}: ${list.length}
      </div>
    `;

    const html = list
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .map(bulletinCard)
      .join('');

    bulletinPostsContainer.innerHTML = html || `
      <div class="empty">No ${filterSavedOnly?.checked ? 'saved ' : ''}posts yet.</div>
    `;
  }



  function bulletinCard(p) {
      const dateStr = new Date(`${p.date}T${p.time || '00:00'}`).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      const img = p.image ? `<img class="thumb" src="${p.image}" alt="">` : '';
      function capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
      }
      const typeBadge = p.type ? `<span class="badge">${capitalize(p.type)}</span>` : '';

    const saved = isSaved(p.id); // boolean
    const savedBadge = saved ? `<span class="badge saved">Saved</span>` : '';

    return `
      <article class="card bulletin-card ${saved ? 'is-saved' : ''}" data-id="${p.id}">
        <header class="card-header">
          <h4>${escapeHTML(p.title)} ${typeBadge} ${savedBadge}</h4>
          <div class="muted">${dateStr}</div>
        </header>
        ${img}
        <p>${escapeHTML(p.body)}</p>
        <footer class="card-actions">
          <button class="button button-outline" data-action="save" data-id="${p.id}" aria-pressed="${saved}" aria-label="${saved ? 'Unsave event' : 'Save event'}">
            ${saved ? 'Saved' : 'Save'}
          </button>
          <button class="button button-danger" data-action="delete" data-id="${p.id}">Delete</button>
        </footer>
      </article>
    `;
  }

  function handleBulletinSubmit(e) {
    e.preventDefault();

    const title = bulletinTitle.value.trim();
    const body = bulletinBody.value.trim();
    const date = bulletinDate.value;
    const time = bulletinTime.value || '00:00';
    const type  = (bulletinType && bulletinType.value) ? bulletinType.value : guessType(title);
    
    const eventDT = new Date(`${date}T${time}`);
    if (isNaN(eventDT) || eventDT < new Date()) {
      alert('Please select a valid future date and time.');
      return;
    }

    if (!title || !body || !date) return;

    const posts = storage.get(LS_KEYS.POSTS, []);
    const newPost = {
      id: safeUUID(),
      title,
      body,
      date,
      time,
      type,
      image: '', // will be set after file load if any
      createdAt: nowIso(),
    };

    // Handle optional image upload
    const file = bulletinImage.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        newPost.image = reader.result;
        posts.push(newPost);
        storage.set(LS_KEYS.POSTS, posts);
        newBulletinForm.reset();
        if (bulletinType) bulletinType.value = '';
        renderBulletin();
        renderFullCalendar();
        renderDashboard();
        updateNotifications();
      };
      reader.readAsDataURL(file);
    } else {
      posts.push(newPost);
      storage.set(LS_KEYS.POSTS, posts);
      newBulletinForm.reset();
      if (bulletinType) bulletinType.value = '';
      renderBulletin();
      renderFullCalendar();
      renderDashboard();
      updateNotifications();
    }
  }

  function guessType(title) {
    const t = title.toLowerCase();
    if (t.includes('market')) return 'market';
    if (t.includes('swap')) return 'swap';
    if (t.includes('sale')) return 'sale';
    return 'event';
    }

  function handleBulletinClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    const posts = storage.get(LS_KEYS.POSTS, []);

  if (action === 'delete') {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const ok = confirm(`Delete “${post.title}”?`);
    if (!ok) return;

    const next = posts.filter(p => p.id !== id);
    storage.set(LS_KEYS.POSTS, next);
    cleanupSavedOrphans();
    renderBulletin(); renderFullCalendar(); renderDashboard(); updateNotifications();
    return;
    }


  if (action === 'save') {
    const stillThere = storage.get(LS_KEYS.POSTS, []).some(p => p.id === id);
    if (!stillThere) {
      alert('This post no longer exists!');
      return;
    }

    toggleSaved(id);
    const savedNow = isSaved(id);

    // update button + card inline
    btn.textContent = savedNow ? 'Saved' : 'Save';
    btn.setAttribute('aria-pressed', savedNow);
    btn.setAttribute('aria-label', savedNow ? 'Unsave event' : 'Save event');

    const card = btn.closest('.bulletin-card');
    card?.classList.toggle('is-saved', savedNow);

    const h4 = card?.querySelector('h4');
    if (h4) {
      let badge = h4.querySelector('.badge.saved');
      if (savedNow && !badge) h4.insertAdjacentHTML('beforeend', ' <span class="badge saved">Saved</span>');
      if (!savedNow && badge) badge.remove();
    }

    renderDashboard();
    renderFullCalendar();
    if (filterSavedOnly?.checked) renderBulletin();
    return;
  }

  }

  function openNewBulletinForm() {
  if (!newBulletinFormContainer) return;
  newBulletinForm.reset();
  newBulletinFormContainer.removeAttribute('hidden');
  toggleNewPostBtn?.setAttribute('aria-expanded', 'true');
  if (toggleNewPostBtn) toggleNewPostBtn.textContent = 'Close';
  (bulletinTitle || newBulletinForm.querySelector('input,textarea,select'))?.focus();
}

function closeNewBulletinForm() {
  if (!newBulletinFormContainer) return;
  newBulletinForm.reset();
  newBulletinFormContainer.setAttribute('hidden', '');
  toggleNewPostBtn?.setAttribute('aria-expanded', 'false');
  if (toggleNewPostBtn) toggleNewPostBtn.textContent = 'New Post';
}

function toggleNewBulletin() {
  if (newBulletinFormContainer?.hasAttribute('hidden')) openNewBulletinForm();
  else closeNewBulletinForm();
}
// Toggle open/close New Post card
if (toggleNewPostBtn && newBulletinFormContainer) {
  toggleNewPostBtn.setAttribute('aria-expanded', 'false');
  toggleNewPostBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleNewBulletin();
  });
}
closeNewBulletinForm();


  // -------- CALENDAR --------
let fc;

function postsToEvents(filter = 'all') {
  const posts = storage.get(LS_KEYS.POSTS, []);
  const savedOnly = !!calendarSavedOnly?.checked;
  const savedSet = new Set(getSavedIds());

  return posts
    .filter((p) => filter === 'all' || (p.type || 'event') === filter) // fixed
    .filter((p) => !savedOnly || savedSet.has(p.id))
    .map((p) => ({
      id: p.id,
      title: p.title,
      start: p.date + (p.time ? `T${p.time}` : ''),
      allDay: !p.time,
      extendedProps: {
        body: p.body || '',
        image: p.image || '',
        type: p.type || 'event',
      },
    }));
}

function renderFullCalendar() {
  const mount = document.getElementById('calendarGrid');
  if (!mount) return;

  // if already initialized, just refetch with the current filter
  const filter = document.getElementById('calendarFilter')?.value || 'all';

  if (fc) {
    fc.getEventSources().forEach(s => s.remove());
    fc.addEventSource(postsToEvents(filter));
    fc.render();
    return;
  }

  // create a new instance
  fc = new FullCalendar.Calendar(mount, {
    initialView: 'dayGridMonth',
    height: 'auto',
    selectable: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: postsToEvents(filter),
    eventClick(info) {
      const id = info.event.id;
      const savedBefore = isSaved(id);
      const action = savedBefore ? 'Unsave' : 'Save';
      
      const doIt = confirm(`${action} this event?`);
      if (!doIt) return;
      
      toggleSaved(id);
      renderDashboard();
      renderFullCalendar();
      
      alert(`${savedBefore ? 'Removed from' : 'Added to'} Saved Events!`);
    },
    eventDidMount(info) {
      // Add a tiny type badge
      const type = info.event.extendedProps?.type;
      if (type) {
        const badge = document.createElement('span');
        badge.textContent = type;
        badge.className = 'fc-type-badge';
        info.el.querySelector('.fc-event-title')?.appendChild(badge);
      }
      if (isSaved(info.event.id)) {
        info.el.classList.add('fc-saved');
        const titleEl = info.el.querySelector('.fc-event-title');
        if (titleEl && !titleEl.querySelector('.save-star')) {
          const star = document.createElement('span');
          star.textContent = '★';
          star.className = 'save-star';
          star.style.marginLeft = '4px';
          titleEl.appendChild(star);
        }
      }
    }
  });

  fc.render();
}
  // Call this whenever your nav switches to calendar
  // In your existing showView('calendarView') logic, add:
  function onEnterCalendarView() {
    renderFullCalendar();
  }
// If you used my previous nav code, just modify showView:
const _origShowView = typeof showView === 'function' ? showView : null;
window.showView = function(viewId) {
  // call original if it exists
  if (_origShowView) _origShowView(viewId);
  else {
    // minimal fallback visibility toggle
    document.querySelectorAll('.view').forEach(v => v.hidden = (v.id !== viewId));
  }
  if (viewId === 'calendarView') onEnterCalendarView();
};

// Whenever you add/delete a bulletin post that is an event, refresh calendar:
function refreshCalendarIfReady() {
  if (fc) renderFullCalendar();
}

  // -------- PROFILE --------
  function renderProfile() {
    const profile = storage.get(LS_KEYS.PROFILE, {});
    profileName.textContent = profile.name || 'Name';
    profileEmail.textContent = profile.email || 'Email';
    profileBio.textContent = profile.bio || '';
    profileImage.src = profile.image || 'images/default-profile.png';
    updateHeaderName();
  }

  function openEditProfile(){
    const p = storage.get(LS_KEYS.PROFILE, {});
    editProfileName.value = p.name || '';
    editProfileEmail.value = p.email || '';
    editProfileBio.value = p.bio || '';

    profileEditFormContainer.removeAttribute('hidden');
    profileCard.setAttribute('hidden','');
    editProfileButton.setAttribute('aria-expanded','true');
    editProfileName.focus();
  }

  function closeEditProfile(){
    profileEditFormContainer.setAttribute('hidden','');
    profileCard.removeAttribute('hidden');
    editProfileButton.setAttribute('aria-expanded','false');
  }


  function handleProfileSubmit(e) {
    e.preventDefault();
    const current = storage.get(LS_KEYS.PROFILE, {});
    const next = {
      ...current,
      name: editProfileName.value.trim(),
      email: editProfileEmail.value.trim(),
      bio: editProfileBio.value.trim(),
    };

    const file = editProfileImage.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
      if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB.'); return; }

      const reader = new FileReader();
      reader.onload = () => {
        next.image = reader.result;
        storage.set(LS_KEYS.PROFILE, next);
        closeEditProfile();
        renderProfile();
        renderDashboard();
      };
      reader.readAsDataURL(file);
    } else {
      storage.set(LS_KEYS.PROFILE, next);
      closeEditProfile();
      renderProfile();
      renderDashboard();
    }
  }

  // -------- UTIL --------
  function fmtDateTime(dateStr, timeStr) {
    const hasTime = !!timeStr;
    const dt = new Date(`${dateStr}T${hasTime ? timeStr : '00:00'}`);
    const date = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const time = hasTime ? dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
    return hasTime ? `${date} • ${time}` : date;
  }

  function escapeHTML(str = '') {
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // -------- EVENT BINDINGS --------
  function bindEvents() {
    // Nav
    navButtons.forEach((btn) => btn.addEventListener('click', handleNavClick));

    // Bulletin
    if (newBulletinForm) newBulletinForm.addEventListener('submit', handleBulletinSubmit);
    if (bulletinPostsContainer) bulletinPostsContainer.addEventListener('click', handleBulletinClick);

    // Calendar
    if (calendarFilter) calendarFilter.addEventListener('change', renderFullCalendar);
    if (calendarSavedOnly) calendarSavedOnly.addEventListener('change', renderFullCalendar);

    // Profile
    if (editProfileButton) editProfileButton.addEventListener('click', openEditProfile);
    if (cancelEditProfileButton) cancelEditProfileButton.addEventListener('click', closeEditProfile);
    if (profileEditForm) profileEditForm.addEventListener('submit', handleProfileSubmit);

    // Notifications
    if (notifBell) notifBell.addEventListener('click', markSeen);

    if (refreshBulletinButton) refreshBulletinButton.addEventListener('click', () => {
      renderBulletin();
      renderFullCalendar();
      renderDashboard();
      updateNotifications();
    });
  }

  // -------- INIT --------
  function init() {
    ensureSeeds();
    cleanupSavedOrphans();
    bindEvents();
    updateNotifications();
    updateHeaderName();
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bulletinDate');
    if (dateInput) dateInput.min = today;
    
    // Default view: Dashboard
    showView('dashboardView');
  }

  // Kick it off
  document.addEventListener('DOMContentLoaded', init);
})();
