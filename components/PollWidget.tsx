
import React, { useState, useEffect } from 'react';
import { Poll } from '../types';
import { getActivePoll, votePoll } from '../services/contentService';

const PollWidget: React.FC = () => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPoll = async () => {
      const data = await getActivePoll();
      setPoll(data);
      const voted = localStorage.getItem(`poll_voted_${data.id}`);
      if (voted) setHasVoted(true);
      setLoading(false);
    };
    loadPoll();
  }, []);

  const handleVote = async (optionId: string) => {
    if (!poll || hasVoted) return;
    
    // Optimistic update
    setHasVoted(true);
    if (poll) {
       localStorage.setItem(`poll_voted_${poll.id}`, 'true');
       const updatedPoll = await votePoll(poll.id, optionId);
       setPoll(updatedPoll);
    }
  };

  if (loading || !poll) return null;

  return (
    <div className="bg-white dark:bg-brand-gray border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-xl p-6 mb-8 animate-fade-in-up transition-colors">
      <div className="flex items-center space-x-2 mb-4">
        <span className="bg-brand-cyan text-white text-xs font-bold px-2 py-1 uppercase tracking-widest border border-black dark:border-white">Weekly Poll</span>
      </div>
      <h3 className="text-xl font-serif font-black text-black dark:text-white mb-6 leading-tight">
        {poll.question}
      </h3>
      
      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
          
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted}
              className={`relative w-full text-left p-3 border-2 rounded-lg transition-all overflow-hidden ${
                hasVoted 
                ? 'border-gray-200 dark:border-gray-700 cursor-default' 
                : 'border-black dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:-translate-y-1 hover:shadow-md'
              }`}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <div 
                  className="absolute top-0 left-0 h-full bg-brand-yellow/30 dark:bg-brand-cyan/30 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              )}
              
              <div className="relative flex justify-between items-center z-10">
                <span className={`font-bold ${hasVoted ? 'text-gray-800 dark:text-gray-200' : 'text-black dark:text-white'}`}>
                  {option.text}
                </span>
                {hasVoted && (
                  <span className="font-black text-black dark:text-white text-sm">{percentage}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-3 font-bold uppercase tracking-wide">
        {poll.totalVotes} Votes cast
      </p>
    </div>
  );
};

export default PollWidget;
