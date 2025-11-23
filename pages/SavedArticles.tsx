
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { getBookmarkedArticles } from '../services/contentService';
import Skeleton from '../components/Skeleton';

const SavedArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      setLoading(true);
      const saved = JSON.parse(localStorage.getItem('the_light_bookmarks') || '[]');
      if (saved.length > 0) {
        const data = await getBookmarkedArticles(saved);
        setArticles(data);
      }
      setLoading(false);
    };
    loadSaved();
  }, []);

  const handleRemove = (slug: string) => {
    const saved = JSON.parse(localStorage.getItem('the_light_bookmarks') || '[]');
    const newSaved = saved.filter((s: string) => s !== slug);
    localStorage.setItem('the_light_bookmarks', JSON.stringify(newSaved));
    setArticles(articles.filter(a => a.slug !== slug));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
       <div className="flex items-center space-x-3 mb-8">
         <div className="bg-black dark:bg-white p-2 rounded-full">
            <svg className="w-6 h-6 text-white dark:text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
         </div>
         <h1 className="text-3xl md:text-4xl font-serif font-black text-black dark:text-white uppercase">Reading List</h1>
       </div>

       {loading ? (
         <div className="space-y-4">
            {[1,2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
         </div>
       ) : articles.length === 0 ? (
         <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
           <p className="text-xl font-serif font-bold text-gray-400 mb-2">Your reading list is empty.</p>
           <Link to="/" className="text-brand-cyan font-bold hover:underline">Explore articles to save</Link>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {articles.map(article => (
             <div key={article.id} className="flex flex-col md:flex-row bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all">
                <div className="md:w-1/3 h-48 md:h-auto">
                   <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                   <div>
                     <Link to={`/article/${article.slug}`}>
                        <h3 className="text-xl font-serif font-bold text-black dark:text-white mb-2 leading-tight hover:underline">{article.title}</h3>
                     </Link>
                     <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{article.excerpt}</p>
                   </div>
                   <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold text-brand-cyan uppercase">{article.categorySlug}</span>
                      <button onClick={() => handleRemove(article.slug)} className="text-red-500 text-xs font-bold uppercase hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors">
                        Remove
                      </button>
                   </div>
                </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
};

export default SavedArticles;
