(function () {
  // helper to read file -> dataURL (for images)
  const fileToDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // -------- HELPERS --------
  const $  = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  const safeUUID = () =>
    (window.crypto && typeof window.crypto.randomUUID === 'function')
      ? window.crypto.randomUUID()
      : 'id-' + Math.random().toString(36).slice(2) + Date.now();

  const nowIso = () => new Date().toISOString();

  function escapeHTML(str = '') {
  return str
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'", '&#039;');
}
  function formatTime(timeStr = '') {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = ((h + 11) % 12 + 1); // convert 0–23 → 1–12
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  }



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
    RSVPS: 'thriftRsvps',
    VENDORS: 'thriftVendors',
    FOLLOWS: 'thriftFollows',
  };

  // -------- ELEMENTS --------
  const navButtons = $$('.sidebar-nav .sidebar-item');
  const views = {
    dashboardView: $('#dashboardView'),
    bulletinView : $('#bulletinView'),
    calendarView : $('#calendarView'),
    vendorsView  : $('#vendorsView'),
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
  const bulletinTitle           = $('#bulletinTitle');
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

  // Vendors
  const vendorsList         = $('#vendorsList');
  const vendorsContainer    = $('#vendorsContainer');
  const newVendorForm       = $('#newVendorForm');
  const vendorFormTitle     = $('#vendorFormTitle');
  const editingVendorId     = $('#editingVendorId');
  const vendorName          = $('#vendorName');
  const vendorEmail         = $('#vendorEmail');
  const vendorBio           = $('#vendorBio');
  const vendorProducts      = $('#vendorProducts');
  const vendorInstagram     = $('#vendorInstagram');
  const vendorWebsite       = $('#vendorWebsite');
  const vendorImage         = $('#vendorImage');
  const vendorSubmitButton  = $('#vendorSubmitButton');
  const toggleNewVendorForm = $('#toggleNewVendorForm');
  const refreshVendorsButton= $('#refreshVendorsButton');
  const cancelVendorButton  = $('#cancelVendorButton');

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
  // -------- DASHBOARD ---------
  function renderDashboard() {
    const profile = storage.get(LS_KEYS.PROFILE, {});
    const posts = storage.get(LS_KEYS.POSTS, []);
    const saved = getSavedIds();
    const rsvps = getRsvpIds();

    // Next upcoming event
    const upcoming = posts
      .map(p => ({ ...p, dateObj: new Date(p.date + (p.time ? 'T' + p.time : '')) }))
      .filter(p => p.dateObj >= new Date())
      .sort((a, b) => a.dateObj - b.dateObj)[0];

    // Welcome heading
    welcomeHeading.textContent = profile.name
      ? `Welcome back, ${profile.name}!`
      : "Welcome to Thrift Space!";

    // Dashboard content
    dashboardContent.innerHTML = `
      <div class="card">
        <h3>Bulletin</h3>
        <p>You have <strong>${posts.length}</strong> posts.</p>
      </div>

      <div class="card">
        <h3>Saved Events</h3>
        <p>You’ve saved <strong>${saved.length}</strong> events.</p>
      </div>

      <div class="card">
        <h3>RSVPs</h3>
        <p>You’re going to <strong>${rsvps.length}</strong> events.</p>
      </div>

      <div class="card">
        <h3>Next Event</h3>
        ${upcoming
          ? `<p><strong>${escapeHTML(upcoming.title)}</strong><br>${upcoming.date} ${upcoming.time || ''}</p>`
          : `<p>No upcoming events.</p>`
        }
      </div>
    `;
    const recentList = $('#recentActivity');
    if (recentList) {
      const lastThree = posts.slice(-3).reverse();
      recentList.innerHTML = lastThree.length
        ? lastThree.map(p => `<li><strong>${escapeHTML(p.title)}</strong> – ${p.date}</li>`).join('')
        : `<li>No recent posts.</li>`;
    }

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

  // -------- EVENTS --------
  function getFilteredEvents() {
    let posts = storage.get(LS_KEYS.POSTS, []);
    const typeFilter = calendarFilter?.value || 'all';
    const savedOnly  = calendarSavedOnly?.checked || false;

    if (typeFilter !== 'all') {
      posts = posts.filter(p => p.type === typeFilter);
    }
    if (savedOnly) {
      posts = posts.filter(p => isSaved(p.id));
    }
    return posts;
    }

// Re-render calendar with filtered events
  let calendar; // keep a reference

  function renderCalendar(events) {
    if (calendar) {
      calendar.removeAllEvents();
      calendar.addEventSource(events);
      return;
    }
    calendar = new FullCalendar.Calendar(calendarGrid, {
      initialView: 'dayGridMonth',
      events: events.map(ev => ({
        id: ev.id,
        title: ev.title,
        start: ev.date + (ev.time ? 'T' + ev.time : ''),
        extendedProps: { type: ev.type }
      })),
    });
    calendar.render();
  }


  calendarFilter?.addEventListener('change', refreshCalendar);
  calendarSavedOnly?.addEventListener('change', refreshCalendar);

  // -------- CALENDAR ---------
  const calendarGrid = $('#calendarGrid');

  function refreshCalendar() {
    const events = getFilteredEvents();
    renderCalendar(events);
  }

  // -------- BULLETIN SEARCH --------
  const bulletinSearch = $('#bulletinSearch');
  bulletinSearch?.addEventListener('input', () => {
    const query = bulletinSearch.value.toLowerCase();
    const posts = storage.get(LS_KEYS.POSTS, []);
    const filtered = posts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.body.toLowerCase().includes(query)
    );
    renderBulletin(filtered);
  });

  // -------- BULLETIN ---------
  async function saveBulletinPost(e) {
    e.preventDefault();
    const posts = storage.get(LS_KEYS.POSTS, []);
    const id = editingPostId.value || safeUUID();

    const newPost = {
      id,
      title: bulletinTitle.value,
      body: bulletinBody.value,
      date: bulletinDate.value,
      time: bulletinTime.value,
      type: bulletinType.value,
      image: bulletinImage.files[0] 
        ? await fileToDataURL(bulletinImage.files[0]) 
        : '',
      createdAt: nowIso(),
    };

    if (editingPostId.value) {
      // edit existing
      const idx = posts.findIndex(p => p.id === id);
      posts[idx] = newPost;
    } else {
      posts.push(newPost);
    }

    storage.set(LS_KEYS.POSTS, posts);
    renderBulletin(posts);
    updateNotifications();
    resetBulletinForm();
  }
  newBulletinForm?.addEventListener('submit', saveBulletinPost);

  // Delete button handler
  function deletePost(id) {
    let posts = storage.get(LS_KEYS.POSTS, []);
    posts = posts.filter(p => p.id !== id);
    storage.set(LS_KEYS.POSTS, posts);
    renderBulletin(posts);
  }
  function renderBulletin(posts) {
    bulletinPostsContainer.innerHTML = posts.map(p => `
      <div class="bulletin-post card ${isSaved(p.id) ? 'is-saved' : ''} ${isRsvped(p.id) ? 'is-going' : ''}" data-type="${p.type}">
        <div class="card-header">
          <h3>${escapeHTML(p.title)}</h3>
          <div class="badges">
            <span class="badge type-${p.type}">${p.type}</span>
            ${isSaved(p.id) ? '<span class="badge saved">⭐ Saved</span>' : ''}
            ${isRsvped(p.id) ? '<span class="badge going">✅ RSVP</span>' : ''}
          </div>
        </div>
        <p>${escapeHTML(p.body)}</p>
        ${p.image ? `<img class="thumb" src="${p.image}" alt="${escapeHTML(p.title)}">` : ""}
        <div class="card-actions">
          <button class="button button-outline" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="button button-danger" data-action="delete" data-id="${p.id}">Delete</button>
          <button class="button" data-action="save" data-id="${p.id}" aria-pressed="${isSaved(p.id)}">
            ${isSaved(p.id) ? 'Unsave' : 'Save'}
          </button>
          <button class="button" data-action="rsvp" data-id="${p.id}" aria-pressed="${isRsvped(p.id)}">
            ${isRsvped(p.id) ? 'Cancel RSVP' : 'RSVP'}
          </button>
        </div>
      </div>
    `).join('');
  }

  const bulletinSort = $('#bulletinSort');

  function getSortedPosts(posts) {
    const sort = bulletinSort?.value || 'newest';
    return [...posts].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'dateAsc') return new Date(a.date) - new Date(b.date);
      if (sort === 'dateDesc') return new Date(b.date) - new Date(a.date);
      return 0;
    });
  }

  bulletinSort?.addEventListener('change', () => {
    renderBulletin(getSortedPosts(storage.get(LS_KEYS.POSTS, [])));
  });



  bulletinPostsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.dataset.action === 'edit') {
      editPost(id);
    } else if (btn.dataset.action === 'delete') {
      deletePost(id);
    } else if (btn.dataset.action === 'save') {
      toggleSaved(id);
      renderBulletin(storage.get(LS_KEYS.POSTS, []));
      refreshCalendar(); // keep calendar in sync
    } else if (btn.dataset.action === 'rsvp') {
      toggleRsvp(id);
      renderBulletin(storage.get(LS_KEYS.POSTS, []));
      refreshCalendar(); // keep calendar in sync
    }
  });


  // -------- NOTIFICATION -----
  function updateNotifications() {
    const lastSeen = storage.get(LS_KEYS.LAST_SEEN_TS, 0);
    const posts = storage.get(LS_KEYS.POSTS, []);
    const newPosts = posts.filter(p => new Date(p.createdAt).getTime() > lastSeen);

    notifCountEl.textContent = newPosts.length;
    notifCountEl.style.display = newPosts.length ? 'inline' : 'none';
  }

