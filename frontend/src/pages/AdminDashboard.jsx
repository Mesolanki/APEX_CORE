import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiDatabase, FiEdit2, FiTrash2, FiPlus, FiActivity, 
    FiLayers, FiFlag, FiSearch, FiRefreshCw, FiCheckCircle, FiAlertCircle,
    FiUsers, FiUserPlus, FiX, FiHash
} from 'react-icons/fi';
import api from '../api/api';

/* ─── Enrollment Modal ──────────────────────── */
function EnrollModal({ event, onClose, onSuccess }) {
    const [alias, setAlias] = useState('');
    const [team, setTeam] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (!alias.trim()) { setError('ALIAS_REQUIRED'); return; }

        setSubmitting(true);
        setError('');
        try {
            // Determine the right API endpoint
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(event._id || event.id);

            if (isObjectId) {
                // Standalone Event (MongoDB model)
                await api.post(`/api/events/${event._id}/participate`, {
                    alias: alias.trim(),
                    team: team.trim() || 'Independent',
                });
            } else {
                // In-game liveEvent (index-based)
                const idx = event._eventIndex;
                if (idx !== undefined && idx !== null) {
                    await api.post(`/api/games/live-event/${idx}/participate`, {
                        alias: alias.trim(),
                        team: team.trim() || 'Independent',
                    });
                } else {
                    throw new Error('Cannot determine event type.');
                }
            }

            onSuccess(alias.trim());
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'ENROLLMENT_FAILED');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#050505] border border-blue-900/50 max-w-md w-full shadow-[0_0_40px_rgba(37,99,235,0.15)]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-900">
                    <div className="flex items-center gap-3">
                        <FiUserPlus className="text-blue-500" />
                        <span className="text-[10px] text-blue-500 font-black tracking-[0.4em] uppercase">ENROLL_PILOT</span>
                    </div>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
                        <FiX />
                    </button>
                </div>

                {/* Event info */}
                <div className="px-5 pt-4 pb-3">
                    <span className="text-[8px] text-gray-600 font-black tracking-[0.3em] uppercase block mb-1">TARGET_EVENT</span>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                        {(event.target || event.title || 'UNKNOWN').replace(/_/g, ' ')}
                    </h3>
                    <div className="flex gap-3 mt-2">
                        <span className="text-[8px] text-gray-500 font-bold tracking-widest uppercase">
                            CLASS: {event.class || 'OPEN'}
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold tracking-widest uppercase">
                            REGION: {event.region || 'GLOBAL'}
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleEnroll} className="p-5 space-y-4">
                    <div>
                        <label className="text-[9px] text-gray-500 font-black tracking-[0.3em] uppercase block mb-1.5">
                            Pilot Alias *
                        </label>
                        <input
                            type="text"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            placeholder="GHOST_RIDER"
                            required
                            className="w-full bg-black border border-gray-800 focus:border-blue-600 outline-none p-3 text-white text-sm font-mono tracking-widest uppercase"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-500 font-black tracking-[0.3em] uppercase block mb-1.5">
                            Team / Squad
                        </label>
                        <input
                            type="text"
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            placeholder="VOID_SYNDICATE (optional)"
                            className="w-full bg-black border border-gray-800 focus:border-blue-600 outline-none p-3 text-white text-sm font-mono tracking-widest uppercase"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-[9px] text-red-400 font-bold tracking-widest uppercase bg-red-950/20 border border-red-900/30 p-3">
                            <FiAlertCircle /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-4 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                            submitting
                                ? 'bg-blue-900/40 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                        }`}
                    >
                        <FiUserPlus />
                        {submitting ? 'ENROLLING...' : 'CONFIRM_ENROLLMENT'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

/* ─── Main Dashboard ─────────────────────────── */
function AdminDashboard() {
    const navigate = useNavigate();
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('showroom'); // showroom | event | release
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState('idle'); // idle | deleting
    const [statusMsg, setStatusMsg] = useState('');

    // Enrollment
    const [enrollEvent, setEnrollEvent] = useState(null);
    const [enrollSuccess, setEnrollSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/games');
            setGameData(res.data);
        } catch (err) {
            setError('FAILED_TO_SYNC_MAINFRAME');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (category, id) => {
        if (!window.confirm(`PERMANENT_DELETION_PROTOCOL: Are you sure you want to scrub this asset from the registry?`)) return;
        
        setStatus('deleting');
        setStatusMsg(`ERASING_${id}...`);
        try {
            await api.delete(`/api/games/item/${category}/${encodeURIComponent(id)}`);
            setStatusMsg('SCRUB_COMPLETE');
            setTimeout(() => setStatusMsg(''), 2000);
            fetchData();
        } catch (err) {
            alert('ERASE_FAILURE: Access Denied or Data Corrupt');
        } finally {
            setStatus('idle');
        }
    };

    const handleEnrollSuccess = (alias) => {
        setEnrollEvent(null);
        setEnrollSuccess(`Pilot "${alias}" enrolled successfully!`);
        setTimeout(() => setEnrollSuccess(''), 4000);
        fetchData(); // Refresh to update participant counts
    };

    const getItems = () => {
        if (!gameData) return [];
        let items = [];
        switch (activeTab) {
            case 'showroom': items = gameData.globalMarket || []; break;
            case 'event':    items = (gameData.liveEvents || []).map((ev, i) => ({ ...ev, _eventIndex: i })); break;
            case 'release':  items = gameData.upcomingReleases || []; break;
            default: items = [];
        }

        if (!searchQuery) return items;
        return items.filter(item => 
            (item.title || item.target || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.id || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const items = getItems();

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-blue-500 font-mono">
            <FiRefreshCw className="text-4xl animate-spin mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">SYNCHRONIZING_REGISTRY...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030303] text-gray-400 font-mono pt-24 pb-40 px-4 md:px-8 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
            
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FiDatabase className="text-blue-500" />
                            <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.5em]">SYSTEM_ADMIN</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                            Asset_<span className="text-blue-600">Manager</span>
                        </h1>
                        <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em] mt-3 font-bold border-l border-gray-800 pl-4">
                            Global CRUD Interface // Core_v5.2 · Auto-ID Enabled
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => navigate('/admin/add-game')} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                            <FiPlus /> New_Vehicle
                        </button>
                        <button onClick={() => navigate('/admin/add-event')} className="px-6 py-3 border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-all">
                            <FiPlus /> New_Event
                        </button>
                    </div>
                </div>

                {/* Enrollment success banner */}
                <AnimatePresence>
                    {enrollSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 flex items-center gap-3 bg-green-950/30 border border-green-900/50 p-4 text-[10px] text-green-400 font-black tracking-[0.2em] uppercase"
                        >
                            <FiCheckCircle /> {enrollSuccess}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs & Search */}
                <div className="bg-[#050505] border border-gray-900 p-4 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div className="flex gap-2 p-1 bg-black/50 border border-gray-800 rounded-sm">
                        {[
                            { id: 'showroom', label: 'Showroom', icon: FiLayers },
                            { id: 'event', label: 'Mainframe_Events', icon: FiActivity },
                            { id: 'release', label: 'Releases', icon: FiFlag }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <tab.icon /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input 
                            type="text" 
                            placeholder="SEARCH_REGISTRY..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-gray-800 p-2.5 pl-10 text-[10px] text-white focus:border-blue-500 outline-none tracking-widest"
                        />
                    </div>
                </div>

                {/* Item Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode='wait'>
                        {items.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center border border-dashed border-gray-900">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-gray-700">NO_DATA_MATCHES_QUERY</span>
                            </motion.div>
                        ) : (
                            items.map((item, i) => (
                                <motion.div 
                                    key={item.id || item.target || i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group bg-[#080808] border border-gray-900 p-4 flex flex-col md:flex-row items-center gap-6 hover:border-blue-900/50 hover:bg-[#0a0a0a] transition-all"
                                >
                                    <div className="w-24 h-16 bg-gray-900 overflow-hidden border border-gray-800 shrink-0">
                                        <img src={item.image || item.coverImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[9px] text-blue-500 font-bold tracking-widest uppercase flex items-center gap-1">
                                                <FiHash className="text-[8px]" />
                                                {item.id || item.eventId || 'AUTO_ID'}
                                            </span>
                                            <h3 className="text-sm font-black text-white uppercase italic">{(item.title || item.target || '').replace(/_/g, ' ')}</h3>
                                        </div>
                                        <div className="flex gap-4 text-[8px] text-gray-600 font-bold uppercase tracking-widest">
                                            <span>GENRE: {item.genre || item.class}</span>
                                            <span>PRICE: {item.price || item.prize || item.entryPrize || 'N/A'}</span>
                                            <span>VERSION: {item.version || item.status}</span>
                                            {/* Show participant count for events */}
                                            {activeTab === 'event' && (
                                                <span className="text-blue-500">
                                                    PILOTS: {item.registeredUsers?.length || item.participants || 0}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* ENROLL BUTTON — only for events */}
                                        {activeTab === 'event' && (
                                            <button 
                                                onClick={() => setEnrollEvent(item)}
                                                className="h-10 px-4 border border-green-900/60 flex items-center justify-center gap-2 text-[9px] font-black text-green-600 uppercase tracking-wider hover:text-white hover:border-green-500 hover:bg-green-900/20 transition-all"
                                                title="Enroll Pilot"
                                            >
                                                <FiUserPlus size={14} /> Enroll
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => navigate(`/admin/edit-${activeTab === 'event' ? 'event' : 'game'}/${encodeURIComponent(item.id || item.target)}?category=${activeTab}`)}
                                            className="w-10 h-10 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-blue-500 hover:bg-blue-900/10 transition-all"
                                            title="Edit Asset"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(activeTab, item.id || item.target)}
                                            className="w-10 h-10 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500 hover:bg-red-900/10 transition-all"
                                            title="Scrub Asset"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Status */}
                <div className="mt-8 pt-6 border-t border-gray-900 flex justify-between items-center text-[8px] font-bold text-gray-700 uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-green-500' : 'bg-red-500 animate-ping'}`} />
                        <span>BRIDGE_STATUS: {status === 'idle' ? 'STABLE' : 'MODIFYING...'}</span>
                        {statusMsg && <span className="text-yellow-600 animate-pulse">{">>>"} {statusMsg}</span>}
                    </div>
                    <span>REGISTRY_RECORDS: {items.length}</span>
                </div>
            </div>

            {/* ─── ENROLLMENT MODAL ──────────────── */}
            <AnimatePresence>
                {enrollEvent && (
                    <EnrollModal
                        event={enrollEvent}
                        onClose={() => setEnrollEvent(null)}
                        onSuccess={handleEnrollSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminDashboard;
