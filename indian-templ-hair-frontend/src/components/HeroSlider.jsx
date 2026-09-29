import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { isExternal } from '../lib/media';

function CtaButton({ to, variant, children }) {
  if (!to) return null;
  const cls = `btn btn-lg ${variant === 'secondary' ? 'btn-outline-light' : 'btn-primary'}`;
  return isExternal(to) ? <a href={to} className={cls}>{children}</a> : <Link to={to} className={cls}>{children}</Link>;
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Hero: full-width background photo per slide (2-4 slides) with the copy on top.
 * Slide shape: { key, eyebrow, title, highlight, subtitle, image, alt, flip, primary, secondary, stats }.
 * Autoplay pauses on hover/focus and is off for reduced-motion users.
 */
export default function HeroSlider({ slides = [] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % count), 6500);
    return () => clearInterval(t);
  }, [count, paused, i]);

  if (!count) return null;
  const go = (n) => setI((n + count) % count);

  return (
    <section
      className="hero" aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      {slides.map((s, idx) => (
        <div className={`hero-slide ${idx === i ? 'is-active' : ''}`} key={s.key} aria-hidden={idx !== i} role="group" aria-label={`${idx + 1} of ${count}`}>
          <div className="hero-bg" aria-hidden="true">
            {s.image && <img className={s.flip ? 'is-flip' : ''} src={s.image} alt="" fetchPriority={idx === 0 ? 'high' : undefined} loading={idx === 0 ? 'eager' : 'lazy'} />}
          </div>
          <div className="container hero-grid">
            <div className="hero-copy">
              {s.eyebrow && <span className="hero-eyebrow">{s.eyebrow}</span>}
              <h1 className="hero-title">
                {s.title}
                {s.highlight && <span className="hero-hl">{s.highlight}</span>}
              </h1>
              {s.subtitle && <p className="hero-sub">{s.subtitle}</p>}
              <div className="hero-ctas">
                <CtaButton to={s.primary?.link}>{s.primary?.text}</CtaButton>
                <CtaButton to={s.secondary?.link} variant="secondary">{s.secondary?.text}</CtaButton>
              </div>
              {s.stats?.length > 0 && (
                <dl className="hero-stats">
                  {s.stats.map((st) => (
                    <div key={st.label}><dt className="num">{st.value}</dt><dd>{st.label}</dd></div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </div>
      ))}

      {count > 1 && (
        <>
          <button type="button" className="hero-arrow hero-arrow--prev" onClick={() => go(i - 1)} aria-label="Previous slide"><FiChevronLeft size={22} /></button>
          <button type="button" className="hero-arrow hero-arrow--next" onClick={() => go(i + 1)} aria-label="Next slide"><FiChevronRight size={22} /></button>
          <div className="hero-nav">
            <span className="hero-count num" aria-hidden="true">{pad(i + 1)} <i /> {pad(count)}</span>
            <div className="hero-dots">
              {slides.map((s, idx) => (
                <button type="button" key={s.key} className={idx === i ? 'is-active' : ''} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`} aria-current={idx === i} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}