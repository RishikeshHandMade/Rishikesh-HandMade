"use client";
import React, { useRef, useState, useEffect } from 'react';
// import uploadimg from './upload-img.png';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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

const ManageArtisanBlogs = ({ artisanId, artisanDetails = null }) => {
  // All the state and logic from your provided code, adapted for Next.js and UI kit usage
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();
  const [artisans, setArtisans] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState(artisanId || '');
  const [title, setTitle] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [showBlogsModal, setShowBlogsModal] = useState(false);
  const [selectedArtisanBlogs, setSelectedArtisanBlogs] = useState([]);
  const [selectedArtisanInfo, setSelectedArtisanInfo] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Placeholder fetchers (replace with your API calls)
  const fetchArtisans = async ({ artisanId, artisanDetails = null } = {}) => {
    // Fetch artisans from API
    setArtisans([]);
  };
  const fetchBlogs = async (artisanIdToFetch) => {
    if (!artisanIdToFetch) {
      setBlogs([]);
      return;
    }
    try {
      setLoadingReviews(true);
      const res = await fetch(`/api/artisanBlog?artisanId=${artisanIdToFetch}`);
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (err) {
      toast.error('Failed to fetch blogs');
      setBlogs([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Handler for file input change
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (selectedImages.length + files.length > 10) {
      toast.error('You can only upload up to 10 images.');
      return;
    }
    setImageUploading(true);
    setUploadProgress(0);
    try {
      let newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        // Progress not natively supported by fetch; for demo, just set 100% after upload
        const res = await fetch('/api/cloudinary', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Image upload failed');
        const result = await res.json();
        newImages.push({ url: result.url, key: result.key });
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 10));
      toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded!`);
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (selectedImages.length >= 10) {
      toast.error('Maximum 10 images allowed.');
      return;
    }
    fileInputRef.current?.click();
  };

  const removeImage = (index) => {
    setSelectedImages(prevImages => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      URL.revokeObjectURL(prevImages[index].url);
      return updatedImages;
    });
  };
  // Fetch artisans and reviews
  useEffect(() => {
    async function fetchArtisansAndPromotions() {
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
          } else {
            setCreatedBy('');
            setTitle('');
          }
        } else {
          setCreatedBy('');
          setTitle('');
        }
      } catch (err) {
        toast.error('Failed to fetch artisans');
        setCreatedBy('');
        setTitle('');
      }
      // Fetch reviews/promotions
      try {
        setLoadingReviews(true);
        const promoUrl = '/api/promotion';
        const res = await fetch(promoUrl);
        if (!res.ok) throw new Error('Failed to fetch promotions');
        const data = await res.json();
        // Accept either array or object with .promotions
        if (Array.isArray(data)) {
          setReviews(data);
        } else if (Array.isArray(data.promotions)) {
          setReviews(data.promotions);
        } else {
          setReviews([]);
          toast.error('No promotions found.');
        }
      } catch (err) {
        setReviews([]);
        toast.error('Failed to fetch promotions');
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchArtisansAndPromotions();
  }, [artisanId]);

  useEffect(() => {
    fetchBlogs(selectedArtisan || artisanId);
    return () => {
      selectedImages.forEach(image => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [selectedArtisan, artisanId]);

  const handleEdit = (blog) => {
    setEditMode(true);
    setEditingBlogId(blog._id);
    setTitle(blog.title || '');
    setYoutubeUrl(blog.youtubeUrl || '');
    setShortDescription(blog.shortDescription || '');
    setLongDescription(blog.longDescription || '');
    setSelectedArtisan(blog.artisan?._id || blog.artisan || '');
    
    // Set the correct tab based on whether there's a YouTube URL or images
    if (blog.youtubeUrl) {
      setMediaTab('youtube');
    } else {
      setMediaTab('image');
    }
    
    if (editor) {
      editor.commands.setContent(blog.longDescription, false);
      setLongDescription(blog.longDescription);
    }
    setSelectedImages(
      (Array.isArray(blog.images) ? blog.images : []).map((img, idx) => {
        // Support both {url, key} objects and plain url strings
        if (typeof img === 'string') {
          return { url: img, key: `img-string-${idx}`, file: null };
        } else if (typeof img === 'object' && img !== null) {
          return {
            url: img.url || '',
            key: img.key || `img-obj-${idx}`,
            file: null
          };
        }
        return { url: '', key: `img-unknown-${idx}`, file: null };
      })
    );
  };

  const handleDelete = async () => {
    if (!deleteBlogId) return;
    try {
      const res = await fetch('/api/artisanBlog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteBlogId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Blog deleted successfully!');
        fetchBlogs(selectedArtisan || artisanId);
      } else {
        toast.error(data?.message || 'Failed to delete blog');
      }
    } catch (err) {
      toast.error('Error deleting blog');
    } finally {
      setShowDeleteModal(false);
      setDeleteBlogId(null);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteBlogId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteBlogId(null);
  };

  const [imageEditorUploading, setImageEditorUploading] = useState(false);
  const imageInputRef = React.useRef(null);


  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageEditorUploading(true);
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
      setImageEditorUploading(false);
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
    content: longDescription,
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
    return longDescription;
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
    e.preventDefault();
    const content = getCurrentContent();
    setLongDescription(content);
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        youtubeUrl,
        shortDescription,
        longDescription: content,
        artisan: selectedArtisan,
        images: selectedImages.map(img => ({ url: img.url, key: img.key })),
      };
      let res, data;
      if (editMode && editingBlogId) {
        res = await fetch('/api/artisanBlog', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBlogId, ...payload }),
        });
      } else {
        res = await fetch('/api/artisanBlog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      data = await res.json();
      if (res.ok) {
        toast.success(editMode ? 'Blog updated successfully!' : 'Blog created successfully!');
        fetchBlogs(selectedArtisan || artisanId);
        handleCancelEdit();
      } else {
        toast.error(data?.message || 'Failed to save blog');
      }
    } catch (err) {
      toast.error('Error saving blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, []);

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingBlogId(null);
    setTitle('');
    setYoutubeUrl('');
    setShortDescription('');
    setLongDescription('');
    if(editor){
      editor.commands.setContent('');
    }
    // Only reset selectedArtisan if artisanId is not present
    if (!artisanId) setSelectedArtisan('');
    setSelectedImages([]);
  };

  const [mediaTab, setMediaTab] = useState('image'); // 'image' or 'youtube'

  const handleTabChange = (tab) => {
    setMediaTab(tab);
    if (tab === 'image') {
      setYoutubeUrl('');
    } else {
      setSelectedImages([]);
    }
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row justify-center">
          <div className="w-full max-w-5xl mx-auto">
            <h3 className="my-4 text-center font-bold text-2xl">Create Promotions Video / Image</h3>
            <div className="bg-white rounded shadow p-6 mb-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4 flex gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Title Of Artisan Video</label>
                    <input
                      type="text"
                      placeholder="Enter Your Artisan Title:"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="w-64">
                    <label className="block font-semibold mb-1">Select Artisan</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 bg-gray-100"
                      value={(() => {
                        const found = artisans.find(a => a._id === selectedArtisan);
                        return found ? `${found.title ? found.title + ' ' : ''}${found.firstName} ${found.lastName}` : '';
                      })()}
                      readOnly
                      required
                    />
                  </div>
                </div>
                {/* Media Tab Section */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-t ${mediaTab === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => handleTabChange('image')}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-t ${mediaTab === 'youtube' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => handleTabChange('youtube')}
                    >
                      YouTube URL
                    </button>
                  </div>
                  {mediaTab === 'youtube' ? (
                    <div>
                      <label className="block font-semibold mb-1">YouTube URL</label>
                      <input
                        type="text"
                        placeholder="YouTube URL:"
                        value={youtubeUrl}
                        onChange={e => setYoutubeUrl(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold mb-1">Artisan Images</label>
                      <div className="border rounded p-4 mt-2">
                        <div className="text-center mb-3">
                          {selectedImages.length === 0 ? (
                            <div className="text-gray-400">No images uploaded yet.</div>
                          ) : (
                            <div className="flex flex-wrap gap-3 justify-center">
                              {selectedImages.map((image, index) => (
                                <div key={image.key || image.url || index} className="relative w-40 h-36">
                                  <img
                                    src={image.url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover rounded"
                                  />
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    onClick={() => removeImage(index)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-center mt-2">
                          <div className="mt-2">
                            <small className={selectedImages.length === 10 ? 'text-red-600' : 'text-gray-500'}>
                              {selectedImages.length}/10 images selected
                            </small>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          ref={fileInputRef}
                          onChange={handleImageChange}
                        />
                        <Button
                          type="button"
                          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                          onClick={handleBrowseClick}
                          disabled={imageUploading || selectedImages.length >= 10}
                        >
                          {imageUploading ? 'Uploading...' : 'Browse Image(s)'}
                        </Button>
                        {imageUploading && (
                          <div className="w-full mt-2">
                            <div className="bg-gray-200 rounded h-2 overflow-hidden">
                              <div
                                className="bg-blue-500 h-2 rounded"
                                style={{ width: `${uploadProgress}%`, transition: 'width 0.3s' }}
                              />
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Short Description</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={e => setShortDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Long Description</label>
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
                        disabled={imageEditorUploading}
                      >
                        {imageEditorUploading ? 'Uploading...' : 'Image'}
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
                <div className="text-center">
                  <Button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : (editMode ? 'Update' : 'Save')}
                  </Button>
                  {editMode && (
                    <Button type="button" className="bg-gray-400 text-white px-5 py-2 rounded ml-2" onClick={handleCancelEdit} disabled={isSubmitting}>Cancel</Button>
                  )}
                </div>
              </form>
              {/* Blog Management Table */}
              <div className="bg-white rounded shadow p-6">
                <h4 className="mb-3 font-semibold text-lg">Manage Blogs</h4>
                <div className="overflow-x-auto">
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="px-4 py-3 text-center">S.No</TableHead>
                        <TableHead className="px-4 py-3 text-center">Image</TableHead>
                        <TableHead className="px-4 py-3 text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">No blogs found.</TableCell>
                        </TableRow>
                      ) : (
                        blogs.map((blog, idx) => (
                          <TableRow key={blog._id}>
                            <TableCell className="px-4 py-3 text-center font-medium">{idx + 1}</TableCell>
                            <TableCell className="px-4 py-3 text-center ">
                              {Array.isArray(blog.images) && blog.images.length > 0 ? (() => {
                                let imgObj = blog.images[0];
                                let url = typeof imgObj === 'object' && imgObj !== null ? imgObj.url : imgObj;
                                if (typeof url === 'string' && url.trim() && url !== 'undefined') {
                                  return (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border flex items-center justify-center bg-white mx-auto">
                                      <img
                                        src={url}
                                        alt="Blog Preview"
                                        className="w-full h-full object-cover mx-auto"
                                        onError={e => { e.target.style.display = 'none'; }}
                                      />
                                    </div>
                                  );
                                } else {
                                  return <span className="text-gray-400">No image</span>;
                                }
                              })() : (
                                <span className="text-gray-400">No image</span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-500 text-white px-3 py-1 rounded"
                                  onClick={() => {
                                    setSelectedArtisanBlogs([blog]);
                                    setSelectedArtisanInfo(blog.artisan);
                                    setShowBlogsModal(true);
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                                  onClick={() => handleEdit(blog)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-500 text-white px-3 py-1 rounded"
                                  onClick={() => openDeleteModal(blog._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {/* Delete Modal */}
              {showDeleteModal && (
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Blog</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this blog?</p>
                    <DialogFooter>
                      <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* View Modal */}
              {showBlogsModal && selectedArtisanBlogs.length > 0 && selectedArtisanInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded shadow-lg max-w-lg w-full p-8 relative">
                    <h4 className="font-bold text-lg mb-4">Blog Details</h4>
                    <div className="grid grid-cols-1 gap-4 mb-2">
                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                        <div className="font-semibold text-gray-800">Blog Title</div>
                        <div className="text-gray-600">{selectedArtisanBlogs[0].title}</div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 ">
                        <div className="font-semibold text-gray-800">YouTube URL</div>
                        <div className="text-gray-600 break-all">
                          {selectedArtisanBlogs[0].youtubeUrl ? (
                            <a
                              href={selectedArtisanBlogs[0].youtubeUrl.startsWith('http') ? selectedArtisanBlogs[0].youtubeUrl : `https://${selectedArtisanBlogs[0].youtubeUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {selectedArtisanBlogs[0].youtubeUrl}
                            </a>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                        <div className="font-semibold text-gray-800">Short Description</div>
                        <div className="text-gray-600">{selectedArtisanBlogs[0].shortDescription || '-'}</div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 max-h-24 overflow-y-auto">
                        <div className="font-semibold text-gray-800">Long Description</div>
                        <div dangerouslySetInnerHTML={{ __html: selectedArtisanBlogs[0].longDescription }} className="ProseMirror1 text-gray-600 whitespace-pre-line"></div>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 max-h-32 overflow-y-auto">
                        <div className="font-semibold text-gray-800">Images</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(selectedArtisanBlogs[0].images) && selectedArtisanBlogs[0].images.length > 0 ? (
                            selectedArtisanBlogs[0].images.map((img, idx) => {
                              let url = typeof img === 'object' && img !== null ? img.url : img;
                              const key = (typeof img === 'object' && img !== null && img.key) ? img.key : (url ? url : idx);
                              // Only render if url is valid
                              if (typeof url !== 'string' || !url.trim() || url === 'undefined') {
                                return null;
                              }
                              return (
                                <img
                                  key={key}
                                  src={url}
                                  alt={`Blog Image ${idx + 1}`}
                                  className="w-28 h-20 object-cover rounded"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              );
                            })
                          ) : (
                            <span className="text-gray-400">No images</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="absolute w-8 h-8 top-2 right-2 text-gray-700 hover:text-red-600" onClick={() => setShowBlogsModal(false)}>
                      X
                    </button>
                    <button className="absolute px-4 py-1 bottom-2 right-2 border border-gray-200 rounded bg-red-500 text-white" onClick={() => setShowBlogsModal(false)}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageArtisanBlogs;
