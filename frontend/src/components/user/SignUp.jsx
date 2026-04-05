// SignUp.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import DriveBackground from '../../DriveBackground';

function Signup() {
    // 1. Added confirmPassword to the initial state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAccelerating, setIsAccelerating] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (formData.password !== formData.confirmPassword) {
            setMessage('MISMATCH: IGNITION KEYS DO NOT ALIGN.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            };

            await api.post('/user/signup', payload);
            localStorage.setItem('pendingEmail', payload.email);
            navigate('/verify-otp');
        } catch (error) {
            const serverError = error.response?.data?.message || "SYSTEM FAILURE";
            setMessage(serverError.replace(/_/g, ' '));
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = () => {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8050';
        window.location.href = `${backendUrl}/user/auth/google`;
    };

    return (
        <DriveBackground isAccelerating={isAccelerating}>
            <div className="w-full max-w-md p-8 bg-black/80 backdrop-blur-md border border-red-900/50 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.1)] mb-32 z-50">
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">
                        NEW <span className="text-red-600">DRIVER</span>
                    </h2>
                    <p className="text-xs text-red-500 mt-2 font-mono tracking-widest uppercase">Register Telemetry</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Driver Alias</label>
                        <input
                            name="username"
                            type="text"
                            onChange={handleChange}
                            required
                            disabled={isLoading || isAccelerating}
                            className="w-full bg-[#111] border border-gray-800 rounded p-4 text-white focus:border-red-600 outline-none transition-all font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Registry Email</label>
                        <input
                            name="email"
                            type="email"
                            onChange={handleChange}
                            required
                            disabled={isLoading || isAccelerating}
                            className="w-full bg-[#111] border border-gray-800 rounded p-4 text-white focus:border-red-600 outline-none transition-all font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ignition Key (Password)</label>
                        <input
                            name="password"
                            type="password"
                            onChange={handleChange}
                            required
                            disabled={isLoading || isAccelerating}
                            className="w-full bg-[#111] border border-gray-800 rounded p-4 text-white focus:border-red-600 outline-none transition-all font-mono"
                        />
                    </div>

                    {/* 4. Added Confirm Password Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Verify Ignition Key</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            onChange={handleChange}
                            required
                            disabled={isLoading || isAccelerating}
                            className="w-full bg-[#111] border border-gray-800 rounded p-4 text-white focus:border-red-600 outline-none transition-all font-mono"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading || isAccelerating}
                        className={`w-full py-4 font-black uppercase tracking-widest text-sm rounded transition-all mt-4 ${isLoading || isAccelerating ? 'bg-red-900 text-gray-400' : 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]'}`}
                    >
                        {isLoading || isAccelerating ? "PREPPING VEHICLE..." : "REGISTER"}
                    </motion.button>
                </form>

                {/* DIVIDER */}
                <div className="relative flex items-center py-6">
                    <div className="flex-grow border-t border-gray-800"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-600 text-[10px] uppercase tracking-widest">Auxiliary Input</span>
                    <div className="flex-grow border-t border-gray-800"></div>
                </div>

                {/* GOOGLE SIGN UP BUTTON */}
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleAuth}
                    disabled={isLoading || isAccelerating}
                    type="button"
                    className="w-full py-4 bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-400 font-bold uppercase tracking-widest text-xs rounded transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    REGISTER VIA GOOGLE
                </motion.button>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 border border-red-900 bg-red-900/20 p-4 text-red-500 text-xs font-mono uppercase text-center"
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                    Already have keys? <Link to="/login" className="text-red-500 hover:text-white transition-colors ml-1">Login</Link>
                </div>
            </div>
        </DriveBackground>
    );
}

export default Signup;