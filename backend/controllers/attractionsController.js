const Attraction = require('../models/attractionModel');

exports.getAllAttractions = async (req, res) => {
    try {
        // Pass query params directly to the model for server-side filtering
        const { category, search } = req.query;
        const attractions = await Attraction.findAll({ category, search });
        res.json(attractions);
    } catch (error) {
        console.error('Error fetching attractions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAttractionById = async (req, res) => {
    try {
        const { id } = req.params;
        const attraction = await Attraction.findById(id);

        if (!attraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        res.json(attraction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};