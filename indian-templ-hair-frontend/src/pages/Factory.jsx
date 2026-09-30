import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { processSteps, certifications, exportCountries } from '../data/content';
import Container from '../components/Container';
import Button from '../components/Button';

import factorySorting from '../assets/photos/factory-sorting.jpg';
import factoryWefting from '../assets/photos/factory-wefting.jpg';
import lengthInspection from '../assets/photos/cat-bulk.jpg';
import factoryPacking from '../assets/photos/factory-packing.jpg';
import factoryStorage from '../assets/photos/factory-storage.jpg';
import wigShelf from '../assets/photos/wig-shelf.jpg';

const factoryGallery = [
  { label: 'Sourcing Intake', img: factoryStorage },
  { label: 'Hand-Sorting Floor', img: factorySorting },
  { label: 'Double-Drawing', img: wigShelf },
  { label: 'Wefting Studio', img: factoryWefting },
  { label: 'Length Inspection', img: lengthInspection },
  { label: 'Export Packing Line', img: factoryPacking },
];

export default function Factory() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'Factory' }]} title="Factory & Manufacturing" lede="A transparent look at how raw hair becomes a finished, export-ready bundle." />

      <Reveal as="section" className="py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading title="Our manufacturing process" sub="From source to shipment." rule />
          <ol className="m-0 grid list-none gap-[clamp(20px,3vw,36px)] p-0 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((s, i) => (
              <li key={s.step} className="rounded-xl border border-line bg-white p-6">
                <span className="mb-3 block font-display text-[2.4rem] leading-none tabular-nums text-gold-soft [-webkit-text-stroke:1px_var(--color-gold)]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mb-2 text-[1.1rem]">{s.step}</h3>
                <p className="text-[0.9rem] text-muted">{s.desc}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Reveal>

      <Reveal as="section" className="bg-sand py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading title="Factory tour gallery" sub="Najafgarh Road, New Delhi." rule />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {factoryGallery.map((g, i) => (
              <PhotoBlock key={g.label} tone={['espresso', 'brown', 'gold', 'beige', 'cream', 'brown'][i]} ratio="4/3" rounded={8} label={g.label} src={g.img} alt={g.label} />
            ))}
          </div>
        </Container>
      </Reveal>

      <Reveal as="section" className="py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading center title="Quality & certifications" rule />
          <ul className="m-0 flex list-none flex-wrap justify-center gap-3 p-0">
            {certifications.map((c) => <li key={c} className="rounded-full border border-gold bg-white px-[22px] py-3 text-[0.88rem] font-semibold text-walnut">{c}</li>)}
          </ul>
        </Container>
      </Reveal>

      <Reveal as="section" className="on-dark bg-espresso py-14 text-cream sm:py-20 lg:py-24">
        <Container>
          <SectionHeading center title="Export countries" sub="Worldwide shipping." rule />
          <ul className="m-0 flex list-none flex-wrap justify-center gap-2.5 p-0">
            {exportCountries.map((c) => <li key={c} className="rounded-full border border-champagne/20 px-4 py-2 text-[0.84rem] text-cream/70">{c}</li>)}
            <li className="rounded-full border border-gold px-4 py-2 text-[0.84rem] font-semibold text-champagne">+ 38 more</li>
          </ul>
          <div className="mt-8 flex justify-center"><Button to="/wholesale" size="lg">Start a wholesale enquiry</Button></div>
        </Container>
      </Reveal>
    </>
  );
}
