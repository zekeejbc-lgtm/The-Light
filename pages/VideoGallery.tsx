
import React, { useEffect, useState } from 'react';
import { Video } from '../types';
import { getVideos } from '../services/contentService';
import Skeleton from '../components/Skeleton';

const VideoGallery: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getVideos();
      setVideos(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-black text-black dark:text-white uppercase tracking-tighter mb-4">
          Video Library
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Watch the latest events, interviews, and highlights from The Light.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {videos.map((video) => (
             <div key={video.id} className="group cursor-pointer" onClick={() => setActiveVideo(video)}>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg border-2 border-transparent group-hover:border-brand-cyan transition-all">
                   <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                         <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                   </div>
                   <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                      {video.category}
                   </div>
                </div>
                <h3 className="text-xl font-bold mt-4 text-black dark:text-white group-hover:text-brand-cyan transition-colors">{video.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{video.description}</p>
             </div>
           ))}
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setActiveVideo(null)}>
           <div className="w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl relative border border-gray-700" onClick={e => e.stopPropagation()}>
              <div className="aspect-video">
                <iframe 
                  src={activeVideo.videoUrl} 
                  title={activeVideo.title}
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6 bg-gray-900 text-white flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold mb-2">{activeVideo.title}</h2>
                    <p className="text-gray-400">{activeVideo.description}</p>
                 </div>
                 <button onClick={() => setActiveVideo(null)} className="text-gray-400 hover:text-white">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
