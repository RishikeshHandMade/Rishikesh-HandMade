import React, { useState } from "react";
import { X } from "lucide-react";

export default function ReviewModal({ open, onClose, onSubmit, artisan }) {
  console.log(artisan)
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    thumb: null,
    rating: 0,
    title: "",
    description: ""
  });
  const [thumbPreview, setThumbPreview] = useState(null);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "thumb") {
      setForm((f) => ({ ...f, thumb: files[0] }));
      setThumbPreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleRating = (val) => setForm((f) => ({ ...f, rating: val }));

  const handleThumbUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, thumb: { url: data.url, key: data.key || '' } }));
        if (window.toast) window.toast.success('Image uploaded!');
      } else {
        if (window.toast) window.toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      if (window.toast) window.toast.error('Cloudinary upload error: ' + err.message);
    }
    setUploading(false);
  };

  const handleRemoveThumb = () => {
    setForm((prev) => ({ ...prev, thumb: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!form.name || !form.date || !form.rating || !form.title || !form.description || !artisan?._id) {
      if (window.toast) window.toast.error('Please fill all required fields');
      return;
    }
    // Convert date string to timestamp (number)
    const dateValue = form.date ? new Date(form.date).getTime() : undefined;
    try {
      const payload = {
        name: form.name,
        date: dateValue,
        thumb: form.thumb || null, // send {url, key} if uploaded
        rating: form.rating,
        title: form.title,
        description: form.description,
        type: "artisan",
        artisan: artisan._id,
      };
      const res = await fetch('/api/saveReviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onSubmit?.(form);
        if (typeof window !== 'undefined' && window.toast) window.toast.success('Review submitted!');
      } else {
        const err = await res.json();
        if (typeof window !== 'undefined' && window.toast) window.toast.error(err.message || 'Failed to submit review');
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.toast) window.toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center p-0 overflow-y-auto">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg md:h-screen h-[90vh] p-6 md:p-4 flex flex-col overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`.scrollbar-none::-webkit-scrollbar { display: none; }`}</style>
        {/* Close X top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
          aria-label="Close"
        >
          <X size={28} />
        </button>
        <h2 className="text-xl font-bold text-center mb-2">Write Review</h2>
        <p className="text-center text-sm text-gray-600 mb-2">Help us improve — share your feedback.</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1">Name</label>
            <input
              name="name"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Thumb Image</label>
            <label className="block w-full cursor-pointer">
              <input
                name="thumb"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbUpload}
              />
              <div className="w-full bg-black text-white py-2 rounded text-center flex items-center justify-center gap-2">
                Select Image
                {uploading && <span className="ml-2 text-xs text-yellow-400 animate-pulse">Uploading...</span>}
              </div>
            </label>
            {form.thumb && form.thumb.url && (
              <div className="relative inline-block mt-2">
                <img src={form.thumb.url} alt="Preview" className="h-20 w-20 object-cover rounded" />
                <button
                  type="button"
                  onClick={handleRemoveThumb}
                  className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-black hover:bg-red-500 hover:text-white transition-colors"
                  style={{ transform: 'translate(40%,-40%)' }}
                  aria-label="Remove image"
                >
                  &#10005;
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1">
            <label className="font-semibold mb-1">Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00b67a]"
            />
          </div>
          <div>
            <label className="block mb-1">Rating</label>
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => handleRating(star)}
                  className="focus:outline-none"
                >
                  <span className={`text-2xl ${form.rating >= star ? "text-yellow-400" : "text-gray-300"}`}>&#9733;</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1">Review Title</label>
            <input
              name="title"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black"
              placeholder="Give your review a title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Body Of Review (100)</label>
            <textarea
              name="description"
              rows={4}
              maxLength={100}
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black resize-none"
              placeholder="Write your comments here"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex w-full justify-between items-center mt-2">
            <button
              type="submit"
              className="bg-black text-white font-bold px-8 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              SUBMIT REVIEW
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-black border border-gray-400 rounded px-4 py-2"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

