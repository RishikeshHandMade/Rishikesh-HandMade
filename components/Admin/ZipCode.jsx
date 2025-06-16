import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";

const ZipCode = () => {
    const [selectedState, setSelectedState] = useState('');
    const [districts, setDistricts] = useState([]);
    const [view, setView] = useState('states'); // 'states' or 'districts'

    const [districtStatus, setDistrictStatus] = useState({}); // { districtName: true/false }
    const [stateStatus, setStateStatus] = useState({});
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [charges, setCharges] = useState([{ amount: '', label: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingCharges, setShippingCharges] = useState([]);
    const [editId, setEditId] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
    // State/district data will now be fetched from the API
    const [stateDistrictData, setStateDistrictData] = useState([]);
    // console.log(stateDistrictData)

    // Toggle handlers
    const handleStateToggle = (stateName) => {
        setStateStatus(prev => ({
            ...prev,
            [stateName]: !prev[stateName]
        }));
        // Optionally: add API call to persist
    };
    const handleDistrictToggle = (districtName) => {
        setDistrictStatus(prev => ({
            ...prev,
            [districtName]: !prev[districtName]
        }));
        // Optionally: add API call to persist
    };

// Drilldown handlers
    const handleStateClick = (stateObj) => {
        setSelectedState(stateObj.state);
        setDistricts(stateObj.districts || []);
        setView('districts');
    };
    const handleBack = () => {
        setView('states');
        setSelectedState('');
        setDistricts([]);
    };

    // Fetch state/district data from API on mount
    useEffect(() => {
        const fetchStateDistrictData = async () => {
            try {
                const response = await fetch('/api/zipcode');
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setStateDistrictData(result.data);
                } else {
                    throw new Error(result.error || 'Failed to fetch state/district data');
                }
            } catch (error) {
                toast.error('Failed to fetch state/district data');
                setStateDistrictData([]);
            }
        };
        fetchStateDistrictData();
    }, []);

    const renderStatesTable = () => (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-center">States</h2>
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-blue-100">
                        <th className="border px-4 py-2 text-left">State</th>
                        <th className="border px-4 py-2 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {stateDistrictData.map((stateObj, idx) => (
                        <tr key={stateObj.state + '-' + idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border px-4 py-2 font-semibold text-left">
                                <button
                                    className="hover:underline text-blue-700 text-lg"
                                    onClick={() => handleStateClick(stateObj)}
                                >
                                    {stateObj.state}
                                </button>
                            </td>
                            <td className="border px-4 py-2 text-center">
                                <label className="inline-flex items-center cursor-pointer">
                                    <span className="mr-2 font-semibold">
                                        {stateStatus[stateObj.state] !== false ? "Active" : "Inactive"}
                                    </span>
                                    <span className="relative">
                                        <input
                                            type="checkbox"
                                            checked={stateStatus[stateObj.state] !== false}
                                            onChange={() => handleStateToggle(stateObj.state)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                                    </span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // District Table View
    const renderDistrictsTable = () => (
        <div>
            <button
                className="mb-4 bg-gray-400 hover:bg-gray-500 text-black font-semibold py-2 px-4 rounded"
                onClick={handleBack}
            >
                ← Back to States
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Districts in {selectedState}</h2>
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-blue-100">
                        <th className="border px-4 py-2 text-left">District</th>
                        <th className="border px-4 py-2 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {districts.map((districtObj, idx) => (
                        <tr key={districtObj.district + '-' + idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border px-4 py-2 text-left">{districtObj.district}</td>
                            <td className="border px-4 py-2 text-center">
                                <label className="inline-flex items-center cursor-pointer">
                                    <span className="mr-2 font-semibold">
                                        {districtStatus[districtObj.district] !== false ? "Active" : "Inactive"}
                                    </span>
                                    <span className="relative">
                                        <input
                                            type="checkbox"
                                            checked={districtStatus[districtObj.district] !== false}
                                            onChange={() => handleDistrictToggle(districtObj.district)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                                    </span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    return (
        <div className="bg-white max-w-2xl min-h-[80vh] flex flex-col justify-start items-center">
            {error && (
                <div className="text-red-500 text-center mb-4">{error}</div>
            )}

            <div>
                {view === 'states' ? renderStatesTable() : renderDistrictsTable()}
            </div>

            {/* State/District Management UI */}
            {/* {!selectedState ? (
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
                            {Array.isArray(stateDistrictData) && stateDistrictData.map(stateObj => (
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
            )} */}
        </div>
    )
}

export default ZipCode;

