"use client"
import React, { useEffect, useState } from 'react';

// Helper to extract YouTube video ID from URL
const getYouTubeId = (url) => {
  const match = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
};

const ProductVideo = ({ productData, productId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      try {
        const res = await fetch(`/api/productVideo?productId=${productId}`);
        const data = await res.json();
        setVideos(data?.video?.videos || []);
      } catch (err) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    if (productId) fetchVideos();
  }, [productId]);

  if (loading) return <div className="py-8 text-center">Loading videos...</div>;
  if (!videos.length) return null;

  // For demo, use placeholder description. In real use, fetch/store per-video descriptions.
  const getDescription = (idx) => productData?.videoDescriptions?.[idx] ||
    'Discover more about this product. Get inspired and connect with us for more details!';

  return (
    <div className="w-full px-10 mx-auto py-10">
      {videos.map((video, idx) => {
        const videoId = getYouTubeId(video.url);
        const isEven = idx % 2 === 1;
        return (
          <div
            key={video.url}
            className="flex flex-col md:flex-row items-stretch justify-center mb-8 gap-5 w-full h-[350px]"
            style={{ flexDirection: isEven ? 'row-reverse' : 'row' }}
          >
            {/* Video */}
            <div className="md:w-1/2 w-full bg-white border border-gray-200 flex items-center justify-center h-[350px]">
              {videoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded shadow-md w-full h-full"
                  style={{ minHeight: 315, aspectRatio: '1/1' }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                  Invalid YouTube URL
                </div>
              )}
            </div>
            {/* Description */}
            <div className="md:w-1/2 w-full bg-white border border-gray-200 p-4 flex flex-col items-center justify-center h-[350px] text-start px-6">
              <h2 className="font-bold text-2xl mb-4">{video.title || "Product Video"}</h2>
              <p className="mb-6 text-gray-700 text-base md:text-lg">{video.description || 'Discover more about this product. Get inspired and connect with us for more details!'}</p>
              <button
                className="bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800 transition"
                onClick={() => window.location.href = '/contact'}
              >
                Get Connected
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductVideo;