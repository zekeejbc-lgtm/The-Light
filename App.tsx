
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PrintEditions from './pages/PrintEditions';
import SavedArticles from './pages/SavedArticles';
import VideoGallery from './pages/VideoGallery';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import EventsPage from './pages/EventsPage';
import AuthorProfile from './pages/AuthorProfile';
import ChatBot from './components/ChatBot';
import BreakingNewsTicker from './components/BreakingNewsTicker';
import DeveloperModal from './components/DeveloperModal';
import InstallPrompt from './components/InstallPrompt';
import { User, UserRole, SystemConfig } from './types';
import { logout, getCurrentUser } from './services/authService';
import { getSystemConfig } from './services/contentService';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [breakingNews, setBreakingNews] = useState<SystemConfig['breakingNews']>(undefined);
  const [showTicker, setShowTicker] = useState(true);

  // Apply Theme Colors to CSS Variables
  const applyTheme = (config: SystemConfig) => {
     if (config.theme) {
         const root = document.documentElement;
         if (config.theme.primaryColor) {
             root.style.setProperty('--brand-primary', config.theme.primaryColor);
         }
         if (config.theme.accentColor) {
             root.style.setProperty('--brand-accent', config.theme.accentColor);
         }
     }
  };

  useEffect(() => {
    const init = async () => {
        const storedUser = getCurrentUser();
        if (storedUser) {
           setUser(storedUser);
        }
        const config = await getSystemConfig();
        setMaintenance(config.maintenanceMode);
        setBreakingNews(config.breakingNews);
        applyTheme(config); // Apply initial theme
        setLoading(false);
    };
    init();

    // Poll for system config changes
    const interval = setInterval(async () => {
        const config = await getSystemConfig();
        setMaintenance(config.maintenanceMode);
        setBreakingNews(config.breakingNews);
        applyTheme(config); // Keep theme synced
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('the_light_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    localStorage.removeItem('the_light_user');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-brand-yellow">Loading...</div>;

  // Global Maintenance Lock
  // Allow access only if user is logged in AND is Admin/EIC/Auditor
  const isPrivileged = user && (user.role === UserRole.AUDITOR || user.role === UserRole.EIC);
  
  if (maintenance && !isPrivileged) {
      return (
          <ThemeProvider>
              <div className="min-h-screen bg-brand-yellow flex flex-col items-center justify-center p-8 text-center">
                  <div className="bg-white p-10 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black max-w-md">
                      <div className="mb-6 flex justify-center">
                        <svg className="w-24 h-24 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">Under Maintenance</h1>
                      <p className="text-gray-600 mb-6 font-medium">The Light Publication is currently undergoing scheduled updates. We will be back shortly.</p>
                      {/* Allow login access for admins to turn it off */}
                      {!user && (
                        <button onClick={() => window.location.href = '/#/login'} className="text-xs text-gray-400 underline hover:text-black uppercase font-bold">Staff Login</button>
                      )}
                  </div>
              </div>
          </ThemeProvider>
      );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen flex flex-col font-sans text-brand-black dark:text-brand-cream transition-colors duration-300 relative">
            {/* Grain Overlay */}
            <div className="bg-noise"></div>
            
            {breakingNews?.enabled && showTicker && (
                <BreakingNewsTicker 
                    message={breakingNews.text} 
                    link={breakingNews.link} 
                    bgColor={breakingNews.bgColor}
                    textColor={breakingNews.textColor}
                    speed={breakingNews.speed}
                    onClose={() => setShowTicker(false)} 
                />
            )}

            <Navbar user={user} onLogout={handleLogout} />
            
            <main className="flex-grow bg-[#fdfdfd] dark:bg-brand-dark transition-colors duration-300">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/print-editions" element={<PrintEditions />} />
                <Route path="/videos" element={<VideoGallery />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/saved" element={<SavedArticles />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/author/:id" element={<AuthorProfile />} />
                <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
                <Route 
                  path="/dashboard/*" 
                  element={user ? <Dashboard user={user} onProfileUpdate={handleProfileUpdate} /> : <Navigate to="/login" />} 
                />
              </Routes>
            </main>

            <footer className="bg-black text-white py-12 border-t-8 border-brand-yellow dark:border-brand-cyan">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl font-serif font-bold text-brand-yellow">The Light Publication</h2>
                  <p className="text-gray-400 text-sm mt-1">Empowering Student Voices since 1998.</p>
                  <p className="text-sm text-gray-600 mt-4">
                    &copy; {new Date().getFullYear()} The Light Publication. All rights reserved.
                  </p>
                </div>

                {/* Developer Modal Trigger Area */}
                <div className="flex flex-col items-start md:items-end">
                    <DeveloperModal />
                </div>
              </div>
            </footer>
            
            <ChatBot />
            <InstallPrompt />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
