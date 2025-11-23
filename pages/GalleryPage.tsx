
import React, { useEffect, useState } from 'react';
import { GalleryAlbum } from '../types';
import { getGalleryAlbums } from '../services/contentService';
import Skeleton from '../components/Skeleton';

const GalleryPage: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getGalleryAlbums();
      setAlbums(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-black text-black dark:text-white uppercase tracking-tighter mb-4">
          Photo Gallery
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Capturing the moments that define our school year.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {albums.map((album) => (
             <div key={album.id} className="group cursor-pointer" onClick={() => setActiveAlbum(album)}>
                <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden shadow-md border-2 border-black dark:border-gray-600 group-hover:shadow-xl group-hover:-translate-y-1 transition-all">
                   <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                   <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-1">{album.title}</h3>
                      <div className="flex items-center text-brand-yellow text-sm font-bold">
                         <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         {album.imageCount} Photos
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4" onClick={() => setActiveAlbum(null)}>
           <div className="w-full h-full max-w-6xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center text-white mb-4">
                 <h2 className="text-2xl font-bold">{activeAlbum.title}</h2>
                 <button onClick={() => setActiveAlbum(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 {activeAlbum.images.map((img, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden aspect-square bg-gray-800">
                       <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" loading="lazy" />
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
