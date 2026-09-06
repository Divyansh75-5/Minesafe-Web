import { useEffect, useRef, useState } from 'react';

export type ColorSeverity = 'danger' | 'warning' | 'safe' | 'none';
export type DominantClass = 'fire' | 'yellow' | 'green' | 'none';
export type DetectionMode = 'fire' | 'gas';

export interface HazardBox {
  x: number; // 0..1 (relative to video width)
  y: number; // 0..1 (relative to video height)
  width: number; // 0..1
  height: number; // 0..1
  confidence: number; // 0..1
}

export interface ColorAnalysis {
  severity: ColorSeverity;
  dominant: DominantClass;
  dangerPct: number; // % pixels matching fire/orange-red
  greenPct: number;  // % pixels matching green (safe indicator)
  reading: number;   // 0..100 sensor-like reading
  color: string;     // css color for meter/status
  box: HazardBox | null;
  ready: boolean;
  error: string | null;
}

const DANGER_COLOR = '#ef4444';
const WARNING_COLOR = '#eab308';
const SAFE_COLOR = '#22c55e';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const INITIAL: ColorAnalysis = {
  severity: 'none',
  dominant: 'none',
  dangerPct: 0,
  greenPct: 0,
  reading: 0,
  color: SAFE_COLOR,
  box: null,
  ready: false,
  error: null,
};

/**
 * Real-time color-based hazard classification running on a live <video> frame.
 *
 * The reading is NOT random/mock — it is derived from what the camera actually sees.
 * Which colour matters depends on `mode`:
 *
 *   fire mode (default): only the ORANGE/RED fire intensity matters.
 *     - strong red/orange -> `danger`  (HIGH reading)
 *     - yellow/amber      -> `warning` (MEDIUM reading)
 *     - green is IGNORED  (a safe tree/plant must NOT make the reading drop)
 *     - nothing matching  -> LOW baseline
 *
 *   gas mode: only the GREEN indicator intensity matters — green = gas present,
 *     so the MORE green, the HIGHER the gas reading.
 *     - weak green -> LOW gas (green)
 *     - stronger green -> progressively higher gas (yellow -> red)
 *     - red/orange is IGNORED (does not count as gas)
 *
 * Returns a stable `ColorAnalysis` every `intervalMs`. The reading is smoothed
 * (lerped) so it settles convincingly on the detected colour instead of jumping
 * randomly between values.
 */
export function useColorDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled = true,
  intervalMs = 300,
  mode: DetectionMode = 'fire'
): ColorAnalysis {
  const [analysis, setAnalysis] = useState<ColorAnalysis>(INITIAL);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevReading = useRef(10);

  useEffect(() => {
    if (!enabled) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setAnalysis((a) => ({ ...a, error: 'Canvas not supported' }));
      return;
    }

    let raf = 0;

    const scan = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const sw = 160; // downscale for speed
        const sh = Math.round((video.videoHeight / video.videoWidth) * sw);
        canvas.width = sw;
        canvas.height = sh;
        ctx.drawImage(video, 0, 0, sw, sh);
        const data = ctx.getImageData(0, 0, sw, sh).data;

        let danger = 0;
        let yellow = 0;
        let green = 0;
        let sumX = 0;
        let sumY = 0;
        let minX = sw, maxX = 0, minY = sh, maxY = 0;
        const N = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Fire / strong orange-red: dominant red, weak blue, r >= g >= b
          if (r > 140 && b < 120 && r >= g && g >= b) {
            danger++;
            const px = (i / 4) % sw;
            const py = Math.floor((i / 4) / sw);
            sumX += px;
            sumY += py;
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
          }
          // Yellow / amber warning: bright red+green, weak blue
          else if (r > 150 && g > 110 && b < 130 && Math.abs(r - g) <= 35) {
            yellow++;
          }
          // Green safe indicator: green clearly dominant
          else if (g > 100 && g > r + 40 && g > b + 40) {
            green++;
          }
        }

        const dangerPct = (danger / N) * 100;
        const yellowPct = (yellow / N) * 100;
        const greenPct = (green / N) * 100;

        let severity: ColorSeverity = 'none';
        let dominant: DominantClass = 'none';
        let targetReading = 10;
        let color = SAFE_COLOR;
        let box: HazardBox | null = null;

        if (mode === 'gas') {
          // Gas mode: green is the signal. More green -> more gas.
          if (greenPct >= 1.2) {
            severity = 'warning';
            dominant = 'green';
            targetReading = Math.min(100, 8 + greenPct * 1.8);
            color =
              targetReading > 60
                ? DANGER_COLOR
                : targetReading > 30
                  ? WARNING_COLOR
                  : SAFE_COLOR;
          } else {
            severity = 'safe';
            dominant = 'green';
            targetReading = 8;
            color = SAFE_COLOR;
          }
        } else if (dangerPct >= 0.8) {
          // Fire mode: only red/orange intensity matters. Green is ignored.
          severity = 'danger';
          dominant = 'fire';
          color = DANGER_COLOR;
          targetReading = Math.min(100, 75 + dangerPct * 1.5);
          box = {
            x: minX / sw,
            y: minY / sh,
            width: Math.max(0.05, (maxX - minX) / sw),
            height: Math.max(0.05, (maxY - minY) / sh),
            confidence: Math.min(1, danger / 1200),
          };
        } else if (yellowPct >= 0.6) {
          severity = 'warning';
          dominant = 'yellow';
          color = WARNING_COLOR;
          targetReading = 50 + Math.min(10, yellowPct);
        }

        prevReading.current = Math.round(lerp(prevReading.current, targetReading, 0.35));
        setAnalysis({
          severity,
          dominant,
          dangerPct,
          greenPct,
          reading: prevReading.current,
          color,
          box,
          ready: true,
          error: null,
        });
      }

      if (enabled) raf = window.setTimeout(scan, intervalMs);
    };

    scan();
    return () => {
      if (raf) clearTimeout(raf);
    };
  }, [videoRef, enabled, intervalMs, mode]);

  return analysis;
}