require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const imageRoutes = require('./routes/images');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/images', imageRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Clean URLs for the two pages
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[Sazzad Sir Note] Connected to MongoDB');
    app.listen(PORT, () => console.log(`[Sazzad Sir Note] Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('[Sazzad Sir Note] MongoDB connection failed:', err.message);
    process.exit(1);
  });
