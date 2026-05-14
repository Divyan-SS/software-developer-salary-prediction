import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import IndividualPredictPage from './pages/IndividualPredictPage';
import BatchPredictPage from './pages/BatchPredictPage';
import ExplorePage from './pages/ExplorePage';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/individual" replace />} />
          <Route path="/individual" element={<IndividualPredictPage />} />
          <Route path="/batch" element={<BatchPredictPage />} />
          <Route path="/explore" element={<ExplorePage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;