// Mark as seen when user opens bulletin
  function markBulletinSeen() {
    storage.set(LS_KEYS.LAST_SEEN_TS, Date.now());
    updateNotifications();
  }
  function isEditMode() {
    return !!editingPostId?.value; // true when editing a post
  }


  // -------- Extra --------
    function bindEvents() {
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
      const viewId = btn.dataset.view;
      if (viewId) showView(viewId);
      });
    });
        // Profile
    editProfileButton?.addEventListener('click', openEditProfile);
    cancelEditProfileButton?.addEventListener('click', closeEditProfile);
    profileEditForm?.addEventListener('submit', handleProfileSubmit);
    
    const cancelBulletinButton = $('#cancelBulletinButton');
    toggleNewPostBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = newBulletinFormContainer.hasAttribute('hidden');

      if (isEditMode()) {
        resetBulletinForm();
        newBulletinFormContainer.setAttribute('hidden', '');
        toggleNewPostBtn.textContent = "New Post";
      } else if (isHidden) {
        newBulletinFormContainer.removeAttribute('hidden');
        toggleNewPostBtn.textContent = "Close Form";
      } else {
        newBulletinFormContainer.setAttribute('hidden', '');
        toggleNewPostBtn.textContent = "New Post";
        resetBulletinForm();
      }
    });
    

    cancelBulletinButton?.addEventListener('click', (e) => {
      e.preventDefault();
      newBulletinFormContainer.setAttribute('hidden', '');
      toggleNewPostBtn.textContent = "New Post";
      resetBulletinForm();
    });

  }

  function updateHeaderName() {
    welcomeHeading.textContent = "Welcome to Thrift Space!";
  }

  function showView(viewId) {
    Object.values(views).forEach(v => v.style.display = 'none');
    const view = views[viewId];
    if (view) {
      view.style.display = 'block';
    if (viewId === 'bulletinView') {
      markBulletinSeen();
    }
    } 
  }


  function updateToggleButtonLabel() {
    // placeholder
  }

  function editPost(id) {
    const posts = storage.get(LS_KEYS.POSTS, []);
    const post = posts.find(p => p.id === id);
    if (!post) return;

    bulletinTitle.value = post.title;
    bulletinBody.value = post.body;
    bulletinDate.value = post.date;
    bulletinTime.value = post.time;
    bulletinType.value = post.type;
    editingPostId.value = post.id;

    bulletinFormTitle.textContent = "Edit Bulletin Post";
    bulletinSubmitButton.textContent = "Update Post";

    // make sure form is open
    newBulletinFormContainer.removeAttribute('hidden');
    toggleNewPostBtn.textContent = "Cancel Edit";
  }


  function resetBulletinForm() {
    newBulletinForm.reset();
    editingPostId.value = '';
    bulletinFormTitle.textContent = 'Create Bulletin Post';
    bulletinSubmitButton.textContent = 'Post Bulletin';
  }

  // -------- PROFILE --------
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
    const posts = storage.get(LS_KEYS.POSTS, null);
    if (!posts) {
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

  // -------- INIT --------
  function init() {
    ensureSeeds();

    cleanupSavedOrphans();
    cleanupRsvpOrphans();
    bindEvents();
    updateNotifications();
    updateHeaderName();
    renderBulletin(storage.get(LS_KEYS.POSTS, []));
    renderDashboard();

    console.log('[INIT] App loaded (local only, no API)');

    const todayLocal = (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();
    const dateInput = document.getElementById('bulletinDate');
    if (dateInput) dateInput.min = todayLocal;

    refreshCalendar();

    showView('dashboardView'); // default
    updateToggleButtonLabel();
  }


  document.addEventListener('DOMContentLoaded', init);
})();