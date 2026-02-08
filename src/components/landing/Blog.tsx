'use client';

import { Logo } from '@/components/icons/Logo';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  image?: string;
  readingTime: string;
}

interface BlogProps {
  posts: BlogPostMeta[];
}

const Blog: React.FC<BlogProps> = ({ posts }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (posts.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="blog-heading"
    >
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              From the Blog
            </span>
          </div>
          <h2
            id="blog-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[800px] mx-auto"
          >
            Latest from the
            <span className="gradient-text block">Antigravity Blog.</span>
          </h2>
          <p className="text-foreground/50 text-lg max-w-xl mx-auto">
            Tips, tutorials, and feature spotlights to help you run a more efficient business.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => {
            const formattedDate = new Date(post.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group feature-card flex flex-col transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Image / Placeholder */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-foreground/[0.02] border border-foreground/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Logo size={40} className="opacity-20" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className="font-black uppercase text-[10px] tracking-wider"
                    >
                      {post.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-black tracking-tight leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-foreground/50 line-clamp-2 mb-4 flex-1">
                    {post.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-foreground/40 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <User size={12} aria-hidden="true" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} aria-hidden="true" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} aria-hidden="true" />
                      {post.readingTime}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground/5 border border-foreground/10 rounded-full font-black uppercase text-sm tracking-wider hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all"
          >
            View All Posts
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
