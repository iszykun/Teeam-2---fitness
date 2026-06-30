const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

const facilitiesRoutes = require('./routes/facilities');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'rp-fitness-dev-secret';
const frontendRoot = path.join(__dirname, '..', 'frontend');
const pagesRoot = path.join(frontendRoot, 'pages');

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 4 }
}));

app.use('/api/facilities', facilitiesRoutes);

app.use(express.static(frontendRoot));
app.get('/', (req, res) => res.sendFile(path.join(pagesRoot, 'gymFinder.html')));

app.get('/gymFinder.html', (req, res) => res.sendFile(path.join(pagesRoot, 'gymFinder.html')));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`RP Fitness running at http://localhost:${PORT}/`);
});
