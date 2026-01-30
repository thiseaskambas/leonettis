// ====================================
// ArticleRenderer - Server Component
// ====================================
import Image from 'next/image';
import type { ReactNode } from 'react';

import type {
  BaseBlock,
  CodeBlock,
  ContentBlock,
  HeadingBlock,
  ImageBlock,
  ImageMetadata,
  InlineContent,
  ListBlock,
  Mark,
  QuoteBlock,
  TableBlock,
  TextBlock,
  TextSpan,
  YouTubeBlock,
} from '../lib/definitions/articles.types';

// ============ INLINE CONTENT RENDERER ============
interface InlineRendererProps {
  content: InlineContent;
  markDefs: Mark[];
}

function InlineRenderer({ content, markDefs }: InlineRendererProps) {
  const markDefsById = new Map(markDefs.map((m) => [m.id, m]));

  return (
    <>
      {content.map((span, index) => (
        <SpanRenderer key={index} span={span} markDefsById={markDefsById} />
      ))}
    </>
  );
}

interface SpanRendererProps {
  span: TextSpan;
  markDefsById: Map<string, Mark>;
}

function SpanRenderer({ span, markDefsById }: SpanRendererProps) {
  if (!span.text) return null;

  let element: ReactNode = span.text;

  // Process marks from innermost to outermost
  const marks = span.marks || [];

  for (const mark of marks) {
    // Check if it's a simple inline mark
    switch (mark) {
      case 'bold':
        element = <strong>{element}</strong>;
        continue;
      case 'italic':
        element = <em>{element}</em>;
        continue;
      case 'underline':
        element = <u>{element}</u>;
        continue;
      case 'strike':
        element = <s>{element}</s>;
        continue;
      case 'code':
        element = <code className="inline-code">{element}</code>;
        continue;
      case 'superscript':
        element = <sup>{element}</sup>;
        continue;
    }

    // Check if it's a mark definition (link, footnote, tooltip)
    const markDef = markDefsById.get(mark);
    if (markDef) {
      switch (markDef.type) {
        case 'link':
          element = (
            <a
              href={markDef.href}
              target={markDef.target}
              rel={
                markDef.rel ||
                (markDef.target === '_blank'
                  ? 'noopener noreferrer'
                  : undefined)
              }>
              {element}
            </a>
          );
          break;
        case 'footnote':
          element = (
            <span className="footnote-ref" title={markDef.content}>
              {element}
            </span>
          );
          break;
        case 'tooltip':
          element = (
            <span className="tooltip" title={markDef.content}>
              {element}
            </span>
          );
          break;
      }
    }
  }

  return <>{element}</>;
}

// ============ BLOCK RENDERERS ============

function HeadingRenderer({ block }: { block: HeadingBlock }) {
  const Tag = `h${block.level}` as keyof React.JSX.IntrinsicElements;
  return (
    <Tag id={block.slug}>
      <InlineRenderer content={block.content} markDefs={block.markDefs} />
    </Tag>
  );
}

function ParagraphRenderer({ block }: { block: TextBlock }) {
  return (
    <p>
      <InlineRenderer content={block.content} markDefs={block.markDefs} />
    </p>
  );
}

function ListRenderer({ block }: { block: ListBlock }) {
  const Tag = block.format === 'ordered' ? 'ol' : 'ul';

  // Group items by depth to create nested structure
  const renderItems = (
    items: typeof block.items,
    currentDepth = 0
  ): ReactNode => {
    const result: ReactNode[] = [];
    let i = 0;

    while (i < items.length) {
      const item = items[i];

      if (item.depth === currentDepth) {
        // Find nested items
        const nestedItems: typeof block.items = [];
        let j = i + 1;
        while (j < items.length && items[j].depth > currentDepth) {
          nestedItems.push(items[j]);
          j++;
        }

        result.push(
          <li key={item.id}>
            <InlineRenderer content={item.content} markDefs={block.markDefs} />
            {nestedItems.length > 0 && (
              <Tag>{renderItems(nestedItems, currentDepth + 1)}</Tag>
            )}
          </li>
        );

        i = j;
      } else {
        i++;
      }
    }

    return result;
  };

  return <Tag>{renderItems(block.items)}</Tag>;
}

function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <table>
      {block.headers && block.headers.length > 0 && (
        <thead>
          <tr>
            {block.headers.map((header, i) => (
              <th key={i}>
                <InlineRenderer content={header} markDefs={block.markDefs} />
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {block.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.cells.map((cell, cellIndex) => (
              <td key={cellIndex}>
                <InlineRenderer content={cell} markDefs={block.markDefs} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ImageRenderer({
  block,
  images,
}: {
  block: ImageBlock;
  images: Record<string, ImageMetadata>;
}) {
  const imageData = images[block.imageId];

  if (!imageData) {
    return <div className="image-placeholder">Image not found</div>;
  }

  if (imageData.status === 'pending' || imageData.status === 'processing') {
    return (
      <figure className="image-loading">
        <div className="image-skeleton" style={{ aspectRatio: '16/9' }}>
          Generating image...
        </div>
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    );
  }

  if (imageData.status === 'failed') {
    return (
      <figure className="image-failed">
        <div className="image-error">Failed to generate image</div>
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure>
      <Image
        src={imageData.url || ''}
        alt={block.alt}
        width={block.width || 300}
        height={block.height || 300}
      />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

function CodeRenderer({ block }: { block: CodeBlock }) {
  return (
    <pre>
      <code
        className={block.language ? `language-${block.language}` : undefined}>
        {block.code}
      </code>
    </pre>
  );
}

function QuoteRenderer({ block }: { block: QuoteBlock }) {
  return (
    <blockquote cite={block.cite}>
      <InlineRenderer content={block.content} markDefs={block.markDefs} />
      {block.author && <footer>— {block.author}</footer>}
    </blockquote>
  );
}

function YouTubeRenderer({ block }: { block: YouTubeBlock }) {
  return (
    <figure className="youtube-embed">
      <iframe
        src={`https://www.youtube.com/embed/${block.videoId}`}
        title={block.alt || 'YouTube video'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

function DividerRenderer() {
  return <hr />;
}

// ============ MAIN BLOCK RENDERER ============

function BlockRenderer({
  block,
  images,
}: {
  block: ContentBlock;
  images: Record<string, ImageMetadata>;
}) {
  switch (block.type) {
    case 'heading':
      return <HeadingRenderer block={block} />;
    case 'paragraph':
      return <ParagraphRenderer block={block} />;
    case 'list':
      return <ListRenderer block={block} />;
    case 'table':
      return <TableRenderer block={block} />;
    case 'image':
      return <ImageRenderer block={block} images={images} />;
    case 'code':
      return <CodeRenderer block={block} />;
    case 'quote':
      return <QuoteRenderer block={block} />;
    case 'youtube':
      return <YouTubeRenderer block={block} />;
    case 'divider':
      return <DividerRenderer />;
    default:
      console.warn('Unknown block type:', (block as BaseBlock).type);
      return null;
  }
}

// ============ MAIN COMPONENT ============

export interface ArticleRendererProps {
  content: ContentBlock[];
  images: Record<string, ImageMetadata>;
  className?: string;
}

export function ArticleRenderer({
  content,
  images,
  className,
}: ArticleRendererProps) {
  return (
    <article className={className}>
      {content.map((block) => (
        <BlockRenderer key={block.id} block={block} images={images} />
      ))}
    </article>
  );
}
