document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';
    const mainImage = document.getElementById('mainImage');
    const galleryThumbnails = document.getElementById('galleryThumbnails');
    const checkAvailabilityBtn = document.getElementById('checkAvailabilityBtn');

    const accommodationNameElem = document.getElementById('accommodationName');
    const accommodationRatingElem = document.querySelector('.detail-rating span');
    const accommodationLocationElem = document.getElementById('accommodationLocation');
    const accommodationDescriptionElem = document.getElementById('accommodationDescription');
    const amenitiesGrid = document.getElementById('amenitiesGrid');
    const reviewsContainer = document.getElementById('reviewsContainer');
    const noReviewsMessage = document.getElementById('noReviewsMessage');
    const showAllReviewsBtn = document.getElementById('showAllReviewsBtn');
    const roomTypesGrid = document.getElementById('roomTypesGrid');
    const noRoomTypesMessage = document.getElementById('noRoomTypesMessage');
    const bookingPriceDisplay = document.getElementById('bookingPriceDisplay');
    const summaryPriceCalc = document.getElementById('summaryPriceCalc');
    const summaryBasePrice = document.getElementById('summaryBasePrice');
    const summaryFees = document.getElementById('summaryFees');
    const summaryTotalPrice = document.getElementById('summaryTotalPrice');
    const bookingSummary = document.getElementById('bookingSummary');

    let currentAccommodation = null;

    async function fetchAccommodationDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const accommodationId = urlParams.get('id');

        if (!accommodationId) {
            console.error('No accommodation ID found in URL.');
            // Redirect or show an error message
            return;
        }

        try {
            const response = await fetch(`${API_URL}/accommodations/${accommodationId}`);
            if (!response.ok) throw new Error('Failed to fetch accommodation details');
            const data = await response.json();
            currentAccommodation = data;
            renderAccommodationDetails(data);
        } catch (error) {
            console.error('Error fetching accommodation details:', error);
            // Display error on page
        }
    }

    function renderAccommodationDetails(accommodation) {
        document.title = `${accommodation.name} - Discover Jordan`;
        accommodationNameElem.textContent = accommodation.name;
        accommodationRatingElem.textContent = `${accommodation.rating} (${accommodation.reviews.length} reviews)`;
        accommodationLocationElem.textContent = accommodation.location;
        accommodationDescriptionElem.innerHTML = `<p>${accommodation.description}</p>`;
        bookingPriceDisplay.querySelector('.price-amount').textContent = `From $${accommodation.rooms[0]?.pricePerNight || 0}`;

        // Gallery
        mainImage.src = accommodation.mainImage;
        galleryThumbnails.innerHTML = '';
        // For now, using mainImage as the only thumbnail. In a real app, you'd have multiple images.
        const mainThumbnail = document.createElement('img');
        mainThumbnail.className = 'thumbnail active';
        mainThumbnail.src = accommodation.mainImage;
        mainThumbnail.alt = accommodation.name;
        galleryThumbnails.appendChild(mainThumbnail);

        // Amenities
        amenitiesGrid.innerHTML = '';
        if (accommodation.amenities && accommodation.amenities.length > 0) {
            accommodation.amenities.forEach(amenity => {
                const amenityItem = document.createElement('div');
                amenityItem.className = 'amenity-item';
                amenityItem.innerHTML = `<span>${amenity.icon}</span> ${amenity.name}`;
                amenitiesGrid.appendChild(amenityItem);
            });
        } else {
            amenitiesGrid.innerHTML = '<p>No amenities listed.</p>';
        }

        // Reviews
        reviewsContainer.innerHTML = '';
        if (accommodation.reviews && accommodation.reviews.length > 0) {
            accommodation.reviews.slice(0, 2).forEach(review => { // Show first 2 reviews
                const reviewCard = document.createElement('div');
                reviewCard.className = 'review-card';
                reviewCard.innerHTML = `
                    <div class="review-header">
                        <div class="review-author">${review.userName}</div>
                        <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    </div>
                    <p class="review-text">"${review.reviewText}"</p>
                `;
                reviewsContainer.appendChild(reviewCard);
            });
            if (accommodation.reviews.length > 2) {
                showAllReviewsBtn.style.display = 'block';
                showAllReviewsBtn.textContent = `Show all ${accommodation.reviews.length} reviews`;
            } else {
                showAllReviewsBtn.style.display = 'none';
            }
        } else {
            noReviewsMessage.style.display = 'block';
        }

        // Room Types
        roomTypesGrid.innerHTML = '';
        if (accommodation.rooms && accommodation.rooms.length > 0) {
            accommodation.rooms.forEach(room => {
                const roomCard = document.createElement('div');
                roomCard.className = 'room-type-card'; // Reusing existing style
                roomCard.innerHTML = `
                    <h3>${room.roomType}</h3>
                    <p>${room.description || 'No description available.'}</p>
                    <div class="room-price">$${room.pricePerNight}/night</div>
                    <button class="btn-primary select-room-btn" data-room-id="${room.id}" data-room-type="${room.roomType}" data-price="${room.pricePerNight}">Select Room</button>
                `;
                roomTypesGrid.appendChild(roomCard);
            });
        } else {
            noRoomTypesMessage.style.display = 'block';
        }

        // Re-initialize lazy loading for newly added images
        const lazyImages = document.querySelectorAll('img.lazy');
        if (lazyImages.length > 0 && typeof window.initializeLazyLoading === 'function') {
            window.initializeLazyLoading(lazyImages);
        }

        // Update booking summary placeholder
        bookingSummary.style.display = 'none'; // Hide until dates/guests are selected
    }

    // Gallery thumbnail click handler
    galleryThumbnails.addEventListener('click', function(e) {
        if (e.target.classList.contains('thumbnail')) {
            mainImage.src = e.target.src;
            galleryThumbnails.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    // "Book Now" button on detail page
    if (checkAvailabilityBtn) {
        checkAvailabilityBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const checkin = document.getElementById('checkin-date').value;
            const checkout = document.getElementById('checkout-date').value;
            const guests = document.getElementById('guests').value;
            const accommodationId = new URLSearchParams(window.location.search).get('id');
            const accommodationName = currentAccommodation ? encodeURIComponent(currentAccommodation.name) : '';

            const url = `booking.html?accommodationId=${accommodationId}&accommodationName=${accommodationName}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
            window.location.href = url;
        });
    }

    fetchAccommodationDetails();
});