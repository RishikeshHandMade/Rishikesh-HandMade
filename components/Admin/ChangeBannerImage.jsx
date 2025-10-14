"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import toast from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PencilIcon, Trash2Icon } from "lucide-react";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef } from "react";
import { UploadIcon } from "lucide-react";

const ChangeBannerImage = () => {
    const fileInputRef = useRef(null);
    const [banners, setBanners] = useState([]);
    const [editBanner, setEditBanner] = useState(null);
    const [formData, setFormData] = useState({
        buttonLink: "",
        frontImg: { url: "", key: "" },
        mobileImg: { url: "", key: "" },
        order: 1,
    });
    // Fetch banners and determine the next order number
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch("/api/addBanner");
                const data = await response.json();
                setBanners(data);

                // Auto-set next order number
                if (data.length > 0) {
                    const highestOrder = Math.max(...data.map((b) => b.order));
                    setFormData((prev) => ({ ...prev, order: highestOrder + 1 }));
                }
            } catch (error) {
                toast.error("Failed to fetch banners");
            }
        };
        fetchBanners();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Separate uploading states for each image
    const [uploadingFront, setUploadingFront] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingFront(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        try {
            const res = await fetch('/api/cloudinary', {
                method: 'POST',
                body: formDataUpload
            });
            const data = await res.json();
            if (res.ok && data.url) {
                setFormData(prev => ({ ...prev, frontImg: { url: data.url, key: data.key || '' } }));
                toast.success('Front image uploaded!');
            } else {
                toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            toast.error('Cloudinary upload error: ' + err.message);
        }
        setUploadingFront(false);
    };
    // Separate uploading states for each image
    const [uploadingMobileImg, setUploadingMobileImg] = useState(false);

    const handleMobileImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingMobileImg(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        try {
            const res = await fetch('/api/cloudinary', {
                method: 'POST',
                body: formDataUpload
            });
            const data = await res.json();
            if (res.ok && data.url) {
                setFormData(prev => ({ ...prev, mobileImg:{url:data.url,key:data.key|| ''} }));
                toast.success('Mobile Banner Image Uploaded!');
            } else {
                toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            toast.error('Cloudinary upload error: ' + err.message);
        }
        setUploadingMobileImg(false);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.frontImg?.url || !formData.frontImg?.key) return toast.error("Please upload a front image");
        if (!formData.mobileImg?.url || !formData.mobileImg?.key) return toast.error("Please upload a mobile image");
        try {
            const method = editBanner ? "PATCH" : "POST";
            // Find the selected coupon object
            // Compose payload with coupon details
            const payload = {
                ...formData,
                id: editBanner,
            };
            const response = await fetch("/api/addBanner", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Banner ${editBanner ? "updated" : "added"} successfully`);
                setEditBanner(null);

                // Refresh banner list
                const updatedBanners = await fetch("/api/addBanner").then((res) => res.json());
                setBanners(updatedBanners);

                // Reset form
                setFormData({
                    buttonLink: "",
                    order: updatedBanners.length + 1,
                    frontImg: { url: "", key: "" },
                    mobileImg: { url: "", key: "" },

                });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (banner) => {
        setEditBanner(banner._id);
        setFormData({
            buttonLink: banner.buttonLink,
            order: banner.order,
            frontImg: banner.frontImg || { url: "", key: "" },
            mobileImg: banner.mobileImg || { url: "", key: "" },
        });
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch("/api/addBanner", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Banner deleted successfully");

                setBanners((prev) => prev.filter((banner) => banner._id !== id));

                // Update order numbers
                const updatedBanners = await fetch("/api/addBanner").then((res) => res.json());
                setBanners(updatedBanners);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    // Remove image from formData only
    const handleDeleteImage = () => {
        setFormData(prev => ({ ...prev, frontImg: { url: '', key: '' } }));
    };
    const handleDeleteMobileImage = () => {
        setFormData(prev => ({ ...prev, mobileImg: { url: '', key: '' } }));
    };
    const fileInputBackRef = useRef(null);

    return (
        <div className="max-w-5xl mx-auto py-10 w-full">
            <h2 className="text-2xl font-bold mb-6">{editBanner ? "Edit Banner" : "Add New Banner"}</h2>
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
                {/* Banner Image Upload */}
                <div className="mb-4">
                    <Label className="block mb-2 font-bold">Laptop Banner Image</Label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                        id="banner-image-input"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="mb-2 flex items-center gap-2 bg-blue-500 text-white"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                        <span>Select Laptop Banner Image</span>
                        <UploadIcon className="w-4 h-4" />
                    </Button>
                    {uploadingFront && <div className="text-blue-600 font-semibold">Uploading...</div>}
                    {formData?.frontImg.url && (
                        <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
                            <Image
                                src={formData?.frontImg.url}
                                alt="Banner Preview"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
                                title="Remove image"
                            >
                                <Trash2Icon className="w-4 h-4 text-red-600" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="mb-4">
                    <Label className="block mb-2 font-bold">Mobile Banner Image</Label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleMobileImageChange}
                        ref={fileInputBackRef}
                        className="hidden"
                        id="banner-image-input"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="mb-2 flex items-center gap-2 bg-blue-500 text-white"
                        onClick={() => fileInputBackRef.current && fileInputBackRef.current.click()}
                    >
                        <span>Select Mobile Banner Image</span>
                        <UploadIcon className="w-4 h-4" />
                    </Button>
                    {uploadingMobileImg && <div className="text-blue-600 font-semibold">Uploading...</div>}
                    {formData.mobileImg?.url && (
                        <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
                            <Image
                                src={formData.mobileImg?.url}
                                alt="Banner Preview"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleDeleteMobileImage}
                                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
                                title="Remove image"
                            >
                                <Trash2Icon className="w-4 h-4 text-red-600" />
                            </button>
                        </div>
                    )}
                </div>
                <div>
                    <Label>Button Link</Label>
                    <Input name="buttonLink" placeholder="Enter Image URL Link" type="url" value={formData.buttonLink} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>Order</Label>
                    <Input name="order" placeholder="Enter order" type="number" value={formData.order} readOnly className="bg-gray-100 cursor-not-allowed" />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                        {editBanner ? "Update Banner" : "Add Banner"}
                    </Button>
                    {editBanner && (
                        <Button
                            type="button"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => {
                                setEditBanner(null);
                                setFormData({
                                    buttonLink: "",
                                    order: banners.length + 1,
                                    frontImg: { url: "", key: "" },

                                });
                            }}
                        >
                            Cancel Edit
                        </Button>
                    )}
                </div>
            </form>

            <h2 className="text-2xl font-bold mt-10 mb-4">Existing Banners</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Laptop Image</TableHead>
                        <TableHead>Mobile Image</TableHead>
                        <TableHead>Button Link</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {banners.length > 0 ? (
                        banners.map((banner) => (
                            <TableRow key={banner._id}>
                                <TableCell className="px-5">{banner.order}</TableCell>
                                <TableCell className="flex gap-4 items-center justify-start h-24">
                                    {banner.frontImg?.url ? (
                                        <Image src={banner.frontImg.url} alt="Front" width={100} height={100} className="rounded-lg mb-1 w-60 object-contain" />
                                    ) : null}

                                    {!banner.frontImg?.url && (
                                        <span className="text-gray-400">No image</span>
                                    )}
                                </TableCell>
                                <TableCell className="h-24 w-24">
                                    {banner.mobileImg?.url ? (
                                        <Image src={banner.mobileImg.url} alt="Front" width={100} height={100} className="rounded-lg mb-1 w-60 object-contain" />
                                    ) : null}

                                    {!banner.mobileImg?.url && (
                                        <span className="text-gray-400">No image</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-pointer">Hover to view</span>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white text-blue-600 font-medium text-base font-barlow shadow-2xl">
                                                <p>{banner.buttonLink}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(banner)} className="mr-2 "><PencilIcon /></Button>
                                    <Button size="icon" onClick={() => handleDelete(banner._id)} variant="destructive"><Trash2Icon /></Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="5" className="text-center py-4">No banners found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ChangeBannerImage;
