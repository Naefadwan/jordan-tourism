// Shared auth utility functions
const AuthUtils = {
    // Get token from localStorage
    getToken() {
        return localStorage.getItem('token');
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Decode JWT token (simple base64 decode, no validation)
    decodeToken(token) {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            return JSON.parse(decoded);
        } catch (e) {
            return null;
        }
    },

    // Get user role from token
    getUserRole() {
        const token = this.getToken();
        if (!token) return null;

        const decoded = this.decodeToken(token);
        return decoded?.user?.role || null;
    },

    // Check if user is admin
    isAdmin() {
        return this.getUserRole() === 'admin';
    },

    // Show/hide admin link in navigation
    initAdminLink() {
        if (this.isAdmin()) {
            // Create admin link
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'nav-link';
            adminLink.textContent = 'Admin';
            adminLink.style.color = '#ff6b35'; // Highlight color

            // Insert before "About Jordan" link
            const mainNav = document.querySelector('.main-nav');
            if (mainNav) {
                const aboutLink = mainNav.querySelector('a[href="about.html"]');
                if (aboutLink) {
                    mainNav.insertBefore(adminLink, aboutLink);
                } else {
                    mainNav.appendChild(adminLink);
                }
            }

            // Also add to mobile menu
            const mobileNav = document.querySelector('.mobile-nav');
            if (mobileNav) {
                const mobileAdminLink = document.createElement('a');
                mobileAdminLink.href = 'admin.html';
                mobileAdminLink.className = 'mobile-nav-link';
                mobileAdminLink.textContent = 'Admin Dashboard';
                mobileAdminLink.style.color = '#ff6b35';

                const mobileAboutLink = mobileNav.querySelector('a[href="about.html"]');
                if (mobileAboutLink) {
                    mobileNav.insertBefore(mobileAdminLink, mobileAboutLink);
                } else {
                    mobileNav.appendChild(mobileAdminLink);
                }
            }
        }
    }
};

// Initialize admin link when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthUtils.initAdminLink());
} else {
    AuthUtils.initAdminLink();
}
