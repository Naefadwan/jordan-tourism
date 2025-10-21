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

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset

  if (currentScroll > 100) {
    siteHeader.classList.add("scrolled")
  } else {
    siteHeader.classList.remove("scrolled")
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

// Auth State Management (Simple localStorage-based)
function checkAuthState() {
  const authLink = document.getElementById("authLink")
  const user = localStorage.getItem("user")

  if (user && authLink) {
    const userData = JSON.parse(user)
    authLink.textContent = userData.name || "Profile"
    authLink.href = "profile.html"
  }
}

// Initialize auth state on page load
checkAuthState()

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
})
