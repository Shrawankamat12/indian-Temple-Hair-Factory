import { FiSearch } from 'react-icons/fi';

export function EmptyState({ title = 'Nothing here yet', message, action, icon }) {
  return (
    <div className="state">
      <span className="state-icon" aria-hidden="true">{icon || <FiSearch size={24} />}</span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state" role="alert">
      <h3>We couldn't load this</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-outline btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading-arch" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
