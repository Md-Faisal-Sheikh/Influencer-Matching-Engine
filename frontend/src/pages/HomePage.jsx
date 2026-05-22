import { Link } from 'react-router-dom';
import { useI18n } from '../utils/i18n';

export default function HomePage() {
  const { t } = useI18n();

  const tracks = [
    { icon: '🎯', title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: '📊', title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: '🤖', title: t('home.feature3Title'), desc: t('home.feature3Desc') },
    { icon: '🌐', title: t('home.feature4Title'), desc: t('home.feature4Desc') }
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center relative">
          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-none tracking-tight mb-6">
            {t('home.heroTitle1')}<br />
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              {t('home.heroTitle2')}
            </span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/match"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold transition-all duration-200 glow-accent"
            >
              {t('home.startBtn')}
            </Link>
            <Link
              to="/influencers"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-card hover:bg-border text-white rounded-xl font-semibold border border-border transition-all duration-200"
            >
              {t('home.browseBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tracks.map((t, i) => (
            <div
              key={t.title}
              className="bg-card border border-border rounded-2xl p-6 hover:border-accent/40 transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="font-display font-bold text-white mb-2">{t.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-accent/10 to-accent-light/5 border border-accent/20 rounded-3xl p-12 text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-muted mb-8">{t('home.ctaSubtitle')}</p>
          <Link
            to="/match"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold transition-all"
          >
            {t('home.ctaBtn')}
          </Link>
        </div>
      </section>
    </div>
  );
}
