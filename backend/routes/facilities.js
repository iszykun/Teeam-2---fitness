const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Helper function to resolve postal code via OneMap API
function resolvePostalCodeViaOneMap(postalCode) {
  return new Promise((resolve, reject) => {
    const url = `https://www.onemap.sg/api/common/elastic/search?queryString=${encodeURIComponent(postalCode)}&returnGeom=Y&getAddrDetails=Y`;
    
    const req = https.get(url, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (!jsonData.results || jsonData.results.length === 0) {
            reject(new Error('Postal code not found'));
          } else {
            const result = jsonData.results[0];
            resolve({
              lat: parseFloat(result.LATITUDE),
              lng: parseFloat(result.LONGITUDE),
              address: result.ADDRESS || 'Singapore'
            });
          }
        } catch (e) {
          reject(new Error('Failed to parse OneMap response'));
        }
      });
    }).on('error', (err) => {
      reject(new Error('OneMap API unavailable - using local database'));
    }).on('timeout', () => {
      req.destroy();
      reject(new Error('OneMap API timeout - using local database'));
    });
  });
}

// Fallback: resolve postal code from local facilities database
function resolvePostalCodeLocal(postalCode) {
  const facilities = loadFacilities();
  const facility = facilities.find(f => f.postal_code === postalCode);
  
  if (!facility) {
    throw new Error(`Postal code ${postalCode} not found. Try one of: ${facilities.map(f => f.postal_code).slice(0, 5).join(', ')}`);
  }
  
  return {
    lat: facility.lat,
    lng: facility.lng,
    address: facility.address || 'Singapore'
  };
}

// GET /api/facilities/resolve-postal/:postalCode - Resolve postal code to coordinates
router.get('/resolve-postal/:postalCode', async (req, res) => {
  try {
    const { postalCode } = req.params;
    
    if (!postalCode || postalCode.length < 5 || postalCode.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid postal code format (must be 5-6 digits)'
      });
    }

    let coords;
    
    // Try OneMap API first
    try {
      coords = await resolvePostalCodeViaOneMap(postalCode);
    } catch (error) {
      console.log('OneMap failed, using local database:', error.message);
      // Fallback to local database
      coords = resolvePostalCodeLocal(postalCode);
    }
    
    res.json({
      success: true,
      ...coords
    });
  } catch (error) {
    console.error('Error resolving postal code:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to resolve postal code'
    });
  }
});

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
