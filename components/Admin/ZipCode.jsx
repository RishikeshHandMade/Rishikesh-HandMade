
import React, { useState, useEffect } from 'react';
import { statesIndia } from '@/lib/IndiaStates';
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";

// Unwrap the states array from the imported JSON
const stateDistrictData = statesIndia;

const ZipCode = () => {
    const [selectedState, setSelectedState] = useState('');
    const [districts, setDistricts] = useState([]);
    const [districtStatus, setDistrictStatus] = useState({}); // { districtName: true/false }
    const [stateStatus, setStateStatus] = useState(() => {
        // Initialize all as active by default
        const obj = {};
        stateDistrictData.forEach(s => { obj[s.state] = true; });
        return obj;
    });
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
        // Reset district status (default all active)
        if (found && found.districts) {
            const newStatus = {};
            found.districts.forEach(d => { newStatus[d.district] = true; });
            setDistrictStatus(newStatus);
        } else {
            setDistrictStatus({});
        }
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
        <div className="bg-white min-h-[80vh] flex flex-col justify-start items-center">
            {error && (
                <div className="text-red-500 text-center mb-4">{error}</div>
            )}
            {/* State/District Management UI */}
            {!selectedState ? (
                <div className="w-full max-w-2xl mx-auto mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-center">Manage States</h2>
                    <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="border px-4 py-2 text-left">State</th>
                                <th className="border px-4 py-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stateDistrictData.map(stateObj => (
                                <tr key={stateObj.state} className="hover:bg-blue-50 cursor-pointer">
                                    <td
                                        className="border px-4 py-2 font-semibold hover:underline"
                                        onClick={() => {
                                            setSelectedState(stateObj.state);
                                            setDistricts(stateObj.districts);
                                            // Optionally, initialize district status here
                                        }}
                                    >
                                        {stateObj.state}
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Toggle Switch for state */}
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={stateStatus?.[stateObj.state] ?? true}
                                                    onChange={() => {
                                                        setStateStatus(prev => ({
                                                            ...prev,
                                                            [stateObj.state]: !(prev?.[stateObj.state] ?? true)
                                                        }));
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all duration-200"></div>
                                                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-all duration-200 peer-checked:translate-x-5"></div>
                                            </label>
                                            <span className={`ml-2 font-semibold ${stateStatus?.[stateObj.state] ?? true ? 'text-green-600' : 'text-red-500'}`}>{stateStatus?.[stateObj.state] ?? true ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="w-full max-w-2xl mx-auto mt-8">
                    <div className="flex items-center mb-4">
                        <button
                            className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => setSelectedState('')}
                        >
                            ← Back
                        </button>
                        <h2 className="text-xl font-bold">Manage Districts for {selectedState}</h2>
                    </div>
                    <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="border px-4 py-2 text-left">District</th>
                                <th className="border px-4 py-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {districts.map(districtObj => (
                                <tr key={districtObj.district} className="hover:bg-blue-50">
                                    <td className="border px-4 py-2">{districtObj.district}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Toggle Switch for district */}
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={districtStatus[districtObj.district] ?? true}
                                                    onChange={() => {
                                                        setDistrictStatus(prev => ({
                                                            ...prev,
                                                            [districtObj.district]: !(prev[districtObj.district] ?? true)
                                                        }));
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all duration-200"></div>
                                                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-all duration-200 peer-checked:translate-x-5"></div>
                                            </label>
                                            <span className={`ml-2 font-semibold ${districtStatus[districtObj.district] ?? true ? 'text-green-600' : 'text-red-500'}`}>{districtStatus[districtObj.district] ?? true ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default ZipCode;

