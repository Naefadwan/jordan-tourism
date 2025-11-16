document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';

    const packageImage = document.getElementById('packageImage');
    const packageName = document.getElementById('packageName');
    const packageSummary = document.getElementById('packageSummary');
    const packageNights = document.getElementById('packageNights');
    const packageRoute = document.getElementById('packageRoute');
    const packagePrice = document.getElementById('packagePrice');
    const itinerary = document.getElementById('itinerary');
    const includesList = document.getElementById('includesList');
    const startDateInput = document.getElementById('startDate');
    const guestsInput = document.getElementById('guests');
    const bookBtn = document.getElementById('bookPackageBtn');

    const params = new URLSearchParams(window.location.search);
    const packageId = params.get('id');

    if (!packageId) {
        alert('No package ID specified');
        window.location.href = 'packages.html';
        return;
    }

    async function loadPackage() {
        try {
            const res = await fetch(`${API_URL}/packages/${packageId}`);
            if (!res.ok) throw new Error('Failed to fetch package');
            const pkg = await res.json();

            packageImage.src = pkg.image;
            packageImage.alt = pkg.name;
            packageName.textContent = pkg.name;
            packageSummary.textContent = pkg.description;
            packageNights.textContent = `${pkg.nights} nights`;
            packageRoute.textContent = `${pkg.originCity} → ${pkg.destinationCity}`;
            packagePrice.textContent = `From $${pkg.fromPrice}`;

            // Simple itinerary grouped by day
            const days = new Map();
            pkg.attractions.forEach((item) => {
                const day = item.day || 1;
                if (!days.has(day)) days.set(day, []);
                days.get(day).push(item);
            });

            itinerary.innerHTML = '';
            [...days.entries()].sort((a, b) => a[0] - b[0]).forEach(([day, items]) => {
                const dayBlock = document.createElement('div');
                dayBlock.className = 'itinerary-day';
                dayBlock.innerHTML = `<h3>Day ${day}</h3>`;
                const list = document.createElement('ul');
                list.className = 'itinerary-list';

                items.forEach((attraction) => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${attraction.name}</strong>
                        <span class="itinerary-location">${attraction.location}</span>
                        <span class="itinerary-duration">${attraction.duration || ''}</span>
                    `;
                    list.appendChild(li);
                });

                dayBlock.appendChild(list);
                itinerary.appendChild(dayBlock);
            });

            // Includes list
            includesList.innerHTML = '';
            includesList.innerHTML += `<li>Round-trip flights from ${pkg.originCity}</li>`;
            includesList.innerHTML += `<li>${pkg.nights} nights at ${pkg.accommodation.name}</li>`;
            includesList.innerHTML += `<li>Guided visits to key attractions in the itinerary</li>`;
            includesList.innerHTML += `<li>All taxes and standard fees</li>`;
        } catch (err) {
            console.error(err);
            alert('Could not load package. Returning to packages list.');
            window.location.href = 'packages.html';
        }
    }

    bookBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const guests = guestsInput.value || 2;

        if (!startDate) {
            alert('Please select a start date');
            return;
        }

        window.location.href =
            `package-booking.html?packageId=${encodeURIComponent(packageId)}&` +
            `startDate=${encodeURIComponent(startDate)}&guests=${encodeURIComponent(guests)}`;
    });

    loadPackage();
});
