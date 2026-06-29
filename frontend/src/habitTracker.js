const HABIT_STORAGE_KEY = 'daily-habit-checklist';
const CALORIE_DATE_STORAGE_KEY = 'daily-calorie-selected-date';
const HABIT_DEFINITIONS = [
  { key: 'calorieGoal', label: 'Calorie Goal', icon: '🎯', description: 'Met your daily calorie goal' },
  { key: 'fitnessWorkout', label: 'Fitness Workout', icon: '💪', description: 'Completed a workout' }
];
const EXERCISE_LEVELS = [
  'Exercise regularly',
  'Exercise a few times a week',
  'Exercise sometimes',
  'Rarely exercise',
  'Not at all'
];

function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getDateLabel(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function createEmptyMonthState(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const days = {};
  const totalDays = getDaysInMonth(year, month - 1);

  for (let day = 1; day <= totalDays; day += 1) {
    const dayLabel = String(day).padStart(2, '0');
    const dateLabel = `${year}-${String(month).padStart(2, '0')}-${dayLabel}`;
    days[dayLabel] = {
      date: dateLabel,
      habits: {
        calorieGoal: false,
        fitnessWorkout: false
      },
      calorieGoal: null,
      foodEntries: [],
      foodCalories: 0
    };
  }

  return { monthKey, days };
}

function normalizeEntry(entry, dateLabel) {
  const habits = entry && entry.habits ? entry.habits : {};
  const safeEntry = {
    date: dateLabel,
    habits: {
      calorieGoal: Boolean(habits.calorieGoal),
      fitnessWorkout: Boolean(habits.fitnessWorkout)
    },
    calorieGoal: entry && entry.calorieGoal != null ? Number(entry.calorieGoal) : null,
    foodEntries: Array.isArray(entry && entry.foodEntries) ? entry.foodEntries : [],
    foodCalories: 0
  };

  safeEntry.foodCalories = (safeEntry.foodEntries || []).reduce((total, foodEntry) => total + Number(foodEntry.calories || 0), 0);
  return safeEntry;
}

function loadHabitState() {
  try {
    const storedState = window.localStorage.getItem(HABIT_STORAGE_KEY);
    if (!storedState) return createEmptyMonthState(getMonthKey());

    const parsedState = JSON.parse(storedState);
    const monthKey = getMonthKey();
    if (!parsedState || parsedState.monthKey !== monthKey) {
      return createEmptyMonthState(monthKey);
    }

    const [year, month] = monthKey.split('-').map(Number);
    const totalDays = getDaysInMonth(year, month - 1);
    const days = { ...(parsedState.days || {}) };

    for (let day = 1; day <= totalDays; day += 1) {
      const dayLabel = String(day).padStart(2, '0');
      if (!days[dayLabel]) {
        const dateLabel = `${year}-${String(month).padStart(2, '0')}-${dayLabel}`;
        days[dayLabel] = normalizeEntry(null, dateLabel);
      } else {
        days[dayLabel] = normalizeEntry(days[dayLabel], `${year}-${String(month).padStart(2, '0')}-${dayLabel}`);
      }
    }

    return { monthKey, days };
  } catch (error) {
    console.error('Unable to load habit state', error);
    return createEmptyMonthState(getMonthKey());
  }
}

function saveHabitState(state) {
  window.localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(state));
}

function calculateHabitProgress(dayEntries, todayDateLabel = getDateLabel()) {
  const entries = Array.isArray(dayEntries) ? dayEntries : Object.values(dayEntries || {});
  const filteredEntries = entries.filter((entry) => entry && entry.date <= todayDateLabel);
  let completed = 0;
  let possible = 0;

  filteredEntries.forEach((entry) => {
    const habits = entry.habits || {};
    Object.keys(habits).forEach((habitKey) => {
      possible += 1;
      if (habits[habitKey]) completed += 1;
    });
  });

  const percentage = possible === 0 ? 0 : (completed / possible) * 100;
  return { completed, possible, percentage };
}

