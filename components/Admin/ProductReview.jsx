"use client";
import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Star } from 'lucide-react';

const ProductReview = ({ productData, productId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const productTitle = productData?.title || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !rating || !review) {
      alert('Please provide a rating, review, and valid product.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/productReviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, review })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to submit review');
      } else {
        alert('Review submitted successfully!');
        setRating(0);
        setHoverRating(0);
        setTitle("");
        setReview("");
      }
    } catch (err) {
      alert('Error submitting review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="page-content" onSubmit={handleSubmit}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 col-lg-12">
            <h3 className="my-4 text-center">Product Review</h3>
            <div className="card my-2">
              <div className="card-body px-4 py-2">
                <div className="mb-4">
                  <label className="font-semibold">Product Name</label>
                  <Input
                    type="text"
                    className="form-control"
                    value={productTitle}
                    disabled
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="font-semibold">Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map(star => (
                      <Star
                        key={star}
                        size={28}
                        className={
                          (hoverRating || rating) >= star ? 'text-yellow-500 cursor-pointer' : 'text-gray-400 cursor-pointer'
                        }
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        fill={(hoverRating || rating) >= star ? '#FBBF24' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Review Title</label>
                  <Input type="text" className="form-control" placeholder="Review title" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="form-label">Review</label>
                  <Textarea className="form-control" placeholder="Write your review..." value={review} onChange={e => setReview(e.target.value)} />
                </div>
                <div className="text-center">
                  <Button type="submit" className="bg-blue-600 px-5" disabled={loading}>{loading ? 'Saving...' : 'Submit Review'}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductReview;
