(function () {
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

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

  // Bulletin
  const bulletinList = $('#bulletinList');
  const bulletinPostsContainer = $('#bulletinPosts');
  const newBulletinForm = $('#newBulletinForm');
  const bulletinTitle = $('#bulletinTitle');
  const bulletinBody = $('#bulletinBody');
  const bulletinDate = $('#bulletinDate');
  const bulletinTime = $('#bulletinTime');
  const bulletinImage = $('#bulletinImage');

  // Calendar
  const calendarGrid = $('#calendarGrid');
  const calendarContent = $('#calendarContent');
  const calendarFilter = $('#calendarFilter');

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
  };

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
      localStorage.setItem(key, JSON.stringify(value));
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
    const upcoming = posts
      .filter((p) => new Date(`${p.date}T${p.time || '00:00'}`) >= new Date())
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .slice(0, 5);

    const recent = [...posts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
      </div>
    `;
  }

  function eventLi(p) {
    const dateStr = fmtDateTime(p.date, p.time);
    return `<li>
      <strong>${escapeHTML(p.title)}</strong>
      <span class="muted">• ${dateStr} • ${p.type ?? 'event'}</span>
    </li>`;
  }

  function postLi(p) {
    const when = new Date(p.createdAt).toLocaleString();
    return `<li>
      <strong>${escapeHTML(p.title)}</strong>
      <span class="muted">• posted ${when}</span>
    </li>`;
  }

  // -------- BULLETIN --------
  function renderBulletin() {
    const posts = storage.get(LS_KEYS.POSTS, []);
    // Top “loading” section can be repurposed as quick stats
    bulletinList.innerHTML = `
      <div class="muted">Total posts: ${posts.length}</div>
    `;

    bulletinPostsContainer.innerHTML = posts
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .map(bulletinCard)
      .join('');
  }

  function bulletinCard(p) {
    const dateStr = fmtDateTime(p.date, p.time);
    const img = p.image ? `<img class="thumb" src="${p.image}" alt="">` : '';
    const typeBadge = p.type ? `<span class="badge">${p.type}</span>` : '';
    return `
      <article class="card bulletin-card" data-id="${p.id}">
        <header class="card-header">
          <h4>${escapeHTML(p.title)} ${typeBadge}</h4>
          <div class="muted">${dateStr}</div>
        </header>
        ${img}
        <p>${escapeHTML(p.body)}</p>
        <footer class="card-actions">
          <button class="button button-outline" data-action="save" data-id="${p.id}">Save</button>
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

    if (!title || !body || !date) return;

    const posts = storage.get(LS_KEYS.POSTS, []);
    const newPost = {
      id: safeUUID(),
      title,
      body,
      date,
      time,
      type: guessType(title),
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
      const next = posts.filter((p) => p.id !== id);
      storage.set(LS_KEYS.POSTS, next);
      renderBulletin();
      renderFullCalendar();
      renderDashboard();
      return;
    }

    if (action === 'save') {
      // Minimal “save” example: add a star on the card
      const card = btn.closest('.bulletin-card');
      card?.classList.toggle('saved');
      btn.textContent = card?.classList.contains('saved') ? 'Saved' : 'Save';
    }
  }

  // -------- CALENDAR --------
  let fc;

  function postsToEvents(filter = 'all') {
    const posts = JSON.parse(localStorage.getItem('thriftPosts') || '[]');
    return posts
      .filter((p) => filter === 'all' || (p.type || 'event') === filter)
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
    fc.removeAllEvents();
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
      const { title, start, extendedProps } = info.event;
      const when = start ? start.toLocaleString() : '';
      const desc = extendedProps?.body || '';
      const img = extendedProps?.image ? `<div style="margin-top:8px;"><img src="${extendedProps.image}" alt="" style="max-width:100%;border-radius:8px;"></div>` : '';
      // Simple modal-ish alert (replace with your own modal UI later)
      const details =
        `${title}\n${when}\n\n${desc || ''}`.trim();
      alert(details);
      // Optional: switch to Bulletin or open a detail drawer here.
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

// Re-render on filter change
document.getElementById('calendarFilter')?.addEventListener('change', () => {
  renderFullCalendar();
});

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
  }

  function openEditProfile() {
    const profile = storage.get(LS_KEYS.PROFILE, {});
    editProfileName.value = profile.name || '';
    editProfileEmail.value = profile.email || '';
    editProfileBio.value = profile.bio || '';
    profileEditFormContainer.classList.remove('hidden');
  }

  function closeEditProfile() {
    profileEditFormContainer.classList.add('hidden');
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

    // Profile
    if (editProfileButton) editProfileButton.addEventListener('click', openEditProfile);
    if (cancelEditProfileButton) cancelEditProfileButton.addEventListener('click', closeEditProfile);
    if (profileEditForm) profileEditForm.addEventListener('submit', handleProfileSubmit);

    // Notifications
    if (notifBell) notifBell.addEventListener('click', markSeen);
  }

  // -------- INIT --------
  function init() {
    ensureSeeds();
    bindEvents();
    updateNotifications();

    // Default view: Dashboard
    showView('dashboardView');
  }

  // Kick it off
  document.addEventListener('DOMContentLoaded', init);
})();
