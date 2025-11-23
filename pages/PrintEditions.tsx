
import React, { useEffect, useState } from 'react';
import { PrintEdition } from '../types';
import { getPrintEditions } from '../services/contentService';
import Skeleton from '../components/Skeleton';

const PrintEditions: React.FC = () => {
  const [editions, setEditions] = useState<PrintEdition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPrintEditions();
      setEditions(data);
      setLoading(false);
    };
    load();
  }, []);

  const openPdf = (url: string) => {
      window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-black text-black dark:text-white uppercase tracking-tighter mb-4">
          The Archives
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore past issues of The Light Publication in their original print format.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
           {editions.map((edition) => (
             <div 
               key={edition.id} 
               className="group perspective-1000 cursor-pointer" 
               onClick={() => openPdf(edition.pdfUrl)}
             >
                <div className="relative aspect-[3/4] w-full bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl transition-transform duration-500 transform-gpu group-hover:rotate-y-6 group-hover:scale-105 group-hover:shadow-2xl border-4 border-white dark:border-gray-700">
                   <img src={edition.coverUrl} alt={edition.title} className="w-full h-full object-cover rounded" />
                   
                   {/* Overlay on hover */}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center rounded">
                      <span className="text-white font-serif font-bold text-xl text-center px-4 mb-2">{edition.title}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openPdf(edition.pdfUrl); }}
                        className="bg-brand-yellow text-black px-4 py-2 font-bold uppercase text-xs tracking-widest rounded shadow-lg hover:bg-white transition-colors"
                      >
                        Read Issue
                      </button>
                   </div>
                </div>
                <div className="mt-4 text-center">
                   <p className="text-xs font-bold text-brand-cyan uppercase tracking-widest">{edition.volume}</p>
                   <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(edition.publishDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default PrintEditions;
