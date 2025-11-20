document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api';

    // --- Authentication Check ---
    const token = localStorage.getItem('token');
    if (!token) {
        // No token, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Verify user role
    verifyAdmin(token);

    async function verifyAdmin(token) {
        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                headers: { 'x-auth-token': token }
            });

            if (!res.ok) {
                throw new Error('Unauthorized');
            }

            const user = await res.json();
            if (user.role !== 'admin') {
                alert('Access denied. Admin privileges required.');
                window.location.href = 'index.html';
                return;
            }

            // User is admin, show username
            document.getElementById('adminUsername').textContent = user.fullName || user.email;
        } catch (err) {
            console.error('Auth error:', err);
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    }

    // Logout function
    window.logout = () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    };

    // Helper to get auth headers
    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
        };
    }

    // --- Tabs ---
    const tabs = document.querySelectorAll('.admin-nav-link');
    const contents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const target = document.getElementById(`${tab.dataset.tab}-tab`);
            target.classList.add('active');

            // Load data for the active tab
            if (tab.dataset.tab === 'packages') loadPackages();
            if (tab.dataset.tab === 'accommodations') loadAccommodations();
            if (tab.dataset.tab === 'attractions') loadAttractions();
        });
    });

    // --- Initial Load ---
    loadPackages();

    // --- Data Loading Functions ---
    async function loadPackages() {
        const tbody = document.querySelector('#packagesTable tbody');
        tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        try {
            const res = await fetch(`${API_URL}/packages`);
            const data = await res.json();
            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>$${item.fromPrice}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteItem('packages', ${item.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
        }
    }

    async function loadAccommodations() {
        const tbody = document.querySelector('#accommodationsTable tbody');
        tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        try {
            const res = await fetch(`${API_URL}/accommodations`);
            const data = await res.json();
            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteItem('accommodations', ${item.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
        }
    }

    async function loadAttractions() {
        const tbody = document.querySelector('#attractionsTable tbody');
        tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        try {
            const res = await fetch(`${API_URL}/attractions`);
            const data = await res.json();
            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteItem('attractions', ${item.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
        }
    }

    // --- Delete Function (Global) ---
    window.deleteItem = async (type, id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await fetch(`${API_URL}/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });

            if (res.status === 401 || res.status === 403) {
                alert('Unauthorized. Please log in again.');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }

            if (res.ok) {
                alert('Item deleted successfully');
                // Reload current tab
                if (type === 'packages') loadPackages();
                if (type === 'accommodations') loadAccommodations();
                if (type === 'attractions') loadAttractions();
            } else {
                alert('Failed to delete item');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting item');
        }
    };

    // --- Modals & Forms ---
    setupModal('packageModal', 'addPackageBtn', 'packageForm', 'packages', loadPackages);
    setupModal('accommodationModal', 'addAccommodationBtn', 'accommodationForm', 'accommodations', loadAccommodations);
    setupModal('attractionModal', 'addAttractionBtn', 'attractionForm', 'attractions', loadAttractions);

    function setupModal(modalId, btnId, formId, endpoint, reloadFn) {
        const modal = document.getElementById(modalId);
        const btn = document.getElementById(btnId);
        const close = modal.querySelector('.close-modal');
        const form = document.getElementById(formId);

        btn.onclick = () => modal.style.display = 'block';
        close.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => {
            if (e.target == modal) modal.style.display = 'none';
        };

        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'x-auth-token': token
                        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
                    },
                    body: formData // Send FormData instead of JSON
                });

                if (res.status === 401 || res.status === 403) {
                    alert('Unauthorized. Please log in again.');
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                    return;
                }

                if (res.ok) {
                    alert('Item added successfully');
                    modal.style.display = 'none';
                    form.reset();
                    reloadFn();
                } else {
                    const error = await res.json();
                    alert('Failed to add item: ' + (error.message || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert('Error adding item');
            }
        };
    }
});
