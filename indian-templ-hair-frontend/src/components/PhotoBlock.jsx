const TONES = {
  espresso: ['#2B1810', '#4A2818'],
  gold: ['#F1DFA3', '#E5C06A'],
  beige: ['#F5EDE0', '#E8DED2'],
  cream: ['#FBF7EF', '#F5EDE0'],
  brown: ['#4A2818', '#6B3E22'],
};

/** Image frame with a tonal placeholder when no `src` is given. */
export default function PhotoBlock({ tone = 'beige', ratio = '4/5', label, sub, className = '', rounded = 0, src, alt = '', zoom = 1, position = 'center' }) {
  const [c1, c2] = TONES[tone] || TONES.beige;
  return (
    <div
      className={`photoblock ${className}`}
      style={{ aspectRatio: ratio, borderRadius: rounded, background: `linear-gradient(155deg, ${c1}, ${c2})` }}
    >
      {src && (
        <img
          className="photoblock-img" src={src} alt={alt} loading="lazy"
          style={{ objectPosition: position, ...(zoom !== 1 ? { transform: `scale(${zoom})` } : null) }}
        />
      )}
      {src && (label || sub) && <div className="photoblock-scrim" />}
      {(label || sub) && (
        <div className="photoblock-caption">
          {label && <span className="photoblock-label">{label}</span>}
          {sub && <span className="photoblock-sub">{sub}</span>}
        </div>
      )}
    </div>
  );
}
