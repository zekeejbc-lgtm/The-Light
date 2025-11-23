
import React, { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  text: string;
  title: string;
  onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, title, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // We split text into chunks because some browsers freeze on very long strings
  const chunksRef = useRef<string[]>([]);
  const currentChunkIndex = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    // Load voices
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      // Try to find a good English voice
      const preferred = available.find(v => v.name.includes('Google US English')) || 
                        available.find(v => v.name.includes('English')) || 
                        available[0];
      setSelectedVoice(preferred);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Prepare text (Strip markdown approx)
    const cleanText = text
      .replace(/#{1,6}\s/g, '') // headers
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
      .replace(/(\*|_)(.*?)\1/g, '$2') // italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/`{3}[\s\S]*?`{3}/g, 'Code block skipped.') // code blocks
      .replace(/\n/g, '. '); // newlines to pauses

    // Split into sentences/paragraphs for better stability
    chunksRef.current = cleanText.match(/[^.!?]+[.!?]+[\])'"]?/g) || [cleanText];

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  const speakChunk = (index: number) => {
    if (index >= chunksRef.current.length) {
      setIsPlaying(false);
      setProgress(100);
      return;
    }

    const chunk = chunksRef.current[index];
    const utterance = new SpeechSynthesisUtterance(chunk);
    
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      currentChunkIndex.current++;
      // Calculate rough progress
      setProgress((currentChunkIndex.current / chunksRef.current.length) * 100);
      
      if (isPlaying && !isPaused) {
        speakChunk(currentChunkIndex.current);
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech error", e);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      currentChunkIndex.current = 0;
      setProgress(0);
      setIsPlaying(true);
      setIsPaused(false);
      speakChunk(0);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    currentChunkIndex.current = 0;
  };

  const toggleRate = () => {
    const newRate = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(newRate);
    // Note: Changing rate mid-speech requires restart in most browsers, 
    // keeping it simple here by just updating state for next chunk or restart.
    if (isPlaying) {
        // optional: restart current chunk with new rate
    }
  };

  if (!supported) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-yellow border-t-4 border-black shadow-[0px_-4px_10px_rgba(0,0,0,0.1)] animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Info Area */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Now Reading</div>
          <div className="font-serif font-bold text-black truncate text-lg leading-none">{title}</div>
          {/* Progress Bar */}
          <div className="w-full bg-black/10 h-1 mt-2 rounded-full overflow-hidden">
             <div className="h-full bg-black transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
           <button 
             onClick={toggleRate}
             className="text-xs font-black border-2 border-black px-2 py-1 rounded bg-white hover:bg-gray-100 w-12"
           >
             {rate}x
           </button>

           <div className="flex items-center gap-2">
             <button 
               onClick={handleStop}
               className="p-2 rounded-full hover:bg-black/10 text-black transition-colors"
               title="Stop"
             >
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
             </button>

             {isPlaying ? (
               <button 
                 onClick={handlePause}
                 className="w-12 h-12 flex items-center justify-center bg-black text-brand-yellow rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform"
               >
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
               </button>
             ) : (
               <button 
                 onClick={handlePlay}
                 className="w-12 h-12 flex items-center justify-center bg-black text-brand-yellow rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform"
               >
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
               </button>
             )}
           </div>

           <button onClick={onClose} className="p-2 text-black/50 hover:text-black">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
