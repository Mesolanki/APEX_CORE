import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUser, FiMail, FiShoppingCart, FiAward, 
    FiTrendingUp, FiDatabase, FiArrowRight, FiZap,
    FiSettings, FiLogOut, FiCalendar, FiClock
} from 'react-icons/fi';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user/profile');
            setProfileData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sync profile telemetry.');
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="text-center">
                    <FiZap className="w-12 h-12 text-cyan-500 animate-pulse mx-auto mb-4" />
                    <p className="text-[10px] font-black tracking-[0.5em] text-gray-500 uppercase">Synchronizing_Identity...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-red-950/10 border border-red-900/50 p-8 rounded-2xl text-center">
                    <h2 className="text-red-500 font-black italic tracking-tighter text-2xl mb-4 uppercase">Uplink_Failure</h2>
                    <p className="text-gray-400 text-xs tracking-widest mb-8">{error}</p>
                    <button onClick={() => navigate('/login')} className="bg-red-600 text-white px-8 py-3 rounded-lg text-[10px] font-black tracking-widest">REAUTHENTICATE</button>
                </div>
            </div>
        );
    }

    const { user, totalSpent } = profileData;

    return (
        <div className="min-h-screen bg-[#020202] text-white font-mono pt-32 pb-40 px-6 sm:px-10 overflow-x-hidden relative">
            {/* Background Gradients */}
            <div className="fixed top-0 right-0 w-[60vw] h-[60vw] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[60vw] h-[60vw] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 border-l-4 border-cyan-500 pl-8">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-cyan-600/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
                                <FiUser size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
                                    {user.username || 'DRIVER_ANON'}
                                </h1>
                                <p className="text-xs text-cyan-500/60 font-bold tracking-[0.3em] uppercase">Status: ACTIVE_SERVICE</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] text-gray-500 font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2 text-gray-400">
                                <FiMail className="text-cyan-600" /> {user.email}
                            </span>
                            <span className="flex items-center gap-2">
                                <FiSettings className="text-gray-700" /> Profile_Settings
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                        <div className="bg-cyan-900/5 border border-cyan-900/40 p-6 rounded-2xl">
                            <span className="block text-[8px] text-cyan-600 uppercase tracking-widest mb-2">Total_Investment</span>
                            <span className="text-2xl font-black italic text-white">${totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="bg-black border border-gray-900 p-6 rounded-2xl">
                            <span className="block text-[8px] text-gray-600 uppercase tracking-widest mb-2">Acquired_Assets</span>
                            <span className="text-2xl font-black italic text-white">{user.purchasedGames?.length || 0}</span>
                        </div>
                        <div className="bg-black border border-gray-900 p-6 rounded-2xl col-span-2 sm:col-span-1">
                            <span className="block text-[8px] text-gray-600 uppercase tracking-widest mb-2">Circuit_Runs</span>
                            <span className="text-2xl font-black italic text-white">{user.enrolledEvents?.length || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* LEFT: ASSET LIBRARY */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-center justify-between border-b border-gray-900 pb-6">
                            <h2 className="text-xl font-black italic uppercase tracking-widest text-white flex items-center gap-3">
                                <FiDatabase className="text-cyan-500" /> Digital_Vault
                            </h2>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Library Records</span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {user.purchasedGames?.length > 0 ? (
                                user.purchasedGames.map((game, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#050505] border border-gray-900 p-4 flex gap-4 group hover:border-cyan-500/30 transition-colors"
                                    >
                                        <div className="w-20 h-20 bg-black border border-gray-800 shrink-0 overflow-hidden relative">
                                            <img src={game.image} alt="" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className="font-black italic uppercase text-gray-200 truncate mb-1 group-hover:text-cyan-400 transition-colors">{game.gameTitle}</h3>
                                            <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-900">
                                                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <FiClock className="text-cyan-900" /> {new Date(game.purchasedAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[9px] font-black text-cyan-600">${game.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-16 border-2 border-dashed border-gray-900 flex flex-col items-center justify-center text-gray-700">
                                    <FiShoppingCart size={40} className="mb-4 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No_Assets_Detected</p>
                                    <button onClick={() => navigate('/library')} className="mt-4 text-cyan-500 text-[8px] font-black tracking-widest hover:underline uppercase">Visit Database Hub</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: CIRCUIT HISTORY */}
                    <div className="space-y-10">
                        <div className="flex items-center justify-between border-b border-gray-900 pb-6">
                            <h2 className="text-xl font-black italic uppercase tracking-widest text-white flex items-center gap-3">
                                <FiTrendingUp className="text-violet-500" /> Circuit_Log
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {user.enrolledEvents?.length > 0 ? (
                                user.enrolledEvents.map((event, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-black/40 border border-gray-900 p-6 relative group overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-violet-600/50 group-hover:bg-violet-500 transition-colors" />
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-black italic uppercase text-white tracking-widest text-sm mb-1">{event.eventName}</h3>
                                                <span className="text-[9px] text-violet-500 font-black tracking-widest uppercase">Alias: {event.alias}</span>
                                            </div>
                                            <FiAward className="text-violet-800 group-hover:text-violet-500 transition-colors" />
                                        </div>
                                        <div className="flex justify-between items-center text-[8px] text-gray-600 font-bold uppercase tracking-widest border-t border-gray-900 pt-3">
                                            <span>{event.team || 'INDEPENDENT'}</span>
                                            <span className="flex items-center gap-1"><FiCalendar /> {new Date(event.enrolledAt).toLocaleDateString()}</span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-20 border-2 border-dashed border-gray-900 flex flex-col items-center justify-center text-gray-700">
                                    <FiTrendingUp size={40} className="mb-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Identity_Unregistered</p>
                                    <button onClick={() => navigate('/live-events')} className="mt-4 text-violet-500 text-[8px] font-black tracking-widest hover:underline uppercase">Locate Live Circuits</button>
                                </div>
                            )}
                        </div>

                        <div className="pt-8">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 py-4 border border-red-900/30 text-red-500/50 hover:bg-red-950/20 hover:text-red-500 hover:border-red-900 transition-all text-[10px] font-black uppercase tracking-[0.4em]"
                            >
                                <FiLogOut /> TERMINATE_SESSION
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
