document.addEventListener("DOMContentLoaded", () => {
  // Sections
  const landingIntro = document.getElementById("landing-intro");
  const chooseAuth = document.getElementById("choose-auth");
  const signupSection = document.getElementById("signup-section");
  const loginSection = document.getElementById("login-section");
  const appContainer = document.getElementById("app-container");
  const dashboard = document.getElementById("dashboard");
  const bulletin = document.getElementById("bulletin");
  const calendar = document.getElementById("calendar");
  const profile = document.getElementById("profile");

  // Buttons / Forms
  const continueBtn = document.getElementById("continueBtn");
  const goToSignup = document.getElementById("goToSignup");
  const goToLogin = document.getElementById("goToLogin");
  const toLogin = document.getElementById("toLogin");
  const toSignup = document.getElementById("toSignup");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");

  const sidebarButtons = document.querySelectorAll(".sidebar-btn");

  // Profile elements
  const editProfileBtn = document.getElementById("editProfileBtn");
  const profileForm = document.getElementById("profileForm");
  const closeProfile = document.getElementById("closeProfile");

  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  // --------------------------
  // Continue button
  continueBtn?.addEventListener("click", () => {
    landingIntro.style.display = "none";
    chooseAuth.style.display = "block";
  });

  // Navigation Auth
  goToSignup?.addEventListener("click", () => {
    chooseAuth.style.display = "none";
    signupSection.style.display = "block";
  });
  goToLogin?.addEventListener("click", () => {
    chooseAuth.style.display = "none";
    loginSection.style.display = "block";
  });
  toLogin?.addEventListener("click", e => {
    e.preventDefault();
    signupSection.style.display = "none";
    loginSection.style.display = "block";
  });
  toSignup?.addEventListener("click", e => {
    e.preventDefault();
    loginSection.style.display = "none";
    signupSection.style.display = "block";
  });

  // --------------------------
  // Sign Up
  signupForm?.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("signupName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("signupPassword")?.value;
    const confirm = document.getElementById("signupPasswordConfirm")?.value;
    const role = document.getElementById("signupRole")?.value;

    if (!name || !email || !password || !role) return alert("Please fill all fields.");
    if (password !== confirm) return alert("Passwords do not match.");

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.email === email)) return alert("Email already registered.");

    const newUser = {
      name,
      email,
      password,
      role,
      followedVendors: [],
      savedPosts: [],
      posts: [],
      contact: "",
      socials: "",
      bio: "",
      profilePic: ""
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Sign-up successful! Please log in.");
    signupForm.reset();
    signupSection.style.display = "none";
    loginSection.style.display = "block";
  });

  // --------------------------
  // Login
  loginForm?.addEventListener("submit", e => {
    e.preventDefault();
    const loginEmail = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const loginPassword = document.getElementById("loginPassword")?.value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword);

    if (!user) return alert("Invalid credentials. Please try again.");

    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    showView("dashboard");
  });

  // --------------------------
  // Logout
  logoutBtn?.addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem("currentUser");
    appContainer.style.display = "none";
    landingIntro.style.display = "block";
  });

  // --------------------------
  // Sidebar navigation
  sidebarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      showView(view);
    });
  });

  // --------------------------
  function showView(view) {
    landingIntro.style.display = "none";
    chooseAuth.style.display = "none";
    signupSection.style.display = "none";
    loginSection.style.display = "none";
    appContainer.style.display = "flex";

    [dashboard, bulletin, calendar, profile].forEach(s => s.style.display = "none");

    switch(view) {
      case "dashboard": renderDashboard(); break;
      case "bulletin": renderBulletin(); break;
      case "calendar": renderCalendar(currentMonthOffset); break;
      case "profile": renderProfile(); break;
    }

    if (view) {
      const el = document.getElementById(view);
      if (el) el.style.display = "block";
    }
  }

  // --------------------------
  function renderDashboard() {
  const dashContent = document.getElementById("dashboardContent");
  dashContent.innerHTML = `<h2>Welcome back, ${currentUser?.name || ""}!</h2>`;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const allPosts = users.flatMap(u => (u.posts || []).map(p => ({ ...p, author: u.name })));
  const todayStr = new Date().toISOString().split("T")[0];

  // --------------------------
  // Upcoming RSVPd Events Section
  const upcomingEventsDiv = document.createElement("div");
  upcomingEventsDiv.style.border = "2px solid #000";
  upcomingEventsDiv.style.borderRadius = "10px";
  upcomingEventsDiv.style.padding = "10px";
  upcomingEventsDiv.style.marginBottom = "20px";
  upcomingEventsDiv.style.backgroundColor = "#f0f8ff";
  upcomingEventsDiv.innerHTML = "<h3 style='margin-bottom:10px;'>Upcoming Events You RSVPd To:</h3>";

  const rsvpdEvents = allPosts
    .filter(evt => currentUser.savedPosts?.some(r => r.title === evt.title && r.date === evt.date))
    .filter(evt => evt.date >= todayStr)
    .sort((a,b) => new Date(a.date) - new Date(b.date));

  if (rsvpdEvents.length === 0) {
    upcomingEventsDiv.innerHTML += "<p>No upcoming RSVPd events.</p>";
  } else {
    const eventsList = document.createElement("div");
    eventsList.style.display = "flex";
    eventsList.style.flexWrap = "wrap";
    eventsList.style.gap = "10px";

    rsvpdEvents.forEach(evt => {
      const evtCard = document.createElement("div");
      evtCard.style.border = "1px solid #333";
      evtCard.style.borderRadius = "8px";
      evtCard.style.padding = "10px";
      evtCard.style.width = "200px";
      evtCard.style.backgroundColor = "#fff";
      evtCard.style.cursor = "pointer";
      evtCard.title = "Click for details";

      evtCard.innerHTML = `
        <strong>${evt.title}</strong><br>
        <small>${evt.date}</small><br>
        <em>${evt.author}</em>
      `;

      evtCard.addEventListener("click", () => {
        alert(`${evt.title}\n${evt.desc}\nDate: ${evt.date}\nOrganizer: ${evt.author}`);
      });

      eventsList.appendChild(evtCard);
    });

    upcomingEventsDiv.appendChild(eventsList);
  }

  dashContent.appendChild(upcomingEventsDiv);

  // --------------------------
  // Vendor Search Section
  const searchDiv = document.createElement("div");
  searchDiv.style.border = "2px solid #000";
  searchDiv.style.borderRadius = "10px";
  searchDiv.style.padding = "10px";
  searchDiv.style.backgroundColor = "#fff0f5";
  searchDiv.innerHTML = `
    <h3>Search Vendors</h3>
    <input type="text" id="vendorSearchInput" placeholder="Search by name..." style="padding:5px;width:250px;margin-bottom:10px;">
    <div id="vendorSearchResults" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px;"></div>
  `;
  dashContent.appendChild(searchDiv);

  const searchInput = document.getElementById("vendorSearchInput");
  const searchResults = document.getElementById("vendorSearchResults");

  function updateSearchResults() {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = "";

    if (!query) return;

    const vendors = users.filter(u => u.role === "vendor/organizer" && u.name.toLowerCase().includes(query));
    if (vendors.length === 0) {
      searchResults.innerHTML = "<p>No vendors found.</p>";
      return;
    }

    vendors.forEach(vendor => {
      const vendorCard = document.createElement("div");
      vendorCard.style.display = "flex";
      vendorCard.style.flexDirection = "column";
      vendorCard.style.alignItems = "center";
      vendorCard.style.border = "1px solid #333";
      vendorCard.style.borderRadius = "10px";
      vendorCard.style.padding = "5px";
      vendorCard.style.width = "120px";
      vendorCard.style.cursor = "pointer";
      vendorCard.style.backgroundColor = "#fff";
      vendorCard.title = vendor.name;

      const img = document.createElement("img");
      img.src = vendor.profilePic || "https://via.placeholder.com/80";
      img.alt = vendor.name;
      img.style.width = "80px";
      img.style.height = "80px";
      img.style.borderRadius = "50%";
      img.style.border = "2px solid #000";
      vendorCard.appendChild(img);

      const nameSpan = document.createElement("span");
      nameSpan.textContent = vendor.name;
      nameSpan.style.marginTop = "5px";
      nameSpan.style.textAlign = "center";
      vendorCard.appendChild(nameSpan);

      vendorCard.addEventListener("click", () => showVendorProfile(vendor));

      searchResults.appendChild(vendorCard);
    });
  }

  searchInput.addEventListener("input", updateSearchResults);

  // --------------------------
  // Followed Vendors Display
  const followedDiv = document.createElement("div");
  followedDiv.style.marginTop = "20px";
  followedDiv.innerHTML = "<h3>Followed Vendors:</h3>";

  if (!currentUser.followedVendors || currentUser.followedVendors.length === 0) {
    followedDiv.innerHTML += "<p>No followed vendors.</p>";
  } else {
    const vendorContainer = document.createElement("div");
    vendorContainer.style.display = "flex";
    vendorContainer.style.flexWrap = "wrap";
    vendorContainer.style.gap = "10px";

    currentUser.followedVendors.forEach(vendorEmail => {
      const vendor = users.find(u => u.email === vendorEmail);
      if (vendor) {
        const vendorIcon = document.createElement("img");
        vendorIcon.src = vendor.profilePic || "https://via.placeholder.com/80";
        vendorIcon.alt = vendor.name;
        vendorIcon.title = vendor.name;
        vendorIcon.style.width = "80px";
        vendorIcon.style.height = "80px";
        vendorIcon.style.borderRadius = "50%";
        vendorIcon.style.border = "3px solid #000";
        vendorIcon.style.cursor = "pointer";

        vendorIcon.addEventListener("click", () => showVendorProfile(vendor));
        vendorContainer.appendChild(vendorIcon);
      }
    });

    followedDiv.appendChild(vendorContainer);
  }

  dashContent.appendChild(followedDiv);
}

