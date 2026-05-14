// CsvUploader.jsx
import { useState, useRef, useEffect } from 'react';
import { uploadCSV, convertSalary, getSupportedCurrencies } from '../services/api';
import toast from 'react-hot-toast';

export default function CsvUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [convertedResults, setConvertedResults] = useState(null);
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [supportedCurrencies, setSupportedCurrencies] = useState({ USD: 'United States Dollar' });
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState('');
  const fileInputRef = useRef(null);

  const parseCsv = (text) => {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
    return lines.map((line) => {
      const cells = [];
      let current = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
          if (insideQuotes && line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          cells.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current);
      return cells.map((cell) => cell.trim().replace(/^"|"$/g, ''));
    });
  };

  const validateCsv = (file) =>
    new Promise((resolve, reject) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        reject('Please select a .csv file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        if (typeof text !== 'string') {
          reject('Could not read the CSV file.');
          return;
        }

        const rows = parseCsv(text);
        if (rows.length === 0) {
          reject('CSV file is empty.');
          return;
        }

        const expectedHeader = ['Country', 'EdLevel', 'YearsCodePro'];
        const header = rows[0].map((cell) => cell.trim());

        if (header.length !== expectedHeader.length || !expectedHeader.every((col, index) => col === header[index])) {
          reject('CSV must contain exactly these columns: Country, EdLevel, YearsCodePro. Refer the sample.csv file given above for format.');
          return;
        }

        for (let i = 1; i < rows.length; i += 1) {
          const row = rows[i];
          if (row.length !== expectedHeader.length) {
            reject(`CSV row ${i + 1} must contain exactly 3 columns.`);
            return;
          }
        }

        resolve();
      };
      reader.onerror = () => reject('Failed to read the CSV file.');
      reader.readAsText(file);
    });

  const handleFileChange = (e) => {
    setResult(null);
    setConvertedResults(null);
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    setConversionError('');
    setConvertedResults(null);
    try {
      await validateCsv(file);
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadCSV(formData);
      setResult(response.data);
      setTargetCurrency('USD');
      toast.success(`Predictions completed: ${response.data.successful_predictions} successful`);
    } catch (err) {
      const errorMsg = typeof err === 'string'
        ? err
        : err.response?.data?.detail || err.message || 'Upload failed. Make sure the file is closed and a valid CSV is selected.';
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['Country', 'EdLevel', 'YearsCodePro'],
      ['United States', 'Master’s degree', '8'],
      ['India', 'Bachelor’s degree', '3'],
      ['United Kingdom', 'Professional degree', '12'],
      ['Germany', 'Master’s degree', '5'],
      ['Canada', 'Bachelor’s degree', '2'],
      ['France', 'Other doctoral', '15'],
      ['Australia', 'Master’s degree', '10'],
      ['Netherlands', 'Bachelor’s degree', '4'],
      ['Poland', 'Master’s degree', '7'],
      ['Sweden', 'Bachelor’s degree', '1'],
      ['Brazil', 'Master’s degree', '6'],
      ['Italy', 'Bachelor’s degree', '0.5'],
      ['Spain', 'Master’s degree', '50'],
      ['Russian Federation', 'Bachelor’s degree', '20']
    ];
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_predictions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchConvert = async () => {
    if (!result || !result.results) {
      return;
    }
    setConversionLoading(true);
    setConversionError('');

    try {
      if (targetCurrency === 'USD') {
        setConvertedResults(result.results.map((row) => ({ ...row, Converted_Salary: row.Predicted_Salary_USD })));
        return;
      }

      const converted = await Promise.all(
        result.results.map(async (row) => {
          if (typeof row.Predicted_Salary_USD !== 'number') {
            return { ...row, Converted_Salary: null };
          }

          const response = await convertSalary(row.Predicted_Salary_USD, targetCurrency);
          return {
            ...row,
            Converted_Salary: response.data.converted_salary,
          };
        })
      );

      setConvertedResults(converted);
    } catch (err) {
      setConversionError(err.response?.data?.detail || err.message || 'Batch conversion failed.');
      console.error(err);
    } finally {
      setConversionLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getSupportedCurrencies();
        const fetched = response.data || {};
        setSupportedCurrencies(Object.keys(fetched).length ? fetched : { USD: 'United States Dollar' });
      } catch (err) {
        console.error('Failed to load currencies', err);
        setSupportedCurrencies({ USD: 'United States Dollar' });
      }
    };
    fetchCurrencies();
  }, []);

  const canConvert = result?.results?.length > 0;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Batch Predictions (CSV)</h3>
            <p className="text-sm text-slate-500">
              Upload a CSV with columns: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">Country, EdLevel, YearsCodePro</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 transition flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Choose CSV file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <button
            onClick={downloadSampleCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Sample CSV
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Upload & Predict
              </>
            )}
          </button>
        </div>

        <div className="mt-3 text-sm text-sky-600 bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Tip: If upload fails, close the CSV file and select it again. Ensure correct column headers.</span>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Original Predictions */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Original Predicted Salaries (USD)</h4>
                <p className="text-sm text-slate-500">The original predictions below in USD. Use the converter to see salaries in different currencies.</p>
              </div>
            </div>

            <div className="text-sm text-slate-600 mb-4 flex flex-wrap gap-3">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                ✅ Successful: {result.successful_predictions} / {result.total_rows}
              </span>
              {result.rows_dropped_due_to_education > 0 && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  ⚠️ {result.rows_dropped_due_to_education} rows dropped (unrecognized education)
                </span>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-red-800 mb-2">Errors</p>
                <ul className="text-sm text-red-700 list-disc list-inside max-h-32 overflow-y-auto">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>Row {err.row}: {err.country} - {err.error}</li>
                  ))}
                  {result.errors.length > 5 && <li>... and {result.errors.length - 5} more</li>}
                </ul>
              </div>
            )}

            <div className="overflow-auto max-h-96 border border-slate-200 rounded-xl">
              <table className="min-w-full text-sm text-slate-700">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-semibold">Country</th>
                    <th className="p-3 text-left font-semibold">Education</th>
                    <th className="p-3 text-left font-semibold">Experience</th>
                    <th className="p-3 text-left font-semibold">Predicted Salary (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.results?.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-3">{row.Country}</td>
                      <td className="p-3">{row.EdLevel}</td>
                      <td className="p-3">{row.YearsCodePro}</td>
                      <td className="p-3 font-mono">
                        {typeof row.Predicted_Salary_USD === 'number'
                          ? `$${row.Predicted_Salary_USD.toLocaleString()}`
                          : '❌ Error'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Currency Conversion Section */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Convert to Another Currency</h4>
                <p className="text-sm text-slate-500">Convert all predictions to your preferred currency using real‑time exchange rates.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Target currency</label>
                <select
                  value={targetCurrency}
                  onChange={(e) => {
                    setTargetCurrency(e.target.value);
                    setConvertedResults(null);
                  }}
                  className="w-full sm:w-64 bg-white border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(supportedCurrencies).map(([code, name]) => (
                    <option key={code} value={code}>
                      {`${code} - ${name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBatchConvert}
                  disabled={conversionLoading || !canConvert}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                >
                  {conversionLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Converting...
                    </>
                  ) : (
                    'Convert Batch'
                  )}
                </button>
                <button
                  onClick={() => setConvertedResults(null)}
                  disabled={!convertedResults}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2 rounded-xl transition disabled:opacity-50"
                >
                  Reset
                </button>
              </div>
            </div>
            {conversionError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                {conversionError}
              </div>
            )}
          </div>

          {/* Converted Results Table */}
          {convertedResults && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Converted Salaries ({targetCurrency})</h4>
                  <p className="text-sm text-slate-500">Original USD predictions converted to {targetCurrency}</p>
                </div>
              </div>
              <div className="overflow-auto max-h-96 border border-slate-200 rounded-xl">
                <table className="min-w-full text-sm text-slate-700">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-semibold">Country</th>
                      <th className="p-3 text-left font-semibold">Education</th>
                      <th className="p-3 text-left font-semibold">Experience</th>
                      <th className="p-3 text-left font-semibold">Original (USD)</th>
                      <th className="p-3 text-left font-semibold">Converted ({targetCurrency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convertedResults.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="p-3">{row.Country}</td>
                        <td className="p-3">{row.EdLevel}</td>
                        <td className="p-3">{row.YearsCodePro}</td>
                        <td className="p-3 font-mono">
                          {typeof row.Predicted_Salary_USD === 'number'
                            ? `$${row.Predicted_Salary_USD.toLocaleString()}`
                            : '❌ Error'}
                        </td>
                        <td className="p-3 font-mono">
                          {typeof row.Converted_Salary === 'number'
                            ? `${row.Converted_Salary.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${targetCurrency}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}