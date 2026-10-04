import { useParams, Navigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import SectionHeading from '../components/SectionHeading';
import Container from '../components/Container';
import Section from '../components/Section';
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
      <Section>
        <Container narrow>
          <BlockSkeleton height={340} />
          <div className="mt-6"><LineSkeleton width="70%" height={22} /></div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Container><ErrorState message="This article could not be loaded." onRetry={refetch} /></Container>
      </Section>
    );
  }

  if (!post) return <Navigate to="/404" replace />;

  const related = blogs.filter((b) => b.id !== id).slice(0, 3);
  const words = (post.content || post.excerpt || '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <>
      <PageHeader crumbs={[{ label: 'Journal', to: '/journal' }, { label: post.title }]} title={post.title} lede={[post.cat, post.date, `${minutes} min read`].filter(Boolean).join(', ')} />
      <Section>
        <Container narrow>
          <PhotoBlock tone="gold" ratio="21/9" rounded={8} src={resolveImageUrl(post.img)} alt={post.title} />
          <article className="mt-9 grid gap-4 text-[1.05rem] leading-[1.8] text-ink">
            {post.content ? (
              post.content.split('\n\n').map((para, i) => <p key={i} className="max-w-none">{para}</p>)
            ) : (
              post.excerpt && <p className="max-w-none">{post.excerpt}</p>
            )}
          </article>
        </Container>

        {related.length > 0 && (
          <Container className="mt-16">
            <SectionHeading title="Related articles" rule />
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{related.map((b) => <BlogCard key={b.id} post={b} />)}</div>
          </Container>
        )}
      </Section>

      <section className="on-dark bg-espresso text-cream">
        <Container className="flex flex-col items-center py-14 text-center sm:py-20">
          <h2 className="text-[clamp(1.7rem,3vw,2.5rem)] text-cream">Get new articles first</h2>
          <p className="mx-auto mb-[30px] mt-3 text-cream/70">Hair care guides and wholesale advice, straight to your inbox.</p>
          <div className="w-[min(100%,520px)]"><NewsletterForm /></div>
        </Container>
      </section>
    </>
  );
}
