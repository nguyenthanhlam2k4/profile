# Portfolio CMS Project Documentation

This document provides an overview of the architecture, features, and implementation details of the personal portfolio website and admin CMS.

## Technology Stack
- **Frontend**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Database & Auth**: Firebase (Firestore, Authentication)
- **Image Management**: Cloudinary
- **Localization**: i18next (English & Vietnamese)

## Project Structure
```text
src/
├── components/         # Reusable UI components
│   ├── sections/       # Home page sections (About, Projects, etc.)
│   └── admin/          # Admin-specific components
├── context/            # Authentication context
├── firebase/           # Firebase configuration
├── layouts/            # Main and Admin layouts
├── pages/              # Main pages (Home, Gallery)
│   └── admin/          # Admin management pages
├── services/           # Firebase and Cloudinary API calls
└── i18n.js             # Multi-language configuration
```

## Key Features

### 1. Dynamic Home Page
- **Hero Section**: Engaging introduction with smooth animations.
- **Stacked Gallery Slider**: A premium carousel displaying the 3 most recently uploaded images from the gallery.
- **Personal Info**: Dynamically fetched from Firestore, including Birthday, Email (clickable `mailto:`), and Phone (clickable `tel:`).

### 2. Image Gallery
- **Dedicated Gallery Page**: Accessible via the "View All" button.
- **Sorting**: Filter images by "Newest" or "Oldest".
- **Date Filtering**: Search for images uploaded on a specific date.
- **Lightbox**: Interactive full-screen preview of images.

### 3. Admin CMS
- **Secure Login**: Protected routes using Firebase Auth.
- **Profile Management**: Update name, title, contact info, and manage the gallery.
- **Projects & Skills**: CRUD operations to manage portfolio content.
- **Messages**: View inquiries sent through the contact form.

## Bug Fixes & Optimizations
- **Clickability Fix**: Resolved an issue where decorative borders were blocking clicks on the "View All" button by using `pointer-events-none`.
- **Data Normalization**: Implemented logic to handle legacy string-based gallery data alongside new object-based data with timestamps.
- **Performance**: Optimized slider intervals and state management for smoother transitions.

## Future Recommendations
- **Image Optimization**: Consider using Cloudinary's auto-format and quality features for faster loading.
- **SEO**: Add meta tags and Open Graph data for better social sharing.
- **Unit Testing**: Implement Vitest or Jest for critical service logic.

---
