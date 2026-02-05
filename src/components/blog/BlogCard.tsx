'use client';

import { Logo } from '@/components/icons/Logo';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  image?: string;
  readingTime: string;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({
  slug,
  title,
  description,
  date,
  author,
  category,
  image,
  readingTime,
  featured = false,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group ${featured ? 'md:col-span-2' : ''}`}
    >
      <Link href={`/blog/${slug}`}>
        <div className={`
          relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]
          bg-white/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5
          hover:border-primary/30 transition-all duration-500
          ${featured ? 'aspect-[2/1]' : 'aspect-[4/3]'}
        `}>
          {/* Image or Placeholder */}
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <Logo size={featured ? 80 : 48} className="opacity-20" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6">
            <Badge
              variant="secondary"
              className="font-black uppercase text-[10px] tracking-wider"
            >
              {category}
            </Badge>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 space-y-3">
            <h3 className={`
              font-black uppercase tracking-tight text-white leading-tight
              ${featured ? 'text-2xl md:text-4xl' : 'text-lg md:text-xl'}
            `}>
              {title}
            </h3>
            
            <p className={`
              font-medium text-white/60 line-clamp-2
              ${featured ? 'text-base md:text-lg' : 'text-sm'}
            `}>
              {description}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/40 text-xs font-bold">
              <span className="flex items-center gap-1">
                <User size={12} />
                {author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {readingTime}
              </span>
            </div>

            {/* Read More */}
            <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Read Article
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;
