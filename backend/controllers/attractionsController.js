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

exports.createAttraction = async (req, res) => {
    try {
        const attractionData = req.body;
        // If file was uploaded, add the image URL
        if (req.file) {
            attractionData.image_url = `public/uploads/${req.file.filename}`;
        }
        const newAttraction = await Attraction.create(attractionData);
        res.status(201).json(newAttraction);
    } catch (error) {
        console.error('Error creating attraction:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateAttraction = async (req, res) => {
    try {
        const { id } = req.params;
        const attractionData = req.body;
        if (req.file) {
            attractionData.image_url = `public/uploads/${req.file.filename}`;
        }
        const updatedAttraction = await Attraction.update(id, attractionData);
        if (!updatedAttraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        res.json(updatedAttraction);
    } catch (error) {
        console.error('Error updating attraction:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAttraction = async (req, res) => {
    try {
        const deletedAttraction = await Attraction.delete(req.params.id);
        if (!deletedAttraction) {
            return res.status(404).json({ message: 'Attraction not found' });
        }
        res.json({ message: 'Attraction deleted successfully', attraction: deletedAttraction });
    } catch (error) {
        console.error('Error deleting attraction:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};