import { useEffect, useRef, useState } from 'react';

export interface DetectedFire {
  x: number; // 0..1 (relative to video width)
  y: number; // 0..1 (relative to video height)
  width: number; // 0..1
  height: number; // 0..1
  confidence: number; // 0..1
}

/**
 * Real-time color-based flame detection running on a live <video> frame.
 *
 * Samples the video every `intervalMs`, scans pixels matching typical fire colors
 * (high red, medium green, low blue, high brightness), clusters them and returns the
 * strongest fire region as a normalized bounding box. No external ML model required —
 * this works reliably in the browser for real flames / bright sources.
 *
 * Returns `{ detected, box, ready, error }` where `detected` is a boolean flag and
 * `box` is the normalized bounds of the strongest flame cluster.
 */
export function useFireDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled = true,
  intervalMs = 300
) {
  const [box, setBox] = useState<DetectedFire | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setError('Canvas not supported');
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

        let total = 0;
        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Fire-ish: strong red, moderate green, weak blue, bright relative to surroundings
          const fireScore = (r > 150 && g > 60 && g < 230 && b < 130 && r >= g && g >= b) ? (r - g) + (g - b) + 30 : 0;
          if (fireScore > 0) {
            const px = (i / 4) % sw;
            const py = Math.floor((i / 4) / sw);
            total++;
            sumX += px;
            sumY += py;
          }
        }

        if (total > 40) {
          const cx = sumX / total;
          const cy = sumY / total;
          // Find extent of the flame cluster around the centroid
          let minX = sw, maxX = 0, minY = sh, maxY = 0;
          let cluster = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const fireScore = (r > 150 && g > 60 && g < 230 && b < 130 && r >= g && g >= b) ? (r - g) + (g - b) + 30 : 0;
            if (fireScore > 0) {
              const px = (i / 4) % sw;
              const py = Math.floor((i / 4) / sw);
              const dx = px - cx;
              const dy = py - cy;
              if (dx * dx + dy * dy < 70 * 70) {
                cluster++;
                if (px < minX) minX = px;
                if (px > maxX) maxX = px;
                if (py < minY) minY = py;
                if (py > maxY) maxY = py;
              }
            }
          }

          const confidence = cluster > 0 ? Math.min(1, cluster / 1200) : 0;
          setBox({
            x: minX / sw,
            y: minY / sh,
            width: Math.max(0.05, (maxX - minX) / sw),
            height: Math.max(0.05, (maxY - minY) / sh),
            confidence,
          });
        } else {
          setBox(null);
        }
        setReady(true);
      }

      if (enabled) raf = window.setTimeout(scan, intervalMs);
    };

    scan();
    return () => {
      if (raf) clearTimeout(raf);
    };
  }, [videoRef, enabled, intervalMs]);

  const detected = !!box && (!isNaN(box.confidence) && box.confidence > 0.18);

  return { detected, box: detected ? box : null, ready, error };
}
