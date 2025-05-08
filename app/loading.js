export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
      <div className="relative flex items-center justify-center w-42 md:w-48 h-42 md:h-48">
        <span className="absolute inset-0 rounded-full border-4 border-dotted border-blue-500 animate-spin-slow" style={{ borderWidth: '8px' }}></span>
        <img
          src="/loader.jpg"
          alt="Loading..."
          className="rounded-full w-48 md:w-48 h-48 md:h-48 object-cover shadow-lg"
        />
      </div>
    </div>  
  );
}
