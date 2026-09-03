import { useEffect, useRef, useState } from 'react';

interface CameraARViewProps {
  /** Optional extra elements rendered above the video feed (HUD rings, overlays, etc.). */
  children?: React.ReactNode;
  fallbackClassName?: string;
  /** Optional mutable ref attached to the underlying <video> so callers can run detection on the live frame. */
  videoElRef?: React.MutableRefObject<HTMLVideoElement | null>;
}

/**
 * Renders the live device camera as the AR background when permission is granted.
 * Falls back to the existing "simulated AR" gradient otherwise (e.g. on desktop
 * without a camera, or after the user denies permission).
 */
export default function CameraARView({ children, fallbackClassName, videoElRef }: CameraARViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null) as React.MutableRefObject<HTMLVideoElement | null>;
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<'starting' | 'live' | 'denied'>('starting');
  const [attempt, setAttempt] = useState(0);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setState('starting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        // Attach stream to the video element if it is already mounted; otherwise the ref
        // callback below will attach it as soon as React renders the element.
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setState('live');
      } catch {
        if (!cancelled) setState('denied');
      }
    }

    start();
    // If the permission prompt lingers with no resolution, fall back silently.
    const timeout = setTimeout(() => {
      if (!cancelled && stateRef.current === 'starting') setState('denied');
    }, 12000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [attempt]);

  // Attach the stream once the <video> element is actually mounted.
  useEffect(() => {
    if (state === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [state]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-900">
      {/* Real camera feed when available */}
      {state === 'live' && (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (videoElRef) videoElRef.current = el;
            if (el && streamRef.current) {
              el.srcObject = streamRef.current;
              el.play().catch(() => {});
            }
          }}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Fallback simulated AR background when camera is not available */}
      {state !== 'live' && (
        <div className={`absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-800 to-surface-700 ${fallbackClassName ?? ''}`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-danger/30 blur-3xl animate-pulse" />
            <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-accent/20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent animate-[shimmer_3s_linear_infinite]" style={{ top: '40%' }} />
          </div>
        </div>
      )}

      {/* Camera status chip + retry when denied */}
      {state !== 'denied' ? (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur px-2.5 py-1">
          {state === 'live' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-white/80">CAMERA…</span>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => setAttempt((a) => a + 1)}
          className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-3 py-1.5 ring-1 ring-white/20 hover:bg-black/80 transition"
        >
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <span className="text-[10px] font-semibold text-white">RETRY CAMERA</span>
        </button>
      )}

      {children}
    </div>
  );
}
