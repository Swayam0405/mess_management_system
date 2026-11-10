/**
 * College Mess Management System - Admin Dashboard Controller
 */

let mealChartInstance = null;
let paymentChartInstance = null;

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['admin']);
  if (!user) return;

  renderUserHeader();
  await loadAdminStats();
  await loadStudentsTable();
  await loadAnnouncementsList();
  setupEventListeners();
});

// --------------------------------------------------------------------------
// 1. STATS & CHARTS
// --------------------------------------------------------------------------
const loadAdminStats = async () => {
  try {
    const res = await apiRequest('/admin/stats');
    const { data } = res;

    // Stat Cards
    document.getElementById('stat-total-students').textContent = data.totalStudents;
    document.getElementById('stat-active-subs').textContent = data.activeSubscriptions;
    document.getElementById('stat-monthly-revenue').textContent = formatCurrency(data.monthlyRevenue);
    document.getElementById('stat-pending-payments').textContent = `${data.pendingPaymentsCount} (${formatCurrency(data.pendingAmount)})`;

    // Today's Meals Quick Badge
    const mealEl = document.getElementById('stat-today-meals-breakdown');
    if (mealEl) {
      mealEl.innerHTML = `
        <span class="badge badge-warning">B: ${data.mealStats.breakfast}</span>
        <span class="badge badge-primary">L: ${data.mealStats.lunch}</span>
        <span class="badge badge-navy">S: ${data.mealStats.snacks}</span>
        <span class="badge badge-success">D: ${data.mealStats.dinner}</span>
      `;
    }

    // Initialize Chart.js
    initCharts(data.charts);
  } catch (err) {
    showToast('Failed to load stats', err.message, 'error');
  }
};

