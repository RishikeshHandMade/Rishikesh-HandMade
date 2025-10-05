"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
import Image from '@tiptap/extension-image'
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
// Helper to format date as 'DD-MM-YYYY'
function formatDateDDMMYYYY(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
// Helper to convert timestamp to 'YYYY-MM-DD' for input type="date"
function dateToInputValue(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
import { useRef } from 'react';

const CreatePromotional = ({ artisanId, artisanDetails = null }) => {
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageObj, setImageObj] = useState({ url: '', key: '' }); // { url, key }
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  // Handler for file input change
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cloudinary", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Image upload failed");
      const result = await res.json();
      setImageObj({ url: result.url, key: result.key });
      setImagePreview(result.url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
    }
  };

  // Modal state for view, edit, delete
  const [showViewModal, setShowViewModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Inline update handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    const content = getCurrentContent();
    if (!selectedPromotion) return;
    try {
      const updatedPromotion = {
        ...selectedPromotion,
        title,
        shortDescription: content,
        createdBy,
        date: date ? new Date(date).getTime() : undefined,
        rating,
        artisan: selectedArtisan,
        image: imageObj,
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
    setTitle('')
    setShortDescription('');
    setCreatedBy('');
    setDate('');
    setRating(0);
    setSelectedArtisan(artisanId || '');
    setImageObj({ url: '', key: '' });
    setImagePreview(null);
    if(editor){
      editor.commands.setContent('');
    }
    // Remove focus from any input to prevent validation errors
    setTimeout(() => {
      if (document.activeElement) document.activeElement.blur();
      if (formRef.current) formRef.current.reset && formRef.current.reset();
    }, 0);
  };

  // Handler for deleting
  const [deleting, setDeleting] = useState(false);
  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;
    setDeleting(true);
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
    } finally {
      setDeleting(false);
    }
  };


  // Replace these with real data fetching and state logic
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [date, setDate] = useState('');
  const [rating, setRating] = useState(0);
  const [artisans, setArtisans] = useState([]); // Fetch artisans from API
  const [selectedArtisan, setSelectedArtisan] = useState(artisanId || '');
  const [reviews, setReviews] = useState([]); // Fetch reviews from API
  const [loadingReviews, setLoadingReviews] = useState(false);
  // console.log(reviews)
  // Fetch artisans and reviews

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
      setReviews(data.promotions);
    } catch (err) {
      toast.error('Failed to fetch promotions');
    } finally {
      setLoadingReviews(false);
    }
  }
  useEffect(() => {
    fetchArtisansAndPromotions();
  }, [artisanId, artisanDetails]);
  const [imageeditorUploading, setImageeditorUploading] = useState(false);
  const imageInputRef = React.useRef(null);


  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageeditorUploading(true);
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
      setImageeditorUploading(false);
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
      Image,
    ],
    content: shortDescription,
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
    return shortDescription;
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
  const handleSubmit = async (e) => {
    const content = getCurrentContent();
    e.preventDefault();
    if (!selectedArtisan) {
      toast.error('Please select an artisan');
      return;
    }
    try {
      const payload = {
        title,
        shortDescription: content,
        rating,
        createdBy,
        date: date ? new Date(date).getTime() : undefined,
        artisan: selectedArtisan,
        image: imageObj,
      };
      // console.log("imageObj before submit:", imageObj);
      const res = await fetch('/api/promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Promotion saved!');
        setTitle('');
        setShortDescription('');
        setRating(0);
        setCreatedBy('');
        setDate('');
        setImageObj({ url: '', key: '' });
        setImagePreview(null);
        if(editor){
          editor.commands.setContent('');
        }
        // Refresh reviews
        const promoRes = await fetch(selectedArtisan ? `/api/promotion?artisanId=${selectedArtisan}` : '/api/promotion');
        const promos = await promoRes.json();
        setReviews(promos.promotions);
      } else {
        toast.error(data?.error || 'Failed to save promotion');
      }
    } catch (err) {
      toast.error('Error saving promotion');
    }
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
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">Create Promotions Testimonial / Review</h3>
      <form ref={formRef} onSubmit={isEditing ? handleUpdate : handleSubmit} className="bg-white shadow rounded p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <Input type="text" value={title} placeholder="Review Title" onChange={e => setTitle(e.target.value)} required />
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
            <Input type="text" value={createdBy} placeholder="Review Name" onChange={e => setCreatedBy(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Description</label>
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
                disabled={imageeditorUploading}
              >
                {imageeditorUploading ? 'Uploading...' : 'Image'}
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
        {/* Image Upload Section (Certificate style) */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Thumb Image</label>
          <div className="border rounded p-4 text-center">
            {imagePreview && (
              <img src={imagePreview} alt="Promotion Preview" className="w-32 h-32 object-cover rounded border mx-auto mb-2" />
            )}
            <div className="upload-placeholder cursor-pointer flex flex-col items-center">
              <img src="/upload-img.png" width="50" alt="Upload" className="mb-2" />
              <h5 className="mb-1">Browse Image</h5>
              <p className="text-gray-500">From Drive</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() => fileInputRef.current.click()}
                disabled={imageUploading}
              >
                Browse Image
              </button>
              {imageUploading && (
                <div className="mt-2 w-full max-w-xs mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center mt-1">Uploading...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          {isEditing ? (
            <>
              <Button type="submit" variant="default">Update</Button>
              <Button type="button" onClick={handleCancelEdit} variant="secondary">Cancel</Button>
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
            ) : reviews?.length > 0 ? (
              reviews.map((review, idx) => (
                <TableRow key={review._id} className="hover:bg-gray-200 transition">
                  <TableCell className="px-4 py-3 font-medium">{idx + 1}</TableCell>
                  <TableCell className="px-4 py-3">
                    {(review.image?.url || review.image) ? (
                      <img src={review.image?.url || review.image} alt="Promotion" className="w-12 h-12 object-cover rounded border" />
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
                        setShortDescription(review.shortDescription || '');
                        setCreatedBy(review.createdBy || '');
                        setDate(dateToInputValue(review.date));
                        setRating(review.rating || 0);
                        setSelectedArtisan(review.artisan || '');
                        if (editor) {
                          editor.commands.setContent(review.shortDescription, false);
                          setShortDescription(review.shortDescription);
                        }
                        if (review.image && typeof review.image === 'object') {
                          setImageObj({ url: review.image.url || '', key: review.image.key || '' });
                          setImagePreview(review.image.url || null);
                        } else if (typeof review.image === 'string') {
                          setImageObj({ url: review.image, key: '' });
                          setImagePreview(review.image);
                        } else {
                          setImageObj({ url: '', key: '' });
                          setImagePreview(null);
                        }
                        setIsEditing(true);
                      }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => {
                        setSelectedPromotion(review);
                        setShowDeleteModal(true);
                      }}>Delete</Button>
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
                    <div className="text-gray-600">{formatDateDDMMYYYY(selectedPromotion.date)}</div>
                  </div>
                </div>
                <div className="ProseMirror1 bg-white p-3 rounded border border-gray-200 shadow-md mb-2 max-h-28 overflow-y-auto">
                  <div className="font-semibold text-gray-800">Short Description</div>
                  <div dangerouslySetInnerHTML={{ __html: unescapeHtml(selectedPromotion.shortDescription) }} className="text-gray-600"></div>
                </div>
                {(selectedPromotion.image?.url || selectedPromotion.image?.key) && (
                  <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                    <div className="font-semibold text-gray-800">Image</div>
                    <img src={selectedPromotion.image?.url || "No Image"} alt="Promotion" className="w-24 h-24 object-cover rounded border mt-2" />
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
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeletePromotion} disabled={deleting}>
                  {deleting ? (
                    <span className="flex items-center"><svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Deleting...</span>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};


export default CreatePromotional;
