const isCoordinate = (value) =>
  (typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '')) &&
  Number.isFinite(Number(value));

const normalizeGeoLocation = (location = {}) => {
  const input = location && typeof location === 'object' && !Array.isArray(location)
    ? location
    : {};
  const inputCoordinates = input.coordinates;
  let coordinates = [0, 0];

  if (
    Array.isArray(inputCoordinates) &&
    inputCoordinates.length === 2 &&
    inputCoordinates.every(isCoordinate)
  ) {
    const [longitude, latitude] = inputCoordinates.map(Number);
    if (
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90
    ) {
      coordinates = [longitude, latitude];
    }
  }

  return {
    type: 'Point',
    coordinates,
    address: typeof input.address === 'string' ? input.address : '',
    city: typeof input.city === 'string' ? input.city : ''
  };
};

module.exports = { normalizeGeoLocation };
