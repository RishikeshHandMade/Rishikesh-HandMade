"use client";
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const VideoManagement = () => {
  const [videoUrl, setVideoUrl] = useState("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement save logic here
    alert(`Saved! Artisan: ${selectedArtisan}, Product: ${selectedProduct}, Video URL: ${videoUrl}`);
  };

  return (
    <form className="page-content" onSubmit={handleSubmit}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 col-lg-12">
            <h4 className="my-3 text-center">Video Management</h4>
            <div className="card my-2">
              <div className="card-body px-4 py-2">
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
                <div className="mb-4">
                  <label className="form-label">Product Video URL</label>
                  <div className="input-group">
                    <Input type="text" className="form-control" placeholder="Youtube URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                  </div>
                </div>
                <div className="text-center">
                  <Button type="submit" className="bg-red-500 px-5">Data Save</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default VideoManagement;
