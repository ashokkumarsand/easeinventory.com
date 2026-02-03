import BlogCard from '@/components/blog/BlogCard';
import SimpleFooter from '@/components/landing/SimpleFooter';
import { getAllCategories, getAllPosts } from '@/lib/blog';
import { BookOpen, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog | EaseInventory - Tips, Updates & Industry Insights',
  description: 'Learn inventory management best practices, GST compliance tips, and get the latest updates from EaseInventory.',
  keywords: ['inventory management', 'GST billing', 'warehouse management', 'India retail', 'small business tips'],
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full" />
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BookOpen size={28} className="text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
              The <span className="text-primary italic">Antigravity</span> Blog
            </h1>
            <p className="text-lg md:text-xl font-bold text-foreground/50 italic">
              Tips, tutorials, and insights to make your business operations weightless.
            </p>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Link
                href="/blog"
                className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full font-black uppercase text-[10px] tracking-wider hover:bg-primary/20 transition-colors"
              >
                All Posts
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-full font-black uppercase text-[10px] tracking-wider hover:bg-primary/20 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 md:pb-32">
        <div className="container-custom">
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {posts.map((post, idx) => (
                <BlogCard
                  key={post.slug}
                  {...post}
                  featured={idx === 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles size={32} className="text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Content Coming Soon
                </h2>
                <p className="text-foreground/50 font-bold italic max-w-md mx-auto">
                  We&apos;re crafting valuable content for you. Check back soon for tips, tutorials, and industry insights.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-black uppercase text-sm tracking-wider rounded-full hover:bg-primary/90 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>

      <SimpleFooter />
    </div>
  );
}
