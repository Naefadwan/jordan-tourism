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
            has_ticket: pkg.has_ticket,
            ticket_price: pkg.ticket_price,
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
        if (req.file) {
            packageData.image_url = `public/uploads/${req.file.filename}`;
        }
        // Handle new ticket fields
        if (packageData.has_ticket) {
            packageData.has_ticket = packageData.has_ticket === 'true' || packageData.has_ticket === true || packageData.has_ticket === 'on';
        }
        if (packageData.ticket_price) packageData.ticket_price = parseFloat(packageData.ticket_price);

        if (!packageData.slug && packageData.name) {
            packageData.slug = packageData.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        const newPackage = await Package.create(packageData);
        res.status(201).json(newPackage);
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const packageData = req.body;
        if (req.file) {
            packageData.image_url = `public/uploads/${req.file.filename}`;
        }
        // Handle new ticket fields
        if (packageData.has_ticket) {
            packageData.has_ticket = packageData.has_ticket === 'true' || packageData.has_ticket === true || packageData.has_ticket === 'on';
        }
        if (packageData.ticket_price) packageData.ticket_price = parseFloat(packageData.ticket_price);

        if (!packageData.slug && packageData.name) {
            packageData.slug = packageData.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        const updatedPackage = await Package.update(id, packageData);
        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json(updatedPackage);
    } catch (error) {
        console.error('Error updating package:', error);
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
