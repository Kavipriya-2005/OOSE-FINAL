const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/application', require('./routes/application'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/track', require('./routes/tracking'));
app.use('/api/admin', require('./routes/admin'));   // ← ADD THIS LINE

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index1.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});