import Container from './Container';

/** Compact page title row used on utility pages (search, wishlist, cart…). */
export default function PageTitle({ children, count, sub, className = '' }) {
  return (
    <Container className={`pt-7 ${className}`}>
      <h1 className="text-[clamp(1.5rem,2.6vw,2rem)]">
        {children}
        {count != null && <small className="ml-2 font-sans text-[0.9rem] text-muted">{count}</small>}
      </h1>
      {sub && <p className="mt-1.5 text-muted">{sub}</p>}
    </Container>
  );
}
