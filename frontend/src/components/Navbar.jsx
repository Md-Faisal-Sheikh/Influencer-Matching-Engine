import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../utils/i18n';

export default function Navbar() {
  const { pathname } = useLocation();
  const { t, toggleLanguage } = useI18n();

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/match', label: t('nav.match') },
    { to: '/influencers', label: t('nav.influencers') },
    { to: '/trust-graph', label: t('nav.graph') }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">IQ</span>
          </div>
          <span className="font-display font-bold text-white tracking-tight text-lg">
            InfluenceIQ
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                pathname === link.to
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-white hover:bg-card'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <button
            onClick={toggleLanguage}
            className="ml-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-accent-light bg-card hover:bg-border/30 hover:border-accent-light/50 transition-all font-display flex items-center gap-1"
          >
            🌐 {t('nav.langToggle')}
          </button>
        </div>
      </div>
    </nav>
  );
}
