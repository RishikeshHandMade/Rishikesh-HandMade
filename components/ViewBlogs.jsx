import React from 'react';

const blogs = [
  {
    id: 1,
    title: 'Trendsetter Chronicles: Unveiling the Latest in Fashion',
    summary: 'Stay ahead of the curve with the latest trends and insights from the fashion world.',
    date: '10 Sep 2024',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400',
  },
  {
    id: 2,
    title: 'Runway Rundown: Decoding Fashion Week’s Best Looks',
    summary: 'A deep dive into the most talked-about looks from this season’s fashion weeks.',
    date: '17 May 2024',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=400&h=400',
  },
  {
    id: 3,
    title: 'Closet Confidential: Behind-the-Scenes of a Fashionista',
    summary: 'Peek inside the wardrobe and world of a true style maven.',
    date: '23 Sep 2024',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=400&h=400',
  },
  {
    id: 4,
    title: 'DIY Couture: Crafting Your Own Fashion Masterpieces',
    summary: 'Step-by-step guides and inspiration for your next DIY fashion project.',
    date: '30 Oct 2024',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400',
  },
];

const ViewBlogs = () => {
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
          <nav className="mt-4 text-white/90 text-sm flex gap-2 items-center justify-center">
            <span className="hover:underline cursor-pointer">Home</span>
            <span className="mx-1">›</span>
            <span className="hover:underline cursor-pointer">Blog</span>
            <span className="mx-1">›</span>
            <span className="font-semibold">Blog Light Half Image</span>
          </nav>
        </div>
      </div>

      {/* Blog grid */}
      <div className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-yellow-100 rounded-xl flex flex-col md:flex-row overflow-hidden shadow group transition hover:shadow-lg">
            <div className="md:w-1/3 w-full flex-shrink-0 flex items-center justify-center bg-white p-4">
              <img
                src={blog.image}
                alt={blog.title}
                className="object-cover rounded-lg w-32 h-32 md:w-28 md:h-28 shadow-md group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between p-6">
              <div>
                <span className="inline-block bg-black text-white text-xs px-3 py-1 rounded font-bold mb-3">{blog.date}</span>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2">{blog.title}</h3>
                <p className="text-gray-700 text-base mb-4 line-clamp-3">{blog.summary}</p>
              </div>
              <div className="flex items-center mt-auto">
                <a
                  href="#"
                  className="text-gray-800 font-semibold hover:underline flex items-center group transition focus:outline-none"
                >
                  Read More <span className="ml-1">→</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewBlogs;