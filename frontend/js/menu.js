/**
 * College Mess Management System - Weekly Menu Management & View
 */

let weeklyMenuData = null;
let activeDay = 'Monday';
let currentUser = null;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = requireAuth(['student', 'admin']);
  if (!currentUser) return;

  renderUserHeader();
  initDayTabs();
  await loadWeeklyMenu();
  setupMenuEventListeners();
});

// Set current day of week as initial active tab
const initDayTabs = () => {
  const currentDayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; // map Sunday (0) to 6
  activeDay = currentDayName || 'Monday';

  const tabsContainer = document.getElementById('menu-days-tabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = DAYS.map(day => `
    <button class="menu-tab-btn ${day === activeDay ? 'active' : ''}" data-day="${day}" onclick="selectMenuDay('${day}')">
      ${day} ${day === currentDayName ? '<span style="font-size:10px; background:var(--teal); color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">TODAY</span>' : ''}
    </button>
  `).join('');
};

const selectMenuDay = (day) => {
  activeDay = day;
  document.querySelectorAll('.menu-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-day') === day);
  });
  renderDayMeals(day);
};

const loadWeeklyMenu = async () => {
  try {
    const res = await apiRequest('/menu');
    weeklyMenuData = res.grouped || {};
    renderDayMeals(activeDay);
  } catch (err) {
    showToast('Failed to load menu', err.message, 'error');
  }
};

const renderDayMeals = (day) => {
  const container = document.getElementById('day-meals-container');
  if (!container) return;

  const dayMeals = weeklyMenuData[day] || {};
  const isAdmin = currentUser && currentUser.role === 'admin';

  const mealConfigs = [
    { key: 'breakfast', label: 'Breakfast', badgeClass: 'badge-breakfast', defaultTiming: '07:30 AM - 09:30 AM' },
    { key: 'lunch', label: 'Lunch', badgeClass: 'badge-lunch', defaultTiming: '12:30 PM - 02:30 PM' },
    { key: 'snacks', label: 'Evening Snacks / High Tea', badgeClass: 'badge-snacks', defaultTiming: '05:00 PM - 06:15 PM' },
    { key: 'dinner', label: 'Dinner Banquet', badgeClass: 'badge-dinner', defaultTiming: '07:45 PM - 09:45 PM' }
  ];

  container.innerHTML = mealConfigs.map(m => {
    const meal = dayMeals[m.key];
    const items = meal?.items || ['No items configured yet'];
    const timing = meal?.timing || m.defaultTiming;
    const calories = meal?.caloriesEstimate ? `${meal.caloriesEstimate} kcal` : '450 kcal';
    const dietNote = meal?.specialDietNote || 'Prepared with fresh ingredients';

    return `
      <div class="meal-card">
        <div class="meal-card-top">
          <span class="meal-badge ${m.badgeClass}">${m.label}</span>
          <span class="meal-timing"><i class="fa-regular fa-clock"></i> ${timing}</span>
        </div>
        <ul class="meal-items-list">
          ${items.map(item => `
            <li class="meal-item-row">
              <i class="fa-solid fa-circle-check"></i>
              <span>${item}</span>
            </li>
          `).join('')}
        </ul>
        <div class="meal-card-footer">
          <div>
            <div class="diet-note">${dietNote}</div>
            <div style="font-size:11px; color:var(--text-light); margin-top:2px;">Est. Energy: ${calories}</div>
          </div>
          ${isAdmin ? `
            <button class="btn btn-sm btn-secondary" onclick="openMenuEditModal('${day}', '${m.key}')" title="Edit this meal">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
};

// --------------------------------------------------------------------------
// ADMIN MENU EDIT MODAL
// --------------------------------------------------------------------------
const openMenuEditModal = (day, mealType) => {
  const meal = weeklyMenuData[day] ? weeklyMenuData[day][mealType] : null;

  document.getElementById('menu-modal-day').value = day;
  document.getElementById('menu-modal-mealtype').value = mealType;
  document.getElementById('menu-display-day').textContent = `${day} - ${mealType.toUpperCase()}`;

  document.getElementById('menu-modal-items').value = meal?.items ? meal.items.join(', ') : '';
  document.getElementById('menu-modal-timing').value = meal?.timing || '';
  document.getElementById('menu-modal-calories').value = meal?.caloriesEstimate || 450;
  document.getElementById('menu-modal-note').value = meal?.specialDietNote || '';

  showModal('edit-menu-modal');
};

const setupMenuEventListeners = () => {
  const menuForm = document.getElementById('menu-edit-form');
  if (menuForm) {
    menuForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const day = document.getElementById('menu-modal-day').value;
      const mealType = document.getElementById('menu-modal-mealtype').value;
      const items = document.getElementById('menu-modal-items').value;
      const timing = document.getElementById('menu-modal-timing').value;
      const caloriesEstimate = document.getElementById('menu-modal-calories').value;
      const specialDietNote = document.getElementById('menu-modal-note').value;

      try {
        await apiRequest('/menu', {
          method: 'POST',
          body: JSON.stringify({
            day,
            mealType,
            items,
            timing,
            caloriesEstimate,
            specialDietNote
          })
        });

        showToast('Menu Updated', `Menu for ${day} ${mealType.toUpperCase()} saved.`, 'success');
        hideModal('edit-menu-modal');
        await loadWeeklyMenu();
      } catch (err) {
        showToast('Save Failed', err.message, 'error');
      }
    });
  }
};
