import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiDatabase, FiImage, FiTag, FiDollarSign, FiCheckCircle, FiAlertCircle, FiHash } from 'react-icons/fi';
import DriveBackground from '../DriveBackground';
import api from '../api/api';

function AdminAddGame() {
    const [formData, setFormData] = useState({
        title: '',
        tagline: '',
        genre: '',
        price: '',
        image: '',
    });
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [generatedId, setGeneratedId] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');
        setGeneratedId('');

        try {
            const formattedData = {
                ...formData,
                price: formData.price.includes('_CR') ? formData.price : `${formData.price}_CR`,
                description: formData.tagline,
            };

            const res = await api.post('/api/games/add-vehicle', formattedData);

            setStatus('success');
            const newId = res.data?.id || 'AUTO_GENERATED';
            setGeneratedId(newId);
            setMessage(`DATA_BLOCK_COMMITTED: Asset [${newId}] injected to registry.`);
            setFormData({ title: '', tagline: '', genre: '', price: '', image: '' });

            setTimeout(() => setStatus('idle'), 5000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'UPLINK_ERROR: Failed to write to Atlas.');
        }
    };

    return (
        <DriveBackground isAccelerating={status === 'success'}>
            <div className="w-full max-w-2xl p-8 bg-black/90 backdrop-blur-xl border border-blue-900/30 rounded-sm shadow-[0_0_50px_rgba(37,99,235,0.1)] mb-20 z-50">
                <div className="mb-8 border-b border-blue-900/30 pb-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic flex items-center gap-3">
                        <FiDatabase className="text-blue-600" /> ADMIN_<span className="text-blue-600">INJECTOR</span>
                    </h2>
                    <p className="text-[10px] text-blue-500 mt-2 font-mono tracking-widest uppercase">Push new assets to Global_Registry · ID auto-generated</p>
                </div>

                {/* Auto-ID info banner */}
                <div className="mb-6 flex items-center gap-3 bg-blue-950/30 border border-blue-900/30 px-4 py-3">
                    <FiHash className="text-blue-500" />
                    <span className="text-[9px] text-blue-400 font-black tracking-[0.3em] uppercase">
                        ASSET_ID WILL BE AUTO-GENERATED ON SUBMIT
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Title *</label>
                            <input name="title" placeholder="GAME_NAME" value={formData.title} onChange={handleChange} required
                                className="w-full bg-[#0a0a0a] border border-gray-800 p-3 text-white text-sm focus:border-blue-600 outline-none font-mono uppercase" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Genre *</label>
                            <input name="genre" placeholder="e.g. TACTICAL_FPS" value={formData.genre} onChange={handleChange} required
                                className="w-full bg-[#0a0a0a] border border-gray-800 p-3 text-white text-sm focus:border-blue-600 outline-none font-mono" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Price (CR) *</label>
                            <div className="relative">
                                <FiDollarSign className="absolute left-3 top-4 text-blue-600" />
                                <input name="price" placeholder="49.99 or FREE" value={formData.price} onChange={handleChange} required
                                    className="w-full bg-[#0a0a0a] border border-gray-800 p-3 pl-10 text-white text-sm focus:border-blue-600 outline-none font-mono" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Image_URL *</label>
                            <div className="relative">
                                <FiImage className="absolute left-3 top-4 text-blue-600" />
                                <input name="image" placeholder="https://unsplash.com/..." value={formData.image} onChange={handleChange} required
                                    className="w-full bg-[#0a0a0a] border border-gray-800 p-3 pl-10 text-white text-sm focus:border-blue-600 outline-none font-mono text-xs" />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Description / Tagline *</label>
                        <textarea name="tagline" placeholder="Brief system description..." value={formData.tagline} onChange={handleChange} required
                            className="w-full bg-[#0a0a0a] border border-gray-800 p-3 text-white text-sm focus:border-blue-600 outline-none font-mono h-[86px] resize-none" />
                    </div>

                    <div className="md:col-span-2 mt-2">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={status === 'loading'}
                            className={`w-full py-4 font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 transition-all ${status === 'loading' ? 'bg-blue-900 text-gray-400' : 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                                }`}
                        >
                            <FiPlus /> {status === 'loading' ? 'EXECUTING_COMMAND...' : 'INJECT_TO_DATABASE'}
                        </motion.button>
                    </div>
                </form>

                <AnimatePresence>
                    {message && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 p-4 text-[10px] font-mono uppercase text-center border flex items-center justify-center gap-3 ${status === 'success' ? 'border-green-900 bg-green-900/10 text-green-500' : 'border-red-900 bg-red-900/10 text-red-500'
                                }`}>
                            {status === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Show the generated ID */}
                <AnimatePresence>
                    {generatedId && status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 bg-[#0a0a0a] border border-green-900/50 p-4 text-center"
                        >
                            <span className="text-[8px] text-gray-500 font-black tracking-[0.4em] uppercase block mb-2">GENERATED_ASSET_ID</span>
                            <span className="text-lg font-black text-green-400 tracking-[0.2em] font-mono">{generatedId}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DriveBackground>
    );
}

export default AdminAddGame;