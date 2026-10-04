import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import BadgeIcon from '../components/BadgeIcon';
import { FiCheck } from 'react-icons/fi';
import { useSiteContent } from '../hooks/useStoreData';
import Container from '../components/Container';
import Section from '../components/Section';
import { cx, eyebrow } from '../lib/ui';
import { imageOr } from '../lib/media';

export default function About() {
  const { siteContent } = useSiteContent();
  const features = (siteContent?.whyChooseUs?.items || []).slice(0, 4);
  // Everything below is edited in Admin → Website Content → About Page (stats fall back to Hero stats).
  const about = siteContent?.aboutPage || {};
  const story = (about.story || []).filter(Boolean);
  const values = (about.values || []).filter(Boolean);
  const timeline = (about.timeline || []).filter((t) => t?.year || t?.title);
  const statList = (about.stats?.length ? about.stats : siteContent?.hero?.stats || []).filter((st) => st?.value && st?.label);
  const storyPhoto = imageOr(about.image);
  return (
    <>
      <PageHeader crumbs={[{ label: 'About' }]} title={about.heading || 'About us'} lede={about.lede} tall />

      {features.length > 0 && (
        <Section tight>
          <Container>
            <ul className="m-0 grid list-none grid-cols-2 gap-3.5 p-0 lg:grid-cols-4">
              {features.map((it) => (
                <li key={it.title} className="flex flex-col items-start gap-1.5 rounded-lg border border-line bg-white p-[18px] text-[0.84rem] text-muted">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-sand text-brand"><BadgeIcon label={`${it.title} ${it.description || ''}`} size={22} /></span>
                  <strong className="text-[0.92rem] text-espresso">{it.title}</strong>
                  {it.description && <span>{it.description}</span>}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {(story.length > 0 || storyPhoto) && (
        <Reveal as="section" className="py-14 sm:py-20 lg:py-24">
          <Container className={cx('grid items-center gap-[clamp(32px,6vw,80px)]', storyPhoto && 'md:grid-cols-[.9fr_1.1fr]')}>
            {storyPhoto && (
              <div className="aspect-[4/5] overflow-hidden rounded-t-full [&>div]:h-full">
                <PhotoBlock tone="brown" ratio="4/5" src={storyPhoto} alt={about.storyHeading || 'Our story'} />
              </div>
            )}
            <div className="max-w-[64ch]">
              {about.storyEyebrow && <p className={cx(eyebrow, 'mb-2.5')}>{about.storyEyebrow}</p>}
              {about.storyHeading && <h2 className="mb-4 text-[clamp(1.7rem,3vw,2.5rem)]">{about.storyHeading}</h2>}
              <div className="grid gap-4 text-ink">
                {story.map((para) => <p key={para}>{para}</p>)}
              </div>
              {values.length > 0 && (
                <ul className="m-0 mt-6 grid list-none gap-2.5 p-0 sm:grid-cols-2">
                  {values.map((v) => (
                    <li key={v} className="flex items-start gap-2.5 text-[0.9rem] text-espresso"><FiCheck size={16} className="mt-1 flex-none text-brand" aria-hidden="true" />{v}</li>
                  ))}
                </ul>
              )}
              <div className="mt-[26px] flex flex-wrap gap-3"><Button to="/shop">Shop the collection</Button><Button to="/factory" variant="outline">See our process</Button></div>
            </div>
          </Container>
        </Reveal>
      )}

      {statList.length > 0 && <Reveal as="section" className="on-dark bg-espresso py-10 text-cream">
        <Container>
          <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-5 md:grid-cols-4">
            {statList.map((st) => (
              <div key={st.label} className="text-center">
                <dt className="font-display text-[clamp(1.7rem,3vw,2.4rem)] tabular-nums text-champagne">{st.value}</dt>
                <dd className="m-0 mt-1 text-[0.8rem] tracking-[0.04em] text-cream/70">{st.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Reveal>}

      {timeline.length > 0 && <Reveal as="section" className="py-14 sm:py-20 lg:py-24">
        <Container narrow>
          <SectionHeading center title="Our journey" rule />
          <ol className="relative m-0 list-none p-0 before:absolute before:bottom-1.5 before:left-2 before:top-1.5 before:w-px before:bg-line before:content-[''] sm:before:left-[102px]">
            {timeline.map((t) => (
              <li key={t.year} className="relative grid grid-cols-[16px_1fr] gap-3.5 py-[22px] after:absolute after:left-[3px] after:top-6 after:size-2.5 after:rounded-full after:border-2 after:border-cream after:bg-gold after:shadow-[0_0_0_1px_var(--color-gold)] after:content-[''] sm:grid-cols-[92px_1fr] sm:gap-5 sm:after:left-[97px] sm:after:top-[30px]">
                <span className="font-display text-[0px] tabular-nums text-walnut sm:text-[1.3rem]">{t.year}</span>
                <div>
                  <span className="mb-1 block font-display text-[1.1rem] tabular-nums text-walnut sm:hidden">{t.year}</span>
                  <h3 className="mb-1.5 text-[1.1rem]">{t.title}</h3>
                  <p className="text-[0.93rem] text-muted">{t.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Reveal>}

      {about.quote && (
        <Reveal as="section" className="bg-sand py-14 sm:py-20 lg:py-24">
          <Container narrow>
            <figure className="m-0 text-center">
              <blockquote className="m-0 font-display text-[clamp(1.4rem,3vw,2rem)] leading-[1.45] text-espresso before:text-gold before:content-['“'] after:text-gold after:content-['”']">{about.quote}</blockquote>
              {about.quoteAuthor && <figcaption className="mt-[18px] text-[0.9rem] font-semibold tracking-[0.04em] text-walnut">{about.quoteAuthor}</figcaption>}
            </figure>
          </Container>
        </Reveal>
      )}

      <Section tight>
        <Container>
          <div className="on-dark flex flex-col items-start justify-between gap-6 rounded-3xl bg-[linear-gradient(120deg,#1e1410,#3a2618)] p-[clamp(28px,5vw,56px)] text-cream md:flex-row md:items-center">
            <div>
              <h2 className="text-[clamp(1.5rem,2.8vw,2.2rem)] text-cream">Ready to work with us?</h2>
              <p className="mt-2 max-w-[48ch] text-cream/70">Retail pieces for you, or bulk supply for your salon, brand or distribution business.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button to="/shop" size="lg">Shop now</Button>
              <Button to="/wholesale" variant="light" size="lg">Wholesale enquiry</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
