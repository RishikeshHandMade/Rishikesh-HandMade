"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const defaultSizes = ["L", "M", "XL", "XXL"];

const SizeManagement = ({ productData, productId }) => {
  // Debug logs to help diagnose product name issues
  console.log('[SizeManagement] productId:', productId);
  console.log('[SizeManagement] productData:', productData);

  const [sizeStyle1, setSizeStyle1] = useState("");
  const [sizeChart, setSizeChart] = useState(null);
  const [sizeChartPreview, setSizeChartPreview] = useState(null);
  const [optionals, setOptionals] = useState([
    { label: "Size 1", checked: false },
    { label: "Size 2", checked: false },
    { label: "Size 3", checked: false },
    { label: "Size 4", checked: false },
  ]);
  const [fetchedTitle, setFetchedTitle] = useState("");

  useEffect(() => {
    if (!productData && productId) {
      fetch(`/api/product/${productId}`)
        .then(res => res.json())
        .then(data => setFetchedTitle(data.title || ""));
      console.log('[SizeManagement] Fetched title:', fetchedTitle);
    }
  }, [productData, productId]);

  const productName = productData?.title || fetchedTitle || "";
  useEffect(() => {
    if (!productName) {
      console.warn('[SizeManagement] Product name is missing!');
    }
  }, [productName]);


  const handleSizeChartChange = (e) => {
    const file = e.target.files[0];
    setSizeChart(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSizeChartPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setSizeChartPreview(null);
    }
  };

  const handleOptionalChange = (idx) => {
    setOptionals((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddMore = () => {
    setOptionals((prev) => [
      ...prev,
      { label: `Size ${prev.length + 1}`, checked: false },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement your save logic here
    alert("Size Management Saved!");
  };

  return (
    <form className="flex flex-col items-center w-full max-w-2xl mx-auto" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold my-4 text-center">Product Size Management</h3>
      <div className="bg-white rounded shadow-md p-6 w-full">
        <div className="mb-6 flex flex-col items-center justify-center">
          <Label className="font-semibold mb-2">Product Name</Label>
          <Input
            className="mb-4 w-80 text-center bg-gray-100 border-gray-300"
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
        <div className="mb-6 flex flex-col items-center justify-center">
          <Label className="font-semibold mb-2">Product Size Chart</Label>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 w-80 h-40 mb-2">
            {sizeChartPreview ? (
              <img src={sizeChartPreview} alt="Size Chart Preview" className="max-h-36 object-contain" />
            ) : (
              <>
                <span className="text-3xl mb-2">📈</span>
                <span className="font-semibold">Add Size Chart Image</span>
                <span className="text-xs">Browse Image</span>
              </>
            )}
          </div>
          <Input type="file" accept="image/*" className="w-64" onChange={handleSizeChartChange} />
        </div>
        <div className="mb-6">
          <Label className="font-semibold">Product Size Style 1</Label>
          <div className="flex gap-2 mt-2">
            <Input
              type="text"
              placeholder="Type Here"
              value={sizeStyle1}
              onChange={(e) => setSizeStyle1(e.target.value)}
              className="bg-yellow-200 font-semibold text-lg px-4 py-2 rounded"
            />
            <Button type="button" className="bg-black text-white font-bold px-4" onClick={handleAddMore}>
              Add More
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <Label className="font-semibold">Product Size (Optional) Style 2</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {optionals.map((item, idx) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="bg-green-300 px-4 py-1 rounded font-semibold min-w-[70px] text-center">
                  {item.label}
                </div>
                <Input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleOptionalChange(idx)}
                  className="accent-green-600 w-5 h-5"
                />
                <span className="text-sm font-medium">Check Box</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Button type="submit" className="bg-red-500 text-white font-bold px-10 py-2 text-lg rounded-full">
            Data Save
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SizeManagement;
