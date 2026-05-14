// LoadingSpinner.jsx
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center my-8 p-6">
      <div className="relative">
        {/* Outer ring with gradient */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 animate-spin">
          <div className="absolute inset-0 rounded-full bg-white/80 backdrop-blur-sm m-1"></div>
        </div>
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 animate-pulse"></div>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
        Loading...
      </p>
    </div>
  );
}