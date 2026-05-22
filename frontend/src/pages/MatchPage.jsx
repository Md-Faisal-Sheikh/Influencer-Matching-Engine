import { useState } from 'react';
import { matchInfluencers, saveBrand } from '../utils/api';
import InfluencerCard from '../components/InfluencerCard';
import { useI18n } from '../utils/i18n';

const NICHES = ['Tech', 'Beauty', 'Fashion', 'Food', 'Travel', 'Health', 'Fitness', 'Education', 'Gaming', 'Lifestyle', 'Finance', 'Sustainability'];
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok'];

export default function MatchPage() {
  const { t, formatNumber, translateWithParams, language } = useI18n();
  const [form, setForm] = useState({
    brandName: '',
    industry: '',
    campaignGoal: '',
    niches: [],
    targetGender: 'all',
    targetAgeGroup: '18-24',
    minFollowers: '',
    maxFollowers: '',
    budgetPerPost: '',
    platforms: [],
    useAI: false
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleItem = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter(x => x !== val)
        : [...f[field], val]
    }));
  };

  const handleSubmit = async () => {
    if (!form.brandName || form.niches.length === 0) {
      setError(t('match.requiredError'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        minFollowers: form.minFollowers ? parseInt(form.minFollowers) : 0,
        maxFollowers: form.maxFollowers ? parseInt(form.maxFollowers) : undefined,
        budgetPerPost: form.budgetPerPost ? parseInt(form.budgetPerPost) : undefined
      };

      // 1. Run matching engine
      const data = await matchInfluencers(payload);
      setResults(data);

      // 2. Persist brand campaign profile in DB
      await saveBrand(payload).catch(err => console.error('[MATCH] Auto-saving brand failed:', err.message));

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      setError(language === 'bn' ? 'ম্যাচিং ইনফ্লুয়েন্সার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সার্ভারটি চালু আছে কি না পরীক্ষা করুন।' : 'Failed to fetch matches. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
      <div className="mb-10">
        <h1 className="font-display font-extrabold text-4xl text-white mb-2">{t('match.title')}</h1>
        <p className="text-muted">{t('match.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 space-y-5">
          <FormSection title={t('match.brandInfo')}>
            <Input label={t('match.brandName')} value={form.brandName} onChange={v => setForm(f => ({ ...f, brandName: v }))} placeholder={t('match.brandNamePl')} />
            <Input label={t('match.industry')} value={form.industry} onChange={v => setForm(f => ({ ...f, industry: v }))} placeholder={t('match.industryPl')} />
            <Input label={t('match.goal')} value={form.campaignGoal} onChange={v => setForm(f => ({ ...f, campaignGoal: v }))} placeholder={t('match.goalPl')} />
          </FormSection>

          <FormSection title={t('match.audience')}>
            <SelectField
              label={t('match.gender')}
              value={form.targetGender}
              onChange={v => setForm(f => ({ ...f, targetGender: v }))}
              options={[
                { value: 'all', label: t('match.genderAll') },
                { value: 'female', label: t('match.genderFemale') },
                { value: 'male', label: t('match.genderMale') }
              ]}
            />
            <SelectField
              label={t('match.ageGroup')}
              value={form.targetAgeGroup}
              onChange={v => setForm(f => ({ ...f, targetAgeGroup: v }))}
              options={[{ value: '18-24', label: '18–24' }, { value: '25-34', label: '25–34' }, { value: '35-44', label: '35–44' }]}
            />
          </FormSection>

          <FormSection title={t('match.followers')}>
            <div className="grid grid-cols-2 gap-3">
              <Input label={t('match.minFollowers')} value={form.minFollowers} onChange={v => setForm(f => ({ ...f, minFollowers: v }))} placeholder="50000" type="number" />
              <Input label={t('match.maxFollowers')} value={form.maxFollowers} onChange={v => setForm(f => ({ ...f, maxFollowers: v }))} placeholder="500000" type="number" />
            </div>
            <Input label={t('match.budget')} value={form.budgetPerPost} onChange={v => setForm(f => ({ ...f, budgetPerPost: v }))} placeholder="30000" type="number" />
          </FormSection>

          <FormSection title={t('match.niches')}>
            <div className="flex flex-wrap gap-2">
              {NICHES.map(n => (
                <button
                  key={n}
                  onClick={() => toggleItem('niches', n)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    form.niches.includes(n)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface text-muted border-border hover:border-accent/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title={t('match.platforms')}>
            <div className="flex gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => toggleItem('platforms', p)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                    form.platforms.includes(p)
                      ? 'bg-accent/20 text-accent-light border-accent/50'
                      : 'bg-surface text-muted border-border hover:border-accent/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title={t('match.aiAnalysis')}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-5 rounded-full transition-colors relative ${form.useAI ? 'bg-accent' : 'bg-border'}`}
                onClick={() => setForm(f => ({ ...f, useAI: !f.useAI }))}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.useAI ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-white">{t('match.aiToggle')}</span>
            </label>
            <p className="text-muted text-xs mt-1">{t('match.aiDesc')}</p>
          </FormSection>

          {error && (
            <div className="bg-rose/10 border border-rose/30 text-rose text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-xl font-semibold font-display transition-all glow-accent"
          >
            {loading ? t('match.loadingText') : t('match.submitBtn')}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2" id="results">
          {!results && !loading && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="text-6xl mb-4">🎯</div>
                <p className="font-display text-xl text-white mb-2">{t('match.readyTitle')}</p>
                <p className="text-muted text-sm">{t('match.readyDesc')}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted">{t('match.loadingText')}</p>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-fade-up">
              {/* Summary Bar */}
              <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-3">
                <p className="text-white font-display font-semibold">
                  {translateWithParams('match.summaryFound', {
                    count: results.total_matches,
                    brand: results.brand.brandName
                  })}
                </p>
                <span className="text-muted text-sm">{results.brand.niches.join(', ')}</span>
              </div>

              {/* AI Analysis */}
              {results.ai_analysis && (
                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-accent-light font-display font-bold text-sm">{t('match.aiStrategyTitle')}</span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed mb-4">{results.ai_analysis.campaign_strategy}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.ai_analysis.collaboration_tips?.length > 0 && (
                      <div>
                        <p className="text-accent-light text-xs font-semibold mb-2">{t('match.tipsTitle')}</p>
                        <ul className="space-y-1">
                          {results.ai_analysis.collaboration_tips.map((tip, i) => (
                            <li key={i} className="text-muted text-xs flex gap-2"><span className="text-emerald">→</span>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {results.ai_analysis.recommended_content_types?.length > 0 && (
                      <div>
                        <p className="text-accent-light text-xs font-semibold mb-2">{t('match.contentTypesTitle')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {results.ai_analysis.recommended_content_types.map(ct => (
                            <span key={ct} className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent-light">{ct}</span>
                          ))}
                        </div>
                        <p className="text-muted text-xs mt-3">{t('match.estReach')} <span className="text-white">{results.ai_analysis.estimated_reach}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Influencer Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.matches.map(inf => (
                  <InfluencerCard key={inf.id} influencer={inf} showScore />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper UI components
function FormSection({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="font-display font-semibold text-sm text-white mb-4">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-muted text-xs mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface border border-border text-white text-sm rounded-xl px-4 py-2.5 placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-muted text-xs mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-surface border border-border text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-accent/50 transition-colors"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
