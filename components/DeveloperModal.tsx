
import React, { useState } from 'react';

const DeveloperModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Preview Card (Trigger) */}
            <button 
                onClick={() => setIsOpen(true)}
                className="group flex items-center space-x-3 bg-gray-900 dark:bg-black hover:bg-gray-800 dark:hover:bg-gray-900 transition-colors px-4 py-3 rounded-lg border border-gray-800 dark:border-gray-700 max-w-xs text-left"
            >
                <div className="w-10 h-10 rounded-full bg-brand-cyan flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                    &lt;/&gt;
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Developed By</p>
                    <p className="text-sm font-bold text-white group-hover:text-brand-yellow transition-colors">Tech Team '24</p>
                </div>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
                    
                    <div className="relative bg-white dark:bg-brand-dark w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-cyan animate-fade-in-up">
                        <div className="bg-brand-cyan p-6 text-center relative">
                             <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white hover:text-black transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                             <div className="w-20 h-20 bg-white dark:bg-brand-dark rounded-full mx-auto flex items-center justify-center border-4 border-white dark:border-brand-dark shadow-lg text-3xl mb-2">
                                💻
                             </div>
                             <h2 className="text-2xl font-black text-white uppercase tracking-tight">The Creators</h2>
                             <p className="text-white/80 text-sm font-bold uppercase tracking-widest">School Publication Tech Team</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                             <p className="text-center text-gray-600 dark:text-gray-300 italic text-sm mb-6">
                                "Building digital bridges for student voices."
                             </p>

                             <div className="space-y-3">
                                 <div className="flex items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                     <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center text-black font-bold mr-3">L</div>
                                     <div>
                                         <p className="font-bold text-black dark:text-white">Lead Developer</p>
                                         <p className="text-xs text-gray-500">Full Stack Engineering</p>
                                     </div>
                                 </div>

                                 <div className="flex items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                     <div className="w-10 h-10 bg-brand-black text-white rounded-full flex items-center justify-center font-bold mr-3">D</div>
                                     <div>
                                         <p className="font-bold text-black dark:text-white">UI/UX Designer</p>
                                         <p className="text-xs text-gray-500">Interface & Accessibility</p>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                                 <p className="text-xs text-gray-400 font-mono">v1.2.0 • Built with React & Gemini</p>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeveloperModal;