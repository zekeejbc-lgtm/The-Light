import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Article } from '../types';
import { getArticles } from '../services/contentService';
import Skeleton from '../components/Skeleton';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const data = await getArticles(slug);
      setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, [slug]);

  if (loading) {
     return (
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-16 w-1/3 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i}>
                   <Skeleton className="h-48 w-full mb-4" />
                   <Skeleton className="h-6 w-3/4 mb-2" variant="text" />
                   <Skeleton className="h-20 w-full" variant="text" />
                </div>
             ))}
          </div>
       </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="mb-16 text-center relative">
        <h1 className="text-5xl md:text-7xl font-serif font-black text-black dark:text-white uppercase tracking-tighter relative z-10 transition-colors">
          {slug?.replace('-', ' ')}
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-6 bg-brand-yellow/50 dark:bg-brand-yellow/20 -skew-y-2 transform z-0"></div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No articles found in this section yet.</p>
          <Link to="/" className="text-brand-cyan font-bold hover:underline mt-2 block">Return Home</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.slug}`} className="group block flex flex-col h-full">
               <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 mb-4 overflow-hidden rounded-md border-2 border-black dark:border-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all duration-200">
                 <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                 <div className="absolute top-2 right-2 bg-white dark:bg-black border border-black dark:border-white px-2 py-1 text-xs font-bold uppercase text-black dark:text-white">
                    {article.categorySlug}
                 </div>
               </div>
               <h2 className="text-2xl font-serif font-bold text-black dark:text-white mb-3 group-hover:text-brand-cyan transition-colors leading-tight">{article.title}</h2>
               <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm leading-relaxed flex-grow border-l-2 border-gray-200 dark:border-gray-700 pl-3">{article.excerpt}</p>
               <div className="mt-4 text-xs font-bold text-black dark:text-white uppercase tracking-widest group-hover:translate-x-2 transition-transform flex items-center">
                  Read Article 
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;