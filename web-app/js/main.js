// document.addEventListener("DOMContentLoaded", () => {
//   // Sections
//   const landingIntro = document.getElementById("landing-intro");
//   // const chooseAuth = document.getElementById("choose-auth");
//   // const signupSection = document.getElementById("signup-section");
//   // const loginSection = document.getElementById("login-section");
//   const appContainer = document.getElementById("app-container");
//   const dashboard = document.getElementById("dashboard");
//   const _bulletin = document.getElementById("bulletin"); 
//   const _calendar = document.getElementById("calendar");
//   const _profile = document.getElementById("profile");

//   // Buttons / Forms
//   const continueBtn = document.getElementById("continueBtn");
//   const sidebarButtons = Array.from(document.querySelectorAll(".sidebar-btn[data-view]"));
//   const backToLanding  = document.getElementById("backToLanding");
//   // const goToSignup = document.getElementById("goToSignup");
//   // const goToLogin = document.getElementById("goToLogin");
//   // const toLogin = document.getElementById("toLogin");
//   // const toSignup = document.getElementById("toSignup");
//   // const signupForm = document.getElementById("signupForm");
//   // const loginForm = document.getElementById("loginForm");
//   // const logoutBtn = document.getElementById("logoutBtn");

//   // Initial visibility
//   // chooseAuth.style.display = "none";
//   // signupSection.style.display = "none";
//   // loginSection.style.display = "none";
//   // dashboard.style.display = "none";

//   // Check for existing login
//   // const existingUser = JSON.parse(localStorage.getItem("userProfile"));
//   // if (existingUser) {
//   //   showDashboard(existingUser);
//   // }

//   // Continue - show auth options
//   // continueBtn?.addEventListener("click", () => {
//   //   landingIntro.style.display = "none";
//   //   chooseAuth.style.display = "block";
//   // });

//   // Navigation Auth
//   // goToSignup?.addEventListener("click", () => {
//   //   chooseAuth.style.display = "none";
//   //   signupSection.style.display = "block";
//   // });
//   // goToLogin?.addEventListener("click", () => {
//   //   chooseAuth.style.display = "none";
//   //   loginSection.style.display = "block";
//   // });
//   // toLogin?.addEventListener("click", e => {
//   //   e.preventDefault();
//   //   signupSection.style.display = "none";
//   //   loginSection.style.display = "block";
//   // });
//   // toSignup?.addEventListener("click", e => {
//   //   e.preventDefault();
//   //   loginSection.style.display = "none";
//   //   signupSection.style.display = "block";
//   // });

//   // --------------------------
//   // Sign Up
//   // signupForm?.addEventListener("submit", e => {
//   //   e.preventDefault();
//   //   const name = document.getElementById("signupName")?.value.trim();
//   //   const email = document.getElementById("signupEmail")?.value.trim().toLowerCase();
//   //   const password = document.getElementById("signupPassword")?.value;
//   //   const confirm = document.getElementById("signupPasswordConfirm")?.value;
//   //   const role = document.getElementById("signupRole")?.value;

//   //   if (!name || !email || !password || !role) return alert("Please fill all fields.");
//   //   if (password !== confirm) return alert("Passwords do not match.");

//   //   let users = JSON.parse(localStorage.getItem("users")) || [];
//   //   if (users.some(u => u.email === email)) return alert("Email already registered.");

//   //   const newUser = {
//   //     name,
//   //     email,
//   //     password,
//   //     role,
//   //     followedVendors: [],
//   //     savedPosts: [],
//   //     posts: [],
//   //     contact: "",
//   //     socials: "",
//   //     bio: "",
//   //     profilePic: ""
//   //   };

//   //   users.push(newUser);
//   //   localStorage.setItem("users", JSON.stringify(users));

//   //   alert("Sign-up successful! Please log in.");
//   //   signupForm.reset();
//   //   signupSection.style.display = "none";
//   //   loginSection.style.display = "block";
//   // });

//   // --------------------------
//   // Login
//   // loginForm?.addEventListener("submit", e => {
//   //   e.preventDefault();
//   //   const loginEmail = document.getElementById("loginEmail")?.value.trim().toLowerCase();
//   //   const loginPassword = document.getElementById("loginPassword")?.value;

