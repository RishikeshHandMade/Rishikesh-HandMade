import React, { useState, useEffect } from 'react';

const ApplyTax = ({ productData, productId }) => {
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [taxTable, setTaxTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const productTitle = productData?.title || "";

  // Edit handler
  const handleEdit = (row) => {
    setCgst(row.cgst);
    setSgst(row.sgst);
    setEditingId(row._id);
  };

  // Delete handler
  const handleDelete = async (row) => {
    if (!window.confirm("Are you sure you want to delete this product tax entry?")) return;
    try {
      const res = await fetch('/api/productTax', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: row.product, tax: '__all__' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window?.toast?.success?.('Product tax deleted!') || alert('Product tax deleted!');
        fetchTaxTable();
        // If deleted row was being edited, reset form
        if (editingId === row._id) {
          setCgst(0); setSgst(0); setEditingId(null);
        }
      } else {
        window?.toast?.error?.(data.error || 'Failed to delete') || alert(data.error || 'Failed to delete');
      }
    } catch {
      window?.toast?.error?.('API error') || alert('API error');
    }
  };

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

  return (
    <div className="container mx-auto p-6 max-w-lg">
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
      <div className="flex justify-center mt-4">
        <button
          type="button"
          className="bg-green-600 text-white px-6 py-2 rounded shadow disabled:opacity-50"
          disabled={(!cgst && !sgst) || !productId}
          onClick={async () => {
            try {
              let method = 'POST';
              if (await checkProductTaxExists()) method = 'PATCH';
              const res = await fetch('/api/productTax', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product: productId, cgst: Number(cgst), sgst: Number(sgst) })
              });
              const data = await res.json();
              if (res.ok) {
                window?.toast?.success?.('Taxes saved!') || alert('Taxes saved!');
                fetchTaxTable();
              } else {
                window?.toast?.error?.(data.error || 'Failed to save taxes') || alert(data.error || 'Failed to save taxes');
              }
            } catch (err) {
              window?.toast?.error?.('API error') || alert('API error');
            }
          }}
        >
          Save
        </button>
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
                  <th className="border px-3 py-2">Product ID</th>
                  <th className="border px-3 py-2">CGST (%)</th>
                  <th className="border px-3 py-2">SGST (%)</th>
                  <th className="border px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {taxTable.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-2">No tax data</td></tr>
                ) : taxTable.map((row) => (
                  <tr key={row._id} className={editingId === row._id ? 'bg-yellow-100' : ''}>
                    <td className="border px-3 py-2">{row.product}</td>
                    <td className="border px-3 py-2">{row.cgst}</td>
                    <td className="border px-3 py-2">{row.sgst}</td>
                    <td className="border px-3 py-2">
                      <button className="text-blue-600 underline mr-2" onClick={() => handleEdit(row)}>Edit</button>
                      <button className="text-red-600 underline" onClick={() => handleDelete(row)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyTax;