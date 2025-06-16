// Script to import all states, districts, and cities with pincode from IndiaStates.js into the ZipCode collection
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

// URL for the nested JSON data
const DATA_URL = 'https://raw.githubusercontent.com/ankitnishad6313/state-district-town-pincode/refs/heads/master/india_states_districts_cities_pincodes_nested.json';

// Fetch and parse the data before running main
let statesIndia = [];

const ZipCode = require('../models/ZipCode.js');

// Update with your connection string or use dotenv
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rishikeshhandmade:ehvH1ibP92L1LqvK@cluster0.emf2o1g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  // Fetch the JSON data from the URL
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  statesIndia = await response.json();
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Remove all existing ZipCode documents (optional, for clean import)
  await ZipCode.deleteMany({});

  // Prepare data
  const docs = statesIndia.map(stateObj => ({
    state: stateObj.state,
    active: true,
    districts: stateObj.districts.map(districtObj => ({
      district: districtObj.district,
      active: true,
      cities: (districtObj.cities || []).map(cityObj => ({
        city: cityObj.city,
        pincode: cityObj.pincode || '',
        active: true
      }))
    }))
  }));
  console.log('Prepared docs count:', docs.length);
  try {
    const result = await ZipCode.insertMany(docs);
    console.log('Inserted docs count:', result.length);
  } catch (err) {
    console.error('InsertMany error:', err);
  }
  
  // Insert all
  await ZipCode.insertMany(docs);
  console.log('Imported all states, districts, and cities!');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
