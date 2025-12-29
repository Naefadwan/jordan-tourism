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
            console.log('User profile:', user); // Debug log

            // Check for company role (or admin/company)
            if (user.role !== 'company' && user.role !== 'admin') {
                alert('Access denied. Company privileges required.');
                window.location.href = 'index.html';
                return;
            }

            // Display company name
            document.getElementById('companyName').textContent = user.companyName || user.fullName || user.email;

            // Check account status and show appropriate banner
            const pendingBanner = document.getElementById('pendingApprovalBanner');
            const rejectedBanner = document.getElementById('rejectedAccountBanner');

            console.log('Account Status:', user.accountStatus); // Debug log

            if (user.accountStatus === 'pending') {
                if (pendingBanner) pendingBanner.style.display = 'block';
                disableCreateActions();
            } else if (user.accountStatus === 'rejected') {
                if (rejectedBanner) rejectedBanner.style.display = 'block';
                disableCreateActions();
            }
            // If approved or admin, everything works normally

            // Load initial data
            loadPackages();
        } catch (err) {
            console.error('Auth error:', err);
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    }

    function disableCreateActions() {
        // Disable all "Add New" buttons
        const addPackageBtn = document.getElementById('addPackageBtn');
        const addAccommodationBtn = document.getElementById('addAccommodationBtn');

        if (addPackageBtn) {
            addPackageBtn.disabled = true;
            addPackageBtn.style.opacity = '0.5';
            addPackageBtn.style.cursor = 'not-allowed';
            addPackageBtn.title = 'Your account must be approved before you can create content';
        }

        if (addAccommodationBtn) {
            addAccommodationBtn.disabled = true;
            addAccommodationBtn.style.opacity = '0.5';
            addAccommodationBtn.style.cursor = 'not-allowed';
            addAccommodationBtn.title = 'Your account must be approved before you can create content';
        }

        // Disable all Edit buttons after content loads
        setTimeout(() => {
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.title = 'Your account must be approved before you can edit content';
            });
        }, 500); // Wait for tables to load

        // Override edit functions globally
        window.editPackage = () => {
            alert('Your account must be approved before you can edit content.');
        };
        window.editAccommodation = () => {
            alert('Your account must be approved before you can edit content.');
        };
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
            const res = await fetch(`${API_URL}/packages`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();

            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.fromPrice || item.from_price || 0}</td>
                    <td>${item.booking_count || 0}</td>
                    <td><span class="status-badge status-${item.approval_status || 'approved'}">${item.approval_status === 'pending' ? 'Waiting Approval' : (item.approval_status || 'Approved')}</span></td>
                    <td>
                        <div class="table-actions">
                            <div class="action-group">
                                <button class="btn-edit" onclick="editPackage('${item.id}')">Edit</button>
                            </div>
                        </div>
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
            const res = await fetch(`${API_URL}/accommodations`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();

            tbody.innerHTML = data.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>$${item.price || 0}</td>
                    <td><span class="status-badge status-${item.approval_status || 'approved'}">${item.approval_status === 'pending' ? 'Waiting Approval' : (item.approval_status || 'Approved')}</span></td>
                    <td>
                        <div class="table-actions">
                            <div class="action-group">
                                <button class="btn-edit" onclick="editAccommodation('${item.id}')">Edit</button>
                            </div>
                        </div>
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

    // Temporary storage for rooms when creating new accommodation
    let temporaryRooms = [];

    function openAccommodationModal(acc = null) {
        currentEditingId = acc ? acc.id : null;
        accommodationModal.style.display = 'block';
        accommodationModal.querySelector('h2').textContent = acc ? 'Edit Accommodation' : 'Add New Accommodation';

        // Always show room management section
        const roomSection = document.getElementById('roomManagementSection');
        if (roomSection) roomSection.style.display = 'block';

        if (acc) {
            // Editing existing accommodation
            currentAccommodationId = acc.id;
            temporaryRooms = [];
            loadRooms(acc.id);
        } else {
            // Adding new accommodation
            currentAccommodationId = null;
            temporaryRooms = [];
            displayTemporaryRooms();
        }

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
                    const savedAccommodation = await res.json();

                    // If we have temporary rooms and this is a new accommodation, save them
                    if (!currentEditingId && temporaryRooms.length > 0) {
                        await saveTemporaryRooms(savedAccommodation.id);
                    }

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

    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
        };
    }

    // --- Room Management Integrated Logic ---
    const roomForm = document.getElementById('roomForm');
    const roomListSection = document.getElementById('roomListSection');
    const roomFormSection = document.getElementById('roomFormSection');
    let currentAccommodationId = null;
    let currentRoomEditingId = null;

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
