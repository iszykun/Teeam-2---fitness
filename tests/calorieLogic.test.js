const assert = require('assert');
const {
  calculateRecommendedCalories,
  calculateProgressSummary,
  getCalendarStatus,
  calculateNutritionTotals,
  calculateNutritionProgress,
  createNutritionState,
  normalizeNutritionEntries
} = require('../frontend/src/habitTracker');

const summary = calculateProgressSummary({ goal: 2000, foodCalories: 1600 });
assert.strictEqual(summary.remaining, 400);
assert.strictEqual(summary.status, 'under');

const recommended = calculateRecommendedCalories({ age: 20, gender: 'female', height: 165, weight: 60, exerciseLevel: 'Exercise regularly' });
assert.strictEqual(recommended, 2090);

const calendarStatus = getCalendarStatus({ goal: 2000, foodCalories: 2200 });
assert.strictEqual(calendarStatus, 'red');

const totals = calculateNutritionTotals([
  { name: 'Chicken', calories: 250, protein: 30, carbs: 10, fat: 8 },
  { name: 'Rice', calories: 200, protein: 4, carbs: 45, fat: 1 }
]);
assert.strictEqual(totals.calories, 450);
assert.strictEqual(totals.protein, 34);
assert.strictEqual(totals.carbs, 55);
assert.strictEqual(totals.fat, 9);

const progress = calculateNutritionProgress(totals, { calories: 500, protein: 40, carbs: 60, fat: 15 });
assert.strictEqual(progress.calories.percent, 90);
assert.strictEqual(progress.protein.percent, 85);
assert.strictEqual(progress.carbs.percent, 92);
assert.strictEqual(progress.fat.percent, 60);

const state = createNutritionState('2026-06-30');
assert.deepStrictEqual(state.goals, { calories: 0, protein: 0, carbs: 0, fat: 0 });
assert.deepStrictEqual(state.entries, []);

const normalized = normalizeNutritionEntries([{ name: 'Toast', calories: '120', protein: '3', carbs: '22', fat: '2' }]);
assert.strictEqual(normalized[0].calories, 120);
assert.strictEqual(normalized[0].protein, 3);

console.log('calorie logic tests passed');
