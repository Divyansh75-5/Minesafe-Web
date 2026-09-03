import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import CameraARView from '../../components/ui/CameraARView';

export default function FireARScreen() {
  const { setScreen, t } = useApp();
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(180);

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
    { label: 'Locate the fire hazard', instruction: 'Scan the area and identify the fire source. Tap the hazard when found.', action: 'Locate' },
    { label: 'Identify extinguisher type', instruction: 'Find the correct fire extinguisher. Different fires need different agents.', action: 'Select' },
    { label: 'Extinguish the fire', instruction: 'Aim the nozzle at the base of the fire. Sweep side to side. Maintain safe distance.', action: 'Extinguish' },
  ];

  const handleAction = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setScreen('assessment');
    }
  };

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-900 relative">
      {/* Live AR Camera View (falls back to simulated if unavailable) */}
      <CameraARView />

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
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <span className="text-danger font-bold text-xs">{t('high')}</span>
        </div>

        <div className="hud-element !px-3 !py-2">
          <span className="text-white font-mono text-sm font-bold">{formatTime(timer)}</span>
        </div>
      </div>

      {/* Crosshair center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-accent/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent/60" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1 h-4 bg-accent/60 rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1 h-4 bg-accent/60 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-4 h-1 bg-accent/60 rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-4 h-1 bg-accent/60 rounded-full" />
        </div>
      </div>

      {/* HUD Objective */}
      <div className="absolute top-20 left-5 right-5 z-10">
        <div className="hud-element">
          <div className="flex items-center gap-2 mb-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
            </svg>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{t('trainingObjective')}</span>
          </div>
          <p className="text-white text-sm font-semibold">{steps[step].label}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="absolute top-36 left-5 right-5 z-10">
        <div className="hud-element !py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted font-semibold">Step {step + 1}/3</span>
            <div className="flex-1 flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: i < step ? '100%' : i === step ? '50%' : '0%',
                      backgroundColor: i <= step ? '#f97316' : 'transparent',
                    }}
                  />
                </div>
              ))}
            </div>
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
          className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-accent to-accent-dark text-white shadow-glow-orange transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
          </svg>
          {steps[step].action}
        </button>
      </div>
    </div>
  );
}
