import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { fetchAnalytics } from '../services/api';

export default function AnalyticsChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics().then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;
  if (!data) return <div className="text-gray-600">Failed to load analytics</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mean Salary by Country</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.mean_salary_by_country}>
            <XAxis dataKey="category" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }} />
            <Bar dataKey="mean_salary" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary by Experience (years)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.mean_salary_by_experience}>
            <XAxis dataKey="category" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb', color: '#111827' }} />
            <Line type="monotone" dataKey="mean_salary" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}