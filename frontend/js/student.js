/**
 * College Mess Management System - Student Dashboard Controller
 */

let currentDashboardData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['student']);
  if (!user) return;

  renderUserHeader();
  await loadStudentDashboard();
  setupStudentEvents();
});

// --------------------------------------------------------------------------
// 1. LOAD DASHBOARD SUMMARY
// --------------------------------------------------------------------------
const loadStudentDashboard = async () => {
  try {
    const res = await apiRequest('/student/dashboard');
    currentDashboardData = res.data;
    const { student, subscription, currentFeeStatus, todayName, todaysMenu, todayAttendances, announcements, recentFeedbacks } = currentDashboardData;

    // A. Student Profile Card
    document.getElementById('profile-name').textContent = student.name;
    document.getElementById('profile-roll').textContent = student.rollNumber || 'Not Assigned';
    document.getElementById('profile-dept').textContent = `${student.department} (${student.year}${getOrdinal(student.year)} Year)`;
    document.getElementById('profile-hostel').textContent = `${student.hostelBlock}, Room ${student.roomNumber}`;
    document.getElementById('profile-diet').textContent = student.dietaryPreference;

    // B. Subscription & Fee Status Card
    document.getElementById('sub-plan-name').textContent = subscription.planName;
    document.getElementById('sub-monthly-fee').textContent = formatCurrency(subscription.monthlyFee);
    
    const subBadge = document.getElementById('sub-status-badge');
    subBadge.className = `badge ${subscription.status === 'active' ? 'badge-success' : 'badge-warning'}`;
    subBadge.textContent = subscription.status;

    // Payment Status for Current Month
    const feeStatusBadge = document.getElementById('fee-status-badge');
    const feeMonthEl = document.getElementById('fee-current-month');
    const payBtn = document.getElementById('btn-quick-pay-fee');

    if (feeMonthEl) feeMonthEl.textContent = currentFeeStatus.month;

    if (currentFeeStatus.isPaid) {
      feeStatusBadge.className = 'badge badge-success';
      feeStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Fee Settled';
      if (payBtn) payBtn.style.display = 'none';
      document.getElementById('fee-payment-meta').innerHTML = `
        <small style="color:var(--success-dark); font-weight:600;">
          Paid on ${formatDate(currentFeeStatus.lastPaymentDate)} (Txn: ${currentFeeStatus.transactionId})
        </small>
      `;
    } else {
      feeStatusBadge.className = 'badge badge-danger';
      feeStatusBadge.innerHTML = '<i class="fa-solid fa-clock"></i> Payment Due';
      if (payBtn) payBtn.style.display = 'inline-flex';
      document.getElementById('fee-payment-meta').innerHTML = `
        <small style="color:var(--danger); font-weight:600;">Please clear your mess dues for ${currentFeeStatus.month}.</small>
      `;
    }

    // C. Today's Menu Highlight & Meal Attendance Check-In
    renderTodayMeals(todayName, todaysMenu, todayAttendances);

    // D. Announcements
    renderStudentAnnouncements(announcements);

    // E. Recent Feedbacks
    renderStudentFeedbacks(recentFeedbacks);

  } catch (err) {
    showToast('Failed to load dashboard', err.message, 'error');
  }
};

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// --------------------------------------------------------------------------
// 2. RENDER TODAY'S MEALS & MEAL ATTENDANCE CHECK-IN
// --------------------------------------------------------------------------
const renderTodayMeals = (dayName, menuItems, attendances) => {
  const container = document.getElementById('today-meals-container');
  if (!container) return;

  document.getElementById('today-day-label').textContent = dayName;

  const mealTypes = [
    { type: 'breakfast', label: 'Breakfast', badgeClass: 'badge-breakfast', defaultTiming: '07:30 AM - 09:30 AM' },
    { type: 'lunch', label: 'Lunch', badgeClass: 'badge-lunch', defaultTiming: '12:30 PM - 02:30 PM' },
    { type: 'snacks', label: 'High Tea / Snacks', badgeClass: 'badge-snacks', defaultTiming: '05:00 PM - 06:15 PM' },
    { type: 'dinner', label: 'Dinner', badgeClass: 'badge-dinner', defaultTiming: '07:45 PM - 09:45 PM' }
  ];

  container.innerHTML = mealTypes.map(m => {
    const mealData = menuItems.find(item => item.mealType === m.type);
    const attendance = attendances.find(a => a.mealType === m.type);

    const timing = mealData?.timing || m.defaultTiming;
    const itemsList = mealData?.items || ['Menu updating shortly by kitchen staff'];
    const dietNote = mealData?.specialDietNote || 'Prepared hygienic in central mess';

    const isConsumed = Boolean(attendance && attendance.status === 'Consumed');

    return `
      <div class="meal-card">
        <div class="meal-card-top">
          <span class="meal-badge ${m.badgeClass}">${m.label}</span>
          <span class="meal-timing"><i class="fa-regular fa-clock"></i> ${timing}</span>
        </div>
        <ul class="meal-items-list">
          ${itemsList.map(item => `
            <li class="meal-item-row">
              <i class="fa-solid fa-circle-dot"></i>
              <span>${item}</span>
            </li>
          `).join('')}
        </ul>
        <div class="meal-card-footer">
          <div class="diet-note">${dietNote}</div>
          <div>
            ${isConsumed ? `
              <span class="badge badge-success" title="Checked in">
                <i class="fa-solid fa-check"></i> Consumed
              </span>
            ` : `
              <button class="btn btn-sm btn-teal" onclick="handleMealCheckIn('${m.type}')">
                <i class="fa-solid fa-utensils"></i> Check In
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
};

// Handle meal check-in
const handleMealCheckIn = async (mealType) => {
  try {
    const res = await apiRequest('/student/attendance', {
      method: 'POST',
      body: JSON.stringify({ mealType, status: 'Consumed' })
    });

    showToast('Meal Checked In', res.message, 'success');
    await loadStudentDashboard();
  } catch (err) {
    showToast('Check-in Failed', err.message, 'error');
  }
};

// --------------------------------------------------------------------------
// 3. ANNOUNCEMENTS & FEEDBACK RENDERING
// --------------------------------------------------------------------------
const renderStudentAnnouncements = (announcements) => {
  const container = document.getElementById('student-announcements-container');
  if (!container) return;

  if (announcements.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:13.5px;">No active announcements at this time.</p>`;
    return;
  }

  container.innerHTML = announcements.map(a => `
    <div class="announcement-card priority-${a.priority}">
      <div class="announcement-header">
        <div class="announcement-title">${a.title}</div>
        <span class="badge ${a.priority === 'urgent' ? 'badge-danger' : (a.priority === 'high' ? 'badge-warning' : 'badge-primary')}">${a.priority}</span>
      </div>
      <p class="announcement-text">${a.content}</p>
      <div class="announcement-date">
        <i class="fa-regular fa-calendar"></i> ${formatDateTime(a.createdAt)} &bull; ${a.category}
      </div>
    </div>
  `).join('');
};

const renderStudentFeedbacks = (feedbacks) => {
  const container = document.getElementById('student-feedbacks-container');
  if (!container) return;

  if (feedbacks.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:13.5px;">You have not submitted any feedback yet. Share your experience below!</p>`;
    return;
  }

  container.innerHTML = feedbacks.map(f => {
    const stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
    return `
      <div class="feedback-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div class="feedback-stars">${stars} (${f.rating}/5)</div>
          <span class="badge ${f.status === 'Resolved' ? 'badge-success' : 'badge-navy'}">${f.status}</span>
        </div>
        <div style="font-weight:600; font-size:13px; color:var(--text-muted); margin-bottom:4px;">
          ${f.category} &bull; ${f.mealType.toUpperCase()}
        </div>
        <p style="color:var(--navy-900); font-size:13.5px;">${f.comment}</p>
        ${f.adminResponse ? `
          <div class="admin-reply-box">
            <strong style="color:var(--teal-hover);">Warden's Response:</strong> ${f.adminResponse}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
};

// --------------------------------------------------------------------------
// 4. STUDENT ACTIONS (PAYMENT & FEEDBACK)
// --------------------------------------------------------------------------
const openPaymentModal = () => {
  if (!currentDashboardData) return;
  const { currentFeeStatus, subscription } = currentDashboardData;

  document.getElementById('pay-modal-month').textContent = currentFeeStatus.month;
  document.getElementById('pay-modal-amount').textContent = formatCurrency(subscription.monthlyFee);
  showModal('payment-modal');
};

const openFeedbackModal = () => {
  document.getElementById('feedback-form').reset();
  showModal('feedback-modal');
};

const setupStudentEvents = () => {
  // Demo payment button
  document.getElementById('btn-quick-pay-fee')?.addEventListener('click', openPaymentModal);

  // Payment Form Submission
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const method = document.getElementById('pay-method').value;
      const submitBtn = document.getElementById('btn-submit-payment');

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing payment...';

        const res = await apiRequest('/student/pay', {
          method: 'POST',
          body: JSON.stringify({ paymentMethod: method })
        });

        showToast('Payment Successful!', res.message, 'success');
        hideModal('payment-modal');
        await loadStudentDashboard();
      } catch (err) {
        showToast('Payment Failed', err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirm Payment';
      }
    });
  }

  // Feedback Form Submission
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rating = document.getElementById('fb-rating').value;
      const category = document.getElementById('fb-category').value;
      const mealType = document.getElementById('fb-mealtype').value;
      const comment = document.getElementById('fb-comment').value.trim();

      if (!comment) {
        showToast('Required', 'Please write your feedback comment.', 'warning');
        return;
      }

      try {
        const res = await apiRequest('/student/feedback', {
          method: 'POST',
          body: JSON.stringify({ rating, category, mealType, comment })
        });

        showToast('Feedback Received', res.message, 'success');
        hideModal('feedback-modal');
        feedbackForm.reset();
        await loadStudentDashboard();
      } catch (err) {
        showToast('Failed to submit', err.message, 'error');
      }
    });
  }
};
