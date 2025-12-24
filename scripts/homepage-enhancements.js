// Homepage Enhancements JavaScript

(function () {
    'use strict';

    // Search Modal Functionality
    function initSearchModal() {
        const searchBtn = document.getElementById('searchBtn');
        const searchModal = document.getElementById('searchModal');
        const closeSearchModal = document.getElementById('closeSearchModal');
        const searchInput = document.getElementById('searchInput');

        if (!searchBtn || !searchModal || !closeSearchModal) return;

        // Open search modal
        searchBtn.addEventListener('click', () => {
            searchModal.style.display = 'flex';
            setTimeout(() => searchInput?.focus(), 100);
        });

        // Close search modal
        closeSearchModal.addEventListener('click', () => {
            searchModal.style.display = 'none';
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchModal.style.display === 'flex') {
                searchModal.style.display = 'none';
            }
        });

        // Close on backdrop click
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.style.display = 'none';
            }
        });

        // Handle search submission
        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `attractions.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // Animated Counter for Statistics
    function initCounterAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number');
        let hasAnimated = false;

        const animateCounter = (element) => {
            const target = parseFloat(element.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    // Format number with commas for large numbers
                    if (target >= 1000) {
                        element.textContent = Math.floor(current).toLocaleString();
                    } else {
                        element.textContent = current.toFixed(1);
                    }
                    requestAnimationFrame(updateCounter);
                } else {
                    // Final value
                    if (target >= 1000) {
                        element.textContent = target.toLocaleString();
                    } else {
                        element.textContent = target;
                    }
                    element.classList.add('counting');
                }
            };

            updateCounter();
        };

        // Intersection Observer for animating when section comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    statNumbers.forEach((stat, index) => {
                        setTimeout(() => {
                            animateCounter(stat);
                        }, index * 100); // Stagger animation
                    });
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.statistics-section');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    // Smooth Scroll for Internal Links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // Fetch and Display real data for homepage
    async function initHomepageData() {
        const attractionsGrid = document.getElementById('featuredAttractionsGrid');
        const packagesGrid = document.getElementById('featuredPackagesGrid');

        try {
            // Fetch Attractions
            const attractions = await api('/attractions?limit=4');
            if (attractionsGrid) renderFeaturedAttractions(attractions, attractionsGrid);

            // Fetch Packages
            const packages = await api('/packages');
            if (packagesGrid) renderFeaturedPackages(packages.slice(0, 3), packagesGrid);

        } catch (err) {
            console.error('Failed to load homepage data:', err);
        }
    }

    function renderFeaturedAttractions(attractions, container) {
        container.innerHTML = attractions.map(attraction => `
            <div class="destination-card">
                <div class="destination-image">
                    <img src="${attraction.image_url || attraction.image || 'public/placeholder.jpg'}" alt="${attraction.name}" loading="lazy" onerror="this.src='public/placeholder.jpg'">
                    <div class="destination-price">From $${attraction.price}</div>
                </div>
                <div class="destination-content">
                    <h3 class="destination-name">${attraction.name}</h3>
                    <p class="destination-description">${attraction.description.substring(0, 80)}...</p>
                    <a href="attraction-detail.html?id=${attraction.id}" class="btn-outline destination-btn">View Details</a>
                </div>
            </div>
        `).join('');
    }

    function renderFeaturedPackages(packages, container) {
        container.innerHTML = packages.map(pkg => `
            <div class="experience-card">
                <div class="experience-image">
                    <img src="${pkg.image || 'public/placeholder.jpg'}" alt="${pkg.name}" loading="lazy" onerror="this.src='public/placeholder.jpg'">
                </div>
                <div class="experience-content">
                    <div class="experience-rating">
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                        </svg>
                        <span class="rating-score">4.9</span>
                        <span class="rating-count">(Featured)</span>
                    </div>
                    <h3 class="experience-title">${pkg.name}</h3>
                    <p class="experience-description">${pkg.description.substring(0, 100)}...</p>
                    <div class="experience-footer">
                        <div class="experience-duration">
                           <span>$${pkg.fromPrice}</span>
                        </div>
                        <a href="package-detail.html?id=${pkg.id}" class="btn-primary btn-sm">Book Package</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Initialize all enhancements when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initSearchModal();
            initCounterAnimation();
            initSmoothScroll();
            initHomepageData();
        });
    } else {
        initSearchModal();
        initCounterAnimation();
        initSmoothScroll();
        initHomepageData();
    }
})();
