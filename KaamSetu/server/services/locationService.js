// KaamSetu - Location Service
// This file handles geolocation calculations

// ===========================
// Calculate Distance Between Two Points
// ===========================
// Uses the Haversine formula to calculate distance in km
// between two GeoJSON coordinates

const calculateDistance = (coords1, coords2) => {
  // coords1 and coords2 are [longitude, latitude]
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

// Convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// ===========================
// Build Geo Query
// ===========================
// Builds a MongoDB geospatial query for finding documents within a radius

const buildGeoQuery = (longitude, latitude, radiusKm) => {
  return {
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    }
  };
};

module.exports = {
  calculateDistance,
  buildGeoQuery
};
