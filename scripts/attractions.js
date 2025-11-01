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
            fetchAndDisplayAttractions();
        });
    }

    // Category filter functionality
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            fetchAndDisplayAttractions();
        });
    }

    // Sort functionality
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            // Sorting is still client-side for now, so we just re-sort the existing cards
            const allCards = Array.from(attractionsGrid.querySelectorAll('.attraction-card'));
            sortAttractions(allCards);
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
            const searchTerm = searchInput ? searchInput.value : '';
            const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
            
            const queryParams = new URLSearchParams({ search: searchTerm, category: selectedCategory });
            const response = await fetch(`${API_URL}/attractions?${queryParams}`);

            if (!response.ok) throw new Error('Failed to fetch attractions');
            const attractions = await response.json();

            // Clear existing cards except for the 'no results' message
            attractionsGrid.innerHTML = '';
            attractionsGrid.appendChild(noResultsMessage);

            attractions.forEach(attraction => {
                const card = createAttractionCard(attraction);
                attractionsGrid.appendChild(card);
            });

            noResultsMessage.style.display = attractions.length === 0 ? 'block' : 'none';

            const allCards = Array.from(attractionsGrid.querySelectorAll('.attraction-card'));
            sortAttractions(allCards); // Sort the newly fetched cards
            initializeLikeButtons(); // Re-initialize like buttons for the new cards

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

    // Like button functionality
    async function initializeLikeButtons() {
        let likedAttractions = [];
        const token = localStorage.getItem('token');

        // Fetch user's likes if logged in
        if (token) {
            try {
                const response = await fetch(`${API_URL}/likes`, {
                    headers: { 'x-auth-token': token }
                });
                if (response.ok) {
                    likedAttractions = await response.json();
                }
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        }

        function updateLikeButtons() {
            document.querySelectorAll('.like-btn').forEach(button => {
                const attractionId = button.dataset.attractionId;
                if (likedAttractions.includes(attractionId)) {
                    button.classList.add('liked');
                } else {
                    button.classList.remove('liked');
                }
            });
        }

        document.querySelectorAll('.like-btn').forEach(button => {
            // Clone and replace the node to remove any old event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!token) {
                    window.location.href = 'login.html'; // Redirect to login if not authenticated
                    return;
                }

                const attractionId = newButton.dataset.attractionId;
                const isLiked = newButton.classList.contains('liked');
                const method = isLiked ? 'DELETE' : 'POST';

                try {
                    await fetch(`${API_URL}/likes/${attractionId}`, { method, headers: { 'x-auth-token': token } });
                    newButton.classList.toggle('liked'); // Optimistically update UI
                } catch (error) {
                    console.error('Error updating like status:', error);
                }
            });
        });

        updateLikeButtons();
    }

    // Initial Load
    fetchAndDisplayAttractions();
});
