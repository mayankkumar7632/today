// KaamSetu - Geocode existing records with placeholder coordinates.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const { geocodeAddress } = require('../services/geocodingService');

const wait = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const updateCollection = async (model, name) => {
  const documents = await model.find({
    'location.coordinates': [0, 0],
    $or: [{ 'location.address': { $ne: '' } }, { 'location.city': { $ne: '' } }]
  });
  let updated = 0;
  let failed = 0;

  for (let index = 0; index < documents.length; index += 1) {
    const document = documents[index];
    const coordinates = await geocodeAddress(document.location.address, document.location.city);
    if (coordinates) {
      await model.updateOne({ _id: document._id }, { $set: { 'location.coordinates': coordinates } });
      updated += 1;
    } else {
      failed += 1;
    }
    if (index < documents.length - 1) await wait(1100);
  }

  console.log(`${name}: updated ${updated}, failed ${failed}`);
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await updateCollection(WorkerProfile, 'WorkerProfile');
    await updateCollection(EmployerProfile, 'EmployerProfile');
    await updateCollection(Job, 'Job');
  } catch (error) {
    console.error('Existing location geocoding failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();
