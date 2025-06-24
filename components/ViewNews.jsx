// News modal for viewing news details. Usage: <ViewNews news={newsObj} onClose={fn} />
export default function ViewNews({ news, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-none md:rounded-3xl shadow-2xl w-full h-[80%] max-w-none md:max-w-2xl md:h-[90vh] relative animate-fadeIn flex flex-col overflow-y-auto">
                {/* X Close Button */}
                <button
                    aria-label="Close"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-600 hover:text-black bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-md transition focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                {/* News image or fallback */}
                {news.image && news.image.url ? (
                    <div className="w-full h-52 md:h-72 relative rounded-none md:rounded-t-3xl overflow-hidden">
                        <img
                            src={news.image.url}
                            alt="News Image"
                            className="w-full h-full object-cover object-top rounded-none md:rounded-t-3xl"
                        />
                    </div>
                ) : (
                    <div className="w-full h-80 md:h-72 flex items-center justify-center bg-gray-100 rounded-none md:rounded-t-3xl">
                        <span className="text-gray-400">No Image</span>
                    </div>
                )}
                {/* News content */}
                <div className="flex flex-col items-start px-6 py-2 flex-1">
                    <div className="font-bold text-2xl md:text-4xl mb-2 text-gray-900">{news.title}</div>
                    {news.date && <div className="text-md md:text-lg border bg-yellow-200 rounded-xl px-2 text-gray-700 mb-2">{news.date}</div>}
                    {news.description && <div className="text-md md:text-base text-gray-800 h-72 md:h-52 overflow-y-auto whitespace-pre-line">{news.description}</div>}
                </div>
                <div className="flex justify-end pt-2 px-6 pb-2">
                    <button onClick={onClose} className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 shadow">Close</button>
                </div>
            </div>
        </div>
    );
}
