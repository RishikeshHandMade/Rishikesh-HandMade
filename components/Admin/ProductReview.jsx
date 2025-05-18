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

  // State for reviews, modal, and edit mode
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReview, setModalReview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetch reviews for this product
  const fetchReviews = async () => {
    if (!productId) return;
    setTableLoading(true);
    try {
      const res = await fetch(`/api/productReviews?productId=${productId}`);
      const data = await res.json();
      if (res.ok && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      // handle error
    } finally {
      setTableLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [productId]);

  // Handle edit: populate form
  const handleEdit = (review) => {
    setRating(review.rating);
    setTitle(review.title || "");
    setReview(review.review || "");
    setEditMode(true);
    setEditId(review._id);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch('/api/productReviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(reviews.filter(r => r._id !== id));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Error deleting review.');
    }
  };

  // Handle view modal
  const handleView = (review) => {
    setModalReview(review);
    setModalOpen(true);
  };

  // Handle update (edit mode)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editId || !rating || !review) {
      alert('Please provide a rating and review.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/productReviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: editId, rating, title, review })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to update review');
      } else {
        setEditMode(false);
        setEditId(null);
        setRating(0);
        setHoverRating(0);
        setTitle("");
        setReview("");
        fetchReviews();
      }
    } catch (err) {
      alert('Error updating review.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setRating(0);
    setHoverRating(0);
    setTitle("");
    setReview("");
  };

  return (
    <>
      <form className="page-content" onSubmit={editMode ? handleUpdate : handleSubmit}>
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
                  <div className="text-center space-x-2">
                    <Button type="submit" className="bg-blue-600 px-5" disabled={loading}>{loading ? (editMode ? 'Updating...' : 'Saving...') : (editMode ? 'Update Review' : 'Submit Review')}</Button>
                    {editMode && <Button type="button" className="bg-gray-400 px-5" onClick={handleCancelEdit}>Cancel</Button>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Reviews Table */}
      <div className="container-fluid mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 col-lg-12">
            <div className="card">
              <div className="card-body px-4 py-2">
                <h5 className="mb-3">Reviews</h5>
                {tableLoading ? (
                  <div>Loading...</div>
                ) : reviews.length === 0 ? (
                  <div>No reviews found.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Product Name</th>
                          <th>Title</th>
                          <th>Rating</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((r, idx) => (
                          <tr key={r._id}>
                            <td>{idx + 1}</td>
                            <td>{productTitle}</td>
                            <td>{r.title}</td>
                            <td>{r.rating}</td>
                            <td>
                              <Button className="bg-blue-500 mr-2" size="sm" onClick={() => handleView(r)}>View</Button>
                              <Button className="bg-yellow-500 mr-2" size="sm" onClick={() => handleEdit(r)}>Edit</Button>
                              <Button className="bg-red-500" size="sm" onClick={() => handleDelete(r._id)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {modalOpen && modalReview && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Details</h5>
                <button type="button" className="close" aria-label="Close" onClick={() => setModalOpen(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Product Name:</strong> {productTitle}</p>
                <p><strong>Rating:</strong> {modalReview.rating}</p>
                <p><strong>Review Title:</strong> {modalReview.title}</p>
                <p><strong>Description:</strong> {modalReview.review}</p>
              </div>
              <div className="modal-footer">
                <Button className="bg-gray-400" onClick={() => setModalOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReview;
