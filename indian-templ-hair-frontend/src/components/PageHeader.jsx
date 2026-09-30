import Breadcrumb from './Breadcrumb';
import Container from './Container';
import { cx } from '../lib/ui';

/**
 * Page title banner. Dark espresso band; when `image` is given it fills the right side
 * with a gradient fade. Without an image it is a plain dark band with a soft gold glow.
 */
export default function PageHeader({ crumbs = [], title, lede, image, tall = false }) {
  return (
    <header className="on-dark relative overflow-hidden bg-[linear-gradient(100deg,#1e1410_0%,#33221a_100%)] text-cream">
      {image ? (
        <>
          <img className="absolute right-0 top-0 h-full w-full object-cover object-[50%_25%] opacity-50 md:w-[62%] md:opacity-100" src={image} alt="" />
          <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,#1e1410_30%,rgb(30_20_16/0.55)_62%,rgb(30_20_16/0.15))]" />
        </>
      ) : (
        <div className="pointer-events-none absolute -right-24 -top-32 size-[380px] rounded-full bg-[radial-gradient(circle,rgb(200_154_61/0.22),transparent_65%)]" />
      )}
      <Container className={cx('relative z-[2]', tall ? 'py-12 sm:py-16 lg:py-24' : 'py-8 sm:py-11 lg:py-14')}>
        <Breadcrumb crumbs={crumbs} />
        <h1 className="max-w-[22ch] text-[clamp(1.9rem,4vw,3rem)] text-cream">{title}</h1>
        {lede && <p className="mt-2.5 max-w-[48ch] text-cream/75">{lede}</p>}
      </Container>
    </header>
  );
}
