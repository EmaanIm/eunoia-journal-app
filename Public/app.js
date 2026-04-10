// --- UTILITY FUNCTIONS ---
window.togglePassword = function(fieldId) {
  const pass = document.getElementById(fieldId);
  if (pass) pass.type = pass.type === 'password' ? 'text' : 'password';
};

window.showSignup = () => {
  document.querySelector('.login-card').style.display = 'none';
  document.querySelector('.signup-card').style.display = 'block';
};

window.showLogin = () => {
  document.querySelector('.signup-card').style.display = 'none';
  document.querySelector('.login-card').style.display = 'block';
};

// --- VALIDATION HELPERS ---
const validateEmail = (email) => {
  return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Checks for @ and .com/net/etc
};

const validatePassword = (pass) => {
  // Min 8 chars, at least 1 number, and 1 special character
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
  return regex.test(pass);
};

// --- SIGNUP LOGIC ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email-signup').value.trim();
      const password = document.getElementById('password-signup').value;

      if (!validateEmail(email)) {
          alert("Please enter a valid email address (e.g., name@example.com)");
          return;
      }

      if (!validatePassword(password)) {
          alert("Password too weak! Ensure it is 8+ characters with a number and a special character.");
          return;
      }

      const users = JSON.parse(localStorage.getItem('users')) || [];
      if (users.find(u => u.email === email)) {
          alert("This email is already registered.");
          return;
      }

      users.push({ name, email, password });
      localStorage.setItem('users', JSON.stringify(users));
      
      alert(`Account created! Welcome, ${name}.`);
      signupForm.reset();
      showLogin();
  });
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
          // Save the current user session
          localStorage.setItem('currentUser', JSON.stringify(user));
          alert(`Hello again, ${user.name}! Taking you to your dashboard...`);
          window.location.href = 'dashboard.html';
      } else {
          alert("Invalid email or password. Please try again.");
      }
  });
}

// --- AUTO-GREETING (If they come back to login page later) ---
window.onload = () => {
  const lastUser = JSON.parse(localStorage.getItem('currentUser'));
  if (lastUser) {
      document.getElementById('welcomeMessage').innerText = `Welcome back, ${lastUser.name}`;
  }
};