import Button from '../components/Button';
import Container from '../components/Container';
import Section from '../components/Section';

export default function NotFound() {
  return (
    <Section>
      <Container narrow className="flex flex-col items-center py-6 text-center sm:py-12">
        <span className="mb-2 font-display text-[clamp(5rem,16vw,9rem)] leading-none text-gold" aria-hidden="true">404</span>
        <h1 className="mb-3.5 text-[clamp(1.9rem,4vw,3rem)]">This page took a wrong turn</h1>
        <p className="text-muted">The page you're looking for doesn't exist, or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/">Back to home</Button>
          <Button to="/shop" variant="outline">Browse shop</Button>
          <Button to="/contact" variant="gold">Contact us</Button>
        </div>
      </Container>
    </Section>
  );
}
