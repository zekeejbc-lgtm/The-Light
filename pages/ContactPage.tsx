
import React, { useState } from 'react';
import { sendContactMessage } from '../services/contentService';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await sendContactMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
           <h1 className="text-4xl md:text-6xl font-serif font-black text-black dark:text-brand-yellow uppercase tracking-tighter mb-6">
             Contact Us
           </h1>
           <p className="text-xl text-gray-600 dark:text-brand-cream mb-8">
             Have a story tip? Want to join the team? Or just want to say hello? We'd love to hear from you.
           </p>
           
           <div className="space-y-6">
              <div className="flex items-start space-x-4">
                 <div className="bg-brand-yellow p-3 rounded-full border-2 border-black">
                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg dark:text-brand-yellow">Visit Us</h3>
                    <p className="text-gray-600 dark:text-brand-cream">Student Center, Room 304<br/>University Campus, 12345</p>
                 </div>
              </div>
              
              <div className="flex items-start space-x-4">
                 <div className="bg-brand-cyan p-3 rounded-full border-2 border-black">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg dark:text-brand-yellow">Email Us</h3>
                    <p className="text-gray-600 dark:text-brand-cream">editorial@light.edu<br/>tips@light.edu</p>
                 </div>
              </div>

              <div className="flex items-start space-x-4">
                 <div className="bg-blue-600 p-3 rounded-full border-2 border-black">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg dark:text-brand-yellow">Follow Us</h3>
                    <a href="https://www.facebook.com/TheLightPub" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">facebook.com/TheLightPub</a>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)]">
           <h3 className="text-2xl font-bold mb-6 dark:text-brand-yellow">Send a Message</h3>
           {submitted ? (
               <div className="bg-green-100 text-green-800 p-4 rounded border border-green-300">
                   <p className="font-bold">Message sent successfully!</p>
                   <button onClick={() => setSubmitted(false)} className="text-sm underline mt-2">Send another</button>
               </div>
           ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-bold mb-1 dark:text-brand-cream">Name</label>
                    <input className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1 dark:text-brand-cream">Email</label>
                    <input type="email" className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1 dark:text-brand-cream">Message</label>
                    <textarea className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white h-32" placeholder="How can we help?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required></textarea>
                </div>
                <button type="submit" className="w-full bg-black text-white dark:bg-brand-yellow dark:text-black py-3 rounded font-bold uppercase tracking-wider hover:opacity-80 transition-opacity">
                    Send Message
                </button>
            </form>
           )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
