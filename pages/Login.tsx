
import React, { useState, useEffect } from 'react';
import { login, loginWithGoogle } from '../services/authService';
import { User } from '../types';
import { getSystemConfig } from '../services/contentService';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [pubName, setPubName] = useState('');

  // Signup specific fields
  const [fullName, setFullName] = useState('');
  const [gradeSection, setGradeSection] = useState('');

  const { addToast } = useToast();

  useEffect(() => {
    getSystemConfig().then(config => {
        setLogoUrl(config.theme.logoUrl);
        setPubName(config.theme.publicationName);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'login') {
          // For demo, simplistic login
          const user = await login(email, schoolId);
          addToast(`Welcome back, ${user.name}!`, 'success');
          onLogin(user);
      } else {
          // Simulate Signup
          await new Promise(resolve => setTimeout(resolve, 1000));
          addToast("Registration submitted! Please wait for admin approval.", 'success');
          setMode('login');
      }
    } catch (err: any) {
      addToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setLoading(true);
      try {
          const user = await loginWithGoogle();
          addToast(`Welcome back, ${user.name}!`, 'success');
          onLogin(user);
      } catch (err) {
          addToast("Google Login failed.", 'error');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-dark py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-black dark:border-gray-700 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-brand-yellow p-6 text-center border-b-2 border-black relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
           <div className="relative z-10 flex flex-col items-center">
               <div className="w-20 h-20 bg-white rounded-full border-2 border-black flex items-center justify-center mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                   {logoUrl ? (
                       <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
                   ) : (
                       <span className="text-2xl font-bold">TL</span>
                   )}
               </div>
               <h2 className="text-2xl font-black text-black uppercase tracking-tight leading-none">
                  {pubName || 'THE LIGHT'}
               </h2>
               <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Member Portal</p>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black dark:border-gray-700">
            <button 
                onClick={() => setMode('login')} 
                className={`flex-1 py-4 text-sm font-black uppercase tracking-wider ${mode === 'login' ? 'bg-white dark:bg-gray-900 text-brand-cyan border-b-4 border-brand-cyan' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'}`}
            >
                Sign In
            </button>
            <button 
                onClick={() => setMode('signup')} 
                className={`flex-1 py-4 text-sm font-black uppercase tracking-wider ${mode === 'signup' ? 'bg-white dark:bg-gray-900 text-brand-cyan border-b-4 border-brand-cyan' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'}`}
            >
                Register
            </button>
        </div>

        <div className="p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
                
                {mode === 'signup' && (
                    <div className="animate-fade-in-down space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-cyan focus:ring-0 outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Juan Dela Cruz"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Grade & Section</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-cyan focus:ring-0 outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="12 - STEM A"
                                value={gradeSection}
                                onChange={(e) => setGradeSection(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">School ID Number</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-cyan focus:ring-0 outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="2023-XXXX"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Institutional Email</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brand-cyan focus:ring-0 outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="student@light.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-lg text-white bg-black hover:bg-gray-800 shadow-[0_4px_0_rgb(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all"
                >
                    {loading ? 'Processing...' : mode === 'login' ? 'Access Dashboard' : 'Submit Application'}
                </button>
            </form>
            
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 font-medium">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                         <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                         </svg>
                         Google Account
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
