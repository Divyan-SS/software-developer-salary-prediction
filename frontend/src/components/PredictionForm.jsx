// PredictionForm.jsx
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country Select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
          >
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Education Level Radio Group */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Education Level
          </label>
          <div className="flex gap-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="radio"
                value="Undergraduate"
                checked={education === 'Undergraduate'}
                onChange={() => setEducation('Undergraduate')}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm">Undergraduate</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="radio"
                value="Postgraduate"
                checked={education === 'Postgraduate'}
                onChange={() => setEducation('Postgraduate')}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm">Postgraduate</span>
            </label>
          </div>
        </div>

        {/* Experience Slider */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Years of Experience
            </span>
            <span className="text-lg font-bold text-sky-600">{experience}</span>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={experience}
            onChange={(e) => setExperience(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0 yrs</span>
            <span>25 yrs</span>
            <span>50 yrs</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Predict Salary
        </button>
      </form>

      {/* Loading Spinner */}
      {loading && <LoadingSpinner />}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Prediction Result */}
      {prediction && <ResultCard prediction={prediction} />}
    </div>
  );
}