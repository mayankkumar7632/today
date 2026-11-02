// KaamSetu - OpenStreetMap geocoding service

const geocodeCache = new Map();
let lastRequestTime = 0;

const waitForRateLimit = async () => {
  const waitMs = Math.max(0, 1000 - (Date.now() - lastRequestTime));
  if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs));
};

const geocodeAddress = async (address = '', city = '') => {
  const query = [address, city].filter(value => typeof value === 'string' && value.trim()).join(', ').trim();
  if (!query) return null;

  const cacheKey = query.toLowerCase();
  if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey);

  try {
    await waitForRateLimit();
    lastRequestTime = Date.now();
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'KaamSetu-MCA-Project' }
    });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);

    const results = await response.json();
    const coordinates = results.length
      ? [Number(results[0].lon), Number(results[0].lat)]
      : null;
    geocodeCache.set(cacheKey, coordinates);
    return coordinates;
  } catch (error) {
    console.error('Geocoding failed:', error.message);
    geocodeCache.set(cacheKey, null);
    return null;
  }
};

const reverseGeocode = async (lat, lng) => {
  try {
    await waitForRateLimit();
    lastRequestTime = Date.now();
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'KaamSetu-MCA-Project' }
    });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);

    const result = await response.json();
    const addressDetails = result.address || {};
    return {
      city: addressDetails.city || addressDetails.town || addressDetails.village || addressDetails.county || '',
      address: result.display_name || ''
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    return null;
  }
};

module.exports = { geocodeAddress, reverseGeocode };
