"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-hot-toast';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";


const SizeManagement = ({ productData, productId }) => {
  const fileInputRef = useRef(null);
  // Debug logs to help diagnose product name issues
  console.log('[SizeManagement] productId:', productId);
  console.log('[SizeManagement] productData:', productData);

  const [sizeStyle1, setSizeStyle1] = useState("");
  const [sizeChart, setSizeChart] = useState(null);
  const [sizeChartPreview, setSizeChartPreview] = useState(null);
  const [sizeChartUrl, setSizeChartUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [optionals, setOptionals] = useState([
    { label: "L", checked: false },
    { label: "M", checked: false },
    { label: "XL", checked: false },
    { label: "XXL", checked: false },
  ]);
  const [fetchedTitle, setFetchedTitle] = useState("");

  useEffect(() => {
    if (!productData && productId) {
      fetch(`/api/product/${productId}`)
        .then(async res => {
          if (!res.ok) {
            setFetchedTitle("");
            return;
          }
          const text = await res.text();
          if (!text) {
            setFetchedTitle("");
            return;
          }
          const data = JSON.parse(text);
          setFetchedTitle(data.title || "");
        })
        .catch(() => setFetchedTitle(""));
    }
  }, [productData, productId]);

  const productName = productData?.title || fetchedTitle || "";
  useEffect(() => {
    if (!productName) {
      console.warn('[SizeManagement] Product name is missing!');
    }
  }, [productName]);

  const handleSizeChartChange = async (e) => {
    const file = e.target.files[0];
    setSizeChart(file);
    if (file) {
      setUploading(true);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setSizeChartPreview(reader.result);
      reader.readAsDataURL(file);
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setSizeChartUrl(data.url);
        } else {
          window.toast && toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        window.toast && toast.error('Cloudinary upload error: ' + err.message);
      } finally {
        setUploading(false);
      }
    } else {
      setSizeChartPreview(null);
      setSizeChartUrl("");
    }
  };

  const handleRemoveImage = () => {
    setSizeChart(null);
    setSizeChartPreview(null);
    setSizeChartUrl("");
    // Optionally: call API to delete from cloudinary
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Missing product ID");
      return;
    }
    // Required validation
    if (!optionals.some(opt => opt.checked)) {
      toast.error("Please select at least one size.");
      return;
    }
 
    if (!sizeChartUrl) {
      toast.error("Please upload a size chart image.");
      return;
    }
    setSubmitting(true);
    try {
      // Check if a Size document already exists for this product
      const getRes = await fetch(`/api/productSize?product=${productId}`);
      const existing = getRes.ok ? await getRes.json() : null;
      // Prepare size data
      const sizeData = {
        product: productId,
        sizes: optionals,
        sizeStyle1,
        sizeChartUrl: sizeChartUrl || undefined
      };
      let res, data;
      if (existing && existing._id) {
        // PATCH update
        res = await fetch('/api/productSize', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: existing._id, ...sizeData })
        });
      } else {
        // POST create
        res = await fetch('/api/productSize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sizeData)
        });
      }
      data = await res.json();
      if (res.ok) {
        toast.success("Size Management Saved!");
        // Clear form after creation
        setSizeStyle1("");
        setSizeChart(null);
        setSizeChartPreview(null);
        setSizeChartUrl("");
        setOptionals([
          { label: "L", checked: false },
          { label: "M", checked: false },
          { label: "XL", checked: false },
          { label: "XXL", checked: false },
        ]);
      } else {
        toast.error("Failed to save: " + (data.error || 'Unknown error'));
        console.error('Failed to save:', data);
      }
    } catch (err) {
      toast.error("Error saving size: " + err.message);
      console.error('Error saving size:', err);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <form className="flex flex-col items-center w-full max-w-2xl mx-auto" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold my-4 text-center">Product Size Management</h3>
      <div className="bg-white rounded shadow-md p-6 w-full">
        <div className="mb-6 flex flex-col items-center justify-center">
          <Label className="font-semibold mb-2">Product Name</Label>
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
        <div className="mb-6 flex flex-col items-center justify-center">
          <Label className="font-semibold mb-2">Product Size Chart <span className="text-red-500">*</span></Label>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 w-80 h-40 mb-2 overflow-hidden">
            {sizeChartPreview ? (
                <div className="flex items-center justify-center w-full h-full" style={{height: '100%', width: '100%'}}>
                  <img src={sizeChartPreview} alt="Size Chart Preview" style={{ maxHeight: '144px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                </div>
            ) : (
              <>
                <span className="text-3xl mb-2">📈</span>
                <span className="font-semibold">Add Size Chart Image</span>
                <span className="text-xs">Browse Image</span>
              </>
            )}
          </div>
          {/* Buttons below preview */}
          <div className="flex flex-col items-center gap-2 mb-2">
            {sizeChartPreview ? (
              <Button type="button" className="bg-red-500 text-white" onClick={handleRemoveImage} disabled={uploading}>
                Remove Image
              </Button>
            ) : (
              <Button type="button" className="bg-blue-600 text-white" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                {uploading ? (
                  <span className="flex items-center"><span className="loader mr-2"></span>Uploading...</span>
                ) : (
                  'Upload Image'
                )}
              </Button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleSizeChartChange}
            disabled={uploading}
          />
        </div>
        <div className="mb-6">
          <Label className="font-semibold">Product Size Style 1 <span className="text-red-500">*</span></Label>
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
          <Label className="font-semibold">Product Size (Optional) Style 2 <span className="text-red-500">*</span></Label>
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
          <Button type="submit" className="bg-red-500 text-white font-bold px-10 py-2 text-lg rounded-full" disabled={submitting || uploading}>
            {submitting ? 'Creating...' : 'Data Save'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SizeManagement;
