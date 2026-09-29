import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import BadgeIcon from '../components/BadgeIcon';
import { useSiteContent } from '../hooks/useStoreData';
import storyPhoto from '../assets/photos/factory-history.jpg';

const timeline = [
  { year: '2014', title: 'Founded in New Delhi', desc: 'Indian Temple Remy Hair Exports began as a small sorting unit serving local salons across Delhi.' },
  { year: '2017', title: 'First Export Shipment', desc: 'Our first international container shipped to a distributor in the United States.' },
  { year: '2019', title: '100+ Team Members', desc: 'In-house wefting and QC teams expanded to keep every stage of production under one roof.' },
  { year: '2022', title: 'Expanded to 40+ Countries', desc: 'Wholesale partnerships grew across Africa, Europe and the Middle East.' },
  { year: '2026', title: '200+ Artisans, 50+ Countries', desc: 'Today we manufacture, export and supply raw, remy and virgin hair worldwide.' },
];

export default function About() {
  const { siteContent } = useSiteContent();
  const features = (siteContent?.whyChooseUs?.items || []).slice(0, 4);
  const stats = siteContent?.hero?.stats?.length ? siteContent.hero.stats : null;
  return (
    <>
      <PageHeader crumbs={[{ label: 'About' }]} title="About Indian Temple Remy Hair Exports" lede="Manufacturer, exporter and supplier of 100% human hair, built in Delhi, trusted worldwide." tall />

      {features.length > 0 && (
        <section className="section section--tight">
          <ul className="container why-row">
            {features.map((it) => (
              <li key={it.title} className="why-card">
                <span className="why-ico"><BadgeIcon label={`${it.title} ${it.description || ''}`} size={22} /></span>
                <strong>{it.title}</strong>
                {it.description && <span>{it.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Reveal as="section" className="section">
        <div className="container split">
          <div className="split-media arch">
            <PhotoBlock tone="brown" ratio="4/5" src={storyPhoto} alt="Indian Temple Remy Hair Exports story" />
          </div>
          <div className="prose">
            <h2>A factory built on trust, not middlemen</h2>
            <p>Indian Temple Remy Hair Exports was founded in 2014 out of a simple frustration: too much of the "Indian hair" sold worldwide passed through layers of resellers before it ever reached a real customer.</p>
            <p>We set out to manufacture, sort and export hair directly from our own factory floor in Najafgarh Road, New Delhi, keeping every stage of production, from sourcing to packing, under one roof and one standard of quality.</p>
            <p>Today, a team of 200+ artisans hand-sorts, double-draws and wefts every bundle that leaves our facility, shipping to distributors, salons and stylists in more than 50 countries.</p>
            <div className="prose-cta"><Button to="/shop">Shop the collection</Button><Button to="/factory" variant="outline">See our process</Button></div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section--dark stat-band">
        <dl className="container stat-strip">
          {stats ? stats.map((st) => (
            <div key={st.label}><dt className="num">{st.value}</dt><dd>{st.label}</dd></div>
          )) : (
            <>
              <div><dt className="num">2014</dt><dd>Year founded</dd></div>
              <div><dt className="num">200+</dt><dd>Artisans</dd></div>
              <div><dt className="num">50+</dt><dd>Export countries</dd></div>
              <div><dt className="num">12 yrs</dt><dd>In business</dd></div>
            </>
          )}
        </dl>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container container--narrow">
          <SectionHeading center title="Our journey" rule />
          <ol className="timeline">
            {timeline.map((t) => (
              <li key={t.year}>
                <span className="timeline-year num">{t.year}</span>
                <div><h3>{t.title}</h3><p>{t.desc}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal as="section" className="section section--alt">
        <div className="container container--narrow">
          <figure className="pull">
            <blockquote>We never wanted to be the biggest supplier, just the one distributors trust to open every carton and find exactly what they ordered.</blockquote>
            <figcaption>Founder, Indian Temple Remy Hair Exports</figcaption>
          </figure>
        </div>
      </Reveal>
    </>
  );
}
