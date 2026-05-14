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
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl text-center">
      <p className="text-sm uppercase tracking-wide text-gray-600">Estimated Annual Salary</p>
      <p className="text-3xl font-bold text-gray-900">
        {formatCurrency(convertedAmount, targetCurrency)}
      </p>
      <p className="text-xs text-gray-500">Displayed in {prediction.currency}. Conversion is optional.</p>

      <button
        onClick={() => setShowConverter(!showConverter)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        {showConverter ? "Hide Converter" : "Convert Currency"}
      </button>

      {showConverter && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Convert to:</p>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          >
            {Object.entries(supportedCurrencies).map(([code, name]) => (
              <option key={code} value={code}>
                {`${code} - ${name}`}
              </option>
            ))}
          </select>
          <button
            onClick={handleConvert}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            disabled={conversionLoading}
          >
            {conversionLoading ? "Converting..." : "Apply Conversion"}
          </button>
          {conversionError && <p className="text-red-600 mt-2 text-center">{conversionError}</p>}
        </div>
      )}
    </div>
  );
}