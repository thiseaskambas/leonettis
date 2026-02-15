import { blogpostsData } from '@/app/lib/mock-data/blogposts-data';
import { ArticleRenderer } from '@/app/ui/ArticlesRenderer';

export default function Blog() {
  return (
    <main className="dark:bg-tiff-gray-950 mt-40 min-h-screen p-5 md:p-10">
      <h1>Blog</h1>
      <ArticleRenderer
        title={blogpostsData[0].data.article.title}
        content={blogpostsData[0].data.article.content}
        images={blogpostsData[0].data.images}
      />
    </main>
  );
}
