import { useState } from 'react';
import { predictSalary } from '../services/api';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';

const countries = [
  "United States", "India", "United Kingdom", "Germany", "Canada",
  "Brazil", "France", "Spain", "Australia", "Netherlands",
  "Poland", "Italy", "Russian Federation", "Sweden"
];

export default function PredictionForm() {
  const [country, setCountry] = useState('United States');
  const [education, setEducation] = useState('Postgraduate');
  const [experience, setExperience] = useState(5);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await predictSalary({ country, education, experience });
      setPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-700">
              <input type="radio" value="Undergraduate" checked={education === 'Undergraduate'} onChange={() => setEducation('Undergraduate')} /> Undergraduate
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input type="radio" value="Postgraduate" checked={education === 'Postgraduate'} onChange={() => setEducation('Postgraduate')} /> Postgraduate
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience: {experience}</label>
          <input type="range" min="0" max="50" step="1" value={experience} onChange={(e) => setExperience(parseInt(e.target.value))} className="w-full" />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition py-2 rounded-lg font-semibold">
          Predict Salary
        </button>
      </form>
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      {prediction && <ResultCard prediction={prediction} />}
    </div>
  );
}