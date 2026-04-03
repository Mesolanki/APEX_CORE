// ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import DriveBackground from '../../DriveBackground';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); 
    const navigate = useNavigate();

    const handleRecover = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            await api.post('/user/forgot-password', { email });
            setStatus('success');
            setMessage('SPARE KEYS DISPATCHED: Check your registry email.');

            setTimeout(() => {
                navigate('/login');
            }, 3500);

        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'RECOVERY FAILED: DRIVER NOT FOUND.');
        }
    };

    const isAccelerating = status === 'success';

    return (
        <DriveBackground isAccelerating={isAccelerating}>
            <div className="w-full max-w-md p-8 bg-black/80 backdrop-blur-md border border-red-900/50 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.1)] mb-32 z-50">
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">
                        LOST <span className="text-red-600">KEYS</span>
                    </h2>
                    <p className="text-xs text-red-500 mt-2 font-mono tracking-widest uppercase">Emergency Recovery Protocol</p>
                </div>

                <form onSubmit={handleRecover} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Registered Alias (Email)</label>
                        <input
                            type="email"
                            required
                            disabled={status === 'loading' || status === 'success'}
                            placeholder="driver@grid.io"
                            className="w-full bg-[#111] border border-gray-800 rounded p-4 text-white placeholder-gray-700 focus:border-red-600 outline-none transition-all font-mono"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <motion.button
                        whileHover={status === 'idle' || status === 'error' ? { scale: 1.02 } : {}}
                        whileTap={status === 'idle' || status === 'error' ? { scale: 0.95 } : {}}
                        disabled={status === 'loading' || status === 'success'}
                        className={`w-full py-4 font-black uppercase tracking-widest text-sm rounded transition-all ${status === 'loading' || status === 'success'
                                ? 'bg-red-900 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]'
                            }`}
                    >
                        {status === 'loading' ? 'TRANSMITTING...' : status === 'success' ? 'SENT' : 'SEND SPARE KEYS'}
                    </motion.button>
                </form>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 p-4 text-xs font-mono uppercase text-center border ${status === 'success'
                                    ? 'border-green-900 bg-green-900/20 text-green-500'
                                    : 'border-red-900 bg-red-900/20 text-red-500'
                                }`}
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                    Remembered your keys? <Link to="/login" className="text-red-500 hover:text-white transition-colors ml-1">Cancel</Link>
                </div>
            </div>
        </DriveBackground>
    );
}

export default ForgotPassword;