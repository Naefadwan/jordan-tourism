const Accommodation = require('../models/accommodationModel');
const Room = require('../models/roomModel');
const Amenity = require('../models/amenityModel');
const Review = require('../models/reviewModel');

exports.getAllAccommodations = async (req, res) => {
    try {
        const accommodations = await Accommodation.findAll();
        // In a real app, you might want to add pagination or more filters here
        res.json(accommodations.map(acc => ({
            ...acc,
            // Simulate rating and reviews count for list view
            rating: 4.5 + Math.random() * 0.4, // Random rating between 4.5 and 4.9
            reviewsCount: Math.floor(500 + Math.random() * 1500) // Random reviews between 500 and 2000
        })));
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