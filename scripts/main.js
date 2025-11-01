// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById("mobileMenuToggle")
const mobileMenu = document.getElementById("mobileMenu")

if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("active")
    mobileMenuToggle.classList.toggle("active")
  })
}

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".site-header")) {
    if (mobileMenu) mobileMenu.classList.remove("active")
    if (mobileMenuToggle) mobileMenuToggle.classList.remove("active")
  }
})

// Header scroll effect
const siteHeader = document.querySelector(".site-header")
let lastScroll = 0
const backToTopBtn = document.getElementById("backToTopBtn");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset

  if (currentScroll > 50) {
    siteHeader.classList.add("scrolled")
  } else {
    siteHeader.classList.remove("scrolled")
  }

  // Show/hide back to top button
  if (backToTopBtn) {
    if (currentScroll > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  }

  lastScroll = currentScroll
})

// FAQ Accordion
const faqItems = document.querySelectorAll(".faq-item")

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question")

  question.addEventListener("click", () => {
    const isActive = item.classList.contains("active")

    // Close all FAQ items
    faqItems.forEach((faq) => faq.classList.remove("active"))

    // Open clicked item if it wasn't active
    if (!isActive) {
      item.classList.add("active")
    }
  })
})

// Hero Search (if exists on homepage)
const heroSearch = document.getElementById("heroSearch")
const searchBtn = document.querySelector(".search-btn")

if (searchBtn && heroSearch) {
  searchBtn.addEventListener("click", () => {
    const searchQuery = heroSearch.value.trim()
    if (searchQuery) {
      window.location.href = `attractions.html?search=${encodeURIComponent(searchQuery)}`
    }
  })
}

if (heroSearch) {
  heroSearch.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const searchQuery = heroSearch.value.trim()
      if (searchQuery) {
        window.location.href = `attractions.html?search=${encodeURIComponent(searchQuery)}`
      }
    }
  })
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href")
    if (href !== "#") {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }
  })
})

function checkAuthState() {
  const authLink = document.getElementById("authLink");
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (authLink) {
      if (token && user) {
          try {
              const userData = JSON.parse(user);
              // Update icon to link to profile, using full_name from backend
              authLink.href = "profile.html";
              authLink.setAttribute('aria-label', `View profile for ${userData.full_name}`);
          } catch (e) { console.error("Error parsing user data from localStorage", e); }
      } else {
          // Update icon to link to login
          authLink.href = "login.html";
          authLink.setAttribute('aria-label', 'Login or create an account');
      }
  }
}

// Add loading animation for images and set current year
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img")

  images.forEach((img) => {
    img.addEventListener("load", () => {
      img.style.opacity = "1"
    })
  })

  // Set current year in footer
  const currentYearElement = document.getElementById("currentYear")
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear()
  }

  // Scroll-in animations
  const sectionsToAnimate = document.querySelectorAll('.fade-in-section');
  if (sectionsToAnimate.length > 0) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -100px 0px' // Trigger a bit before it's fully in view
    });

    sectionsToAnimate.forEach(section => {
      observer.observe(section);
    });
  }

  // Image lazy loading
  const lazyImages = document.querySelectorAll('img.lazy');
  if (lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.remove('lazy');
          image.addEventListener('load', () => {
            image.style.opacity = '1';
          });
          observer.unobserve(image);
        }
      });
    });

    lazyImages.forEach(image => {
      imageObserver.observe(image);
    });
  }

  // Check authentication state on every page load
  checkAuthState();
})

// Theme switcher
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-theme');
        themeToggle.innerHTML = `
            <svg class="icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
    } else {
        body.classList.remove('light-theme');
        themeToggle.innerHTML = `
            <svg class="icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}

// Apply saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

// Back to top button functionality
if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}
