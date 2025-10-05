"use client";
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
const ArtisonStory = ({ artisanId, artisanDetails = null }) => {
  const imageInputRef = useRef();
  const [artisans, setArtisans] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState(artisanId || '');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Image upload handler
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Image upload failed');
      const result = await res.json();
      setSelectedImage({ url: result.url, key: result.key });
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const [removingImage, setRemovingImage] = useState(false);

  const handleRemoveImage = async () => {
    if (!selectedImage || !selectedImage.key) {
      toast.error('No valid Cloudinary key found for this image.', { id: 'cloud-delete-story' });
      setSelectedImage(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }
    setRemovingImage(true);
    toast.loading('Deleting image from Cloudinary...', { id: 'cloud-delete-story' });
    try {
      const res = await fetch('/api/cloudinary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: selectedImage.key })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Image deleted from Cloudinary!', { id: 'cloud-delete-story' });
        setSelectedImage(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
      } else {
        toast.error('Cloudinary error: ' + (data.error || 'Failed to delete image from Cloudinary'), { id: 'cloud-delete-story' });
      }
    } catch (err) {
      toast.error('Failed to delete image from Cloudinary (network or server error)', { id: 'cloud-delete-story' });
    } finally {
      setRemovingImage(false);
    }
  };



  const [stories, setStories] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Placeholder fetchers (replace with your API calls)
  const fetchStories = async () => {
    const currentArtisanId = artisanDetails?._id || artisanId || selectedArtisan;
    if (!currentArtisanId) {
      setStories([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/artisanStory?artisanId=${currentArtisanId}`);
      const data = await res.json();
      if (data.success) {
        setStories(data.stories || []);
      } else {
        toast.error(data.message || 'Failed to fetch stories');
        setStories([]);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      toast.error('Failed to fetch stories');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [artisanId, artisanDetails, selectedArtisan]);



  const [imageEditorUploading, setImageEditorUploading] = useState(false);
  const imageEditorInputRef = React.useRef(null);


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
      if (file && imageEditorInputRef.current) imageEditorInputRef.current.value = '';
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
    setIsSubmitting(true);

    // Prepare the story data
    const storyData = {
      title,
      shortDescription,
      longDescription: content,
      images: selectedImage ? { url: selectedImage.url, key: selectedImage.key } : undefined,
      artisan: artisanDetails?._id || selectedArtisan,
    };

    if (!storyData.artisan) {
      toast.error('Please select an artisan.');
      setIsSubmitting(false);
      return;
    }
    if (!storyData.title || !storyData.shortDescription || !storyData.longDescription) {
      toast.error('Please fill all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      let res, data;
      if (editMode && editingId) {
        // Update existing story
        res = await fetch('/api/artisanStory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: editingId, ...storyData }),
        });
        data = await res.json();
        if (data.success) {
          toast.success('Story updated successfully!');
          clearForm();
          setEditMode(false);
          setEditingId(null);
          fetchStories();
          if (editor) {
            editor.commands.clearContent();
          }
        } else {
          if (data.message && data.message.includes('already exists')) {
            toast.error('This artisan story already exists!');
          } else {
            toast.error(data.message || 'Failed to update story');
          }
        }
      } else {
        // Create new story
        res = await fetch('/api/artisanStory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storyData),
        });
        data = await res.json();
        if (data.success) {
          toast.success('Story created successfully!');
          clearForm();
          fetchStories();
          if (editor) {
            editor.commands.clearContent();
          }
        } else {
          if (data.message && data.message.includes('already exists')) {
            toast.error('This artisan story already exists!');
          } else {
            toast.error(data.message || 'Failed to create story');
          }
        }
      }
    } catch (err) {
      toast.error('Something went wrong!');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEditStory = (story) => {
    setEditMode(true);
    setEditingId(story._id);
    setTitle(story.title);
    setShortDescription(story.shortDescription);
    const storyLongDesc = story.longDescription || '';
    setLongDescription(storyLongDesc);
    setSelectedArtisan(story.artisan?._id || '');
    setSelectedImage(story.images ? { url: story.images.url, key: story.images.key } : null);
    
    // Use a timeout to ensure the editor is ready before setting content
    setTimeout(() => {
      if (editor) {
        editor.commands.setContent(storyLongDesc, false);
      }
    }, 100);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleDeleteStory = (story) => {
    setShowDeleteModal(true);
    setDeleteId(story._id);
    setSelectedStory(story);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch('/api/artisanStory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Story deleted successfully!');
        fetchStories();
      } else {
        toast.error(data.message || 'Failed to delete story');
      }
    } catch (err) {
      toast.error('Failed to delete story');
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };
  const clearForm = () => {
    setTitle('');
    setShortDescription('');
    setLongDescription('');
    setSelectedImage(null);
    // Only reset selectedArtisan if there's no artisanId provided
    if (!artisanId) {
      setSelectedArtisan('');
    }
    if (editor) {
      editor.commands.clearContent();
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingId(null);
    clearForm();
  };

  useEffect(() => {
    fetchStories(selectedArtisan || artisanId);
  }, [selectedArtisan, artisanId]);

  // GROUP STORIES BY ARTISAN
  const groupedStories = stories.reduce((acc, story) => {
    const artisanId = story.artisan?._id;
    if (!artisanId) return acc;
    if (!acc[artisanId]) {
      acc[artisanId] = { artisan: story.artisan, stories: [] };
    }
    acc[artisanId].stories.push(story);
    return acc;
  }, {});

  const handleViewStories = (group) => {
    setSelectedStory(group.stories[0]);
    setShowViewModal(true);
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
    <div className="page-content">
      <div className="container-fluid px-3">
        <div className="row justify-center">
          <div className="w-full max-w-5xl mx-auto">
            <h4 className="my-4 text-center font-bold text-2xl">Create Artisan Story</h4>
            <div className="bg-white rounded shadow p-6 mb-6">
              <form onSubmit={handleSubmit}>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Story Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div className="w-64">
                    <label className="block font-semibold mb-1">Artisan User</label>
                    {artisanDetails ? (
                      <input
                        type="text"
                        className="w-full border rounded p-2 bg-gray-100"
                        value={
                          artisanDetails.title
                            ? `${artisanDetails.title} ${artisanDetails.firstName} ${artisanDetails.lastName}`
                            : `${artisanDetails.firstName} ${artisanDetails.lastName}`
                        }
                        readOnly
                        required
                      />
                    ) : (
                      <select
                        value={selectedArtisan}
                        onChange={e => setSelectedArtisan(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="">Select Artisan</option>
                        {artisans && artisans.length > 0 && artisans.map(artisan => (
                          <option key={artisan._id} value={artisan._id}>
                            {artisan.firstName} {artisan.lastName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Upload Image</label>
                  <div className="border rounded p-4 text-center">
                    {selectedImage ? (
                      <div className="relative inline-block mb-3">
                        <img
                          src={selectedImage.url}
                          alt="Story Preview"
                          className="w-56 h-36 object-cover rounded mx-auto"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          onClick={handleRemoveImage}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder cursor-pointer flex flex-col items-center">
                        <img src="/upload-img.png" width="50" alt="Upload" className="mb-2" />
                        <h5 className="mb-1">Browse Image</h5>
                        <p className="text-gray-500">From Drive</p>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          ref={imageEditorInputRef}
                          onChange={handleImageChange}
                        />
                        <button
                          type="button"
                          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                          onClick={() => imageEditorInputRef.current && imageEditorInputRef.current.click()}
                          disabled={imageUploading}
                        >
                          {imageUploading ? 'Uploading...' : 'Browse Image'}
                        </button>
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
                    )}
                    {selectedImage && (
                      <div className="text-center mt-3">
                        <button
                          type="button"
                          className="bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                          onClick={handleRemoveImage}
                          disabled={removingImage}
                        >
                          {removingImage && (
                            <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                          )}
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={shortDescription}
                    onChange={e => setShortDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
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
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : (editMode ? 'Update' : 'Create')}
                  </button>
                  {editMode && (
                    <button
                      type="button"
                      className="bg-gray-400 text-white px-5 py-2 rounded ml-2"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          {/* Stories Table */}
          <div className="bg-white rounded shadow p-6">
            <h4 className="mb-3 font-semibold text-lg">Manage Stories</h4>
            <div className="overflow-x-auto">
              <Table className="min-w-full text-sm border border-gray-200 rounded">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="py-2 px-3 border-b text-center">S.no</TableHead>
                    <TableHead className="py-2 px-3 border-b text-center">Story Image</TableHead>
                    <TableHead className="py-2 px-3 border-b text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.length === 0 || Object.keys(groupedStories).length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-4">No stories found.</TableCell></TableRow>
                  ) : (
                    Object.values(groupedStories).map((group, idx) => (
                      <TableRow key={group.artisan._id}>
                        <TableCell className="py-2 px-3 border-b text-center">{idx + 1}</TableCell>
                        <TableCell className="py-2 px-3 border-b text-center">
                          {group.stories[0] && group.stories[0].images && group.stories[0].images.url ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border flex items-center justify-center bg-white mx-auto">
                              <img
                                src={group.stories[0].images.url}
                                alt="Story"
                                className="w-full h-full object-cover mx-auto"
                                onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 border mx-auto">N/A</div>
                          )}
                        </TableCell>
                        <TableCell className="py-2 px-3 border-b text-center">
                          <button
                            type="button"
                            className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                            onClick={() => handleViewStories(group)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                            onClick={() => handleEditStory(group.stories[0])}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="bg-red-600 text-white px-3 py-1 rounded"
                            onClick={() => handleDeleteStory(group.stories[0])}
                          >
                            Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Stories Modal and other modals can be added here as needed */}
        </div>
      </div>
      {/* View Modal */}
      {showViewModal && selectedStory && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h3 className="font-bold text-xl mb-4">Story Details</h3>
            <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
              <div className="font-semibold text-gray-800">Title</div>
              <div className="text-gray-600">{selectedStory.title}</div>
            </div>

            <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
              <div className="font-semibold text-gray-800">Short Description</div>
              <div className="text-gray-600">{selectedStory.shortDescription}</div>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 max-h-24 overflow-y-auto">
              <div className="font-semibold text-gray-800">Long Description</div>
              <div dangerouslySetInnerHTML={{ __html: unescapeHtml(selectedStory.longDescription) }} className="ProseMirror1 text-gray-600"></div>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
              <div className="font-semibold text-gray-800">Image</div>
              {selectedStory.images && selectedStory.images.url ? (
                <div className="text-gray-600"><img src={selectedStory.images.url} alt="Story" className="w-56 h-36 object-cover rounded mt-2" onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} /></div>
              ) : (
                <div className="w-56 h-36 flex items-center justify-center bg-gray-200 rounded text-gray-400">No Image</div>
              )}
            </div>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowViewModal(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {showDeleteModal && selectedStory && (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Story</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this story?</p>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ArtisonStory;
