import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function SplashScreen() {
  const { setScreen } = useApp();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setScreen('language'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [setScreen]);

  return (
    <div className="mobile-shell flex flex-col items-center justify-center min-h-screen bg-surface-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08)_0%,transparent_70%)]" />

      <div className={`flex flex-col items-center gap-6 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="relative">
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-glow-orange transition-all duration-500 ${phase >= 2 ? 'scale-100' : 'scale-90'}`}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L28 16H40L30 24L34 36L24 28L14 36L18 24L8 16H20L24 4Z" fill="white" opacity="0.9"/>
              <path d="M24 12L26 20H34L28 24L30 32L24 28L18 32L20 24L14 20H22L24 12Z" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <div className="absolute -inset-3 rounded-[2rem] bg-accent/10 animate-pulse-slow" />
        </div>

        <div className={`text-center transition-all duration-700 delay-200 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-3xl font-black text-white tracking-tight">MineSafe</h1>
          <p className="text-accent font-bold text-sm mt-1 tracking-widest">26041</p>
        </div>
      </div>

      <div className={`absolute bottom-16 text-center transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-subtle text-sm font-medium">Industrial Safety Training</p>
        <div className="mt-4 flex gap-1.5 justify-center">
          <div className="w-8 h-1 rounded-full bg-accent animate-pulse" />
          <div className="w-2 h-1 rounded-full bg-surface-400" />
          <div className="w-2 h-1 rounded-full bg-surface-400" />
        </div>
      </div>
    </div>
  );
}
