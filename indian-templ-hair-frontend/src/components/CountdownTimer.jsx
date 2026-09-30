import { useEffect, useState } from 'react';

function getRemaining(target) {
  const diff = Math.max(0, target - Date.now());
  return {
    h: Math.floor(diff / 3.6e6),
    m: Math.floor((diff % 3.6e6) / 6e4),
    s: Math.floor((diff % 6e4) / 1000),
  };
}

export default function CountdownTimer({ hours = 8, endsAt }) {
  // Count down to the admin's Flash Sale end time when it is valid AND in the future;
  // otherwise fall back to a rolling "N hours from now" timer instead of freezing at 00:00:00.
  const [target] = useState(() => {
    const parsed = endsAt ? new Date(endsAt).getTime() : NaN;
    const isValidFuture = !Number.isNaN(parsed) && parsed > Date.now();
    return isValidFuture ? parsed : Date.now() + hours * 3.6e6;
  });

  const [t, setT] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setT(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex gap-2">
      {[['H', t.h], ['M', t.m], ['S', t.s]].map(([label, v]) => (
        <div className="flex min-w-14 flex-col items-center rounded-md bg-espresso px-3 py-2 text-cream" key={label}>
          <span className="font-sans text-xl font-bold tabular-nums leading-none">{pad(v)}</span>
          <span className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-champagne">{label}</span>
        </div>
      ))}
    </div>
  );
}
