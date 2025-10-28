// This is a temporary, in-memory data store for reviews.
// In a real application, this would interact with your PostgreSQL database.

const reviewsData = [
    { id: 1, item_id: 'movenpick-petra', item_type: 'accommodation', user_id: 1, rating: 5, review_text: 'Absolutely breathtaking location right at the entrance of Petra. The service was impeccable and the rooftop bar has the most amazing sunset views. Highly recommend!', user_name: 'Jane Doe' },
    { id: 2, item_id: 'movenpick-petra', item_type: 'accommodation', user_id: 2, rating: 4, review_text: 'Great hotel, very convenient for visiting Petra. The rooms were clean and comfortable. The food was a bit pricey, but the quality was good.', user_name: 'John Smith' },
    { id: 3, item_id: 'petra', item_type: 'attraction', user_id: 1, rating: 5, review_text: 'Petra is truly a wonder of the world. Unforgettable experience!', user_name: 'Jane Doe' },
    { id: 4, item_id: 'wadi-rum', item_type: 'attraction', user_id: 2, rating: 5, review_text: 'Wadi Rum desert safari was incredible. Highly recommend the overnight stay.', user_name: 'John Smith' },
    // Add more sample reviews as needed
];

const Review = {
    findByItemIdAndType: async (itemId, itemType) => {
        return reviewsData.filter(review => review.item_id === itemId && review.item_type === itemType)
            .map(review => ({
                id: review.id,
                userId: review.user_id,
                userName: review.user_name,
                rating: review.rating,
                reviewText: review.review_text,
                createdAt: review.created_at || new Date().toISOString()
            }));
    },
    // In a real app, you'd have methods for create, update, delete reviews
};

module.exports = Review;