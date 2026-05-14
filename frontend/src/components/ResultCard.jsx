// ResultCard.jsx
import { useState, useEffect } from "react";
import { convertSalary, getSupportedCurrencies } from "../services/api";

export default function ResultCard({ prediction }) {
  const [showConverter, setShowConverter] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState(prediction.currency);
  const [convertedAmount, setConvertedAmount] = useState(prediction.predicted_salary);
  const [supportedCurrencies, setSupportedCurrencies] = useState({});
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getSupportedCurrencies();
        setSupportedCurrencies(response.data);
      } catch (err) {
        console.error("Failed to fetch supported currencies:", err);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    setConvertedAmount(prediction.predicted_salary);
    setTargetCurrency(prediction.currency);
    setShowConverter(false); // Reset converter visibility on new prediction
  }, [prediction]);

  const handleConvert = async () => {
    if (targetCurrency === prediction.currency) {
      setConvertedAmount(prediction.predicted_salary);
      return;
    }

    setConversionLoading(true);
    setConversionError("");
    try {
      // Use the USD value (predicted_salary_usd) for correct conversion
      const usdAmount = prediction.predicted_salary_usd || prediction.predicted_salary;
      const response = await convertSalary(usdAmount, targetCurrency);
      setConvertedAmount(response.data.converted_salary);
    } catch (err) {
      setConversionError(err.response?.data?.detail || "Conversion failed");
    } finally {
      setConversionLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: currency }).format(amount);
    } catch (e) {
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Original Predicted Salary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm uppercase tracking-wide font-medium text-white/80">Original Predicted Salary</p>
          </div>
          <p className="text-4xl md:text-5xl font-bold mb-2">
            {formatCurrency(prediction.predicted_salary, prediction.currency)}
          </p>
          <p className="text-sm text-white/70">Based on your inputs in {prediction.currency}</p>
        </div>
      </div>

      {/* Currency Converter Toggle Button */}
      <button
        onClick={() => setShowConverter(!showConverter)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl transition-all duration-200 font-medium shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {showConverter ? "Hide Currency Converter" : "Convert to Another Currency"}
      </button>

      {/* Converter Panel */}
      {showConverter && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" />
              </svg>
              Currency Converter
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Currency</label>
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                {Object.entries(supportedCurrencies).map(([code, name]) => (
                  <option key={code} value={code}>
                    {`${code} - ${name}`}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleConvert}
              disabled={conversionLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {conversionLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Convert Salary
                </>
              )}
            </button>
            {conversionError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{conversionError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Converted Salary Result - Only shown after successful conversion */}
      {convertedAmount !== prediction.predicted_salary && targetCurrency !== prediction.currency && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" />
              </svg>
              <p className="text-sm uppercase tracking-wide font-medium text-white/80">Converted Salary</p>
            </div>
            <p className="text-4xl md:text-5xl font-bold mb-2">
              {formatCurrency(convertedAmount, targetCurrency)}
            </p>
            <p className="text-sm text-white/70">Converted from {prediction.currency}</p>
          </div>
        </div>
      )}
    </div>
  );
}