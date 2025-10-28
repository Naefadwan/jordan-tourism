document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';

    const attractionNameElem = document.getElementById('attractionName');
    const attractionRatingElem = document.getElementById('attractionRating');
    const attractionLocationElem = document.getElementById('attractionLocation');
    const attractionImageElem = document.getElementById('attractionImage');
    const attractionDescriptionElem = document.getElementById('attractionDescription');
    const attractionCategoryElem = document.getElementById('attractionCategory');
    const attractionPriceElem = document.getElementById('attractionPrice');
    const attractionDurationElem = document.getElementById('attractionDuration');
    const attractionMapLocationElem = document.getElementById('attractionMapLocation');
    const widgetPriceElem = document.getElementById('widgetPrice');

    async function fetchAttractionDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const attractionId = urlParams.get('id');

        if (!attractionId) {
            console.error('No attraction ID found in URL.');
            // Display a user-friendly message or redirect
            attractionNameElem.textContent = 'Attraction Not Found';
            attractionDescriptionElem.innerHTML = '<p>Please go back to the <a href="attractions.html">attractions list</a> to select an attraction.</p>';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/attractions/${attractionId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    attractionNameElem.textContent = 'Attraction Not Found';
                    attractionDescriptionElem.innerHTML = '<p>The attraction you are looking for does not exist.</p>';
                } else {
                    throw new Error('Failed to fetch attraction details');
                }
                return;
            }
            const attraction = await response.json();
            renderAttractionDetails(attraction);
        } catch (error) {
            console.error('Error fetching attraction details:', error);
            attractionNameElem.textContent = 'Error Loading Attraction';
            attractionDescriptionElem.innerHTML = '<p>There was an error loading the attraction details. Please try again later.</p>';
        }
    }

    function renderAttractionDetails(attraction) {
        document.title = `${attraction.name} - Discover Jordan`;
        attractionNameElem.textContent = attraction.name;
        attractionRatingElem.textContent = `${attraction.rating} (${attraction.reviews} reviews)`;
        attractionLocationElem.textContent = attraction.location;
        attractionImageElem.src = attraction.image;
        attractionImageElem.alt = attraction.name;
        attractionDescriptionElem.innerHTML = `<p>${attraction.description}</p>`;
        attractionCategoryElem.textContent = attraction.category.charAt(0).toUpperCase() + attraction.category.slice(1);
        attractionPriceElem.textContent = `$${attraction.price}`;
        attractionDurationElem.textContent = attraction.duration;
        attractionMapLocationElem.textContent = attraction.location;
        widgetPriceElem.textContent = `$${attraction.price}`;

        // Re-initialize lazy loading for the main image if it was lazy-loaded
        if (attractionImageElem.classList.contains('lazy') && typeof window.initializeLazyLoading === 'function') {
            window.initializeLazyLoading([attractionImageElem]);
        }
    }

    fetchAttractionDetails();
});