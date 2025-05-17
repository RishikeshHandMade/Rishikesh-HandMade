"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const sizeLabels = ['L', 'M', 'XL', 'XXL'];
const optionalSizes = ['Size 1', 'Size 2', 'Size 3', 'Size 4'];
const colors = ['Red', 'Blue', 'Green', 'Yellow'];

const QuantityManagement = () => {
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loadingArtisans, setLoadingArtisans] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [optionalQuantities, setOptionalQuantities] = useState({});
  const [colorsSelected, setColorsSelected] = useState({});
  const [optionalColorsSelected, setOptionalColorsSelected] = useState({});

  useEffect(() => {
    setLoadingArtisans(true);
    fetch("/api/createArtisan")
      .then((res) => res.json())
      .then((data) => {
        setArtisans(Array.isArray(data) ? data : []);
        setLoadingArtisans(false);
      })
      .catch(() => setLoadingArtisans(false));

    setLoadingProducts(true);
    fetch("/api/products") // Replace with your actual product API endpoint
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, []);

  const handleQtyChange = (size, value) => {
    setQuantities({ ...quantities, [size]: value });
  };
  const handleColorChange = (size, value) => {
    setColorsSelected({ ...colorsSelected, [size]: value });
  };
  const handleOptionalQtyChange = (size, value) => {
    setOptionalQuantities({ ...optionalQuantities, [size]: value });
  };
  const handleOptionalColorChange = (size, value) => {
    setOptionalColorsSelected({ ...optionalColorsSelected, [size]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Saved! Artisan: ${selectedArtisan}, Product: ${selectedProduct}, Quantities: ${JSON.stringify(quantities)}, Colors: ${JSON.stringify(colorsSelected)}, Optional Quantities: ${JSON.stringify(optionalQuantities)}, Optional Colors: ${JSON.stringify(optionalColorsSelected)}`);
  };

  return (
    <form className="flex flex-col items-center" style={{ maxWidth: 1200 }} onSubmit={handleSubmit}>
      <h3 className="font-semibold my-2 text-center">Product Total Quantity Management</h3>
      <div className="w-full bg-white rounded shadow p-4">
        <div className="mb-4">
          <label className="font-semibold">Select Artisan</label>
          <Select value={selectedArtisan} onValueChange={setSelectedArtisan} disabled={loadingArtisans}>
            <SelectTrigger className="w-full border-2 border-blue-600 bg-gray-200">
              <SelectValue placeholder={loadingArtisans ? 'Loading artisans...' : 'Select Artisan'} />
            </SelectTrigger>
            <SelectContent className="border-2 border-blue-600 bg-gray-200">
              <SelectGroup>
                {artisans.length > 0 ? (
                  artisans.map(a => (
                    <SelectItem key={a._id} value={a._id} className="font-bold">
                      {a.title ? `${a.title} ` : ''}{a.firstName} {a.lastName}
                    </SelectItem>
                  ))
                ) : null}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Select Product</label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={loadingProducts}>
            <SelectTrigger className="w-full border-2 border-blue-600 bg-gray-200">
              <SelectValue placeholder={loadingProducts ? 'Loading products...' : 'Select Product'} />
            </SelectTrigger>
            <SelectContent className="border-2 border-blue-600 bg-gray-200">
              <SelectGroup>
                {products.length > 0 ? (
                  products.map(p => (
                    <SelectItem key={p._id} value={p._id} className="font-bold">
                      {p.title}
                    </SelectItem>
                  ))
                ) : null}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <h5 className="font-semibold mb-2 text-center">Product Total Quantity Management</h5>
        {sizeLabels.map((size) => (
          <div key={size} className="flex items-center justify-center mb-3 gap-2">
            <div className="font-semibold bg-blue-200 rounded text-base px-3 py-1 w-16 text-center">{size}</div>
            <Input type="number" min={0} placeholder="QTY" className="font-bold bg-yellow-100 rounded" value={quantities[size] || ''} onChange={e => handleQtyChange(size, e.target.value)} />
            <Select value={colorsSelected[size] || ''} onValueChange={val => handleColorChange(size, val)}>
              <SelectTrigger className="bg-lime-200 rounded w-40 border-2 border-lime-400">
                <SelectValue placeholder="Select Color" />
              </SelectTrigger>
              <SelectContent className="border-2 border-lime-400 bg-lime-200">
                <SelectGroup>
                  {colors.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ))}
        <h5 className="font-bold mt-4 mb-3 text-center">Product Quantity Optional</h5>
        {optionalSizes.map((size) => (
          <div key={size} className="flex items-center justify-center mb-3 gap-2">
            <div className="font-bold bg-blue-200 rounded text-base px-3 py-1 w-28 text-center">{size}</div>
            <Input type="number" min={0} placeholder="QTY" className="font-bold bg-yellow-100 rounded" value={optionalQuantities[size] || ''} onChange={e => handleOptionalQtyChange(size, e.target.value)} />
            <Select value={optionalColorsSelected[size] || ''} onValueChange={val => handleOptionalColorChange(size, val)}>
              <SelectTrigger className="bg-lime-200 rounded w-40 border-2 border-lime-400">
                <SelectValue placeholder="Select Color" />
              </SelectTrigger>
              <SelectContent className="border-2 border-lime-400 bg-lime-200">
                <SelectGroup>
                  {colors.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="flex justify-center gap-4 mt-4">
          <Button type="button" className="bg-green-500 font-bold px-4">Quantity Management</Button>
          <Button type="submit" className="bg-red-500 font-bold px-5">Data Save</Button>
        </div>
      </div>
    </form>
  );
};

export default QuantityManagement;
