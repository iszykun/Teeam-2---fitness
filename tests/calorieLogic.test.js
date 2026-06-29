const assert = require('assert');
const { calculateRecommendedCalories, calculateProgressSummary, getCalendarStatus } = require('../frontend/src/habitTracker');

const summary = calculateProgressSummary({ goal: 2000, foodCalories: 1600 });
assert.strictEqual(summary.remaining, 400);
assert.strictEqual(summary.status, 'under');

const recommended = calculateRecommendedCalories({ age: 20, gender: 'female', height: 165, weight: 60, exerciseLevel: 'Exercise regularly' });
assert.strictEqual(recommended, 2090);

const calendarStatus = getCalendarStatus({ goal: 2000, foodCalories: 2200 });
assert.strictEqual(calendarStatus, 'red');

console.log('calorie logic tests passed');
