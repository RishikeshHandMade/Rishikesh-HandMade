"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
// Sizes and colors will be fetched from APIs
// const sizeLabels = ['L', 'M', 'XL', 'XXL'];
// const colors = ['Red', 'Blue', 'Green', 'Yellow'];

const QuantityManagement = ({ productData, productId }) => {
  const [quantities, setQuantities] = useState({});
  const [colorsSelected, setColorsSelected] = useState({});
  const [productTitle, setProductTitle] = useState("");
  const [variants, setVariants] = useState([]);
  const [sizes, setSizes] = useState([]); // fetched from API
  const [allColors, setAllColors] = useState([]); // fetched from API
  useEffect(() => {
    if (!productData && productId) {
      fetch(`/api/product/${productId}`)
        .then(async res => {
          if (!res.ok) {
            setProductTitle("");
            return;
          }
          const text = await res.text();
          if (!text) {
            setProductTitle("");
            return;
          }
          const data = JSON.parse(text);
          setProductTitle(data.title || "");
        })
        .catch(() => setProductTitle(""));
    }
    // Fetch sizes
    if (productId) {
      fetch(`/api/productSize?product=${productId}`)
        .then(async res => {
          if (!res.ok) { setSizes([]); return; }
          const data = await res.json();
          setSizes(Array.isArray(data?.sizes) ? data.sizes : []);
        })
        .catch(() => setSizes([]));
      // Fetch colors
      fetch(`/api/productColor?product=${productId}`)
        .then(async res => {
          if (!res.ok) { setAllColors([]); return; }
          const data = await res.json();
          setAllColors(Array.isArray(data?.colors) ? data.colors : []);
        })
        .catch(() => setAllColors([]));
    }
  }, [productData, productId]);

  const productName = productData?.title || productTitle || "";

  const handleQtyChange = (size, value) => {
    setQuantities({ ...quantities, [size]: value });
  };
  const handleColorChange = (size, value) => {
    setColorsSelected({ ...colorsSelected, [size]: value });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form className="flex flex-col items-center" style={{ maxWidth: 1200 }} onSubmit={handleSubmit}>
      <h3 className="font-semibold my-2 text-center text-xl">Product Total Quantity Management</h3>
      <div className="w-full bg-white rounded shadow p-4">
        <div className="mb-6 flex flex-col items-center justify-center">
          <Label className="font-bold mb-2 text-md">Product Name</Label>
          <Input
            className="mb-4 w-80 font-black text-center border-gray-300"
            value={productName}
            disabled
            readOnly
            placeholder={productName ? "Product Name" : "Product Name not found"}
            style={productName ? {} : { border: '2px solid red', color: 'red' }}
          />
          {!productName && (
            <div style={{ color: 'red', marginTop: '4px', fontWeight: 'bold' }}>
              Product name not found! Please check if the product was created successfully.
            </div>
          )}
        </div>
        <h5 className="font-semibold mb-2 text-center text-xl">Product Total Quantity Management</h5>
        {sizes.map((size, idx) => {
          // Support both string and object size formats
          let key = typeof size === 'string' ? size : (size._id || size.label || idx);
          let label = typeof size === 'string' ? size : (size.label || size._id || String(idx));
          <div key={String(key)} className="flex items-center justify-center mb-3 gap-2">
            <div className="font-semibold bg-blue-200 rounded text-base px-3 py-1 w-20 text-center">{label}</div>
            <Input type="number" min={0} placeholder="QTY" className="font-bold bg-yellow-100 rounded w-20" value={quantities[size] || ''} onChange={e => handleQtyChange(size, e.target.value)} />
            <Select value={colorsSelected[size] || ''} onValueChange={val => handleColorChange(size, val)}>
              <SelectTrigger className="bg-lime-200 rounded w-40 border-2 border-lime-400">
                <SelectValue placeholder="Select Color" />
              </SelectTrigger>
              <SelectContent className="border-2 border-lime-400 bg-lime-200">
                <SelectGroup>
                  {allColors.map((c, idx) => {
                    let key = typeof c === 'string' ? c : (c?.hex || c?.name || idx);
                    let value = typeof c === 'string' ? c : (c?.hex || c?.name || '');
                    let label = typeof c === 'string' ? c : (c?.name || c?.hex || String(value));
                    <SelectItem key={String(key)} value={String(value)}>
                      {label}
                    </SelectItem>

                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
 } )}
        <div className="flex justify-center gap-4 mt-4">
          <Button type="button" className="bg-green-500 font-bold px-4">Quantity Management</Button>
          <Button type="submit" className="bg-red-500 font-bold px-5">Data Save</Button>
        </div>
      </div>
    </form>
  );
};

export default QuantityManagement;
