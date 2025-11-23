
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { getArticlesByAuthor, updateArticleStatus, deleteArticle, getAllArticles, updateArticle } from '../../services/contentService';
import { useToast } from '../../context/ToastContext';

interface MySubmissionsProps {
  userId: string;
  onEdit: (article: Article) => void;
  adminView?: boolean;
}

const MySubmissions: React.FC<MySubmissionsProps> = ({ userId, onEdit, adminView = false }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    let data;
    if (adminView) {
        data = await getAllArticles();
    } else {
        data = await getArticlesByAuthor(userId);
    }
    
    // Sort: Drafts first, then Pending, then others (if user view), else Date descending (admin)
    data.sort((a, b) => {
        if (adminView) {
             return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
        const statusOrder = { draft: 1, pending: 2, rejected: 3, published: 4, archived: 5 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userId, adminView]);

  const handleDelete = async (id: string) => {
      if (confirm("Are you sure you want to permanently delete this article? This cannot be undone.")) {
          await deleteArticle(id);
          addToast("Article deleted.", "success");
          load();
      }
  };

  const handleArchive = async (id: string) => {
      if (confirm("Are you sure you want to archive this article? It will be hidden from the public site.")) {
          await updateArticleStatus(id, 'archived', 'Archived by admin/author');
          addToast("Article archived.", "info");
          load();
      }
  };

  const toggleFeature = async (article: Article) => {
      const updated = { ...article, isFeatured: !article.isFeatured };
      await updateArticle(updated);
      addToast(updated.isFeatured ? "Article featured on homepage!" : "Article removed from featured.", "success");
      load();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading articles...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-2xl font-serif font-black dark:text-white uppercase border-b-2 border-black dark:border-white pb-4">
          {adminView ? 'Manage All Published Stories' : 'My Submissions'}
      </h3>
      
      {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No articles found.</div>
      ) : (
          <div className="grid gap-4">
              {articles.map(article => (
                  <div key={article.id} className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border 
                                  ${article.status === 'published' ? 'bg-green-100 text-green-800 border-green-300' : 
                                    article.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' : 
                                    article.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                                    article.status === 'archived' ? 'bg-gray-200 text-gray-600 border-gray-400' :
                                    'bg-gray-100 text-gray-800 border-gray-300'}`}>
                                  {article.status}
                              </span>
                              {article.isFeatured && (
                                  <span className="bg-brand-cyan text-white text-[10px] font-bold px-2 py-0.5 rounded-sm border border-black">Featured</span>
                              )}
                              <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</span>
                              {adminView && <span className="text-xs font-bold text-gray-500 uppercase">By {article.authorName}</span>}
                          </div>
                          <h4 className="font-bold text-lg text-black dark:text-white">{article.title}</h4>
                          {article.feedback && !adminView && (
                              <div className="mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm text-red-800 dark:text-red-200 border border-red-100 dark:border-red-800">
                                  <strong>Editor Feedback:</strong> {article.feedback}
                              </div>
                          )}
                      </div>
                      
                      <div className="flex space-x-2 flex-wrap gap-y-2">
                          {adminView && article.status === 'published' && (
                              <button 
                                onClick={() => toggleFeature(article)} 
                                className={`px-3 py-1 text-sm border font-bold rounded transition-colors ${article.isFeatured ? 'bg-brand-yellow border-black text-black' : 'border-gray-300 text-gray-500 hover:bg-brand-yellow hover:text-black'}`}
                              >
                                  {article.isFeatured ? '★ Featured' : '☆ Feature'}
                              </button>
                          )}

                          {article.status === 'draft' || article.status === 'rejected' || adminView ? (
                             <>
                                <button onClick={() => onEdit(article)} className="px-3 py-1 text-sm border border-brand-cyan text-brand-cyan font-bold rounded hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(article.id)} className="px-3 py-1 text-sm border border-red-500 text-red-500 font-bold rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                    Delete
                                </button>
                             </>
                          ) : article.status === 'published' ? (
                              <>
                                <Link to={`/article/${article.slug}`} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                                    View
                                </Link>
                                <button onClick={() => handleArchive(article.id)} className="px-3 py-1 text-sm border border-gray-500 text-gray-500 font-bold rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                                    Archive
                                </button>
                              </>
                          ) : (
                                <span className="text-xs italic text-gray-400">Processing...</span>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default MySubmissions;
