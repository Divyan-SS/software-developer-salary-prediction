// Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 gap-4">
          {/* Logo / Brand */}
          <Link
            to="/individual"
            className="group flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Salary Predictor
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Link
              to="/individual"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/individual')
                  ? 'bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-600'
              }`}
            >
              Individual
            </Link>
            <Link
              to="/batch"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/batch')
                  ? 'bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-600'
              }`}
            >
              Batch
            </Link>
            <Link
              to="/explore"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/explore')
                  ? 'bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-600'
              }`}
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}