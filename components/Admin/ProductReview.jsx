"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Star, Upload, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRef } from 'react';
import { Label } from "../ui/label";
import Image from 'next/image';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import { Extension } from '@tiptap/core'
import { Image as TipTapImage } from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  PilcrowSquare,
} from 'lucide-react'

// Create a FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ commands }) => {
        return commands.setFontStyle({ fontSize })
      },
      unsetFontSize: () => ({ commands }) => {
        return commands.setFontStyle({ fontSize: undefined })
      },
    }
  },
})
const ProductReview = ({ productData, productId }) => {
  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageObj, setImageObj] = useState({ url: '', key: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = React.useRef(null);
  // Existing state and handlers
  const [viewModal, setViewModal] = useState(false);
  const [createdBy, setCreatedBy] = useState("");
  // const [viewModal, setViewModal] = useState(false);
  const [viewedReview, setViewedReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const productTitle = productData?.title || "";

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Image upload failed');
      const result = await res.json();
      addImage(result.url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
      console.error(err);
    } finally {
      setImageUploading(false);
      if (file && imageInputRef.current) imageInputRef.current.value = '';
    }
  };



  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Typography,
      TextAlign,
      Underline,
      Link,
      Color,
      ListItem,
      FontSize,
      TipTapImage,
    ],
    content: review,
    editorProps: {
      attributes: {
        class: 'min-h-[300px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00b67a]',
        spellcheck: 'true'
      }
    },
    autofocus: true,
    editable: true,
    injectCSS: true

  });

  // Function to get current editor content
  const getCurrentContent = () => {
    if (editor) {
      return editor.getHTML();
    }
    return review;
  };

  const addImage = (url) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  };
  const setLink = React.useCallback(() => {
    if (!editor) return;
    let previousUrl = editor.getAttributes('link').href;

    // If the URL starts with /product/, remove it for editing
    if (previousUrl && previousUrl.startsWith('/product/')) {
      previousUrl = previousUrl.replace(/^\/product\//, '');
    }

    const url = window.prompt('Enter URL (without /product/ prefix):', previousUrl);
    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Don't modify the URL here, let the server or display component handle the prefix
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);
  // Image handlers
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setUploading(true);
      toast.loading('Uploading image to Cloudinary...', { id: 'review-image-upload' });

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'product_reviews');

      try {
        const res = await fetch('/api/cloudinary', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.url && data.key) {
          setImageObj({ url: data.url, key: data.key });
          toast.success('Image uploaded!', { id: 'review-image-upload' });
        } else {
          toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'), { id: 'review-image-upload' });
        }
      } catch (err) {
        toast.error('Cloudinary upload error: ' + err.message, { id: 'review-image-upload' });
      } finally {
        setUploading(false);
      }
    } else {
      setImagePreview(null);
      setImageObj({ url: '', key: '' });
    }
  };

  // Reset file input after successful upload
  useEffect(() => {
    if (imageObj.url && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [imageObj.url]);

  // Image delete handler
  const handleRemoveImage = async () => {
    // Remove from UI immediately
    setImageFile(null);
    setImagePreview(null);
    const prevKey = imageObj.key;
    setImageObj({ url: '', key: '' });
    if (prevKey) {
      toast.loading('Deleting image from Cloudinary...', { id: 'review-image-delete' });
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: prevKey }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Image deleted from Cloudinary!', { id: 'review-image-delete' });
        } else {
          toast.error('Cloudinary error: ' + (data.error || 'Failed to delete image from Cloudinary'), { id: 'review-image-delete' });
        }
      } catch (err) {
        toast.error('Failed to delete image from Cloudinary (network or server error)', { id: 'review-image-delete' });
      }
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = getCurrentContent();
    if (!productId || !rating || !content || !createdBy) {
      toast.error('Please provide a rating, review, createdBy, and valid product.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/productReviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title,
          review: content,
          createdBy,
          image: imageObj.url ? {
            url: imageObj.url,
            key: imageObj.key
          } : null
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to submit review');
      } else {
        toast.success('Review submitted successfully!');
        setRating(0);
        setHoverRating(0);
        setTitle("");
        setReview("");
        setCreatedBy("");
        // Clear image state
        setImageFile(null);
        setImagePreview(null);
        setImageObj({ url: '', key: '' });
        if (editor) {
          editor.commands.clearContent();
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchReviews();
      }
    } catch (err) {
      toast.error('Error submitting review.');
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
      toast.error('Error fetching reviews.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);
  // Update editor content when description state changes
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(review.review, false);
    }
  }, [review.review, editor]);
  // Handle edit: populate form
  const handleEdit = (review) => {
    setRating(review.rating);
    setTitle(review.title || "");
    setReview(review.review || "");
    setCreatedBy(review.createdBy || "");
    if (review.image?.url) {
      setImagePreview(review.image.url);
      setImageObj({
        url: review.image.url,
        key: review.image.key
      });
    } else {
      setImagePreview(null);
      setImageObj({ url: '', key: '' });
    }
    setEditMode(true);
    setEditId(review._id);
    if (editor) {
      editor.commands.setContent(review.review, false);
      setReview(review.review);
    }
  };

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Open delete modal
  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch('/api/productReviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: deleteTargetId, productId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to delete review');
        return;
      }

      // Update UI immediately
      setReviews(reviews.filter(r => r._id !== deleteTargetId));
      toast.success('Review deleted successfully!');

      // Refresh reviews to ensure consistency
      fetchReviews();
    } catch (err) {
      toast.error('Error deleting review.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };
  // Handle update (edit mode)
  const handleUpdate = async (e) => {
    e.preventDefault();
    const content = getCurrentContent();
    if (!editId || !rating || !content) {
      toast.error('Please provide a rating and review.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/productReviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: editId,
          productId,
          rating,
          title,
          review: content,
          image: imageObj.url ? {
            url: imageObj.url,
            key: imageObj.key
          } : null
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to update review');
      } else {
        toast.success('Review updated successfully!');
        setEditMode(false);
        setEditId(null);
        setRating(0);
        setHoverRating(0);
        setTitle("");
        setReview("");
        setCreatedBy("");
        // Clear image state
        setImageFile(null);
        setImagePreview(null);
        setImageObj({ url: '', key: '' });
        if (editor) {
          editor.commands.clearContent();
        }
        fetchReviews();
      }
    } catch (err) {
      toast.error('Error updating review.');
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
    setCreatedBy("");
    setImageFile(null);
    setImagePreview(null);
    setImageObj({ url: '', key: '' });
  };

  const unescapeHtml = (html) => {
    if (!html || typeof html !== 'string') return '';

    // First, unescape all HTML entities
    const temp = document.createElement('div');
    temp.innerHTML = html.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'");

    // Get the HTML content after unescaping
    let processedHtml = temp.innerHTML;

    // Fix product links and ensure all links have proper protocol
    processedHtml = processedHtml
        // Fix product links
        .replace(/href="\/product\/([^"]+)"/g, 'href="$1"')
        // Ensure links have http:// if they don't have any protocol
        .replace(/href="(?!https?:\\\/\\\/|mailto:|tel:|#)([^"]+)"/g, 'href="https://$1"');

    return processedHtml;
};
  return (
    <>
      {/* View Review Modal */}
      <Dialog open={viewModal} onOpenChange={setViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setViewModal(false)}
              aria-label="Close"
            >
              ×
            </button>
          </DialogHeader>
          {viewedReview && (
            <div className="mb-4">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Title</div>
                <div className="text-gray-600">{viewedReview.title}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Created By</div>
                <div className="text-gray-600">{viewedReview.createdBy}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Rating</div>
                <div className="text-gray-600">{viewedReview.rating} stars</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 h-24 overflow-y-auto">
                <div className="font-semibold text-gray-800">Review</div>
                <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: unescapeHtml(viewedReview.review) }}></div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 h-24 overflow-y-auto">
                <div className="font-semibold text-gray-800">Image</div>
                <div className="w-12 h-12 rounded-full">
                  <img src={viewedReview.image?.url} alt="" /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this review?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                  {/* Review Image Upload */}
                  <div className="mb-4">
                    <Label className="block mb-2 font-bold">Review Image</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="hidden"
                      id="review-image-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mb-2 flex items-center gap-2 bg-blue-500 text-white"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <span>Select Review Image</span>
                      <Upload className="w-4 h-4" />
                    </Button>
                    {uploading && <div className="text-blue-600 font-semibold">Uploading...</div>}
                    {imagePreview && (
                      <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
                        <Image
                          src={imagePreview}
                          alt="Review Image Preview"
                          width={192}
                          height={112}
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
                          title="Remove image"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700">Created By</label>
                    <Input
                      id="createdBy"
                      value={createdBy}
                      onChange={e => setCreatedBy(e.target.value)}
                      className="w-full border rounded mt-1 px-3 py-2"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="font-semibold">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
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
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'bg-gray-200' : ''}>
                          <UnderlineIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={setLink}
                          className={editor?.isActive('link') ? 'bg-gray-200' : ''}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                        <input
                          type="file"
                          ref={imageInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById('image-upload').click()}
                          disabled={imageUploading}
                        >
                          {imageUploading ? 'Uploading...' : 'Image'}
                        </Button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().setParagraph().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('paragraph') ? 'bg-gray-200' : ''}`}
                        >
                          <PilcrowSquare className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
                        >
                          <Heading1 className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
                        >
                          <Heading3 className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('blockquote') ? 'bg-gray-200' : ''}`}
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
                        >
                          <Code className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleStrike().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('strike') ? 'bg-gray-200' : ''}`}
                        >
                          <Strikethrough className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().undo().run()}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().redo().run()}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Redo className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'left') ? 'bg-gray-200' : ''}`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'center') ? 'bg-gray-200' : ''}`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'right') ? 'bg-gray-200' : ''}`}
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                      </div>
                      <EditorContent editor={editor} />
                    </div>
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
                ) : (
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="px-4 py-3 text-center">S.No</TableHead>
                        <TableHead className="px-4 py-3 text-center">Product Name</TableHead>
                        <TableHead className="px-4 py-3 text-center">Created By</TableHead>
                        <TableHead className="px-4 py-3 text-center">Rating</TableHead>
                        <TableHead className="px-4 py-3 text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">No reviews found.</TableCell>
                        </TableRow>
                      ) : (
                        reviews.map((r, idx) => (
                          <TableRow key={r._id}>
                            <TableCell className="px-4 py-3 text-center font-medium">{idx + 1}</TableCell>
                            <TableCell className="px-4 py-3 text-center whitespace-nowrap ">{productTitle}</TableCell>
                            <TableCell className="px-4 py-3 text-center whitespace-nowrap ">{r.createdBy}</TableCell>
                            <TableCell className="px-4 py-3 text-center whitespace-nowrap ">{r.rating}</TableCell>
                            <TableCell className="px-4 py-3 flex gap-2 justify-center">
                              <Button size="sm" variant="default" className="bg-blue-500 text-white px-3 py-1 rounded mr-2" onClick={() => {
                                setViewedReview(r);
                                setViewModal(true);
                              }}>
                                View
                              </Button>
                              <Button size="sm" variant="default" className="bg-yellow-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleEdit(r)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => openDeleteModal(r._id)}>
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
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
