"use client"
import React, { useState, useEffect } from 'react';
import { statesIndia } from '@/lib/IndiaStates';
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";

// Unwrap the states array from the imported JSON
const stateDistrictData = statesIndia[0].states;

const ShippingCharge = () => {
  const [selectedState, setSelectedState] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [charges, setCharges] = useState([{ amount: '', label: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingCharges, setShippingCharges] = useState([]);
  const [editId, setEditId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // Fetch shipping charges
  useEffect(() => {
    const fetchShippingCharges = async () => {
      try {
        const response = await fetch('/api/shippingCharges');
        const data = await response.json();
        console.log(data);
        setShippingCharges(data);
      } catch (error) {
        console.error('Error fetching shipping charges:', error);
        toast.error('Failed to fetch shipping charges');
      }
    };
    fetchShippingCharges();
  }, []);

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

  // Save shipping charges to API
  const saveShippingCharges = async () => {
    if (!selectedState || !selectedDistrict || !pinCode || charges.some(c => !c.amount || !c.label)) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const shippingData = {
        state: selectedState,
        districts: [
          {
            district: selectedDistrict,
            pincodes: [
              {
                pincode: pinCode,
                shippingCharges: charges.map(c => ({
                  weight: Number(c.label) || 0,
                  shippingCharge: Number(c.amount) || 0
                }))
              }
            ]
          }
        ],
      };

      const response = await fetch('/api/shippingCharges', {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editId ? { ...shippingData, _id: editId } : shippingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save shipping charges');
      }

      const data = await response.json();
      toast.success(editId ? 'Shipping charges updated successfully!' : 'Shipping charges saved successfully!');
      setSelectedState('');
      setSelectedDistrict('');
      setPinCode('');
      setCharges([{ amount: '', label: '' }]);
      setEditId(null);

      // Refresh the list after successful save
      const fetchShippingCharges = async () => {
        try {
          const response = await fetch('/api/shippingCharges');
          const data = await response.json();
          setShippingCharges(data);
        } catch (error) {
          console.error('Error refreshing shipping charges:', error);
          toast.error('Failed to refresh shipping charges');
        }
      };
      fetchShippingCharges();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit shipping charge entry
  const handleEdit = (charge) => {
    setEditId(charge._id);
    setSelectedState(charge.state);
    setSelectedDistrict(charge.district);
    setPinCode(charge.pincode);
    setCharges(charge.charges.map(c => ({
      amount: c.shippingCharge.toString(),
      label: c.weight.toString()
    })));
  };

  // Delete shipping charge entry
  const handleDelete = (id) => {
    setDeleteDialog({ open: true, id });
  };

  // Confirm delete
  const confirmDelete = async () => {
    const id = deleteDialog.id;
    setDeleteDialog({ open: false, id: null });
    try {
      const response = await fetch(`/api/shippingCharges?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Shipping charges deleted successfully!');
        await fetchShippingCharges();
      } else {
        toast.error('Failed to delete shipping charges');
      }
    } catch (error) {
      toast.error('Failed to delete shipping charges');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-[80vh] flex flex-col justify-center">
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}
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
        <label className="font-bold text-lg col-span-1">Type District Name</label>
        <select
          className="col-span-2 bg-blue-100 text-black font-bold text-lg px-6 py-2 rounded focus:outline-none"
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
          disabled={!districts.length}
        >
          <option value="">Select</option>
          {districts.map(district => (
            <option value={district} key={district}>{district}</option>
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
            <div className="bg-blue-200 text-black font-bold text-lg text-center py-2 rounded">Amount</div>
            <div className="bg-blue-200 text-black font-bold text-lg text-center py-2 rounded">Weight</div>
          </div>
          {charges.map((row, idx) => (
            <div className="grid grid-cols-2 gap-2 mb-2" key={idx}>
              <input
                type="number"
                className="bg-blue-200 text-black font-normal text-lg px-4 py-2 rounded placeholder-black focus:outline-none"
                placeholder="Enter Amount"
                value={row.amount}
                onChange={e => handleChargeChange(idx, 'amount', e.target.value)}
              />
              <input
                type="text"
                className="bg-blue-200 text-black font-normal text-lg px-4 py-2 rounded placeholder-black focus:outline-none"
                placeholder="Enter Weight in Kg"
                value={row.label}
                onChange={e => handleChargeChange(idx, 'label', e.target.value)}
              />
            </div>
          ))}
          <button
            className="bg-gray-500 text-black font-bold px-6 py-2 mt-2 rounded"
            type="button"
            onClick={addChargeRow}
          >Add More +</button>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <button
          className="bg-red-500 text-black font-bold text-lg px-16 py-3 rounded hover:bg-blue-800"
          onClick={saveShippingCharges}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Data'}
        </button>
      </div>

      {/* Table Section */}
      <div className="w-full mt-8">

        {/* Table Section */}
        <div className="w-full mt-8">
          <h2 className="text-2xl font-bold mb-4">Shipping Charges List</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border px-4 py-2">State</th>
                  <th className="border px-4 py-2">District</th>
                  <th className="border px-4 py-2">Pincode</th>
                  <th className="border px-4 py-2">Weight</th>
                  <th className="border px-4 py-2">Shipping Charge</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shippingCharges.map((charge, chargeIdx) => (
                  <React.Fragment key={charge._id || `charge-${chargeIdx}`}>
                    {charge.districts.map((district, dIdx) => (
                      <React.Fragment key={`${charge._id}-d-${dIdx}`}>
                        {district.pincodes.map((pincode, pIdx) => (
                          <React.Fragment key={`${charge._id}-${dIdx}-p-${pIdx}`}>
                            {pincode.shippingCharges.map((c, cIdx) => (
                              <tr key={`${charge._id}-${dIdx}-${pIdx}-${cIdx}`} className="border-b">
                                {cIdx === 0 ? (
                                  <>
                                    <td className="border px-4 py-2">{charge.state}</td>
                                    <td className="border px-4 py-2">{district.district}</td>
                                    <td className="border px-4 py-2">{pincode.pincode}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="border px-4 py-2"></td>
                                    <td className="border px-4 py-2"></td>
                                    <td className="border px-4 py-2"></td>
                                  </>
                                )}
                                <td className="border px-4 py-2">{c.weight}</td>
                                <td className="border px-4 py-2">{c.shippingCharge}</td>
                                <td className="border px-4 py-2">
                                  <button
                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                    onClick={() =>
                                      handleEdit({
                                        _id: charge._id,
                                        state: charge.state,
                                        district: district.district,
                                        pincode: pincode.pincode,
                                        charges: pincode.shippingCharges
                                      })
                                    }
                                  >
                                    Edit
                                  </button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDelete(charge._id)}
                                      >
                                        Delete
                                      </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete shipping charges for {charge.state}, {district.district}, {pincode.pincode}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => confirmDelete(charge._id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingCharge;