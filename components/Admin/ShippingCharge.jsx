"use client"
import React, { useState } from 'react';
import { statesIndia } from '../../lib/IndiaStates';


const shippingLabels = [
  'Per Piece',
];

const ShippingCharge = () => {
  const [selectedState, setSelectedState] = useState('');
  const [districts, setDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError, setDistrictError] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [charges, setCharges] = useState([
    { amount: '', label: '' },
  ]);

  // Add new row for shipping charges
  const addChargeRow = () => {
    setCharges([...charges, { amount: '', label: '' }]);
  };

  // Handle state change
  const handleStateChange = async (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedDistrict('');
    setDistricts([]);
    setDistrictError('');
    if (!state) return;
    setDistrictLoading(true);
    try {
      // For demo: use a public endpoint for districts. Replace with your own API key if needed.
      // We'll use https://api.api-ninjas.com/v1/indian_cities?state={state} as an example (no API key needed for demo)
      const res = await fetch(`https://api.api-ninjas.com/v1/indian_cities?state=${encodeURIComponent(state)}`);
      if (!res.ok) throw new Error('Failed to fetch districts');
      const data = await res.json();
      const uniqueDistricts = Array.from(new Set(data.map(city => city.district))).filter(Boolean);
      setDistricts(uniqueDistricts);
    } catch (err) {
      setDistrictError('Could not load districts.');
      setDistricts([]);
    } finally {
      setDistrictLoading(false);
    }
  };

  // Handle charge amount/label change
  const handleChargeChange = (idx, field, value) => {
    setCharges(charges.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-[80vh] flex flex-col justify-center">
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <label className="font-bold text-lg col-span-1">Select State</label>
        <select
          className="col-span-2 bg-blue-900 text-white font-bold text-lg px-6 py-2 rounded focus:outline-none"
          value={selectedState}
          onChange={handleStateChange}
        >
          <option value="">Select</option>
          {statesIndia.map(state => (
            <option value={state} key={state}>{state}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <label className="font-bold text-lg col-span-1">Type Dist. Name</label>
        <select
          className="col-span-2 bg-blue-900 text-white font-bold text-lg px-6 py-2 rounded focus:outline-none"
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
          disabled={districtLoading || !!districtError || !districts.length}
        >
          {districtLoading ? (
            <option>Loading...</option>
          ) : districtError ? (
            <option>{districtError}</option>
          ) : (
            <>
              <option value="">Select</option>
              {districts.map(dist => (
                <option value={dist} key={dist}>{dist}</option>
              ))}
            </>
          )}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <label className="font-bold text-lg col-span-1">Type Pin Code</label>
        <input
          className="col-span-2 bg-orange-500 text-white font-bold text-lg px-6 py-2 rounded placeholder-white focus:outline-none"
          placeholder="Type Here"
          value={pinCode}
          onChange={e => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
          maxLength={6}
        />
      </div>
      <div className="grid grid-cols-3 gap-4 items-start mb-4">
        <label className="font-bold text-lg col-span-1">Shipping Charges</label>
        <div className="col-span-2 w-full">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-green-600 text-white font-bold text-lg text-center py-2 rounded">Amount</div>
            <div className="bg-green-600 text-white font-bold text-lg text-center py-2 rounded">Label</div>
          </div>
          {charges.map((row, idx) => (
            <div className="grid grid-cols-2 gap-2 mb-2" key={idx}>
              <input
                type="number"
                className="bg-green-500 text-white font-bold text-lg px-4 py-2 rounded placeholder-white focus:outline-none"
                placeholder="Amount"
                value={row.amount}
                onChange={e => handleChargeChange(idx, 'amount', e.target.value)}
              />
              <input
                type="text"
                className="bg-green-500 text-white font-bold text-lg px-4 py-2 rounded placeholder-white focus:outline-none"
                placeholder="Label"
                value={row.label}
                onChange={e => handleChargeChange(idx, 'label', e.target.value)}
              />
            </div>
          ))}
          <button
            className="bg-blue-900 text-white font-bold px-6 py-2 mt-2 rounded hover:bg-blue-800"
            type="button"
            onClick={addChargeRow}
          >Add More</button>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <button className="bg-blue-900 text-white font-bold text-lg px-16 py-3 rounded hover:bg-blue-800">Data Save</button>
      </div>
    </div>
  );
};

export default ShippingCharge;