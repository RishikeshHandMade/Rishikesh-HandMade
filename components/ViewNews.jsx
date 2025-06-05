// News modal for viewing news details. Usage: <ViewNews news={newsObj} onClose={fn} />
export default function ViewNews({ news, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative animate-fadeIn">
        {/* News image or fallback */}
        {news.image && news.image.url ? (
          <div className="w-full h-80 relative rounded-t-3xl overflow-hidden">
            <img
              src={news.image.url}
              alt="News Image"
              className="w-full h-full object-cover rounded-t-3xl"
            />
          </div>
        ) : (
          <div className="w-full h-80 flex items-center justify-center bg-gray-100 rounded-t-3xl">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        {/* News content */}
        <div className="flex flex-col items-start px-6 py-4">
          <div className="font-bold text-3xl mb-4 text-gray-900">{news.title}</div>
          {news.date && <div className="text-xl text-gray-700 mb-2">{news.date}</div>}
          {news.description && <div className="text-base text-gray-800 mb-4 whitespace-pre-line">{news.description}</div>}
        </div>
        <div className="flex justify-end pt-2 px-6 pb-4">
          <button onClick={onClose} className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 shadow">Close</button>
        </div>
      </div>
    </div>
  );
}
