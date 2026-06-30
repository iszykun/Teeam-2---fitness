const assert = require('assert');
const { validateWorkoutData } = require('../frontend/src/workoutTrackerLogic');

const validGymWorkout = {
  exerciseName: 'Bench press',
  duration: '45',
  calories: '320',
  date: '2026-06-30',
  difficulty: 'Hard',
  generalNotes: 'Focused on strength',
  workoutType: 'Gym / Weightlifting',
  muscleGroup: 'Chest',
  description: '3 sets of 8 reps',
  sets: '3',
  reps: '8',
  weight: '60'
};

assert.strictEqual(validateWorkoutData(validGymWorkout), null);
assert.strictEqual(validateWorkoutData({ ...validGymWorkout, duration: '0' }), 'Duration must be a positive number.');
assert.strictEqual(validateWorkoutData({ ...validGymWorkout, workoutType: 'Running', distance: '0' }), 'Distance must be a positive number.');

console.log('workout tracker logic tests passed');
