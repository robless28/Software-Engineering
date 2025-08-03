document.addEventListener("DOMContentLoaded", () => {
  const landingIntro = document.getElementById("landing-intro");
  const continueBtn = document.querySelector("#landing-intro .retro-button");

  const chooseAuth = document.getElementById("choose-auth");
  const goToSignup = document.getElementById("goToSignup");
  const goToLogin = document.getElementById("goToLogin");

  const signupSection = document.getElementById("signup-section");
  const signupForm = document.getElementById("signupForm");

  const loginSection = document.getElementById("login-section");
  const loginForm = document.getElementById("loginForm");

  const dashboard = document.getElementById("user-dashboard");
  const dashboardContent = document.getElementById("dashboardContent");
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

  // Auth choice navigation
  goToSignup?.addEventListener("click", () => {
    chooseAuth.style.display = "none";
    signupSection.style.display = "block";
  });

  goToLogin?.addEventListener("click", () => {
    chooseAuth.style.display = "none";
    loginSection.style.display = "block";
  });

  toLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    signupSection.style.display = "none";
    loginSection.style.display = "block";
  });

  toSignup?.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.style.display = "none";
    signupSection.style.display = "block";
  });

  // Signup
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const role = document.getElementById("signupRole").value;

    const user = { name, email, password, role };
    localStorage.setItem("userProfile", JSON.stringify(user));
    alert("Sign-up successful! Please log in.");
    signupForm.reset();

    signupSection.style.display = "none";
    loginSection.style.display = "block";
  });

  // Login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const loginEmail = document.getElementById("loginEmail").value.trim();
    const loginPassword = document.getElementById("loginPassword").value;

    const storedUser = JSON.parse(localStorage.getItem("userProfile"));

    if (
      storedUser &&
      storedUser.email === loginEmail &&
      storedUser.password === loginPassword
    ) {
      alert(`Welcome back, ${storedUser.name}!`);
      showDashboard(storedUser);
    } else {
      alert("Invalid credentials. Please try again.");
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userProfile");
    alert("Logged out successfully.");

    dashboard.style.display = "none";
    landingIntro.style.display = "block";

    dashboardContent.innerHTML = "";
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  });

  // Show Dashboard
    function showDashboard(user) {
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
