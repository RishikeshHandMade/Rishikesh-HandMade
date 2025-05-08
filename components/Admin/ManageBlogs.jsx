"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadButton } from "@/utils/uploadthing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import toast from "react-hot-toast";
import { deleteFileFromUploadthing } from "@/utils/Utapi";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const ManageBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [editBlog, setEditBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        shortDesc: "",
        url: "",
        date: "",
        nameCode: "",
        role: "",
        image: "",
    });

    // Fetch blogs and determine the next order number
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch("/api/blogs");
                const data = await response.json();
                console.log(data)
                setBlogs(data);

                // Auto-set next order number
                if (data.length > 0) {
                    const highestOrder = Math.max(...data.map((b) => b.order || 0));
                    setFormData((prev) => ({ ...prev, order: highestOrder + 1 }));
                }
            } catch (error) {
                toast.error("Failed to fetch blogs");
            }
        };
        fetchBlogs();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (uploaded) => {
        if (uploaded.length > 0) {
            setFormData({ ...formData, image: uploaded[0].url });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) return toast.error("Please upload an image");
        try {
            const method = editBlog ? "PATCH" : "POST";
            const response = await fetch("/api/blogs", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, id: editBlog }),
            });
            console.log(response)

            const data = await response.json();

            if (response.ok) {
                toast.success(`Blog ${editBlog ? "updated" : "added"} successfully`);
                setEditBlog(null);

                // Refresh blog list
                const updatedBlogs = await fetch("/api/blogs").then((res) => res.json());
                setBlogs(updatedBlogs);

                // Reset form
                setFormData({
                    title: "",
                    shortDesc: "",
                    url: "",
                    date: "",
                    nameCode: "",
                    role: "",
                    image: "",
                });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (blog) => {
        setEditBlog(blog._id);
        setFormData({
            title: blog.title,
            shortDesc: blog.shortDesc,
            url: blog.url,
            date: blog.date,
            nameCode: blog.nameCode,
            role: blog.role,
            image:blog.image,
        });
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch("/api/blogs", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Blog deleted successfully");
                setBlogs((prev) => prev.filter((b) => b._id !== id));
            } else {
                toast.error(data.error);    
            }
        } catch (error) {
            toast.error("Failed to delete blog");
        }
    };

    const handleDeleteImage = async (key) => {
        if (key) {
            await deleteFileFromUploadthing(key);
            setFormData({ ...formData, image: "" });
        }
    };

    // Cancel edit handler
    const handleCancelEdit = () => {
        setEditBlog(null);
        setFormData({
            title: "",
            shortDesc: "",
            url: "",
            date: "",
            nameCode: "",
            role: "",
            image: "",
        });
    };

    return (
        <div className="max-w-5xl mx-auto py-10 w-full">
            <h2 className="text-2xl font-bold mb-6">{editBlog ? "Edit Blog" : "Add New Blog"}</h2>
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
                <div>
                    <Label>Title</Label>
                    <Input name="title" value={formData.title} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>Short Description</Label>
                    <Input name="shortDesc" value={formData.shortDesc} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>URL</Label>
                    <Input name="url" type="url" value={formData.url} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>Date</Label>
                    <Input name="date" type="date" value={formData.date?formData.date.slice(0,10):""} onChange={handleInputChange} />
                </div>

                <div className="flex md:flex-row flex-col items-center md:items-end gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="nameCode" className="font-semibold">Type Name Code</label>
                        <Input name="nameCode" placeholder="Name Code" className="w-32 border-2 border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0 font-bold" value={formData.nameCode} onChange={handleInputChange} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="role" className="font-semibold">Select Role</label>
                        <Select name="role" className="p-2 border border-gray-300 rounded-md" value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                            <SelectTrigger className="w-52 border-2 bg-transparent border-blue-600 focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-blue-600 bg-blue-100">
                                <SelectGroup>
                                    <SelectItem className="focus:bg-blue-300 font-bold" value="Admin">Admin</SelectItem>
                                    <SelectItem className="focus:bg-blue-300 font-bold" value="Solo Traveller">Solo Traveller</SelectItem>
                                    <SelectItem className="focus:bg-blue-300 font-bold" value="Family Group">Family Group</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <Label>Upload Blog Image</Label>
                    {formData.image && typeof formData.image === "string" && formData.image.trim() !== "" ? (
                        <div className="relative">
                            <Image src={formData.image} alt="Blog Preview" width={600} height={400} className="rounded-lg shadow" />
                            <Button type="button" onClick={() => { handleDeleteImage(formData.image) }} className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs">Remove</Button>
                        </div>
                    ) : (
                        <UploadButton endpoint="imageUploader" onClientUploadComplete={handleImageUpload} />
                    )}
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                    {editBlog ? "Update Blog" : "Add Blog"}
                </Button>
                {editBlog && (
                    <Button type="button" className="ml-2 bg-gray-400 hover:bg-gray-300" onClick={handleCancelEdit}>
                        Cancel Edit
                    </Button>
                )}
            </form>

            <h2 className="text-2xl font-bold mt-10 mb-4">Existing Blogs</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titles</TableHead>
                        {/* <TableHead>Subtitle</TableHead> */}
                        <TableHead>Link</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Name Code</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {blogs.length > 0 ? (
                        blogs.map((blog) => (
                            <TableRow key={blog._id}>
                                <TableCell>{blog.title}</TableCell>
                                {/* <TableCell>{blog.subTitle}</TableCell> */}
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-pointer">Hover to view</span>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white text-blue-600 font-medium text-base font-barlow shadow-2xl">
                                                <p>{blog.url}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell>{blog.date && typeof blog.date === 'string' ? blog.date.slice(0,10) : ''}</TableCell>
                                <TableCell>{blog.nameCode}</TableCell>
                                <TableCell>{blog.role}</TableCell>
                                <TableCell>
                                    <Image src={blog.image} alt="Blog" width={100} height={50} className="rounded-lg" />
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(blog)} className="mr-2 "><PencilIcon /></Button>
                                    <Button size="icon" onClick={() => handleDelete(blog._id)} variant="destructive"><Trash2Icon /></Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="6" className="text-center py-4">No blogs found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ManageBlogs;
