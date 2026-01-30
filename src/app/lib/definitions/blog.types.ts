export interface BlogPost {
  // Metadata
  title: string;
  slug: string;
  description: string; // Summary / Excerpt
  coverImage: string;
  // The content is now a flat list of blocks
  content: string;
  // Categorization
  tags?: string[];
  keywords?: string[]; // SEO keywords

  // Relations
  category?: string;
  subCategory?: string;
  // System
  isPublished: boolean;
  publishedAt?: Date;
}
