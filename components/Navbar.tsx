
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageConfig, User, UserRole } from '../types';
import { getPages, getSystemConfig } from '../services/contentService';
import { useTheme } from '../context/ThemeContext';
import SearchModal from './SearchModal';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Mobile Menu Accordion State
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  
  // Dynamic Theme State
  const [logoUrl, setLogoUrl] = useState('https://i.imgur.com/WhsJ3hf.jpeg');
  const [pubName, setPubName] = useState('THE LIGHT');

  const location = useLocation();
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      const data = await getPages();
      const config = await getSystemConfig();
      
      // Filter out hidden pages unless user is Admin/EIC
      const isAdmin = user && (user.role === UserRole.AUDITOR || user.role === UserRole.EIC);
      setPages(data.filter(p => p.isVisible || isAdmin));
      setMaintenance(config.maintenanceMode);

      if (config.theme) {
        setLogoUrl(config.theme.logoUrl);
        setPubName(config.theme.publicationName);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Desktop Menu Logic
  const VISIBLE_COUNT = 5; 
  const visiblePages = pages.filter(p => p.type === 'category').slice(0, VISIBLE_COUNT);
  const hiddenPages = pages.filter(p => !visiblePages.includes(p)); // Everything else in "More"

  const getLinkPath = (page: PageConfig) => {
     return page.type === 'static' ? `/${page.slug}` : `/category/${page.slug}`;
  };

  const toggleMobileGroup = (group: string) => {
      setMobileSection(mobileSection === group ? null : group);
  };

  // Mobile Grouping Logic
  const categoryPages = pages.filter(p => p.type === 'category');
  const mediaPages = pages.filter(p => ['gallery', 'videos'].includes(p.slug));
  const infoPages = pages.filter(p => ['about', 'contact'].includes(p.slug));

  return (
    <>
    <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    {maintenance && (
        <div className="bg-red-600 text-white text-xs font-bold text-center py-1 uppercase tracking-widest">
            System Maintenance Mode Active
        </div>
    )}
    <nav className="sticky top-0 z-50 bg-brand-yellow dark:bg-brand-gray border-b-4 border-black dark:border-white shadow-md w-full transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group no-underline">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-black dark:border-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all bg-white">
                 <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-start justify-center h-full">
                <span className="font-serif font-black text-xl md:text-2xl tracking-tight text-black dark:text-brand-yellow leading-none transition-colors uppercase">
                  {pubName}
                </span>
                <span className="font-sans text-[10px] font-bold tracking-[0.2em] text-gray-800 dark:text-brand-cream uppercase leading-none mt-0.5 ml-0.5 transition-colors">Publication</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {visiblePages.map((page) => (
              <Link
                key={page.id}
                to={getLinkPath(page)}
                className={`px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-all border-2 border-transparent ${
                  location.pathname === getLinkPath(page)
                    ? 'bg-black dark:bg-white text-brand-yellow dark:text-black border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]'
                    : 'text-black dark:text-brand-yellow hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {page.title}
                {!page.isVisible && <span className="ml-1 text-[8px] bg-red-500 text-white px-1 rounded">HIDDEN</span>}
              </Link>
            ))}

            <Link
                to="/events"
                className={`px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-all border-2 border-transparent ${
                  location.pathname === '/events'
                    ? 'bg-black dark:bg-white text-brand-yellow dark:text-black border-black dark:border-white'
                    : 'text-black dark:text-brand-yellow hover:bg-black/5 dark:hover:bg-white/10'
                }`}
            >
                Events
            </Link>

            {/* More Dropdown */}
            {hiddenPages.length > 0 && (
                <div className="relative" ref={moreDropdownRef}>
                    <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${moreOpen ? 'bg-black text-brand-yellow' : 'text-black dark:text-brand-yellow hover:bg-black/5 dark:hover:bg-white/10'}`}
                    >
                    More
                    <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    </button>
                    
                    {moreOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-brand-gray border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-md py-1 z-50 animate-fade-in-down origin-top-right">
                         {/* Remaining Categories */}
                        {hiddenPages.filter(p => p.type === 'category').map((page) => (
                        <Link
                            key={page.id}
                            to={getLinkPath(page)}
                            onClick={() => setMoreOpen(false)}
                            className="block px-4 py-2 text-sm font-bold text-gray-700 dark:text-brand-cream hover:bg-brand-yellow hover:text-black uppercase transition-colors"
                        >
                            {page.title}
                            {!page.isVisible && <span className="ml-2 text-[8px] bg-red-500 text-white px-1 rounded">HIDDEN</span>}
                        </Link>
                        ))}
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-1 mb-1"></div>
                        <Link to="/print-editions" onClick={() => setMoreOpen(false)} className="block px-4 py-2 text-sm font-bold text-gray-700 dark:text-brand-cream hover:bg-brand-yellow hover:text-black uppercase">Archives</Link>
                        <Link to="/videos" onClick={() => setMoreOpen(false)} className="block px-4 py-2 text-sm font-bold text-gray-700 dark:text-brand-cream hover:bg-brand-yellow hover:text-black uppercase">Videos</Link>
                        <Link to="/gallery" onClick={() => setMoreOpen(false)} className="block px-4 py-2 text-sm font-bold text-gray-700 dark:text-brand-cream hover:bg-brand-yellow hover:text-black uppercase">Gallery</Link>
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-1 mb-1"></div>
                        <Link to="/about" onClick={() => setMoreOpen(false)} className="block px-4 py-2 text-sm font-bold text-gray-700 dark:text-brand-cream hover:bg-brand-yellow hover:text-black uppercase">About</Link>
                        <Link to="/contact" onClick={() => setMoreOpen(false)} className="block px-4 py-2 text-sm font-bold text-gray-700 dark:text-brand-cream hover:bg-brand-yellow hover:text-black uppercase">Contact</Link>
                    </div>
                    )}
                </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-black dark:text-brand-yellow hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </button>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 text-black dark:text-brand-yellow hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            {user ? (
              <div className="relative ml-2 flex items-center gap-2">
                 <Link to="/dashboard" className="hidden md:flex items-center gap-2 px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold text-xs uppercase tracking-wide border border-transparent hover:opacity-80 transition-opacity">
                    <span>Dashboard</span>
                 </Link>
                 <div className="w-8 h-8 rounded-full bg-brand-cyan border-2 border-black dark:border-white overflow-hidden">
                    <img src={user.avatar || 'https://via.placeholder.com/150'} alt="User" className="w-full h-full object-cover" />
                 </div>
              </div>
            ) : (
              <Link to="/login" className="ml-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold text-xs uppercase tracking-wide border-2 border-transparent hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden p-2 text-black dark:text-brand-yellow"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Collapsible Accordion Style) */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-brand-gray border-t-2 border-black dark:border-gray-700 animate-fade-in-down h-[calc(100vh-80px)] overflow-y-auto pb-20">
          
          {/* User Section for Mobile */}
          {user ? (
             <div className="p-4 bg-brand-yellow/10 border-b border-black/10 dark:border-white/10">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-brand-cyan border border-black overflow-hidden">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-sm dark:text-white">{user.name}</p>
                        <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-brand-yellow">{user.role}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-center bg-black text-white dark:bg-white dark:text-black py-2 rounded font-bold text-xs uppercase tracking-wide">
                        Dashboard
                    </Link>
                    <button onClick={() => { onLogout(); setIsOpen(false); }} className="text-center bg-red-100 text-red-700 py-2 rounded font-bold text-xs uppercase tracking-wide">
                        Logout
                    </button>
                 </div>
             </div>
          ) : (
             <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center bg-black text-white dark:bg-white dark:text-black py-3 rounded font-bold uppercase tracking-widest text-sm shadow-md">
                   Login / Register
                </Link>
             </div>
          )}

          {/* SECTIONS GROUP */}
          <div className="border-b border-gray-100 dark:border-gray-700">
             <button 
                onClick={() => toggleMobileGroup('sections')}
                className="flex items-center justify-between w-full px-4 py-4 text-left font-black text-black dark:text-brand-yellow uppercase tracking-widest text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
             >
                <span>Sections</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${mobileSection === 'sections' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
             </button>
             <div className={`overflow-hidden transition-all duration-300 bg-gray-50 dark:bg-black/20 ${mobileSection === 'sections' ? 'max-h-[500px] border-b border-gray-100 dark:border-gray-700' : 'max-h-0'}`}>
                {categoryPages.map((page) => (
                    <Link
                        key={page.id}
                        to={getLinkPath(page)}
                        onClick={() => setIsOpen(false)}
                        className="block px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-cyan uppercase"
                    >
                        {page.title}
                    </Link>
                ))}
             </div>
          </div>

          {/* EXPLORE GROUP */}
          <div className="border-b border-gray-100 dark:border-gray-700">
             <button 
                onClick={() => toggleMobileGroup('explore')}
                className="flex items-center justify-between w-full px-4 py-4 text-left font-black text-black dark:text-brand-yellow uppercase tracking-widest text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
             >
                <span>Explore</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${mobileSection === 'explore' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
             </button>
             <div className={`overflow-hidden transition-all duration-300 bg-gray-50 dark:bg-black/20 ${mobileSection === 'explore' ? 'max-h-[500px] border-b border-gray-100 dark:border-gray-700' : 'max-h-0'}`}>
                <Link to="/events" onClick={() => setIsOpen(false)} className="block px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-cyan uppercase">Events Calendar</Link>
                <Link to="/videos" onClick={() => setIsOpen(false)} className="block px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-cyan uppercase">Video Library</Link>
                <Link to="/gallery" onClick={() => setIsOpen(false)} className="block px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-cyan uppercase">Photo Gallery</Link>
                <Link to="/print-editions" onClick={() => setIsOpen(false)} className="block px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-cyan uppercase">Archives & Print</Link>
             </div>
          </div>

          {/* INFORMATION GROUP */}
          <div className="border-b border-gray-100 dark:border-gray-700">
             <button 
                onClick={() => toggleMobileGroup('info')}
                className="flex items-center justify-between w-full px-4 py-4 text-left font-black text-black dark:text-brand-yellow uppercase tracking-widest text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
             >
                <span>Information</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${mobileSection === 'info' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
             </button>
             <div className={`overflow-hidden transition-all duration-300 bg-gray-50 dark:bg-black/20 ${mobileSection === 'info' ? 'max-h-[500px] border-b border-gray-100 dark:border-gray-700' : 'max-h-0'}`}>
                <Link to="/about" onClick={() => setIsOpen(false)} className="block px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-cyan uppercase">About The Light</Link>
                <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-cyan uppercase">Contact Us</Link>
             </div>
          </div>

        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;
