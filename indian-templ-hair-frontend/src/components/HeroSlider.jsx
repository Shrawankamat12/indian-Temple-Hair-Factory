import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { isExternal } from '../lib/media';
import { btn, cx } from '../lib/ui';
import Container from './Container';

function CtaButton({ to, variant, children }) {
  if (!to) return null;
  const cls = btn(variant === 'secondary' ? 'light' : 'primary', 'lg', 'max-sm:flex-1');
  return isExternal(to) ? <a href={to} className={cls}>{children}</a> : <Link to={to} className={cls}>{children}</Link>;
}

const pad = (n) => String(n).padStart(2, '0');

const arrow =
  'absolute bottom-10 z-[3] hidden size-[46px] items-center justify-center rounded-full border border-cream/40 bg-[rgb(20_12_9/0.4)] text-cream backdrop-blur-sm transition-colors hover:border-brand hover:bg-brand md:inline-flex';

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
      className="on-dark relative grid overflow-hidden bg-espresso text-cream"
      aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      {slides.map((s, idx) => {
        const active = idx === i;
        return (
          <div
            key={s.key} aria-hidden={!active} role="group" aria-label={`${idx + 1} of ${count}`}
            className={cx('relative [grid-area:1/1] transition-[opacity,visibility] duration-[900ms] ease-soft', active ? 'visible z-[1] opacity-100' : 'invisible opacity-0')}
          >
            <div className="absolute inset-0 overflow-hidden bg-[#2c1c14]" aria-hidden="true">
              {s.image && (
                <img
                  src={s.image} alt="" fetchPriority={idx === 0 ? 'high' : undefined} loading={idx === 0 ? 'eager' : 'lazy'}
                  className={cx(
                    'absolute inset-0 size-full object-cover object-[50%_30%]',
                    s.flip && '[transform:scaleX(-1)]',
                    active && (s.flip ? 'animate-hero-zoom-flip' : 'animate-hero-zoom'),
                  )}
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(20_12_9/0.92)_0%,rgb(20_12_9/0.72)_55%,rgb(20_12_9/0.5)_100%)] md:bg-[linear-gradient(90deg,rgb(20_12_9/0.94)_0%,rgb(20_12_9/0.78)_34%,rgb(20_12_9/0.3)_66%,rgb(20_12_9/0.08)_100%),linear-gradient(0deg,rgb(20_12_9/0.5)_0%,transparent_32%)]" />
            </div>

            <Container className="relative flex items-center pb-24 pt-11 md:min-h-[clamp(460px,44vw,660px)] md:pb-[clamp(72px,7vw,108px)] md:pt-[clamp(44px,5vw,76px)]">
              <div className={cx('max-w-[640px]', active && '[&>*]:animate-rise [&>:nth-child(2)]:[animation-delay:.08s] [&>:nth-child(3)]:[animation-delay:.16s] [&>:nth-child(4)]:[animation-delay:.24s] [&>:nth-child(5)]:[animation-delay:.32s]')}>
                {s.eyebrow && (
                  <span className="mb-[18px] inline-flex items-center gap-3 text-[0.76rem] font-semibold uppercase tracking-[0.2em] text-champagne before:h-px before:w-[38px] before:bg-champagne before:content-['']">
                    {s.eyebrow}
                  </span>
                )}
                <h1 className="max-w-[15ch] text-[clamp(2rem,8.5vw,2.7rem)] leading-[1.04] text-cream [text-shadow:0_2px_24px_rgb(0_0_0/0.35)] md:text-[clamp(2.4rem,5.2vw,4.5rem)]">
                  {s.title}
                  {s.highlight && <span className="mt-3 block text-[0.52em] leading-[1.15] text-champagne">{s.highlight}</span>}
                </h1>
                {s.subtitle && <p className="mt-[22px] max-w-[46ch] text-base leading-[1.65] text-cream/85 md:text-[1.08rem]">{s.subtitle}</p>}
                <div className="mt-[34px] flex flex-wrap gap-3.5">
                  <CtaButton to={s.primary?.link}>{s.primary?.text}</CtaButton>
                  <CtaButton to={s.secondary?.link} variant="secondary">{s.secondary?.text}</CtaButton>
                </div>
                {s.stats?.length > 0 && (
                  <dl className="m-0 mt-10 flex max-w-[540px] flex-wrap gap-x-[clamp(24px,4vw,56px)] gap-y-3.5 border-t border-champagne/30 pt-6">
                    {s.stats.map((st) => (
                      <div key={st.label}>
                        <dt className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-none tabular-nums text-champagne">{st.value}</dt>
                        <dd className="m-0 mt-[7px] text-[0.7rem] uppercase tracking-[0.12em] text-cream/70">{st.label}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </Container>
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button type="button" className={cx(arrow, 'right-[calc(clamp(16px,3vw,40px)+56px)]')} onClick={() => go(i - 1)} aria-label="Previous slide"><FiChevronLeft size={22} /></button>
          <button type="button" className={cx(arrow, 'right-[clamp(16px,3vw,40px)]')} onClick={() => go(i + 1)} aria-label="Next slide"><FiChevronRight size={22} /></button>
          <div className="pointer-events-none absolute inset-x-0 bottom-[58px] z-[3] flex flex-col items-center gap-2.5 md:bottom-[50px] [&>*]:pointer-events-auto">
            <span className="inline-flex items-center gap-2.5 text-[0.78rem] tabular-nums tracking-[0.14em] text-cream/85" aria-hidden="true">
              {pad(i + 1)} <i className="h-px w-[26px] bg-cream/50" /> {pad(count)}
            </span>
            <div className="flex justify-center gap-2">
              {slides.map((s, idx) => (
                <button
                  type="button" key={s.key} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`} aria-current={idx === i}
                  className={cx('h-[9px] rounded-full border-0 p-0 transition-all duration-300', idx === i ? 'w-7 bg-champagne' : 'w-[9px] bg-cream/45 hover:bg-cream/70')}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
