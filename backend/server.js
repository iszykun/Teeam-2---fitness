const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const { requireSession } = require('./middleware/helpers');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'rp-fitness-dev-secret';
const frontendRoot = path.join(__dirname, '..', 'frontend');
const pagesRoot = path.join(frontendRoot, 'pages');
const redirectToNutrition = (req, res) => res.redirect('/pages/NutritionTracker.html');

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 4 }
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', redirectToNutrition);
app.get('/login.html', redirectToNutrition);
app.get('/signup.html', redirectToNutrition);
app.get('/dashboard.html', redirectToNutrition);
app.get('/admin.html', redirectToNutrition);
app.get('/DailyHabits.html', redirectToNutrition);
app.get('/CalorieTracker.html', redirectToNutrition);
app.get('/pages/login.html', redirectToNutrition);
app.get('/pages/signup.html', redirectToNutrition);
app.get('/pages/dashboard.html', redirectToNutrition);
app.get('/pages/admin.html', redirectToNutrition);
app.get('/pages/DailyHabits.html', redirectToNutrition);
app.get('/pages/CalorieTracker.html', redirectToNutrition);
app.get('/pages/NutritionTracker.html', (req, res) => res.sendFile(path.join(pagesRoot, 'NutritionTracker.html')));

app.use(express.static(frontendRoot));

app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.get('/check-session', authController.checkSession);
app.get('/logout', authController.logout);
app.get('/get-users', adminController.getUsers);
app.post('/delete-user', adminController.deleteUser);
app.post('/user-overview', adminController.userOverview);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`RP Fitness running at http://localhost:${PORT}/pages/NutritionTracker.html`);
});
