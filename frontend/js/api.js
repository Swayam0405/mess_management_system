/**
 * College Mess Management System - API Client & Core Utilities
 */

const API_BASE_URL = window.location.origin.includes(':5000') 
  ? '/api' 
  : 'http://localhost:5000/api';

// Retrieve auth token
const getToken = () => localStorage.getItem('cms_token');

// Retrieve stored user object
const getUser = () => {
  const userStr = localStorage.getItem('cms_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

// Generic Fetch Wrapper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If unauthorized, clear auth and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_user');
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
          window.location.href = '/pages/login.html';
        }
      }
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// --------------------------------------------------------------------------
// TOAST NOTIFICATION UTILITY
// --------------------------------------------------------------------------
const showToast = (title, message = '', type = 'info', duration = 4000) => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-triangle-exclamation',
    info: 'fa-info-circle'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || iconMap.info} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// --------------------------------------------------------------------------
// MODAL DIALOG UTILITIES
// --------------------------------------------------------------------------
const showModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
  }
};

const hideModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
  }
};

// Universal Confirmation Dialog
const confirmAction = (title, message, onConfirm) => {
  let confirmModal = document.getElementById('global-confirm-modal');
  if (!confirmModal) {
    confirmModal = document.createElement('div');
    confirmModal.id = 'global-confirm-modal';
    confirmModal.className = 'modal-backdrop';
    confirmModal.innerHTML = `
      <div class="modal-box" style="max-width: 440px;">
        <div class="modal-header">
          <div class="modal-title" id="confirm-title" style="display:flex; align-items:center; gap:10px;">
            <i class="fa-solid fa-triangle-exclamation" style="color:var(--warning);"></i>
            <span>Confirm Action</span>
          </div>
          <button class="modal-close" onclick="hideModal('global-confirm-modal')">&times;</button>
        </div>
        <div class="modal-body">
          <p id="confirm-message" style="color:var(--navy-800); font-size:14.5px;"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="hideModal('global-confirm-modal')">Cancel</button>
          <button class="btn btn-danger" id="confirm-proceed-btn">Proceed</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmModal);
  }

  document.getElementById('confirm-title').querySelector('span').textContent = title;
  document.getElementById('confirm-message').textContent = message;

  const proceedBtn = document.getElementById('confirm-proceed-btn');
  // Clone to remove previous event listeners
  const newBtn = proceedBtn.cloneNode(true);
  proceedBtn.parentNode.replaceChild(newBtn, proceedBtn);

  newBtn.addEventListener('click', async () => {
    hideModal('global-confirm-modal');
    if (typeof onConfirm === 'function') {
      await onConfirm();
    }
  });

  showModal('global-confirm-modal');
};

// --------------------------------------------------------------------------
// FORMATTERS
// --------------------------------------------------------------------------
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