function getRankFromPercentage(percentage) {
  if (percentage <= 25) return 'Iron';
  if (percentage <= 50) return 'Bronze';
  if (percentage <= 75) return 'Silver';
  return 'Gold';
}

function getRankMeta(percentage) {
  const rank = getRankFromPercentage(percentage);
  const config = {
    Iron: { icon: '🔴', label: 'Iron' },
    Bronze: { icon: '🥉', label: 'Bronze' },
    Silver: { icon: '🥈', label: 'Silver' },
    Gold: { icon: '🥇', label: 'Gold' }
  };
  return config[rank];
}

function getCurrentDayEntry(state, dateLabel = getDateLabel()) {
  const dayKey = dateLabel.slice(-2);
  return state.days[dayKey] || normalizeEntry(null, dateLabel);
}

function loadSelectedDateLabel(defaultDateLabel = getDateLabel()) {
  try {
    return window.localStorage.getItem(CALORIE_DATE_STORAGE_KEY) || defaultDateLabel;
  } catch (error) {
    return defaultDateLabel;
  }
}

function saveSelectedDateLabel(dateLabel) {
  try {
    window.localStorage.setItem(CALORIE_DATE_STORAGE_KEY, dateLabel);
  } catch (error) {
    console.error('Unable to persist selected date', error);
  }
}

function calculateProgressSummary({ goal, foodCalories }) {
  const parsedGoal = Number(goal);
  const parsedFoodCalories = Number(foodCalories || 0);

  if (!parsedGoal || Number.isNaN(parsedGoal)) {
    return { goal: null, foodCalories: parsedFoodCalories, remaining: null, overBy: 0, status: 'no-goal' };
  }

  if (parsedFoodCalories > parsedGoal) {
    return { goal: parsedGoal, foodCalories: parsedFoodCalories, remaining: 0, overBy: parsedFoodCalories - parsedGoal, status: 'over' };
  }

  if (parsedFoodCalories === parsedGoal) {
    return { goal: parsedGoal, foodCalories: parsedFoodCalories, remaining: 0, overBy: 0, status: 'reached' };
  }

  return { goal: parsedGoal, foodCalories: parsedFoodCalories, remaining: parsedGoal - parsedFoodCalories, overBy: 0, status: 'under' };
}

function calculateRecommendedCalories({ age, gender, height, weight, exerciseLevel }) {
  const parsedAge = Number(age);
  const parsedHeight = Number(height);
  const parsedWeight = Number(weight);
  const normalizedGender = String(gender || '').toLowerCase();

  if ([parsedAge, parsedHeight, parsedWeight].some((value) => Number.isNaN(value) || value <= 0)) {
    return null;
  }

  const base = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge + (normalizedGender === 'male' ? 5 : -161);
  const multiplierMap = {
    'Exercise regularly': 1.525,
    'Exercise a few times a week': 1.375,
    'Exercise sometimes': 1.2,
    'Rarely exercise': 1.1,
    'Not at all': 1
  };
  const multiplier = multiplierMap[exerciseLevel] || 1.2;
  return Math.round(base * multiplier);
}

function getCalendarStatus(entry) {
  const goal = Number(entry?.calorieGoal ?? entry?.goal ?? 0);
  const foodCalories = Number(entry?.foodCalories ?? 0);
  if (!goal || Number.isNaN(goal)) return 'grey';
  if (foodCalories === goal) return 'green';
  return 'red';
}

function getDayStatus(entry) {
  return getCalendarStatus(entry);
}

