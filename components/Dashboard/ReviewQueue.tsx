
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { getPendingArticles, updateArticleStatus } from '../../services/contentService';

const ReviewQueue: React.FC = () => {
  const [pending, setPending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await getPendingArticles();
    setPending(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id: string, status: 'published' | 'rejected') => {
    await updateArticleStatus(id, status, feedback);
    setFeedback('');
    setActionId(null);
    load();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading review queue...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center border-b-2 border-black dark:border-white pb-4">
         <h3 className="text-2xl font-serif font-black dark:text-white uppercase">Editorial Queue</h3>
         <span className="bg-brand-yellow text-black font-bold px-3 py-1 rounded-full text-sm border border-black">{pending.length} Pending</span>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No articles waiting for review.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pending.map(article => (
            <div key={article.id} className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-2">
                  <div>
                     <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">{article.categorySlug}</span>
                     <h4 className="text-xl font-bold text-black dark:text-white mt-1">{article.title}</h4>
                     <p className="text-sm text-gray-500 dark:text-gray-400">By {article.authorName} • Submitted {new Date(article.publishedAt).toLocaleDateString()}</p>
                  </div>
                  <Link to={`/article/${article.slug}`} className="text-sm font-bold text-blue-600 hover:underline flex items-center">
                    Preview
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </Link>
               </div>
               
               <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">{article.excerpt}</p>

               {actionId === article.id ? (
                 <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600 animate-fade-in-down">
                    <label className="block text-sm font-bold mb-1 dark:text-gray-300">Feedback / Reason (Optional)</label>
                    <textarea 
                      className="w-full p-2 border rounded mb-3 text-sm dark:bg-brand-dark dark:text-white dark:border-gray-600" 
                      rows={2} 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)} 
                      placeholder="Great work! / Needs more sources..."
                    />
                    <div className="flex space-x-2 justify-end">
                       <button onClick={() => setActionId(null)} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 font-bold">Cancel</button>
                       <button onClick={() => handleAction(article.id, 'rejected')} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700">Confirm Reject</button>
                       <button onClick={() => handleAction(article.id, 'published')} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700">Confirm Publish</button>
                    </div>
                 </div>
               ) : (
                 <div className="flex justify-end space-x-2">
                    <button onClick={() => setActionId(article.id)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white transition-colors">Review Actions</button>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
