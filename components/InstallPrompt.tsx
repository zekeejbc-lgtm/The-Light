
import React, { useEffect, useState } from 'react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-fade-in-up">
      <div className="bg-brand-yellow border-t-4 border-black p-6 shadow-[0px_-4px_10px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg border-2 border-black flex items-center justify-center shadow-sm">
                    <img src="https://i.imgur.com/WhsJ3hf.jpeg" alt="Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-black uppercase leading-none">Install The Light</h3>
                    <p className="text-sm font-bold text-gray-800 mt-1">Add to home screen for offline access.</p>
                </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={() => setIsVisible(false)}
                    className="flex-1 md:flex-none px-4 py-3 font-bold uppercase text-xs border-2 border-black text-black hover:bg-white/50 rounded transition-colors"
                >
                    Maybe Later
                </button>
                <button 
                    onClick={handleInstallClick}
                    className="flex-1 md:flex-none px-6 py-3 bg-black text-white font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all rounded border-2 border-transparent"
                >
                    Install App
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
