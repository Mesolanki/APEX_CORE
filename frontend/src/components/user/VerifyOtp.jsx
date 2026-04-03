import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import DriveBackground from '../../DriveBackground';

function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const navigate = useNavigate();

    useEffect(() => {
        const pendingEmail = localStorage.getItem('pendingEmail');
        if (!pendingEmail) {
            navigate('/signup');
        } else {
            setEmail(pendingEmail);
        }
    }, [navigate]);

    // Inside VerifyOtp.jsx handleVerify
const handleVerify = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
        // Ensure email is trimmed and otp is sent correctly
        const response = await api.post('/user/verify-otp', { 
            email: email.trim().toLowerCase(), 
            otp: otp 
        });

        setStatus('success');
        setMessage('IDENTITY CONFIRMED: SYSTEM ONLINE.');
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        localStorage.removeItem('pendingEmail');
        setTimeout(() => navigate('/'), 2500);
    } catch (err) {
        setStatus('error');
        const backendMsg = err.response?.data?.message || 'VERIFICATION_FAILED';
        setMessage(backendMsg.replace(/_/g, ' '));
    }
};

    return (
        <DriveBackground isAccelerating={status === 'success'}>
            <div className="w-full max-w-md p-8 bg-black/80 backdrop-blur-md border border-red-900/50 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.1)] mb-32 z-50">
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">
                        VERIFY <span className="text-red-600">ACCESS</span>
                    </h2>
                    <p className="text-xs text-red-500 mt-2 font-mono tracking-widest uppercase">Input Terminal Code</p>
                </div>

                <div className="mb-6 text-center">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                        Code sent to: <span className="text-gray-300">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block text-center">6-Digit Security Key</label>
                        <input
                            type="text"
                            required
                            maxLength="6"
                            placeholder="000000"
                            value={otp}
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full bg-[#111] border border-gray-800 rounded p-4 text-white text-center text-2xl tracking-[1em] focus:border-red-600 outline-none transition-all font-mono"
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
                        {status === 'loading' ? 'DECRYPTING...' : status === 'success' ? 'ACCESS GRANTED' : 'AUTHORIZE'}
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
                    Wrong alias? <Link to="/signup" className="text-red-500 hover:text-white transition-colors ml-1">Restart Registry</Link>
                </div>
            </div>
        </DriveBackground>
    );
}

export default VerifyOTP;