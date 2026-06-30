const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Load facilities data from JSON file
function loadFacilities() {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'facilities.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading facilities:', error);
    return [];
  }
}

// GET /api/facilities - Search facilities by coordinates with optional filters
router.get('/', (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    // Validate lat and lng
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Missing lat or lng parameters'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lat or lng values'
      });
    }

    const facilities = loadFacilities();

    // Filter facilities: only public ones
    let filtered = facilities.filter(f => f.public === true);

    // Apply type filter if specified
    if (type) {
      const types = type.split(',').map(t => t.trim().toLowerCase());
      filtered = filtered.filter(f => types.includes(f.type.toLowerCase()));
    }

    // Calculate distances and add to each facility
    const withDistances = filtered.map(facility => ({
      ...facility,
      distance_km: parseFloat(calculateDistance(userLat, userLng, facility.lat, facility.lng).toFixed(2))
    }));

    // Sort by distance (nearest first)
    const sorted = withDistances.sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      success: true,
      count: sorted.length,
      facilities: sorted
    });
  } catch (error) {
    console.error('Error searching facilities:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