//   //   const users = JSON.parse(localStorage.getItem("users")) || [];
//   //   const user = users.find(u => u.email === loginEmail && u.password === loginPassword);

//   //   if (!user) return alert("Invalid credentials. Please try again.");

//   //   currentUser = user;
//   //   localStorage.setItem("currentUser", JSON.stringify(currentUser));

//   //   showView("dashboard");
//   // });

//   // --------------------------
//   // Logout
//   // logoutBtn?.addEventListener("click", () => {
//   //   currentUser = null;
//   //   localStorage.removeItem("currentUser");
//   //   appContainer.style.display = "none";
//   //   landingIntro.style.display = "block";
//   // });

//   // --------------------------
//   const mockUser = {
//     name: "Thrift Friend",
//     role: "shopper",
//     profilePic: "https://via.placeholder.com/120",
//     contact: "friend@example.com",
//     socials: "@thriftfriend",
//     bio: "RGV thrift lover • pop-up regular"
//   };
//   // Sidebar navigation
//   sidebarButtons.forEach(btn => {
//     btn.addEventListener("click", () => {
//       const view = btn.getAttribute("data-view");
//       showView(view);
//     });
//   });

//   // --------------------------
//   function showView(view) {
//     landingIntro.style.display = "none";
//     chooseAuth.style.display = "none";
//     signupSection.style.display = "none";
//     loginSection.style.display = "none";
//     dashboard.style.display = "block";
//     const welcomeText = `Welcome back, ${user.name}!`;
//     document.getElementById("welcomeMessage").textContent = welcomeText;

//     // Shopper-specific content
//     if (user.role === "shopper") {
//       const template = document.getElementById("shopperDashboardTemplate");
//       const clone = template.content.cloneNode(true);
//       dashboardContent.innerHTML = ""; // clear first
//       dashboardContent.appendChild(clone);
//     } else {
//       // Fallback for vendor/organizer or other roles
//       dashboardContent.innerHTML = `
//         <p><strong>Name:</strong> ${user.name}</p>
//         <p><strong>Email:</strong> ${user.email}</p>
//         <p><strong>Role:</strong> ${user.role}</p>
//         <p>This dashboard is under construction for your role.</p>
//       `;
//     }
//   }
// }
// );
document.addEventListener("DOMContentLoaded", () => {
  // Sections
  const landingIntro = document.getElementById("landing-intro");
  const appContainer = document.getElementById("app-container");
  const dashboard    = document.getElementById("dashboard");
  const bulletin     = document.getElementById("bulletin"); 
  const calendar     = document.getElementById("calendar");
  const profile      = document.getElementById("profile");
  // Buttons
  const continueBtn    = document.getElementById("continueBtn");
  const sidebarButtons = Array.from(document.querySelectorAll(".sidebar-btn[data-view]"));
  const backToLanding  = document.getElementById("backToLanding");

  // Mock user for now (no auth)
  const mockUser = {
    name: "Thrift Friend",
    role: "shopper",
    profilePic: "https://via.placeholder.com/120",
    contact: "friend@example.com",
    socials: "@thriftfriend",
    bio: "RGV thrift lover • pop-up regular"
  };

  // Show chosen section
  function showView(view) {
    // Hide all views first
    [dashboard, bulletin, calendar, profile].forEach(sec => {
      if (sec) sec.style.display = "none";
    });

    // Show the requested view
    if (view === "dashboard") {
      dashboard.style.display = "block";
      document.getElementById("welcomeMessage").textContent = `Welcome, ${mockUser.name}!`;

      const content = document.getElementById("dashboardContent");
      content.innerHTML = `
        <p><strong>Name:</strong> ${mockUser.name}</p>
        <p><strong>Role:</strong> ${mockUser.role}</p>
        <p>${mockUser.bio}</p>
      `;
    } 
    else if (view === "bulletin") {
      bulletin.style.display = "block";
    }
    else if (view === "calendar") {
      calendar.style.display = "block";
    }
    else if (view === "profile") {
      profile.style.display = "block";
      document.getElementById("profileNameDisplay").textContent = mockUser.name;
      document.getElementById("profileRoleDisplay").textContent = mockUser.role;
      document.getElementById("profilePicDisplay").src = mockUser.profilePic;
    }
  }

  // Continue button → show dashboard
  continueBtn?.addEventListener("click", () => {
    landingIntro.style.display = "none";
    appContainer.style.display = "grid"; // adjust to your layout
    showView("dashboard");
  });

  // Back to landing
  backToLanding?.addEventListener("click", () => {
    appContainer.style.display = "none";
    landingIntro.style.display = "block";
  });

  // Sidebar navigation
  sidebarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      showView(view);
    });
  });

  // ---------- BULLETIN MODULE ----------
