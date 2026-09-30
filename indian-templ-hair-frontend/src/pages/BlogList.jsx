import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Container from '../components/Container';
import Section from '../components/Section';
import { ProductGridSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateBlocks';
import { useBlogs } from '../hooks/useStoreData';
import { resolveImageUrl } from '../lib/api';
import { chip, cx, linkU } from '../lib/ui';

const cats = ['All', 'Hair Care', 'Education', 'Wholesale', 'Company'];

export function BlogCard({ post }) {
  const img = resolveImageUrl(post.img);
  return (
    <Link to={`/journal/${post.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition duration-300 hover:border-gold hover:shadow-pop">
      <span className="block aspect-[16/10] overflow-hidden bg-sand">
        {img && <img src={img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[800ms] ease-soft group-hover:scale-105" />}
      </span>
      <span className="flex flex-1 flex-col gap-2 px-[22px] pb-6 pt-5">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-walnut">{[post.cat, post.date].filter(Boolean).join(', ')}</span>
        <h3 className="text-[1.2rem] leading-snug">{post.title}</h3>
        {post.excerpt && <p className="m-0 line-clamp-3 text-[0.88rem] text-muted">{post.excerpt}</p>}
        <span className={cx(linkU, 'mt-auto self-start pt-1.5')}>Read article</span>
      </span>
    </Link>
  );
}

export default function BlogList() {
  const [cat, setCat] = useState('All');
  const { blogs, loading, error, refetch } = useBlogs(cat === 'All' ? undefined : cat);

  return (
    <>
      <PageHeader crumbs={[{ label: 'Journal' }]} title="The Journal" lede="Hair care guides, wholesale advice and stories from our Delhi factory floor." />
      <Section tight>
        <Container>
          <div className="mb-9 flex flex-wrap gap-2" role="group" aria-label="Filter articles">
            {cats.map((c) => (
              <button key={c} type="button" className={chip} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : error ? (
            <ErrorState message="Could not load the journal right now." onRetry={refetch} />
          ) : blogs.length === 0 ? (
            <EmptyState title="No posts in this category yet." />
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b) => <BlogCard key={b.id} post={b} />)}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
