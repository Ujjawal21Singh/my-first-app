require('dotenv').config();  // Load environment variables

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db'); // DB Connection
const userRoutes = require('./src/routes/userRoutes');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML page on the home route "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
