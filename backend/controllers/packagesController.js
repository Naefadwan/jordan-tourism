const Package = require('../models/packageModel');

exports.getAllPackages = async (req, res) => {
    try {
        const packages = await Package.findAll();

        const decorated = packages.map(pkg => ({
            id: pkg.id,
            slug: pkg.slug,
            name: pkg.name,
            description: pkg.description,
            image: pkg.image_url || pkg.accommodation_image,
            fromPrice: parseFloat(pkg.from_price),
            nights: pkg.nights,
            originCity: pkg.origin_city,
            destinationCity: pkg.destination_city,
            includesFlights: pkg.includes_flights,
            accommodationName: pkg.accommodation_name
        }));

        res.json(decorated);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPackageById = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const attractions = await Package.findAttractionsForPackage(pkg.id);

        res.json({
            id: pkg.id,
            slug: pkg.slug,
            name: pkg.name,
            description: pkg.description,
            image: pkg.image_url || pkg.accommodation_image,
            fromPrice: parseFloat(pkg.from_price),
            nights: pkg.nights,
            originCity: pkg.origin_city,
            originAirport: pkg.origin_airport,
            destinationCity: pkg.destination_city,
            includesFlights: pkg.includes_flights,
            flightDetails: pkg.flight_details,
            accommodation: {
                id: pkg.accommodation_id,
                name: pkg.accommodation_name,
                image: pkg.accommodation_image
            },
            attractions: attractions.map(row => ({
                id: row.id,
                name: row.name,
                day: row.day_number,
                category: row.category,
                location: row.location,
                duration: row.duration,
                image: row.image_url
            }))
        });
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createPackage = async (req, res) => {
    try {
        const packageData = req.body;
        // If file was uploaded, add the image URL
        if (req.file) {
            packageData.image_url = `public/uploads/${req.file.filename}`;
        }
        const newPackage = await Package.create(packageData);
        res.status(201).json(newPackage);
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deletePackage = async (req, res) => {
    try {
        const deletedPackage = await Package.delete(req.params.id);
        if (!deletedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json({ message: 'Package deleted successfully', package: deletedPackage });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