function renderHabitTracker() {
  const root = document.getElementById('habitTrackerRoot');
  if (!root) return;

  const state = loadHabitState();
  const todayDateLabel = getDateLabel();
  const selectedDateLabel = loadSelectedDateLabel(todayDateLabel);
  const selectedEntry = getCurrentDayEntry(state, selectedDateLabel);
  const progress = calculateHabitProgress(Object.values(state.days), todayDateLabel);
  const rankMeta = getRankMeta(progress.percentage);
  const summary = calculateProgressSummary({ goal: selectedEntry.calorieGoal, foodCalories: selectedEntry.foodCalories });

  root.innerHTML = `
    <section class="tracker-header">
      <div>
        <p class="eyebrow">Daily habit checklist</p>
        <h2>Build your streak for the month</h2>
        <p>Track your calorie goal and workout each day. Every day starts fresh and contributes to your monthly progress.</p>
      </div>
      <div class="tracker-badge">
        <span>${rankMeta.icon}</span>
        <strong>${rankMeta.label}</strong>
      </div>
    </section>

    <section class="tracker-summary grid">
      <article class="card span-7">
        <div class="progress-row">
          <div>
            <p class="eyebrow">Current progress</p>
            <h3>${progress.percentage.toFixed(1)}%</h3>
          </div>
          <div class="progress-figure">
            <strong>${progress.completed}/${progress.possible}</strong>
            <span>completed checkboxes</span>
          </div>
        </div>
        <div class="progress-bar" aria-label="Monthly progress">
          <span style="width:${Math.min(progress.percentage, 100)}%"></span>
        </div>
      </article>
      <article class="card span-5">
        <p class="eyebrow">Today</p>
        <h3>${new Date(todayDateLabel).toLocaleDateString('en', { month: 'long', day: 'numeric' })}</h3>
        <div class="habit-list">
          ${HABIT_DEFINITIONS.map((habit) => `
            <label class="habit-item">
              <div>
                <strong>${habit.icon} ${habit.label}</strong>
                <small>${habit.description}</small>
              </div>
              <input type="checkbox" data-habit-key="${habit.key}" ${selectedEntry.habits[habit.key] ? 'checked' : ''}>
            </label>
          `).join('')}
        </div>
      </article>
    </section>

    <section class="grid">
      <article class="card span-6">
        <p class="eyebrow">Daily calorie goal</p>
        <h3>Set your target for ${new Date(selectedDateLabel).toLocaleDateString('en', { month: 'long', day: 'numeric' })}</h3>
        <form id="calorieGoalForm" class="form-stack compact">
          <label class="field-group">
            <span>Date</span>
            <input type="date" id="goalDate" value="${selectedDateLabel}">
          </label>
          <label class="field-group">
            <span>Calorie goal</span>
            <input type="number" id="calorieGoalInput" min="0" step="50" value="${selectedEntry.calorieGoal || ''}" placeholder="Enter a daily calorie goal">
          </label>
          <div class="row-actions">
            <button type="submit">Save calorie goal</button>
            <button class="secondary-button" type="button" id="clearGoalButton">Clear goal</button>
          </div>
        </form>
        <div class="helper-box">
          <p class="eyebrow">Recommended daily calorie intake</p>
          <div class="helper-field-grid">
            <label class="field-group">
              <span>Age</span>
              <input type="number" id="helperAge" min="1" value="20">
            </label>
            <label class="field-group">
              <span>Gender</span>
              <select id="helperGender">
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <label class="field-group">
              <span>Height (cm)</span>
              <input type="number" id="helperHeight" min="1" value="165">
            </label>
            <label class="field-group">
              <span>Weight (kg)</span>
              <input type="number" id="helperWeight" min="1" value="60">
            </label>
            <label class="field-group">
              <span>Exercise level</span>
              <select id="helperExerciseLevel">
                ${EXERCISE_LEVELS.map((level) => `<option value="${level}" ${level === 'Exercise regularly' ? 'selected' : ''}>${level}</option>`).join('')}
              </select>
            </label>
          </div>
          <div class="row-actions">
            <button class="secondary-button" type="button" id="calculateRecommendationButton">Calculate recommendation</button>
            <button type="button" id="applyRecommendationButton" disabled>Use recommended goal</button>
          </div>
          <div class="recommendation-output" id="recommendationOutput">Enter your details to see a recommended calorie intake.</div>
        </div>
      </article>
      <article class="card span-6">
        <p class="eyebrow">Daily calorie progress</p>
        <h3>${new Date(selectedDateLabel).toLocaleDateString('en', { month: 'long', day: 'numeric' })} overview</h3>
        <div class="calorie-summary">
          <div class="summary-pill"><strong>Goal</strong><span>${summary.goal ? `${summary.goal} kcal` : 'Not set'}</span></div>
          <div class="summary-pill"><strong>Food eaten</strong><span>${summary.foodCalories} kcal</span></div>
          <div class="summary-pill"><strong>Remaining</strong><span>${summary.goal ? `${summary.remaining ?? 0} kcal` : '—'}</span></div>
          <div class="summary-pill ${summary.status}"><strong>Status</strong><span>${summary.status === 'reached' ? 'Goal reached' : summary.status === 'over' ? `Over by ${summary.overBy} kcal` : summary.status === 'under' ? `Under by ${summary.remaining} kcal` : 'Set a goal to start tracking'}</span></div>
        </div>
        <form id="foodLogForm" class="form-stack compact">
          <div class="field-grid">
            <label class="field-group">
              <span>Food name</span>
              <input type="text" id="foodName" placeholder="e.g. Chicken rice" required>
            </label>
            <label class="field-group">
              <span>Calories</span>
              <input type="number" id="foodCaloriesInput" min="0" step="10" placeholder="Calories" required>
            </label>
            <label class="field-group">
              <span>Date</span>
              <input type="date" id="foodDate" value="${selectedDateLabel}">
            </label>
          </div>
          <button type="submit">Log food entry</button>
        </form>
        <ul class="food-list">
          ${selectedEntry.foodEntries.length ? selectedEntry.foodEntries.map((foodEntry) => `
            <li class="food-item">
              <div>
                <strong>${foodEntry.name}</strong>
                <small>${foodEntry.calories} calories</small>
              </div>
              <button class="secondary-button delete-entry" type="button" data-food-name="${foodEntry.name}" data-food-date="${foodEntry.date}">Remove</button>
            </li>
          `).join('') : '<li class="empty-state">No food logged for this day yet.</li>'}
        </ul>
      </article>
    </section>

    <section class="card tracker-calendar-card">
      <div class="calendar-header">
        <div>
          <p class="eyebrow">Month calendar</p>
          <h3>${new Date(todayDateLabel).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div class="calendar-legend">
          <span><i class="legend-dot green"></i> Goal reached</span>
          <span><i class="legend-dot red"></i> Over or under goal</span>
          <span><i class="legend-dot grey"></i> No goal set</span>
        </div>
      </div>
      <div class="tracker-calendar">
        ${Object.values(state.days).map((entry) => {
          const status = getDayStatus(entry);
          const isToday = entry.date === todayDateLabel;
          return `
            <div class="day-cell ${status} ${isToday ? 'today' : ''}">
              <span>${new Date(entry.date).getDate()}</span>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;

  const checkboxes = root.querySelectorAll('input[data-habit-key]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const habitKey = event.target.getAttribute('data-habit-key');
      const nextState = loadHabitState();
      const currentDateLabel = loadSelectedDateLabel(getDateLabel());
      const entry = getCurrentDayEntry(nextState, currentDateLabel);
      entry.habits[habitKey] = event.target.checked;
      nextState.days[currentDateLabel.slice(-2)] = entry;
      saveHabitState(nextState);
      renderHabitTracker();
    });
  });

  const goalDateInput = root.querySelector('#goalDate');
  if (goalDateInput) {
    goalDateInput.addEventListener('change', (event) => {
      saveSelectedDateLabel(event.target.value || getDateLabel());
      renderHabitTracker();
    });
  }

  const goalForm = root.querySelector('#calorieGoalForm');
  if (goalForm) {
    goalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const nextState = loadHabitState();
      const entryDate = root.querySelector('#goalDate').value || getDateLabel();
      const entry = getCurrentDayEntry(nextState, entryDate);
      const goalValue = root.querySelector('#calorieGoalInput').value;
      entry.calorieGoal = goalValue ? Number(goalValue) : null;
      nextState.days[entryDate.slice(-2)] = entry;
      saveSelectedDateLabel(entryDate);
      saveHabitState(nextState);
      renderHabitTracker();
    });
  }

  const clearGoalButton = root.querySelector('#clearGoalButton');
  if (clearGoalButton) {
    clearGoalButton.addEventListener('click', () => {
      const nextState = loadHabitState();
      const entryDate = root.querySelector('#goalDate').value || getDateLabel();
      const entry = getCurrentDayEntry(nextState, entryDate);
      entry.calorieGoal = null;
      nextState.days[entryDate.slice(-2)] = entry;
      saveSelectedDateLabel(entryDate);
      saveHabitState(nextState);
      renderHabitTracker();
    });
  }

  const calculateButton = root.querySelector('#calculateRecommendationButton');
  const applyButton = root.querySelector('#applyRecommendationButton');
  const recommendationOutput = root.querySelector('#recommendationOutput');
  const helperInputs = {
    age: root.querySelector('#helperAge'),
    gender: root.querySelector('#helperGender'),
    height: root.querySelector('#helperHeight'),
    weight: root.querySelector('#helperWeight'),
    exerciseLevel: root.querySelector('#helperExerciseLevel')
  };

  if (calculateButton && recommendationOutput) {
    calculateButton.addEventListener('click', () => {
      const recommendedCalories = calculateRecommendedCalories({
        age: helperInputs.age.value,
        gender: helperInputs.gender.value,
        height: helperInputs.height.value,
        weight: helperInputs.weight.value,
        exerciseLevel: helperInputs.exerciseLevel.value
      });

      if (recommendedCalories) {
        recommendationOutput.innerHTML = `<strong>${recommendedCalories} kcal</strong><span>Recommended daily calorie intake based on your details.</span>`;
        if (applyButton) applyButton.disabled = false;
      } else {
        recommendationOutput.innerHTML = '<span>Enter valid details to receive a recommendation.</span>';
        if (applyButton) applyButton.disabled = true;
      }
    });
  }

  if (applyButton && recommendationOutput) {
    applyButton.addEventListener('click', () => {
      const recommendationValue = recommendationOutput.querySelector('strong')?.textContent?.replace(/\D/g, '');
      if (!recommendationValue) return;
      const calorieInput = root.querySelector('#calorieGoalInput');
      if (calorieInput) calorieInput.value = recommendationValue;
    });
  }

  const foodForm = root.querySelector('#foodLogForm');
  if (foodForm) {
    foodForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const nextState = loadHabitState();
      const entryDate = root.querySelector('#foodDate').value || getDateLabel();
      const entry = getCurrentDayEntry(nextState, entryDate);
      const foodName = root.querySelector('#foodName').value.trim();
      const foodCaloriesValue = root.querySelector('#foodCaloriesInput').value;

      if (!foodName || !foodCaloriesValue) return;

      entry.foodEntries.push({ name: foodName, calories: Number(foodCaloriesValue), date: entryDate });
      entry.foodCalories = entry.foodEntries.reduce((total, foodEntry) => total + Number(foodEntry.calories || 0), 0);
      nextState.days[entryDate.slice(-2)] = entry;
      saveSelectedDateLabel(entryDate);
      saveHabitState(nextState);
      renderHabitTracker();
    });
  }

  const deleteButtons = root.querySelectorAll('.delete-entry');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextState = loadHabitState();
      const entryDate = button.getAttribute('data-food-date') || getDateLabel();
      const entry = getCurrentDayEntry(nextState, entryDate);
      entry.foodEntries = entry.foodEntries.filter((foodEntry) => foodEntry.name !== button.getAttribute('data-food-name'));
      entry.foodCalories = entry.foodEntries.reduce((total, foodEntry) => total + Number(foodEntry.calories || 0), 0);
      nextState.days[entryDate.slice(-2)] = entry;
      saveHabitState(nextState);
      renderHabitTracker();
    });
  });
}

