import React, { useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { FiLock, FiUser, FiShield, FiArrowRight, FiZap } from 'react-icons/fi';

function Log_in() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', adminKey: '' });
    
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    // --- GSAP CURSOR (Matching your UI) ---
    useLayoutEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current) return;

        let ctx = gsap.context(() => {
            gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
            gsap.set(cursorDotRef.current, { xPercent: -50, yPercent: -50 });

            const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3.out" });
            const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3.out" });
            const xDotTo = gsap.quickTo(cursorDotRef.current, "x", { duration: 0.05, ease: "power4.out" });
            const yDotTo = gsap.quickTo(cursorDotRef.current, "y", { duration: 0.05, ease: "power4.out" });

            const moveCursor = (e) => {
                xTo(e.clientX);
                yTo(e.clientY);
                xDotTo(e.clientX);
                yDotTo(e.clientY);
            };

            const handleHoverEnter = () => {
                gsap.to(cursorRef.current, { scale: 1.5, rotation: 45, duration: 0.3, ease: "back.out(2)" });
                gsap.to(cursorRef.current.children, { backgroundColor: "#ef4444", duration: 0.3 });
                gsap.to(cursorDotRef.current, { scale: 0, duration: 0.2 });
            };

            const handleHoverLeave = () => {
                gsap.to(cursorRef.current, { scale: 1, rotation: 0, duration: 0.3, ease: "power2.out" });
                gsap.to(cursorRef.current.children, { backgroundColor: "#ffffff", duration: 0.3 });
                gsap.to(cursorDotRef.current, { scale: 1, duration: 0.2 });
            };

            window.addEventListener("mousemove", moveCursor);

            setTimeout(() => {
                const interactives = document.querySelectorAll('button, a, input');
                interactives.forEach(el => {
                    el.addEventListener("mouseenter", handleHoverEnter);
                    el.addEventListener("mouseleave", handleHoverLeave);
                });
            }, 500);

            return () => window.removeEventListener("mousemove", moveCursor);
        }, mainRef);

        return () => ctx.revert();
    }, [isLogin]); // Re-run when view changes

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(isLogin ? "Authenticating..." : "Registering Admin...", formData);
        // Add your API call here: api.post('/auth/login', formData)
    };

    return (
        <div ref={mainRef} className="min-h-screen bg-[#020202] text-white font-mono flex items-center justify-center overflow-hidden cursor-none relative px-6">
            
            {/* GAMING CROSSHAIR CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference">
                <div className="absolute top-[-4px] w-0.5 h-2 bg-white" />
                <div className="absolute bottom-[-4px] w-0.5 h-2 bg-white" />
                <div className="absolute left-[-4px] w-2 h-0.5 bg-white" />
                <div className="absolute right-[-4px] w-2 h-0.5 bg-white" />
            </div> 
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-red-600 pointer-events-none z-[9999] mix-blend-difference rounded-full" />

            {/* BACKGROUND ELEMENTS */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop')] opacity-5 bg-cover bg-center grayscale pointer-events-none" />
            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

            {/* MAIN AUTH CONTAINER */}
            <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-gray-900 shadow-2xl p-8 lg:p-12">
                
                {/* Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <FiShield className="text-4xl text-red-600 mb-4" />
                    <h1 className="text-3xl font-black italic uppercase tracking-widest">
                        {isLogin ? 'Admin_Access' : 'Init_Admin'}
                    </h1>
                    <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-2">
                        {isLogin ? 'Enter credentials to breach mainframe' : 'Establish new command node'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors">
                            <FiUser />
                        </div>
                        <input 
                            type="email" 
                            name="email"
                            required
                            placeholder="OPERATIVE_EMAIL"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-black border border-gray-800 pl-12 pr-4 py-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:border-red-600 transition-colors placeholder:text-gray-700"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors">
                            <FiLock />
                        </div>
                        <input 
                            type="password" 
                            name="password"
                            required
                            placeholder="ENCRYPTION_KEY"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-black border border-gray-800 pl-12 pr-4 py-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:border-red-600 transition-colors placeholder:text-gray-700"
                        />
                    </div>

                    <AnimatePresence>
                        {!isLogin && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="relative group overflow-hidden"
                            >
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors">
                                    <FiZap />
                                </div>
                                <input 
                                    type="password" 
                                    name="adminKey"
                                    required={!isLogin}
                                    placeholder="MASTER_OVERRIDE_CODE"
                                    value={formData.adminKey}
                                    onChange={handleChange}
                                    className="w-full bg-[#110000] border border-red-900 pl-12 pr-4 py-4 text-xs font-bold text-red-500 uppercase tracking-widest outline-none focus:border-red-600 transition-colors placeholder:text-red-900/50"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        type="submit"
                        className="mt-4 w-full bg-red-600 text-white flex items-center justify-center gap-3 py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all group"
                    >
                        <span>{isLogin ? 'Authenticate' : 'Initialize'}</span>
                        <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </form>

                {/* Footer Toggle */}
                <div className="mt-8 pt-6 border-t border-gray-900 text-center">
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] text-gray-500 tracking-[0.2em] uppercase hover:text-white transition-colors"
                    >
                        {isLogin ? '>> Override: Request Admin Node <<' : '>> Abort: Return to Login <<'}
                    </button>
                </div>
            </div>

            {/* CRT SCANLINE OVERLAY */}
            <div className="scanlines pointer-events-none fixed inset-0 z-[90] opacity-10" />
            <style dangerouslySetInnerHTML={{
                __html: `
                .scanlines {
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                }
                body { cursor: none !important; }
            `}} />
        </div>
    );
}

export default Log_in;