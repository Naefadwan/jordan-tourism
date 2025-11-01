// Load environment variables from .env file
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500' // Or your frontend's local dev address
}));
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Basic Route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Discover Jordan API!' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const attractionsRoutes = require('./routes/attractionsRoutes');
app.use('/api/attractions', attractionsRoutes);

// Accommodations routes
const accommodationsRoutes = require('./routes/accommodationsRoutes');
app.use('/api/accommodations', accommodationsRoutes);

// Likes routes
const likesRoutes = require('./routes/likesRoutes');
app.use('/api/likes', likesRoutes);

// Other routes will go here as they are implemented

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
