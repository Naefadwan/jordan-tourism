// Accommodations page functionality
document.addEventListener('DOMContentLoaded', function () {
    const API_URL = 'http://localhost:5000/api';
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const sortFilter = document.getElementById('sortFilter');
    const accommodationsGrid = document.getElementById('accommodationsGrid');
    const noAccommodationsMessage = document.getElementById('noAccommodationsMessage');

    // --- EVENT LISTENERS ---
    if (searchInput) {
        // Use a debounce function to avoid firing API calls on every keystroke
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchAndDisplayAccommodations();
            }, 300); // Wait 300ms after user stops typing
        });
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', fetchAndDisplayAccommodations);
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            const allCards = Array.from(accommodationsGrid.querySelectorAll('.accommodation-card'));
            sortAccommodations(allCards);
        });
    }

    function createAccommodationCard(accommodation) {
        const card = document.createElement('div');
        card.className = 'accommodation-card';
        card.dataset.id = accommodation.id;
        card.dataset.type = accommodation.type;
        card.dataset.location = accommodation.location;
        card.dataset.rating = accommodation.rating;
        card.dataset.reviews = accommodation.reviewsCount; // Match sorting data attribute
        const price = accommodation.fromPrice || accommodation.price || 150; // Use the new price field or fallback
        card.dataset.price = price;

        card.innerHTML = `
            <div class="accommodation-image">
                <img src="${accommodation.main_image_url || accommodation.mainImage || 'public/placeholder.jpg'}" alt="${accommodation.name}" loading="lazy" onerror="this.src='public/placeholder.jpg'">
                <div class="accommodation-badge">${accommodation.type || 'Hotel'}</div>
                <div class="accommodation-price">From $${price}/night</div>
            </div>
            <div class="accommodation-content">
                <div class="accommodation-rating">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>
                    <span class="rating-score">${accommodation.rating.toFixed(1)}</span>
                    <span class="rating-count">(${accommodation.reviewsCount} reviews)</span>
                </div>
                <h3 class="accommodation-name">${accommodation.name}</h3>
                <div class="accommodation-location">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>${accommodation.location}</span>
                </div>
                <p class="accommodation-description">${accommodation.description}</p>
                <div class="accommodation-features">
                    <!-- Features will be dynamically added here if available -->
                </div>
                <div class="accommodation-footer">
                    <a href="accommodation-detail.html?id=${accommodation.id}" class="btn-primary btn-sm">View Details</a>
                    <a href="booking.html?accommodationId=${accommodation.id}&accommodationName=${encodeURIComponent(accommodation.name)}" class="btn-outline btn-sm">Book Now</a>
                </div>
            </div>
        `;
        return card;
    }

    async function fetchAndDisplayAccommodations() {
        try {
            const searchTerm = searchInput ? searchInput.value : '';
            const selectedType = typeFilter ? typeFilter.value : 'all';

            const queryParams = new URLSearchParams({ search: searchTerm, type: selectedType });
            const response = await fetch(`${API_URL}/accommodations?${queryParams}`);

            if (!response.ok) throw new Error('Failed to fetch accommodations');
            const accommodations = await response.json();

            // Clear existing cards but keep the 'no results' message element
            accommodationsGrid.innerHTML = '';
            accommodationsGrid.appendChild(noAccommodationsMessage);

            if (accommodations.length === 0) {
                noAccommodationsMessage.style.display = 'block';
            } else {
                noAccommodationsMessage.style.display = 'none';
                accommodations.forEach(accommodation => {
                    // The API now returns simulated rating/reviews, so we can pass it directly
                    const card = createAccommodationCard(accommodation);
                    accommodationsGrid.appendChild(card);
                });
            }

            // Re-initialize lazy loading for newly added images
            const lazyImages = accommodationsGrid.querySelectorAll('img.lazy');
            if (lazyImages.length > 0 && typeof window.initializeLazyLoading === 'function') {
                window.initializeLazyLoading(lazyImages);
            }

            const allCards = Array.from(accommodationsGrid.querySelectorAll('.accommodation-card'));
            sortAccommodations(allCards);

        } catch (error) {
            console.error('Error fetching accommodations:', error);
            noAccommodationsMessage.textContent = 'Could not load accommodations. Please try again later.';
            noAccommodationsMessage.style.display = 'block';
        }
    }

    function sortAccommodations(cards) {
        const sortBy = sortFilter ? sortFilter.value : 'popular';

        cards.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'rating':
                    return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
                case 'popular':
                default:
                    return parseInt(b.dataset.reviews) - parseInt(a.dataset.reviews);
            }
        });

        // Reorder the cards in the grid
        cards.forEach(card => {
            accommodationsGrid.appendChild(card);
        });
    }

    fetchAndDisplayAccommodations();
});