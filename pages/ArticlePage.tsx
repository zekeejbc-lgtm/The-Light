
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Article, Comment, User, ArticleReactions } from '../types';
import { getArticleBySlug, getComments, addComment, incrementViews, getRelatedArticles, reactToArticle, logUserActivity, submitReport } from '../services/contentService';
import { getCurrentUser, getUserById } from '../services/authService';
import Skeleton from '../components/Skeleton';
import MarkdownRenderer from '../components/MarkdownRenderer';
import AudioPlayer from '../components/AudioPlayer';
import CustomSelect from '../components/CustomSelect';
import { useToast } from '../context/ToastContext';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [reportReason, setReportReason] = useState('Misinformation');
  const [reportDetails, setReportDetails] = useState('');
  
  const [authorBio, setAuthorBio] = useState<User | null>(null);
  const [userReactions, setUserReactions] = useState<string[]>([]);

  const currentUser = getCurrentUser();
  const { addToast } = useToast();

  useEffect(() => {
    const loadArticle = async () => {
      if (slug) {
        const data = await getArticleBySlug(slug);
        if (data) {
           setArticle(data);
           if (data.status === 'published') {
             incrementViews(data.id);
             if (currentUser) {
                logUserActivity('VIEW_ARTICLE', `Viewed article: ${data.title}`, currentUser);
             } else {
                logUserActivity('VIEW_ARTICLE', `Guest viewed article: ${data.title}`);
             }
           }
           
           const wordCount = data.content.split(/\s+/).length;
           setReadingTime(Math.ceil(wordCount / 200));
           
           const articleComments = await getComments(data.id);
           setComments(articleComments);

           const related = await getRelatedArticles(data.id, data.categorySlug);
           setRelatedArticles(related);

           const authorData = await getUserById(data.authorId);
           if (authorData) {
             setAuthorBio(authorData);
           }
           
           const saved = JSON.parse(localStorage.getItem('the_light_bookmarks') || '[]');
           if (saved.includes(data.slug)) setIsSaved(true);

           const reacted = JSON.parse(localStorage.getItem(`reactions_${data.id}`) || '[]');
           setUserReactions(reacted);
        }
      }
      setLoading(false);
      setShowAudioPlayer(false);
      setFocusMode(false);
      setTextSize('normal');
    };
    loadArticle();
  }, [slug]);

  const handleShare = async () => {
    if (!article) return;
    const url = window.location.href;
    const shareData = { title: article.title, text: article.excerpt, url: url };
    try {
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error("Native share not supported");
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(url);
        addToast("Link copied to clipboard!", "success");
      } catch (clipError) {
        addToast("Unable to share link.", "error");
      }
    }
  };

  const handleSave = () => {
    if (!article) return;
    const saved = JSON.parse(localStorage.getItem('the_light_bookmarks') || '[]');
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((s: string) => s !== article.slug);
      setIsSaved(false);
      addToast("Removed from reading list.", "info");
    } else {
      newSaved = [...saved, article.slug];
      setIsSaved(true);
      addToast("Saved to reading list.", "success");
    }
    localStorage.setItem('the_light_bookmarks', JSON.stringify(newSaved));
  };

  const handleReaction = async (type: keyof ArticleReactions) => {
      if (!article) return;
      if (userReactions.includes(type)) return;
      const newReactions = { ...article.reactions, [type]: article.reactions[type] + 1 };
      setArticle({ ...article, reactions: newReactions });
      const updatedUserReactions = [...userReactions, type];
      setUserReactions(updatedUserReactions);
      localStorage.setItem(`reactions_${article.id}`, JSON.stringify(updatedUserReactions));
      await reactToArticle(article.id, type);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !article || !newComment.trim()) return;
    setSubmittingComment(true);
    const comment: Comment = {
      id: Date.now().toString(),
      articleId: article.id,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newComment,
      createdAt: new Date().toISOString()
    };
    await addComment(comment);
    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setSubmittingComment(false);
    addToast("Comment posted!", "success");
  };

  const handleReportSubmit = async () => {
      if (!article) return;
      addToast("Submitting report...", 'loading');
      await submitReport({
          articleId: article.id,
          articleTitle: article.title,
          articleSlug: article.slug,
          reason: reportReason,
          details: reportDetails,
          reporterId: currentUser?.id
      });
      addToast("Report submitted.", 'success');
      setShowReportModal(false);
      setReportDetails('');
  };

  const toggleTextSize = () => {
      if (textSize === 'normal') setTextSize('large');
      else if (textSize === 'large') setTextSize('xl');
      else setTextSize('normal');
  };

  if (loading) {
    return (
       <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-16 w-full mb-6" />
          <Skeleton className="h-96 w-full rounded-xl mb-8" />
          <Skeleton className="h-4 w-full mb-2" variant="text" />
       </div>
    );
  }

  if (!article) return <div className="p-12 text-center text-2xl font-serif dark:text-brand-yellow">Article not found.</div>;

  const isLocked = article.isMemberOnly && !currentUser;
  const displayedContent = isLocked 
      ? article.content.slice(0, Math.floor(article.content.length * 0.3)) + "..."
      : article.content;
  const contentClass = textSize === 'xl' ? 'prose-2xl' : textSize === 'large' ? 'prose-xl' : 'prose-lg';

  return (
    <>
      {/* 
        Elements outside the main article container to avoid stacking context issues 
        caused by transforms/animations on the parent.
      */}

      {focusMode && <div className="fixed inset-0 bg-white dark:bg-brand-dark z-[-1]" />}

      {/* Floating Report Button */}
      {!focusMode && (
          <button
            onClick={() => setShowReportModal(true)}
            className="fixed bottom-6 left-6 z-[60] p-4 bg-red-600 text-white rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 hover:scale-105 transition-all group"
            title="Report Issue"
            aria-label="Report Issue"
          >
            {/* Triangle / Warning Icon */}
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Report
            </span>
          </button>
      )}

      {/* Report Modal - Floating Centered */}
      {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
              <div className="relative bg-white dark:bg-brand-dark w-full max-w-md rounded-lg p-0 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] border-2 border-red-500 animate-fade-in-up overflow-hidden">
                  <div className="bg-red-600 p-4">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Report Issue
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Reason</label>
                          <CustomSelect 
                            options={[
                                {value: 'Misinformation', label: 'Misinformation / Fake News'},
                                {value: 'Plagiarism', label: 'Plagiarism'},
                                {value: 'Harassment', label: 'Harassment / Hate Speech'},
                                {value: 'Bias', label: 'Bias / Opinion Disguised as Fact'},
                                {value: 'Other', label: 'Other'}
                            ]}
                            value={reportReason}
                            onChange={setReportReason}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Details</label>
                          <textarea 
                             className="w-full p-2 border-2 border-gray-300 rounded dark:bg-black dark:text-white dark:border-gray-600 focus:border-red-500 outline-none"
                             rows={3}
                             value={reportDetails}
                             onChange={e => setReportDetails(e.target.value)}
                          />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                          <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-black uppercase">Cancel</button>
                          <button onClick={handleReportSubmit} className="px-6 py-2 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-700 uppercase">Submit</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Main Article Content */}
      <article className={`bg-white dark:bg-brand-dark animate-fade-in-up transition-colors duration-300 ${focusMode ? 'min-h-screen z-50 relative' : 'pb-20'}`}>
        
        {!focusMode && article.status !== 'published' && (
          <div className="bg-brand-yellow border-b-4 border-black p-4 text-center sticky top-20 z-40 shadow-md">
              <p className="font-bold text-black text-lg uppercase tracking-widest">Preview Mode: {article.status}</p>
          </div>
        )}

        <div className={`max-w-4xl mx-auto px-4 sm:px-6 ${focusMode ? 'py-16' : 'py-12'}`}>
          
          {focusMode && (
            <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-white/90 dark:bg-brand-dark/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50">
               <span className="font-serif font-bold text-xl dark:text-brand-yellow truncate max-w-md">{article.title}</span>
               <button onClick={() => setFocusMode(false)} className="flex items-center gap-2 text-sm font-bold uppercase bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                 Exit Focus
               </button>
            </div>
          )}

          {!focusMode && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link to={`/category/${article.categorySlug}`} className="bg-black dark:bg-white text-brand-yellow dark:text-black px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm">
                {article.categorySlug}
              </Link>
              {article.isMemberOnly && (
                   <span className="bg-brand-cyan text-white px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm border border-black dark:border-white">
                       Member Exclusive
                   </span>
              )}
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          )}
          
          <h1 className={`font-serif font-black text-black dark:text-brand-yellow leading-tight mb-6 drop-shadow-sm ${focusMode ? 'text-5xl text-center' : 'text-4xl md:text-6xl'}`}>
            {article.title}
          </h1>
          
          {!focusMode && (
            <p className="text-xl md:text-2xl text-gray-600 dark:text-brand-cream font-serif leading-relaxed mb-8 border-l-4 border-brand-yellow pl-6 italic">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center border-y-2 border-gray-100 dark:border-gray-800 py-6 mb-8 gap-4">
             <div className="flex items-center space-x-4 self-start md:self-center">
               <div className="w-12 h-12 rounded-full bg-white dark:bg-brand-gray border-2 border-black dark:border-white flex items-center justify-center overflow-hidden">
                  <img src={authorBio?.avatar || 'https://via.placeholder.com/150'} alt={article.authorName} className="w-full h-full object-cover" />
               </div>
               <div>
                 <p className="font-bold text-black dark:text-brand-yellow text-sm uppercase tracking-wide">By {article.authorName}</p>
               </div>
             </div>

             <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <button onClick={toggleTextSize} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 font-bold font-serif dark:text-white" title="Text Size">
                  A+
                </button>

                <button onClick={() => setShowAudioPlayer(!showAudioPlayer)} className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs uppercase ${showAudioPlayer ? 'bg-brand-cyan text-white' : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'}`}>
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                   Listen
                </button>

                <button onClick={() => setFocusMode(!focusMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white" title="Focus Mode">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </button>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                
                <button onClick={handleSave} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
                   {isSaved ? (
                     <svg className="w-5 h-5 fill-current text-brand-cyan" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                   ) : (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                   )}
                </button>
                
                <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
             </div>
          </div>

          {!focusMode && (
            <div className="mb-12 space-y-8">
               {article.videoUrl ? (
                 <div className="w-full aspect-video rounded-xl overflow-hidden border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)]">
                    <iframe src={article.videoUrl} title={article.title} className="w-full h-full" allowFullScreen></iframe>
                 </div>
               ) : (
                 <div className="w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)]">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                 </div>
               )}
            </div>
          )}

          <div className={`relative prose dark:prose-invert max-w-none mb-16 font-serif leading-loose text-gray-800 dark:text-brand-cream ${focusMode ? 'md:px-12' : ''} ${contentClass}`}>
             <MarkdownRenderer content={displayedContent} />
             
             {isLocked && (
                  <div className="absolute inset-0 top-1/3 bg-gradient-to-b from-transparent via-white/95 to-white dark:via-brand-dark/95 dark:to-brand-dark flex flex-col justify-end items-center pb-24 z-10">
                      <div className="w-full max-w-md bg-brand-yellow p-1 rounded-sm border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                          <div className="p-8 text-center border border-black h-full flex flex-col items-center">
                               <h3 className="text-2xl font-black uppercase mb-2 text-black tracking-tighter">Restricted Access</h3>
                               <p className="text-black font-bold mb-6 text-sm uppercase tracking-wide">This story is for members only.</p>
                               <Link to="/login" className="inline-block w-full bg-black text-white px-6 py-4 font-black uppercase tracking-widest rounded hover:shadow-lg transition-all">
                                   Login to Unlock
                               </Link>
                          </div>
                      </div>
                  </div>
             )}
          </div>
          
          {!isLocked && !focusMode && (
            <>
              {article.reactions && (
                 <div className="flex justify-center mb-12 gap-6">
                    {['like', 'love', 'insightful', 'sad'].map(r => (
                        <button key={r} onClick={() => handleReaction(r as keyof ArticleReactions)} className={`group flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:-translate-y-1 ${userReactions.includes(r) ? 'bg-brand-cyan text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'}`}>
                           <span className="text-xs font-black uppercase tracking-widest">{article.reactions[r as keyof ArticleReactions]}</span>
                           <span className="text-[10px] uppercase font-bold mt-1">{r}</span>
                        </button>
                    ))}
                 </div>
              )}

              {relatedArticles.length > 0 && (
                <div className="mb-16 border-t-2 border-black dark:border-white pt-12">
                   <h3 className="text-3xl font-serif font-black text-black dark:text-brand-yellow mb-8 uppercase">Related Stories</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {relatedArticles.map(related => (
                         <Link key={related.id} to={`/article/${related.slug}`} className="group block">
                            <div className="h-40 bg-gray-100 dark:bg-gray-800 mb-4 rounded overflow-hidden relative">
                               <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <h4 className="font-bold text-lg leading-tight group-hover:text-brand-cyan dark:text-white transition-colors">{related.title}</h4>
                         </Link>
                      ))}
                   </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 relative">
                 <h3 className="text-2xl font-bold mb-6 dark:text-brand-yellow">Discussion ({comments.length})</h3>
                 {currentUser ? (
                   <form onSubmit={handleSubmitComment} className="mb-10">
                     <textarea
                       className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-black dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white outline-none transition-all resize-y min-h-[100px]"
                       placeholder="Join the conversation..."
                       value={newComment}
                       onChange={(e) => setNewComment(e.target.value)}
                       required
                     />
                     <div className="mt-3 flex justify-end">
                       <button type="submit" disabled={submittingComment} className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded font-bold uppercase tracking-wide hover:opacity-80 disabled:opacity-50">
                         {submittingComment ? 'Posting...' : 'Post Comment'}
                       </button>
                     </div>
                   </form>
                 ) : (
                   <div className="bg-brand-yellow/20 p-4 rounded mb-8 text-center border border-brand-yellow">
                     <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Please <Link to="/login" className="underline decoration-2">log in</Link> to leave a comment.</p>
                   </div>
                 )}
                 <div className="space-y-8">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex space-x-4 animate-fade-in-up">
                         <div className="flex-shrink-0 w-10 h-10 bg-brand-cyan rounded-full flex items-center justify-center text-white font-bold border border-black">{comment.userName.charAt(0)}</div>
                         <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                               <h4 className="font-bold text-black dark:text-brand-yellow">{comment.userName}</h4>
                               <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 dark:text-brand-cream leading-relaxed">{comment.content}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </>
          )}
        </div>

        {showAudioPlayer && article && !isLocked && (
          <AudioPlayer text={`${article.title}. By ${article.authorName}. ${article.content}`} title={article.title} onClose={() => setShowAudioPlayer(false)} />
        )}
      </article>
    </>
  );
};

export default ArticlePage;
