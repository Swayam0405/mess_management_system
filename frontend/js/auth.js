/**
 * College Mess Management System - Authentication Logic
 */

// Route Guard: verify if user is authenticated and has required role
const requireAuth = (allowedRoles = ['student', 'admin']) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = '/pages/login.html';
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    // If student tries to visit admin page
    if (user.role === 'student') {
      window.location.href = '/pages/student-dashboard.html';
    } else {
      window.location.href = '/pages/admin-dashboard.html';
    }
    return null;
  }

  return user;
};

// Check if user is already logged in (for login & register pages)
const redirectIfLoggedIn = () => {
  const token = getToken();
  const user = getUser();
  if (token && user) {
    if (user.role === 'admin') {
      window.location.href = '/pages/admin-dashboard.html';
    } else {
      window.location.href = '/pages/student-dashboard.html';
    }
  }
};

// User Logout
const logout = () => {
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
  showToast('Logged Out', 'You have been signed out safely.', 'info');
  setTimeout(() => {
    window.location.href = '/pages/login.html';
  }, 400);
};

// Render current user profile in sidebar & top navbar
const renderUserHeader = () => {
  const user = getUser();
  if (!user) return;

  // Sidebar snippets
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Chief Warden / Admin' : `Student (${user.rollNumber || 'Enrolled'})`;
  if (avatarEl) {
    const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    avatarEl.textContent = initials || 'U';
  }

  // Top navbar date
  const dateEl = document.getElementById('top-navbar-date');
  if (dateEl) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    dateEl.innerHTML = `<i class="fa-regular fa-calendar"></i> ${new Date().toLocaleDateString('en-IN', options)}`;
  }

  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
};

// --------------------------------------------------------------------------
// LOGIN PAGE LOGIC
// --------------------------------------------------------------------------
const initLoginPage = () => {
  redirectIfLoggedIn();

  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');

    if (!email || !password) {
      showToast('Validation Error', 'Please enter both email and password.', 'warning');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('cms_token', res.token);
      localStorage.setItem('cms_user', JSON.stringify(res.user));

      showToast('Welcome Back!', `Signed in as ${res.user.name}`, 'success');

      setTimeout(() => {
        if (res.user.role === 'admin') {
          window.location.href = '/pages/admin-dashboard.html';
        } else {
          window.location.href = '/pages/student-dashboard.html';
        }
      }, 700);
    } catch (err) {
      showToast('Login Failed', err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In to Dashboard <i class="fa-solid fa-arrow-right"></i>';
    }
  });
};

// --------------------------------------------------------------------------
// REGISTER PAGE LOGIC
// --------------------------------------------------------------------------
const initRegisterPage = () => {
  redirectIfLoggedIn();

  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  const roleSelect = document.getElementById('reg-role');
  const adminSecretGroup = document.getElementById('admin-secret-group');

  if (roleSelect && adminSecretGroup) {
    roleSelect.addEventListener('change', (e) => {
      if (e.target.value === 'admin') {
        adminSecretGroup.style.display = 'block';
      } else {
        adminSecretGroup.style.display = 'none';
      }
    });
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const role = roleSelect ? roleSelect.value : 'student';
    const rollNumber = document.getElementById('reg-roll')?.value.trim();
    const department = document.getElementById('reg-dept')?.value;
    const hostelBlock = document.getElementById('reg-hostel')?.value;
    const roomNumber = document.getElementById('reg-room')?.value.trim();
    const dietaryPreference = document.getElementById('reg-diet')?.value;
    const adminSecret = document.getElementById('reg-admin-secret')?.value.trim();

    const submitBtn = document.getElementById('register-submit-btn');

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';

      const payload = {
        name,
        email,
        password,
        role,
        rollNumber,
        department,
        hostelBlock,
        roomNumber,
        dietaryPreference,
        adminSecret
      };

      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      localStorage.setItem('cms_token', res.token);
      localStorage.setItem('cms_user', JSON.stringify(res.user));

      showToast('Registration Successful', 'Welcome to College Mess Management System!', 'success');

      setTimeout(() => {
        if (res.user.role === 'admin') {
          window.location.href = '/pages/admin-dashboard.html';
        } else {
          window.location.href = '/pages/student-dashboard.html';
        }
      }, 700);
    } catch (err) {
      showToast('Registration Error', err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Complete Registration <i class="fa-solid fa-user-plus"></i>';
    }
  });
};

// Demo quick-fill helper
const fillDemoAccount = (email, password) => {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  if (emailInput && passwordInput) {
    emailInput.value = email;
    passwordInput.value = password;
    showToast('Credentials Filled', `Ready to log in as ${email}`, 'info');
  }
};
