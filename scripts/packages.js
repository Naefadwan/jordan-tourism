document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';
    const grid = document.getElementById('packagesGrid');
    const empty = document.getElementById('noPackagesMessage');

    async function loadPackages() {
        try {
            const res = await fetch(`${API_URL}/packages`);
            if (!res.ok) throw new Error('Failed to fetch packages');
            const packages = await res.json();

            if (!packages.length) {
                empty.style.display = 'block';
                return;
            }
            empty.style.display = 'none';

            packages.forEach(pkg => {
                const card = document.createElement('div');
                card.className = 'package-card';

                card.innerHTML = `
                    <div class="package-image-wrapper">
                        <img src="${pkg.image || 'public/placeholder.jpg'}" alt="${pkg.name}" class="package-image" loading="lazy" onerror="this.src='public/placeholder.jpg'">
                        ${pkg.includesFlights ? '<div class="package-badge">Flights Included</div>' : ''}
                    </div>
                    <div class="package-content">
                        <h3 class="package-title">${pkg.name}</h3>
                        <p class="package-description">${pkg.description}</p>
                        <p class="package-meta">
                            ${pkg.nights} nights · from ${pkg.originCity} to ${pkg.destinationCity}
                        </p>
                        <div class="package-footer">
                            <div class="package-price-wrapper">
                                <span class="package-price-label">From</span>
                                <span class="package-price">$${pkg.fromPrice}</span>
                            </div>
                            <a href="package-detail.html?id=${pkg.id}" class="btn-primary btn-sm">
                                View Details
                            </a>
                        </div>
                    </div>
                `;

                grid.appendChild(card);
            });
        } catch (err) {
            console.error(err);
            empty.textContent = 'Could not load packages. Please try again later.';
            empty.style.display = 'block';
        }
    }

    loadPackages();
});
