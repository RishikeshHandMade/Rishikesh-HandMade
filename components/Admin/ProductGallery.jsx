"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const ProductGallery = () => {
  const imageInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState(null);
  const imageInputRef2 = useRef(null);
  const [selectedImages2, setSelectedImages2] = useState(null);

  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loadingArtisans, setLoadingArtisans] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

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

  const handleFileUpload = () => {
    imageInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload2 = () => {
    imageInputRef2.current.click();
  };

  const handleImageUpload2 = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages2(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can implement file upload logic here
    alert(`Saved! Artisan: ${selectedArtisan}, Product: ${selectedProduct}, Main Photo: ${selectedImages ? 'Yes' : 'No'}, Sub Photo: ${selectedImages2 ? 'Yes' : 'No'}`);
  };

  return (
    <div className="flex justify-center items-center py-5 w-full">
      <div className="w-full max-w-2xl">
        <h4 className="font-bold mb-4 text-center">Product Image Gallery</h4>
        <Card className="p-4">
          <form onSubmit={handleSubmit}>
            {/* Artisan and Product Selects */}
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
            {/* Main Photo */}
            <div className="mb-4">
              <label className="font-semibold">Product Main Photo</label>
              <div className="border rounded p-4 bg-gray-50">
                <div className="text-center">
                  {selectedImages ? (
                    <div className="relative mb-3 inline-block">
                      <img
                        src={selectedImages}
                        alt="Preview"
                        className="rounded object-contain mx-auto"
                        style={{ maxHeight: '100px', display: 'block' }}
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1"
                        onClick={() => {
                          setSelectedImages(null);
                          if (imageInputRef.current) {
                            imageInputRef.current.value = '';
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      className="upload-placeholder border border-dashed border-gray-400 rounded-lg p-6 bg-white cursor-pointer"
                      onClick={handleFileUpload}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl">📷</span>
                        <h5 className="mb-2">Browse Image</h5>
                        <p className="text-muted mb-0">From Drive</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="imageUpload"
                  className="hidden"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                />
                <div className="text-center mt-3">
                  <Button
                    type="button"
                    className="bg-gray-800 text-white px-4 py-2"
                    onClick={handleFileUpload}
                  >
                    {selectedImages ? 'Change Image' : 'Choose Image'}
                  </Button>
                </div>
              </div>
            </div>
            {/* Sub Photo */}
            <div className="mb-4">
              <label className="font-semibold">Product Sub Photo</label>
              <div className="border rounded p-4 bg-gray-50">
                <div className="text-center">
                  {selectedImages2 ? (
                    <div className="relative mb-3 inline-block">
                      <img
                        src={selectedImages2}
                        alt="Preview 2"
                        className="rounded object-contain mx-auto"
                        style={{ maxHeight: '100px', display: 'block' }}
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1"
                        onClick={() => {
                          setSelectedImages2(null);
                          if (imageInputRef2.current) {
                            imageInputRef2.current.value = '';
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      className="upload-placeholder border border-dashed border-gray-400 rounded-lg p-6 bg-white cursor-pointer"
                      onClick={handleFileUpload2}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl">📷</span>
                        <h5 className="mb-2">Browse Image</h5>
                        <p className="text-muted mb-0">From Drive</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="imageUpload2"
                  className="hidden"
                  accept="image/*"
                  ref={imageInputRef2}
                  onChange={handleImageUpload2}
                />
                <div className="text-center mt-3">
                  <Button
                    type="button"
                    className="bg-gray-800 text-white px-4 py-2"
                    onClick={handleFileUpload2}
                  >
                    {selectedImages2 ? 'Change Image' : 'Choose Image'}
                  </Button>
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-center">
              <Button type="submit" className="bg-red-500 px-5 font-semibold">
                Save Data
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProductGallery;
