"use client"
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

function getBlogDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getBlogMedia(blog) {
  // Prefer first image, fallback to YouTube thumbnail if present
  if (Array.isArray(blog.images) && blog.images.length > 0) {
    const img = blog.images[0];
    return typeof img === 'string' ? img : img.url || img;
  }
  if (blog.youtubeUrl) {
    // Extract YouTube video ID for thumbnail
    let id = '';
    if (blog.youtubeUrl.includes('youtube.com/watch?v=')) {
      id = blog.youtubeUrl.split('v=')[1].split('&')[0];
    } else if (blog.youtubeUrl.includes('youtu.be/')) {
      id = blog.youtubeUrl.split('youtu.be/')[1].split(/[?&]/)[0];
    }
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return 'https://placehold.co/400x400?text=No+Image';
}

const ViewBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log(blogs)
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/blogs');
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="bg-[#fff8f2] min-h-screen">
      {/* Header with background image */}
      <div className="relative h-64 md:h-80 flex items-center justify-center bg-gradient-to-b from-[#fbeff2] to-[#fff8f2]">
        <img
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=1200&q=80"
          alt="Blog Light Half Image"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg text-center">Blog Light Half Image</h1>
        </div>
      </div>

      {/* Blog grid */}
      <div className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map((blog,key) => (
          <div key={key} className="bg-yellow-100 rounded-xl flex flex-col md:flex-row overflow-hidden shadow group transition hover:shadow-lg">
            <div className="md:w-1/3 w-full flex-shrink-0 flex items-center justify-center bg-white p-4">
              <img
                src={blog.images[0]?.url}
                alt={blog.title}
                className="object-cover rounded-lg w-32 h-32 md:w-28 md:h-28 shadow-md group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between p-6">
              <div>
                <span className="inline-block bg-black text-white text-xs px-3 py-1 rounded font-bold mb-3">{blog.date}</span>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2">{blog.title}</h3>
                <p className="text-gray-700 text-base mb-4 line-clamp-3">{blog.shortDescription}</p>
              </div>
              <div className="flex items-center mt-auto">
                <Link
                  href={`/blog/${blog.id}`}
                  className="text-gray-800 hover:underline font-semibold flex items-center group transition focus:outline-none"
                >
                  Read More <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewBlogs;