import { FiSearch } from 'react-icons/fi';
import Button from './Button';

export function EmptyState({ title = 'Nothing here yet', message, action, icon }) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center sm:py-20">
      <span className="mb-2 flex h-24 w-[76px] items-end justify-center rounded-t-full border border-gold bg-white pb-[22px] text-walnut" aria-hidden="true">
        {icon || <FiSearch size={24} />}
      </span>
      <h3 className="max-w-[28ch] text-2xl">{title}</h3>
      {message && <p className="max-w-[44ch] text-muted">{message}</p>}
      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center sm:py-20" role="alert">
      <h3 className="max-w-[28ch] text-2xl">We couldn't load this</h3>
      <p className="max-w-[44ch] text-muted">{message}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-2.5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="h-[46px] w-[34px] animate-arch rounded-t-full border-2 border-b-0 border-gold" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
