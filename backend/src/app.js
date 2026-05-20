const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const logger = require('./utils/logger');
const errorHandler = require('./middleware/error_handler');

// Import routes
const authRoutes = require('./routes/auth_routes');
const uploadRoutes = require('./routes/upload_routes');
const analyzeRoutes = require('./routes/analyze_routes');
const agentsRoutes = require('./routes/agents_routes');
const actionsRoutes = require('./routes/actions_routes');
const logsRoutes = require('./routes/logs_routes');
const dashboardRoutes = require('./routes/dashboard_routes');
const weatherRoutes = require('./routes/weather_routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Bind routes
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/analyze', analyzeRoutes);
app.use('/agents', agentsRoutes);
app.use('/actions', actionsRoutes);
app.use('/logs', logsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/weather', weatherRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AgroGuard AI Backend is healthy.' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`AgroGuard AI server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = app;
