'use client'

import { useForm } from "react-hook-form"
import { Input } from "../ui/input"
import { NumericFormat } from "react-number-format"
import { Button } from "../ui/button"
import { usePackage } from "@/context/PackageContext"
import { useEffect, useState } from "react"
import { UploadButton } from "@/utils/uploadthing"
import { deleteFileFromUploadthing } from "@/utils/Utapi"
import { X } from "lucide-react"
import Image from "next/image"
import { Textarea } from "../ui/textarea"
import toast from "react-hot-toast"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import { Extension } from '@tiptap/core'
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
  PilcrowSquare, // For paragraph
  Table as TableIcon, // For table
  Plus, // For adding rows/columns
  Minus, // For deleting rows/columns
  Merge as MergeIcon, // For merging cells
  Scissors, // For splitting cells
} from 'lucide-react'
import { Switch } from "../ui/switch";
import { tableExtensions } from './tiptap-table-extensions';

// Create a FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',

  addAttributes() {
    return {
      fontSize: {
        default: '16px',
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return {
            style: `font-size: ${attributes.fontSize}`
          }
        }
      }
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: '16px',
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return {
                style: `font-size: ${attributes.fontSize}`
              }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize });
      },
    }
  }
})

// Create a LineHeight extension
const LineHeight = Extension.create({
  name: 'lineHeight',

  addAttributes() {
    return {
      lineHeight: {
        default: '1',
        parseHTML: element => element.style.lineHeight,
        renderHTML: attributes => {
          if (!attributes.lineHeight) return {}
          return {
            style: `line-height: ${attributes.lineHeight}`
          }
        }
      }
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          lineHeight: {
            default: '1',
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {}
              return {
                style: `line-height: ${attributes.lineHeight}`
              }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setLineHeight: lineHeight => ({ chain }) => {
        return chain().setMark('textStyle', { lineHeight });
      },
    }
  }
})

const MenuBar = ({ editor }) => {
  const [showUrlPopup, setShowUrlPopup] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  if (!editor) {
    return null
  }

  const fontSizes = [
    '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'
  ]

  const lineHeights = [
    '0.5', '0.75', '1', '1.2', '1.5', '1.8', '2', '2.5', '3'
  ]

  const handleUrlSubmit = () => {
    if (urlInput) {
      editor.chain().focus().setLink({ href: urlInput }).run();
    }
    setShowUrlPopup(false);
    setUrlInput('');
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2 relative">
      {/* Text Style Group */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('paragraph') ? 'bg-gray-200' : ''}`}
          title="Paragraph"
        >
          <PilcrowSquare className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      {/* Basic Formatting Group */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Alignment Group */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      {/* Lists Group */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Special Formatting Group */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-1 border-r pr-2">
        <input
          type="color"
          onInput={event => editor.chain().focus().setColor(event.target.value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-8 h-8 p-1 rounded cursor-pointer"
          title="Text Color"
        />
      </div>

      {/* Links Group */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => setShowUrlPopup(true)}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* URL Popup Modal */}
      {showUrlPopup && (
        <div className="absolute left-1/2 top-12 -translate-x-1/2 z-50 bg-white border border-gray-300 rounded shadow-lg p-4 flex flex-col items-center min-w-[220px]">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="url-input" className="text-sm font-medium">Enter URL</label>
            <input
              id="url-input"
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="border px-2 py-1 rounded w-full"
              placeholder="https://example.com"
              required
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowUrlPopup(false)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button type="button" onClick={handleUrlSubmit} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Table Controls Group */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('table') ? 'bg-gray-200' : ''}`}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().addColumnBefore() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().addColumnBefore()}
          title="Add Column Before"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().addColumnAfter() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().addColumnAfter()}
          title="Add Column After"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().addRowBefore() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().addRowBefore()}
          title="Add Row Before"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().addRowAfter() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().addRowAfter()}
          title="Add Row After"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().deleteColumn() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().deleteColumn()}
          title="Delete Column"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteRow().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().deleteRow() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().deleteRow()}
          title="Delete Row"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteTable().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().deleteTable() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().deleteTable()}
          title="Delete Table"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().mergeCells().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().mergeCells() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().mergeCells()}
          title="Merge Cells"
        >
          <MergeIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().splitCell().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().splitCell() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().splitCell()}
          title="Split Cell"
        >
          <Scissors className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().toggleHeaderRow() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().toggleHeaderRow()}
          title="Toggle Header Row"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          className={`p-2 rounded hover:bg-gray-100 ${!editor.can().toggleHeaderColumn() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!editor.can().toggleHeaderColumn()}
          title="Toggle Header Column"
        >
          <TableIcon className="w-4 h-4" />
        </button>
      </div>

      {/* History Group */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Font Size Dropdown */}
      <div className="flex items-center gap-1 border-r pr-2">
        <select
          className="p-1 rounded bg-transparent border border-gray-300 hover:bg-gray-100"
          onChange={e => {
            if (e.target.value) {
              editor.chain().focus().setFontSize(e.target.value).run()
            }
          }}
          value={editor.getAttributes('textStyle').fontSize || '16px'}
        >
          <option value="">Font Size</option>
          {fontSizes.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Line Height Dropdown */}
      <div className="flex items-center gap-1 border-r pr-2">
        <select
          className="p-1 rounded bg-transparent border border-gray-300 hover:bg-gray-100"
          onChange={e => {
            if (e.target.value) {
              editor.chain().focus().setLineHeight(e.target.value).run()
            }
          }}
          value={editor.getAttributes('textStyle').lineHeight || '1.5'}
        >
          <option value="">Line Height</option>
          {lineHeights.map(height => (
            <option key={height} value={height}>
              {height}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

const EditPackage = () => {
  const { handleSubmit, register, getValues, setValue, reset, watch } = useForm()
  const [bannerLoading, setBannerLoading] = useState(false);
  const [image, setImage] = useState(null)
  const [imageKey, setImageKey] = useState(null)

  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailKey, setThumbnailKey] = useState(null)

  let packages = usePackage()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle.configure({
        types: ['textStyle']
      }),
      FontSize,
      LineHeight,
      FontFamily,
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Color,
      ListItem,
      ...tableExtensions,
    ],
    content: packages?.basicDetails?.fullDesc || '',
    onUpdate: ({ editor }) => {
      setValue('basicDetails.fullDesc', editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none'
      }
    }
  })

  useEffect(() => {
    if (packages) {
      setValue("packageName", packages.packageName);
      setValue("price", packages.price);
      setValue("priceUnit", packages.priceUnit);
      setValue("basicDetails.location", packages?.basicDetails?.location)
      setValue("basicDetails.heliBooking", packages?.basicDetails?.heliBooking)
      setValue("basicDetails.planCalculator", packages?.basicDetails?.planCalculator)
      setValue("basicDetails.tourType", packages?.basicDetails?.tourType)
      setValue("basicDetails.duration", packages?.basicDetails?.duration)
      setValue("basicDetails.notice", packages?.basicDetails?.notice)
      setValue("basicDetails.smallDesc", packages?.basicDetails?.smallDesc)
      setValue("basicDetails.fullDesc", packages?.basicDetails?.fullDesc)
      setThumbnail(packages?.basicDetails?.thumbnail?.url)
      setThumbnailKey(packages?.basicDetails?.thumbnail?.key)
      setImage(packages?.basicDetails?.imageBanner?.url)
      setImageKey(packages?.basicDetails?.imageBanner?.key)
    }
  }, [packages, setValue]);

  const [showNotice, setShowNotice] = useState(!!watch('basicDetails.notice'));

  const handleBannerUpload = async (file) => {
    setBannerLoading(true);
    setImage(file[0]?.ufsUrl);
    setImageKey(file[0]?.key);
  };

  const handleBannerLoad = () => {
    setBannerLoading(false);
  };

  const handleRemoveBanner = async () => {
    if (imageKey) {
      const success = await deleteFileFromUploadthing(imageKey);
      if (success) {
        setImage(null);
        setImageKey(null);
      }
    }
  };

  const handleThumbnailUpload = async (file) => {
    setThumbnailLoading(true);
    setThumbnail(file[0]?.ufsUrl);
    setThumbnailKey(file[0]?.key);
  };

  const handleThumbnailLoad = () => {
    setThumbnailLoading(false);
  };

  const handleRemoveThumbnail = async () => {
    if (thumbnailKey) {
      const success = await deleteFileFromUploadthing(thumbnailKey);
      if (success) {
        setThumbnail(null);
        setThumbnailKey(null);
      }
    }
  };

  const onSubmit = async (data) => {
    data.pkgId = packages._id
    data.packageCode = packages.packageCode

    if (!data.basicDetails.duration) {
      toast.error("Duration Field is required", {
        style: {
          border: "2px solid red",
          borderRadius: "10px"
        }
      })
      return
    }

    try {
      const response = await fetch("/api/admin/website-manage/addPackage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      const res = await response.json()

      if (response.ok) {
        toast.success("Package updated successfully!", {
          style: {
            border: "2px solid green",
            borderRadius: "10px"
          }
        })

        window.location.reload()
      } else {
        toast.error(`Failed To Update Package: ${res.message}`, {
          style: {
            border: "2px solid red",
            borderRadius: "10px"
          }
        })
      }
    } catch (error) {
      toast.error("Something went wrong", {
        style: {
          border: "2px solid red",
          borderRadius: "10px"
        }
      })
    }
  }

  return (
    <>
      <form className="flex flex-col items-center justify-center gap-8 my-20 w-full bg-blue-100 max-w-7xl p-4 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-4xl font-semibold">Basic Detail</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label htmlFor="packageCode" className="font-semibold">Package Code</label>
            <Input name="packageCode" className="border-2 border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0 font-bold" readOnly value={packages?.packageCode} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="packageName" className="font-semibold">Package Name</label>
            <Input name="packageName" className="border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0" onChange={(e) => setValue('packageName', e.target.value)} {...register('packageName')} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="font-semibold">Package Price</label>
            <NumericFormat thousandSeparator={true} prefix="₹" name="price" className="px-2 font-bold py-1 border-2 rounded-md border-blue-600 focus:border-dashed focus:border-blue-500 bg-transparent focus:outline-none focus-visible:ring-0" onValueChange={(values) => setValue('price', values.floatValue)} value={packages?.price} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="priceUnit" className="font-semibold">Price Unit</label>
            <select
              name="priceUnit"
              value={watch('priceUnit') || ""}
              onChange={(e) => setValue('priceUnit', e.target.value)}
              className="p-1 border-2 bg-transparent border-blue-600 focus:border-blue-500 focus:ring-0 focus:outline-none w-full rounded-md"
            >
              <option value="" disabled className="bg-blue-100 border-2 border-blue-500">Select Price Unit</option>
              <option value="Per Person" className="bg-blue-100 border-2 border-blue-500">Per Person</option>
              <option value="2 Person" className="bg-blue-100 border-2 border-blue-500">2 Person</option>
              <option value="Group" className="bg-blue-100 border-2 border-blue-500">Group</option>
            </select>

          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="font-semibold">Location</label>
            <Input name="location" className="border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0" onChange={(e) => setValue('basicDetails.location', e.target.value)} {...register('basicDetails.location')} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="heliBooking" className="font-semibold">Helicopter Booking</label>
            <select
              name="heliBooking"
              value={watch('basicDetails.heliBooking') || ""}
              onChange={(e) => setValue('basicDetails.heliBooking', e.target.value)}
              className="p-1 border-2 bg-transparent border-blue-600 focus:border-blue-500 focus:ring-0 focus:outline-none w-full rounded-md"
            >
              <option value="" disabled className="bg-blue-100 border-2 border-blue-500">Select Type</option>
              <option value="Yes" className="bg-blue-100 border-2 border-blue-500">Yes</option>
              <option value="No" className="bg-blue-100 border-2 border-blue-500">No</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="planCalculator" className="font-semibold">Plan Calculator</label>
            <select
              name="planCalculator"
              value={watch('basicDetails.planCalculator') || ""}
              onChange={(e) => setValue('basicDetails.planCalculator', e.target.value)}
              className="p-1 border-2 bg-transparent border-blue-600 focus:border-blue-500 focus:ring-0 focus:outline-none w-full rounded-md"
            >
              <option value="" disabled className="bg-blue-100 border-2 border-blue-500">Select Type</option>
              <option value="Yes" className="bg-blue-100 border-2 border-blue-500">Yes</option>
              <option value="No" className="bg-blue-100 border-2 border-blue-500">No</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="tourType" className="font-semibold">Tour Type</label>
            <Input type={'text'} name="tourType" className="border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0" onChange={(e) => setValue('basicDetails.tourType', e.target.value)} {...register('basicDetails.tourType')} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="duration" className="font-semibold">Duration (No. of Days)</label>
            <Input type={'number'} min={1} name="duration" className="border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0" onChange={(e) => setValue('basicDetails.duration', e.target.value)} {...register('basicDetails.duration')} />
          </div>
          <div className="flex flex-col gap-2 col-span-2 xl:col-span-4">
            <label htmlFor="notice" className="font-semibold">Any Important Notice Tag Line</label>
            <div className="flex items-center gap-4">
              <Switch
                checked={showNotice}
                onCheckedChange={(checked) => {
                  setShowNotice(checked);
                  if (!checked) setValue('basicDetails.notice', '');
                }}
                id="notice-switch"
              />
              <span>{showNotice ? 'On' : 'Off'}</span>
            </div>
            {showNotice && (
              <div className="flex items-center gap-2">
                <Input
                  name="notice"
                  className="border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0"
                  onChange={(e) => setValue('basicDetails.notice', e.target.value)}
                  value={watch('basicDetails.notice') || ''}
                  {...register('basicDetails.notice')}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs px-2 py-1 border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setValue('basicDetails.notice', '');
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 col-span-2 xl:col-span-4">
            <label htmlFor="smallDesc" className="font-semibold">Small Description</label>
            <Textarea name="smallDesc" rows={4} className="border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0" onChange={(e) => setValue('basicDetails.smallDesc', e.target.value)} {...register('basicDetails.smallDesc')} />
          </div>
          <div className="flex flex-col gap-2 col-span-2 xl:col-span-4 w-full">
            <label htmlFor="fullDesc" className="font-semibold">Full Description</label>
            <div className="rounded-lg border-2 border-blue-600 focus-within:border-dashed focus-within:border-blue-500">
              <MenuBar editor={editor} />
              <EditorContent 
                editor={editor} 
                className="min-h-[200px] p-2 prose max-w-none bg-transparent" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 w-full">
          <label className="font-semibold">Thumbnail</label>
          <div className="grid grid-cols-1 w-full gap-4">
            {thumbnail ? (
              <div
                className="relative aspect-video rounded-lg h-52 w-auto mx-auto overflow-hidden border-2 border-blue-600 group"
              >
                {thumbnailLoading && (
                  <div className="absolute inset-0 animate-pulse bg-blue-300 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}

                <Image
                  src={thumbnail || 'https://dummyimage.com/600x400'}
                  alt={`Banner Preview`}
                  fill
                  sizes="100vw"
                  className={`object-contain w-full transition-opacity duration-500 ${thumbnailLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  onLoad={handleThumbnailLoad}
                />

                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveThumbnail(thumbnailKey)}
                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No Thumbnail uploaded</p>
            )}
          </div>
          <UploadButton
            disabled={thumbnailLoading || thumbnail}
            endpoint="imageUploader"
            onClientUploadComplete={(files) => {
              handleThumbnailUpload(files);
              if (files) {
                setValue('basicDetails.thumbnail.url', files[0].ufsUrl)
                setValue('basicDetails.thumbnail.key', files[0].key)
              }
            }}
            onUploadError={(error) => console.error("Error uploading thumbnail", error)}
            className="ut-button:bg-blue-600 after:ut-button:ut-uploading:bg-blue-300"
          >
            Upload Thumbnail
          </UploadButton>
        </div>

        <div className="space-y-2 w-full">
          <label className="font-semibold">Image Main Title Banner</label>
          <div className="grid grid-cols-1 w-full gap-4">
            {image ? (
              <div
                className="relative aspect-video rounded-lg h-52 w-full overflow-hidden border-2 border-blue-600 group"
              >
                {bannerLoading && (
                  <div className="absolute inset-0 animate-pulse bg-blue-300 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}

                <Image
                  src={image || 'https://dummyimage.com/600x400'}
                  alt={`Banner Preview`}
                  fill
                  sizes="100vw"
                  className={`object-contain w-full transition-opacity duration-500 ${bannerLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                  onLoad={handleBannerLoad}
                />

                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveBanner(imageKey)}
                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No Image Banner uploaded</p>
            )}
          </div>
          <UploadButton
            disabled={bannerLoading || image}
            endpoint="imageUploader"
            onClientUploadComplete={(files) => {
              handleBannerUpload(files);
              if (files) {
                setValue('basicDetails.imageBanner.url', files[0].ufsUrl)
                setValue('basicDetails.imageBanner.key', files[0].key)
              }
            }}
            onUploadError={(error) => console.error("Error uploading Banner Image", error)}
            className="ut-button:bg-blue-600 after:ut-button:ut-uploading:bg-blue-300"
          >
            Upload Banner Image
          </UploadButton>
        </div>

        <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Add Package</Button>
      </form>
    </>
  )
}

export default EditPackage
