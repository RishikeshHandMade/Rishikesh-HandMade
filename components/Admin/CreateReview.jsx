"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Star } from 'lucide-react';

const CreateReview = () => {
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewDescription, setReviewDescription] = useState("");
  const [reviewDate, setReviewDate] = useState("");
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
    alert(`Saved! Artisan: ${selectedArtisan}, Product: ${selectedProduct}, Title: ${reviewTitle}, Rating: ${rating}, Date: ${reviewDate}, Description: ${reviewDescription}`);
  };

  return (
    <form className="p-4 w-full max-w-2xl mx-auto" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold mb-4 text-center">Create Product Review</h3>
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
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
            <label className="font-semibold">Title</label>
            <Input type="text" placeholder="Type Here" required className="font-medium" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="font-semibold">Star Rating</label>
            <div className="flex justify-center gap-3 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
  <button
    type="button"
    key={star}
    onClick={() => setRating(star)}
    style={{ cursor: 'pointer', fontSize: '2rem' }}
    className="text-yellow-500"
  >
    {rating >= star && <Star />}
  </button>
))}
            </div>
          </div>
          <div className="mb-4">
            <label className="font-semibold">Select Date</label>
            <Input
              type="date"
              required
              className="font-medium"
              value={reviewDate}
              onChange={e => setReviewDate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="font-semibold">Review Description</label>
            <Textarea rows={4} required className="font-medium" value={reviewDescription} onChange={e => setReviewDescription(e.target.value)} />
          </div>
          <div className="text-center mt-3">
            <Button type="submit" className="bg-black text-white px-5 py-2 font-semibold">Data Save</Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateReview;
