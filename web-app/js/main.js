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

  // (rest of your app remains unchanged but all `api.*` and `refreshFromAPI()` calls should be swapped with local storage updates directly)

  // -------- INIT --------
  function init() {
    ensureSeeds();

    cleanupSavedOrphans();
    cleanupRsvpOrphans();
    bindEvents();
    updateNotifications();
    updateHeaderName();

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

    showView('dashboardView'); // default
    updateToggleButtonLabel();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
