// Liked Attractions page functionality
document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:5000/api';
    const attractionsGrid = document.getElementById('attractionsGrid');
    const attractionCards = document.querySelectorAll('.attraction-card');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const likeButtons = document.querySelectorAll('.like-btn');
    const token = localStorage.getItem('token');

    let likedAttractions = JSON.parse(localStorage.getItem('likedAttractions')) || [];
    if (!token) {
        // If not logged in, show message and redirect
        noResultsMessage.innerHTML = '<p>You must be logged in to see your liked attractions. Redirecting to login...</p>';
        noResultsMessage.style.display = 'block';
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        return;
    }

    function displayLikedAttractions() {
        let visibleCount = 0;
        attractionCards.forEach(card => {
            const attractionId = card.dataset.attractionId;
            if (likedAttractions.includes(attractionId)) {
                card.style.display = 'block';
                visibleCount++;
    async function fetchAndDisplayLikedAttractions() {
        try {
            const response = await fetch(`${API_URL}/likes`, {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) throw new Error('Failed to fetch liked attractions');
            const likedAttractionIds = await response.json();

            // Hide all cards initially
            const allCards = document.querySelectorAll('.attraction-card');
            allCards.forEach(card => card.style.display = 'none');

            if (likedAttractionIds.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                card.style.display = 'none';
                noResultsMessage.style.display = 'none';
                likedAttractionIds.forEach(id => {
                    const card = document.querySelector(`.attraction-card[data-attraction-id="${id}"]`);
                    if (card) {
                        card.style.display = 'block';
                        const likeBtn = card.querySelector('.like-btn');
                        if (likeBtn) {
                            likeBtn.classList.add('liked');
                            likeBtn.addEventListener('click', handleUnlike);
                        }
                    }
                });
            }
        });

        if (noResultsMessage) {
            noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        } catch (error) {
            console.error('Error fetching liked attractions:', error);
            noResultsMessage.innerHTML = '<p>Could not load your liked attractions. Please try again later.</p>';
            noResultsMessage.style.display = 'block';
        }
    }

    function updateLikeButtons() {
        likeButtons.forEach(button => {
            const attractionId = button.dataset.attractionId;
            if (likedAttractions.includes(attractionId)) {
                button.classList.add('liked');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('liked');
                button.setAttribute('aria-pressed', 'false');
            }
    async function handleUnlike(e) {
        e.stopPropagation();
        const button = e.currentTarget;
        const card = button.closest('.attraction-card');
        const attractionId = card.dataset.attractionId;

        await fetch(`${API_URL}/likes/${attractionId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        // Animate and remove the card from view
        card.classList.add('hidden-by-filter');
        card.addEventListener('transitionend', () => {
            const attractionId = card.dataset.attractionId;
            card.style.display = 'none';
        }, { once: true });
    }

    likeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            const attractionId = button.dataset.attractionId;
            
            // Since we are on the liked page, a click always means "unlike"
            likedAttractions = likedAttractions.filter(id => id !== attractionId);
            
            localStorage.setItem('likedAttractions', JSON.stringify(likedAttractions));
            
            // Animate and remove the card
            const card = button.closest('.attraction-card');
            if (card) {
                card.classList.add('hidden-by-filter');
                card.addEventListener('transitionend', () => displayLikedAttractions(), { once: true });
            }
        });
    });

    // Initial setup
    displayLikedAttractions();
    updateLikeButtons();
    fetchAndDisplayLikedAttractions();
});