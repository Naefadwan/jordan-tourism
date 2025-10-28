const Attraction = require('../models/attractionModel');

exports.getAllAttractions = async (req, res) => {
    try {
        let attractions = await Attraction.findAll();

        // Filtering logic
        const { category, search } = req.query;

        if (category && category !== 'all') {
            attractions = attractions.filter(att => att.category === category);
        }

        if (search) {
            const searchTerm = search.toLowerCase();
            attractions = attractions.filter(att => 
                att.name.toLowerCase().includes(searchTerm) || 
                att.description.toLowerCase().includes(searchTerm)
            );
        }

        res.json(attractions);
    } catch (error) {
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