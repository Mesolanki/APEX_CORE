import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit } from 'lucide-react';
import { API_BASE } from '../api';

const EventsManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ 
        target: '', eventType: 'Online', entryPrize: 'Free', winningPrize: 'TBD', class: 'UNCLASSIFIED', status: 'Upcoming', description: '', host: '', coverImage: '', participants: 0, region: 'GLOBAL'
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/events`);
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events', error);
        }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/api/events`, formData);
            setIsFormOpen(false);
            setFormData({ target: '', eventType: 'Online', entryPrize: 'Free', winningPrize: 'TBD', class: 'UNCLASSIFIED', status: 'Upcoming', description: '', host: '', coverImage: '', participants: 0, region: 'GLOBAL' });
            fetchEvents();
        } catch (error) {
            console.error('Failed to create event', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE}/api/events/${id}`);
            fetchEvents();
        } catch (error) {
            console.error('Failed to delete event', error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Events Command</h1>
                    <p className="text-gray-400 mt-1">Manage global racing events and tournaments.</p>
                </div>
                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Event
                </button>
            </div>

            {isFormOpen && (
                <div className="glass p-6 rounded-2xl border border-primary/20 bg-primary/5">
                    <h3 className="text-xl font-semibold mb-4 text-white">Create New Event</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="Event Target / Title" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
                            <select value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                            </select>
                            <input type="text" placeholder="Class (e.g. S-CLASS)" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Entry Prize / Fee" value={formData.entryPrize} onChange={e => setFormData({...formData, entryPrize: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            <input type="text" placeholder="Winning Prize" value={formData.winningPrize} onChange={e => setFormData({...formData, winningPrize: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            <input type="text" placeholder="Region / Location" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            <input type="text" placeholder="Cover Image URL" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>
                        <textarea placeholder="Event Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-24"></textarea>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                            <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium transition-colors">Deploy Event</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p className="text-gray-400">Loading events...</p> : events.map(event => (
                    <div key={event._id} className="glass rounded-xl overflow-hidden group border border-white/5 relative flex flex-col">
                        <div className="h-40 bg-surface relative overflow-hidden">
                            {event.coverImage ? (
                                <img src={event.coverImage} alt={event.target} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale opacity-80" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-surface">No Image</div>
                            )}
                            <div className="absolute top-3 left-3 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-sm text-xs font-bold text-primary border border-primary/20 uppercase tracking-widest">
                                {event.eventType}
                            </div>
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-primary border border-primary/20">
                                {event.status}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <p className="text-xs text-primary font-bold tracking-widest mb-1">{event.class}</p>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase truncate">{event.target}</h3>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                            
                            <div className="mt-auto grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
                                <div><span className="text-gray-500">Entry:</span> <span className="text-white">{event.entryPrize}</span></div>
                                <div className="text-right"><span className="text-gray-500">Won:</span> <span className="text-green-400">{event.winningPrize}</span></div>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(event._id)} className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventsManagement;