require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
// Elastic Beanstalk uses the PORT environment variable
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || "v1";

// ROUTE IMPORTS
const repairRoutes = require("./routes/repair/index.js");

// CORS Configuration - Updated for cloud deployment
const allowedOrigins = [
  'http://localhost:3000', // Local development
  process.env.FRONTEND_URL, // Your Amplify URL
  // Add your Amplify URL here as backup
  'https://your-app-name.amplifyapp.com'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Body parser middleware
app.use(express.json());

// Health Check Route - Important for Elastic Beanstalk
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Repair Shop API is running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get("/healthcheck", (req, res) => {
  res.status(200).send("ok");
});

// API Routes
app.use(`/api/${API_VERSION}/repairs`, repairRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api/${API_VERSION}/repairs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});