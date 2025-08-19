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
      case "calendar": renderCalendar(); break;
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
  }

  function renderBulletin() {
    const postsContainer = document.getElementById("bulletinPosts");
    postsContainer.innerHTML = "";
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const events = users.flatMap(u => u.posts || []);
    if (events.length === 0) { postsContainer.innerHTML = "<p>No events yet</p>"; return; }

    events.forEach(evt => {
      const div = document.createElement("div");
      div.innerHTML = `<h3>${evt.title}</h3><p>${evt.desc}</p><p>${evt.date}</p>`;
      postsContainer.appendChild(div);
    });
  }

  function renderCalendar() {
    const cal = document.getElementById("calendarGrid");
    cal.innerHTML = "<p>Calendar view coming soon</p>";
  }

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
  // If already logged in
  if (currentUser) showView("dashboard");
});
