import { useRef, useState } from 'react';
import PhotoBlock from './PhotoBlock';

/**
 * Hover magnifier (lens + side pane on wide screens) with click-to-zoom for
 * touch/narrow screens. Behaviour unchanged; `ratio` is new so the product
 * page can use a portrait frame.
 */
export default function ImageZoom({ src, alt = '', tone = 'beige', ratio = '4/5' }) {
  const frameRef = useRef(null);
  const [active, setActive] = useState(false);
  const [tapZoom, setTapZoom] = useState(false);
  const [lens, setLens] = useState({ x: 0, y: 0 });
  const [bg, setBg] = useState({ x: 50, y: 50 });

  if (!src) return <PhotoBlock tone={tone} ratio={ratio} src={src} alt={alt} />;

  const LENS_SIZE = 140;

  function handleMove(e) {
    const rect = frameRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = Math.max(LENS_SIZE / 2, Math.min(rect.width - LENS_SIZE / 2, x));
    const cy = Math.max(LENS_SIZE / 2, Math.min(rect.height - LENS_SIZE / 2, y));
    setLens({ x: cx - LENS_SIZE / 2, y: cy - LENS_SIZE / 2 });
    setBg({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }

  return (
    <div className="zoom-wrap">
      <div
        ref={frameRef}
        className={`zoom-frame ${active ? 'active' : ''}`}
        style={{ aspectRatio: ratio }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onMouseMove={handleMove}
        onClick={() => setTapZoom((z) => !z)}
      >
        <img
          src={src} alt={alt} loading="lazy"
          style={{
            transform: tapZoom ? 'scale(1.6)' : 'scale(1)',
            transformOrigin: tapZoom ? `${bg.x}% ${bg.y}%` : 'center',
            transition: tapZoom ? 'none' : 'transform 260ms ease',
          }}
        />
        {active && <span className="zoom-lens" style={{ width: LENS_SIZE, height: LENS_SIZE, left: lens.x, top: lens.y }} />}
        <span className="zoom-hint">{tapZoom ? 'Click to reset' : 'Hover to zoom'}</span>
      </div>

      <div
        className={`zoom-pane ${active ? 'show' : ''}`}
        style={{ backgroundImage: `url(${src})`, backgroundSize: '220%', backgroundPosition: `${bg.x}% ${bg.y}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
