document.addEventListener("DOMContentLoaded", () => {
  const landing = document.getElementById("landing");
  const signupForm = document.getElementById("signupForm");
  const loginSection = document.getElementById("login-section");
  const loginForm = document.getElementById("loginForm");
  const dashboard = document.getElementById("user-dashboard");
  const dashboardContent = document.getElementById("dashboardContent");
  const logoutBtn = document.getElementById("logoutBtn");

  const toLogin = document.getElementById("toLogin");
  const toSignup = document.getElementById("toSignup");

  // Hide everything except landing by default
  loginSection.style.display = "none";
  dashboard.style.display = "none";

  // Check for existing login
  const existingUser = JSON.parse(localStorage.getItem("userProfile"));
  if (existingUser) {
    showDashboard(existingUser);
  }

  // Navigation
  toLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    landing.style.display = "none";
    loginSection.style.display = "block";
  });

  toSignup?.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.style.display = "none";
    landing.style.display = "block";
  });

  // Handle signup
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    const user = { name, email, password };

    localStorage.setItem("userProfile", JSON.stringify(user));
    alert("Sign-up successful! Please log in.");
    signupForm.reset();

    landing.style.display = "none";
    loginSection.style.display = "block";
  });

  // Handle login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const loginName = document.getElementById("loginName").value.trim();
    const loginEmail = document.getElementById("loginEmail").value.trim();
    const loginPassword = document.getElementById("loginPassword").value;

    const storedUser = JSON.parse(localStorage.getItem("userProfile"));

    if (
      storedUser &&
      storedUser.name === loginName &&
      storedUser.email === loginEmail &&
      storedUser.password === loginPassword
    ) {
      alert(`Welcome back, ${storedUser.name}!`);
      showDashboard(storedUser);
    } else {
      alert("Invalid credentials. Please try again.");
    }
  });

  // Handle logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userProfile");
    alert("Logged out successfully.");
    location.reload();
  });

  function showDashboard(user) {
    landing.style.display = "none";
    loginSection.style.display = "none";
    dashboard.style.display = "block";
    dashboardContent.innerHTML = `
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;
  }
});
