
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Article } from '../types';
import { getUserById } from '../services/authService';
import { getArticlesByAuthor } from '../services/contentService';
import Skeleton from '../components/Skeleton';

const AuthorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<User | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        if (!id) return;
        setLoading(true);
        const u = await getUserById(id);
        const a = await getArticlesByAuthor(id);
        setAuthor(u);
        setArticles(a.filter(art => art.status === 'published'));
        setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12"><Skeleton className="h-64 rounded-xl mb-8" /><Skeleton className="h-40 w-full" /></div>;

  if (!author) return <div className="p-12 text-center">Author not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-black dark:border-gray-600 mb-12">
            <div className="h-32 bg-brand-cyan relative"></div>
            <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200">
                    <img src={author.avatar || 'https://via.placeholder.com/150'} alt={author.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-black text-black dark:text-brand-yellow">{author.name}</h1>
                    <p className="text-brand-cyan font-bold uppercase tracking-widest text-sm">{author.role} • {author.specialization || 'Journalist'}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">{author.bio}</p>
                </div>
                <div className="flex gap-2">
                    {author.socialLinks?.twitter && (
                        <a 
                            href={`https://twitter.com/${author.socialLinks.twitter.replace('@', '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-brand-cyan hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                        </a>
                    )}
                </div>
            </div>
        </div>

        <h2 className="text-2xl font-serif font-black border-b-4 border-brand-yellow inline-block mb-8 dark:text-white">Published Stories ({articles.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
                 <Link key={article.id} to={`/article/${article.slug}`} className="group block h-full">
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 mb-4 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-white dark:bg-black text-[10px] font-bold px-2 py-1 rounded uppercase">
                            {article.categorySlug}
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2 group-hover:text-brand-cyan transition-colors">{article.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 font-medium">
                        {new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                </Link>
            ))}
        </div>
    </div>
  );
};

export default AuthorProfile;
