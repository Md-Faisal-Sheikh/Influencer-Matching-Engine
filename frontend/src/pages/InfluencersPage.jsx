import { useState, useEffect } from 'react';
import { getInfluencers } from '../utils/api';
import InfluencerCard from '../components/InfluencerCard';
import { useI18n } from '../utils/i18n';

export default function InfluencersPage() {
  const { t } = useI18n();
  const [influencers, setInfluencers] = useState([]);
  const [filters, setFilters] = useState({ platform: '', niche: '', minEngagement: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.platform) params.platform = filters.platform;
      if (filters.niche) params.niche = filters.niche;
      if (filters.minEngagement) params.minEngagement = filters.minEngagement;
      const data = await getInfluencers(params);
      setInfluencers(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-4xl text-white mb-2">{t('influencers.title')}</h1>
        <p className="text-muted">{t('influencers.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={filters.platform}
          onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))}
          className="bg-card border border-border text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent/50"
        >
          <option value="">{t('influencers.allPlatforms')}</option>
          <option value="Instagram">Instagram</option>
          <option value="YouTube">YouTube</option>
          <option value="TikTok">TikTok</option>
        </select>

        <input
          type="text"
          placeholder={t('influencers.filterNiche')}
          value={filters.niche}
          onChange={e => setFilters(f => ({ ...f, niche: e.target.value }))}
          className="bg-card border border-border text-white text-sm rounded-xl px-4 py-2.5 placeholder:text-muted/50 focus:outline-none focus:border-accent/50 w-44"
        />

        <input
          type="number"
          placeholder={t('influencers.minEngagement')}
          value={filters.minEngagement}
          onChange={e => setFilters(f => ({ ...f, minEngagement: e.target.value }))}
          className="bg-card border border-border text-white text-sm rounded-xl px-4 py-2.5 placeholder:text-muted/50 focus:outline-none focus:border-accent/50 w-44"
        />

        <button
          onClick={load}
          className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm rounded-xl font-medium transition-all"
        >
          {t('influencers.applyFilters')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map(inf => (
            <InfluencerCard key={inf.id} influencer={inf} />
          ))}
        </div>
      )}
    </div>
  );
}
