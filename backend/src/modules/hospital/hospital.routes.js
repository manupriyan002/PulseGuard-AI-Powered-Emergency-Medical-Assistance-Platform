const express = require('express');
const router = express.Router();
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const axios = require('axios');

/**
 * Fetch nearby hospitals from Overpass API (OpenStreetMap)
 */
const fetchNearbyHospitals = async (lat, lng, radius = 5000) => {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
    );
    out center body;
  `;

  const response = await axios.post(overpassUrl, `data=${encodeURIComponent(query)}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PulseGuard/1.0 (Emergency Medical App)',
    },
    timeout: 10000,
  });

  return response.data.elements.map(el => {
    const hospLat = el.lat || el.center?.lat;
    const hospLng = el.lon || el.center?.lon;
    const distance = calculateDistance(lat, lng, hospLat, hospLng);

    return {
      id: el.id,
      name: el.tags?.name || 'Unnamed Hospital',
      lat: hospLat,
      lng: hospLng,
      distance: Math.round(distance * 100) / 100, // km, 2 decimal places
      estimatedTime: Math.round((distance / 40) * 60), // minutes at ~40 km/h
      phone: el.tags?.phone || '',
      website: el.tags?.website || '',
    };
  }).sort((a, b) => a.distance - b.distance);
};

/**
 * Haversine formula to calculate distance between two coordinates
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// GET /api/hospitals/nearby
router.get('/nearby', asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    throw new ApiError(400, 'lat and lng query parameters are required.');
  }

  const hospitals = await fetchNearbyHospitals(
    parseFloat(lat),
    parseFloat(lng),
    parseInt(radius) || 5000
  );

  res.status(200).json({
    success: true,
    count: hospitals.length,
    hospitals,
  });
}));

module.exports = router;
