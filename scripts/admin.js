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
            const res = await fetch(`${API_URL}/packages`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>$${item.fromPrice}</td>
                    <td><span class="status-badge status-${item.approval_status || 'approved'}">${item.approval_status || 'approved'}</span></td>
                    <td>
                        <div class="table-actions">
                            <div class="action-group">
                                ${item.approval_status !== 'approved' ? `<button class="btn-approve" onclick="updateItemStatus('packages', '${item.id}', 'approved')">Approve</button>` : ''}
                                ${item.approval_status !== 'rejected' ? `<button class="btn-delete" onclick="updateItemStatus('packages', '${item.id}', 'rejected')">Reject</button>` : ''}
                            </div>
                            <div class="action-divider"></div>
                            <div class="action-group">
                                <button class="btn-edit" onclick="editItem('packages', '${item.id}')">Edit</button>
                                <button class="btn-delete" onclick="deleteItem('packages', '${item.id}')">Delete</button>
                            </div>
                        </div>
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
            const res = await fetch(`${API_URL}/accommodations`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>$${item.fromPrice || item.price || 0}</td>
                <td><span class="status-badge status-${item.approval_status || 'approved'}">${item.approval_status || 'approved'}</span></td>
                <td>
                    <div class="table-actions">
                        <div class="action-group">
                            ${item.approval_status !== 'approved' ? `<button class="btn-approve" onclick="updateItemStatus('accommodations', '${item.id}', 'approved')">Approve</button>` : ''}
                            ${item.approval_status !== 'rejected' ? `<button class="btn-delete" onclick="updateItemStatus('accommodations', '${item.id}', 'rejected')">Reject</button>` : ''}
                        </div>
                        <div class="action-divider"></div>
                        <div class="action-group">
                            <button class="btn-edit" onclick="editItem('accommodations', '${item.id}')">Edit</button>
                            <button class="btn-delete" onclick="deleteItem('accommodations', '${item.id}')">Delete</button>
                        </div>
                    </div>
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
            const res = await fetch(`${API_URL}/attractions`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>$${item.price}</td>
                <td><span class="status-badge status-${item.approval_status || 'approved'}">${item.approval_status || 'approved'}</span></td>
                <td>
                    <div class="table-actions">
                        <div class="action-group">
                            ${item.approval_status !== 'approved' ? `<button class="btn-approve" onclick="updateItemStatus('attractions', '${item.id}', 'approved')">Approve</button>` : ''}
                            ${item.approval_status !== 'rejected' ? `<button class="btn-delete" onclick="updateItemStatus('attractions', '${item.id}', 'rejected')">Reject</button>` : ''}
                        </div>
                        <div class="action-divider"></div>
                        <div class="action-group">
                            <button class="btn-edit" onclick="editItem('attractions', '${item.id}')">Edit</button>
                            <button class="btn-delete" onclick="deleteItem('attractions', '${item.id}')">Delete</button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
        }
    }

    async function loadUsers() {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
        try {
            const res = await fetch(`${API_URL}/users`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Error fetching users');

            tbody.innerHTML = data.map(item => {
                const isPendingCompany = item.role === 'company' && item.account_status === 'pending';
                const isRejectedCompany = item.role === 'company' && item.account_status === 'rejected';

                // Status badge
                let statusBadge = '';
                if (item.account_status === 'pending') {
                    statusBadge = '<span class="status-badge status-pending">Pending</span>';
                } else if (item.account_status === 'rejected') {
                    statusBadge = '<span class="status-badge status-rejected">Rejected</span>';
                } else {
                    statusBadge = '<span class="status-badge status-approved">Approved</span>';
                }

                return `
            <tr>
                <td>${item.id}</td>
                <td>${item.company_name || item.full_name || item.fullName}</td>
                <td>${item.email}</td>
                <td>${item.role}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="table-actions">
                        ${isPendingCompany ? `
                        <div class="action-group">
                            <button class="btn-approve" onclick="approveCompany('${item.id}')">Approve</button>
                            <button class="btn-delete" onclick="rejectCompany('${item.id}')">Reject</button>
                        </div>
                        <div class="action-divider"></div>
                        ` : ''}
                        ${isRejectedCompany ? `
                        <div class="action-group">
                            <button class="btn-approve" onclick="approveCompany('${item.id}')">Approve</button>
                        </div>
                        <div class="action-divider"></div>
                        ` : ''}
                        <div class="action-group">
                            <button class="btn-edit" onclick="editItem('users', '${item.id}')">Edit</button>
                            ${item.role !== 'admin' ?
                        `<button class="btn-delete" onclick="deleteItem('users', '${item.id}')">Delete</button>` :
                        '<span style="color: grey; font-size: 0.75rem;">Admin</span>'
                    }
                        </div>
                    </div>
                </td>
            </tr>
        `;
            }).join('');
        } catch (err) {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="6">Error loading users</td></tr>';
        }
    }

    // Company Approval Functions
    window.approveCompany = async (userId) => {
        if (!confirm('Approve this company account? They will be able to create content.')) return;
        try {
            const res = await fetch(`${API_URL}/users/${userId}/approve`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                alert('Company approved successfully!');
                loadUsers();
            } else {
                const error = await res.json();
                alert('Failed to approve: ' + (error.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Error approving company');
        }
    };

    window.rejectCompany = async (userId) => {
        if (!confirm('Reject this company account? They will not be able to create content.')) return;
        try {
            const res = await fetch(`${API_URL}/users/${userId}/reject`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                alert('Company rejected.');
                loadUsers();
            } else {
                const error = await res.json();
                alert('Failed to reject: ' + (error.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Error rejecting company');
        }
    };

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

            // Show room management section only for accommodations in edit mode
            const roomSection = document.getElementById('roomManagementSection');
            if (type === 'accommodations') {
                if (roomSection) roomSection.style.display = 'block';
                currentAccommodationId = id;
                loadRooms(id);
            } else {
                if (roomSection) roomSection.style.display = 'none';
            }

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

    // --- Update Item Status (Approve/Reject) ---
    window.updateItemStatus = async (type, id, status) => {
        const action = status === 'approved' ? 'approve' : 'reject';
        if (!confirm(`Are you sure you want to ${action} this ${type.slice(0, -1)}?`)) return;

        try {
            const res = await fetch(`${API_URL}/${type}/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ approval_status: status })
            });

            if (res.ok) {
                alert(`Item ${status} successfully`);
                if (type === 'packages') loadPackages();
                if (type === 'accommodations') loadAccommodations();
                if (type === 'attractions') loadAttractions();
            } else {
                alert(`Failed to ${action} item`);
            }
        } catch (err) {
            console.error(err);
            alert(`Error ${action}ing item`);
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

                // Special handling for accommodations: show room section and reset temp rooms
                const roomSection = document.getElementById('roomManagementSection');
                if (endpoint === 'accommodations') {
                    if (roomSection) roomSection.style.display = 'block';
                    currentAccommodationId = null;
                    temporaryRooms = [];
                    displayTemporaryRooms();
                } else {
                    if (roomSection) roomSection.style.display = 'none';
                }

                form.reset();
                modal.style.display = 'block';
            };
        }
        close.onclick = () => {
            modal.style.display = 'none';
        };
        // Removed global window.onclick to prevent conflicts, using close buttons

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
                    const responseData = await res.json();

                    // Special handling for accommodations - save temporary rooms if any
                    if (endpoint === 'accommodations' && !isEdit) {
                        const newAccId = responseData.id || responseData.accommodation?.id;
                        if (newAccId && temporaryRooms.length > 0) {
                            await saveTemporaryRooms(newAccId);
                        }
                    }

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

    // --- Room Management Integrated Logic ---
    const roomForm = document.getElementById('roomForm');
    const roomListSection = document.getElementById('roomListSection');
    const roomFormSection = document.getElementById('roomFormSection');
    let currentAccommodationId = null;
    let currentRoomEditingId = null;
    let temporaryRooms = [];

    // Save temporary rooms after accommodation is created
    async function saveTemporaryRooms(accommodationId) {
        for (const room of temporaryRooms) {
            const roomData = {
                accommodationId: accommodationId,
                roomType: room.roomType,
                pricePerNight: room.pricePerNight,
                maxGuests: room.maxGuests,
                description: room.description
            };

            try {
                await fetch(`${API_URL}/rooms`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(roomData)
                });
            } catch (err) {
                console.error('Error saving room:', err);
            }
        }
    }

    // Display temporary rooms in the table
    function displayTemporaryRooms() {
        const tbody = document.querySelector('#roomsTable tbody');
        if (!tbody) return;

        if (temporaryRooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No rooms added yet. Click "Add Room" to add one!</td></tr>';
        } else {
            tbody.innerHTML = temporaryRooms.map((room, index) => `
                <tr>
                    <td>${room.roomType}</td>
                    <td>$${room.pricePerNight}</td>
                    <td>${room.maxGuests}</td>
                    <td>
                        <button class="btn-sm btn-outline" onclick="editTemporaryRoom(${index})">Edit</button>
                        <button class="btn-sm btn-outline btn-delete" onclick="deleteTemporaryRoom(${index})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Handle temporary room editing
    window.editTemporaryRoom = (index) => {
        const room = temporaryRooms[index];
        currentRoomEditingId = index; // Use index as ID for temporary rooms
        roomForm.roomType.value = room.roomType;
        roomForm.pricePerNight.value = room.pricePerNight;
        roomForm.maxGuests.value = room.maxGuests;
        roomForm.description.value = room.description;
        document.getElementById('roomFormTitle').textContent = 'Edit Room';
        roomFormSection.style.display = 'block';
        roomListSection.style.display = 'none';
    };

    // Handle temporary room deletion
    window.deleteTemporaryRoom = (index) => {
        if (!confirm('Are you sure you want to remove this room?')) return;
        temporaryRooms.splice(index, 1);
        displayTemporaryRooms();
    };

    async function loadRooms(accommodationId) {
        const tbody = document.querySelector('#roomsTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
        try {
            const res = await fetch(`${API_URL}/rooms/accommodation/${accommodationId}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">No rooms found. Add one above!</td></tr>';
            } else {
                tbody.innerHTML = data.map(room => `
                    <tr>
                        <td>${room.roomType}</td>
                        <td>$${room.pricePerNight}</td>
                        <td>${room.maxGuests}</td>
                        <td>
                            <button class="btn-sm btn-outline" onclick="editRoom(${JSON.stringify(room).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn-sm btn-outline btn-delete" onclick="deleteRoom('${room.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4">Error loading rooms</td></tr>';
        }
    }

    const addNewRoomBtn = document.getElementById('addNewRoomBtn');
    if (addNewRoomBtn) {
        addNewRoomBtn.onclick = () => {
            currentRoomEditingId = null;
            roomForm.reset();
            document.getElementById('roomFormTitle').textContent = 'Add New Room';
            roomFormSection.style.display = 'block';
            roomListSection.style.display = 'none';
        };
    }

    const cancelRoomBtn = document.getElementById('cancelRoomBtn');
    if (cancelRoomBtn) {
        cancelRoomBtn.onclick = () => {
            roomFormSection.style.display = 'none';
            roomListSection.style.display = 'block';
        };
    }

    window.editRoom = (room) => {
        currentRoomEditingId = room.id;
        roomForm.roomType.value = room.roomType;
        roomForm.pricePerNight.value = room.pricePerNight;
        roomForm.maxGuests.value = room.maxGuests;
        roomForm.description.value = room.description;
        document.getElementById('roomFormTitle').textContent = 'Edit Room';
        roomFormSection.style.display = 'block';
        roomListSection.style.display = 'none';
    };

    window.deleteRoom = async (roomId) => {
        if (!confirm('Are you sure you want to delete this room?')) return;
        try {
            const res = await fetch(`${API_URL}/rooms/${roomId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                alert('Room deleted successfully');
                loadRooms(currentAccommodationId);
            } else {
                alert('Failed to delete room');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting room');
        }
    };

    if (roomForm) {
        roomForm.onsubmit = async (e) => {
            e.preventDefault();
            const roomData = {
                roomType: roomForm.roomType.value,
                pricePerNight: parseFloat(roomForm.pricePerNight.value),
                maxGuests: parseInt(roomForm.maxGuests.value),
                description: roomForm.description.value
            };

            // If we're working with a new accommodation (no currentAccommodationId)
            if (!currentAccommodationId) {
                // Add to temporary storage
                if (typeof currentRoomEditingId === 'number' && currentRoomEditingId >= 0) {
                    // Editing existing temporary room
                    temporaryRooms[currentRoomEditingId] = roomData;
                } else {
                    // Adding new temporary room
                    temporaryRooms.push(roomData);
                }
                roomFormSection.style.display = 'none';
                roomListSection.style.display = 'block';
                displayTemporaryRooms();
                currentRoomEditingId = null;
            } else {
                // Working with existing accommodation - save to API
                roomData.accommodationId = currentAccommodationId;
                const method = (typeof currentRoomEditingId === 'string') ? 'PUT' : 'POST';
                const url = (typeof currentRoomEditingId === 'string')
                    ? `${API_URL}/rooms/${currentRoomEditingId}`
                    : `${API_URL}/rooms`;

                try {
                    const res = await fetch(url, {
                        method: method,
                        headers: getAuthHeaders(),
                        body: JSON.stringify(roomData)
                    });

                    if (res.ok) {
                        alert(currentRoomEditingId ? 'Room updated successfully' : 'Room added successfully');
                        roomFormSection.style.display = 'none';
                        roomListSection.style.display = 'block';
                        loadRooms(currentAccommodationId);
                        currentRoomEditingId = null;
                    } else {
                        const err = await res.json();
                        alert('Failed to save room: ' + (err.message || 'Unknown error'));
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error saving room');
                }
            }
        };
    }
});
