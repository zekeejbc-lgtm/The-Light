
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { getArticles, subscribeToNewsletter } from '../services/contentService';
import Skeleton from '../components/Skeleton';
import PollWidget from '../components/PollWidget';
import { useToast } from '../context/ToastContext';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const data = await getArticles();
      setArticles(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
      addToast("Subscribing...", "loading");
      await subscribeToNewsletter(email);
      addToast("Subscribed successfully!", "success");
      setEmail('');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <Skeleton className="w-full h-[400px] md:h-[500px] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-3/4 h-6" variant="text" />
              <Skeleton className="w-full h-20" variant="text" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Logic: Find the most recent article marked as "Featured"
  // If no article is featured, fallback to the very first article.
  const featured = articles.find(a => a.isFeatured) || articles[0];
  
  // The rest of the feed should exclude the featured article to avoid duplication
  const feed = articles.filter(a => a.id !== featured?.id);
  const recent = feed.slice(0, 4); // Show top 4 recent non-featured
  const trending = [...articles].sort((a,b) => b.views - a.views).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Hero Section */}
      {featured && (
        <div className="mb-12">
          <Link to={`/article/${featured.slug}`} className="group block">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden border-2 border-black dark:border-gray-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              <img 
                src={featured.imageUrl} 
                alt={featured.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 md:p-10 flex flex-col justify-end">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex gap-2 mb-3">
                      <span className="inline-block px-3 py-1 bg-brand-yellow text-black text-xs font-bold uppercase tracking-wider rounded-sm border border-black">
                        {featured.categorySlug}
                      </span>
                      {featured.isFeatured && (
                          <span className="inline-block px-3 py-1 bg-brand-cyan text-white text-xs font-bold uppercase tracking-wider rounded-sm border border-black">
                              Featured
                          </span>
                      )}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3 leading-tight group-hover:text-brand-cyan transition-colors drop-shadow-lg">
                    {featured.title}
                  </h1>
                  <p className="text-gray-200 text-lg line-clamp-2 max-w-3xl font-medium drop-shadow-md hidden md:block">
                    {featured.excerpt}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3">
          <div className="border-t-4 border-black dark:border-white mb-8 transition-colors"></div>
          <h2 className="text-3xl font-serif font-black text-black dark:text-white mb-8 flex items-center">
            <span className="bg-brand-cyan text-white px-2 py-1 mr-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] text-sm align-middle tracking-widest">LATEST</span> STORIES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recent.map((article) => (
              <Link key={article.id} to={`/article/${article.slug}`} className="group flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-48 rounded-lg overflow-hidden border-2 border-black dark:border-gray-500 mb-4 shadow-[4px_4px_0px_0px_#FFEB3B] group-hover:shadow-[6px_6px_0px_0px_#00BCD4] transition-all">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center space-x-2 mb-2">
                     <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-black dark:border-gray-600 text-[10px] font-bold text-brand-black dark:text-gray-300 uppercase tracking-wide">{article.categorySlug}</span>
                     <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-black dark:text-white mb-2 group-hover:underline decoration-brand-yellow decoration-4 underline-offset-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 flex-grow leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="w-6 h-6 rounded-full bg-brand-black dark:bg-white text-brand-yellow dark:text-black flex items-center justify-center text-xs font-bold border border-black dark:border-gray-400">
                        {article.authorName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wide">By {article.authorName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white dark:bg-brand-dark p-6 border-2 border-black dark:border-gray-600 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]">
               <h3 className="font-serif font-black text-xl mb-4 uppercase flex items-center gap-2 dark:text-white">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Trending Now
               </h3>
               <div className="space-y-4">
                  {trending.map((t, idx) => (
                      <Link key={t.id} to={`/article/${t.slug}`} className="block group">
                          <div className="flex gap-3">
                              <div className="font-black text-3xl text-gray-200 dark:text-gray-700 leading-none group-hover:text-brand-cyan transition-colors">0{idx + 1}</div>
                              <div>
                                  <h4 className="font-bold text-sm leading-tight text-black dark:text-gray-200 group-hover:underline">{t.title}</h4>
                                  <span className="text-[10px] text-gray-400 uppercase font-bold mt-1 block">{t.views} Reads</span>
                              </div>
                          </div>
                      </Link>
                  ))}
               </div>
           </div>

           <PollWidget />

           {/* Newsletter */}
           <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700">
              <h3 className="font-serif font-black text-lg mb-2 dark:text-white uppercase">The Weekly Digest</h3>
              <p className="text-xs text-gray-500 mb-4">Get the best stories delivered to your inbox.</p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full p-2 text-sm border-2 border-gray-300 rounded focus:border-black outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required 
                />
                <button type="submit" className="w-full bg-brand-cyan text-white text-xs font-bold uppercase py-2 rounded border-2 border-transparent hover:bg-cyan-600">Subscribe</button>
              </form>
           </div>
           
           {/* Ad / Promo Block */}
           <div className="bg-brand-yellow p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl text-center">
              <h3 className="font-serif font-black text-2xl mb-2 text-black">Join The Light!</h3>
              <p className="text-sm font-medium mb-4 text-gray-800">We are looking for writers, artists, and photographers.</p>
              <Link to="/login" className="inline-block bg-black text-white px-4 py-2 font-bold uppercase text-xs tracking-widest hover:bg-gray-800 rounded">Apply Now</Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
