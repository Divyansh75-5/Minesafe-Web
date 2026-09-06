import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

const LEAK_POS = { x: 64, y: 40 }; // % position of the gas leak in the scene
const LEAK_RADIUS = 16; // crosshair lock radius (step 1)
const WORKER_POS = { x: 60, y: 66 }; // downed worker location
const EXIT_POS = { x: 16, y: 74 }; // safe exit zone
const RESCUER_START = { x: 14, y: 28 }; // rescuer spawn
const REACH_RADIUS = 15; // how close rescuer must be to reach a target

const CHECKLIST = [
  { id: 'vent', label: 'Ventilation / air circulation adequate' },
  { id: 'o2', label: 'O\u2082 level within safe range (19.5\u201323.5%)' },
  { id: 'toxic', label: 'H\u2082S / CO below danger threshold' },
  { id: 'ba', label: 'Breathing apparatus ready & donned' },
];

function distancePercent(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function gasReadingAt(px: number, py: number) {
  // Higher reading = closer to the leak source (0..100)
  const d = distancePercent(px, py, LEAK_POS.x, LEAK_POS.y);
  return Math.round(clamp(100 - d * 1.6, 0, 100));
}

function readingStyle(reading: number) {
  if (reading > 60) return { color: '#ef4444', labelKey: 'high' };
  if (reading > 30) return { color: '#eab308', labelKey: 'medium_label' };
  return { color: '#22c55e', labelKey: 'low' };
}

export default function GasARScreen() {
  const { setScreen, t } = useApp();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(240);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [leakLocked, setLeakLocked] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [rescuer, setRescuer] = useState({ x: RESCUER_START.x, y: RESCUER_START.y });
  const [phase, setPhase] = useState<'approach' | 'carrying' | 'rescued'>('approach');

  useEffect(() => {
    const iv = setInterval(() => setTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const rect = sceneRef.current?.getBoundingClientRect();

  const pointerNorm = pointer
    ? { x: (pointer.x / (rect?.width ?? 1)) * 100, y: (pointer.y / (rect?.height ?? 1)) * 100 }
    : { x: 16, y: 78 };

  const onLeak = step === 0 && distancePercent(pointerNorm.x, pointerNorm.y, LEAK_POS.x, LEAK_POS.y) <= LEAK_RADIUS;
  const detectReading = onLeak ? 88 : gasReadingAt(pointerNorm.x, pointerNorm.y);
  const detectStyle = onLeak ? { color: '#ef4444', labelKey: 'high' } : readingStyle(detectReading);

  const allChecked = CHECKLIST.every((c) => checks[c.id]);

  const rescuerNearWorker = distancePercent(rescuer.x, rescuer.y, WORKER_POS.x, WORKER_POS.y) <= REACH_RADIUS;
  const rescuerNearExit = distancePercent(rescuer.x, rescuer.y, EXIT_POS.x, EXIT_POS.y) <= REACH_RADIUS;
  const rescueReading = gasReadingAt(rescuer.x, rescuer.y);
  const rescueStyle = readingStyle(rescueReading);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (step !== 0 && step !== 2) return;
    setDragging(true);
    const r = sceneRef.current!.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    setPointer(p);
    if (step === 2) setRescuer({ x: (p.x / r.width) * 100, y: (p.y / r.height) * 100 });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !sceneRef.current) return;
    const r = sceneRef.current.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (step === 0) setPointer(p);
    if (step === 2) setRescuer({ x: (p.x / r.width) * 100, y: (p.y / r.height) * 100 });
  };

  const handlePointerUp = () => setDragging(false);

  const handleAction = () => {
    if (step === 0) {
      if (onLeak) {
        setLeakLocked(true);
        setStep(1);
      }
    } else if (step === 1) {
      if (allChecked) setStep(2);
    } else if (step === 2) {
      if (rescuerNearWorker && phase === 'approach') {
        setPhase('carrying');
      } else if (rescuerNearExit && phase === 'carrying') {
        setPhase('rescued');
      } else if (phase === 'rescued') {
        setScreen('assessment');
      }
    }
  };

  const steps = [
    {
      label: 'Detect the gas leak',
      instruction: 'Drag the crosshair around the pipeline. Hold it on the leak source to lock the leak location.',
      action: onLeak ? 'Lock Leak' : 'Detecting\u2026',
      disabled: !onLeak && !leakLocked,
    },
    {
      label: 'Assess the confined space',
      instruction: 'Check ventilation and atmosphere readings. Tap every entry requirement to verify before proceeding.',
      action: allChecked ? 'Confirm Assessment' : 'Review Readings',
      disabled: !allChecked,
    },
    {
      label: 'Execute the rescue procedure',
      instruction:
        phase === 'approach'
          ? 'Drag the rescuer to the downed worker, then secure the victim.'
          : phase === 'carrying'
            ? 'Breathing apparatus on. Drag the rescuer (with the worker) to the safe EXIT zone.'
            : 'Rescue complete! The worker was safely guided out.',
      action:
        phase === 'approach'
          ? rescuerNearWorker ? 'Secure Victim' : 'Approach Worker'
          : phase === 'carrying'
            ? rescuerNearExit ? 'Complete Rescue' : 'Guide to Exit'
            : 'Complete Training',
      disabled:
        phase === 'approach' ? !rescuerNearWorker :
        phase === 'carrying' ? !rescuerNearExit :
        false,
    },
  ];
  const current = steps[step];

  const toggleCheck = (id: string) => setChecks((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-900 relative">
      {/* Simulated confined-space scene (no live camera) */}
      <div
        ref={sceneRef}
        className="absolute inset-0 overflow-hidden select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background tunnel / confined space */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-800 via-surface-900 to-black" />
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Floor / walkway */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Gas leak cloud (always visible; swirling vapor) */}
        {step !== 2 && (
          <div className="absolute pointer-events-none" style={{ left: `${LEAK_POS.x}%`, top: `${LEAK_POS.y}%` }}>
            <div className="-translate-x-1/2 -translate-y-1/2">
              <LeakPlume color={step === 0 && onLeak ? '#ef4444' : '#22c55e'} />
            </div>
            <div className="-translate-x-1/2 translate-y-4 mt-3">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-white ring-1 ring-white/20">LEAK SOURCE</span>
            </div>
          </div>
        )}

        {/* Gas concentration heat around leak */}
        {step !== 2 && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(circle at ${LEAK_POS.x}% ${LEAK_POS.y}%, rgba(34,197,94,0.22), transparent 50%)`,
          }} />
        )}

        {/* Hazard / atmosphere reading cluster chip */}
        {step === 1 && (
          <div className="absolute left-5 right-5 z-10" style={{ top: '42%' }}>
            <div className="hud-element">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">{t('hazardIndicator')}</span>
                <span className="text-[10px] font-bold text-red-400 animate-pulse">HAZARD CONFINED SPACE</span>
              </div>
              <div className="space-y-2">
                {CHECKLIST.map((c) => {
                  const done = checks[c.id];
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCheck(c.id)}
                      className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all active:scale-[0.99] ${
                        done ? 'border-green-500 bg-green-500/10' : 'border-white/15 bg-white/5'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${done ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-white/25 text-transparent'}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                      <span className={`text-xs font-bold ${done ? 'text-green-400' : 'text-white'}`}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Rescue scene (step 3): downed worker, rescue worker, exit */}
        {step === 2 && (
          <>
            {/* Exit zone */}
            <div className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2" style={{ left: `${EXIT_POS.x}%`, top: `${EXIT_POS.y}%` }}>
              <div className="w-20 h-20 rounded-full border-2 border-green-500/70 bg-green-500/10 animate-pulse flex items-center justify-center" style={{ animationDelay: '0.4s' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
                </svg>
              </div>
              <div className="mt-2 text-center px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-[9px] font-bold ring-1 ring-green-500/40">EXIT → SAFE ZONE</div>
            </div>

            {/* Downed worker (or carried by rescuer) */}
            {phase !== 'carrying' && phase !== 'rescued' && (
              <div className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2" style={{ left: `${WORKER_POS.x}%`, top: `${WORKER_POS.y}%` }}>
                <div className="w-12 h-12 rounded-full bg-white/10 ring-2 ring-amber-400/70 flex items-center justify-center text-xl rotate-0">
                  🧍
                </div>
                <div className="mt-1.5 text-center px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold ring-1 ring-amber-500/40">WORKER DOWN</div>
              </div>
            )}

            {/* Rescuer (draggable), carries worker once secured */}
            <div className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${rescuer.x}%`, top: `${rescuer.y}%` }}>
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-xl ${phase === 'rescued' ? 'bg-green-500/20 ring-2 ring-green-400' : 'bg-white/10 ring-2 ring-accent'}`}>
                {phase === 'rescued' ? '✅' : '🧑‍🚒'}
                {/* Breathing apparatus */}
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-surface-800 ring-1 ring-white/30 flex items-center justify-center">
                  <span className="text-[10px]">🪖</span>
                </div>
                {phase === 'carrying' && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white/10 ring-1 ring-amber-400/70 flex items-center justify-center text-sm">
                    🧍
                  </div>
                )}
              </div>
              <div className="mt-1 text-center px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold ring-1 ring-white/20">
                {phase === 'rescued' ? 'SAFE' : 'RESCUER'}
              </div>
            </div>
          </>
        )}

        {/* Step 1 drag crosshair pointer */}
        {step === 0 && (
          <div
            className={`pointer-events-none z-10 absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${onLeak ? 'border-red-500' : 'border-accent/70'}`}
            style={{
              left: `${pointerNorm.x}%`,
              top: `${pointerNorm.y}%`,
              width: 44,
              height: 44,
              boxShadow: onLeak ? '0 0 18px rgba(239,68,68,0.9)' : '0 0 12px rgba(234,179,8,0.5)',
            }}
          >
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <div className={`w-1.5 h-1.5 rounded-full ${onLeak ? 'bg-red-500' : 'bg-accent'}`} />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 w-px h-3.5 bg-current" />
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-3.5 w-px h-3.5 bg-current" />
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-px bg-current" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-px bg-current" />
          </div>
        )}

        {/* Gas meter floating chip (step 1 detection + step 3 rescuer position) */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <div className="hud-element !px-3 !py-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: step === 0 ? detectStyle.color : rescueStyle.color }} />
            <span className="font-bold text-xs" style={{ color: step === 0 ? detectStyle.color : rescueStyle.color }}>
              {step === 0 ? detectReading : rescueReading} PPM
            </span>
          </div>
        </div>
      </div>

      {/* HUD Top Bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => {
                if (step === 1) {
                  setStep(0);
                  setLeakLocked(false);
                } else if (step === 2) {
                  setStep(1);
                  setChecks({});
                }
              }}
              className="hud-element !px-3 !py-2 flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
              </svg>
              <span className="text-white text-xs font-semibold">Back</span>
            </button>
          )}

          <button
            onClick={() => setScreen('modules')}
            className="hud-element !px-3 !py-2 flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            <span className="text-white text-xs font-semibold">Exit</span>
          </button>
        </div>

        <div className="hud-element !px-3 !py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: step === 0 ? detectStyle.color : rescueStyle.color }} />
          <span className="font-bold text-xs" style={{ color: step === 0 ? detectStyle.color : rescueStyle.color }}>
            {t(step === 0 ? detectStyle.labelKey : rescueStyle.labelKey)}
          </span>
        </div>

        <div className="hud-element !px-3 !py-2">
          <span className="text-white font-mono text-sm font-bold">{formatTime(timer)}</span>
        </div>
      </div>

      {/* HUD Objective */}
      <div className="absolute top-20 left-5 right-5 z-20">
        <div className="hud-element">
          <div className="flex items-center gap-2 mb-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
            </svg>
            <span className="text-[10px] font-bold text-caution uppercase tracking-wider">{t('trainingObjective')}</span>
          </div>
          <p className="text-white text-sm font-semibold">{current.label}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="absolute top-36 left-5 right-5 z-20">
        <div className="hud-element !py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted font-semibold">Step {step + 1}/3</span>
            <div className="flex-1 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: i < step ? '100%' : i === step ? '50%' : '0%',
                      backgroundColor: i <= step ? '#eab308' : 'transparent',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gas leak detected alert */}
      {step === 0 && onLeak && (
        <div className="absolute left-5 right-5 z-30" style={{ top: '44%' }}>
          <div className="hud-element border-red-500/50 !bg-red-950/80 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-bold text-xs uppercase tracking-wider">{t('high')} — GAS LEAK DETECTED</span>
          </div>
        </div>
      )}

      {/* Bottom instruction + action */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
        <div className="hud-element mb-4">
          <p className="text-white text-sm font-medium leading-relaxed">{current.instruction}</p>
        </div>

        <button
          onClick={handleAction}
          disabled={current.disabled ?? false}
          className={`w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-caution to-caution-light text-surface-900 shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-200 flex items-center justify-center gap-2 ${
            current.disabled ? 'opacity-40' : 'active:scale-[0.98]'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12h.01" /><path d="M15 12h.01" />
            <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
            <path d="M19 6c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
          </svg>
          {current.action}
        </button>
      </div>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function LeakPlume({ color }: { color: string }) {
  return (
    <div className="relative w-40 h-40">
      <div className="absolute inset-0 rounded-full blur-2xl animate-pulse" style={{ backgroundColor: `${color}40` }} />
      <div className="absolute inset-6 rounded-full anim-gas blur-xl" style={{ backgroundColor: `${color}55` }} />
      <div className="absolute top-8 left-8 w-16 h-14 rounded-full anim-gas blur-lg" style={{ backgroundColor: `${color}50`, animationDelay: '1.2s' }} />
      <div className="absolute bottom-8 right-6 w-20 h-16 rounded-full anim-gas blur-xl" style={{ backgroundColor: `${color}45`, animationDelay: '2.1s' }} />
      <div className="absolute bottom-10 left-4 w-12 h-10 rounded-full anim-gas blur-lg" style={{ backgroundColor: `${color}40`, animationDelay: '0.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-white/20" />
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-14 w-14 h-px bg-gradient-to-l from-white/40 to-transparent" />
    </div>
  );
}