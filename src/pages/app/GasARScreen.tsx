import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import CameraARView from '../../components/ui/CameraARView';

export default function GasARScreen() {
  const { setScreen, t } = useApp();
  const [step, setStep] = useState(0);
  const [gasLevel, setGasLevel] = useState(85);
  const [timer, setTimer] = useState(240);

  useEffect(() => {
    const iv = setInterval(() => setTimer(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const steps = [
    { label: 'Detect gas leak', instruction: 'Use the gas detector to locate the leak source. Watch for colored indicators in the AR view.', action: 'Detect' },
    { label: 'Assess confined space', instruction: 'Check ventilation and atmosphere readings. Identify entry hazards before proceeding.', action: 'Assess' },
    { label: 'Execute rescue procedure', instruction: 'Follow the safe rescue path. Use breathing apparatus. Guide the worker to safety.', action: 'Rescue' },
  ];

  const handleAction = () => {
    if (step < 2) {
      setGasLevel(prev => Math.max(10, prev - 35));
      setStep(step + 1);
    } else {
      setScreen('assessment');
    }
  };

  const gasColor = gasLevel > 60 ? '#eab308' : gasLevel > 30 ? '#f97316' : '#22c55e';

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-900 relative">
      {/* Live AR Camera View (falls back to simulated if unavailable) with gas overlays */}
      <CameraARView>
        {/* Swirling gas vapor cloud (thins as the gas is cleared) */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center" style={{ opacity: Math.max(0, gasLevel / 100) }}>
          <div className="relative w-56 h-56">
            <div className="absolute inset-0 rounded-full anim-gas blur-2xl" style={{ backgroundColor: gasColor + '55' }} />
            <div className="absolute top-6 left-6 w-20 h-16 rounded-full anim-gas blur-xl" style={{ backgroundColor: gasColor + '50', animationDelay: '1.2s' }} />
            <div className="absolute bottom-10 right-4 w-24 h-20 rounded-full anim-gas blur-xl" style={{ backgroundColor: gasColor + '45', animationDelay: '2.1s' }} />
            <div className="absolute bottom-16 left-2 w-16 h-14 rounded-full anim-gas blur-lg" style={{ backgroundColor: gasColor + '40', animationDelay: '0.5s' }} />
          </div>
        </div>
        {/* Colored gas glow pulses */}
        <div className="absolute inset-0 pointer-events-none opacity-30 z-10">
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: gasColor + '40' }} />
          <div className="absolute bottom-1/3 left-1/3 w-28 h-28 rounded-full blur-2xl animate-pulse" style={{ backgroundColor: gasColor + '25', animationDelay: '0.8s' }} />
        </div>
      </CameraARView>

      {/* HUD Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3">
        <button
          onClick={() => setScreen('modules')}
          className="hud-element !px-3 !py-2 flex items-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
          </svg>
          <span className="text-white text-xs font-semibold">Exit</span>
        </button>

        <div className="hud-element !px-3 !py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: gasColor }} />
          <span className="font-bold text-xs" style={{ color: gasColor }}>
            GAS: {gasLevel} PPM
          </span>
        </div>

        <div className="hud-element !px-3 !py-2">
          <span className="text-white font-mono text-sm font-bold">{formatTime(timer)}</span>
        </div>
      </div>

      {/* Detector viewfinder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-lg border-2 border-caution/40" />
          <div className="absolute inset-2 rounded border border-caution/20" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full" style={{ backgroundColor: gasColor + '20', border: `1px solid ${gasColor}40` }}>
            <span className="text-[10px] font-bold" style={{ color: gasColor }}>DETECTING</span>
          </div>
        </div>
      </div>

      {/* HUD Objective */}
      <div className="absolute top-20 left-5 right-5 z-10">
        <div className="hud-element">
          <div className="flex items-center gap-2 mb-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
            </svg>
            <span className="text-[10px] font-bold text-caution uppercase tracking-wider">{t('trainingObjective')}</span>
          </div>
          <p className="text-white text-sm font-semibold">{steps[step].label}</p>
        </div>
      </div>

      {/* Gas Level Meter */}
      <div className="absolute top-36 left-5 right-5 z-10">
        <div className="hud-element !py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">{t('hazardIndicator')}</span>
            <span className="text-[10px] font-bold" style={{ color: gasColor }}>
              {gasLevel > 60 ? t('high') : gasLevel > 30 ? t('medium_label') : t('low')}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${gasLevel}%`,
                backgroundColor: gasColor,
                boxShadow: `0 0 8px ${gasColor}60`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-muted">0</span>
            <span className="text-[9px] text-muted">Step {step + 1}/3</span>
            <span className="text-[9px] text-muted">100 PPM</span>
          </div>
        </div>
      </div>

      {/* Bottom instruction + action */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
        <div className="hud-element mb-4">
          <p className="text-white text-sm font-medium leading-relaxed">{steps[step].instruction}</p>
        </div>

        <button
          onClick={handleAction}
          className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-caution to-caution-light text-surface-900 shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12h.01" /><path d="M15 12h.01" />
            <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
            <path d="M19 6c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
          </svg>
          {steps[step].action}
        </button>
      </div>
    </div>
  );
}
