import { useEffect, useState } from 'react';
import { fetchFilteredAnalytics, fetchAnalytics } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ExplorePage() {
  const [allCountries, setAllCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all country names initially
  useEffect(() => {
    fetchAnalytics().then(res => {
      const countries = res.data.mean_salary_by_country.map(item => item.category);
      setAllCountries(countries);
      setSelectedCountries(countries); // initially select all
    }).catch(console.error);
  }, []);

  // Fetch filtered data whenever selectedCountries changes
  useEffect(() => {
    if (selectedCountries.length === 0) {
      setAnalytics(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchFilteredAnalytics(selectedCountries)
      .then(res => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCountries]);

  const handleCountryChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCountries(value);
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  if (!analytics) return <div className="text-center py-8 text-gray-600">Select at least one country</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Country (multi‑select)</label>
        <select
          multiple
          value={selectedCountries}
          onChange={handleCountryChange}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          size={5}
        >
          {allCountries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple</p>
      </div>

      <div className="space-y-8">
        {/* Mean Salary by Country */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mean Salary by Country</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.mean_salary_by_country}>
              <XAxis dataKey="category" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }} />
              <Bar dataKey="mean_salary" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Salary by Experience */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary by Experience (years)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.mean_salary_by_experience}>
              <XAxis dataKey="category" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }} />
              <Line type="monotone" dataKey="mean_salary" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Distribution */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.salary_distribution}>
              <XAxis dataKey="bin" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }} />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Education Salary Comparison */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Education Level vs Salary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.education_salary_comparison}>
              <XAxis dataKey="EdLevel" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }} />
              <Bar dataKey="mean" fill="#f59e0b" name="Mean Salary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}