// --------------------------
// Vendor profile overlay
function showVendorProfile(vendor) {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.8)";
  modal.style.display = "flex";
  modal.style.flexDirection = "column";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "2000";

  const content = document.createElement("div");
  content.style.backgroundColor = "#fff";
  content.style.padding = "20px";
  content.style.border = "3px solid #000";
  content.style.borderRadius = "10px";
  content.style.width = "400px";
  content.style.maxHeight = "80vh";
  content.style.overflowY = "auto";
  content.style.fontFamily = "'Press Start 2P', cursive";
  modal.appendChild(content);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.className = "retro-button";
  closeBtn.style.alignSelf = "flex-end";
  closeBtn.addEventListener("click", () => document.body.removeChild(modal));
  content.appendChild(closeBtn);

  const nameEl = document.createElement("h2");
  nameEl.textContent = vendor.name;
  content.appendChild(nameEl);

  if (vendor.bio) {
    const bioEl = document.createElement("p");
    bioEl.textContent = vendor.bio;
    content.appendChild(bioEl);
  }

  if (vendor.socials) {
    const socialsEl = document.createElement("p");
    socialsEl.textContent = "Socials: " + vendor.socials;
    content.appendChild(socialsEl);
  }

  const eventsTitle = document.createElement("h3");
  eventsTitle.textContent = "Events:";
  content.appendChild(eventsTitle);

  if (!vendor.posts || vendor.posts.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No events posted yet.";
    content.appendChild(p);
  } else {
    const todayStr = new Date().toISOString().split("T")[0];
    const sortedEvents = vendor.posts.sort((a,b) => new Date(a.date) - new Date(b.date));

    sortedEvents.forEach(evt => {
      const evtDiv = document.createElement("div");
      evtDiv.style.border = "1px solid #000";
      evtDiv.style.borderRadius = "5px";
      evtDiv.style.padding = "5px";
      evtDiv.style.marginBottom = "5px";
      evtDiv.style.backgroundColor = (evt.date >= todayStr) ? "#d1ffd6" : "#f5f5f5"; // green for upcoming
      evtDiv.style.cursor = "pointer";

      evtDiv.innerHTML = `
        <strong>${evt.title}</strong><br>
        ${evt.date}<br>
        ${evt.desc}
      `;

      // Add click to open RSVP modal
      evtDiv.addEventListener("click", () => {
        openRSVPModal(evt, vendor.name);
      });

      content.appendChild(evtDiv);
    });
  }

  document.body.appendChild(modal);
}

