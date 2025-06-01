import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ApplyTax = ({ productData, productId }) => {
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [taxTable, setTaxTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const productTitle = productData?.title || "";

  // Fetch all product taxes for the table
  const fetchTaxTable = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/productTax');
      const data = await res.json();
      if (res.ok && data?.data) {
        setTaxTable(Array.isArray(data.data) ? data.data : [data.data]);
      } else {
        setError(data?.error || 'Failed to fetch tax data');
      }
    } catch (err) {
      setError('API error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch table on mount
  useEffect(() => {
    fetchTaxTable();
  }, []);

  // Helper to check if a ProductTax exists for this product
  const checkProductTaxExists = async () => {
    try {
      const res = await fetch(`/api/productTax?product=${productId}`);
      const data = await res.json();
      return !!(data?.data && (data.data.cgst !== undefined || data.data.sgst !== undefined));
    } catch {
      return false;
    }
  };

  // Editing state
  const [editingTaxId, setEditingTaxId] = useState(null);

  // Edit handler: fill form with selected row's data
  const handleEditTax = (row) => {
    setCgst(row.cgst);
    setSgst(row.sgst);
    setEditingTaxId(row._id);
  };

  // Cancel edit handler
  const handleCancelEdit = () => {
    setCgst(0);
    setSgst(0);
    setEditingTaxId(null);
  };

  // Delete handler: confirmation dialog, then delete
  const handleDeleteTax = async (row) => {
    if (!window.confirm(`Are you sure you want to delete the tax for product: ${row.product?.title || row.product}?`)) return;
    try {
      const res = await fetch('/api/productTax', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: row.product._id || row.product, tax: '__all__' })
      });
      const data = await res.json();
      console.log('[ApplyTax] DELETE response:', data, 'status:', res.status);
      if (res.ok && data.success !== false) {
        toast.success('Tax deleted!');
        fetchTaxTable();
        // If deleted row was being edited, reset form
        if (editingTaxId === row._id) {
          setCgst(0); setSgst(0); setEditingTaxId(null);
        }
      } else {
        toast.error(data.error || 'Failed to delete tax');
      }
    } catch (err) {
      toast.error('API error');
    }
  };

  // Save handler with detailed debug logs
  const handleSaveTax = async () => {
    console.log('[ApplyTax] handleSaveTax called');
    console.log('[ApplyTax] productId:', productId, 'cgst:', cgst, 'sgst:', sgst);
    if (!productId) {
      toast.error('Product ID is missing or invalid!');
      return;
    }
    try {
      let method = 'POST';
      const exists = await checkProductTaxExists();
      console.log('[ApplyTax] checkProductTaxExists:', exists);
      if (exists) method = 'PATCH';
      const payload = { product: productId, cgst: Number(cgst), sgst: Number(sgst) };
      console.log('[ApplyTax] Sending payload:', payload, 'method:', method);
      const res = await fetch('/api/productTax', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('[ApplyTax] fetch response status:', res.status);
      const data = await res.json();
      console.log('[ApplyTax] API response:', data);
      if (res.ok) {
        toast.success('Taxes saved!');
        fetchTaxTable();
        setEditingTaxId(null); // Reset edit mode
      } else {
        toast.error(data.error || 'Failed to save taxes');
      }
    } catch (err) {
      console.error('[ApplyTax] API error:', err);
      toast.error('API error');
    }
  };



  return (
    <>
      {/* <Toaster position="top-right" /> */}
      <div className="container mx-auto p-6 max-w-xl">
      <h3 className="text-xl font-bold mb-4 text-center">Apply Tax</h3>
      <div className='mb-2'>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <input
          className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700"
          value={productTitle || 'N/A'}
          readOnly
        />
      </div>
      <div className="flex gap-4 items-center w-full">
        {/* First row: CGST */}
        <div className="flex gap-4 items-center w-full">
          <label className="w-20 font-semibold">CGST (%)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={cgst}
            onChange={e => setCgst(e.target.value)}
            className="border p-2 rounded w-40"
            placeholder="Enter CGST %"
          />
        </div>
        {/* Second row: SGST */}
        <div className="flex gap-4 items-center w-full">
          <label className="w-20 font-semibold">SGST (%)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={sgst}
            onChange={e => setSgst(e.target.value)}
            className="border p-2 rounded w-40"
            placeholder="Enter SGST %"
          />
        </div>
      </div>
      <div className="flex justify-center mt-4 gap-2">
        <button
          type="button"
          className="bg-green-600 text-white px-6 py-2 rounded shadow disabled:opacity-50"
          disabled={(!cgst && !sgst) || !productId}
          onClick={handleSaveTax}
        >
          {editingTaxId ? 'Update Tax' : 'Save Tax'}
        </button>
        {editingTaxId && (
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded shadow"
            onClick={handleCancelEdit}
            disabled={false}
          >
            Cancel Edit
          </button>
        )}
      </div>
      {/* Tax Table Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">All Product Taxes</h3>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2">Product Name</th>
                  <th className="border px-3 py-2">CGST (%)</th>
                  <th className="border px-3 py-2">SGST (%)</th>
                  <th className="border px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {taxTable.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-2">No tax data</td></tr>
                ) : taxTable.map((row) => (
                  <tr key={row._id}>
                    <td className="border px-3 py-2 text-center">{row.product?.title || row.product}</td>
                    <td className="border px-3 py-2 text-center">{row.cgst}</td>
                    <td className="border px-3 py-2 text-center">{row.sgst}</td>
                    <td className="border px-3 py-2 text-center">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        onClick={() => handleEditTax(row)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 ml-2 text-white px-2 py-1 rounded"
                        onClick={() => handleDeleteTax(row)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ApplyTax;