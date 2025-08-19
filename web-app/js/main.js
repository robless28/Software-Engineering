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

  const toLogin = document.getElementById("toLogin");
  const toSignup = document.getElementById("toSignup");

  // Initial visibility
  chooseAuth.style.display = "none";
  signupSection.style.display = "none";
  loginSection.style.display = "none";
  dashboard.style.display = "none";

  // Check for existing login
  const existingUser = JSON.parse(localStorage.getItem("userProfile"));
  if (existingUser) {
    showDashboard(existingUser);
  }

  // Continue → show auth options
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
    dashboard.style.display = "block";
    const welcomeText = `Welcome back, ${user.name}!`;
    document.getElementById("welcomeMessage").textContent = welcomeText;

    // Shopper-specific content
    if (user.role === "shopper") {
      const template = document.getElementById("shopperDashboardTemplate");
      const clone = template.content.cloneNode(true);
      dashboardContent.innerHTML = ""; // clear first
      dashboardContent.appendChild(clone);
    } else {
      // Fallback for vendor/organizer or other roles
      dashboardContent.innerHTML = `
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p>This dashboard is under construction for your role.</p>
      `;
    }
  }
}
);
