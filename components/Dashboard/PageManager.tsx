import React, { useEffect, useState } from 'react';
import { PageConfig } from '../../types';
import { getPages, createPage, updatePage, deletePage } from '../../services/contentService';
import { useToast } from '../../context/ToastContext';
import CustomSelect from '../CustomSelect';

const PageManager: React.FC = () => {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PageConfig>>({});
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await getPages();
    setPages(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = () => {
      setEditForm({
          title: '',
          slug: '',
          type: 'static',
          isVisible: true,
          accessLevel: 'public',
          orderScore: pages.length + 1,
          description: ''
      });
      setIsEditing(true);
  };

  const handleEdit = (page: PageConfig) => {
      setEditForm(page);
      setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
      if (confirm('Are you sure you want to delete this page?')) {
          await deletePage(id);
          addToast('Page deleted.', 'success');
          load();
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editForm.title || !editForm.slug) {
          addToast('Title and Slug are required.', 'error');
          return;
      }

      if (editForm.id) {
          await updatePage(editForm.id, editForm);
          addToast('Page updated.', 'success');
      } else {
          await createPage({
              ...editForm,
              id: Date.now().toString(),
              isSystem: false
          } as PageConfig);
          addToast('Page created.', 'success');
      }
      setIsEditing(false);
      load();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center border-b-2 border-black dark:border-white pb-4">
         <h3 className="text-2xl font-serif font-black dark:text-white uppercase">Page Management</h3>
         <button onClick={handleCreate} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded font-bold text-sm uppercase tracking-wider hover:opacity-80 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            + New Page
         </button>
      </div>

      {isEditing && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-black dark:border-gray-600 mb-6 shadow-md">
              <h4 className="font-bold text-lg mb-4 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{editForm.id ? 'Edit Page' : 'Create New Page'}</h4>
              <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Page Title</label>
                          <input 
                            className="w-full p-2 border-2 border-gray-200 focus:border-black rounded bg-white dark:bg-black dark:text-white dark:border-gray-600 outline-none"
                            value={editForm.title}
                            onChange={e => setEditForm({...editForm, title: e.target.value})}
                            required
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Slug (URL)</label>
                          <div className="flex">
                             <span className="p-2 bg-gray-100 dark:bg-gray-700 border-2 border-r-0 border-gray-200 dark:border-gray-600 text-gray-500 rounded-l text-sm font-mono flex items-center">/</span>
                             <input 
                                className="w-full p-2 border-2 border-gray-200 focus:border-black rounded-r bg-white dark:bg-black dark:text-white dark:border-gray-600 outline-none font-mono text-sm"
                                value={editForm.slug}
                                onChange={e => setEditForm({...editForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                                required
                            />
                          </div>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Type</label>
                          <CustomSelect 
                             options={[{value: 'static', label: 'Static Page'}, {value: 'category', label: 'Article Category'}]}
                             value={editForm.type || 'static'}
                             onChange={val => setEditForm({...editForm, type: val as any})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Visibility</label>
                          <CustomSelect 
                             options={[{value: 'true', label: 'Visible'}, {value: 'false', label: 'Hidden'}]}
                             value={String(editForm.isVisible)}
                             onChange={val => setEditForm({...editForm, isVisible: val === 'true'})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Order Priority</label>
                          <input 
                            type="number"
                            className="w-full p-2 border-2 border-gray-200 focus:border-black rounded bg-white dark:bg-black dark:text-white dark:border-gray-600 outline-none"
                            value={editForm.orderScore}
                            onChange={e => setEditForm({...editForm, orderScore: parseInt(e.target.value)})}
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Description</label>
                      <textarea 
                        className="w-full p-2 border-2 border-gray-200 focus:border-black rounded bg-white dark:bg-black dark:text-white dark:border-gray-600 outline-none"
                        value={editForm.description}
                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                      />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold uppercase text-gray-500 hover:text-black transition-colors">Cancel</button>
                      <button type="submit" className="px-6 py-2 bg-brand-cyan text-white text-sm font-bold uppercase rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none border border-black transition-all">Save Page</button>
                  </div>
              </form>
          </div>
      )}

      {loading ? (
          <div className="text-center py-8">Loading...</div>
      ) : (
          <div className="grid gap-4">
              {pages.map(page => (
                  <div key={page.id} className="bg-white dark:bg-brand-dark border-2 border-black dark:border-gray-700 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                      <div className="flex items-center gap-4 mb-2 md:mb-0 w-full md:w-auto">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${page.isVisible ? 'bg-green-500' : 'bg-gray-300'}`} title={page.isVisible ? 'Visible' : 'Hidden'}></div>
                          <div>
                              <h4 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                  {page.title}
                                  {page.isSystem && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded text-gray-600 border border-gray-300">SYSTEM</span>}
                              </h4>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                                  <span className="text-brand-cyan">/</span>{page.slug} • {page.type}
                              </p>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                          <button onClick={() => handleEdit(page)} className="px-4 py-1.5 border-2 border-black dark:border-gray-500 rounded text-xs font-bold uppercase hover:bg-brand-yellow hover:text-black dark:text-gray-300 transition-colors">
                              Edit
                          </button>
                          {!page.isSystem && (
                              <button onClick={() => handleDelete(page.id)} className="px-4 py-1.5 border-2 border-red-200 text-red-600 rounded text-xs font-bold uppercase hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                  Delete
                              </button>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default PageManager;