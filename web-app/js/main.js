(function () {
  // ---- JSON Server API ----
const API_BASE = 'http://localhost:3001'; // If Codespaces preview blocks this, use the forwarded 3001 URL from the Ports panel.

const api = {
  async getPosts() {
    const r = await fetch(`${API_BASE}/posts`);
    if (!r.ok) throw new Error('getPosts failed');
    return r.json();
  },
  async createPost(post) {
    const r = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!r.ok) throw new Error('createPost failed');
    return r.json();
  },
  async updatePost(post) {
    const r = await fetch(`${API_BASE}/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!r.ok) throw new Error('updatePost failed');
    return r.json();
  },
  async deletePost(id) {
    const r = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('deletePost failed');
  },
};

// helper to read file -> dataURL (for images)
const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// one-stop refresh after API mutations
async function refreshFromAPI() {
  const posts = await api.getPosts();
  storage.set(LS_KEYS.POSTS, posts);      // keep your UI reading from storage
  renderBulletin();
  renderFullCalendar();
  renderDashboard();
  updateNotifications();
}

  // -------- HELPERS --------
  const $  = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  const safeUUID = () =>
    (window.crypto && typeof window.crypto.randomUUID === 'function')
      ? window.crypto.randomUUID()
      : 'id-' + Math.random().toString(36).slice(2) + Date.now();

  const nowIso = () => new Date().toISOString();

  // localStorage wrapper
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

  // -------- CONSTANTS --------
  const LS_KEYS = {
    POSTS: 'thriftPosts',
    PROFILE: 'thriftProfile',
    LAST_SEEN_TS: 'thriftLastSeen',
    SAVED: 'thriftSavedEventIds',
    RSVPS: 'thriftRsvps'
  };

  // -------- ELEMENTS --------
  const navButtons = $$('.sidebar-nav .sidebar-item');
  const views = {
    dashboardView: $('#dashboardView'),
    bulletinView : $('#bulletinView'),
    calendarView : $('#calendarView'),
    profileView  : $('#profileView'),
  };

  const notifBell    = $('#notificationBell');
  const notifCountEl = $('#notifCount');

  // Dashboard
  const dashboardContent = $('#dashboardContent');
  const welcomeHeading   = $('#welcomeHeading');

  // Bulletin
  const bulletinList            = $('#bulletinList');
  const bulletinPostsContainer  = $('#bulletinPosts');
  const newBulletinForm         = $('#newBulletinForm');
  const bulletinTitle           = $('#bulletinTitleInput');
  const bulletinBody            = $('#bulletinBody');
  const bulletinDate            = $('#bulletinDate');
  const bulletinTime            = $('#bulletinTime');
  const bulletinImage           = $('#bulletinImage');
  const bulletinType            = $('#bulletinType');
  const newBulletinFormContainer= $('#newBulletinFormContainer');
  const toggleNewPostBtn        = $('#toggleNewBulletinForm');
  const refreshBulletinButton   = $('#refreshBulletinButton');
  const bulletinFormTitle       = $('#bulletinFormTitle');
  const editingPostId           = $('#editingPostId');
  const bulletinSubmitButton    = $('#bulletinSubmitButton');

  // Calendar
  const calendarFilter     = $('#calendarFilter');
  const calendarSavedOnly  = $('#calendarSavedOnly');

  // Profile
  const profileCard               = $('.profile-card');
  const profileImage              = $('#profileImage');
  const profileName               = $('#profileName');
  const profileEmail              = $('#profileEmail');
  const profileBio                = $('#profileBio');
  const editProfileButton         = $('#editProfileButton');
  const profileEditFormContainer  = $('#profileEditFormContainer');
  const profileEditForm           = $('#profileEditForm');
  const editProfileName           = $('#editProfileName');
  const editProfileEmail          = $('#editProfileEmail');
  const editProfileBio            = $('#editProfileBio');
  const editProfileImage          = $('#editProfileImage');
  const cancelEditProfileButton   = $('#cancelEditProfileButton');

  // -------- SAVED IDS HELPERS --------
  const getSavedIds = () => storage.get(LS_KEYS.SAVED, []);
  const setSavedIds = (ids) => storage.set(LS_KEYS.SAVED, ids);
  const isSaved     = (id)  => getSavedIds().includes(id);

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
  function cleanupRsvpOrphans() {
    const posts = storage.get(LS_KEYS.POSTS, []);
    const valid = new Set(posts.map(p => p.id));
    setRsvpIds(getRsvpIds().filter(id => valid.has(id)));
  }

// -------- RSVP HELPERS --------
const getRsvpIds = () => storage.get(LS_KEYS.RSVPS, []);
const setRsvpIds = (ids) => storage.set(LS_KEYS.RSVPS, ids);
const isRsvped   = (id)  => getRsvpIds().includes(id);
const eventDate = (p) => new Date(`${p.date}T${p.time || '00:00'}`);

const toggleRsvp = (id) => {
  let ids = getRsvpIds();
  ids = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
  setRsvpIds(ids);
};

  // -------- SEED DATA --------
  function isoForDayOffset(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function ensureSeeds() {
    const existingProfile = storage.get(LS_KEYS.PROFILE, null);
    if (!existingProfile) {
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

    const existingPosts = storage.get(LS_KEYS.POSTS, null);
    if (!existingPosts) {
      const seed = [
        {
          id: safeUUID(),
          title: 'RGV Night Market',
          body: 'Vendors wanted! Live music and food trucks.',
          date: isoForDayOffset(3),
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
  }

  // -------- NAVIGATION --------
  function showView(viewId) {
    Object.entries(views).forEach(([id, el]) => {
      if (!el) return;
      id === viewId ? el.removeAttribute('hidden') : el.setAttribute('hidden', 'true');
    });

    navButtons.forEach((btn) => {
      const target = btn.getAttribute('data-view') || `${btn.id}View`;
      btn.setAttribute('aria-selected', target === viewId ? 'true' : 'false');
    });

    if (viewId === 'dashboardView') renderDashboard();
    if (viewId === 'bulletinView')  renderBulletin();
    if (viewId === 'calendarView')  renderFullCalendar();
    if (viewId === 'profileView')   renderProfile();

    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNavClick(e) {
    const btn = e.currentTarget;
    const targetView = btn.getAttribute('data-view') || `${btn.id}View`;
    console.log('[NAV] Switching to:', targetView);
    showView(targetView);
  }

  // -------- NOTIFICATIONS --------
  function updateNotifications() {
    const posts    = storage.get(LS_KEYS.POSTS, []);
    const lastSeen = new Date(storage.get(LS_KEYS.LAST_SEEN_TS, nowIso()));
    const unread   = posts.filter((p) => new Date(p.createdAt) > lastSeen).length;

    if (notifCountEl) notifCountEl.textContent = String(unread);
    if (notifBell)    notifBell.title = `${unread} new ${unread === 1 ? 'post' : 'posts'}`;
  }

  function markSeen() {
    storage.set(LS_KEYS.LAST_SEEN_TS, nowIso());
    updateNotifications();
  }

  // -------- DASHBOARD --------
  function renderDashboard() {
    if (!dashboardContent) return;

    const posts = storage.get(LS_KEYS.POSTS, []);
    const now   = new Date();
    const byDate = eventDate;

    const upcoming = posts
      .filter((p) => byDate(p) >= now)
      .sort((a, b) => byDate(a) - byDate(b))
      .slice(0, 5);

    const recent = [...posts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const savedIds = new Set(getSavedIds());
    const savedUpcoming = posts
      .filter((p) => savedIds.has(p.id) && byDate(p) >= now)
      .sort((a, b) => byDate(a) - byDate(b))
      .slice(0, 5);

    const rsvpIds = new Set(getRsvpIds());
    const goingSoon = posts
      .filter((p) => rsvpIds.has(p.id) && byDate(p) >= now)
      .sort((a, b) => byDate(a) - byDate(b))
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
        <div class="card">
          <h3>RSVP'd</h3>
          <ul class="list">
            ${goingSoon.map(eventLi).join('') || '<li>No RSVP\'d events.</li>'}
          </ul>
        </div>
      </div>
    `;
  }

  function eventLi(p) {
    const when = new Date(`${p.date}T${p.time || '00:00'}`);
    const dateStr = when.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `<li>
      <strong>${escapeHTML(p.title)}</strong>
      <span class="muted">• ${dateStr} • ${p.type ?? 'event'}</span>
    </li>`;
  }

  function postLi(p) {
    const when = new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `<li>
      <strong>${escapeHTML(p.title)}</strong>
      <span class="muted">• posted ${when}</span>
    </li>`;
  }

  // -------- BULLETIN --------
  const filterSavedOnly = $('#filterSavedOnly');
  filterSavedOnly?.addEventListener('change', renderBulletin);

  function renderBulletin() {
    const posts = storage.get(LS_KEYS.POSTS, []);
    const list  = filterSavedOnly?.checked ? posts.filter(p => isSaved(p.id)) : posts;

    if (bulletinList) {
      bulletinList.innerHTML = `
        <div class="muted">
          ${filterSavedOnly?.checked ? 'Saved posts' : 'Total posts'}: ${list.length}
        </div>
      `;
    }

    const html = list
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .map(bulletinCard)
      .join('');

    if (bulletinPostsContainer) {
      bulletinPostsContainer.innerHTML = html || `
        <div class="empty">No ${filterSavedOnly?.checked ? 'saved ' : ''}posts yet.</div>
      `;
    }
  }

  function bulletinCard(p) {
    const going     = isRsvped(p.id);
    const rsvpBadge = going ? `<span class="badge going">Going</span>` : '';
    const rsvpBtn   = `<button class="button" data-action="rsvp" data-id="${p.id}" aria-pressed="${going}" aria-label="${going ? 'Cancel RSVP' : 'RSVP to event'}">${going ? 'Going' : 'RSVP'}</button>`;

    const dateStr = new Date(`${p.date}T${p.time || '00:00'}`).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const img       = p.image ? `<img class="thumb" src="${p.image}" alt="">` : '';
    const typeBadge = p.type ? `<span class="badge">${p.type}</span>` : '';
    const saved     = isSaved(p.id);
    const savedBadge= saved ? `<span class="badge saved">Saved</span>` : '';

    return `
      <article class="card bulletin-card ${saved ? 'is-saved' : ''}" data-id="${p.id}">
        <header class="card-header">
          <h4>${escapeHTML(p.title)} ${typeBadge} ${savedBadge}</h4>
          <div class="muted">${dateStr}</div>
        </header>
        ${img}
        <p>${escapeHTML(p.body)}</p>

        <footer class="card-actions">
          ${rsvpBtn}
          <button class="button button-outline" data-action="save" data-id="${p.id}" aria-pressed="${saved}" aria-label="${saved ? 'Unsave event' : 'Save event'}">
            ${saved ? 'Saved' : 'Save'}
          </button>
          <button class="button" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="button button-danger" data-action="delete" data-id="${p.id}">Delete</button>
        </footer>
      </article>
    `;
  }

  async function handleBulletinSubmit(e) {
    e.preventDefault();

    const title = bulletinTitle?.value.trim() || '';
    const body  = bulletinBody?.value.trim() || '';
    const date  = bulletinDate?.value || '';
    const time  = bulletinTime?.value || '00:00';
    const type  = (bulletinType && bulletinType.value) ? bulletinType.value : guessType(title);
    const editingId = editingPostId?.value || null;

    if (!title || !body || !date) return;

    const eventDT = new Date(`${date}T${time}`);
    if (Number.isNaN(eventDT.getTime())) {
      alert('Please select a valid date and time.')
      return;
    }

    const posts = storage.get(LS_KEYS.POSTS, []);

    let imageDataURL = '';
    const imgFile = bulletinImage?.files?.[0];
    if (imgFile) imageDataURL = await fileToDataURL(imgFile);

    // EDIT MODE
    if (editingId) {
      const posts = storage.get(LS_KEYS.POSTS, []);
      const idx = posts.findIndex(p => p.id === editingId);
      if (idx !== -1) {
        const updated = {
          ...posts[idx],
          title, body, date, time, type,
          image: imageDataURL || posts[idx].image || '',
        };
        await api.updatePost(updated);
      }
    } else {
      const newPost = {
        id: safeUUID(),
        title, body, date, time, type,
        image: imageDataURL,
        createdAt: nowIso(),
      };
      await api.createPost(newPost);
    }
    await refreshFromAPI();
    setBulletinFormMode('create');
    closeNewBulletinForm();
  }

  async function handleBulletinClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    const posts  = storage.get(LS_KEYS.POSTS, []);

    if (action === 'delete') {
      const post = posts.find(p => p.id === id);
      if (!post) return;
      if (!confirm(`Delete “${post.title}”?`)) return;

      await api.deletePost(id);
      await refreshFromAPI();
      cleanupSavedOrphans();
      cleanupRsvpOrphans();
      return;
    }

    if (action === 'edit') {
      const post = posts.find(p => p.id === id);
      if (!post) return;
      setBulletinFormMode('edit', post);
      return;
    }

    if (action === 'rsvp') {
      toggleRsvp(id);
      const goingNow = isRsvped(id);

      btn.textContent = goingNow ? 'Going' : 'RSVP';
      btn.setAttribute('aria-pressed', goingNow);
      btn.setAttribute('aria-label', goingNow ? 'Cancel RSVP' : 'RSVP to event');

      const card = btn.closest('.bulletin-card');
      card?.classList.toggle('is-going', goingNow);

      const h4 = card?.querySelector('h4');
      const existing = h4?.querySelector('.badge.going');
      if (goingNow && !existing) h4?.insertAdjacentHTML('beforeend', ' <span class="badge going">Going</span>');
      if (!goingNow && existing) existing.remove();

      renderDashboard();
      renderFullCalendar();
      if (filterSavedOnly?.checked) renderBulletin();
      return;
    }

    if (action === 'save') {
      const stillThere = storage.get(LS_KEYS.POSTS, []).some(p => p.id === id);
      if (!stillThere) { alert('This post no longer exists!'); return; }

      toggleSaved(id);
      const SavedNow = isSaved(id);

      btn.textContent = SavedNow ? 'Saved' : 'Save';
      btn.setAttribute('aria-pressed', SavedNow);
      btn.setAttribute('aria-label', SavedNow ? 'Unsave event' : 'Save event');

      const card = btn.closest('.bulletin-card');
      card?.classList.toggle('is-saved', SavedNow);

      const h4 = card?.querySelector('h4');
      if (h4) {
        const badge = h4.querySelector('.badge.saved');
        if (SavedNow && !badge) h4.insertAdjacentHTML('beforeend', ' <span class="badge saved">Saved</span>');
        if (!SavedNow && badge) badge.remove();
      }
      renderDashboard();
      renderFullCalendar();
      if (filterSavedOnly?.checked) renderBulletin();
      return;
    }
  }

  function guessType(title) {
    const t = (title || '').toLowerCase();
    if (t.includes('market')) return 'market';
    if (t.includes('swap'))   return 'swap';
    if (t.includes('sale'))   return 'sale';
    return 'event';
  }


  function openNewBulletinForm() {
    if (!newBulletinFormContainer || !newBulletinForm) return;
    if (newBulletinForm.dataset.mode !== 'edit') newBulletinForm.reset();
    newBulletinFormContainer.removeAttribute('hidden');
    toggleNewPostBtn?.setAttribute('aria-expanded', 'true');
    updateToggleButtonLabel();
    (bulletinTitle || newBulletinForm.querySelector('input,textarea,select'))?.focus();
  }

  function setBulletinFormMode(mode, post = null) {
    if (!newBulletinForm) return;

    newBulletinForm.dataset.mode = mode;
    openNewBulletinForm(); // open first

    if (mode === 'edit' && post) {
      bulletinFormTitle.textContent = 'Edit Bulletin Post';
      bulletinSubmitButton.textContent = 'Update Post';
      editingPostId.value = post.id;

      bulletinTitle.value = post.title;
      bulletinBody.value = post.body;
      bulletinDate.value = post.date;
      bulletinTime.value = post.time;
      bulletinType.value = ['market','swap','sale','event'].includes(post.type) ? post.type : 'event';
    } else {
      bulletinFormTitle.textContent = 'Create Bulletin Post';
      bulletinSubmitButton.textContent = 'Post Bulletin';
      editingPostId.value = '';
      newBulletinForm.reset();
    }
    updateToggleButtonLabel();
  }

  function closeNewBulletinForm() {
    if (!newBulletinFormContainer || !newBulletinForm) return;
    newBulletinForm.reset();
    newBulletinFormContainer.setAttribute('hidden', '');
    toggleNewPostBtn?.setAttribute('aria-expanded', 'false');
    updateToggleButtonLabel();
  }

  function isEditMode() {
    return newBulletinForm?.dataset.mode === 'edit'; 
  }

  function updateToggleButtonLabel() { 
    if (!toggleNewPostBtn) return;
    const hidden = newBulletinFormContainer?.hasAttribute('hidden');
    if (isEditMode()) {
      toggleNewPostBtn.textContent = 'Cancel Edit';
      toggleNewPostBtn.setAttribute('aria-label', 'Cancel editing this post');
      return;
    }
    toggleNewPostBtn.textContent = hidden ? 'New Post' : 'Close';
    toggleNewPostBtn.setAttribute('aria-label', hidden ? 'Open new post form' : 'Close new post form');
  }

  function toggleNewBulletin() {
    if (!newBulletinForm || !newBulletinFormContainer) return;

    //cancel edit mode: switch to create mode
    if (isEditMode()) {
      setBulletinFormMode('create');
      newBulletinFormContainer.removeAttribute('hidden');
      toggleNewPostBtn?.setAttribute('aria-expanded', 'true');
      updateToggleButtonLabel();
      bulletinTitle?.focus();
      return;
    }

    //create mode: open or close
    const willOpen = newBulletinFormContainer.hasAttribute('hidden');
    if (willOpen) {
      openNewBulletinForm();
      toggleNewPostBtn?.setAttribute('aria-expanded', 'true');
    } else {
      closeNewBulletinForm();
      toggleNewPostBtn?.setAttribute('aria-expanded', 'false');
    }
    updateToggleButtonLabel();
  }

  const cancelBulletinButton = $('#cancelBulletinButton');
  if (cancelBulletinButton) {
    cancelBulletinButton.addEventListener('click', () => {
      setBulletinFormMode('create');
      closeNewBulletinForm();
    });
  }

  // -------- CALENDAR --------
  let fc;

  function postsToEvents(filter = 'all') {
    const posts     = storage.get(LS_KEYS.POSTS, []);
    const savedOnly = !!calendarSavedOnly?.checked;
    const savedSet  = new Set(getSavedIds());
    const goingSet  = new Set(getRsvpIds());

    return posts
      .filter((p) => filter === 'all' || (p.type || 'event') === filter)
      .filter((p) => !savedOnly || savedSet.has(p.id))
      .map((p) => ({
        id: p.id,
        title: p.title,
        start: `${p.date}T${p.time}`,
        allDay: false,
        extendedProps: {
          body : p.body  || '',
          image: p.image || '',
          type : p.type  || 'event',
          going: goingSet.has(p.id),
          saved: savedSet.has(p.id),
        },
      }));
  }

  function renderFullCalendar() {
    if (typeof FullCalendar === 'undefined') return;
    
    const mount = document.getElementById('calendarGrid');
    if (!mount) return;

    const filter = document.getElementById('calendarFilter')?.value || 'all';

    if (fc) {
      fc.getEventSources().forEach(s => s.remove());
      fc.addEventSource(postsToEvents(filter));
      fc.render();
      return;
    }

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

        if (!confirm(`${action} this event?`)) return;

        toggleSaved(id);
        renderDashboard();
        renderFullCalendar();

        alert(`${savedBefore ? 'Removed from' : 'Added to'} Saved Events!`);
      },
      eventDidMount(info) {
        const xp = info.event.extendedProps;

        if (xp?.type) {
          const badge = document.createElement('span');
          badge.textContent = xp.type;
          badge.className = 'fc-type-badge';
          info.el.querySelector('.fc-event-title')?.appendChild(badge);
        }
        if (xp?.going) {
          info.el.classList.add('fc-going');
          const titleEl = info.el.querySelector('.fc-event-title, .fc-sticky');
          if (titleEl && !titleEl.querySelector('.going-check')) {
            const check = document.createElement('span');
            check.textContent = '✓';
            check.className = 'going-check';
            check.style.marginLeft = '6px';
            titleEl.appendChild(check);
          }
          info.el.title = (info.el.title ? info.el.title + ' • ' : '') + 'RSVP: Going';
        }
      }
    });

    fc.render();
  }

  // -------- PROFILE --------
  function renderProfile() {
    const profile = storage.get(LS_KEYS.PROFILE, {});
    if (profileName)  profileName.textContent  = profile.name  || 'Name';
    if (profileEmail) profileEmail.textContent = profile.email || 'Email';
    if (profileBio)   profileBio.textContent   = profile.bio   || '';
    if (profileImage) profileImage.src         = profile.image || 'images/default-profile.png';
    updateHeaderName();
  }

  function openEditProfile() {
    const p = storage.get(LS_KEYS.PROFILE, {});
    if (editProfileName)  editProfileName.value  = p.name  || '';
    if (editProfileEmail) editProfileEmail.value = p.email || '';
    if (editProfileBio)   editProfileBio.value   = p.bio   || '';

    profileEditFormContainer?.removeAttribute('hidden');
    profileCard?.setAttribute('hidden', '');
    editProfileButton?.setAttribute('aria-expanded', 'true');
    editProfileName?.focus();
  }

  function closeEditProfile() {
    profileEditFormContainer?.setAttribute('hidden', '');
    profileCard?.removeAttribute('hidden');
    editProfileButton?.setAttribute('aria-expanded', 'false');
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    const current = storage.get(LS_KEYS.PROFILE, {});
    const next = {
      ...current,
      name : editProfileName?.value.trim()  || '',
      email: editProfileEmail?.value.trim() || '',
      bio  : editProfileBio?.value.trim()   || '',
    };

    const file = editProfileImage?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
      if (file.size > 2 * 1024 * 1024)     { alert('Image must be under 2MB.');   return; }

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

  // -------- MISC UTIL --------
  function fmtDateTime(dateStr, timeStr) {
    const hasTime = !!timeStr;
    const dt   = new Date(`${dateStr}T${hasTime ? timeStr : '00:00'}`);
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

  function updateHeaderName() {
    const profile = storage.get(LS_KEYS.PROFILE, {});
    const name = (profile?.name || '').trim() || 'Name';
    if (welcomeHeading) welcomeHeading.textContent = `Welcome, ${name}!`;
  }

  // -------- EVENT BINDINGS --------
  function bindEvents() {
    // Nav
    navButtons.forEach((btn) => btn.addEventListener('click', handleNavClick));

    // Bulletin
    newBulletinForm?.addEventListener('submit', handleBulletinSubmit);
    bulletinPostsContainer?.addEventListener('click', handleBulletinClick);

    // Calendar
    calendarFilter?.addEventListener('change', renderFullCalendar);
    calendarSavedOnly?.addEventListener('change', renderFullCalendar);

    // Profile
    editProfileButton?.addEventListener('click', openEditProfile);
    cancelEditProfileButton?.addEventListener('click', closeEditProfile);
    profileEditForm?.addEventListener('submit', handleProfileSubmit);

    // Notifications
    notifBell?.addEventListener('click', markSeen);

    refreshBulletinButton?.addEventListener('click', () => {
      renderBulletin();
      renderFullCalendar();
      renderDashboard();
      updateNotifications();
    });

    // New Post toggle
    if (toggleNewPostBtn && newBulletinFormContainer) {
      toggleNewPostBtn.setAttribute('aria-expanded', 'false');
      toggleNewPostBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleNewBulletin();
      });
    }
  }

  // -------- INIT --------
  async function init() {
    ensureSeeds();
    await refreshFromAPI(); // load initial posts from API

    cleanupSavedOrphans();
    cleanupRsvpOrphans();
    bindEvents();
    updateNotifications();
    updateHeaderName();

    console.log('[INIT] App loaded');

    const todayLocal = (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();
    const dateInput = document.getElementById('bulletinDate');
    if (dateInput) dateInput.min = todayLocal;

    showView('dashboardView'); // default
    updateToggleButtonLabel();
  }
  document.addEventListener('DOMContentLoaded', init);
})();