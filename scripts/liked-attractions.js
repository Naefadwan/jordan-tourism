// Liked Attractions page functionality
document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:5000/api';
    const noResultsMessage = document.getElementById('noResultsMessage');
    const token = localStorage.getItem('token');

    if (!token) {
        // If not logged in, show message and redirect
        noResultsMessage.innerHTML = '<p>You must be logged in to see your liked attractions. Redirecting to login...</p>';
        noResultsMessage.style.display = 'block';
        // Hide all cards that might be in the static HTML
        document.querySelectorAll('.attraction-card').forEach(card => card.style.display = 'none');
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        return;
    }

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
                noResultsMessage.style.display = 'none';
                likedAttractionIds.forEach(id => {
                    const card = document.querySelector(`.attraction-card[data-attraction-id="${id}"]`);
                    if (card) {
                        card.style.display = 'block';
                        const likeBtn = card.querySelector('.like-btn');
                        if (likeBtn) {
                            likeBtn.classList.add('liked');
                            // Clone and replace to remove any old listeners
                            const newBtn = likeBtn.cloneNode(true);
                            likeBtn.parentNode.replaceChild(newBtn, likeBtn);
                            newBtn.addEventListener('click', handleUnlike);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching liked attractions:', error);
            noResultsMessage.innerHTML = '<p>Could not load your liked attractions. Please try again later.</p>';
            noResultsMessage.style.display = 'block';
        }
    }

    async function handleUnlike(e) {
        e.stopPropagation();
        const button = e.currentTarget;
        const card = button.closest('.attraction-card');
        const attractionId = card.dataset.attractionId;

        await fetch(`${API_URL}/likes/${attractionId}`, { method: 'DELETE', headers: { 'x-auth-token': token } });

        // Animate and remove the card from view
        card.classList.add('hidden-by-filter');
        card.addEventListener('transitionend', () => card.style.display = 'none', { once: true });
    }

    fetchAndDisplayLikedAttractions();
});