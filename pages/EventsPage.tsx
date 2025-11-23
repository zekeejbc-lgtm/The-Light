
import React, { useEffect, useState } from 'react';
import { SchoolEvent, UserRole } from '../types';
import { getSchoolEvents, deleteEvent, updateEvent } from '../services/contentService';
import { getCurrentUser } from '../services/authService';
import Skeleton from '../components/Skeleton';
import CustomSelect from '../components/CustomSelect';
import { useToast } from '../context/ToastContext';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  
  // Admin Editing State
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser && (currentUser.role === UserRole.AUDITOR || currentUser.role === UserRole.EIC);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await getSchoolEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const categories = ['All', 'Academic', 'Sports', 'Arts', 'Club', 'General'];
  
  const filteredEvents = filter === 'All' ? events : events.filter(e => e.category === filter);

  const groupedEvents: { [key: string]: SchoolEvent[] } = {};
  filteredEvents.forEach(event => {
      if (!groupedEvents[event.date]) {
          groupedEvents[event.date] = [];
      }
      groupedEvents[event.date].push(event);
  });

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'Sports': return 'bg-orange-500';
          case 'Academic': return 'bg-blue-500';
          case 'Arts': return 'bg-purple-500';
          case 'Club': return 'bg-pink-500';
          default: return 'bg-green-500';
      }
  };

  const toggleExpand = (id: string) => {
      if (expandedEventId === id) setExpandedEventId(null);
      else setExpandedEventId(id);
  }

  const handleDelete = async (id: string) => {
      if(confirm("Are you sure you want to delete this event?")) {
          await deleteEvent(id);
          addToast("Event deleted.", "success");
          load();
      }
  }

  const openEditModal = (event: SchoolEvent) => {
      setEditingEvent({...event});
      setShowEditModal(true);
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      if(editingEvent) {
          await updateEvent(editingEvent);
          addToast("Event updated successfully.", "success");
          setShowEditModal(false);
          setEditingEvent(null);
          load();
      }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-serif font-black text-black dark:text-white uppercase tracking-tighter mb-4">
          Campus Calendar
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Stay updated with schedules, agendas, and what's happening around school.
        </p>
      </div>

      <div className="flex justify-center mb-10 overflow-x-auto py-2">
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-md font-bold text-sm uppercase transition-all whitespace-nowrap ${filter === cat ? 'bg-black text-white dark:bg-brand-yellow dark:text-black shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </div>

      {loading ? (
        <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : sortedDates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 font-bold">No events found in this category.</p>
          </div>
      ) : (
        <div className="space-y-8 relative">
            {/* Vertical Timeline Line */}
            <div className="hidden md:block absolute left-[120px] top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700"></div>

            {sortedDates.map(dateKey => (
                <div key={dateKey} className="flex flex-col md:flex-row gap-6 relative">
                    {/* Date Header */}
                    <div className="md:w-[120px] flex-shrink-0 flex flex-col items-center md:items-end md:pr-8 md:text-right z-10">
                        <div className="bg-brand-yellow text-black border-2 border-black rounded-lg p-2 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-24">
                            <span className="block text-3xl font-black leading-none">{new Date(dateKey).getDate()}</span>
                            <span className="block text-xs font-bold uppercase">{new Date(dateKey).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <span className="mt-1 text-xs font-bold text-gray-400">{new Date(dateKey).getFullYear()}</span>
                    </div>

                    {/* Events for this Date */}
                    <div className="flex-1 space-y-6">
                        {groupedEvents[dateKey].map(event => (
                            <div key={event.id} className={`bg-white dark:bg-brand-dark border-2 rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] transition-all ${event.status === 'cancelled' ? 'border-red-400 opacity-80' : 'border-black dark:border-gray-600'}`}>
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-6 flex-1 relative">
                                        {/* Status Badge */}
                                        {event.status === 'rescheduled' && (
                                            <div className="absolute top-0 right-0 bg-brand-yellow text-black text-xs font-bold px-3 py-1 rounded-bl-lg border-l-2 border-b-2 border-black uppercase tracking-wider">
                                                Rescheduled
                                            </div>
                                        )}
                                        {event.status === 'cancelled' && (
                                            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg border-l-2 border-b-2 border-black uppercase tracking-wider">
                                                Cancelled
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className={`${getCategoryColor(event.category)} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                                                {event.category}
                                            </span>
                                            {event.subEvents && event.subEvents.length > 0 && (
                                                <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                    Has Agenda
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h3 className={`text-2xl font-bold mb-2 ${event.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-black dark:text-white'}`}>{event.title}</h3>
                                        
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {event.location}
                                        </div>
                                        <p className="text-gray-600 dark:text-brand-cream">{event.description}</p>
                                        
                                        {/* Sub-Events / Agenda Toggle */}
                                        {event.subEvents && event.subEvents.length > 0 && event.status !== 'cancelled' && (
                                            <div className="mt-4">
                                                <button 
                                                    onClick={() => toggleExpand(event.id)}
                                                    className="text-sm font-bold text-brand-cyan hover:underline flex items-center"
                                                >
                                                    {expandedEventId === event.id ? 'Hide Schedule' : 'View Full Schedule'}
                                                    <svg className={`w-4 h-4 ml-1 transform transition-transform ${expandedEventId === event.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                
                                                {expandedEventId === event.id && (
                                                    <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-brand-cyan animate-fade-in-down">
                                                        <h4 className="font-bold text-sm uppercase mb-3 text-gray-500 dark:text-gray-400">Day Agenda</h4>
                                                        <div className="space-y-3">
                                                            {event.subEvents.map(sub => (
                                                                <div key={sub.id} className="flex gap-4 items-start">
                                                                    <span className="text-sm font-bold font-mono text-black dark:text-brand-yellow w-20 flex-shrink-0">{sub.time}</span>
                                                                    <div>
                                                                        <p className="font-bold text-sm dark:text-white leading-none">{sub.title}</p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">{sub.location}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Admin Controls */}
                                        {isAdmin && (
                                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                                                <button onClick={() => openEditModal(event)} className="text-xs font-bold uppercase bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800">
                                                    Edit / Reschedule
                                                </button>
                                                <button onClick={() => handleDelete(event.id)} className="text-xs font-bold uppercase border border-red-500 text-red-500 px-3 py-1.5 rounded hover:bg-red-50">
                                                    Delete
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                    {event.imageUrl && (
                                        <div className="md:w-64 h-48 md:h-auto border-t md:border-t-0 md:border-l border-black dark:border-gray-600">
                                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Edit/Reschedule Modal */}
      {showEditModal && editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
              <div className="bg-white dark:bg-brand-dark w-full max-w-md rounded-lg p-6 relative z-10 shadow-2xl border-2 border-black animate-fade-in-up">
                  <h3 className="text-xl font-black uppercase mb-4 dark:text-white">Edit Event</h3>
                  <form onSubmit={handleUpdateEvent} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Event Title</label>
                          <input 
                             className="w-full p-2 border-2 border-gray-200 rounded dark:bg-black dark:text-white dark:border-gray-600"
                             value={editingEvent.title}
                             onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                             required
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Date</label>
                            <input 
                                type="date"
                                className="w-full p-2 border-2 border-gray-200 rounded dark:bg-black dark:text-white dark:border-gray-600"
                                value={editingEvent.date}
                                onChange={e => setEditingEvent({...editingEvent, date: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Status</label>
                            <CustomSelect 
                                options={[
                                    {value: 'scheduled', label: 'Scheduled'},
                                    {value: 'rescheduled', label: 'Rescheduled'},
                                    {value: 'cancelled', label: 'Cancelled'}
                                ]}
                                value={editingEvent.status || 'scheduled'}
                                onChange={val => setEditingEvent({...editingEvent, status: val as any})}
                            />
                        </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Location</label>
                          <input 
                             className="w-full p-2 border-2 border-gray-200 rounded dark:bg-black dark:text-white dark:border-gray-600"
                             value={editingEvent.location}
                             onChange={e => setEditingEvent({...editingEvent, location: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Description</label>
                          <textarea 
                             className="w-full p-2 border-2 border-gray-200 rounded dark:bg-black dark:text-white dark:border-gray-600"
                             value={editingEvent.description}
                             onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                             rows={3}
                          />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 font-bold text-gray-500 uppercase hover:text-black">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-brand-cyan text-white font-bold uppercase rounded hover:opacity-90">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default EventsPage;
