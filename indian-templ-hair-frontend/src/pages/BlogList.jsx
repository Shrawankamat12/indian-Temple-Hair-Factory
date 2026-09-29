import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { ProductGridSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateBlocks';
import { useBlogs } from '../hooks/useStoreData';
import { resolveImageUrl } from '../lib/api';

const cats = ['All', 'Hair Care', 'Education', 'Wholesale', 'Company'];

export function BlogCard({ post }) {
  const img = resolveImageUrl(post.img);
  return (
    <Link to={`/journal/${post.id}`} className="bcard">
      <span className="bcard-media">{img && <img src={img} alt="" loading="lazy" />}</span>
      <span className="bcard-body">
        <span className="bcard-meta">{[post.cat, post.date].filter(Boolean).join(', ')}</span>
        <h3>{post.title}</h3>
        {post.excerpt && <p>{post.excerpt}</p>}
        <span className="link-u bcard-more">Read article</span>
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
      <div className="section section--tight">
        <div className="container">
          <div className="chip-row blog-filter" role="group" aria-label="Filter articles">
            {cats.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : error ? (
            <ErrorState message="Could not load the journal right now." onRetry={refetch} />
          ) : blogs.length === 0 ? (
            <EmptyState title="No posts in this category yet." />
          ) : (
            <div className="bgrid">
              {blogs.map((b) => <BlogCard key={b.id} post={b} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
