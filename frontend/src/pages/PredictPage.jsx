import PredictionForm from '../components/PredictionForm';
import CsvUploader from '../components/CsvUploader';

export default function PredictPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <PredictionForm />
        <CsvUploader />
      </div>
    </div>
  );
}