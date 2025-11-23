import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, label, placeholder = 'Select an option', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-3 border-2 rounded-lg flex justify-between items-center transition-all outline-none bg-white dark:bg-black
          ${isOpen ? 'border-brand-cyan shadow-[4px_4px_0px_0px_#00BCD4]' : 'border-gray-200 dark:border-gray-600 hover:border-black dark:hover:border-white'}
        `}
      >
        <span className={`font-bold text-sm ${selectedOption ? 'text-black dark:text-white' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-brand-dark border-2 border-black dark:border-white rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] max-h-60 overflow-y-auto animate-fade-in-down">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 text-sm font-bold border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-brand-yellow hover:text-black transition-colors
                ${option.value === value ? 'bg-gray-50 dark:bg-gray-800 text-brand-cyan' : 'text-gray-700 dark:text-gray-200'}
              `}
            >
              {option.label}
            </button>
          ))}
          {options.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500 italic">No options available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;