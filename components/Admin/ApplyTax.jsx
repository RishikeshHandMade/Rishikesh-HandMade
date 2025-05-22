import React, { useState } from 'react';

const ApplyTax = ({productData,productId}) => {
  const [taxOptions, setTaxOptions] = useState(["GST", "VAT", "Service Tax"]); // initial options
  const [selectedTaxes, setSelectedTaxes] = useState([]);
  const [newTaxInput, setNewTaxInput] = useState("");
  const productTitle = productData?.title || "";
  // Add new tax to dropdown and select
  const handleAddTax = () => {
    const trimmed = newTaxInput.trim();
    if (!trimmed) return;
    if (taxOptions.includes(trimmed)) {
      if (!selectedTaxes.includes(trimmed)) setSelectedTaxes([...selectedTaxes, trimmed]);
      setNewTaxInput("");
      return;
    }
    setTaxOptions([...taxOptions, trimmed]);
    setSelectedTaxes([...selectedTaxes, trimmed]);
    setNewTaxInput("");
  };

  // Select from dropdown
  const handleSelectTax = (e) => {
    const val = e.target.value;
    if (val && !selectedTaxes.includes(val)) {
      setSelectedTaxes([...selectedTaxes, val]);
    }
  };

  // Remove selected tax
  const handleRemoveTax = (tax) => {
    setSelectedTaxes(selectedTaxes.filter(t => t !== tax));
  };

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h3 className="text-xl font-bold mb-4 text-center">Apply Tax</h3>
      <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700"
            value={productTitle || 'N/A'}
            readOnly
          />
        </div>
      <div className="flex flex-col gap-4 items-center">
        <div className="flex flex-row gap-2 items-center">
          <select
            className="border p-2 rounded w-48"
            value=""
            onChange={handleSelectTax}
          >
            <option value="" disabled>Select tax</option>
            {taxOptions.map((tax, idx) => (
              <option key={tax} value={tax}>{tax}</option>
            ))}
          </select>
          <input
            type="text"
            value={newTaxInput}
            onChange={e => setNewTaxInput(e.target.value)}
            className="border p-2 rounded w-48"
            placeholder="Add new tax"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTax();
              }
            }}
            autoComplete="off"
          />
          <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleAddTax}>
            Add More
          </button>
        </div>
        <div className="flex gap-2 flex-wrap mt-2 justify-center">
          {selectedTaxes.map((tax, idx) => (
            <span key={tax} className="bg-gray-200 px-2 py-1 rounded-full flex items-center">
              {tax}
              <button type="button" className="ml-2 text-red-500" onClick={() => handleRemoveTax(tax)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <button
          type="button"
          className="bg-green-600 text-white px-6 py-2 rounded shadow disabled:opacity-50"
          disabled={!selectedTaxes.length || !productId}
          onClick={async () => {
            try {
              const res = await fetch('/api/productTax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product: productId, taxes: selectedTaxes })
              });
              const data = await res.json();
              if (res.ok) {
                window?.toast?.success?.('Taxes saved!') || alert('Taxes saved!');
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
    </div>
  );
};

export default ApplyTax;