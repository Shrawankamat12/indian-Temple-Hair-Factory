import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="section">
      <div className="container container--narrow notfound">
        <span className="notfound-num" aria-hidden="true">404</span>
        <h1>This page took a wrong turn</h1>
        <p>The page you're looking for doesn't exist, or has moved.</p>
        <div className="oc-actions">
          <Button to="/">Back to home</Button>
          <Button to="/shop" variant="outline">Browse shop</Button>
        </div>
      </div>
    </div>
  );
}
