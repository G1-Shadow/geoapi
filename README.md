# GeoApp - Location Tracking Application

A React application for tracking user location using Azure Maps.

## Features

- Real-time location tracking
- Azure Maps integration
- Contact form
- Responsive design
- Modern UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Azure Maps subscription key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Azure Maps key:
   ```
   REACT_APP_AZURE_MAPS_KEY=your_azure_maps_key_here
   ```
4. Replace the Azure Maps key in `src/pages/LocationTracker.tsx` with your key from the `.env` file:
   ```typescript
   subscriptionKey: process.env.REACT_APP_AZURE_MAPS_KEY
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
```

## Technologies Used

- React
- TypeScript
- Azure Maps
- React Router
- CSS3

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Note

Make sure to enable location services in your browser to use the location tracking feature. 