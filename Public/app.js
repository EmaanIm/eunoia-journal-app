// PASSWORD TOGGLE FUNCTION
function togglePassword(fieldId = 'password') {
  const pass = document.getElementById(fieldId);
  pass.type = pass.type === 'password' ? 'text' : 'password';
}

// TOGGLE BETWEEN LOGIN AND SIGNUP
function showSignup() {
  document.querySelector('.login-card').style.display = 'none';
  document.querySelector('.signup-card').style.display = 'block';
}

function showLogin() {
  document.querySelector('.signup-card').style.display = 'none';
  document.querySelector('.login-card').style.display = 'block';
}

// HANDLE LOGIN FORM SUBMISSION
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
      // TODO: call backend endpoint for login
      alert(`Logged in as ${email}`);
      window.location.href = 'home.html'; // redirect after login
    } else {
      alert('Please enter email and password');
    }
  });
}

// HANDLE SIGNUP FORM SUBMISSION
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email-signup').value;
    const password = document.getElementById('password-signup').value;

    if (name && email && password) {
      // TODO: call backend endpoint for signup
      alert(`Account created for ${name} (${email})`);
      showLogin(); // redirect to login form
    } else {
      alert('Please fill in all fields');
    }
  });
}