// Reusable RSVP Modal Function
function openRSVPModal(evt, authorName) {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.8)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "3000";

  const content = document.createElement("div");
  content.style.backgroundColor = "#fff";
  content.style.padding = "20px";
  content.style.border = "3px solid #000";
  content.style.fontFamily = "'Press Start 2P', cursive";
  content.style.width = "300px";
  content.style.position = "relative";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.className = "retro-button";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "5px";
  closeBtn.style.right = "5px";
  closeBtn.addEventListener("click", () => document.body.removeChild(modal));
  content.appendChild(closeBtn);

  const titleEl = document.createElement("h3");
  titleEl.textContent = evt.title;
  const descEl = document.createElement("p");
  descEl.textContent = evt.desc;
  const dateEl = document.createElement("p");
  dateEl.textContent = `Date: ${evt.date}`;
  const authorEl = document.createElement("p");
  authorEl.textContent = `Organizer: ${authorName}`;

  const rsvpBtn = document.createElement("button");
  rsvpBtn.className = "retro-button";

  // Check if currentUser already RSVPed
  const isRSVP = currentUser?.savedPosts?.some(r => r.date === evt.date && r.title === evt.title);
  rsvpBtn.textContent = isRSVP ? "Cancel RSVP" : "RSVP";

  rsvpBtn.addEventListener("click", () => {
    if (!currentUser.savedPosts) currentUser.savedPosts = [];
    const idx = currentUser.savedPosts.findIndex(r => r.date === evt.date && r.title === evt.title);
    if (idx !== -1) currentUser.savedPosts.splice(idx, 1);
    else currentUser.savedPosts.push({ title: evt.title, date: evt.date });

    // Update localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIdx = users.findIndex(u => u.email === currentUser.email);
    if (userIdx !== -1) {
      users[userIdx] = currentUser;
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    modal.remove();
    renderDashboard();   // Refresh upcoming RSVP events on dashboard
    renderCalendarWithModal(); // Refresh calendar highlights
  });

  content.appendChild(titleEl);
  content.appendChild(descEl);
  content.appendChild(dateEl);
  content.appendChild(authorEl);
  content.appendChild(rsvpBtn);

  modal.appendChild(content);
  document.body.appendChild(modal);
}



  // --------------------------
  function renderBulletin() {
    const postsContainer = document.getElementById("bulletinPosts");
    postsContainer.innerHTML = "";

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const allPosts = users.flatMap(u => (u.posts || []).map(p => ({ ...p, author: u.name })));

    if (allPosts.length === 0) {
      postsContainer.innerHTML = "<p>No events yet</p>";
      return;
    }

    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    allPosts.forEach(evt => {
      const div = document.createElement("div");
      div.className = "bulletin-post";
      div.style.border = "2px solid #000";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";
      div.style.borderRadius = "5px";
      div.style.backgroundColor = "#fff";

      const imgHTML = evt.pic ? `<img src="${evt.pic}" alt="Event Image" style="max-width:100%; margin-bottom:5px;">` : "";

      div.innerHTML = `
        ${imgHTML}
        <h3>${evt.title}</h3>
        <p>${evt.desc}</p>
        <small>${evt.date || ""} — <strong>${evt.author}</strong></small>
      `;
      postsContainer.appendChild(div);
    });
  }

  // --------------------------
  function renderProfile() {
    document.getElementById("profileNameDisplay").textContent = currentUser?.name || "";
    document.getElementById("profileRoleDisplay").textContent = currentUser?.role || "";
    document.getElementById("profilePicDisplay").src = currentUser?.profilePic || "https://via.placeholder.com/120";
    profileForm.style.display = "none";
    editProfileBtn.style.display = (currentUser?.role === "vendor/organizer") ? "block" : "none";
  }

  editProfileBtn?.addEventListener("click", () => { profileForm.style.display = "block"; });
  closeProfile?.addEventListener("click", () => { profileForm.style.display = "none"; });

  // --------------------------
  // Bulletin post creation
  const createPostBtn = document.createElement("button");
  createPostBtn.textContent = "Create Post";
  createPostBtn.className = "retro-button";
  createPostBtn.style.display = "block";
  createPostBtn.style.margin = "10px 0";

  const bulletinPosts = document.getElementById("bulletinPosts");
  if (bulletinPosts) bulletinPosts.parentNode.insertBefore(createPostBtn, bulletinPosts);

  const formContainer = document.getElementById("newBulletinFormContainer");
  const newBulletinForm = document.getElementById("newBulletinForm");

  createPostBtn.addEventListener("click", () => {
    formContainer.style.display = "block";
    createPostBtn.style.display = "none";
  });

  newBulletinForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    const title = document.getElementById("bulletinTitle").value.trim();
    const desc = document.getElementById("bulletinDesc").value.trim();
    const date = document.getElementById("bulletinDate").value;
    const pic = document.getElementById("bulletinPic").value;

    if (!title || !desc) return alert("Please fill in title and description.");

    currentUser.posts.push({ title, desc, date, pic });

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    renderBulletin();
    newBulletinForm.reset();
    formContainer.style.display = "none";
    createPostBtn.style.display = "block";
  });

  

  // --------------------------
  // Calendar variables
  let currentMonthOffset = 0; // 0 = current month

  // --------------------------
  function renderCalendar(offset = 0) {
    const cal = document.getElementById("calendarGrid");
    cal.innerHTML = "";

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const month = firstDay.getMonth();
    const year = firstDay.getFullYear();

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const monthHeader = document.createElement("h3");
    monthHeader.textContent = `${monthNames[month]} ${year}`;
    cal.appendChild(monthHeader);

    // Add navigation
    const navDiv = document.createElement("div");
    navDiv.style.display = "flex";
    navDiv.style.justifyContent = "space-between";
    navDiv.style.marginBottom = "10px";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.className = "retro-button";
    prevBtn.onclick = () => { currentMonthOffset--; renderCalendar(currentMonthOffset); };

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.className = "retro-button";
    nextBtn.onclick = () => { currentMonthOffset++; renderCalendar(currentMonthOffset); };

    navDiv.appendChild(prevBtn);
    navDiv.appendChild(nextBtn);
    cal.appendChild(navDiv);

    // Grid
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, 1fr)";
    grid.style.gap = "5px";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay.getDay(); // Sunday=0

    for (let i=0; i<startDay; i++){
      const empty = document.createElement("div");
      grid.appendChild(empty);
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const allPosts = users.flatMap(u => (u.posts || []).map(p => ({ ...p, author: u.name })));

    for (let day=1; day<=daysInMonth; day++){
      const dayCell = document.createElement("div");
      dayCell.style.border = "1px solid #000";
      dayCell.style.padding = "10px";
      dayCell.style.minHeight = "60px";
      dayCell.style.cursor = "default";
      dayCell.textContent = day;

      const cellDateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
      const eventsToday = allPosts.filter(evt => evt.date === cellDateStr);
      eventsToday.forEach(evt => {
        const evtDiv = document.createElement("div");
        evtDiv.textContent = evt.title;
        evtDiv.style.backgroundColor = currentUser.savedPosts?.some(r => r.title===evt.title && r.date===evt.date) ? "#fffa65" : "#add8e6";
        evtDiv.style.marginTop = "3px";
        evtDiv.style.padding = "2px";
        evtDiv.style.cursor = "pointer";
        evtDiv.dataset.eventObj = JSON.stringify(evt);
        evtDiv.onclick = () => openEventModal(evt);
        dayCell.appendChild(evtDiv);
      });

      grid.appendChild(dayCell);
    }

    cal.appendChild(grid);
  }

  // --------------------------
  // Event modal
  const eventModal = document.createElement("div");
  eventModal.style.position = "fixed";
  eventModal.style.top = "0";
  eventModal.style.left = "0";
  eventModal.style.width = "100%";
  eventModal.style.height = "100%";
  eventModal.style.backgroundColor = "rgba(0,0,0,0.8)";
  eventModal.style.display = "none";
  eventModal.style.justifyContent = "center";
  eventModal.style.alignItems = "center";
  eventModal.style.zIndex = "1000";

  const eventContent = document.createElement("div");
  eventContent.style.backgroundColor = "#fff";
  eventContent.style.padding = "20px";
  eventContent.style.border = "3px solid #000";
  eventContent.style.fontFamily = "'Press Start 2P', cursive";
  eventContent.style.width = "300px";
  eventContent.style.position = "relative";

  eventModal.appendChild(eventContent);
  document.body.appendChild(eventModal);

  const closeEventBtn = document.createElement("button");
  closeEventBtn.textContent = "Close";
  closeEventBtn.className = "retro-button";
  closeEventBtn.style.position = "absolute";
  closeEventBtn.style.top = "5px";
  closeEventBtn.style.right = "5px";
  eventContent.appendChild(closeEventBtn);
  closeEventBtn.addEventListener("click", () => eventModal.style.display = "none");

  const titleEl = document.createElement("h3");
  const descEl = document.createElement("p");
  const dateEl = document.createElement("p");
  const authorEl = document.createElement("p");
  const imgEl = document.createElement("img");
  imgEl.style.maxWidth = "100%";
  imgEl.style.margin = "5px 0";

  const rsvpBtn = document.createElement("button");
  rsvpBtn.className = "retro-button";

  eventContent.append(titleEl, descEl, dateEl, authorEl, imgEl, rsvpBtn);

  function openEventModal(evt) {
    titleEl.textContent = evt.title;
    descEl.textContent = evt.desc;
    dateEl.textContent = `Date: ${evt.date}`;
    authorEl.textContent = `Organizer: ${evt.author}`;
    imgEl.src = evt.pic || "";

    const isRSVP = currentUser?.savedPosts?.some(r => r.date === evt.date && r.title === evt.title);
    rsvpBtn.textContent = isRSVP ? "Cancel RSVP" : "RSVP";

    rsvpBtn.onclick = () => {
      if (!currentUser.savedPosts) currentUser.savedPosts = [];
      const idx = currentUser.savedPosts.findIndex(r => r.date===evt.date && r.title===evt.title);
      if (idx !== -1) currentUser.savedPosts.splice(idx, 1);
      else currentUser.savedPosts.push({ title: evt.title, date: evt.date });

      let users = JSON.parse(localStorage.getItem("users")) || [];
      const userIdx = users.findIndex(u => u.email===currentUser.email);
      if (userIdx!==-1) {
        users[userIdx] = currentUser;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }

      eventModal.style.display = "none";
      renderCalendar(currentMonthOffset);
    };

    eventModal.style.display = "flex";
  }

  // --------------------------
  // Vendor event creation
  function setupVendorEventCreation() {
    if (!currentUser || currentUser.role !== "vendor/organizer") return;

    const cal = document.getElementById("calendarGrid");

    const createBtn = document.createElement("button");
    createBtn.textContent = "Create Event";
    createBtn.className = "retro-button";
    createBtn.style.margin = "10px 0";
    cal.parentNode.insertBefore(createBtn, cal);

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.8)";
    modal.style.display = "none";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.border = "3px solid #000";
    modalContent.style.fontFamily = "'Press Start 2P', cursive";
    modalContent.style.width = "300px";
    modalContent.style.position = "relative";

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.className = "retro-button";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "5px";
    closeBtn.style.right = "5px";
    modalContent.appendChild(closeBtn);
    closeBtn.addEventListener("click", () => modal.style.display = "none");

    const form = document.createElement("form");
    form.innerHTML = `
      <label>Title:</label>
      <input type="text" id="evtTitle" required>
      <label>Description:</label>
      <textarea id="evtDesc" required></textarea>
      <label>Date:</label>
      <input type="date" id="evtDate" required>
      <label>Image URL:</label>
      <input type="text" id="evtPic">
      <button class="retro-button">Create Event</button>
    `;
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "5px";
    modalContent.appendChild(form);

    createBtn.addEventListener("click", () => modal.style.display = "flex");

    form.addEventListener("submit", e => {
      e.preventDefault();

      const title = document.getElementById("evtTitle").value.trim();
      const desc = document.getElementById("evtDesc").value.trim();
      const date = document.getElementById("evtDate").value;
      const pic = document.getElementById("evtPic").value;

      if (!title || !desc || !date) return alert("Fill all required fields.");

      if (!currentUser.posts) currentUser.posts = [];
      currentUser.posts.push({ title, desc, date, pic });

      let users = JSON.parse(localStorage.getItem("users")) || [];
      const idx = users.findIndex(u => u.email === currentUser.email);
      if (idx !== -1) {
        users[idx] = currentUser;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }

      modal.style.display = "none";
      form.reset();
      renderBulletin();
      renderCalendar(currentMonthOffset);
    });
  }

  function renderProfile(vendor = null) {
  const userToShow = vendor || currentUser;

  document.getElementById("profileNameDisplay").textContent = userToShow?.name || "";
  document.getElementById("profileRoleDisplay").textContent = userToShow?.role || "";
  document.getElementById("profilePicDisplay").src = userToShow?.profilePic || "https://via.placeholder.com/120";

  profileForm.style.display = "none";
  editProfileBtn.style.display = (currentUser?.role === "vendor/organizer" && !vendor) ? "block" : "none";

  // Display events for the user/vendor
  const postsGrid = document.getElementById("postsGrid");
  postsGrid.innerHTML = "<h3>Events</h3>";
  postsGrid.style.display = "grid";
  postsGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
  postsGrid.style.gap = "15px";

  (userToShow.posts || []).forEach(evt => {
    const div = document.createElement("div");
    div.className = "vendor-event-card";
    div.style.border = "2px solid #000";
    div.style.borderRadius = "12px";
    div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
    div.style.padding = "10px";
    div.style.backgroundColor = "#fffceb";
    div.style.transition = "transform 0.2s, box-shadow 0.2s";
    div.style.cursor = "pointer";
    div.style.fontFamily = "'Press Start 2P', cursive";

    // Hover effect
    div.addEventListener("mouseenter", () => {
      div.style.transform = "translateY(-4px)";
      div.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
    });
    div.addEventListener("mouseleave", () => {
      div.style.transform = "translateY(0)";
      div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
    });

    // Event image (if exists)
    const imgHTML = evt.pic ? `<img src="${evt.pic}" alt="Event Image" style="width:100%; border-radius:8px; margin-bottom:5px;">` : "";

    div.innerHTML = `
      ${imgHTML}
      <h4 style="margin:5px 0; color:#333;">${evt.title}</h4>
      <p style="color:#555; font-size:0.85em;">${evt.desc}</p>
      <p style="font-size:0.75em; color:#777;">${evt.date}</p>
    `;

    postsGrid.appendChild(div);
  });
}

  
  // --------------------------
  setupVendorEventCreation();

  // --------------------------
  // If already logged in
  if (currentUser) showView("dashboard");
});
