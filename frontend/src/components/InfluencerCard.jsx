import { Link } from 'react-router-dom';
import { useI18n } from '../utils/i18n';

const platformColors = {
  Instagram: 'text-rose-400 bg-rose-400/10',
  YouTube: 'text-red-400 bg-red-400/10',
  TikTok: 'text-cyan-400 bg-cyan-400/10'
};

export default function InfluencerCard({ influencer, showScore = false }) {
  const { t, formatNumber, language } = useI18n();
  const {
    id, name, handle, platform, niche, followers,
    engagement_rate, trust_score, authenticity_score,
    match_score, match_label, verified
  } = influencer;

  const matchColors = {
    'Excellent Match': 'text-emerald bg-emerald/10 border-emerald/30',
    'Good Match': 'text-accent-light bg-accent/10 border-accent/30',
    'Fair Match': 'text-gold bg-gold/10 border-gold/30',
    'Low Match': 'text-muted bg-border/30 border-border'
  };

  const getMatchLabelTranslation = (label) => {
    switch (label) {
      case 'Excellent Match': return t('match.excellentMatch');
      case 'Good Match': return t('match.goodMatch');
      case 'Fair Match': return t('match.fairMatch');
      default: return t('match.lowMatch');
    }
  };

  const formatCardNum = (n) => {
    if (n >= 1000000) {
      const formatted = (n / 1000000).toFixed(1);
      return language === 'bn' ? `${formatNumber(parseFloat(formatted))}M` : `${formatted}M`;
    }
    if (n >= 1000) {
      const formatted = (n / 1000).toFixed(0);
      return language === 'bn' ? `${formatNumber(parseInt(formatted))}K` : `${formatted}K`;
    }
    return formatNumber(n);
  };

  return (
    <Link to={`/influencers/${id}`} className="block group">
      <div className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/30 to-accent-light/20 flex items-center justify-center border border-accent/20">
              <span className="font-display font-bold text-accent-light text-base">
                {name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-display font-semibold text-white text-sm">{name}</p>
                {verified && (
                  <span className="text-accent-light text-xs">✓</span>
                )}
              </div>
              <p className="text-muted text-xs font-mono">{handle}</p>
            </div>
          </div>
          <span className={`text-xs font-mono px-2 py-1 rounded-lg ${platformColors[platform] || 'text-muted bg-border/30'}`}>
            {platform}
          </span>
        </div>

        {/* Match Score */}
        {showScore && match_score !== undefined && (
          <div className={`mb-4 px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-between ${matchColors[match_label] || matchColors['Low Match']}`}>
            <span>{getMatchLabelTranslation(match_label)}</span>
            <span className="font-mono font-bold">{formatNumber(match_score)}/100</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label={t('influencers.followers')} value={formatCardNum(followers)} />
          <Stat label={t('influencers.engagement')} value={language === 'bn' ? `${formatNumber(engagement_rate)}%` : `${engagement_rate}%`} highlight />
          <Stat label={t('influencers.trust')} value={formatNumber(trust_score)} />
        </div>

        {/* Niches */}
        <div className="flex flex-wrap gap-1.5">
          {niche.map(n => (
            <span key={n} className="text-xs px-2 py-0.5 rounded-md bg-surface text-muted border border-border">
              {n}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-surface rounded-xl px-3 py-2 text-center">
      <p className={`font-display font-bold text-sm ${highlight ? 'text-emerald' : 'text-white'}`}>{value}</p>
      <p className="text-muted text-xs mt-0.5">{label}</p>
    </div>
  );
}
