import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Trophy, Terminal, Zap, Crosshair } from 'lucide-react';
import { API_BASE } from '../api';

const DriversManagement = () => {
    const [players, setPlayers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ alias: '', rank: 1, country: '', team: '', car: '', portrait: '', winRate: '', status: 'Active' });

    useEffect(() => {
        fetchPlayersAndEvents();
    }, []);

    const fetchPlayersAndEvents = async () => {
        try {
            const [driversRes, gamesRes, eventsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/drivers`),
                axios.get(`${API_BASE}/api/games`).catch(() => ({ data: { liveEvents: [] } })),
                axios.get(`${API_BASE}/api/events`).catch(() => ({ data: [] }))
            ]);
            setPlayers(driversRes.data);
            
            // Combine events from Game DB and Events DB for the dropdown
            const legacyEvents = gamesRes.data?.liveEvents || [];
            const standardEvents = eventsRes.data || [];
            setEvents([...legacyEvents, ...standardEvents]);
        } catch (error) {
            console.error('Failed to fetch telemetry', error);
        }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/api/drivers`, formData);
            setIsFormOpen(false);
            setFormData({ alias: '', rank: 1, country: '', team: '', car: '', portrait: '', winRate: '', status: 'Active' });
            fetchPlayersAndEvents();
        } catch (error) {
            console.error('Failed to register top player', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE}/api/drivers/${id}`);
            fetchPlayersAndEvents();
        } catch (error) {
            console.error('Failed to delete top player', error);
        }
    };

    const handleEventSelect = (e) => {
        const val = e.target.value;
        if (!val) return;
        const selectedEvent = events.find((ev, i) => (ev._id || i).toString() === val);
        if (selectedEvent && (selectedEvent.winnerAlias || selectedEvent.winner)) {
            setFormData(prev => ({
                ...prev,
                alias: selectedEvent.winnerAlias || selectedEvent.winner,
                country: selectedEvent.region || '',
                winRate: '100% (Event Winner)'
            }));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono text-gray-200 uppercase selection:bg-red-600 selection:text-white">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-4 border-green-600 pl-6 relative">
                <div className="absolute top-1/2 -translate-y-1/2 -left-10 w-8 h-px bg-green-600/30" />
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2">TOP_PLAYERS</h1>
                    <p className="text-[10px] text-gray-500 tracking-[0.3em] bg-black border border-gray-900 px-3 py-1 inline-flex items-center gap-2">
                        <Terminal size={12} className="text-green-500" /> Leaderboard Matrix Online
                    </p>
                </div>
                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-black hover:bg-[#0a0a0a] border border-green-600 text-white px-6 py-3 font-black text-xs tracking-widest transition-colors flex items-center gap-3 shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] group"
                >
                    <Plus className="w-4 h-4 text-green-500 group-hover:rotate-90 transition-transform duration-300" /> ENROLL_PILOT
                </button>
            </div>

            {isFormOpen && (
                 <div className="bg-[#050505] p-8 md:p-10 border border-gray-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-800 to-green-500" />
                    <div className="flex items-center gap-4 mb-8 border-b border-gray-900 pb-4">
                        <Zap className="text-green-600" />
                        <h3 className="text-xl font-black italic text-white tracking-widest">NEW_LEADERBOARD_ENTRY</h3>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="bg-black border border-gray-900 p-6 mb-6">
                            <h4 className="text-[10px] text-green-500 font-bold tracking-[0.4em] mb-4">AUTO_FILL_FROM_EVENT</h4>
                            <select 
                                onChange={handleEventSelect} 
                                className="w-full bg-[#020202] border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors uppercase"
                            >
                                <option value="">-- SELECT RECENT EVENT --</option>
                                {events.map((ev, i) => (
                                    <option key={ev._id || i} value={ev._id || i}>
                                        {ev.target} {ev.winnerAlias ? `(WINNER: ${ev.winnerAlias})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" placeholder="PILOT_ALIAS" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-700" required />
                            <input type="number" placeholder="RANK_POSITION" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-700" required />
                            <input type="text" placeholder="SYNDICATE_TEAM" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-700" />
                            <input type="text" placeholder="PRIMARY_CHASSIS" value={formData.car} onChange={e => setFormData({...formData, car: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-700" />
                            <input type="text" placeholder="PORTRAIT_FEED_URL" value={formData.portrait} onChange={e => setFormData({...formData, portrait: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-700" />
                            <input type="text" placeholder="WIN_RATE_METRIC (E.G. 78%)" value={formData.winRate} onChange={e => setFormData({...formData, winRate: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-700" />
                            <input type="text" placeholder="REGION" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors placeholder:text-gray-700" />
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-green-500 transition-colors">
                                <option value="Active">ACTIVE_DUTY</option>
                                <option value="Inactive">M.I.A.</option>
                                <option value="Banned">BLACKLISTED</option>
                            </select>
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-12 border-t border-gray-900 pt-8">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-[10px] font-black tracking-widest text-gray-500 hover:text-white border border-transparent hover:border-gray-800 transition-all">ABORT_SEQUENCE</button>
                            <button type="submit" className="bg-green-600 text-white px-8 py-3 text-[10px] font-black tracking-widest border border-green-500 hover:bg-white hover:text-black transition-all flex items-center gap-2">EXECUTE_REGISTRATION <Terminal size={14} /></button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Zap className="mx-auto w-8 h-8 text-green-600 animate-pulse mb-4" />
                        <p className="text-[10px] font-black tracking-[0.5em] text-gray-500">SYNCING_ROSTER...</p>
                    </div>
                ) : players.map(player => (
                    <div key={player._id} className="bg-black border border-gray-800 group relative flex flex-col h-full hover:border-green-600/50 transition-colors overflow-hidden cursor-crosshair shadow-lg p-6">
                        <div className="absolute top-4 left-4 bg-green-600 text-white text-[10px] font-black px-2 py-1 tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.5)] z-10">
                            #{player.rank || 0}
                        </div>
                        
                        <div className="w-24 h-24 mx-auto rounded-full bg-[#020202] border border-gray-800 p-1 mb-6 relative overflow-hidden group-hover:border-green-500 transition-colors z-10">
                            {player.portrait ? (
                                <img src={player.portrait} alt={player.alias} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center text-gray-600 font-bold text-2xl group-hover:text-green-500">{player.alias?.[0]}</div>
                            )}
                            <div className="absolute inset-0 rounded-full border border-green-500/0 group-hover:border-green-500/50 mix-blend-overlay transition-colors" />
                        </div>
                        
                        <div className="text-center relative z-10">
                            <h3 className="text-xl font-black text-white mb-2 truncate group-hover:text-green-400 transition-colors">{player.alias}</h3>
                            <p className="text-[9px] border border-gray-800 bg-[#050505] text-gray-400 w-max mx-auto px-3 py-1 font-bold tracking-widest mb-6">
                                {player.team || 'INDEPENDENT'}
                            </p>
                        </div>
                        
                        <div className="mt-auto border-t border-gray-900 pt-4 grid grid-cols-2 gap-4 relative z-10">
                            <div>
                                <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">CHASSIS</p>
                                <p className="text-[10px] text-gray-300 font-bold truncate">{player.car || 'UNKNOWN'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">WIN_RATE</p>
                                <p className="text-[10px] font-black text-white flex items-center justify-end gap-1">
                                    <Trophy className="w-3 h-3 text-green-500" /> {player.winRate || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <button onClick={() => handleDelete(player._id)} className="absolute top-4 right-4 p-2 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 z-20">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriversManagement;
