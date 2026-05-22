import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './utils/i18n';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import InfluencersPage from './pages/InfluencersPage';
import InfluencerDetailPage from './pages/InfluencerDetailPage';
import TrustGraphPage from './pages/TrustGraphPage';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-ink">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/influencers" element={<InfluencersPage />} />
          <Route path="/influencers/:id" element={<InfluencerDetailPage />} />
          <Route path="/trust-graph" element={<TrustGraphPage />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}
