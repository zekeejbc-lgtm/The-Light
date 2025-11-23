
import React, { useEffect, useState } from 'react';
import { TeamMember } from '../types';
import { getTeamMembers } from '../services/contentService';
import Skeleton from '../components/Skeleton';
import CustomSelect from '../components/CustomSelect';

const AboutPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [filteredTeam, setFilteredTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [filterRole, setFilterRole] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getTeamMembers();
      setTeam(data);
      setFilteredTeam(data);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
      let result = team;
      if (filterRole !== 'All') {
          result = result.filter(m => m.role.includes(filterRole));
      }
      if (searchTerm) {
          result = result.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.role.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setFilteredTeam(result);
  }, [filterRole, searchTerm, team]);

  const roles = ['All', ...Array.from(new Set(team.map(m => m.role)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-serif font-black text-black dark:text-brand-yellow uppercase tracking-tighter mb-6">
          About The Light
        </h1>
        <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
           <p className="dark:text-brand-cream">
             The Light Publication is the official student-run journalism organization of our campus. 
             Established in 1998, we are dedicated to delivering accurate, timely, and impactful stories 
             that matter to the student body.
           </p>
           <p className="dark:text-brand-cream">
             Our mission is to empower student voices, foster transparency, and uphold the highest 
             standards of ethical journalism.
           </p>
        </div>
      </div>

      <div className="border-t-4 border-black dark:border-white my-12"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-serif font-black text-black dark:text-brand-yellow uppercase">Editorial Board</h2>
          <div className="flex flex-wrap gap-2 items-center">
              <input 
                 placeholder="Search name..." 
                 className="p-3 border-2 border-gray-300 rounded-lg dark:bg-brand-dark dark:text-white dark:border-gray-600 focus:border-black dark:focus:border-white outline-none"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="w-48">
                <CustomSelect 
                    options={roles.map(r => ({ value: r, label: r }))}
                    value={filterRole}
                    onChange={setFilterRole}
                    placeholder="Filter by Role"
                />
              </div>
          </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTeam.map(member => (
               <div key={member.id} onClick={() => setSelectedMember(member)} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                  <div className="aspect-square bg-gray-200 overflow-hidden">
                     <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6 text-center">
                     <h3 className="text-xl font-bold text-black dark:text-brand-yellow">{member.name}</h3>
                     <p className="text-brand-cyan font-bold text-sm uppercase tracking-widest mb-4">{member.role}</p>
                     <p className="text-sm text-gray-600 dark:text-brand-cream italic line-clamp-2">"{member.bio}"</p>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedMember(null)}>
              <div className="bg-white dark:bg-brand-dark max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-yellow relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-2 rounded-full z-10">
                    <svg className="w-6 h-6 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/2 aspect-square md:aspect-auto relative">
                          <img src={selectedMember.avatarUrl} alt={selectedMember.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="md:w-1/2 p-8 flex flex-col justify-center">
                          <h2 className="text-3xl font-serif font-black dark:text-brand-yellow mb-1">{selectedMember.name}</h2>
                          <p className="text-brand-cyan font-bold uppercase tracking-widest mb-6">{selectedMember.role}</p>
                          <div className="prose dark:prose-invert mb-6">
                              <p className="italic text-gray-600 dark:text-brand-cream text-lg">"{selectedMember.bio}"</p>
                          </div>
                          
                          <div className="space-y-3">
                              {selectedMember.email && (
                                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                      {selectedMember.email}
                                  </div>
                              )}
                              {selectedMember.socialLinks?.twitter && (
                                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                                      {selectedMember.socialLinks.twitter}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AboutPage;
