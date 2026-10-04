import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { useSiteContent } from '../hooks/useStoreData';
import { imageOr } from '../lib/media';
import Container from '../components/Container';
import Button from '../components/Button';

export default function Factory() {
  const { siteContent: sc } = useSiteContent();
  // Admin → Website Content → Process Steps / Factory Gallery / Certifications & Countries
  const processSteps = (sc?.processSteps || []).filter((st) => st?.step);
  const gallery = (sc?.factoryGallery?.images || []).filter((g) => g?.image);
  const certifications = (sc?.certifications || []).filter(Boolean);
  const exportCountries = (sc?.exportCountries || []).filter(Boolean);
  return (
    <>
      <PageHeader crumbs={[{ label: 'Factory' }]} title="Factory & Manufacturing" lede="A transparent look at how raw hair becomes a finished, export-ready bundle." />

      {processSteps.length > 0 && <Reveal as="section" className="py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading title="Our manufacturing process" rule />
          <ol className="m-0 grid list-none gap-[clamp(20px,3vw,36px)] p-0 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((s, i) => (
              <li key={s.step} className="rounded-xl border border-line bg-white p-6">
                <span className="mb-3 block font-display text-[2.4rem] leading-none tabular-nums text-gold-soft [-webkit-text-stroke:1px_var(--color-gold)]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mb-2 text-[1.1rem]">{s.step}</h3>
                {s.desc && <p className="text-[0.9rem] text-muted">{s.desc}</p>}
              </li>
            ))}
          </ol>
        </Container>
      </Reveal>}

      {gallery.length > 0 && <Reveal as="section" className="bg-sand py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading title={sc?.factoryGallery?.title || 'Factory tour gallery'} sub={sc?.factoryGallery?.eyebrow} rule />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g, i) => (
              <PhotoBlock key={g.label || g.image} tone={['espresso', 'brown', 'gold', 'beige', 'cream', 'brown'][i % 6]} ratio="4/3" rounded={8} label={g.label} src={imageOr(g.image)} alt={g.label || ''} />
            ))}
          </div>
        </Container>
      </Reveal>}

      {certifications.length > 0 && <Reveal as="section" className="py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading center title="Quality & certifications" rule />
          <ul className="m-0 flex list-none flex-wrap justify-center gap-3 p-0">
            {certifications.map((c) => <li key={c} className="rounded-full border border-gold bg-white px-[22px] py-3 text-[0.88rem] font-semibold text-walnut">{c}</li>)}
          </ul>
        </Container>
      </Reveal>}

      {exportCountries.length > 0 && <Reveal as="section" className="on-dark bg-espresso py-14 text-cream sm:py-20 lg:py-24">
        <Container>
          <SectionHeading center title="Export countries" rule />
          <ul className="m-0 flex list-none flex-wrap justify-center gap-2.5 p-0">
            {exportCountries.map((c) => <li key={c} className="rounded-full border border-champagne/20 px-4 py-2 text-[0.84rem] text-cream/70">{c}</li>)}
          </ul>
          <div className="mt-8 flex justify-center"><Button to="/wholesale" size="lg">Start a wholesale enquiry</Button></div>
        </Container>
      </Reveal>}
    </>
  );
}
