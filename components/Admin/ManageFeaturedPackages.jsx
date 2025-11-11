"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
// import { UploadButton } from "@uploadthing/react"; // Removed UploadThing
// import { deleteFileFromUploadthing } from "@/utils/Utapi"; // Removed UploadThing
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "../ui/switch";
const ManageFeaturedPackages = () => {
    const [packages, setPackages] = useState([]);
    const [editingPackage, setEditingPackage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        image: { url: "", key: "" }, // Storing both URL & Key
        link: "",
    });
    const [uploading, setUploading] = useState(false);
    // Add this line to fix delete button bug
    const [packageToDelete, setPackageToDelete] = useState({ id: null, imageKey: null });

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch("/api/featured-packages/admin");
                const data = await response.json();
                // console.log(data);
                setPackages(data.data || []);
            } catch (error) {
                toast.error("Failed to fetch Packages", error);
            }
        };
        fetchPackages();
    }, []);

    const handleEdit = (pkg) => {
        setEditingPackage(pkg._id);
        setFormData(pkg);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingPackage
                ? `/api/featured-packages/${editingPackage}` // Update existing package
                : "/api/featured-packages"; // Create new package

            const method = editingPackage ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save Product");
            }

            toast.success("Product saved successfully");
            setEditingPackage(null);
            setFormData({ title: "", image: { url: "", key: "" }, link: "" });

            // Refresh the list of packages
            const updatedPackages = await fetch("/api/featured-packages/admin").then((res) => res.json());
            setPackages(updatedPackages.data || []);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleRemoveBanner = () => {
        setFormData({ ...formData, image: { url: "", key: "" } });
    };

    const handleDelete = (id, imageKey) => {
        setPackageToDelete({ id, imageKey });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        const { id, imageKey } = packageToDelete;
        try {
            // Delete the image from Uploadthing first
            if (imageKey) {
                // Removed UploadThing delete, now just clear image from state(imageKey);
            }

            // Then delete the package from database
            const response = await fetch(`/api/featured-packages/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete package");
            }

            toast.success("Product deleted successfully");

            // Refresh the list of packages
            const updatedPackages = await fetch("/api/featured-packages/admin").then((res) => res.json());
            setPackages(updatedPackages.data || []);

            // If we were editing this package, clear the form
            if (editingPackage === id) {
                setEditingPackage(null);
                setFormData({ title: "", image: { url: "", key: "" }, link: "" });
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setShowDeleteModal(false);
            setPackageToDelete({ id: null, imageKey: null });
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setPackageToDelete({ id: null, imageKey: null });
    };
    const handleToggleFeatured = async (id, value) => {
        try {
            const response = await fetch(`/api/featured-packages/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: value }),
            });

            if (!response.ok) {
                throw new Error("Failed to update featured status");
            }

            toast.success("Featured status updated successfully");

            // Refresh the list of packages
            const updatedPackages = await fetch("/api/featured-packages/admin").then((res) => res.json());
            setPackages(updatedPackages.data || []);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-6 mt-12 mx-auto max-w-7xl w-full ">
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
                <Label>Title</Label>
                <Input name="title" placeholder="e.g. Add Product Title" value={formData.title} onChange={handleChange} required />
                <Label>Link</Label>
                <Input name="link" placeholder="e.g. Add Product Link" value={formData.link} onChange={handleChange} required />
                <br />
                {/* Uploadthing Image Upload */}
                <Label>Image</Label>
                <br />
                {formData?.image?.url === "" && (
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="featured-image-upload-input"
                            onChange={async (event) => {
                                const file = event.target.files[0];
                                if (!file) return;
                                setUploading(true);
                                try {
                                    const formDataUpload = new FormData();
                                    formDataUpload.append('file', file);
                                    const res = await fetch('/api/cloudinary', {
                                        method: 'POST',
                                        body: formDataUpload
                                    });
                                    if (!res.ok) throw new Error('Image upload failed');
                                    const result = await res.json();
                                    setFormData((prev) => ({
                                        ...prev,
                                        image: { url: result.url, key: result.key },
                                    }));
                                    toast.success('Image uploaded successfully!');
                                } catch (err) {
                                    toast.error('Upload failed');
                                } finally {
                                    setUploading(false);
                                }
                            }}
                            disabled={uploading}
                        />
                        <Button
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                            onClick={() => document.getElementById('featured-image-upload-input').click()}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                    </>
                )}

                {formData?.image?.url && (
                    <div
                        className="relative aspect-video rounded-lg h-52 w-fit   overflow-hidden border-2 border-blue-600 group"
                    >
                        <Image
                            src={formData?.image?.url || 'https://dummyimage.com/600x400'}
                            alt={`Banner Preview`}
                            fill
                            sizes="100vw"
                            className={`object-contain w-full transition-opacity duration-500`}
                        />

                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleRemoveBanner(formData?.image?.key)}
                                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
                <br />

                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" type="submit">
                    {editingPackage ? "Update Packages" : "Add Packages"}
                </Button>
            </form >

            <div className="bg-white rounded shadow p-6">
                <h4 className="mb-3 font-semibold text-lg">Manage Featured Products</h4>
                <div className="overflow-x-auto">
                    <Table className="min-w-full divide-y divide-gray-200">
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="px-4 py-3 text-center">S.No</TableHead>
                                <TableHead className="px-4 py-3 text-center">Image</TableHead>
                                <TableHead className="px-4 py-3 text-center">Title</TableHead>
                                <TableHead className="px-4 py-3 text-center">Active</TableHead>
                                <TableHead className="px-4 py-3 text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4">No featured products found.</TableCell>
                                </TableRow>
                            ) : (
                                packages.map((pkg, idx) => (
                                    <TableRow key={pkg._id}>
                                        <TableCell className="px-4 py-3 text-center font-medium">{idx + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-center text-wrap">
                                            {pkg.title}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center ">

                                            <div className="w-24 h-24 rounded-lg overflow-hidden border flex items-center justify-center bg-white mx-auto">
                                                <img
                                                    src={pkg.image.url}
                                                    alt="Blog Preview"
                                                    className="w-full h-full object-cover mx-auto"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            </div>

                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-center">
                                            <Switch
                                                checked={pkg.isActive}
                                                onCheckedChange={(value) => handleToggleFeatured(pkg._id, value)}
                                            >

                                            </Switch>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <div className="flex gap-2 justify-center">

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                                    onClick={() => handleEdit(pkg)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                                    onClick={() => handleDelete(pkg._id)}
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
            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Featured Product</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this product?</p>
                    <DialogFooter>
                        <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default ManageFeaturedPackages;