function renderCalorieTrackerPage() {
  const root = document.getElementById('calorieTrackerRoot');
  if (!root) return;

  const state = loadHabitState();
  const todayDateLabel = getDateLabel();
  const selectedDateLabel = loadSelectedDateLabel(todayDateLabel);
  const selectedEntry = getCurrentDayEntry(state, selectedDateLabel);
  const summary = calculateProgressSummary({ goal: selectedEntry.calorieGoal, foodCalories: selectedEntry.foodCalories });

  root.innerHTML = `
    <section class="tracker-header">
      <div>
        <p class="eyebrow">Calorie tracker</p>
        <h2>Manage your BMI, calories, and daily targets</h2>
        <p>Use BMI insights and food logging to stay on track.</p>
      </div>
    </section>

    <section class="grid">
      <article class="card span-12">
        <p class="eyebrow">BMI calculator</p>
        <h3>Check your current body mass index</h3>
        <form id="bmiForm" class="form-stack compact">
          <div class="field-grid">
            <label class="field-group">
              <span>Age</span>
              <input type="number" id="bmiAge" min="1" value="20">
            </label>
            <label class="field-group">
              <span>Gender</span>
              <select id="bmiGender">
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <label class="field-group">
              <span>Height (cm)</span>
              <input type="number" id="bmiHeight" min="1" value="165">
            </label>
            <label class="field-group">
              <span>Weight (kg)</span>
              <input type="number" id="bmiWeight" min="1" value="60">
            </label>
            <label class="field-group">
              <span>Exercise level</span>
              <select id="bmiExerciseLevel">
                ${EXERCISE_LEVELS.map((level) => `<option value="${level}">${level}</option>`).join('')}
              </select>
            </label>
          </div>
          <button type="submit">Calculate BMI</button>
        </form>
        <div class="bmi-output" id="bmiOutput">Enter your height and weight to calculate your BMI.</div>
      </article>
    </section>

    <section class="grid">
      <article class="card span-12">
        <p class="eyebrow">Food calorie tracker</p>
        <h3>Log food and track calories for today</h3>
        <form id="trackerFoodForm" class="form-stack compact">
          <div class="field-grid">
            <label class="field-group">
              <span>Food name</span>
              <input type="text" id="trackerFoodName" placeholder="e.g. Pasta" required>
            </label>
            <label class="field-group">
              <span>Calories</span>
              <input type="number" id="trackerFoodCalories" min="0" step="10" placeholder="Calories" required>
            </label>
            <label class="field-group">
              <span>Date</span>
              <input type="date" id="trackerFoodDate" value="${selectedDateLabel}">
            </label>
          </div>
          <button type="submit">Log food entry</button>
        </form>
        <div class="calorie-summary">
          <div class="summary-pill"><strong>Goal</strong><span>${summary.goal ? `${summary.goal} kcal` : 'Not set'}</span></div>
          <div class="summary-pill"><strong>Food eaten</strong><span>${summary.foodCalories} kcal</span></div>
          <div class="summary-pill"><strong>Remaining</strong><span>${summary.goal ? `${summary.remaining ?? 0} kcal` : '—'}</span></div>
          <div class="summary-pill ${summary.status}"><strong>Status</strong><span>${summary.status === 'reached' ? 'Goal reached' : summary.status === 'over' ? `Over by ${summary.overBy} kcal` : summary.status === 'under' ? `Under by ${summary.remaining} kcal` : 'Set a goal to start tracking'}</span></div>
        </div>
        <ul class="food-list">
          ${selectedEntry.foodEntries.length ? selectedEntry.foodEntries.map((foodEntry) => `
            <li class="food-item">
              <div>
                <strong>${foodEntry.name}</strong>
                <small>${foodEntry.calories} calories</small>
              </div>
              <button class="secondary-button delete-entry" type="button" data-food-name="${foodEntry.name}" data-food-date="${foodEntry.date}">Remove</button>
            </li>
          `).join('') : '<li class="empty-state">No food logged for this day yet.</li>'}
        </ul>
      </article>
    </section>
  `;

  const bmiForm = root.querySelector('#bmiForm');
  const bmiOutput = root.querySelector('#bmiOutput');
  if (bmiForm && bmiOutput) {
    bmiForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const height = Number(root.querySelector('#bmiHeight').value);
      const weight = Number(root.querySelector('#bmiWeight').value);
      if (!height || !weight) {
        bmiOutput.innerHTML = '<span>Enter valid height and weight values.</span>';
        return;
      }
      const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
      let description = 'Healthy range';
      if (Number(bmi) < 18.5) description = 'Underweight';
      else if (Number(bmi) < 25) description = 'Healthy';
      else if (Number(bmi) < 30) description = 'Overweight';
      else description = 'Obese';
      bmiOutput.innerHTML = `<strong>${bmi}</strong><span>${description}</span>`;
    });
  }

  const trackerFoodDateInput = root.querySelector('#trackerFoodDate');
  if (trackerFoodDateInput) {
    trackerFoodDateInput.addEventListener('change', (event) => {
      saveSelectedDateLabel(event.target.value || getDateLabel());
      renderCalorieTrackerPage();
    });
  }

  const trackerFoodForm = root.querySelector('#trackerFoodForm');
  if (trackerFoodForm) {
    trackerFoodForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const nextState = loadHabitState();
      const entryDate = root.querySelector('#trackerFoodDate').value || getDateLabel();
      const entry = getCurrentDayEntry(nextState, entryDate);
      const foodName = root.querySelector('#trackerFoodName').value.trim();
      const foodCaloriesValue = root.querySelector('#trackerFoodCalories').value;

      if (!foodName || !foodCaloriesValue) return;

      entry.foodEntries.push({ name: foodName, calories: Number(foodCaloriesValue), date: entryDate });
      entry.foodCalories = entry.foodEntries.reduce((total, foodEntry) => total + Number(foodEntry.calories || 0), 0);
      nextState.days[entryDate.slice(-2)] = entry;
      saveSelectedDateLabel(entryDate);
      saveHabitState(nextState);
      renderCalorieTrackerPage();
    });
  }

  const deleteButtons = root.querySelectorAll('.delete-entry');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextState = loadHabitState();
      const entryDate = button.getAttribute('data-food-date') || getDateLabel();
      const entry = getCurrentDayEntry(nextState, entryDate);
      entry.foodEntries = entry.foodEntries.filter((foodEntry) => foodEntry.name !== button.getAttribute('data-food-name'));
      entry.foodCalories = entry.foodEntries.reduce((total, foodEntry) => total + Number(foodEntry.calories || 0), 0);
      nextState.days[entryDate.slice(-2)] = entry;
      saveSelectedDateLabel(entryDate);
      saveHabitState(nextState);
      renderCalorieTrackerPage();
    });
  });
}

function initHabitTracker() {
  const root = document.getElementById('habitTrackerRoot');
  const calorieRoot = document.getElementById('calorieTrackerRoot');
  if (root) {
    renderHabitTracker();
  } else if (calorieRoot) {
    renderCalorieTrackerPage();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', initHabitTracker);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateHabitProgress,
    getRankFromPercentage,
    calculateRecommendedCalories,
    calculateProgressSummary,
    getCalendarStatus
  };
}
