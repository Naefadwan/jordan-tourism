// scripts/attractions.js
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const attractionsGrid = document.getElementById('attractionsGrid');
    const noResultsMessage = document.getElementById('noResultsMessage');

    if (!attractionsGrid) return;

    let likedAttractions = [];

    // --- Event listeners ---
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            fetchAndDisplayAttractions();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            fetchAndDisplayAttractions();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            const cards = Array.from(attractionsGrid.querySelectorAll('.attraction-card'));
            sortAttractions(cards);
        });
    }

    // --- Core rendering ---
    function createAttractionCard(attraction) {
        const card = document.createElement('div');
        card.className = 'attraction-card';
        card.dataset.category = attraction.category;
        card.dataset.price = attraction.price;
        card.dataset.rating = attraction.rating;
        card.dataset.reviews = attraction.reviews;
        card.dataset.attractionId = attraction.id;

        const liked = likedAttractions.includes(attraction.id);

        card.innerHTML = `
            <div class="attraction-image">
                <img data-src="${attraction.image}" alt="${attraction.name}" loading="lazy" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
                <div class="attraction-badge">${attraction.category.charAt(0).toUpperCase() + attraction.category.slice(1)}</div>
                <button class="btn-icon like-btn ${liked ? 'liked' : ''}" aria-label="Like ${attraction.name}" data-attraction-id="${attraction.id}">
                    <svg class="icon icon-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78-0.0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div class="attraction-price">$${attraction.price}</div>
            </div>
            <div class="attraction-content">
                <div class="attraction-rating">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>
                    <span class="rating-score">${attraction.rating}</span>
                    <span class="rating-count">(${attraction.reviews} reviews)</span>
                </div>
                <h3 class="attraction-name">${attraction.name}</h3>
                <div class="attraction-location">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21s-6-5.686-6-10a6 6 0 0 1 12 0c0 4.314-6 10-6 10z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>${attraction.location}</span>
                </div>
                <p class="attraction-description">${attraction.description}</p>
                <div class="attraction-footer">
                    <div class="attraction-duration">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg>
                        <span>${attraction.duration}</span>
                    </div>
                    <a href="attraction-detail.html?id=${attraction.id}" class="btn-primary btn-sm">View Details</a>
                </div>
            </div>
        `;

        return card;
    }

    async function fetchAndDisplayAttractions() {
        try {
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);

            const [attractions, likes] = await Promise.all([
                api(`/attractions?${params.toString()}`),
                loadLikesIfLoggedIn()
            ]);

            likedAttractions = likes;

            attractionsGrid.innerHTML = '';
            attractionsGrid.appendChild(noResultsMessage);

            if (!attractions.length) {
                noResultsMessage.style.display = 'block';
                return;
            }

            noResultsMessage.style.display = 'none';

            const cards = attractions.map(createAttractionCard);
            cards.forEach(card => attractionsGrid.appendChild(card));
            sortAttractions(cards);
            attachLikeHandlers();

            if (typeof window.initializeLazyLoading === 'function') {
                const images = attractionsGrid.querySelectorAll('img[data-src]');
                window.initializeLazyLoading(images);
            }
        } catch (err) {
            console.error('Error fetching attractions:', err);
            noResultsMessage.textContent = 'Could not load attractions. Please try again later.';
            noResultsMessage.style.display = 'block';
        }
    }

    async function loadLikesIfLoggedIn() {
        const token = localStorage.getItem('token');
        if (!token) return [];
        try {
            return await api('/likes', { auth: true });
        } catch (err) {
            console.warn('Could not load likes:', err);
            return [];
        }
    }

    function sortAttractions(cards) {
        const sortBy = sortFilter ? sortFilter.value : 'popular';

        cards.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'rating':
                    return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
                default:
                    return 0;
            }
        });

        cards.forEach(card => attractionsGrid.appendChild(card));
    }

    function attachLikeHandlers() {
        const buttons = attractionsGrid.querySelectorAll('.like-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = 'login.html';
                    return;
                }

                const attractionId = btn.dataset.attractionId;
                const liked = btn.classList.contains('liked');
                try {
                    if (!liked) {
                        await api(`/likes/${attractionId}`, { method: 'POST', auth: true });
                        btn.classList.add('liked');
                    } else {
                        await api(`/likes/${attractionId}`, { method: 'DELETE', auth: true });
                        btn.classList.remove('liked');
                    }
                } catch (err) {
                    console.error('Failed to toggle like:', err);
                }
            });
        });
    }

    fetchAndDisplayAttractions();
});
