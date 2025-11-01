const Accommodation = require('../models/accommodationModel');
const Room = require('../models/roomModel');
const Amenity = require('../models/amenityModel');
const Review = require('../models/reviewModel');

exports.getAllAccommodations = async (req, res) => {
    try {
        const { type, search } = req.query;
        const accommodations = await Accommodation.findAll({ type, search });

        // You can enhance this later to pull real ratings from your reviews table
        const accommodationsWithRatings = accommodations.map(acc => ({
            ...acc,
            rating: 4.5 + Math.random() * 0.4,
            reviewsCount: Math.floor(300 + Math.random() * 1200)
        }));
        res.json(accommodationsWithRatings);
    } catch (error) {
        console.error('Error fetching accommodations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAccommodationById = async (req, res) => {
    try {
        const { id } = req.params;
        const accommodation = await Accommodation.findById(id);

        if (!accommodation) {
            return res.status(404).json({ message: 'Accommodation not found' });
        }

        // Fetch related data
        const rooms = await Room.findByAccommodationId(id);
        const amenities = await Amenity.findByAccommodationId(id); // Using simulated data for now
        const reviews = await Review.findByItemIdAndType(id, 'accommodation');

        res.json({ ...accommodation, rooms, amenities, reviews });
    } catch (error) {
        console.error(`Error fetching accommodation ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};