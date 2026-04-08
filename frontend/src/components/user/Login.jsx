// Login.jsx - Optimized Logic
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import DriveBackground from '../../DriveBackground';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAccelerating, setIsAccelerating] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Check for registration errors passed via URL
    useEffect(() => {
        if (searchParams.get('error') === 'account_not_found') {
            setMessage('DRIVER NOT FOUND: REGISTER FIRST.');
        }
    }, [searchParams]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        // DIAGNOSTIC: Log exactly what you are sending to the server
        console.log(">>> [System_Check]: Attempting Uplink with:", formData);

        try {
            const response = await api.post('/user/login', {
                email: formData.email.trim().toLowerCase(), // Normalize email
                password: formData.password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setIsAccelerating(true);
                setTimeout(() => navigate('/'), 1000);
            }
        } catch (error) {
            setIsLoading(false);
            const status = error.response?.status;
            const serverMsg = error.response?.data?.message || error.response?.data;
            const serverDetail = error.response?.data?.error; // backend includes this on 500s

            // NEW DIFFERENT WAY: Use a switch case for precise state handling
            switch (status) {
                case 401:
                    if (serverMsg === 'Account_Not_Verified') {
                        localStorage.setItem('pendingEmail', formData.email.trim().toLowerCase());
                        setMessage('CRITICAL: IDENTITY NOT VERIFIED. REDIRECTING...');
                        setTimeout(() => navigate('/verify-otp'), 1500);
                    } else if (serverMsg === 'Use_Google_Login') {
                        setMessage('THIS ACCOUNT USES GOOGLE SIGN-IN. USE GOOGLE BUTTON.');
                    } else {
                        setMessage('TERMINAL_DENIED: INVALID_KEY_OR_ALIAS');
                    }
                    break;
                case 404:
                    setMessage('VOID_ERROR: DRIVER_NOT_IN_REGISTRY');
                    break;
                case 500:
                    setMessage(`CORE_MELTDOWN: ${serverDetail || serverMsg || 'SERVER_CRASHED'}`);
                    break;
                default:
                    setMessage(`UPLINK_FAILURE: ${serverMsg || 'UNKNOWN_CODE'}`);
            }
        }
    };
    const handleGoogleAuth = () => {
        const backendUrl = import.meta.env.VITE_API_URL || 'https://apex-core-backend.onrender.com';
        window.location.href = `${backendUrl}/user/auth/google`;
    };

    return (
        <DriveBackground isAccelerating={isAccelerating}>
            <div className="w-full max-w-md p-8 bg-black/80 backdrop-blur-md border border-red-900/50 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.1)] mb-32 z-50">
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">
                        START <span className="text-red-600">ENGINE</span>
                    </h2>
                    <p className="text-xs text-red-500 mt-2 font-mono tracking-widest uppercase">System Initialization</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Driver Alias (Email)</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading || isAccelerating}
                            className="w-full bg-[#111] border border-gray-800 rounded p-4 text-white focus:border-red-600 outline-none transition-all font-mono"
                            placeholder="driver@grid.io"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ignition Key</label>
                            <Link to="/forgot-password" virtual="true" className="text-[10px] text-red-600 hover:text-red-400 uppercase tracking-widest transition-colors">
                                Lost Keys?
                            </Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading || isAccelerating}
                            className="w-full bg-[#111] border border-gray-800 rounded p-4 text-white focus:border-red-600 outline-none transition-all font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading || isAccelerating}
                        className={`w-full py-4 font-black uppercase tracking-widest text-sm rounded transition-all ${isLoading || isAccelerating ? 'bg-red-900 text-gray-400' : 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]'}`}
                    >
                        {isLoading || isAccelerating ? "ENGAGING GEARS..." : "IGNITE"}
                    </motion.button>
                </form>

                <div className="relative flex items-center py-6">
                    <div className="flex-grow border-t border-gray-800"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-600 text-[10px] uppercase tracking-widest">Auxiliary Input</span>
                    <div className="flex-grow border-t border-gray-800"></div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleAuth}
                    disabled={isLoading || isAccelerating}
                    type="button"
                    className="w-full py-4 bg-transparent border border-gray-700 text-gray-300 hover:text-white font-bold uppercase tracking-widest text-xs rounded transition-all flex items-center justify-center gap-3"
                >
                    SYNC WITH GOOGLE
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
                    New to the grid? <Link to="/signup" className="text-red-500 hover:text-white transition-colors ml-1">Register</Link>
                </div>
            </div>
        </DriveBackground>
    );
}

export default Login;