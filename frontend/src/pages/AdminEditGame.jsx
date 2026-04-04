import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiArrowLeft, FiDatabase, FiImage, FiTag, FiDollarSign, FiType, FiLayers, FiAlertTriangle } from 'react-icons/fi';
import api from '../api/api';

function AdminEditGame() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const category = query.get('category') || 'showroom';

    const [formData, setFormData] = useState({
        title: '',
        tagline: '',
        genre: '',
        price: '',
        image: '',
        id: ''
    });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('idle'); // idle | saving | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/api/games/detail/${category}/${encodeURIComponent(id)}`);
                if (res.data && res.data.item) {
                    const item = res.data.item;
                    setFormData({
                        title: item.title || '',
                        tagline: item.tagline || '',
                        genre: item.genre || '',
                        price: item.price || '',
                        image: item.image || '',
                        id: item.id || id
                    });
                }
            } catch (err) {
                setMessage('ASSET_RETRIEVAL_FAILURE: Registry access denied.');
                setStatus('error');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, category]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('saving');
        setMessage('');
        
        try {
            await api.put(`/api/games/item/${category}/${encodeURIComponent(id)}`, formData);
            setStatus('success');
            setMessage('REGISTRY_ENTRY_STABILIZED: Data committed successfully.');
            setTimeout(() => navigate('/admin/dashboard'), 2000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'UPLINK_FAILURE: Sync failed.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-blue-500 font-mono">
            <FiLayers className="text-4xl animate-pulse mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">DECRYPTING_OBJECT_DATA...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030303] text-gray-400 font-mono pt-24 pb-40 px-4 md:px-8 relative">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-blue-500 transition-all mb-8"
                >
                    <FiArrowLeft /> BACK_TO_DASHBOARD
                </button>

                <div className="bg-[#050505] border border-gray-900 p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative side bar */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                    
                    <div className="mb-10 border-b border-gray-800 pb-6">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                            <FiDatabase className="text-blue-500" /> Modify_<span className="text-blue-500">Asset</span>
                        </h2>
                        <p className="text-[9px] text-gray-600 mt-2 font-bold tracking-[0.4em] uppercase">Category: {category} // Asset_ID: {id}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Asset_Identifier</label>
                                <div className="relative">
                                    <FiTag className="absolute left-3 top-3.5 text-blue-900" />
                                    <input name="id" value={formData.id} onChange={handleChange} disabled
                                        className="w-full bg-black border border-gray-800 p-3 pl-10 text-gray-600 text-[11px] font-mono focus:border-blue-600 outline-none cursor-not-allowed" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Module_Title</label>
                                <div className="relative">
                                    <FiType className="absolute left-3 top-3.5 text-blue-900" />
                                    <input name="title" value={formData.title} onChange={handleChange} required
                                        className="w-full bg-black border border-gray-800 p-3 pl-10 text-white text-[11px] font-mono focus:border-blue-600 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Asset_Class</label>
                                <input name="genre" value={formData.genre} onChange={handleChange} required
                                    className="w-full bg-black border border-gray-800 p-3 text-white text-[11px] font-mono focus:border-blue-600 outline-none" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Acquisition_Cost (CR)</label>
                                <div className="relative">
                                    <FiDollarSign className="absolute left-3 top-3.5 text-blue-900" />
                                    <input name="price" value={formData.price} onChange={handleChange} required
                                        className="w-full bg-black border border-gray-800 p-3 pl-10 text-white text-[11px] font-mono focus:border-blue-600 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Visual_Uplink_URL</label>
                                <div className="relative">
                                    <FiImage className="absolute left-3 top-3.5 text-blue-900" />
                                    <input name="image" value={formData.image} onChange={handleChange} required
                                        className="w-full bg-black border border-gray-800 p-3 pl-10 text-white text-[10px] font-mono focus:border-blue-600 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Tagline_Telemetry</label>
                                <textarea name="tagline" value={formData.tagline} onChange={handleChange} required rows={3}
                                    className="w-full bg-black border border-gray-800 p-3 text-white text-[11px] font-mono focus:border-blue-600 outline-none resize-none" />
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-6">
                            <motion.button
                                whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(37,99,235,0.2)" }}
                                whileTap={{ scale: 0.99 }}
                                disabled={status === 'saving'}
                                className={`w-full py-4 font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-3 transition-all ${
                                    status === 'saving' ? 'bg-blue-900 text-gray-400 opacity-50' : 'bg-blue-600 text-white'
                                }`}
                            >
                                <FiSave /> {status === 'saving' ? 'WRITING_TO_CORE...' : 'COMMIT_CHANGES'}
                            </motion.button>
                        </div>
                    </form>

                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className={`mt-8 p-4 text-[9px] font-mono uppercase text-center border flex items-center justify-center gap-3 ${
                                    status === 'success' ? 'border-green-900 bg-green-900/10 text-green-500' : 'border-red-900 bg-red-900/10 text-red-500'
                                }`}
                            >
                                {status === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />}
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default AdminEditGame;
