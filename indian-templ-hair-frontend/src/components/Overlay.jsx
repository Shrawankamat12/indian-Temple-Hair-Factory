import { cx } from '../lib/ui';

/** Dimmed, blurred backdrop used behind drawers and modals. */
export default function Overlay({ open, onClick, className = '' }) {
  return (
    <div
      className={cx(
        'fixed inset-0 z-[70] bg-ink/55 backdrop-blur-[2px] transition-opacity duration-300 ease-soft',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
        className,
      )}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
