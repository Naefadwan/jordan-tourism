document.addEventListener('DOMContentLoaded', function () {
    const API_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    const attractionsGrid = document.getElementById('attractionsGrid');
    const noResultsMessage = document.getElementById('noResultsMessage');

    if (!attractionsGrid || !noResultsMessage) {
        console.error('Required elements not found on liked-attractions page.');
        return;
    }

    // If not logged in, show message and redirect
    if (!token) {
        noResultsMessage.innerHTML =
            '<p>You must be logged in to see your liked attractions. Redirecting to login...</p>';
        noResultsMessage.style.display = 'block';

        // Hide any static placeholder cards
        document.querySelectorAll('.attraction-card').forEach(card => (card.style.display = 'none'));

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // -------- Helpers --------

    function capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function createAttractionCard(attraction) {
        const card = document.createElement('div');
        card.className = 'attraction-card';
        card.dataset.category = attraction.category || '';
        card.dataset.price = attraction.price || 0;
        card.dataset.rating = attraction.rating || 0;
        card.dataset.reviews = attraction.reviews || 0;
        card.dataset.attractionId = attraction.id;

        const placeholderSrc =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

        const numericRating = Number(attraction.rating) || 0;
        const reviewsCount = Number(attraction.reviews) || 0;
        const price = Number(attraction.price) || 0;
        card.innerHTML = `
            <div class="attraction-image">
                <img
                    data-src="${attraction.image}"
                    alt="${attraction.name}"
                    loading="lazy"
                    src="${placeholderSrc}"
                >
                <div class="attraction-badge">${capitalize(attraction.category || 'Attraction')}</div>
                <button class="btn-icon like-btn liked" aria-label="Unlike ${attraction.name}" data-attraction-id="${attraction.id}">
                    <svg class="icon icon-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78-0.0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div class="attraction-price">$${attraction.price}</div>
            </div>
            <div class="attraction-content">
                <div class="attraction-rating">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                    </svg>
                    <span class="rating-score">${numericRating.toFixed(1)}</span>
                    <span class="rating-count">(${reviewsCount} reviews)</span>
                </div>
                <h3 class="attraction-name">${attraction.name}</h3>
                <div class="attraction-location">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>${attraction.location}</span>
                </div>
                <p class="attraction-description">${attraction.description}</p>
                <div class="attraction-footer">
                    <div class="attraction-duration">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span>${attraction.duration}</span>
                    </div>
                    <a href="attraction-detail.html?id=${attraction.id}" class="btn-primary btn-sm">View Details</a>
                </div>
            </div>
        `;

        // Attach unlike handler
        const likeBtn = card.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', handleUnlike);
        }

        return card;
    }

    async function handleUnlike(e) {
        e.stopPropagation();
        const button = e.currentTarget;
        const card = button.closest('.attraction-card');
        const attractionId = card.dataset.attractionId;

        try {
            const response = await fetch(`${API_URL}/likes/${attractionId}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to remove like');
            }

            // Animate and remove the card from view
            card.classList.add('hidden-by-filter');
            card.addEventListener(
                'transitionend',
                () => {
                    card.remove();
                    if (!attractionsGrid.querySelector('.attraction-card')) {
                        showEmptyMessage();
                    }
                },
                { once: true }
            );
        } catch (error) {
            console.error('Error unliking attraction:', error);
        }
    }

    function showEmptyMessage() {
        noResultsMessage.innerHTML =
            `<p>You haven't liked any attractions yet. <a href="attractions.html" class="link">Browse attractions</a> to save your favorites!</p>`;
        noResultsMessage.style.display = 'block';
    }

    function hideEmptyMessage() {
        noResultsMessage.style.display = 'none';
    }

    async function fetchAndDisplayLikedAttractions() {
        try {
            // 1) Get liked attraction IDs
            const res = await fetch(`${API_URL}/likes`, {
                headers: {
                    'x-auth-token': token,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch liked attractions');
            }

            const likedAttractionIds = await res.json();

            // Clear old dynamic content
            attractionsGrid.querySelectorAll('.attraction-card').forEach(card => card.remove());

            if (!likedAttractionIds.length) {
                showEmptyMessage();
                return;
            }

            hideEmptyMessage();

            // 2) Fetch details for each liked attraction
            const attractionPromises = likedAttractionIds.map(async (id) => {
                const detailRes = await fetch(`${API_URL}/attractions/${id}`);
                if (!detailRes.ok) {
                    throw new Error(`Failed to fetch attraction ${id}`);
                }
                return detailRes.json();
            });

            const attractions = await Promise.all(attractionPromises);

            attractions.forEach((attraction) => {
                const card = createAttractionCard(attraction);
                attractionsGrid.appendChild(card);
            });

            // Optional: lazy-loading hook if defined globally
            if (typeof window.initializeLazyLoading === 'function') {
                const images = attractionsGrid.querySelectorAll('img[data-src]');
                window.initializeLazyLoading(images);
            }
        } catch (error) {
            console.error('Error fetching liked attractions:', error);
            noResultsMessage.textContent =
                'Could not load your liked attractions. Please try again later.';
            noResultsMessage.style.display = 'block';
        }
    }

    fetchAndDisplayLikedAttractions();
});