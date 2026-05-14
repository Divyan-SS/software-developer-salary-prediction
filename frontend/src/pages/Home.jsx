import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Salary Prediction Dashboard</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose between individual salary prediction, batch CSV upload prediction, or explore salary analytics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/individual" className="block rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Individual Prediction</h2>
          <p className="text-gray-600">Predict your salary based on country, education, and experience.</p>
        </Link>

        <Link to="/batch" className="block rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Batch Prediction</h2>
          <p className="text-gray-600">Upload a CSV file to estimate salaries for multiple entries at once.</p>
        </Link>

        <Link to="/explore" className="block rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Explore Analytics</h2>
          <p className="text-gray-600">View salary trends and analytics by country and experience.</p>
        </Link>
      </div>
    </div>
  );
}