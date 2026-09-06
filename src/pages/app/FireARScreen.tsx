import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import CameraARView from '../../components/ui/CameraARView';

type FireClass = 'A' | 'B' | 'C' | 'D';

interface FireClassInfo {
  id: FireClass;
  label: string;
  material: string;
  correctExtinguisher: string;
  color: string;
}

const FIRE_CLASSES: FireClassInfo[] = [
  { id: 'A', label: 'Class A', material: 'Wood / Paper', correctExtinguisher: 'Water', color: '#f97316' },
  { id: 'B', label: 'Class B', material: 'Flammable Liquid', correctExtinguisher: 'Foam', color: '#ef4444' },
  { id: 'C', label: 'Class C', material: 'Gas / Electrical', correctExtinguisher: 'CO\u2082 / Dry Powder', color: '#eab308' },
  { id: 'D', label: 'Class D', material: 'Metal', correctExtinguisher: 'Metal Powder', color: '#a855f7' },
];

const EXTINGUISHERS = ['Water', 'Foam', 'CO\u2082 / Dry Powder', 'Metal Powder'];

const FIRE_POS = { x: 62, y: 46 }; // % position of fire in the scene
const FIRE_RADIUS = 18; // % radius (scene is treated as normalized units)

function distancePercent(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

export default function FireARScreen() {
  const { setScreen, t } = useApp();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(180);
  const [fireClass, setFireClass] = useState<FireClassInfo>(FIRE_CLASSES[0]);
  const [nozzle, setNozzle] = useState<string | null>(null);
  const [correctPicked, setCorrectPicked] = useState(false);
  const [extinguishProgress, setExtinguishProgress] = useState(0); // 0..100 (0 = fully burning)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [located, setLocated] = useState(false);

  useEffect(() => {
    setFireClass(FIRE_CLASSES[Math.floor(Math.random() * FIRE_CLASSES.length)]);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const rect = sceneRef.current?.getBoundingClientRect();

  // pointer normalized 0..100
  const pointerNorm = pointer
    ? { x: (pointer.x / (rect?.width ?? 1)) * 100, y: (pointer.y / (rect?.height ?? 1)) * 100 }
    : { x: 18, y: 75 };

  const onFire = step === 0 && distancePercent(pointerNorm.x, pointerNorm.y, FIRE_POS.x, FIRE_POS.y) <= FIRE_RADIUS;
  const readingColor = onFire ? '#ef4444' : '#22c55e';
  const readingLabel = onFire ? t('high') : t('low');

  const flamesDanger = 100 - extinguishProgress; // 100 = raging, 0 = out

  const handlePointerDown = (e: React.PointerEvent) => {
    if (step !== 0) return;
    setDragging(true);
    const r = sceneRef.current!.getBoundingClientRect();
    setPointer({ x: e.clientX - r.left, y: e.clientY - r.top });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (step !== 0 || !dragging || !sceneRef.current) return;
    const r = sceneRef.current.getBoundingClientRect();
    setPointer({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const handlePointerUp = () => setDragging(false);

  const handleAction = () => {
    if (step === 0) {
      if (onFire) {
        setLocated(true);
        setStep(1);
      }
    } else if (step === 1) {
      if (correctPicked) setStep(2);
    } else if (step === 2) {
      if (extinguishProgress >= 100) setScreen('assessment');
    }
  };

  const goBack = () => {
    if (step === 1) {
      setStep(0);
      setLocated(false);
    } else if (step === 2) {
      setStep(1);
      setNozzle(null);
      setCorrectPicked(false);
    }
  };

  const pump = () => {
    setExtinguishProgress((p) => Math.min(100, p + 20 + Math.random() * 15));
  };

  const steps = [
    {
      label: 'Locate the fire hazard',
      instruction: 'Drag the crosshair toward the flame and hold it on the fire to lock the location.',
      action: onFire ? 'Lock Location' : 'Locating…',
      disabled: !onFire && !located,
    },
    {
      label: 'Identify extinguisher type',
      instruction: `This is a ${fireClass.label.toLowerCase()} fire (${fireClass.material}). Tap the correct extinguisher for this class.`,
      action: correctPicked ? 'Confirm Selection' : 'Select Extinguisher',
      disabled: !correctPicked,
    },
    {
      label: 'Extinguish the fire',
      instruction: 'Keep tapping PUMP to discharge the extinguisher until the flames go out completely.',
      action: extinguishProgress >= 100 ? 'Complete Training' : 'PUMP',
      disabled: false,
    },
  ];
  const current = steps[step];

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-900 relative">
      {/* Live rear-camera layer with the same simulated training overlays above it */}
      <CameraARView />
      <div
        ref={sceneRef}
        className="absolute inset-0 z-[1] overflow-hidden select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background room */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background:
            flamesDanger > 0
              ? `radial-gradient(circle at ${FIRE_POS.x}% ${FIRE_POS.y}%, rgba(239,68,68,${0.28 * (flamesDanger / 100)}), transparent 55%)`
              : 'transparent',
        }} />

        {/* Hazard status */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="hud-element !px-3 !py-2 flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${onFire ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="font-bold text-xs" style={{ color: readingColor }}>{readingLabel}</span>
          </div>
        </div>

        {/* Fire object (shrinks as it is extinguished) */}
        {flamesDanger > 0 && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${FIRE_POS.x}%`, top: `${FIRE_POS.y}%` }}
          >
            <Flame intensity={flamesDanger / 100} classColor={fireClass.color} />
          </div>
        )}

        {/* Fire fully out */}
        {flamesDanger <= 0 && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
            style={{ left: `${FIRE_POS.x}%`, top: `${FIRE_POS.y}%` }}
          >
            <div className="text-3xl">✓</div>
            <div className="mt-1 px-3 py-1 rounded-full bg-green-500/90 text-white text-[10px] font-bold">EXTINGUISHED</div>
          </div>
        )}

        {/* Step 1 drag crosshair pointer */}
        {step === 0 && (
          <div
            className={`pointer-events-none z-10 absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${onFire ? 'border-red-500' : 'border-accent/70'}`}
            style={{
              left: `${pointerNorm.x}%`,
              top: `${pointerNorm.y}%`,
              width: 44,
              height: 44,
              boxShadow: onFire ? '0 0 18px rgba(239,68,68,0.9)' : '0 0 12px rgba(249,115,22,0.6)',
            }}
          >
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <div className={`w-1.5 h-1.5 rounded-full ${onFire ? 'bg-red-500' : 'bg-accent'}`} />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 w-px h-3.5 bg-current" />
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-3.5 w-px h-3.5 bg-current" />
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-px bg-current" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-px bg-current" />
          </div>
        )}
      </div>

      {/* HUD Top Bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={goBack}
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
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: readingColor }} />
          <span className="font-bold text-xs" style={{ color: readingColor }}>{readingLabel}</span>
        </div>

        <div className="hud-element !px-3 !py-2">
          <span className="text-white font-mono text-sm font-bold">{formatTime(timer)}</span>
        </div>
      </div>

      {/* HUD Objective */}
      <div className="absolute top-20 left-5 right-5 z-20">
        <div className="hud-element">
          <div className="flex items-center gap-2 mb-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
            </svg>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{t('trainingObjective')}</span>
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
                      backgroundColor: i <= step ? '#f97316' : 'transparent',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Extinguisher selection */}
      {step === 1 && (
        <div className="absolute left-5 right-5 z-20" style={{ top: '44%' }}>
          <div className="hud-element">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">Select extinguisher</span>
              <span className="text-[10px] font-bold" style={{ color: fireClass.color }}>{fireClass.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXTINGUISHERS.map((name) => {
                const isCorrect = name === fireClass.correctExtinguisher;
                const selected = nozzle === name;
                return (
                  <button
                    key={name}
                    onClick={() => {
                      setNozzle(name);
                      setCorrectPicked(isCorrect);
                    }}
                    className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                      selected && isCorrect
                        ? 'border-green-500 bg-green-500/15'
                        : selected
                          ? 'border-red-500 bg-red-500/15'
                          : 'border-white/15 bg-white/5'
                    }`}
                  >
                    <div className="text-[15px] mb-1">{extinguisherIcon(name)}</div>
                    <div className={`text-white text-xs font-bold ${selected && !isCorrect ? 'line-through opacity-60' : ''}`}>{name}</div>
                    {selected && (
                      <div className="text-[9px] font-bold mt-1" style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>
                        {isCorrect ? '✓ Correct' : '✗ Wrong class'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Extinguish progress */}
      {step === 2 && (
        <div className="absolute left-5 right-5 z-20" style={{ top: '44%' }}>
          <div className="hud-element !py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">Fire remaining</span>
              <span className="text-[10px] font-bold" style={{ color: flamesDanger > 0 ? '#ef4444' : '#22c55e' }}>
                {flamesDanger > 0 ? `${Math.round(flamesDanger)}%` : 'OUT'}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${100 - extinguishProgress}%`,
                  backgroundColor: flamesDanger > 0 ? '#ef4444' : '#22c55e',
                  boxShadow: `0 0 8px ${flamesDanger > 0 ? '#ef444450' : '#22c55e60'}`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom instruction + action */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
        {/* Pump indicator (step 3) */}
        {step === 2 && flamesDanger > 0 && (
          <div className="hud-element !py-2 mb-3 flex items-center justify-between">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Nozzle: {nozzle}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-1 rounded-full bg-white/20"><span className="block h-full rounded-full bg-white/60" style={{ width: `${extinguishProgress}%` }} /></span>
              <span className="text-[10px] font-bold text-white">{Math.round(extinguishProgress)}%</span>
            </div>
          </div>
        )}

        <div className="hud-element mb-4">
          <p className="text-white text-sm font-medium leading-relaxed">{current.instruction}</p>
        </div>

        <button
          onClick={step === 2 && flamesDanger > 0 ? pump : handleAction}
          disabled={step !== 2 && (current.disabled ?? false)}
          className={`w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-accent to-accent-dark text-white shadow-glow-orange transition-all duration-200 flex items-center justify-center gap-2 ${
            current.disabled ? 'opacity-40' : 'active:scale-[0.98]'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {step === 2 && flamesDanger > 0 ? (
              <path d="M5 4h14v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V4Z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
          {step === 2 ? (flamesDanger > 0 ? 'PUMP' : current.action) : current.action}
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

function extinguisherIcon(name: string) {
  switch (name) {
    case 'Water':
      return <span>💧</span>;
    case 'Foam':
      return <span>🧼</span>;
    case 'CO\u2082 / Dry Powder':
      return <span>🧯</span>;
    default:
      return <span>🪣</span>;
  }
}

function Flame({ intensity, classColor }: { intensity: number; classColor: string }) {
  // intensity 0..1
  const flameHeight = 46 + 54 * intensity;
  return (
    <div className="flex flex-col items-center">
      {/* Glow */}
      <div
        className="rounded-full blur-2xl animate-pulse"
        style={{
          width: 170,
          height: 170,
          backgroundColor: intensity > 0 ? `${classColor}40` : 'transparent',
          transform: `scale(${0.5 + intensity * 0.5})`,
        }}
      />
      {/* Flame body */}
      <div className="relative -mt-8" style={{ width: 64, height: flameHeight + 30 }}>
        <div
          className="absolute inset-x-0 bottom-0 rounded-t-full rounded-b-md anim-flame"
          style={{
            height: `${flameHeight + 30}px`,
            background: `linear-gradient(to top, ${classColor}, #f97316 55%, #fde047)`,
            opacity: intensity,
            boxShadow: `0 0 24px 8px ${classColor}50`,
          }}
        />
        {/* inner flame */}
        <div
          className="absolute inset-x-4 bottom-0 mx-auto rounded-t-full rounded-b-sm anim-flame"
          style={{
            width: 26,
            height: `${(flameHeight + 30) * 0.6}px`,
            background: `linear-gradient(to top, #fef08a, #ffffff)`,
            opacity: intensity,
            animationDelay: '0.35s',
          }}
        />
      </div>
    </div>
  );
}
