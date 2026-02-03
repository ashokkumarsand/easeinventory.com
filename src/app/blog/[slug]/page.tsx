import SimpleFooter from '@/components/landing/SimpleFooter';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { ArrowLeft, Calendar, Clock, Share2, User } from 'lucide-react';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return { title: 'Article Not Found' };
  }

  return {
    title: `${post.title} | EaseInventory Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

// MDX Components for styling
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mt-8 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-8 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl md:text-2xl font-bold mt-6 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-lg leading-relaxed mb-4 text-foreground/80" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/80" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground/80" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-lg leading-relaxed" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary pl-6 py-2 my-6 italic text-foreground/70 bg-primary/5 rounded-r-xl" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-foreground/10 px-2 py-1 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-foreground/5 p-4 rounded-xl overflow-x-auto mb-4 text-sm" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary font-bold hover:underline" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-black" {...props} />
  ),
};

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden border-b border-foreground/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        </div>

        <div className="container-custom relative z-10 max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-foreground/50 font-bold text-sm uppercase tracking-wider hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          {/* Category */}
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full font-black uppercase text-[10px] tracking-wider mb-4">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl font-bold text-foreground/50 italic mb-8">
            {post.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-foreground/40 text-sm font-bold">
            <span className="flex items-center gap-2">
              <User size={16} />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              {formattedDate}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} />
              {post.readingTime}
            </span>
            <button className="flex items-center gap-2 hover:text-primary transition-colors">
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 md:py-20">
        <div className="container-custom max-w-4xl mx-auto prose-custom">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>
      </article>

      <SimpleFooter />
    </div>
  );
}
