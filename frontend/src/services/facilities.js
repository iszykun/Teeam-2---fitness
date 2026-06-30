// Frontend service for facilities API and OneMap integration

/**
 * Resolve a Singapore postal code to coordinates using backend API
 * @param {string} postalCode - Singapore postal code (e.g., "738600")
 * @returns {Promise<{lat: number, lng: number}>} Coordinates
 */
async function resolvePostalCode(postalCode) {
  try {
    const response = await fetch(`/api/facilities/resolve-postal/${postalCode}`, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to resolve postal code');
    }

    return {
      lat: data.lat,
      lng: data.lng,
      address: data.address || 'Singapore'
    };
  } catch (error) {
    console.error('Error resolving postal code:', error);
    throw new Error('Invalid postal code');
  }
}

/**
 * Search for facilities by coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} type - Type filter: "gym", "track", or "" for both
 * @returns {Promise<{count: number, facilities: Array}>} Search results
 */
async function searchFacilities(lat, lng, type = '') {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString()
    });

    if (type) {
      params.append('type', type);
    }

    const response = await fetch(`/api/facilities?${params}`, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to search facilities');
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Search failed');
    
    return data;
  } catch (error) {
    console.error('Error searching facilities:', error);
    throw error;
  }
}

/**
 * Search for facilities by postal code and optional type filter
 * @param {string} postalCode - Singapore postal code
 * @param {string} type - Type filter: "gym", "track", or "" for both
 * @returns {Promise<{lat: number, lng: number, count: number, facilities: Array}>}
 */
async function searchByPostalCode(postalCode, type = '') {
  const coords = await resolvePostalCode(postalCode);
  const results = await searchFacilities(coords.lat, coords.lng, type);
  return {
    ...coords,
    ...results
  };
}

// Export functions (for vanilla JS, just assign to window)
window.facilitiesService = {
  resolvePostalCode,
  searchFacilities,
  searchByPostalCode
};
