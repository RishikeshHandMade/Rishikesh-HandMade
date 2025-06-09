"use client"
import React, { useState } from 'react';
import { statesIndia } from '@/lib/IndiaStates';

// Unwrap the states array from the imported JSON
const stateDistrictData = statesIndia[0].states;


const shippingLabels = [
  'Per Piece',
];

const ShippingCharge = () => {
  const [selectedState, setSelectedState] = useState('');
  const [districts, setDistricts] = useState([]);
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
  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedDistrict('');
    const found = stateDistrictData.find(s => s.state === state);
    setDistricts(found ? found.districts : []);
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
          className="col-span-2 bg-blue-100 text-black font-bold text-lg px-6 py-2 rounded focus:outline-none"
          value={selectedState}
          onChange={handleStateChange}
        >
          <option value="">Select</option>
          {stateDistrictData.map(state => (
            <option value={state.state} key={state.state}>{state.state}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <label className="font-bold text-lg col-span-1">Type Dist. Name</label>
        <select
          className="col-span-2 bg-blue-100 text-black font-bold text-lg px-6 py-2 rounded focus:outline-none"
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
          disabled={!districts.length}
        >
          <option value="">Select</option>
          {districts.map(dist => (
            <option value={dist} key={dist}>{dist}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <label className="font-bold text-lg col-span-1">Type Pin Code</label>
        <input
          className="col-span-2 bg-blue-100 text-black font-bold text-lg px-6 py-2 rounded placeholder-black focus:outline-none"
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
            <div className="bg-blue-300 text-black font-bold text-lg text-center py-2 rounded">Amount</div>
            <div className="bg-blue-300 text-black font-bold text-lg text-center py-2 rounded">Label</div>
          </div>
          {charges.map((row, idx) => (
            <div className="grid grid-cols-2 gap-2 mb-2" key={idx}>
              <input
                type="number"
                className="bg-blue-300 text-white font-bold text-lg px-4 py-2 rounded placeholder-black focus:outline-none"
                placeholder="Amount"
                value={row.amount}
                onChange={e => handleChargeChange(idx, 'amount', e.target.value)}
              />
              <input
                type="text"
                className="bg-blue-300 text-white font-bold text-lg px-4 py-2 rounded placeholder-black focus:outline-none"
                placeholder="Label"
                value={row.label}
                onChange={e => handleChargeChange(idx, 'label', e.target.value)}
              />
            </div>
          ))}
          <button
            className="bg-gray-400 text-black font-bold px-6 py-2 mt-2 rounded"
            type="button"
            onClick={addChargeRow}
          >Add More +</button>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <button className="bg-red-500 text-black font-bold text-lg px-16 py-3 rounded hover:bg-blue-800">Data Save</button>
      </div>
    </div>
  );
};

export default ShippingCharge;