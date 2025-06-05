"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BlogDetail = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams();
  const blogId = params?.id;

  useEffect(() => {
    if (!blogId) return;
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs/${blogId}`);
        if (!res.ok) throw new Error("Failed to fetch blog details");
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) return <div>Loading blog details...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!blog) return <div>No blog found.</div>;

  return (
    <div className="w-full mx-auto p-2 md:p-8 mt-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Blog details (scrollable) */}
        <div className="md:w-2/3 w-full bg-white rounded-xl shadow-lg p-4 md:p-8 md:h-screen md:overflow-y-auto">
          {/* Media section */}
          {blog.youtubeUrl ? (
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${blog.youtubeUrl.split('v=')[1]}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          ) : blog.images && blog.images.length > 0 ? (
            <div className="mb-4">
              <Carousel>
                <CarouselContent>
                  {blog.images.map((img, idx) => (
                    <CarouselItem key={idx}>
                      <img
                        src={img.url}
                        alt={`blog-image-${idx}`}
                        className="w-full h-64 object-cover rounded-xl"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          ) : null}

          {/* Blog meta */}
          <div className="flex flex-col gap-2 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{blog.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}</span>
              <span>By {blog.author || "Admin"}</span>
              <span>36 Comments</span>
            </div>
          </div>

          {/* Short Description as blockquote/card */}
          {blog.shortDescription && (
            <blockquote className="bg-gray-100 border-l-4 border-green-400 p-4 mb-4 rounded">
              <div className="font-semibold text-sm" dangerouslySetInnerHTML={{ __html: blog.shortDescription }} />
            </blockquote>
          )}

          {/* Blog content */}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.longDescription || blog.content || "" }} />
        </div>

        {/* Right: Upcoming box (fixed/sticky) */}
        <div className="md:w-1/3 w-full flex flex-col">
          <div className="flex-1 bg-white rounded-lg shadow p-6 flex flex-col min-h-[400px] md:sticky md:top-4 md:h-[calc(100vh-2rem)]">
            <div className="font-bold text-2xl mb-4">Upcoming.....</div>
            <div className="flex-1 overflow-y-auto pr-2 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 mb-4 text-base font-medium">
                  Exciting updates are on the way! We're working behind the scenes. Something great is coming soon!
                </div>
              ))}
            </div>
            <a href="/contact">
              <button className="w-full bg-lime-400 text-black font-bold py-3 rounded hover:bg-lime-500 transition-colors text-lg">
                Get Connected
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Carousel imports
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

export default BlogDetail;