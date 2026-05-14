import CsvUploader from '../components/CsvUploader';

export default function BatchPredictPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">Batch Salary Prediction</h2>
      <p className="text-gray-600 mb-8">
        Upload a CSV file with multiple records to predict salaries for an entire batch.
      </p>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <CsvUploader />
      </div>
    </div>
  );
}
