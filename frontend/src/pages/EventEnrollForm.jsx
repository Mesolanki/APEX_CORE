import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import { FiArrowLeft, FiUser, FiShield, FiTerminal } from 'react-icons/fi';

const EventEnrollForm = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState(null);
    const [formData, setFormData] = useState({ alias: '', team: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const isObjectId = eventId?.length === 24 && /^[0-9a-fA-F]{24}$/.test(eventId);
                if (isObjectId) {
                    const res = await api.get(`/api/events/${eventId}`);
                    setEventData(res.data);
                } else {
                    const idx = parseInt(eventId, 10);
                    if (Number.isNaN(idx)) return;
                    const res = await api.get(`/api/games/live-event/${idx}`);
                    setEventData(res.data.item);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const entryFee = 5.00; // Simulated entry fee

        const checkoutItem = {
            id: `event_${eventId}`,
            title: `ENTRY COMP: ${eventData?.target || 'LIVE CIRCUIT'}`,
            priceUsd: entryFee,
            image: eventData?.coverImage || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=800',
            genre: "LIVE_CIRCUIT_ENTRY",
            qty: 1,
            isEvent: true,
            eventId: eventId,
            alias: formData.alias,
            team: formData.team
        };

        localStorage.setItem('nexus_checkout_items', JSON.stringify([checkoutItem]));
        navigate('/checkout');
    };

    if (loading) return <div className="min-h-screen bg-[#030303] flex items-center justify-center text-cyan-500 font-mono tracking-widest text-xs uppercase animate-pulse">Syncing Event Details...</div>;
    if (!eventData) return <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white font-mono"><p className="text-cyan-500 mb-4">UPLINK FAILED: EVENT NOT FOUND</p><Link to="/live-events" className="text-xs uppercase hover:underline">Return to Hub</Link></div>;

    return (
        <div className="min-h-screen bg-[#030303] text-white font-mono flex items-center justify-center px-4 py-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <button
                    type="button"
                    onClick={() => navigate(`/live-events/${eventId}`)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-cyan-400 mb-8 transition-colors"
                >
                    <FiArrowLeft /> ABORT ENROLLMENT
                </button>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/80 backdrop-blur-xl border border-cyan-900/40 p-8 pt-10 relative overflow-hidden shadow-2xl"
                >
                    {/* Decorative styling */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-800 to-cyan-500" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-cyan-500/20 opacity-50" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-cyan-500/20 opacity-50" />

                    <div className="flex items-center gap-3 mb-2">
                        <FiTerminal className="text-cyan-500" />
                        <h1 className="text-2xl font-black italic tracking-widest text-white uppercase">CIRCUIT_ENROLL</h1>
                    </div>
                    <p className="text-[9px] text-cyan-400 tracking-[0.2em] mb-8 font-bold border border-cyan-900/30 bg-cyan-950/20 px-2 py-1 w-max uppercase">
                        TARGET: {eventData.target}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                <FiUser className="text-cyan-500" /> Pilot Alias
                            </label>
                            <input 
                                type="text"
                                required
                                value={formData.alias}
                                onChange={(e) => setFormData({...formData, alias: e.target.value})}
                                placeholder="ENTER RACING NAME"
                                className="w-full bg-[#050505] border border-gray-800 focus:border-cyan-500 p-4 font-mono text-sm tracking-widest text-white outline-none transition-colors uppercase placeholder:text-gray-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                <FiShield className="text-violet-500" /> Syndicate / Team (Optional)
                            </label>
                            <input 
                                type="text"
                                value={formData.team}
                                onChange={(e) => setFormData({...formData, team: e.target.value})}
                                placeholder="INDEPENDENT"
                                className="w-full bg-[#050505] border border-gray-800 focus:border-violet-500 p-4 font-mono text-sm tracking-widest text-white outline-none transition-colors uppercase placeholder:text-gray-700"
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-900 mt-8">
                            <div className="flex justify-between items-end mb-6 text-[10px] tracking-widest text-gray-400 font-bold uppercase">
                                <span>Entry Fee</span>
                                <span className="text-lg text-white font-black">$5.00</span>
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-cyan-600 hover:bg-white hover:text-black text-white font-black italic tracking-[0.2em] py-4 text-sm transition-all duration-300 relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_forwards] pointer-events-none" />
                                PROCEED TO PAYMENT
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EventEnrollForm;
