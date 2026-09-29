import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { processSteps, certifications, exportCountries } from '../data/content';
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

      <Reveal as="section" className="section">
        <div className="container">
          <SectionHeading title="Our manufacturing process" sub="From source to shipment." />
          <ol className="steps-grid">
            {processSteps.map((s, i) => (
              <li key={s.step}>
                <span className="steps-grid-num num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.step}</h3>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal as="section" className="section section--alt">
        <div className="container">
          <SectionHeading title="Factory tour gallery" sub="Najafgarh Road, New Delhi." />
          <div className="tour">
            {factoryGallery.map((g, i) => (
              <PhotoBlock key={g.label} tone={['espresso', 'brown', 'gold', 'beige', 'cream', 'brown'][i]} ratio="4/3" rounded={4} label={g.label} src={g.img} alt={g.label} />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container">
          <SectionHeading center title="Quality & certifications" rule />
          <ul className="certs">
            {certifications.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </Reveal>

      <Reveal as="section" className="section section--dark">
        <div className="container">
          <SectionHeading center title="Export countries" sub="Worldwide shipping." />
          <ul className="countries">
            {exportCountries.map((c) => <li key={c}>{c}</li>)}
            <li className="is-more">+ 38 more</li>
          </ul>
        </div>
      </Reveal>
    </>
  );
}
