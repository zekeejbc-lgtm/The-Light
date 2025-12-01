
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Article, PageConfig, Notification, AccessLog, SystemConfig, SearchResult } from '../types';
import { createArticle, updateArticle, getPages, getUserNotifications, markNotificationRead, updateSystemConfig, getSystemConfig, getAllArticles, getAccessLogs, updateArticleStatus, searchContent } from '../services/contentService';
import { getAllUsers, removeUser, createUser } from '../services/authService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CustomSelect from '../components/CustomSelect';
import { useToast } from '../context/ToastContext';

// Imported Sub-Components
import ReviewQueue from '../components/Dashboard/ReviewQueue';
import MySubmissions from '../components/Dashboard/MySubmissions';
import UserManagement from '../components/Dashboard/UserManagement';
import ReportCenter from '../components/Dashboard/ReportCenter';
import PageManager from '../components/Dashboard/PageManager';

interface DashboardProps {
  user: User;
  onProfileUpdate: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // System Settings State
  const [sysConfig, setSysConfig] = useState<SystemConfig | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [articlesSearch, setArticlesSearch] = useState<SearchResult[]>([]);

  // Write Article State
  const [writeTitle, setWriteTitle] = useState('');
  const [writeExcerpt, setWriteExcerpt] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('news');
  const [writeImage, setWriteImage] = useState('');
  const [isMemberOnly, setIsMemberOnly] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const articleImageRef = useRef<HTMLInputElement>(null);

  const isEditor = [UserRole.AUDITOR, UserRole.EIC, UserRole.HEAD].includes(user.role);
  const isAdmin = [UserRole.AUDITOR].includes(user.role);
  const isPrivileged = [UserRole.AUDITOR, UserRole.EIC].includes(user.role);

  useEffect(() => {
    const fetchNotifs = async () => {
        const data = await getUserNotifications(user.id);
        setNotifications(data);
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
      if (activeTab === 'system') {
          getSystemConfig().then(setSysConfig);
          searchContent('').then(setArticlesSearch);
      }
      if (activeTab === 'logs') {
          getAccessLogs().then(setLogs);
      }
  }, [activeTab]);

  useEffect(() => {
      if (editingArticle) {
          setWriteTitle(editingArticle.title);
          setWriteExcerpt(editingArticle.excerpt);
          setWriteContent(editingArticle.content);
          setWriteCategory(editingArticle.categorySlug);
          setWriteImage(editingArticle.imageUrl);
          setIsMemberOnly(editingArticle.isMemberOnly || false);
          setIsFeatured(editingArticle.isFeatured || false);
      } else {
          setWriteTitle('');
          setWriteExcerpt('');
          setWriteContent('');
          setWriteCategory('news');
          setWriteImage('');
          setIsMemberOnly(false);
          setIsFeatured(false);
      }
  }, [editingArticle]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = (id: string) => {
      markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleEditArticle = (article: Article) => {
      setEditingArticle(article);
      setActiveTab('write');
      addToast(`Editing mode: ${article.title}`, 'info');
  };

  const handleSaveArticle = async (status: 'draft' | 'pending') => {
      if (!writeTitle || !writeContent) {
          addToast("Title and Content are required.", 'error');
          return;
      }
      const toastId = addToast(status === 'draft' ? "Saving draft..." : "Submitting...", 'loading');
      const articleData: Article = {
          id: editingArticle ? editingArticle.id : Date.now().toString(),
          title: writeTitle,
          slug: writeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          excerpt: writeExcerpt,
          content: writeContent,
          authorId: user.id,
          authorName: user.name,
          categorySlug: writeCategory,
          imageUrl: writeImage || 'https://picsum.photos/800/600',
          publishedAt: new Date().toISOString(),
          status: status,
          views: editingArticle ? editingArticle.views : 0,
          reactions: editingArticle ? editingArticle.reactions : { like:0, love:0, insightful:0, sad:0 },
          isMemberOnly: isMemberOnly,
          isFeatured: isFeatured
      };
      if (editingArticle) {
          await updateArticle(articleData);
          setEditingArticle(null);
      } else {
          await createArticle(articleData);
      }
      setWriteTitle('');
      setWriteContent('');
      setWriteExcerpt('');
      addToast(status === 'draft' ? "Draft saved successfully." : "Article submitted for review!", 'success');
      setActiveTab('submissions');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && sysConfig) {
          if (file.size > 2000000) { 
              addToast("Image size too large. Max 2MB.", "error");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
               setSysConfig({...sysConfig, theme: {...sysConfig.theme, logoUrl: reader.result as string}});
               addToast("Logo loaded for preview. Save to apply.", "info");
          };
          reader.readAsDataURL(file);
      }
  };

  const handleArticleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 3000000) {
            addToast("Image too large. Max 3MB.", "error");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
             setWriteImage(reader.result as string);
             addToast("Image uploaded successfully.", "success");
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSystemSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!sysConfig) return;
      addToast("Updating system configuration...", 'loading');
      await updateSystemConfig(sysConfig);
      addToast("System settings updated!", 'success');
  };

