// This is a simplified model. In a real application, amenities would be stored in a database
// and linked to accommodations via a join table (e.g., accommodation_amenities).

const allAmenities = {
    'movenpick-petra': [
        { icon: '🏊', name: 'Pool' }, { icon: '📶', name: 'Free WiFi' },
        { icon: '🍽️', name: 'Restaurant' }, { icon: '☕', name: 'Coffee Shop' },
        { icon: '🏋️', name: 'Fitness Center' }, { icon: '🚗', name: 'Free Parking' },
        { icon: '🛎️', name: '24-hour Front Desk' }, { icon: '♿', name: 'Accessible' }
    ],
    'kempinski-dead-sea': [
        { icon: '🏊', name: 'Pool' }, { icon: '🧖', name: 'Spa' },
        { icon: '🍽️', name: 'Restaurant' }, { icon: '🚗', name: 'Parking' }
    ],
    // Add more amenities for other accommodations as needed
};

const Amenity = {
    findByAccommodationId: async (accommodationId) => {
        return allAmenities[accommodationId] || [];
    }
};

module.exports = Amenity;