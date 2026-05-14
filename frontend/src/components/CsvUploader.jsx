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

  const displayedResults = convertedResults || result?.results || [];
  const canConvert = result?.results?.length > 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Batch Predictions (CSV)</h3>
      <p className="text-sm text-gray-600 mb-3">
        Upload a CSV with columns: <code className="bg-gray-100 px-1">Country, EdLevel, YearsCodePro</code>
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="text-gray-700"
        />
        <button
          onClick={downloadSampleCSV}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
        >
          Download Sample CSV
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {uploading ? 'Processing...' : 'Upload & Predict'}
        </button>
      </div>
      <p className="text-sm text-blue-600 mb-4">
        Tip: if upload fails, close the CSV file and select it again. This note is a precaution, not an active error.
      </p>

      {result && (
        <>
          <div className="mb-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">Batch conversion target currency</p>
                <select
                  value={targetCurrency}
                  onChange={(e) => {
                    setTargetCurrency(e.target.value);
                    setConvertedResults(null);
                  }}
                  className="mt-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {conversionLoading ? 'Converting...' : 'Convert Batch'}
                </button>
                <button
                  onClick={() => setConvertedResults(null)}
                  disabled={!convertedResults}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Reset Conversion
                </button>
              </div>
            </div>
            {conversionError && <p className="text-sm text-red-600 mt-3">{conversionError}</p>}
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">
              ✅ Successful: {result.successful_predictions} / {result.total_rows}
              {result.rows_dropped_due_to_education > 0 && (
                <span className="ml-2 text-yellow-600">
                  (⚠️ {result.rows_dropped_due_to_education} rows dropped due to unrecognized education)
                </span>
              )}
            </div>
            {result.errors.length > 0 && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>Errors:</strong>
                <ul className="list-disc list-inside">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>Row {err.row}: {err.country} - {err.error}</li>
                  ))}
                  {result.errors.length > 5 && <li>... and {result.errors.length - 5} more</li>}
                </ul>
              </div>
            )}
            <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Country</th>
                    <th className="p-2 text-left">Education</th>
                    <th className="p-2 text-left">Experience</th>
                    <th className="p-2 text-left">Predicted Salary (USD)</th>
                    <th className="p-2 text-left">Converted Salary ({targetCurrency})</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedResults.map((row, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="p-2">{row.Country}</td>
                      <td className="p-2">{row.EdLevel}</td>
                      <td className="p-2">{row.YearsCodePro}</td>
                      <td className="p-2 font-mono">
                        {typeof row.Predicted_Salary_USD === 'number'
                          ? `$${row.Predicted_Salary_USD.toLocaleString()}`
                          : '❌ Error'}
                      </td>
                      <td className="p-2 font-mono">
                        {typeof row.Converted_Salary === 'number'
                          ? `${row.Converted_Salary.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}