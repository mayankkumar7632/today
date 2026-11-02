// KaamSetu - One-time location repair script
// Run with: npm run fix-locations

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const { normalizeGeoLocation } = require('../utils/geoLocation');

const repairCollection = async (model, collectionName) => {
  // Find documents whose location is missing or does not use the GeoJSON Point type.
  const documents = await model.find({
    $or: [
      { 'location.type': { $exists: false } },
      { 'location.type': { $ne: 'Point' } }
    ]
  });

  let fixedCount = 0;

  for (const document of documents) {
    await model.updateOne(
      { _id: document._id },
      { $set: { location: normalizeGeoLocation(document.location) } }
    );
    fixedCount += 1;
  }

  console.log(`${collectionName}: fixed ${fixedCount}`);
};

const fixLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await repairCollection(WorkerProfile, 'WorkerProfile');
    await repairCollection(EmployerProfile, 'EmployerProfile');
    await repairCollection(Job, 'Job');
  } catch (error) {
    console.error('Location repair failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

fixLocations();
