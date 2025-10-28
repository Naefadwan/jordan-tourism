# Discover Jordan - Tourism Website

A beautiful, responsive front-end prototype for a tourism website showcasing Jordan's incredible attractions, accommodations, and experiences. Includes a simulated multi-step booking process.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, modern design with smooth animations and a light/dark theme switcher.
- **Interactive Attractions**: Browse, search, and filter Jordan's top attractions with real-time updates.
- **Accommodation Details**: View detailed pages for lodging with an image gallery and booking widget.
- **Multi-Step Booking Form**: A simulated, multi-step booking process with custom form validation.
- **Personalization**: Users can "like" attractions, and their choices are saved to a dedicated "My Likes" page using `localStorage`.

## Pages

- **Homepage** (`index.html`): Hero section, featured destinations, and experiences
- **Attractions** (`attractions.html`): Complete list of Jordan's attractions with filtering
- **Accommodations** (`accommodations.html`): Hotels and lodging options
- **Accommodation Detail** (`accommodation-detail.html`): A detailed view of a single accommodation.
- **Experiences** (`experiences.html`): A page for guided tours and activities.
- **My Likes** (`liked-attractions.html`): A page that displays all attractions the user has liked.
- **Booking** (`booking.html`): A multi-step booking form simulation.

## Getting Started



### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Start a local development server:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js (if you have it installed)
npx live-server
```

4. Open your browser and visit `http://localhost:8000`

## Project Structure

```
jordan-tourism/
├── index.html              # Homepage
├── attractions.html        # Attractions listing page
├── accommodations.html     # Accommodations page
├── accommodation-detail.html # Single accommodation detail page
├── experiences.html        # Experiences page
├── liked-attractions.html  # Liked attractions page
├── booking.html            # Multi-step booking form page
├── styles/
│   └── main.css           # Main stylesheet
├── scripts/
│   ├── main.js            # Core JavaScript functionality
│   └── attractions.js     # Attractions page functionality
│   └── accommodation-detail.js # Accommodation detail page script
│   └── liked-attractions.js  # Liked attractions page script
│   └── booking.js         # Booking page script
├── public/                # Images and assets
└── package.json           # Project configuration
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: Interactive functionality without frameworks
- **Responsive Design**: Mobile-first approach
- **Google Fonts**: Typography (Geist & Playfair Display)

## Features Implemented

### Navigation
- Responsive header with mobile menu
- Smooth scrolling navigation
- Active page highlighting

### Attractions Page
- Search functionality
- Category filtering (Historical, Nature, Adventure)
- Sorting by price and rating
- Interactive cards with hover effects

### Interactive Elements
- FAQ accordion
- Mobile menu toggle
- Image loading animations
- Smooth transitions and hover effects

## Customization

### Adding New Attractions
1. Open `attractions.html`
2. Add a new `.attraction-card` div in the attractions grid
3. Include the required data attributes: `data-category`, `data-price`, `data-rating`
4. Update the JavaScript filtering logic if needed

### Styling
- Main styles are in `styles/main.css`
- Uses CSS custom properties for easy theming
- Responsive breakpoints: mobile (768px), tablet (1024px), desktop (1200px+)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)


## Contact

For questions or support, please contact us at info@discoverjordan.com
