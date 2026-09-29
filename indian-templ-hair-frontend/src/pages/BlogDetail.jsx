import { useParams, Navigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import SectionHeading from '../components/SectionHeading';
import { BlockSkeleton, LineSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { useBlog, useBlogs } from '../hooks/useStoreData';
import { resolveImageUrl } from '../lib/api';
import NewsletterForm from '../components/NewsletterForm';
import { BlogCard } from './BlogList';

export default function BlogDetail() {
  const { id } = useParams();
  const { blog: post, loading, error, refetch } = useBlog(id);
  const { blogs } = useBlogs();

  if (loading) {
    return (
      <div className="section">
        <div className="container container--narrow">
          <BlockSkeleton height={340} />
          <div style={{ marginTop: 24 }}><LineSkeleton width="70%" height={22} /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="container"><ErrorState message="This article could not be loaded." onRetry={refetch} /></div>
      </div>
    );
  }

  if (!post) return <Navigate to="/404" replace />;

  const related = blogs.filter((b) => b.id !== id).slice(0, 3);

  return (
    <>
      <PageHeader crumbs={[{ label: 'Journal', to: '/journal' }, { label: post.title }]} title={post.title} lede={[post.cat, post.date].filter(Boolean).join(', ')} />
      <div className="section">
        <div className="container container--narrow">
          <PhotoBlock tone="gold" ratio="21/9" rounded={4} src={resolveImageUrl(post.img)} alt={post.title} />
          <article className="prose prose--article">
            {post.content ? (
              post.content.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <>
                <p>{post.excerpt}</p>
                <p>At our New Delhi facility, every claim we make about our hair is something our own QC team checks by hand before a bundle ever reaches a customer.</p>
              </>
            )}
          </article>
        </div>

        {related.length > 0 && (
          <div className="container blog-related">
            <SectionHeading title="Related articles" />
            <div className="bgrid">{related.map((b) => <BlogCard key={b.id} post={b} />)}</div>
          </div>
        )}
      </div>

      <section className="news">
        <div className="container news-inner">
          <h2>Get new articles first</h2>
          <p>Hair care guides and wholesale advice, straight to your inbox.</p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
