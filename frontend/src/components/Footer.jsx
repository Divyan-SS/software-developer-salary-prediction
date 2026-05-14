// Footer.jsx
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/60 bg-gradient-to-r from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          {/* Left side - Copyright */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>© 2025 Salary Prediction System</span>
          </div>

          {/* Center - Attribution */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Powered by Stack Overflow Developer Survey 2020</span>
          </div>

          {/* Right side - Optional extra link (can be removed if not needed) */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="text-xs text-slate-400 hover:text-sky-600 transition"
              onClick={(e) => e.preventDefault()}
            >
              Privacy
            </a>
            <span className="text-slate-300 text-xs">•</span>
            <a
              href="#"
              className="text-xs text-slate-400 hover:text-sky-600 transition"
              onClick={(e) => e.preventDefault()}
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}