import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import CameraARView from '../../components/ui/CameraARView';
import { useFireDetection } from '../../hooks/useFireDetection';

export default function FireARScreen() {
  const { setScreen, t } = useApp();
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(180);
  const videoRef = useRef<HTMLVideoElement | null>(null) as React.MutableRefObject<HTMLVideoElement | null>;
  const fire = useFireDetection(videoRef, true, 300);

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
      <CameraARView videoElRef={videoRef}>
        {/* Real-time fire detection bounding box */}
        {fire.detected && fire.box && (
          <div
            className="absolute border-2 border-red-500 z-10 pointer-events-none"
            style={{
              left: `${fire.box.x * 100}%`,
              top: `${fire.box.y * 100}%`,
              width: `${fire.box.width * 100}%`,
              height: `${fire.box.height * 100}%`,
              boxShadow: '0 0 12px rgba(239,68,68,0.8)',
            }}
          >
            <span className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              FIRE {(fire.box.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Simulated fire hazard overlay (shrinks as the fire is put out) */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-end justify-center pb-28">
          <div className="relative transition-all duration-700" style={{ width: 52 * (3 - step) * 0.9, height: 56 * (3 - step) * 0.9 }}>
            <div className="absolute inset-0 rounded-full bg-orange-500/25 blur-2xl anim-glow-pulse" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-24 rounded-b-full bg-gradient-to-t from-amber-500 via-orange-500 to-yellow-300 anim-flame" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 rounded-b-full bg-gradient-to-t from-orange-600 via-orange-400 to-amber-200 anim-flame" style={{ animationDelay: '0.25s' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-16 rounded-b-full bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 anim-flame" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-10 rounded-b-full bg-yellow-300/90 anim-flame" style={{ animationDelay: '0.1s' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-4 rounded-full bg-amber-300/60 blur-md" />
          </div>
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
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <span className="text-danger font-bold text-xs">{t('high')}</span>
        </div>

        <div className="hud-element !px-3 !py-2">
          <span className="text-white font-mono text-sm font-bold">{formatTime(timer)}</span>
        </div>
      </div>

      {/* Fire detection alert banner */}
      {fire.detected && (
        <div className="absolute top-20 left-5 right-5 z-20">
          <div className="hud-element border-red-500/50 !bg-red-950/80 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-bold text-xs uppercase tracking-wider">{t('high')} — FIRE DETECTED</span>
          </div>
        </div>
      )}

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
