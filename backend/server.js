const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const menuRoutes = require('./routes/menuRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Optional request logging
try {
  const morgan = require('morgan');
  app.use(morgan('dev'));
} catch (e) {
  // Morgan is optional
}

// Serve Frontend static assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'College Mess Management System API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/announcements', announcementRoutes);

// Fallback for root / to frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP Server
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection warning:', error.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  COLLEGE MESS MANAGEMENT SYSTEM - SERVER STARTED`);
    console.log(`  Port: http://localhost:${PORT}`);
    console.log(`  Frontend: http://localhost:${PORT}`);
    console.log(`  API Health: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
