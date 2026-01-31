export type InlineMarkType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'superscript';

export interface LinkMark {
  id: string;
  type: 'link';
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
}

export interface FootnoteMark {
  id: string;
  type: 'footnote';
  content: string;
}

export interface TooltipMark {
  id: string;
  type: 'tooltip';
  content: string;
}

export type Mark = LinkMark | FootnoteMark | TooltipMark;

export interface TextSpan {
  type: 'text';
  text: string;
  marks?: string[]; // Mix of mark IDs (for link/footnote/tooltip) and mark types (bold, italic, etc.)
}

export type InlineContent = TextSpan[];

// Base block interface
export interface BaseBlock {
  id: string;
  type: string;
  markDefs: Mark[];
  meta?: Record<string, unknown>;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: InlineContent;
  slug?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'paragraph';
  content: InlineContent;
}

export interface ListItem {
  id: string;
  content: InlineContent;
  depth: number;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  format: 'ordered' | 'unordered';
  items: ListItem[];
}

export interface TableRow {
  cells: InlineContent[];
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers?: InlineContent[];
  rows: TableRow[];
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  imageId: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language?: string;
  code: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: InlineContent;
  author?: string;
  cite?: string;
}

export interface YouTubeBlock extends BaseBlock {
  type: 'youtube';
  videoId: string;
  videoUrl?: string;
  alt?: string;
  caption?: string;
}

export type ContentBlock =
  | HeadingBlock
  | TextBlock
  | ListBlock
  | TableBlock
  | ImageBlock
  | CodeBlock
  | DividerBlock
  | QuoteBlock
  | YouTubeBlock;

// API Response types
export interface ImageMetadata {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  prompt?: string;
}

export interface ArticleApiResponse {
  status: 'success';
  data: {
    article: {
      _id: string;
      title: string;
      slug: string;
      description: string;
      content: ContentBlock[];
      tags?: string[];
      keywords?: string[];
      websiteId?: string;
      categoryId?: string;
      audienceIds?: string[];
      authorId?: string;
      organization?: string;
      aiGenerated?: boolean;
      status?: string;
      hasGeneratedImages?: boolean;
      pendingImageCount?: number;
      createdAt?: string;
      updatedAt?: string;
      __v?: number;
      schemaVersion?: number;
      id?: string;
    };
    images: Record<string, ImageMetadata>;
  };
}
