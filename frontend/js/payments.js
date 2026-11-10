/**
 * College Mess Management System - Payments Management Controller
 */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = requireAuth(['student', 'admin']);
  if (!currentUser) return;

  renderUserHeader();
  setupPaymentsView();
  await loadPaymentsTable();
  setupPaymentsEventListeners();
});

const setupPaymentsView = () => {
  const isAdmin = currentUser.role === 'admin';
  const adminControls = document.getElementById('admin-payment-controls');
  const studentControls = document.getElementById('student-payment-controls');

  if (isAdmin) {
    if (adminControls) adminControls.style.display = 'flex';
    if (studentControls) studentControls.style.display = 'none';
  } else {
    if (adminControls) adminControls.style.display = 'none';
    if (studentControls) studentControls.style.display = 'flex';
  }
};

const loadPaymentsTable = async () => {
  const tableBody = document.getElementById('payments-table-body');
  if (!tableBody) return;

  const isAdmin = currentUser.role === 'admin';
  const statusFilter = document.getElementById('filter-payment-status')?.value || '';
  const search = document.getElementById('payment-search-input')?.value.trim() || '';

  tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;"><span class="spinner" style="border-top-color:var(--primary); width:24px; height:24px;"></span> Loading payments...</td></tr>`;

  try {
    let payments = [];

    if (isAdmin) {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await apiRequest(`/payments?${params.toString()}`);
      payments = res.data;
    } else {
      const res = await apiRequest('/student/payments');
      payments = res.data;
    }

    if (payments.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">No payment records found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = payments.map((p, idx) => {
      const isPaid = p.status === 'Paid';
      const statusBadge = isPaid
        ? '<span class="badge badge-success"><i class="fa-solid fa-check"></i> Paid</span>'
        : (p.status === 'Pending' ? '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Pending</span>' : '<span class="badge badge-danger">Failed</span>');

      const studentName = p.student?.name || (currentUser.role === 'student' ? currentUser.name : 'Unknown');
      const studentRoll = p.student?.rollNumber || (currentUser.role === 'student' ? currentUser.rollNumber : 'N/A');

      return `
        <tr>
          <td><span style="font-family:monospace; font-weight:700; color:var(--navy-900);">${p.transactionId}</span></td>
          ${isAdmin ? `
            <td>
              <div style="font-weight:700;">${studentName}</div>
              <small style="color:var(--text-muted); font-family:monospace;">${studentRoll}</small>
            </td>
          ` : ''}
          <td><span style="font-weight:600;">${p.month}</span></td>
          <td><strong style="color:var(--navy-900); font-size:15px;">${formatCurrency(p.amount)}</strong></td>
          <td>${formatDate(p.paymentDate || p.createdAt)}</td>
          <td><span class="badge badge-navy">${p.paymentMethod}</span></td>
          <td>${statusBadge}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="viewReceipt('${p._id}')" title="View Receipt">
                <i class="fa-solid fa-receipt"></i>
              </button>
              ${isAdmin && !isPaid ? `
                <button class="btn btn-sm btn-teal" onclick="markPaymentPaid('${p._id}')" title="Mark as Paid">
                  <i class="fa-solid fa-check"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--danger);">${err.message}</td></tr>`;
  }
};

// --------------------------------------------------------------------------
// ADMIN: RECORD MANUAL PAYMENT & MARK PAID
// --------------------------------------------------------------------------
const openRecordPaymentModal = async () => {
  // Populate student dropdown
  try {
    const studentSelect = document.getElementById('record-payment-student');
    const res = await apiRequest('/admin/students?status=active');
    studentSelect.innerHTML = '<option value="">-- Choose Student --</option>' + 
      res.data.map(s => `<option value="${s._id}">${s.name} (${s.rollNumber || 'No Roll'}) - ${s.hostelBlock}</option>`).join('');

    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('record-payment-month').value = currentMonth;
    document.getElementById('record-payment-amount').value = 4200;

    showModal('record-payment-modal');
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
};

const markPaymentPaid = (paymentId) => {
  confirmAction(
    'Confirm Payment Settlement',
    'Mark this pending fee record as successfully Paid?',
    async () => {
      try {
        await apiRequest(`/payments/${paymentId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'Paid', remarks: 'Manually verified and marked Paid by Admin' })
        });
        showToast('Settled', 'Payment status marked as Paid.', 'success');
        await loadPaymentsTable();
      } catch (err) {
        showToast('Error', err.message, 'error');
      }
    }
  );
};

// --------------------------------------------------------------------------
// RECEIPT VIEW MODAL
// --------------------------------------------------------------------------
const viewReceipt = async (paymentId) => {
  try {
    const res = await apiRequest(`/payments/${paymentId}`);
    const p = res.data;

    document.getElementById('receipt-txn').textContent = p.transactionId;
    document.getElementById('receipt-date').textContent = formatDateTime(p.paymentDate || p.createdAt);
    document.getElementById('receipt-student').textContent = `${p.student?.name} (${p.student?.rollNumber || 'N/A'})`;
    document.getElementById('receipt-hostel').textContent = `${p.student?.hostelBlock || ''} - Room ${p.student?.roomNumber || ''}`;
    document.getElementById('receipt-month').textContent = p.month;
    document.getElementById('receipt-amount').textContent = formatCurrency(p.amount);
    document.getElementById('receipt-method').textContent = p.paymentMethod;
    document.getElementById('receipt-status').textContent = p.status;

    showModal('receipt-modal');
  } catch (err) {
    showToast('Failed to load receipt', err.message, 'error');
  }
};

const printReceipt = () => {
  window.print();
};

const setupPaymentsEventListeners = () => {
  document.getElementById('filter-payment-status')?.addEventListener('change', loadPaymentsTable);

  const searchInput = document.getElementById('payment-search-input');
  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(loadPaymentsTable, 300);
    });
  }

  // Admin record payment form
  const recordForm = document.getElementById('record-payment-form');
  if (recordForm) {
    recordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        studentId: document.getElementById('record-payment-student').value,
        month: document.getElementById('record-payment-month').value.trim(),
        amount: Number(document.getElementById('record-payment-amount').value),
        paymentMethod: document.getElementById('record-payment-method').value,
        status: document.getElementById('record-payment-status').value,
        remarks: document.getElementById('record-payment-remarks').value.trim()
      };

      try {
        await apiRequest('/payments', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        showToast('Payment Recorded', 'Student mess payment successfully recorded.', 'success');
        hideModal('record-payment-modal');
        recordForm.reset();
        await loadPaymentsTable();
      } catch (err) {
        showToast('Failed to record', err.message, 'error');
      }
    });
  }
};
