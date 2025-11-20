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

    // Initialize all enhancements when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initSearchModal();
            initCounterAnimation();
            initSmoothScroll();
        });
    } else {
        initSearchModal();
        initCounterAnimation();
        initSmoothScroll();
    }
})();
