import { useApp, type LanguageCode } from '../../context/AppContext';

const languages: { code: LanguageCode; label: string; native: string; region: string }[] = [
  { code: 'hi', label: 'Hindi', native: '\u0939\u093F\u0928\u094D\u0926\u0940', region: '\u0924\u0947\u0932\u0902\u0917\u093E\u0928\u093E' },
  { code: 'sat', label: 'Santali', native: '\u1B89\u1BBE\u1B9A', region: '\u1B9A\u1B99\u1BCd\u1B9F\u1BBE\u1B9A\u1BBF' },
  { code: 'en', label: 'English', native: 'English', region: 'Language' },
];

export default function LanguageScreen() {
  const { setLanguage, setScreen, t } = useApp();

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setScreen('login');
  };

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 px-6 pt-12 pb-8">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-glow-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t('selectLanguage')}</h1>
            <p className="text-muted text-sm">{t('industrialSafety')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 mt-8">
        {languages.map((lang, i) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className="surface-card flex items-center gap-4 group hover:border-accent/30 hover:bg-surface-500 transition-all duration-200 active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-700 border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:border-accent/20 transition-colors">
              <span className="text-2xl font-black text-gradient-orange">{lang.native[0]}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-lg">{lang.native}</p>
              <p className="text-muted text-sm font-medium">{lang.label}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted group-hover:text-accent transition-colors">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
