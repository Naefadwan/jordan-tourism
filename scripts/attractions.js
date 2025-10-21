// Attractions page functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const attractionsGrid = document.getElementById('attractionsGrid');
    const attractionCards = document.querySelectorAll('.attraction-card');

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

    function filterAttractions() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

        attractionCards.forEach(card => {
            const name = card.querySelector('.attraction-name').textContent.toLowerCase();
            const description = card.querySelector('.attraction-description').textContent.toLowerCase();
            const category = card.getAttribute('data-category');

            const matchesSearch = searchTerm === '' || 
                name.includes(searchTerm) || 
                description.includes(searchTerm);
            
            const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function sortAttractions() {
        const sortBy = sortFilter ? sortFilter.value : 'popular';
        const visibleCards = Array.from(attractionCards).filter(card => 
            card.style.display !== 'none'
        );

        visibleCards.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
                case 'price-high':
                    return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
                case 'rating':
                    return parseFloat(b.getAttribute('data-rating')) - parseFloat(a.getAttribute('data-rating'));
                case 'popular':
                default:
                    // Sort by reviews count (assuming higher reviews = more popular)
                    const reviewsA = parseInt(a.querySelector('.rating-count').textContent.match(/\d+/)[0]);
                    const reviewsB = parseInt(b.querySelector('.rating-count').textContent.match(/\d+/)[0]);
                    return reviewsB - reviewsA;
            }
        });

        // Reorder the cards in the grid
        visibleCards.forEach(card => {
            attractionsGrid.appendChild(card);
        });
    }

    // Add click handlers for attraction cards
    attractionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.tagName === 'BUTTON') return;
            
            const attractionName = this.querySelector('.attraction-name').textContent.toLowerCase().replace(/\s+/g, '-');
            window.location.href = `attraction-detail.html?id=${attractionName}`;
        });

        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});
