import { useRef, useState } from 'react';
import PhotoBlock from './PhotoBlock';
import { cx } from '../lib/ui';

/**
 * Hover magnifier (lens + side pane on wide screens) with click-to-zoom for
 * touch/narrow screens. `ratio` lets the product page use a portrait frame.
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
    const cx2 = Math.max(LENS_SIZE / 2, Math.min(rect.width - LENS_SIZE / 2, x));
    const cy2 = Math.max(LENS_SIZE / 2, Math.min(rect.height - LENS_SIZE / 2, y));
    setLens({ x: cx2 - LENS_SIZE / 2, y: cy2 - LENS_SIZE / 2 });
    setBg({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }

  return (
    <div className="relative">
      <div
        ref={frameRef}
        className={cx('group relative overflow-hidden rounded-xl border border-line bg-sand', active ? 'cursor-crosshair' : 'cursor-zoom-in')}
        style={{ aspectRatio: ratio }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onMouseMove={handleMove}
        onClick={() => setTapZoom((z) => !z)}
      >
        <img
          src={src} alt={alt} loading="lazy" className="size-full object-cover"
          style={{
            transform: tapZoom ? 'scale(1.6)' : 'scale(1)',
            transformOrigin: tapZoom ? `${bg.x}% ${bg.y}%` : 'center',
            transition: tapZoom ? 'none' : 'transform 260ms ease',
          }}
        />
        {active && <span className="pointer-events-none absolute z-[3] rounded border-[1.5px] border-gold bg-white/15" style={{ width: LENS_SIZE, height: LENS_SIZE, left: lens.x, top: lens.y }} />}
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-sm bg-espresso/80 px-2.5 py-[5px] text-[0.72rem] tracking-[0.06em] text-cream opacity-0 transition-opacity group-hover:opacity-100">
          {tapZoom ? 'Click to reset' : 'Hover to zoom'}
        </span>
      </div>

      <div
        aria-hidden="true"
        className={cx('absolute left-[calc(100%+24px)] top-0 z-30 hidden h-full max-h-[560px] w-[460px] rounded border border-gold bg-white bg-no-repeat', active && 'min-[1240px]:block')}
        style={{ backgroundImage: `url(${src})`, backgroundSize: '220%', backgroundPosition: `${bg.x}% ${bg.y}%` }}
      />
    </div>
  );
}