const initCharts = (chartsData) => {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Today Meal Consumption Bar Chart
  const ctxMeals = document.getElementById('mealsChart')?.getContext('2d');
  if (ctxMeals) {
    if (mealChartInstance) mealChartInstance.destroy();
    mealChartInstance = new Chart(ctxMeals, {
      type: 'bar',
      data: {
        labels: chartsData.todayMeals.labels,
        datasets: [{
          label: 'Students Served',
          data: chartsData.todayMeals.counts,
          backgroundColor: ['#f59e0b', '#0284c7', '#8b5cf6', '#10b981'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  // Chart 2: Payment Status Doughnut Chart
  const ctxPayment = document.getElementById('paymentChart')?.getContext('2d');
  if (ctxPayment) {
    if (paymentChartInstance) paymentChartInstance.destroy();
    paymentChartInstance = new Chart(ctxPayment, {
      type: 'doughnut',
      data: {
        labels: chartsData.paymentStatus.labels,
        datasets: [{
          data: chartsData.paymentStatus.counts,
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
};

// --------------------------------------------------------------------------
// 2. STUDENT MANAGEMENT TABLE & FILTERS
// --------------------------------------------------------------------------
const loadStudentsTable = async () => {
  const search = document.getElementById('student-search-input')?.value.trim() || '';
  const diet = document.getElementById('filter-student-diet')?.value || '';
  const status = document.getElementById('filter-student-status')?.value || '';

  const tableBody = document.getElementById('students-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:20px; text-align:center;"><span class="spinner" style="border-top-color:var(--primary); width:24px; height:24px;"></span> Loading student directory...</td></tr>`;

  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (diet) params.append('dietaryPreference', diet);
    if (status) params.append('status', status);

    const res = await apiRequest(`/admin/students?${params.toString()}`);
    const students = res.data;

    if (students.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No student records matched your filter criteria.</td></tr>`;
      return;
    }

    tableBody.innerHTML = students.map((s, idx) => {
      const dietBadgeClass = s.dietaryPreference === 'Veg' ? 'badge-success' : (s.dietaryPreference === 'Special Jain' ? 'badge-warning' : 'badge-primary');
      const statusBadgeClass = s.status === 'active' ? 'badge-success' : 'badge-danger';
      const monthlyFee = s.subscription ? formatCurrency(s.subscription.monthlyFee) : '₹4,200';

      return `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--navy-900);">${s.name}</div>
            <div style="font-size:12px; color:var(--text-muted);">${s.email}</div>
          </td>
          <td><span style="font-family:monospace; font-weight:700;">${s.rollNumber || 'N/A'}</span></td>
          <td>${s.department} (${s.year}${getOrdinal(s.year)} Yr)</td>
          <td>${s.hostelBlock} - ${s.roomNumber}</td>
          <td><span class="badge ${dietBadgeClass}">${s.dietaryPreference}</span></td>
          <td>
            <div><span class="badge ${statusBadgeClass}">${s.status}</span></div>
            <small style="color:var(--text-muted);">${monthlyFee}/mo</small>
          </td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-secondary" onclick="openEditStudentModal('${s._id}')" title="Edit Student">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="handleDeleteStudent('${s._id}', '${s.name.replace(/'/g, "\\'")}')" title="Delete Student">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--danger);">${err.message}</td></tr>`;
  }
};

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// --------------------------------------------------------------------------
// 3. STUDENT CRUD OPERATIONS
// --------------------------------------------------------------------------
const openAddStudentModal = () => {
  document.getElementById('student-modal-title').textContent = 'Add New Student';
  document.getElementById('student-form').reset();
  document.getElementById('edit-student-id').value = '';
  showModal('student-form-modal');
};

const openEditStudentModal = async (studentId) => {
  try {
    const res = await apiRequest(`/admin/students/${studentId}`);
    const { student, subscription } = res.data;

    document.getElementById('student-modal-title').textContent = 'Edit Student Details';
    document.getElementById('edit-student-id').value = student._id;
    document.getElementById('modal-student-name').value = student.name;
    document.getElementById('modal-student-email').value = student.email;
    document.getElementById('modal-student-roll').value = student.rollNumber || '';
    document.getElementById('modal-student-dept').value = student.department;
    document.getElementById('modal-student-year').value = student.year;
    document.getElementById('modal-student-hostel').value = student.hostelBlock;
    document.getElementById('modal-student-room').value = student.roomNumber;
    document.getElementById('modal-student-phone').value = student.phone || '';
    document.getElementById('modal-student-diet').value = student.dietaryPreference;
    document.getElementById('modal-student-status').value = student.status;
    document.getElementById('modal-student-fee').value = subscription ? subscription.monthlyFee : 4200;

    showModal('student-form-modal');
  } catch (err) {
    showToast('Failed to load student details', err.message, 'error');
  }
};

const handleDeleteStudent = (id, name) => {
  confirmAction(
    'Delete Student Record?',
    `Are you sure you want to permanently remove '${name}' and all associated subscriptions and meal records? This cannot be undone.`,
    async () => {
      try {
        await apiRequest(`/admin/students/${id}`, { method: 'DELETE' });
        showToast('Student Deleted', `${name} has been removed.`, 'success');
        await loadStudentsTable();
        await loadAdminStats();
      } catch (err) {
        showToast('Delete Failed', err.message, 'error');
      }
    }
  );
};

// --------------------------------------------------------------------------
// 4. ANNOUNCEMENTS LIST & PUBLISH
// --------------------------------------------------------------------------
const loadAnnouncementsList = async () => {
  const container = document.getElementById('admin-announcements-container');
  if (!container) return;

  try {
    const res = await apiRequest('/announcements?all=true');
    const announcements = res.data;

    if (announcements.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:13.5px;">No announcements published yet.</p>`;
      return;
    }

    container.innerHTML = announcements.slice(0, 4).map(a => `
      <div class="announcement-card priority-${a.priority}">
        <div class="announcement-header">
          <div class="announcement-title">${a.title}</div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge ${a.priority === 'urgent' ? 'badge-danger' : (a.priority === 'high' ? 'badge-warning' : 'badge-primary')}">${a.priority}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="handleDeleteAnnouncement('${a._id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <p class="announcement-text">${a.content}</p>
        <div class="announcement-date">
          <i class="fa-regular fa-clock"></i> ${formatDateTime(a.createdAt)} &bull; ${a.category}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
};

const handleDeleteAnnouncement = (id) => {
  confirmAction(
    'Delete Announcement',
    'Are you sure you want to delete this notice for all students?',
    async () => {
      try {
        await apiRequest(`/announcements/${id}`, { method: 'DELETE' });
        showToast('Announcement Removed', 'Notice removed successfully.', 'success');
        await loadAnnouncementsList();
      } catch (err) {
        showToast('Error', err.message, 'error');
      }
    }
  );
};

// --------------------------------------------------------------------------
// 5. EVENT LISTENERS SETUP
// --------------------------------------------------------------------------
const setupEventListeners = () => {
  // Student Search & Filters
  const searchInput = document.getElementById('student-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadStudentsTable, 300);
    });
  }

  document.getElementById('filter-student-diet')?.addEventListener('change', loadStudentsTable);
  document.getElementById('filter-student-status')?.addEventListener('change', loadStudentsTable);

  // Student Form (Add or Edit)
  const studentForm = document.getElementById('student-form');
  if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-student-id').value;
      const isEdit = Boolean(id);

      const payload = {
        name: document.getElementById('modal-student-name').value.trim(),
        email: document.getElementById('modal-student-email').value.trim(),
        rollNumber: document.getElementById('modal-student-roll').value.trim(),
        department: document.getElementById('modal-student-dept').value,
        year: Number(document.getElementById('modal-student-year').value),
        hostelBlock: document.getElementById('modal-student-hostel').value,
        roomNumber: document.getElementById('modal-student-room').value.trim(),
        phone: document.getElementById('modal-student-phone').value.trim(),
        dietaryPreference: document.getElementById('modal-student-diet').value,
        status: document.getElementById('modal-student-status').value,
        monthlyFee: Number(document.getElementById('modal-student-fee').value)
      };

      try {
        if (isEdit) {
          await apiRequest(`/admin/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
          showToast('Updated', 'Student information updated successfully.', 'success');
        } else {
          await apiRequest('/admin/students', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          showToast('Created', 'New student registered successfully.', 'success');
        }

        hideModal('student-form-modal');
        await loadStudentsTable();
        await loadAdminStats();
      } catch (err) {
        showToast('Operation Failed', err.message, 'error');
      }
    });
  }

  // Announcement Form
  const announcementForm = document.getElementById('announcement-form');
  if (announcementForm) {
    announcementForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        title: document.getElementById('ann-title').value.trim(),
        content: document.getElementById('ann-content').value.trim(),
        category: document.getElementById('ann-category').value,
        priority: document.getElementById('ann-priority').value
      };

      try {
        await apiRequest('/announcements', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        showToast('Notice Published', 'Announcement is now visible to all students.', 'success');
        hideModal('announcement-modal');
        announcementForm.reset();
        await loadAnnouncementsList();
      } catch (err) {
        showToast('Publishing Failed', err.message, 'error');
      }
    });
  }
};
