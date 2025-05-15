"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadButton } from '../../utils/cloudinary'; // Add UploadButton import
import { Switch } from '@/components/ui/switch';
// Placeholder for TiptapEditor, replace with your actual implementation
const TiptapEditor = ({ value, onChange }) => (
  <textarea className="w-full border rounded p-2" value={value} onChange={e => onChange(e.target.value)} placeholder="Rich text editor coming soon..." />
);
// Helper to format date for <input type="date">
function formatDateForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
}
// Helper for readable view
function formatDateForView(date) {
  if (!date) return '';
  const d = new Date(Number(date));
  if (isNaN(d)) return '';
  return d.toLocaleDateString();
}

import { useRef } from 'react';

const CreatePromotional = ({ artisanId, artisanDetails = null }) => {
  // Certificate-style handlers
  const handleUploadComplete = (res) => {
    if (res && res.length > 0) {
      setUploadedImageUrl(res[0].url);
      setSelectedImage({ url: res[0].url, key: res[0].key });
      toast.success('Image uploaded successfully');
    }
  };
  const handleUploadError = (err) => {
    toast.error('Image upload failed');
  };
  const removeImage = () => {
    setSelectedImage(null);
    setUploadedImageUrl("");
  };

  // Modal state for view, edit, delete
  const [showViewModal, setShowViewModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Inline update handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPromotion) return;
    try {
      const updatedPromotion = {
        ...selectedPromotion,
        title,
        shortText,
        shortDescription,
        createdBy,
        date,
        rating,
        artisan: selectedArtisan,
        image: uploadedImageUrl,
      };
      const res = await fetch('/api/promotion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedPromotion, id: selectedPromotion._id }),
      });
      if (!res.ok) throw new Error('Failed to update promotion');
      setReviews(reviews.map(r => r._id === selectedPromotion._id ? { ...r, ...updatedPromotion } : r));
      toast.success('Promotion updated!');
      handleCancelEdit();
    } catch (err) {
      toast.error('Failed to update promotion');
    }
  };

  // Cancel edit handler
  const formRef = useRef();
  const handleCancelEdit = () => {
    setSelectedPromotion(null);
    setIsEditing(false);
    setTitle('');
    setShortText('');
    setShortDescription('');
    setCreatedBy('');
    setDate('');
    setRating(0);
    setSelectedArtisan(artisanId || '');
    setUploadedImageUrl('');
    // Remove focus from any input to prevent validation errors
    setTimeout(() => {
      if (document.activeElement) document.activeElement.blur();
      if (formRef.current) formRef.current.reset && formRef.current.reset();
    }, 0);
  };

  // Handler for deleting
  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;
    try {
      const res = await fetch('/api/promotion', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPromotion._id }),
      });
      if (!res.ok) throw new Error('Failed to delete promotion');
      setReviews(reviews.filter(r => r._id !== selectedPromotion._id));
      setShowDeleteModal(false);
      setSelectedPromotion(null);
      toast.success('Promotion deleted!');
    } catch (err) {
      toast.error('Failed to delete promotion');
    }
  };

  // Replace these with real data fetching and state logic
  const [title, setTitle] = useState('');
  const [shortText, setShortText] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [date, setDate] = useState('');
  const [rating, setRating] = useState(0);
  const [artisans, setArtisans] = useState([]); // Fetch artisans from API
  const [selectedArtisan, setSelectedArtisan] = useState(artisanId || '');
  const [reviews, setReviews] = useState([]); // Fetch reviews from API
  const [loadingReviews, setLoadingReviews] = useState(false);
  // Dialog/modal states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Fetch artisans and reviews
  useEffect(() => {
    async function fetchArtisansAndPromotions() {
      // If artisanDetails is present, use it directly
      if (artisanDetails) {
        setSelectedArtisan(artisanDetails._id);
        // setCreatedBy(`${artisanDetails.firstName} ${artisanDetails.lastName}`);
        // setTitle(artisanDetails.title || '');
      } else {
        try {
          // Fetch artisans
          const res = await fetch('/api/createArtisan');
          const data = await res.json();
          setArtisans(data);
          // If artisanId is present, set selectedArtisan and prefill
          if (artisanId) {
            const found = data.find(a => a._id === artisanId);
            if (found) {
              setSelectedArtisan(found._id);
              // setCreatedBy(`${found.firstName} ${found.lastName}`);
              // setTitle(found.title || '');
            }
          }
        } catch (err) {
          toast.error('Failed to fetch artisans');
        }
      }
      // Fetch reviews/promotions
      try {
        setLoadingReviews(true);
        const res = await fetch((artisanDetails?._id || artisanId) ? `/api/promotion?artisanId=${artisanDetails?._id || artisanId}` : '/api/promotion');
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        toast.error('Failed to fetch promotions');
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchArtisansAndPromotions();
  }, [artisanId, artisanDetails]);

  // --- Image Upload State ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Handle image upload (using uploadthing endpoint)
  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data && data.url) {
        setUploadedImageUrl(data.url);
        toast.success('Image uploaded!');
      } else {
        toast.error('Image upload failed');
      }
    } catch (err) {
      toast.error('Image upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedArtisan) {
      toast.error('Please select an artisan');
      return;
    }
    try {
      const payload = {
        title,
        shortText,
        shortDescription,
        rating,
        createdBy,
        date,
        artisan: selectedArtisan,
        image: uploadedImageUrl || undefined,
      };
      const res = await fetch('/api/promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Promotion saved!');
        setTitle('');
        setShortText('');
        setShortDescription('');
        setRating(0);
        setCreatedBy('');
        setDate('');
        setUploadedImageUrl('');
        setSelectedImage(null);
        // Refresh reviews
        const promoRes = await fetch(selectedArtisan ? `/api/promotion?artisanId=${selectedArtisan}` : '/api/promotion');
        const promos = await promoRes.json();
        setReviews(promos);
      } else {
        toast.error(data?.error || 'Failed to save promotion');
      }
    } catch (err) {
      toast.error('Error saving promotion');
    }
  };

  const handleDelete = async () => {
    // Delete review logic
    setShowDeleteDialog(false);
    toast.success('Promotion deleted (demo)!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">Create Promotions Testimonial / Review</h3>
      <form ref={formRef} onSubmit={isEditing ? handleUpdate : handleSubmit} className="bg-white shadow rounded p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <Input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Artisan User</label>
            <Input
              type="text"
              className="w-full border rounded p-2 bg-gray-100"
              value={
                artisanDetails
                  ? `${artisanDetails.title ? artisanDetails.title + ' ' : ''}${artisanDetails.firstName} ${artisanDetails.lastName}`
                  : (() => {
                    const found = artisans.find(a => a._id === selectedArtisan);
                    return found ? `${found.title ? found.title + ' ' : ''}${found.firstName} ${found.lastName}` : '';
                  })()
              }
              readOnly
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Star Rating</label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
                style={{ fontSize: '1.5rem' }}
              >
                <Star className={
                  star <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-black"
                } />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <Input type="text" value={createdBy} onChange={e => setCreatedBy(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Short Text</label>
          <Input type="text" value={shortText} onChange={e => setShortText(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Short Description</label>
          <TiptapEditor value={shortDescription} onChange={setShortDescription} />
        </div>
        {/* Image Upload Section (Certificate style) */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Promotional Image</label>
          <div className="border rounded p-4 text-center">
            {(selectedImage && selectedImage.url) || uploadedImageUrl ? (
              <div className="relative inline-block mb-3">
                <img
                  src={selectedImage && selectedImage.url ? selectedImage.url : uploadedImageUrl}
                  alt="Promotion Preview"
                  className="w-56 h-36 object-cover rounded mx-auto"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={removeImage}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="upload-placeholder cursor-pointer flex flex-col items-center">
                <img src="/upload-img.png" width="50" alt="Upload" className="mb-2" />
                <h5 className="mb-1">Browse Image</h5>
                <p className="text-gray-500">From Drive</p>
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          {isEditing ? (
            <>
              <Button type="button" onClick={handleCancelEdit} variant="secondary">Cancel</Button>
              <Button type="submit" variant="default">Update</Button>
            </>
          ) : (
            <Button type="submit">Create</Button>
          )}
        </div>
      </form>
      <div className="bg-white shadow rounded p-6">
        <h5 className="text-lg font-semibold mb-4">All Reviews</h5>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="px-4 py-3">S.no</TableHead>
              <TableHead className="px-4 py-3">Image</TableHead>
              <TableHead className="px-4 py-3">Created By</TableHead>
              <TableHead className="px-4 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingReviews ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">Loading...</TableCell>
              </TableRow>
            ) : reviews.length > 0 ? (
              reviews.map((review, idx) => (
                <TableRow key={review._id} className="hover:bg-gray-200 transition">
                  <TableCell className="px-4 py-3 font-medium">{idx + 1}</TableCell>
                  <TableCell className="px-4 py-3">
                    {(review.imageUrl || review.image) ? (
                      <img src={review.imageUrl || review.image} alt="Promotion" className="w-12 h-12 object-cover rounded border" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">{review.createdBy || <span className="text-gray-400">-</span>}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => {
                        setSelectedPromotion(review);
                        setShowViewModal(true);
                      }}>View</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedPromotion(review);
                        setTitle(review.title || '');
                        setShortText(review.shortText || '');
                        setShortDescription(review.shortDescription || '');
                        setCreatedBy(review.createdBy || '');
                        setDate(formatDateForInput(review.date));
                        setRating(review.rating || 0);
                        setSelectedArtisan(review.artisan || '');
                        setUploadedImageUrl(review.imageUrl || review.image || '');
                        setIsEditing(true);
                      }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => {
                        setSelectedPromotion(review);
                        setShowDeleteModal(true);
                      }}>Delete</Button>
                      <Switch
                        checked={!!review.active}
                        onCheckedChange={async () => {
                          try {
                            const res = await fetch(`/api/promotion/${review._id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ active: !review.active }),
                            });
                            if (!res.ok) throw new Error('Failed to update status');
                            setReviews(reviews.map(r => r._id === review._id ? { ...r, active: !review.active } : r));
                          } catch {
                            toast.error('Failed to update status');
                          }
                        }}
                        className={`rounded-full transition-colors ${review.active ? '!bg-green-500' : '!bg-red-500'}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">No reviews found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Inline Modals for Promotion View/Edit/Delete */}
      {selectedPromotion && (
        <>
          {/* View Modal */}
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Promotion Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                  <div className="font-semibold text-gray-800">Title</div>
                  <div className="text-gray-600">{selectedPromotion.title}</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                  <div className="font-semibold text-gray-800">Rating</div>
                  <div className="text-gray-600">{selectedPromotion.rating}</div>
                </div>
                  <div className="flex gap-2">
                  <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 w-1/2">
                    <div className="font-semibold text-gray-800">Created By</div>
                    <div className="text-gray-600">{selectedPromotion.createdBy}</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 w-1/2">
                    <div className="font-semibold text-gray-800">Date</div>
                    <div className="text-gray-600">{formatDateForView(selectedPromotion.date)}</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                  <div className="font-semibold text-gray-800">Short Text</div>
                  <div className="text-gray-600">{selectedPromotion.shortText}</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 max-h-28 overflow-y-auto">
                  <div className="font-semibold text-gray-800">Short Description</div>
                  <div className="text-gray-600">{selectedPromotion.shortDescription}</div>
                </div>
                {(selectedPromotion.imageUrl || selectedPromotion.image) && (
                  <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                    <div className="font-semibold text-gray-800">Image</div>
                    <img src={selectedPromotion.imageUrl || selectedPromotion.image} alt="Promotion" className="w-24 h-24 object-cover rounded border mt-2" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>



          {/* Delete Modal */}
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Promotion</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this promotion?</p>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeletePromotion}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};


export default CreatePromotional;
