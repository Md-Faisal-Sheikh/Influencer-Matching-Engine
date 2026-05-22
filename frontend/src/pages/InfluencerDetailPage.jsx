import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInfluencer } from '../utils/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useI18n } from '../utils/i18n';
import SyncLogsModal from '../components/SyncLogsModal';

export default function InfluencerDetailPage() {
  const { id } = useParams();
  const [inf, setInf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const { t, language, formatNumber, translateWithParams } = useI18n();

  const fetchDetails = () => {
    setLoading(true);
    getInfluencer(id)
      .then(d => {
        setInf(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="pt-32 flex justify-center">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!inf) return (
    <div className="pt-32 text-center text-muted">
      {language === 'bn' ? 'ইনফ্লুয়েন্সার পাওয়া যায়নি।' : 'Influencer not found.'}{' '}
      <Link to="/influencers" className="text-accent-light font-semibold">
        {language === 'bn' ? 'ফিরে যান' : 'Go back'}
      </Link>
    </div>
  );

  // Localization for Radar Charts
  const radarData = [
    { metric: t('influencers.trust') || 'Trust', value: inf.trust_score },
    { metric: t('influencers.authenticity') || 'Authenticity', value: inf.authenticity_score },
    { metric: t('influencers.engagement') || 'Engagement', value: Math.min(100, inf.engagement_rate * 10) },
    { metric: language === 'bn' ? 'রিচ' : 'Reach', value: Math.min(100, (inf.followers / 600000) * 100) },
    { metric: language === 'bn' ? 'কনটেন্ট বৈচিত্র্য' : 'Content Variety', value: inf.content_types.length * 30 }
  ];

  const demoData = [
    { name: '18-24', value: inf.audience_demographics.age_18_24 },
    { name: '25-34', value: inf.audience_demographics.age_25_34 },
    { name: '35-44', value: inf.audience_demographics.age_35_44 }
  ];

  // Custom formats for numbers
  const formatNum = (n) => {
    let val;
    if (n >= 1000000) val = `${(n / 1000000).toFixed(1)}M`;
    else if (n >= 1000) val = `${(n / 1000).toFixed(0)}K`;
    else val = n.toString();
    
    if (language === 'bn') {
      const banglaDigits = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
        'K': 'কে', 'M': 'এম'
      };
      return val.toString().replace(/[0-9KM]/g, w => banglaDigits[w] || w);
    }
    return val;
  };

  const formatCollabRate = (rate) => {
    if (!rate) return '';
    if (language === 'bn') {
      const banglaDigits = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
      };
      let res = rate.replace(/[0-9]/g, w => banglaDigits[w] || w);
      res = res.replace('post', 'পোস্ট').replace('video', 'ভিডিও');
      return res;
    }
    return rate;
  };

  const handleSyncClose = () => {
    setIsSyncOpen(false);
    fetchDetails(); // Refresh to load newly synced stats!
  };

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-6 animate-fade-in">
      <Link to="/influencers" className="text-muted text-sm hover:text-white flex items-center gap-1 mb-6 transition-colors font-semibold">
        {t('influencers.backBtn') || '← Back to Influencers'}
      </Link>

      {/* Header Profile card */}
      <div className="bg-card border border-border rounded-3xl p-8 mb-6 shadow-accent/5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/40 to-accent-light/20 flex items-center justify-center border border-accent/30 flex-shrink-0 shadow-lg">
            <span className="font-display font-extrabold text-3xl text-accent-light">{inf.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-extrabold text-3xl text-white">{inf.name}</h1>
              {inf.verified && (
                <span className="text-xs px-2.5 py-0.5 bg-accent/20 text-accent-light rounded-full border border-accent/30 font-semibold uppercase tracking-wider">
                  {t('influencers.verified')}
                </span>
              )}
            </div>
            <p className="text-muted font-mono mb-2">{inf.handle} · {inf.platform}</p>
            <p className="text-white/70 text-sm mb-4">{inf.bio}</p>
            <div className="flex flex-wrap gap-2">
              {inf.niche.map(n => (
                <span key={n} className="text-xs px-3 py-1 rounded-lg bg-surface border border-border text-muted font-semibold">{n}</span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-2xl text-white">{formatCollabRate(inf.collaboration_rate)}</p>
            <p className="text-muted text-xs mt-0.5">
              {inf.platform === 'YouTube' ? t('influencers.ratePerVideo') : t('influencers.ratePerPost')}
            </p>
          </div>
        </div>
      </div>

      {/* Trust Network centrality and API Sync widget */}
      <div className="bg-gradient-to-r from-accent/20 to-accent-light/5 border border-border/80 rounded-3xl p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-accent/25 flex items-center justify-center text-2xl border border-accent/40 animate-pulse shadow-md">🕸</div>
          <div>
            <h3 className="text-white font-display font-bold text-base">{t('influencers.trustScoreCard') || 'Graph Trust Score'}</h3>
            <p className="text-muted text-xs mt-0.5">
              {language === 'bn' 
                ? 'পেজর‍্যাঙ্ক সেন্ট্রালিটি নেটওয়ার্ক ব্যবহার করে গাণিতিকভাবে পরিমাপকৃত' 
                : 'Mathematically calculated via PageRank Centrality solver'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center">
          <div className="text-center">
            <span className="text-[10px] text-muted uppercase font-mono tracking-wider">{language === 'bn' ? 'সেন্ট্রালিটি র‍্যাঙ্ক' : 'Centrality Weight'}</span>
            <p className="font-display font-extrabold text-2xl text-accent-light">
              {inf.graph_centrality ? `${formatNumber(parseFloat((inf.graph_centrality * 100).toFixed(2)))}%` : `${formatNumber(3.4)}%`}
            </p>
          </div>
          <div className="text-center border-l border-border pl-6">
            <span className="text-[10px] text-muted uppercase font-mono tracking-wider">{language === 'bn' ? 'মিশ্রিত গ্রাফ ট্রাস্ট' : 'Graph Trust'}</span>
            <p className="font-display font-extrabold text-2xl text-emerald">
              {inf.graph_trust ? formatNumber(inf.graph_trust) : formatNumber(inf.trust_score)}
            </p>
          </div>
          <div className="text-center border-l border-border pl-6">
            <span className="text-[10px] text-muted uppercase font-mono tracking-wider">{language === 'bn' ? 'অথেনটিসিটি সূচক' : 'Network Authenticity'}</span>
            <p className="font-display font-extrabold text-2xl text-gold">
              {inf.graph_authenticity ? formatNumber(inf.graph_authenticity) : formatNumber(inf.authenticity_score)}
            </p>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <button
            onClick={() => setIsSyncOpen(true)}
            className="w-full md:w-auto px-5 py-3 bg-emerald hover:bg-emerald/90 text-ink text-xs font-display font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald/10 hover:shadow-emerald/20 border border-emerald/30 hover:-translate-y-0.5"
          >
            <span>{t('influencers.syncBtn')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('influencers.followers'), value: formatNum(inf.followers), color: 'text-white' },
          { label: language === 'bn' ? 'এনগেজমেন্ট হার' : 'Engagement Rate', value: `${formatNumber(inf.engagement_rate)}%`, color: 'text-emerald' },
          { label: t('influencers.trust') || 'Trust Score', value: formatNumber(inf.trust_score), color: 'text-accent-light' },
          { label: t('influencers.authenticity') || 'Authenticity', value: formatNumber(inf.authenticity_score), color: 'text-gold' }
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 text-center transition-all hover:border-accent/30 hover:shadow-accent/5 hover:-translate-y-0.5">
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-muted text-xs mt-1 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-2xl p-6 transition-all hover:border-accent/10">
          <p className="font-display font-semibold text-white mb-4">{t('influencers.perfRadar')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2A2A3C" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }} />
              <Radar name="Score" dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 transition-all hover:border-accent/10">
          <p className="font-display font-semibold text-white mb-4">{t('influencers.ageDist')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demoData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1C1C28', border: '1px solid #2A2A3C', borderRadius: 12, color: '#fff' }} formatter={v => [`${formatNumber(v)}%`, language === 'bn' ? 'অডিয়েন্স' : 'Audience']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {demoData.map((_, i) => <Cell key={i} fill={['#7C3AED', '#A78BFA', '#4C1D95'][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-muted mt-2 font-semibold">
            <span>
              {translateWithParams('influencers.audienceGender', {
                female: inf.audience_demographics.gender_female,
                male: inf.audience_demographics.gender_male
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Past Brands & Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 transition-all hover:border-accent/10">
          <p className="font-display font-semibold text-white mb-3">{t('influencers.pastBrands')}</p>
          <div className="flex flex-wrap gap-2">
            {inf.past_brands.map(b => (
              <span key={b} className="text-sm px-3 py-1.5 rounded-xl bg-surface border border-border text-white hover:border-accent/20 transition-all font-semibold">{b}</span>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 transition-all hover:border-accent/10">
          <p className="font-display font-semibold text-white mb-3">{t('influencers.contentFormats')}</p>
          <div className="flex flex-wrap gap-2">
            {inf.content_types.map(ct => (
              <span key={ct} className="text-sm px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent-light font-semibold">{ct}</span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between">
            <p className="text-muted text-xs font-semibold">{t('influencers.cpmLabel')}: <span className="text-white font-mono font-bold">৳{formatNumber(inf.avg_cpm)}</span></p>
            <p className="text-muted text-xs font-semibold">{t('influencers.likesLabel')}: <span className="text-white font-mono font-bold">{formatNumber(inf.avg_likes)}</span></p>
          </div>
        </div>
      </div>

      {/* Social sync logs modal */}
      <SyncLogsModal
        influencer={inf}
        isOpen={isSyncOpen}
        onClose={handleSyncClose}
      />
    </div>
  );
}