const LS_BULLETIN = "ts_bulletin_posts_v1";

// seed with a couple of sample posts if storage is empty
function seedBulletin() {
  return [
    { id: 101, title: "Vendors Wanted – Plaza Market", desc: "Apply by Friday! 10x10 booths available.", date: "2025-09-10", pic: "", type: "vendor-call", city: "McAllen" },
    { id: 102, title: "Vintage Night Pop-up", desc: "Swap & shop • BYOB • live DJ.", date: "2025-09-14", pic: "", type: "event-update", city: "Edinburg" },
  ];
}

function loadBulletin() {
  try {
    const raw = localStorage.getItem(LS_BULLETIN);
    if (!raw) {
      const seeded = seedBulletin();
      localStorage.setItem(LS_BULLETIN, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return seedBulletin();
  }
}

function saveBulletin(posts) {
  localStorage.setItem(LS_BULLETIN, JSON.stringify(posts));
}

let bulletinPosts = loadBulletin();

function renderBulletin() {
  const container = document.getElementById("bulletinPosts");
  if (!container) return;

  if (!bulletinPosts.length) {
    container.innerHTML = `<div class="empty"><em>No posts yet. Be the first to share an event or vendor call.</em></div>`;
    return;
  }

  const rows = bulletinPosts
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(p => `
      <article class="post" data-id="${p.id}">
        ${p.pic ? `<img class="post-img" src="${escapeHtml(p.pic)}" alt="">` : ""}
        <div class="post-body">
          <h4 class="post-title">${escapeHtml(p.title)}</h4>
          <div class="post-meta">
            ${formatDate(p.date)}
            ${p.type ? ` • ${niceType(p.type)}` : ""}
            ${p.city ? ` • ${escapeHtml(p.city)}` : ""}
          </div>
          <p>${escapeHtml(p.desc)}</p>
          <div class="post-actions">
            <button class="retro-button small" data-action="save">Save</button>
            <button class="retro-button small danger" data-action="delete">Delete</button>
          </div>
        </div>
      </article>
    `).join("");

  container.innerHTML = rows;
}

function onBulletinClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const postEl = btn.closest(".post");
  const id = Number(postEl?.dataset.id);

  if (btn.dataset.action === "delete") {
    bulletinPosts = bulletinPosts.filter(p => p.id !== id);
    saveBulletin(bulletinPosts);
    renderBulletin();
  } else if (btn.dataset.action === "save") {
    // UX stub — later tie into "saved items" / dashboard count
    btn.textContent = "Saved";
    btn.disabled = true;
  }
}

document.getElementById("bulletinPosts")?.addEventListener("click", onBulletinClick);

// Form handler
const newBulletinForm = document.getElementById("newBulletinForm");
newBulletinForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("bulletinTitle").value.trim();
  const desc  = document.getElementById("bulletinDesc").value.trim();
  const date  = document.getElementById("bulletinDate").value;
  const pic   = document.getElementById("bulletinPic").value.trim();

  if (!title || !desc || !date) return;

  const post = {
    id: Date.now(),
    title, desc, date, pic,
    type: "event-update",   // you can add a <select> later to choose "vendor-call" / "event-update"
    city: ""                // add a <select> or input later for location
  };

  bulletinPosts.unshift(post);
  saveBulletin(bulletinPosts);
  e.target.reset();
  renderBulletin();
});

// Utilities
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function niceType(t) {
  return t === "vendor-call" ? "Vendor Call" :
         t === "event-update" ? "Event Update" : t;
}

// Call this when entering the Bulletin view
// If you're using showView('bulletin'), ensure it calls renderBulletin()

});
