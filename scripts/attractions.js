// Attractions page functionality
document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:5000/api';
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const attractionsGrid = document.getElementById('attractionsGrid');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterAttractions();
        });
    }

    // Category filter functionality
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterAttractions();
        });
    }

    // Sort functionality
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            sortAttractions();
        });
    }

    function createAttractionCard(attraction) {
        const card = document.createElement('div');
        card.className = 'attraction-card';
        card.dataset.category = attraction.category;
        card.dataset.price = attraction.price;
        card.dataset.rating = attraction.rating;
        card.dataset.reviews = attraction.reviews;

        card.innerHTML = `
            <div class="attraction-image">
                <img data-src="${attraction.image}" alt="${attraction.name}" class="lazy" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
                <div class="attraction-badge">${attraction.category.charAt(0).toUpperCase() + attraction.category.slice(1)}</div>
                <button class="btn-icon like-btn" aria-label="Like ${attraction.name}" data-attraction-id="${attraction.id}">
                    <svg class="icon icon-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
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
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>${attraction.location}</span>
                </div>
                <p class="attraction-description">${attraction.description}</p>
                <div class="attraction-footer">
                    <div class="attraction-duration">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg>
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
            const response = await fetch(`${API_URL}/attractions`);
            if (!response.ok) throw new Error('Failed to fetch attractions');
            const attractions = await response.json();

            // Clear existing cards except for the 'no results' message
            attractionsGrid.innerHTML = '';
            attractionsGrid.appendChild(noResultsMessage);

            attractions.forEach(attraction => {
                const card = createAttractionCard(attraction);
                attractionsGrid.appendChild(card);
            });

            // Re-initialize filters and event listeners for the new cards
            filterAttractions();

        } catch (error) {
            console.error('Error fetching attractions:', error);
            noResultsMessage.textContent = 'Could not load attractions. Please try again later.';
            noResultsMessage.style.display = 'block';
        }
    }

    function sortAttractions(cards) {
        const sortBy = sortFilter ? sortFilter.value : 'popular';
        
        cards.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
                case 'price-high':
                    return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
                case 'rating':
                    return parseFloat(b.getAttribute('data-rating')) - parseFloat(a.getAttribute('data-rating'));
                case 'popular':
                default:
                    return parseInt(b.getAttribute('data-reviews')) - parseInt(a.getAttribute('data-reviews'));
            }
        });

        // Reorder the cards in the grid
        cards.forEach(card => {
            attractionsGrid.appendChild(card);
        });
    }

    function filterAttractions() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const allCards = document.querySelectorAll('.attraction-card');
        let visibleCards = [];

        allCards.forEach(card => {
            const name = card.querySelector('.attraction-name').textContent.toLowerCase();
            const category = card.getAttribute('data-category');
            const matchesSearch = searchTerm === '' || name.includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                visibleCards.push(card);
            } else {
                card.style.display = 'none';
            }
        });

        noResultsMessage.style.display = visibleCards.length === 0 ? 'block' : 'none';
        sortAttractions(visibleCards);
        initializeLikeButtons(); // Re-initialize like buttons for visible cards
    }

    // Like button functionality
    function initializeLikeButtons() {
        const likeButtons = document.querySelectorAll('.like-btn');
        let likedAttractions = JSON.parse(localStorage.getItem('likedAttractions')) || [];

        function updateLikeButtons() {
            likeButtons.forEach(button => {
                const attractionId = button.dataset.attractionId;
                if (likedAttractions.includes(attractionId)) {
                    button.classList.add('liked');
                } else {
                    button.classList.remove('liked');
                }
            });
        }

        likeButtons.forEach(button => {
            // Remove old listener to prevent duplicates
            button.replaceWith(button.cloneNode(true));
        });

        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const attractionId = button.dataset.attractionId;
                if (likedAttractions.includes(attractionId)) {
                    likedAttractions = likedAttractions.filter(id => id !== attractionId);
                } else {
                    likedAttractions.push(attractionId);
                }
                localStorage.setItem('likedAttractions', JSON.stringify(likedAttractions));
                updateLikeButtons();
            });
        });

        updateLikeButtons();
    }

    // Initial Load
    fetchAndDisplayAttractions();
});
