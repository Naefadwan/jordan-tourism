const Accommodation = require('../models/accommodationModel');
const Room = require('../models/roomModel');
const Amenity = require('../models/amenityModel');
const Review = require('../models/reviewModel');

exports.getAllAccommodations = async (req, res) => {
    try {
        const { type, search } = req.query;
        const includePending = req.user && (req.user.role === 'admin' || req.user.role === 'company');
        const accommodations = await Accommodation.findAll({ type, search, includePending });

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
        const includePending = req.user && (req.user.role === 'admin' || req.user.role === 'company');
        const accommodation = await Accommodation.findById(id, { includePending });

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

exports.createAccommodation = async (req, res) => {
    try {
        const accommodationData = req.body;
        // Ensure price fields are numbers
        if (accommodationData.price) accommodationData.price = Math.max(0, parseFloat(accommodationData.price));
        if (accommodationData.from_price) accommodationData.from_price = Math.max(0, parseFloat(accommodationData.from_price));

        // If file was uploaded, add the image URL
        if (req.file) {
            accommodationData.main_image_url = `public/uploads/${req.file.filename}`;
        }

        // Force 'pending' for company users, allow 'approved' for admins
        if (req.user && req.user.role === 'admin') {
            accommodationData.approval_status = accommodationData.approval_status || 'approved';
        } else {
            accommodationData.approval_status = 'pending';
        }

        const newAccommodation = await Accommodation.create(accommodationData);
        res.status(201).json(newAccommodation);
    } catch (error) {
        console.error('Error creating accommodation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateAccommodation = async (req, res) => {
    try {
        const { id } = req.params;
        const accommodationData = req.body;

        // Ensure price fields are numbers
        if (accommodationData.price) accommodationData.price = Math.max(0, parseFloat(accommodationData.price));
        if (accommodationData.from_price) accommodationData.from_price = Math.max(0, parseFloat(accommodationData.from_price));

        // If file was uploaded, add the image URL
        if (req.file) {
            accommodationData.main_image_url = `public/uploads/${req.file.filename}`;
        }

        const updatedAccommodation = await Accommodation.update(id, accommodationData);
        if (!updatedAccommodation) {
            return res.status(404).json({ message: 'Accommodation not found' });
        }
        res.json(updatedAccommodation);
    } catch (error) {
        console.error('Error updating accommodation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAccommodation = async (req, res) => {
    try {
        const deletedAccommodation = await Accommodation.delete(req.params.id);
        if (!deletedAccommodation) {
            return res.status(404).json({ message: 'Accommodation not found' });
        }
        res.json({ message: 'Accommodation deleted successfully', accommodation: deletedAccommodation });
    } catch (error) {
        console.error('Error deleting accommodation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};