  const insertMarkdown = (syntax: string, type: 'wrap' | 'block') => {
      if (!contentTextAreaRef.current) return;
      const textarea = contentTextAreaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);

      let newText = '';
      let newCursorPos = 0;

      if (type === 'wrap') {
          newText = text.substring(0, start) + syntax + selectedText + syntax + text.substring(end);
          newCursorPos = end + (selectedText ? syntax.length * 2 : syntax.length);
      } else if (type === 'block') {
          const prefix = syntax + ' ';
          newText = text.substring(0, start) + prefix + selectedText + text.substring(end);
          newCursorPos = end + prefix.length;
      }

      setWriteContent(newText);
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
  };

  const menuGroups = [
    {
      title: 'General',
      items: [
        { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
      ]
    },
    {
      title: 'Editorial',
      items: [
        { id: 'write', label: 'Write Article', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { id: 'submissions', label: 'My Submissions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        ...(isEditor ? [{ id: 'review', label: 'Review Queue', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }] : []),
        ...(isPrivileged ? [{ id: 'all_stories', label: 'All Stories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }] : []),
      ]
    },
    {
      title: 'Administration',
      items: [
        ...(isPrivileged ? [{ id: 'users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }] : []),
        ...(isPrivileged ? [{ id: 'reports', label: 'Report Center', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }] : []),
        ...(isPrivileged ? [{ id: 'pages', label: 'Page Management', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }] : []),
      ]
    },
    {
      title: 'System',
      items: [
         ...(isAdmin ? [{ id: 'system', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }] : []),
         ...(isAdmin ? [{ id: 'logs', label: 'Access Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }] : []),
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
       <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="lg:w-64 flex-shrink-0 space-y-6">
             <div className="bg-white dark:bg-brand-dark p-6 rounded-lg border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <div className="text-center">
                   <div className="w-16 h-16 rounded-full bg-brand-cyan mx-auto mb-3 border-2 border-black overflow-hidden">
                       <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
                   </div>
                   <h2 className="font-bold text-lg dark:text-white">{user.name}</h2>
                   <p className="text-xs uppercase font-bold text-gray-500 dark:text-brand-yellow">{user.role}</p>
                </div>
             </div>

             <div className="bg-white dark:bg-brand-dark rounded-lg border-2 border-black dark:border-gray-700 overflow-hidden">
                 {menuGroups.map((group, idx) => (
                    <div key={idx}>
                        {group.items.length > 0 && (
                            <>
                                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-200 dark:border-gray-700">
                                    {group.title}
                                </div>
                                <div>
                                    {group.items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center px-4 py-3 text-sm font-bold transition-all border-b border-gray-100 dark:border-gray-800 last:border-0
                                            ${activeTab === item.id 
                                                ? 'bg-brand-yellow text-black' 
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                 ))}
             </div>
          </div>

          <div className="flex-1">
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-serif font-black dark:text-white uppercase">
                     {activeTab === 'write' && (editingArticle ? 'Edit Article' : 'Write New Article')}
                     {activeTab === 'overview' && 'Dashboard Overview'}
                     {activeTab === 'submissions' && 'My Stories'}
                     {activeTab === 'all_stories' && 'Manage All Stories'}
                     {activeTab === 'review' && 'Editorial Queue'}
                     {activeTab === 'users' && 'User Management'}
                     {activeTab === 'reports' && 'Report Center'}
                     {activeTab === 'pages' && 'Site Page Manager'}
                     {activeTab === 'system' && 'System Configuration'}
                     {activeTab === 'logs' && 'Access Logs'}
                 </h1>

                 <div className="relative">
                     <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 relative hover:bg-black/5 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
                        {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white"></span>}
                     </button>
                     {showNotifs && (
                         <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-xl rounded-lg z-50 overflow-hidden animate-fade-in-down">
                             <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-bold dark:text-white">Notifications</div>
                             <div className="max-h-64 overflow-y-auto">
                                 {notifications.length === 0 ? (
                                     <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                                 ) : (
                                     notifications.map(n => (
                                         <div key={n.id} onClick={() => handleMarkRead(n.id)} className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                             <p className="text-sm dark:text-gray-200">{n.message}</p>
                                             <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                                         </div>
                                     ))
                                 )}
                             </div>
                         </div>
                     )}
                 </div>
             </div>

             <div className="bg-white dark:bg-brand-dark p-6 rounded-lg border-2 border-black dark:border-gray-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] min-h-[500px]">
                 
                 {activeTab === 'overview' && (
                     <div className="text-center py-20">
                         <h2 className="text-2xl font-bold dark:text-white mb-2">Welcome back, {user.name}!</h2>
                         <p className="text-gray-600 dark:text-gray-400">Select an option from the sidebar to get started.</p>
                     </div>
                 )}

                 {activeTab === 'write' && (
                     <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
                         {editingArticle && (
                             <div className="bg-blue-100 text-blue-800 p-3 rounded text-sm font-bold flex justify-between items-center border border-blue-200">
                                 <span>Editing: "{editingArticle.title}"</span>
                                 <button onClick={() => { setEditingArticle(null); setWriteTitle(''); setWriteContent(''); }} className="underline hover:text-blue-900">Cancel Edit</button>
                             </div>
                         )}

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-xs font-bold uppercase dark:text-gray-300">Category</label>
                                <CustomSelect 
                                    options={[
                                        {value: 'news', label: 'News'},
                                        {value: 'features', label: 'Features'},
                                        {value: 'sports', label: 'Sports'},
                                        {value: 'editorial', label: 'Editorial'},
                                        {value: 'sci-tech', label: 'Sci-Tech'},
                                        {value: 'literary', label: 'Literary'},
                                    ]}
                                    value={writeCategory}
                                    onChange={setWriteCategory}
                                    className="w-full"
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Article Settings</label>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center space-x-2 p-2 border-2 border-gray-200 rounded-lg bg-white dark:bg-black dark:border-gray-600">
                                      <input 
                                          type="checkbox" 
                                          checked={isMemberOnly} 
                                          onChange={(e) => setIsMemberOnly(e.target.checked)}
                                          className="w-5 h-5 text-brand-cyan rounded focus:ring-brand-cyan"
                                      />
                                      <span className="text-xs font-bold dark:text-white uppercase">Member Only (Paywall)</span>
                                  </div>
                                  {isPrivileged && (
                                      <div className="flex items-center space-x-2 p-2 border-2 border-gray-200 rounded-lg bg-white dark:bg-black dark:border-gray-600">
                                          <input 
                                              type="checkbox" 
                                              checked={isFeatured} 
                                              onChange={(e) => setIsFeatured(e.target.checked)}
                                              className="w-5 h-5 text-brand-yellow rounded focus:ring-brand-yellow"
                                          />
                                          <span className="text-xs font-bold dark:text-white uppercase">Feature on Homepage</span>
                                      </div>
                                  )}
                                </div>
                             </div>
                         </div>

                         <div>
                             <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Article Title</label>
                             <input 
                                className="w-full p-3 text-lg font-bold border-2 border-gray-200 rounded-lg focus:border-black dark:focus:border-white outline-none bg-white dark:bg-brand-dark dark:text-white dark:border-gray-600"
                                placeholder="Enter a catchy headline..."
                                value={writeTitle}
                                onChange={(e) => setWriteTitle(e.target.value)}
                             />
                         </div>

                         <div>
                             <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Excerpt / Summary</label>
                             <textarea 
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-black dark:focus:border-white outline-none bg-white dark:bg-brand-dark dark:text-white dark:border-gray-600 h-24"
                                placeholder="A short summary for the card view..."
                                value={writeExcerpt}
                                onChange={(e) => setWriteExcerpt(e.target.value)}
                             />
                         </div>

                         <div>
                             <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Cover Image</label>
                             <div className="flex gap-2">
                               <input 
                                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-black dark:focus:border-white outline-none bg-white dark:bg-brand-dark dark:text-white dark:border-gray-600"
                                  placeholder="Image URL (or upload)"
                                  value={writeImage}
                                  onChange={(e) => setWriteImage(e.target.value)}
                               />
                               <input 
                                   type="file" 
                                   accept="image/*"
                                   ref={articleImageRef}
                                   className="hidden"
                                   onChange={handleArticleImageUpload}
                               />
                               <button 
                                   type="button" 
                                   onClick={() => articleImageRef.current?.click()}
                                   className="bg-black text-white dark:bg-white dark:text-black px-4 rounded-lg font-bold uppercase text-xs"
                               >
                                   Upload
                               </button>
                             </div>
                             {writeImage && (
                                 <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-black">
                                     <img src={writeImage} alt="Preview" className="w-full h-full object-cover" />
                                 </div>
                             )}
                         </div>

                         <div>
                             <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Content</label>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="flex flex-col">
                                     {/* Markdown Toolbar */}
                                     <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                                         <button type="button" onClick={() => insertMarkdown('**', 'wrap')} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold min-w-[30px]" title="Bold">B</button>
                                         <button type="button" onClick={() => insertMarkdown('*', 'wrap')} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold italic min-w-[30px]" title="Italic">I</button>
                                         <button type="button" onClick={() => insertMarkdown('#', 'block')} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold min-w-[30px]" title="Heading 1">H1</button>
                                         <button type="button" onClick={() => insertMarkdown('##', 'block')} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold min-w-[30px]" title="Heading 2">H2</button>
                                         <button type="button" onClick={() => insertMarkdown('> ', 'block')} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold min-w-[30px]" title="Quote">""</button>
                                         <button type="button" onClick={() => insertMarkdown('[Link Text](url)', 'wrap')} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold" title="Link">Link</button>
                                     </div>
                                     <textarea 
                                        ref={contentTextAreaRef}
                                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-black dark:focus:border-white outline-none font-mono text-sm bg-white dark:bg-brand-dark dark:text-white dark:border-gray-600 h-96 resize-none"
                                        placeholder="Write your story here... Use the toolbar or Markdown."
                                        value={writeContent}
                                        onChange={(e) => setWriteContent(e.target.value)}
                                     />
                                 </div>
                                 <div className="h-96 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 prose dark:prose-invert">
                                     <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Live Preview</span>
                                     <MarkdownRenderer content={writeContent || '*Preview will appear here...*'} />
                                 </div>
                             </div>
                         </div>

                         <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                             <button 
                                onClick={() => handleSaveArticle('draft')}
                                className="px-6 py-2 rounded-lg font-bold border-2 border-gray-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                             >
                                Save Draft
                             </button>
                             <button 
                                onClick={() => handleSaveArticle('pending')}
                                className="px-6 py-2 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 shadow-md"
                             >
                                Submit for Review
                             </button>
                         </div>
                     </div>
                 )}

                 {activeTab === 'submissions' && <MySubmissions userId={user.id} onEdit={handleEditArticle} />}

                 {activeTab === 'all_stories' && isPrivileged && <MySubmissions userId="" onEdit={handleEditArticle} adminView={true} />}

                 {activeTab === 'review' && isEditor && <ReviewQueue />}

                 {activeTab === 'users' && isPrivileged && <UserManagement />}

                 {activeTab === 'reports' && isPrivileged && <ReportCenter />}
                 
                 {activeTab === 'pages' && isPrivileged && <PageManager />}

                 {activeTab === 'logs' && isAdmin && (
                     <div className="space-y-4 animate-fade-in-up">
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider min-w-[200px]">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-brand-dark divide-y divide-gray-200 dark:divide-gray-700">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold dark:text-white block">{log.userName}</span>
                                                {log.userId && <span className="text-[10px] text-gray-400 font-mono">ID: {log.userId}</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border
                                                ${log.action === 'LOGIN' ? 'bg-green-100 text-green-800 border-green-200' : 
                                                    log.action === 'SYSTEM_CHANGE' ? 'bg-purple-100 text-purple-800 border-purple-200' : 
                                                    log.action === 'ACCESS_DENIED' ? 'bg-red-100 text-red-800 border-red-200' : 
                                                    'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                                    {log.action.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 min-w-[250px] whitespace-normal">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No activity logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                     </div>
                 )}

                 {activeTab === 'system' && isAdmin && sysConfig && (
                     <form onSubmit={handleSystemSave} className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                         {/* System Config Form - Same as before */}
                         <div className="bg-white dark:bg-gray-800/30 p-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                            <h3 className="text-xl font-black uppercase mb-6 dark:text-white border-b-2 border-gray-200 dark:border-gray-700 pb-2">Brand Identity</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2 dark:text-gray-300">Publication Name</label>
                                        <input 
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg dark:bg-black dark:text-white dark:border-gray-600 focus:border-black dark:focus:border-white outline-none font-bold bg-white"
                                            value={sysConfig.theme.publicationName}
                                            onChange={e => setSysConfig({...sysConfig, theme: {...sysConfig.theme, publicationName: e.target.value}})}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2 dark:text-gray-300">Publication Logo</label>
                                        <div className="bg-white dark:bg-black border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                                            <div className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-600 overflow-hidden bg-white mx-auto mb-4 group-hover:border-black dark:group-hover:border-white transition-colors">
                                                <img src={sysConfig.theme.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Click to upload new logo</p>
                                            <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG (Max 2MB)</p>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleLogoUpload}
                                                className="hidden" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Redesigned Color Pickers */}
                                    {[{label: "Primary Color", key: 'primaryColor' as const}, {label: "Accent Color", key: 'accentColor' as const}].map(color => (
                                        <div key={color.key}>
                                            <label className="block text-xs font-bold uppercase mb-2 dark:text-gray-300">{color.label}</label>
                                            <div className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-black">
                                                <div className="relative">
                                                    <div 
                                                      className="w-12 h-12 rounded-lg border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                                      style={{ backgroundColor: sysConfig.theme[color.key] }}
                                                    >
                                                        <input 
                                                            type="color"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            value={sysConfig.theme[color.key]}
                                                            onChange={e => setSysConfig({...sysConfig, theme: {...sysConfig.theme, [color.key]: e.target.value}})}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {['#FFEB3B', '#00BCD4', '#F44336', '#4CAF50', '#9C27B0', '#000000', '#FFFFFF'].map(c => (
                                                            <button 
                                                                key={c}
                                                                type="button"
                                                                onClick={() => setSysConfig({...sysConfig, theme: {...sysConfig.theme, [color.key]: c}})}
                                                                className="w-6 h-6 rounded border border-gray-300 shadow-sm"
                                                                style={{backgroundColor: c}}
                                                            />
                                                        ))}
                                                    </div>
                                                    <input 
                                                      type="text" 
                                                      className="w-full font-mono text-sm font-bold uppercase p-2 rounded border border-gray-300 dark:border-gray-600 text-center dark:bg-black dark:text-white"
                                                      value={sysConfig.theme[color.key]}
                                                      onChange={e => setSysConfig({...sysConfig, theme: {...sysConfig.theme, [color.key]: e.target.value}})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         </div>

                         <div className="bg-white dark:bg-gray-800/30 p-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                             <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-2">
                                <h3 className="text-xl font-black uppercase dark:text-white">Breaking News Ticker</h3>
                                <div className="flex items-center space-x-2 bg-white dark:bg-brand-dark px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600">
                                    <input 
                                        type="checkbox"
                                        checked={sysConfig.breakingNews?.enabled}
                                        onChange={e => setSysConfig({...sysConfig, breakingNews: {...sysConfig.breakingNews!, enabled: e.target.checked}})}
                                        className="w-4 h-4 text-brand-cyan rounded focus:ring-brand-cyan cursor-pointer"
                                    />
                                    <span className="text-xs font-bold uppercase dark:text-gray-300">Active</span>
                                </div>
                             </div>
                             
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold uppercase mb-2 dark:text-gray-300">Ticker Message</label>
                                     <input 
                                         className="w-full p-3 border-2 border-gray-200 rounded-lg dark:bg-black dark:text-white dark:border-gray-600 focus:border-black dark:focus:border-white outline-none bg-white"
                                         value={sysConfig.breakingNews?.text}
                                         onChange={e => setSysConfig({...sysConfig, breakingNews: {...sysConfig.breakingNews!, text: e.target.value}})}
                                         placeholder="Enter breaking news text..."
                                     />
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                         <label className="text-xs font-bold uppercase dark:text-gray-300 block mb-2">Scroll Speed</label>
                                         <CustomSelect 
                                            options={[
                                                {value: 'slow', label: 'Slow'},
                                                {value: 'normal', label: 'Normal'},
                                                {value: 'fast', label: 'Fast'},
                                            ]}
                                            value={sysConfig.breakingNews?.speed || 'normal'}
                                            onChange={(val) => setSysConfig({...sysConfig, breakingNews: {...sysConfig.breakingNews!, speed: val as 'slow'|'normal'|'fast'}})}
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold uppercase dark:text-gray-300 block mb-2">Link to Article (Optional)</label>
                                         <CustomSelect 
                                            options={[
                                                {value: '', label: 'No Link'},
                                                ...articlesSearch.filter(a => a.type === 'article').map(a => ({
                                                    value: a.url,
                                                    label: a.title
                                                }))
                                            ]}
                                            value={sysConfig.breakingNews?.link || ''}
                                            onChange={(val) => setSysConfig({...sysConfig, breakingNews: {...sysConfig.breakingNews!, link: val}})}
                                            placeholder="Select an article..."
                                         />
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border-2 border-red-200 dark:border-red-900">
                             <div className="flex items-center justify-between">
                                 <div>
                                     <h3 className="text-lg font-bold text-red-800 dark:text-red-400 uppercase">Emergency Maintenance</h3>
                                     <p className="text-xs text-red-600 dark:text-red-300 font-bold mt-1">Locks the site for non-admin users.</p>
                                 </div>
                                 <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                     <input 
                                         type="checkbox" 
                                         name="toggle" 
                                         id="toggle" 
                                         checked={sysConfig.maintenanceMode}
                                         onChange={e => setSysConfig({...sysConfig, maintenanceMode: e.target.checked})}
                                         className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                         style={{ right: sysConfig.maintenanceMode ? '0' : 'auto', left: sysConfig.maintenanceMode ? 'auto' : '0', borderColor: sysConfig.maintenanceMode ? '#DC2626' : '#E5E7EB' }}
                                     />
                                     <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${sysConfig.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'}`}></label>
                                 </div>
                             </div>
                         </div>

                         <div className="sticky bottom-6 flex justify-end">
                             <button type="submit" className="bg-black text-white dark:bg-brand-cyan dark:text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] transform transition-all border-2 border-white dark:border-black">
                                 Save Configuration
                             </button>
                         </div>
                     </form>
                 )}

             </div>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;
