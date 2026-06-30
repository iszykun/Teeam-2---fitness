const WORKOUT_STORAGE_KEY = 'workout-tracker-records';
const WORKOUT_TYPES = ['Gym / Weightlifting', 'Running', 'Cycling', 'Swimming', 'Yoga / Stretching', 'Other'];
const LOGIC = window.WorkoutTrackerLogic;

function loadWorkouts() {
  try {
    const stored = window.localStorage.getItem(WORKOUT_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Unable to load workouts', error);
    return [];
  }
}

function saveWorkouts(workouts) {
  window.localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workouts));
}

function getWorkoutTypeFields(workoutType) {
  const shared = [
    { key: 'exerciseName', label: 'Exercise name', type: 'text' },
    { key: 'duration', label: 'Duration in minutes', type: 'number' },
    { key: 'calories', label: 'Calories burned', type: 'number' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'difficulty', label: 'Difficulty rating', type: 'select', options: ['Easy', 'Medium', 'Hard'] },
    { key: 'generalNotes', label: 'General notes', type: 'textarea' }
  ];

  const typeFields = {
    'Gym / Weightlifting': [
      { key: 'muscleGroup', label: 'Muscle group', type: 'select', options: ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'] },
      { key: 'description', label: 'Describe exercises, sets and reps done', type: 'textarea' },
      { key: 'sets', label: 'Sets', type: 'number' },
      { key: 'reps', label: 'Reps', type: 'number' },
      { key: 'weight', label: 'Weight in kg', type: 'number' }
    ],
    Running: [
      { key: 'distance', label: 'Distance in km', type: 'number' },
      { key: 'pace', label: 'Pace in min/km', type: 'text' },
      { key: 'heartRate', label: 'Heart rate in bpm', type: 'number' },
      { key: 'routeDescription', label: 'Route description', type: 'text' }
    ],
    Cycling: [
      { key: 'distance', label: 'Distance in km', type: 'number' },
      { key: 'averageSpeed', label: 'Average speed in km/h', type: 'number' },
      { key: 'elevationGain', label: 'Elevation gain in m', type: 'number' }
    ],
    Swimming: [
      { key: 'laps', label: 'Number of laps', type: 'number' },
      { key: 'poolLength', label: 'Pool length in m', type: 'number' },
      { key: 'strokeType', label: 'Stroke type', type: 'select', options: ['Freestyle', 'Breaststroke', 'Backstroke', 'Butterfly'] }
    ],
    'Yoga / Stretching': [
      { key: 'sessionType', label: 'Session type', type: 'select', options: ['Hatha', 'Vinyasa', 'Yin', 'Stretching'] },
      { key: 'yogaNotes', label: 'Notes / poses done', type: 'textarea' }
    ],
    Other: [
      { key: 'otherDescription', label: 'Free description', type: 'textarea' }
    ]
  };

  return [...shared, ...(typeFields[workoutType] || [])];
}

function createFieldMarkup(field, value) {
  if (field.type === 'textarea') {
    return `<label class="field-group"><span>${field.label}</span><textarea id="${field.key}" name="${field.key}">${value || ''}</textarea></label>`;
  }

  if (field.type === 'select') {
    return `<label class="field-group"><span>${field.label}</span><select id="${field.key}" name="${field.key}">${field.options.map((option) => `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`).join('')}</select></label>`;
  }

  return `<label class="field-group"><span>${field.label}</span><input id="${field.key}" name="${field.key}" type="${field.type}" value="${value ?? ''}"></label>`;
}

function getCurrentFormValues() {
  const form = document.getElementById('workoutForm');
  if (!form) return null;
  const values = {};
  form.querySelectorAll('[name]').forEach((field) => {
    values[field.name] = field.value;
  });
  return values;
}

function renderWorkoutTracker() {
  const root = document.getElementById('workoutTrackerRoot');
  if (!root) return;

  const workouts = loadWorkouts();
  const currentValues = getCurrentFormValues();
  const selectedType = currentValues?.workoutType || 'Gym / Weightlifting';
  const formData = {
    ...(LOGIC.getDefaultWorkoutFormData()),
    ...(currentValues || {})
  };
  const filter = window.localStorage.getItem('workout-filter') || 'All';
  const filteredWorkouts = filter === 'All' ? workouts : workouts.filter((entry) => entry.workoutType === filter);

  root.innerHTML = `
    <section class="grid">
      <div class="card span-7">
        <div class="tracker-header">
          <div>
            <p class="eyebrow">Workout form</p>
            <h2>Record a new session</h2>
            <p>Capture key details for each workout and keep your history organised.</p>
          </div>
        </div>
        <div id="workoutMessage" class="form-message" aria-live="polite"></div>
        <form id="workoutForm" class="form-stack compact">
          <label class="field-group">
            <span>Workout type</span>
            <select id="workoutType" name="workoutType">
              ${WORKOUT_TYPES.map((type) => `<option value="${type}" ${selectedType === type ? 'selected' : ''}>${type}</option>`).join('')}
            </select>
          </label>
          <div class="field-grid">
            ${getWorkoutTypeFields(selectedType).map((field) => createFieldMarkup(field, formData[field.key] || '')).join('')}
          </div>
          <div class="field-grid">
            <button type="submit">Save workout</button>
            <button type="button" class="secondary-button" id="resetWorkoutForm">Reset form</button>
          </div>
        </form>
      </div>
      <div class="card span-5">
        <div class="tracker-header">
          <div>
            <p class="eyebrow">Workout history</p>
            <h2>Recent sessions</h2>
            <p>Review and edit previous workouts instantly.</p>
          </div>
        </div>
        <label class="field-group">
          <span>Filter by workout type</span>
          <select id="workoutFilter">
            <option value="All" ${filter === 'All' ? 'selected' : ''}>All</option>
            ${WORKOUT_TYPES.map((type) => `<option value="${type}" ${filter === type ? 'selected' : ''}>${type}</option>`).join('')}
          </select>
        </label>
        <div class="history-list">
          ${filteredWorkouts.length ? filteredWorkouts.map((workout) => `
            <article class="history-card">
              <div class="history-card-header">
                <strong>${workout.exerciseName}</strong>
                <span>${workout.workoutType}</span>
              </div>
              <p><strong>Duration:</strong> ${workout.duration} min</p>
              <p><strong>Calories:</strong> ${workout.calories}</p>
              <p><strong>Date:</strong> ${workout.date}</p>
              <div class="history-details">
                ${renderWorkoutDetails(workout)}
              </div>
              <div class="row-actions">
                <button type="button" class="secondary-button" data-edit-id="${workout.id}">Edit</button>
                <button type="button" class="danger-button" data-delete-id="${workout.id}">Delete</button>
              </div>
            </article>
          `).join('') : '<p class="empty-state">No workouts saved yet. Add your first session to get started.</p>'}
        </div>
      </div>
    </section>
  `;

  bindWorkoutEvents(root);
}

function renderWorkoutDetails(workout) {
  const details = [];
  switch (workout.workoutType) {
    case 'Gym / Weightlifting':
      details.push(`<p><strong>Muscle group:</strong> ${workout.muscleGroup}</p>`, `<p><strong>Sets / reps:</strong> ${workout.sets} / ${workout.reps}</p>`, `<p><strong>Weight:</strong> ${workout.weight} kg</p>`, `<p><strong>Description:</strong> ${workout.description}</p>`);
      break;
    case 'Running':
      details.push(`<p><strong>Distance:</strong> ${workout.distance} km</p>`, `<p><strong>Pace:</strong> ${workout.pace}</p>`, `<p><strong>Heart rate:</strong> ${workout.heartRate} bpm</p>`, `<p><strong>Route:</strong> ${workout.routeDescription}</p>`);
      break;
    case 'Cycling':
      details.push(`<p><strong>Distance:</strong> ${workout.distance} km</p>`, `<p><strong>Avg speed:</strong> ${workout.averageSpeed} km/h</p>`, `<p><strong>Elevation:</strong> ${workout.elevationGain} m</p>`);
      break;
    case 'Swimming':
      details.push(`<p><strong>Laps:</strong> ${workout.laps}</p>`, `<p><strong>Pool length:</strong> ${workout.poolLength} m</p>`, `<p><strong>Stroke:</strong> ${workout.strokeType}</p>`);
      break;
    case 'Yoga / Stretching':
      details.push(`<p><strong>Session:</strong> ${workout.sessionType}</p>`, `<p><strong>Notes:</strong> ${workout.yogaNotes}</p>`);
      break;
    case 'Other':
      details.push(`<p><strong>Description:</strong> ${workout.otherDescription}</p>`);
      break;
    default:
      break;
  }
  return details.join('');
}

function bindWorkoutEvents(root) {
  const form = root.querySelector('#workoutForm');
  const workoutTypeSelect = root.querySelector('#workoutType');
  const filterSelect = root.querySelector('#workoutFilter');
  const resetButton = root.querySelector('#resetWorkoutForm');

  if (workoutTypeSelect) {
    workoutTypeSelect.addEventListener('change', () => {
      renderWorkoutTracker();
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', (event) => {
      window.localStorage.setItem('workout-filter', event.target.value);
      renderWorkoutTracker();
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      window.localStorage.removeItem('workout-edit-id');
      renderWorkoutTracker();
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const workoutId = window.localStorage.getItem('workout-edit-id');
      const existingWorkouts = loadWorkouts();
      const validationError = LOGIC.validateWorkoutData(payload);

      if (validationError) {
        setWorkoutMessage(validationError, 'error');
        return;
      }

      const normalizedWorkout = {
        id: workoutId || `${Date.now()}`,
        workoutType: payload.workoutType,
        exerciseName: payload.exerciseName.trim(),
        duration: payload.duration,
        calories: payload.calories,
        date: payload.date,
        difficulty: payload.difficulty,
        generalNotes: payload.generalNotes.trim(),
        muscleGroup: payload.muscleGroup || '',
        description: payload.description || '',
        sets: payload.sets || '',
        reps: payload.reps || '',
        weight: payload.weight || '',
        distance: payload.distance || '',
        pace: payload.pace || '',
        heartRate: payload.heartRate || '',
        routeDescription: payload.routeDescription || '',
        averageSpeed: payload.averageSpeed || '',
        elevationGain: payload.elevationGain || '',
        laps: payload.laps || '',
        poolLength: payload.poolLength || '',
        strokeType: payload.strokeType || '',
        sessionType: payload.sessionType || '',
        yogaNotes: payload.yogaNotes || '',
        otherDescription: payload.otherDescription || ''
      };

      const nextWorkouts = workoutId
        ? existingWorkouts.map((entry) => (entry.id === workoutId ? normalizedWorkout : entry))
        : [normalizedWorkout, ...existingWorkouts];

      saveWorkouts(nextWorkouts);
      window.localStorage.removeItem('workout-edit-id');
      setWorkoutMessage('Workout saved successfully.', 'success');
      renderWorkoutTracker();
    });
  }

  const editButtons = root.querySelectorAll('[data-edit-id]');
  editButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const workoutId = button.getAttribute('data-edit-id');
      const workouts = loadWorkouts();
      const workout = workouts.find((entry) => entry.id === workoutId);
      if (!workout) return;

      window.localStorage.setItem('workout-edit-id', workoutId);
      window.localStorage.setItem('workout-edit-form', JSON.stringify(workout));
      renderWorkoutTracker();
      fillFormWithWorkout(workout);
    });
  });

  const deleteButtons = root.querySelectorAll('[data-delete-id]');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const workoutId = button.getAttribute('data-delete-id');
      const nextWorkouts = loadWorkouts().filter((entry) => entry.id !== workoutId);
      saveWorkouts(nextWorkouts);
      renderWorkoutTracker();
    });
  });

  const editForm = window.localStorage.getItem('workout-edit-form');
  if (editForm) {
    const workout = JSON.parse(editForm);
    fillFormWithWorkout(workout);
    window.localStorage.removeItem('workout-edit-form');
  }
}

function fillFormWithWorkout(workout) {
  const form = document.getElementById('workoutForm');
  if (!form) return;

  Object.entries(workout).forEach(([key, value]) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.tagName === 'TEXTAREA') {
        input.value = value || '';
      } else if (input.tagName === 'SELECT') {
        input.value = value || '';
      } else {
        input.value = value || '';
      }
    }
  });

  const workoutTypeSelect = document.getElementById('workoutType');
  if (workoutTypeSelect) {
    workoutTypeSelect.value = workout.workoutType || 'Gym / Weightlifting';
  }
}

function setWorkoutMessage(message, type = 'error') {
  const element = document.getElementById('workoutMessage');
  if (!element) return;
  element.textContent = message || '';
  element.className = `form-message ${type}`;
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    renderWorkoutTracker();
  });
}
