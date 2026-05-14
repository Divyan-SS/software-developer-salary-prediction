import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <Link to="/individual" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          Salary Predictor
        </Link>
        <div className="flex flex-wrap gap-4">
          <Link to="/individual" className="text-gray-700 hover:text-blue-600 transition">Individual</Link>
          <Link to="/batch" className="text-gray-700 hover:text-blue-600 transition">Batch</Link>
          <Link to="/explore" className="text-gray-700 hover:text-blue-600 transition">Explore</Link>
        </div>
      </div>
    </nav>
  );
}
