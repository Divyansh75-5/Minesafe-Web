import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const { login, t } = useApp();
  const [workerId, setWorkerId] = useState('');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workerId.trim() && name.trim() && industry.trim()) {
      login(workerId.trim(), name.trim(), industry.trim());
    }
  };

  const isValid = workerId.trim().length > 0 && name.trim().length > 0 && industry.trim().length > 0;

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 px-6 pt-8 pb-10">
      <div className="animate-fade-in mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-glow-orange mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white">Worker Login</h1>
        <p className="text-muted text-sm mt-1">Enter your details to begin training</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <label className="text-sm font-semibold text-subtle mb-2 block">{t('workerId')}</label>
          <input
            type="text"
            value={workerId}
            onChange={e => setWorkerId(e.target.value)}
            placeholder="e.g. JSW-2041"
            className="input-field"
            autoComplete="off"
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <label className="text-sm font-semibold text-subtle mb-2 block">{t('name')}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            className="input-field"
            autoComplete="name"
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <label className="text-sm font-semibold text-subtle mb-2 block">{t('industry')}</label>
          <input
            type="text"
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            placeholder="e.g. Tata Steel, Jharia Mines"
            className="input-field"
            autoComplete="organization"
          />
        </div>

        <div className="flex-1" />

        <button
          type="submit"
          disabled={!isValid}
          className="btn-primary animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          {t('continue')}
        </button>
      </form>
    </div>
  );
}
