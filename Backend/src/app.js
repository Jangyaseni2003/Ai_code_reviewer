const express = require('express');
const aiRoutes = require('./routes/ai.routes');
const cors = require('cors');

const app = express();

// ✅ CORS configuration for development
app.use(cors({
    origin: [
        'http://localhost:3000',           // React dev server
        'http://127.0.0.1:3000',          // Alternative localhost
        'http://localhost:3001',           // Alternative React port
        'https://ai-powered-code-review-gold.vercel.app'  // Production frontend
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📝 Request body keys:`, Object.keys(req.body));
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'AI Code Reviewer Backend API',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/',
            review: '/ai/get-review'
        },
        cors: {
            allowedOrigins: [
                'http://localhost:3000',
                'http://127.0.0.1:3000'
            ]
        }
    });
});

// Preflight OPTIONS request handler
app.options('*', cors());

app.use('/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: ['/', '/ai/get-review']
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Global error handler:', err);
    console.error('❌ Request details:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

module.exports = app;