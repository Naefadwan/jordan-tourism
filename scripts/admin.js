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
            if (tab.dataset.tab === 'users') loadUsers();
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
                        <button class="btn-edit" onclick="editItem('packages', ${item.id})">Edit</button>
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
        tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
        try {
            const res = await fetch(`${API_URL}/accommodations`);
            const data = await res.json();
            tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>$${item.fromPrice || item.price || 0}</td>
                <td>
                    <button class="btn-edit" onclick="editItem('accommodations', ${item.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteItem('accommodations', ${item.id})">Delete</button>
                </td>
            </tr>
        `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
        }
    }

    async function loadAttractions() {
        const tbody = document.querySelector('#attractionsTable tbody');
        tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
        try {
            const res = await fetch(`${API_URL}/attractions`);
            const data = await res.json();
            tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>$${item.price}</td>
                <td>
                    <button class="btn-edit" onclick="editItem('attractions', ${item.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteItem('attractions', ${item.id})">Delete</button>
                </td>
            </tr>
        `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
        }
    }

    async function loadUsers() {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
        try {
            const res = await fetch(`${API_URL}/users`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Error fetching users');

            tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.full_name || item.fullName}</td>
                <td>${item.email}</td>
                <td>${item.role}</td>
                <td>
                    <button class="btn-edit" onclick="editItem('users', ${item.id})">Edit</button>
                    ${item.role !== 'admin' ?
                    `<button class="btn-delete" onclick="deleteItem('users', ${item.id})">Delete</button>` :
                    '<span style="color: grey;">Admin (Protected)</span>'
                }
                </td>
            </tr>
        `).join('');
        } catch (err) {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="5">Error loading users</td></tr>';
        }
    }

    // --- Edit Functionality ---
    window.editMode = false;
    window.currentItemId = null;

    window.editItem = async (type, id) => {
        try {
            const res = await fetch(`${API_URL}/${type}/${id}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();

            window.editMode = true;
            window.currentItemId = id;

            // Determine which modal to open
            let modalId, formId;
            if (type === 'packages') {
                modalId = 'packageModal';
                formId = 'packageForm';
            } else if (type === 'accommodations') {
                modalId = 'accommodationModal';
                formId = 'accommodationForm';
            } else if (type === 'attractions') {
                modalId = 'attractionModal';
                formId = 'attractionForm';
            } else if (type === 'users') {
                modalId = 'userModal';
                formId = 'userForm';
            }

            const modal = document.getElementById(modalId);
            const form = document.getElementById(formId);
            modal.querySelector('h2').textContent = `Edit ${type.slice(0, -1)}`;
            modal.querySelector('button[type="submit"]').textContent = 'Update Item';

            // Fill form fields
            for (const key in data) {
                const field = form.elements[key];
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = data[key];
                    } else if (field.type !== 'file') {
                        field.value = data[key];
                    }
                }
            }

            // Special mapping for from_price if needed
            if (data.fromPrice && form.elements['from_price']) form.elements['from_price'].value = data.fromPrice;
            if (data.fromPrice && form.elements['price']) form.elements['price'].value = data.fromPrice;

            modal.style.display = 'block';
        } catch (err) {
            console.error('Error fetching item for edit:', err);
            alert('Could not load item details.');
        }
    };

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
                if (type === 'packages') loadPackages();
                if (type === 'accommodations') loadAccommodations();
                if (type === 'attractions') loadAttractions();
                if (type === 'users') loadUsers();
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

    // For users, we don't have an "Add User" button, passing null or dummy ID
    setupModal('userModal', 'dummyAddUserBtn', 'userForm', 'users', loadUsers);

    function setupModal(modalId, btnId, formId, endpoint, reloadFn) {
        const modal = document.getElementById(modalId);
        const btn = document.getElementById(btnId);
        const close = modal.querySelector('.close-modal');
        const form = document.getElementById(formId);

        if (btn) {
            btn.onclick = () => {
                window.editMode = false;
                window.currentItemId = null;
                modal.querySelector('h2').textContent = `Add New ${endpoint.slice(0, -1)}`;
                modal.querySelector('button[type="submit"]').textContent = `Save ${endpoint.slice(0, -1)}`;
                form.reset();
                modal.style.display = 'block';
            };
        }
        close.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => {
            if (e.target == modal) modal.style.display = 'none';
        };

        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const isEdit = window.editMode;
            const id = window.currentItemId;

            try {
                const token = localStorage.getItem('token');
                const url = isEdit ? `${API_URL}/${endpoint}/${id}` : `${API_URL}/${endpoint}`;
                const method = isEdit ? 'PUT' : 'POST';

                let options = {
                    method: method,
                    headers: { 'x-auth-token': token }
                };

                // Check if we should send JSON or FormData
                // Users form doesn't have file inputs, so we send JSON
                if (endpoint === 'users') {
                    const jsonBody = {};
                    formData.forEach((value, key) => jsonBody[key] = value);
                    options.headers['Content-Type'] = 'application/json';
                    options.body = JSON.stringify(jsonBody);
                } else {
                    // For others (packages, etc), use FormData (for file uploads)
                    // Note: fetch automatically sets Content-Type to multipart/form-data when body is FormData
                    options.body = formData;
                }

                const res = await fetch(url, options);

                if (res.status === 401 || res.status === 403) {
                    alert('Unauthorized. Please log in again.');
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                    return;
                }

                if (res.ok) {
                    alert(isEdit ? 'Item updated successfully' : 'Item added successfully');
                    modal.style.display = 'none';
                    form.reset();
                    reloadFn();
                } else {
                    const error = await res.json();
                    alert(`Failed to ${isEdit ? 'update' : 'add'} item: ` + (error.message || 'Unknown error'));
                }
            } catch (err) {
                console.error(err);
                alert(`Error ${isEdit ? 'updating' : 'adding'} item`);
            }
        };
    }
});
