import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.coerce.date(),
    readTime: z.string(),
    category: z.enum(['rybarina', 'stripky', 'nazory']),
    coverImage: z.string().url(),
    draft: z.boolean().default(false)
  })
});

export const collections = {
  posts
};
