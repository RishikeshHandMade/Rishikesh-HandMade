"use client"
import { ArrowLeftIcon, Trash, Trash2 } from 'lucide-react';
import React from 'react'

import { useState } from 'react';
import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import { Extension } from '@tiptap/core';
import toast from "react-hot-toast"
import { useRouter } from 'next/navigation';
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
const initialIfAccording = [{ title: '', description: '' }];

const EditActivity = ({ activityId }) => {
  const router = useRouter();
  const imageFirstInputRef = useRef(null);
  const bannerImageInputRef = useRef(null);

  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activity data on mount
  React.useEffect(() => {
    if (!activityId) return;
    setLoading(true);
    fetch(`/api/add_activity/${activityId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          // Defensive: ensure all fields exist
          setForm(prev => ({
            ...prev,
            ...data,
            imageFirst: data.imageFirst || { url: '', key: '' },
            bannerImage: data.bannerImage || { url: '', key: '' },
            mainProfileImage: data.mainProfileImage || { url: '', key: '' },
            imageGallery: Array.isArray(data.imageGallery) ? data.imageGallery : [],
            ifAccording: Array.isArray(data.ifAccording) && data.ifAccording.length > 0 ? data.ifAccording : initialIfAccording
          }));
        } else {
          setError(data.error || 'Could not load activity');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch activity: ' + err.message);
        setLoading(false);
      });
  }, [activityId]);

  const [uploadingImageFirst, setUploadingImageFirst] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const galleryInputRef = useRef(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const mainProfileImageInputRef = useRef(null);
  const [uploadingMainProfileImage, setUploadingMainProfileImage] = useState(false);
  const handleCloudinaryImageChange = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    if (key === 'imageFirst') setUploadingImageFirst(true);
    if (key === 'bannerImage') setUploadingBannerImage(true);
    if (key === 'mainProfileImage') setUploadingMainProfileImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    try {
      const res = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formDataUpload
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm(prev => ({
          ...prev,
          [key]: { url: data.url, key: data.key || '' }
        }));
        toast.success('Image uploaded!');
      } else {
        toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Cloudinary upload error: ' + err.message);
    }
    if (key === 'imageFirst') setUploadingImageFirst(false);
    if (key === 'bannerImage') setUploadingBannerImage(false);
    if (key === 'mainProfileImage') setUploadingMainProfileImage(false);
  };
  const handleDeleteCloudinaryImage = async (key) => {
    const image = form[key];
    if (!image || !image.key) {
      setForm(prev => ({ ...prev, [key]: { url: '', key: '' } }));
      return;
    }
    try {
      const res = await fetch('/api/cloudinary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: image.key }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, [key]: { url: '', key: '' } }));
        toast.success('Image deleted from Cloudinary!');
      } else {
        toast.error('Cloudinary delete failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Cloudinary delete error: ' + err.message);
    }
  };
  const handleCloudinaryGalleryChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    // Limit to 10 images
    if (form.imageGallery.length + files.length > 10) {
      toast.error("You can upload a maximum of 10 images.");
      return;
    }
    setUploadingGallery(true);
    let uploaded = [];
    for (const file of files) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'POST',
          body: formDataUpload
        });
        const data = await res.json();
        if (res.ok && data.url) {
          uploaded.push({ url: data.url, key: data.key || '' });
        } else {
          toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        toast.error('Cloudinary upload error: ' + err.message);
      }
    }
    setForm(prev => ({
      ...prev,
      imageGallery: [...prev.imageGallery, ...uploaded].slice(0, 10) // ensure max 10
    }));
    setUploadingGallery(false);
  };
  const handleDeleteCloudinaryGalleryImage = async (idx) => {
    const img = form.imageGallery[idx];
    // Remove from UI first
    setForm(prev => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((_, i) => i !== idx)
    }));
    // Then delete from Cloudinary if key exists
    if (!img || !img.key) return;
    try {
      const res = await fetch('/api/cloudinary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: img.key }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Image deleted from Cloudinary!');
      } else {
        toast.error('Cloudinary delete failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Cloudinary delete error: ' + err.message);
    }
  };
  const initialForm = {
    firstTitle: '',
    imageFirst: { url: '', key: '' },
    bannerImage: { url: '', key: '' },
    secondTitle: '',
    shortPara: '',
    thirdTitle: '',
    thirdPara: '',
    videoUrl: '',
    ifAccording: initialIfAccording,
    mainProfileImage: { url: '', key: '' },
    imageGallery: [],
    longPara: '',
    active: true
  };
  const [form, setForm] = useState(initialForm);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  // Handle If According change
  const handleIfAccordingChange = (i, field, value) => {
    setForm((prev) => {
      const updated = [...prev.ifAccording];
      updated[i][field] = value;
      return { ...prev, ifAccording: updated };
    });
  };

  // Add If According
  const addIfAccording = () => {
    setForm((prev) => ({ ...prev, ifAccording: [...prev.ifAccording, { title: '', description: '' }] }));
  };

  // Remove If According
  const removeIfAccording = (i) => {
    setForm((prev) => {
      const updated = prev.ifAccording.filter((_, idx) => idx !== i);
      return { ...prev, ifAccording: updated };
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/add_activity/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Activity updated successfully!');
        // Refetch activity data so form stays in sync
        fetch(`/api/add_activity/${activityId}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              setForm(prev => ({
                ...prev,
                ...data,
                imageFirst: data.imageFirst || { url: '', key: '' },
                bannerImage: data.bannerImage || { url: '', key: '' },
                mainProfileImage: data.mainProfileImage || { url: '', key: '' },
                imageGallery: Array.isArray(data.imageGallery) ? data.imageGallery : [],
                ifAccording: Array.isArray(data.ifAccording) && data.ifAccording.length > 0 ? data.ifAccording : initialIfAccording
              }));
            }
          });
      } else {
        toast.error(data.error || 'Failed to update activity');
      }
    } catch (err) {
      toast.error('Failed to update activity: ' + err.message);
    }
  };
  // Tiptap editors for rich text fields
  const shortParaEditor = useEditor({
    extensions: [StarterKit, TextStyle, FontFamily, Typography, TextAlign, Underline, Link, Color, ListItem],
    content: form.shortPara,
    editorProps: { attributes: { class: 'min-h-[100px] border rounded-lg p-3 bg-gray-200 text-black font-semibold' } },
    onUpdate: ({ editor }) => setForm(prev => ({ ...prev, shortPara: editor.getHTML() }))
  });
  const thirdParaEditor = useEditor({
    extensions: [StarterKit, TextStyle, FontFamily, Typography, TextAlign, Underline, Link, Color, ListItem],
    content: form.thirdPara,
    editorProps: { attributes: { class: 'min-h-[100px] border rounded-lg p-3 bg-gray-200 text-black font-semibold' } },
    onUpdate: ({ editor }) => setForm(prev => ({ ...prev, thirdPara: editor.getHTML() }))
  });
  const longParaEditor = useEditor({
    extensions: [StarterKit, TextStyle, FontFamily, Typography, TextAlign, Underline, Link, Color, ListItem],
    content: form.longPara,
    editorProps: { attributes: { class: 'min-h-[150px] border rounded-lg p-3 bg-gray-200 text-black font-semibold' } },
    onUpdate: ({ editor }) => setForm(prev => ({ ...prev, longPara: editor.getHTML() }))
  });

  // Keep editor content in sync when form is updated from API
  React.useEffect(() => {
    if (shortParaEditor && form.shortPara !== shortParaEditor.getHTML()) {
      shortParaEditor.commands.setContent(form.shortPara || '', false);
    }
    if (thirdParaEditor && form.thirdPara !== thirdParaEditor.getHTML()) {
      thirdParaEditor.commands.setContent(form.thirdPara || '', false);
    }
    if (longParaEditor && form.longPara !== longParaEditor.getHTML()) {
      longParaEditor.commands.setContent(form.longPara || '', false);
    }
  }, [form.shortPara, form.thirdPara, form.longPara, shortParaEditor, thirdParaEditor, longParaEditor]);
  return (
    <form className="max-w-4xl w-full mx-auto border border-black bg-white p-10 shadow-lg" onSubmit={handleSubmit}>
      <div className="mb-2">
        <button className='px-4 py-1 bg-gray-500 text-white rounded flex items-center' onClick={() => {
          toast.dismiss();
          router.back()
        }}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to View Activity Page
        </button>
      </div>
      <h2 className="text-2xl font-semibold mb-6">Activities Page Name : {form.title}</h2>
      {/* First Title Tag Line */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">First Title Tag Line</label>
        <input type="text" name="firstTitle" value={form.firstTitle} onChange={handleChange} placeholder="Type Title Input" className="w-full rounded-md p-3 bg-gray-200 font-semibold text-black" />
      </div>
      {/* Image First (Cloudinary Upload) */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Image First</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleCloudinaryImageChange(e, 'imageFirst')}
          ref={imageFirstInputRef}
          className="hidden"
        />
        <button
          type="button"
          className="mb-2 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => imageFirstInputRef.current && imageFirstInputRef.current.click()}
        >
          <span>Select Image</span>
        </button>
        {uploadingImageFirst && <div className="text-blue-600 font-semibold">Uploading...</div>}
        {form.imageFirst && form.imageFirst.url && (
          <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
            <img
              src={form.imageFirst.url}
              alt="Image First Preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => handleDeleteCloudinaryImage('imageFirst')}
              className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
              title="Remove image"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>
      {/* Banner Image Second (Cloudinary Upload) */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Banner Image Second</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleCloudinaryImageChange(e, 'bannerImage')}
          ref={bannerImageInputRef}
          className="hidden"
        />
        <button
          type="button"
          className="mb-2 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => bannerImageInputRef.current && bannerImageInputRef.current.click()}
        >
          <span>Select Image</span>
        </button>
        {uploadingBannerImage && <div className="text-blue-600 font-semibold">Uploading...</div>}
        {form.bannerImage && form.bannerImage.url && (
          <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
            <img
              src={form.bannerImage.url}
              alt="Banner Image Preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => handleDeleteCloudinaryImage('bannerImage')}
              className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
              title="Remove image"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>
      {/* Second Title Tag Line */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Second Title Tag Line &nbsp; </label>
        <input type="text" name="secondTitle" value={form.secondTitle} onChange={handleChange} placeholder="Type Title Input" className="w-full rounded-md p-3 bg-gray-200  font-semibold" />
      </div>
      {/* Short Para */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Short Paragraph </label>
        <div className="border rounded mt-1 px-3 py-2 bg-white">
          {shortParaEditor && (
            <>
              <div className="flex gap-2 pb-2 mb-2">
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('bold') ? 'bg-gray-200' : ''}`}><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('italic') ? 'bg-gray-200' : ''}`}><Italic className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleUnderline().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('underline') ? 'bg-gray-200' : ''}`}><UnderlineIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().setParagraph().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('paragraph') ? 'bg-gray-200' : ''}`}><PilcrowSquare className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}><Heading1 className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}><Heading2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}><Heading3 className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('bulletList') ? 'bg-gray-200' : ''}`}><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('orderedList') ? 'bg-gray-200' : ''}`}><ListOrdered className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${shortParaEditor.isActive('blockquote') ? 'bg-gray-200' : ''}`}><Quote className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().undo().run()} className="p-2 rounded-lg hover:bg-gray-100"><Undo className="w-4 h-4" /></button>
                <button type="button" onClick={() => shortParaEditor.chain().focus().redo().run()} className="p-2 rounded-lg hover:bg-gray-100"><Redo className="w-4 h-4" /></button>
              </div>
              <EditorContent editor={shortParaEditor} />
            </>
          )}
        </div>
      </div>
      {/* Third Title Tag Line */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Third Title Tag Line</label>
        <input type="text" name="thirdTitle" value={form.thirdTitle} onChange={handleChange} placeholder="Type Title Input" className="w-full rounded-md p-3 bg-gray-200 text-black font-semibold" />
      </div>
      {/* Third Paragraph */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Third Paragraph</label>
        <div className="border rounded mt-1 px-3 py-2 bg-white">  
        {thirdParaEditor && (
          <>
            <div className="flex gap-2 pb-2 mb-2">
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('bold') ? 'bg-gray-200' : ''}`}><Bold className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('italic') ? 'bg-gray-200' : ''}`}><Italic className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleUnderline().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('underline') ? 'bg-gray-200' : ''}`}><UnderlineIcon className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().setParagraph().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('paragraph') ? 'bg-gray-200' : ''}`}><PilcrowSquare className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}><Heading1 className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}><Heading2 className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}><Heading3 className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('bulletList') ? 'bg-gray-200' : ''}`}><List className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('orderedList') ? 'bg-gray-200' : ''}`}><ListOrdered className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${thirdParaEditor.isActive('blockquote') ? 'bg-gray-200' : ''}`}><Quote className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().undo().run()} className="p-2 rounded-lg hover:bg-gray-100"><Undo className="w-4 h-4" /></button>
              <button type="button" onClick={() => thirdParaEditor.chain().focus().redo().run()} className="p-2 rounded-lg hover:bg-gray-100"><Redo className="w-4 h-4" /></button>
            </div>
            <EditorContent editor={thirdParaEditor} />
          </>
        )}
        </div>
      </div>
      {/* Type Video URL */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Type Video URL (Youtube)</label>
        <input type="text" name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="Type Title Input" className="w-full rounded-md p-3 bg-gray-200  text-black font-semibold" />
      </div>
      {/* If According Section */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">If According</label>
        {form.ifAccording.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={item.title} onChange={e => handleIfAccordingChange(i, 'title', e.target.value)} placeholder="Title Text Line" className="flex-1 rounded-md p-3 bg-gray-200 font-semibold" />
            <input type="text" value={item.description} onChange={e => handleIfAccordingChange(i, 'description', e.target.value)} placeholder="Detail Description" className="flex-1 rounded-md p-3 bg-gray-200 font-semibold text-black" />
            {form.ifAccording.length > 1 && (
              <button type="button" onClick={() => removeIfAccording(i)} className="bg-red-500 text-white px-2 rounded"><Trash2 /></button>
            )}
          </div>
        ))}
        <button type="button" onClick={addIfAccording} className="bg-red-500 text-white px-3 py-1 mt-2 rounded flex items-center gap-1"><span className="text-xl font-bold">+</span> Add More</button>
      </div>
      {/* Main Profile Image Second */}
      {/* Main Profile Image Second (Cloudinary Upload) */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Main Profile Image Second</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleCloudinaryImageChange(e, 'mainProfileImage')}
          ref={mainProfileImageInputRef}
          className="hidden"
        />
        <button
          type="button"
          className="mb-2 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => mainProfileImageInputRef.current && mainProfileImageInputRef.current.click()}
        >
          <span>Select Image</span>
        </button>
        {uploadingMainProfileImage && <div className="text-blue-600 font-semibold">Uploading...</div>}
        {form.mainProfileImage && form.mainProfileImage.url && (
          <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
            <img
              src={form.mainProfileImage.url}
              alt="Main Profile Image Preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => handleDeleteCloudinaryImage('mainProfileImage')}
              className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
              title="Remove image"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>
      {/* Image Gallery (Cloudinary Upload, max 10) */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Image Gallery (max 10)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleCloudinaryGalleryChange}
          ref={galleryInputRef}
          className="hidden"
        />
        <button
          type="button"
          className="mb-2 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
          disabled={form.imageGallery.length >= 10}
        >
          <span>{form.imageGallery.length >= 10 ? 'Max 10 images' : 'Upload Gallery Images'}</span>
        </button>
        {uploadingGallery && <div className="text-blue-600 font-semibold">Uploading...</div>}
        {form.imageGallery.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {form.imageGallery.map((img, idx) => (
              <div key={idx} className="relative w-16 h-16">
                <img src={img.url} alt={`Gallery Preview ${idx + 1}`} className="w-16 h-16 object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => handleDeleteCloudinaryGalleryImage(idx)}
                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Long Paragraph Tag Line */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Long Paragraph Tag Line</label>
        <div className="border rounded mt-1 px-3 py-2 bg-white">{longParaEditor && (
          <>
            <div className="flex gap-2 pb-2 mb-2">
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('bold') ? 'bg-gray-200' : ''}`}><Bold className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('italic') ? 'bg-gray-200' : ''}`}><Italic className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleUnderline().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('underline') ? 'bg-gray-200' : ''}`}><UnderlineIcon className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().setParagraph().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('paragraph') ? 'bg-gray-200' : ''}`}><PilcrowSquare className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}><Heading1 className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}><Heading2 className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}><Heading3 className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('bulletList') ? 'bg-gray-200' : ''}`}><List className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('orderedList') ? 'bg-gray-200' : ''}`}><ListOrdered className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${longParaEditor.isActive('blockquote') ? 'bg-gray-200' : ''}`}><Quote className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().undo().run()} className="p-2 rounded-lg hover:bg-gray-100"><Undo className="w-4 h-4" /></button>
              <button type="button" onClick={() => longParaEditor.chain().focus().redo().run()} className="p-2 rounded-lg hover:bg-gray-100"><Redo className="w-4 h-4" /></button>
            </div>
            <EditorContent editor={longParaEditor} />
          </>
        )}</div>

      </div>
      {/* Data Save Button */}
      <button type="submit" className="w-full bg-green-800 text-white font-bold py-3 rounded mt-6 text-lg">Data Save</button>
    </form>
  );
};

export default EditActivity