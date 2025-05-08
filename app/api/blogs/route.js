import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Blog from "@/models/Blog";

// GET: Fetch all blogs
export async function GET() {
  await connectDB();
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new blog
export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    // Validate required fields for ManageBlogs.jsx
    if (!body.title || !body.shortDesc || !body.url || !body.date || !body.nameCode || !body.role || !body.image) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    const blog = new Blog(body);
    await blog.save();
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PATCH: Update a blog by ID
export async function PATCH(req) {
  await connectDB();
  try {
    const { id, ...update } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }
    // Optionally validate update fields if needed
    const updatedBlog = await Blog.findByIdAndUpdate(id, update, { new: true });
    if (!updatedBlog) throw new Error("Blog not found");
    return NextResponse.json(updatedBlog);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE: Delete a blog by ID
export async function DELETE(req) {
  await connectDB();
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) throw new Error("Blog not found");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
