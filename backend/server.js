// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Allow all origins for development
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Basic Route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Discover Jordan API!' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const configController = require('./controllers/configController');
// This route does not need to be in a separate file as it's very simple
app.get('/api/config', configController.getConfig);

const attractionsRoutes = require('./routes/attractionsRoutes');
app.use('/api/attractions', attractionsRoutes);

// Accommodations routes
const accommodationsRoutes = require('./routes/accommodationsRoutes');
app.use('/api/accommodations', accommodationsRoutes);

// Likes routes
const likesRoutes = require('./routes/likesRoutes');
app.use('/api/likes', likesRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Bookings routes
const bookingsRoutes = require('./routes/bookingsRoutes');
app.use('/api/bookings', bookingsRoutes);

// Payments routes
const paymentsRoutes = require('./routes/paymentsRoutes');
app.use('/api/payments', paymentsRoutes);
const packageRoutes = require('./routes/packageRoutes');
app.use('/api/packages', packageRoutes);
const packageBookingsRoutes = require('./routes/packageBookingsRoutes');

app.use('/api/package-bookings', packageBookingsRoutes);

const attractionBookingsRoutes = require('./routes/attractionBookingsRoutes');
app.use('/api/attraction-bookings', attractionBookingsRoutes);

const roomsRoutes = require('./routes/roomsRoutes');
app.use('/api/rooms', roomsRoutes);

// Other routes will go here as they are implemented

const PORT = process.env.PORT || 5000;
// Global error handler (last middleware)
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    const response = { message: err.message || 'Server error' };
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    res.status(status).json(response);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));