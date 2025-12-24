// scripts/company-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';

    // --- Auth Check ---
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    verifyCompanyUser(token);

    async function verifyCompanyUser(token) {
        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                headers: { 'x-auth-token': token }
            });

            if (!res.ok) throw new Error('Unauthorized');

            const user = await res.json();
            // Check for company role (or admin/company)
            if (user.role !== 'company' && user.role !== 'admin') {
                alert('Access denied. Company privileges required.');
                window.location.href = 'index.html';
                return;
            }

            document.getElementById('companyName').textContent = user.fullName || user.email;

            // Load initial data
            loadPackages();
        } catch (err) {
            console.error('Auth error:', err);
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    }

    // --- Logout ---
    window.logout = () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    };

    // --- Tabs ---
    const tabs = document.querySelectorAll('.admin-nav-link');
    const contents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');

            if (tab.dataset.tab === 'packages') loadPackages();
            if (tab.dataset.tab === 'accommodations') loadAccommodations();
            if (tab.dataset.tab === 'bookings') loadBookings();
        });
    });

    // --- Load Data Functions ---
    async function loadPackages() {
        // Placeholder: Fetch packages owned by this company
        // For now, fetching all (needs backend filter)
        const tbody = document.querySelector('#packagesTable tbody');
        tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

        try {
            const res = await fetch(`${API_URL}/packages`); // TODO: Add ?owner=me
            const data = await res.json();

            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.fromPrice || item.from_price || 0}</td>
                    <td>${item.booking_count || 0}</td>
                    <td>
                        <button class="btn-sm btn-outline" onclick="editPackage(${item.id})">Edit</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4">Error loading packages</td></tr>';
        }
    }

    async function loadAccommodations() {
        const tbody = document.querySelector('#accommodationsTable tbody');
        tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

        try {
            const res = await fetch(`${API_URL}/accommodations`); // TODO: Add ?owner=me
            const data = await res.json();

            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>$${item.price || 0}</td>
                    <td>
                        <button class="btn-sm btn-outline" onclick="editAccommodation(${item.id})">Edit</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4">Error loading accommodations</td></tr>';
        }
    }

    async function loadBookings() {
        const tbody = document.querySelector('#bookingsTable tbody');
        tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

        try {
            const res = await fetch(`${API_URL}/bookings/admin/all`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">No bookings found</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.ref}</td>
                    <td>${item.item_name}</td>
                    <td>${item.guest_name}<br><small>${item.guest_email}</small></td>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${item.status}">${item.status}</span></td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="5">Error loading bookings</td></tr>';
        }
    }

    // --- Modals & Forms ---
    const packageModal = document.getElementById('packageModal');
    const packageForm = document.getElementById('packageForm');
    const closePackageModal = packageModal.querySelector('.close-modal');

    // Toggle ticket price input based on checkbox
    const hasTicketCheckbox = document.getElementById('pkgHasTicket');
    const ticketPriceGroup = document.getElementById('ticketPriceGroup');
    if (hasTicketCheckbox) {
        hasTicketCheckbox.addEventListener('change', () => {
            ticketPriceGroup.style.display = hasTicketCheckbox.checked ? 'block' : 'none';
        });
    }

    // Add New Package
    document.getElementById('addPackageBtn').onclick = () => {
        openPackageModal();
    };

    closePackageModal.onclick = () => packageModal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target == packageModal) packageModal.style.display = 'none';
    };

    let currentEditingId = null;

    window.editPackage = async (id) => {
        try {
            const res = await fetch(`${API_URL}/packages/${id}`);
            if (!res.ok) throw new Error('Failed to fetch package');
            const pkg = await res.json();
            openPackageModal(pkg);
        } catch (err) {
            alert('Error loading package details');
            console.error(err);
        }
    };

    function openPackageModal(pkg = null) {
        currentEditingId = pkg ? pkg.id : null;
        packageModal.style.display = 'block';
        packageModal.querySelector('h2').textContent = pkg ? 'Edit Package' : 'Add New Package';

        if (pkg) {
            packageForm.name.value = pkg.name;
            packageForm.description.value = pkg.description;
            packageForm.from_price.value = pkg.fromPrice || pkg.from_price;
            packageForm.nights.value = pkg.nights;
            packageForm.origin_city.value = pkg.originCity || pkg.origin_city;
            packageForm.destination_city.value = pkg.destinationCity || pkg.destination_city;
            packageForm.includes_flights.checked = pkg.includesFlights || pkg.includes_flights;

            // Handle ticket fields
            packageForm.has_ticket.checked = pkg.has_ticket;
            packageForm.ticket_price.value = pkg.ticket_price || '';
            if (pkg.has_ticket) ticketPriceGroup.style.display = 'block';
        } else {
            packageForm.reset();
            ticketPriceGroup.style.display = 'none';
        }

        packageForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(packageForm);

            const url = currentEditingId
                ? `${API_URL}/packages/${currentEditingId}`
                : `${API_URL}/packages`;

            const method = currentEditingId ? 'PUT' : 'POST';

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(url, {
                    method: method,
                    headers: { 'x-auth-token': token },
                    body: formData
                });

                if (res.ok) {
                    alert('Package saved successfully');
                    packageModal.style.display = 'none';
                    loadPackages();
                } else {
                    const err = await res.json();
                    alert('Failed to save: ' + (err.message || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Error saving package');
            }
        };
    }

    // --- Accommodation Modals & Forms ---
    const accommodationModal = document.getElementById('accommodationModal');
    const accommodationForm = document.getElementById('accommodationForm');
    const closeAccommodationModal = accommodationModal.querySelector('.close-modal');

    document.getElementById('addAccommodationBtn').onclick = () => {
        openAccommodationModal();
    };

    closeAccommodationModal.onclick = () => accommodationModal.style.display = 'none';

    window.editAccommodation = async (id) => {
        try {
            const res = await fetch(`${API_URL}/accommodations/${id}`);
            if (!res.ok) throw new Error('Failed to fetch accommodation');
            const acc = await res.json();
            openAccommodationModal(acc);
        } catch (err) {
            alert('Error loading accommodation details');
            console.error(err);
        }
    };

    function openAccommodationModal(acc = null) {
        currentEditingId = acc ? acc.id : null;
        accommodationModal.style.display = 'block';
        accommodationModal.querySelector('h2').textContent = acc ? 'Edit Accommodation' : 'Add New Accommodation';

        if (acc) {
            accommodationForm.name.value = acc.name;
            accommodationForm.type.value = acc.type;
            accommodationForm.location.value = acc.location;
            accommodationForm.description.value = acc.description;
            accommodationForm.price.value = acc.price;
        } else {
            accommodationForm.reset();
        }

        accommodationForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(accommodationForm);

            const url = currentEditingId
                ? `${API_URL}/accommodations/${currentEditingId}`
                : `${API_URL}/accommodations`;

            const method = currentEditingId ? 'PUT' : 'POST';

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(url, {
                    method: method,
                    headers: { 'x-auth-token': token },
                    body: formData
                });

                if (res.ok) {
                    alert('Accommodation saved successfully');
                    accommodationModal.style.display = 'none';
                    loadAccommodations();
                } else {
                    const err = await res.json();
                    alert('Failed to save: ' + (err.message || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Error saving accommodation');
            }
        };
    }
});
