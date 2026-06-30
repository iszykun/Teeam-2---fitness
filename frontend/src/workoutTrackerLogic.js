(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.WorkoutTrackerLogic = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getDefaultWorkoutFormData() {
    return {
      workoutType: 'Gym / Weightlifting',
      exerciseName: '',
      duration: '',
      calories: '',
      date: getTodayDate(),
      difficulty: 'Medium',
      generalNotes: '',
      muscleGroup: 'Chest',
      description: '',
      sets: '',
      reps: '',
      weight: '',
      distance: '',
      pace: '',
      heartRate: '',
      routeDescription: '',
      averageSpeed: '',
      elevationGain: '',
      laps: '',
      poolLength: '',
      strokeType: 'Freestyle',
      sessionType: 'Hatha',
      yogaNotes: '',
      otherDescription: ''
    };
  }

  function validateWorkoutData(data) {
    if (!data.exerciseName || !data.exerciseName.trim()) {
      return 'Exercise name is required.';
    }

    if (!data.duration || Number(data.duration) <= 0) {
      return 'Duration must be a positive number.';
    }

    if (!data.calories || Number(data.calories) <= 0) {
      return 'Calories burned must be a positive number.';
    }

    if (!data.date) {
      return 'Please select a workout date.';
    }

    if (!data.difficulty) {
      return 'Please select a difficulty rating.';
    }

    if (!data.generalNotes || !data.generalNotes.trim()) {
      return 'General notes are required.';
    }

    switch (data.workoutType) {
      case 'Gym / Weightlifting':
        if (!data.muscleGroup) return 'Muscle group is required.';
        if (!data.description || !data.description.trim()) return 'Description is required for gym workouts.';
        if (!data.sets || Number(data.sets) <= 0) return 'Sets must be a positive number.';
        if (!data.reps || Number(data.reps) <= 0) return 'Reps must be a positive number.';
        if (!data.weight || Number(data.weight) <= 0) return 'Weight must be a positive number.';
        break;
      case 'Running':
        if (!data.distance || Number(data.distance) <= 0) return 'Distance must be a positive number.';
        if (!data.pace || !data.pace.trim()) return 'Pace is required.';
        if (!data.heartRate || Number(data.heartRate) <= 0) return 'Heart rate must be a positive number.';
        if (!data.routeDescription || !data.routeDescription.trim()) return 'Route description is required.';
        break;
      case 'Cycling':
        if (!data.distance || Number(data.distance) <= 0) return 'Distance must be a positive number.';
        if (!data.averageSpeed || Number(data.averageSpeed) <= 0) return 'Average speed must be a positive number.';
        if (!data.elevationGain || Number(data.elevationGain) <= 0) return 'Elevation gain must be a positive number.';
        break;
      case 'Swimming':
        if (!data.laps || Number(data.laps) <= 0) return 'Number of laps must be a positive number.';
        if (!data.poolLength || Number(data.poolLength) <= 0) return 'Pool length must be a positive number.';
        if (!data.strokeType) return 'Stroke type is required.';
        break;
      case 'Yoga / Stretching':
        if (!data.sessionType) return 'Session type is required.';
        if (!data.yogaNotes || !data.yogaNotes.trim()) return 'Yoga notes are required.';
        break;
      case 'Other':
        if (!data.otherDescription || !data.otherDescription.trim()) return 'A free description is required.';
        break;
      default:
        break;
    }

    return null;
  }

  return {
    getDefaultWorkoutFormData,
    validateWorkoutData
  };
}));
