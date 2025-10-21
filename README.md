# Discover Jordan - Tourism Website

A beautiful, responsive tourism website showcasing Jordan's incredible attractions, accommodations, and experiences.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Attractions**: Browse and filter Jordan's top attractions
- **Modern UI**: Clean, modern design with smooth animations
- **Search & Filter**: Find attractions by category, price, and rating
- **Mobile-Friendly**: Optimized mobile navigation and interactions

## Pages

- **Homepage** (`index.html`): Hero section, featured destinations, and experiences
- **Attractions** (`attractions.html`): Complete list of Jordan's attractions with filtering
- **Accommodations** (`accommodations.html`): Hotels and lodging options
- **Experiences** (`experiences.html`): Guided tours and activities

## Getting Started

### Prerequisites

- A modern web browser
- Python 3.x (for local development server)

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
├── experiences.html        # Experiences page
├── styles/
│   └── main.css           # Main stylesheet
├── scripts/
│   ├── main.js            # Core JavaScript functionality
│   └── attractions.js     # Attractions page functionality
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

## License

MIT License - feel free to use this project for your own tourism website.

## Contact

For questions or support, please contact us at info@discoverjordan.com
