import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import api from '../api/api';
import { FiChevronRight, FiChevronLeft, FiRadio, FiZap, FiTarget, FiCrosshair } from 'react-icons/fi';
import CyberText from '../components/CyberText';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&auto=format&fit=crop';

function LiveEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    // --- FETCH DATA ---
    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const res = await api.get('/api/events');
                if (!c) {
                    setEvents(res.data || []);
                }
            } catch {
                if (!c) setEvents([]);
            } finally {
                if (!c) setLoading(false);
            }
        })();
        return () => { c = true; };
    }, []);

    // --- CURSOR ---
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
                gsap.to(cursorRef.current, { scale: 1.5, rotation: 45, borderColor: "#ef4444", duration: 0.3, ease: "back.out(2)" });
                gsap.to(cursorRef.current.children, { backgroundColor: "#ef4444", duration: 0.3 });
                gsap.to(cursorDotRef.current, { scale: 0, duration: 0.2 });
            };

            const handleHoverLeave = () => {
                gsap.to(cursorRef.current, { scale: 1, rotation: 0, borderColor: "rgba(255, 255, 255, 0.3)", duration: 0.3, ease: "power2.out" });
                gsap.to(cursorRef.current.children, { backgroundColor: "#ffffff", duration: 0.3 });
                gsap.to(cursorDotRef.current, { scale: 1, duration: 0.2 });
            };

            window.addEventListener("mousemove", moveCursor);

            setTimeout(() => {
                const interactives = document.querySelectorAll('button, a, .interactive');
                interactives.forEach(el => {
                    el.addEventListener("mouseenter", handleHoverEnter);
                    el.addEventListener("mouseleave", handleHoverLeave);
                });
            }, 500);

            return () => {
                window.removeEventListener("mousemove", moveCursor);
            };
        });

        return () => ctx.revert();
    }, [loading, currentIndex]);

    // --- SLIDER CONTROLS ---
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-cyan-500 font-mono">
                <FiZap className="text-4xl animate-pulse mb-4 text-cyan-400" />
                <span className="text-[10px] tracking-[0.5em] uppercase font-bold text-cyan-500">
                    <CyberText text="Syncing_Broadcast_Array..." />
                </span>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center font-mono">
                <span className="text-[10px] font-bold text-gray-600 tracking-[0.4em] uppercase border border-cyan-900 px-6 py-3 bg-cyan-900/10">
                    <CyberText text="No_Active_Signals_Detected" />
                </span>
            </div>
        );
    }

    const currentEvent = events[currentIndex];

    return (
        <div className="relative min-h-screen bg-[#020202] text-white font-mono overflow-hidden cursor-none pt-20">
            
            {/* GSAP TACTICAL CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-500/50 pointer-events-none z-[9999] flex items-center justify-center transition-colors mix-blend-difference">
                <div className="absolute top-[-2px] w-[1px] h-2 bg-cyan-500" />
                <div className="absolute bottom-[-2px] w-[1px] h-2 bg-cyan-500" />
                <div className="absolute left-[-2px] h-[1px] w-2 bg-cyan-500" />
                <div className="absolute right-[-2px] h-[1px] w-2 bg-cyan-500" />
            </div>
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white pointer-events-none z-[9999] rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] mix-blend-difference" />

            {/* CRT Scanline Overlay */}
            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-[0.15] mix-blend-overlay" />

            {/* BACKGROUND SLIDER (ANIPRESENCE CROSSFADE) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentEvent._id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img 
                        src={currentEvent.coverImage || currentEvent.image || PLACEHOLDER_IMG} 
                        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                        className="w-full h-full object-cover grayscale opacity-60"
                        alt="Hero Background"
                    />
                    {/* Aggressive Vignette & Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-[#020202]" />
                    <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay" />
                </motion.div>
            </AnimatePresence>

            {/* MAIN CONTENT LAYER */}
            <div className="relative z-10 w-full h-[calc(100vh-80px)] flex flex-col justify-center max-w-[1400px] mx-auto px-6 lg:px-12">
                
                {/* Header Bug */}
                <div className="absolute top-10 left-6 lg:left-12 flex items-center gap-3 text-cyan-600">
                    <FiRadio className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] border border-cyan-900/50 bg-cyan-950/30 px-3 py-1">
                        LIVE_BROADCAST_FEED
                    </span>
                </div>

                <div className="mt-10 lg:mt-0 max-w-4xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentEvent._id}
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 30, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex flex-wrap gap-3 mb-6">
                                <div className="bg-cyan-600 font-black uppercase text-[10px] tracking-[0.2em] px-3 py-1.5 flex items-center gap-2 border border-cyan-400">
                                    <div className="w-1.5 h-1.5 bg-white rounded-none animate-ping" />
                                    {currentEvent.status || 'LIVE'}
                                </div>
                                <div className="bg-[#050505]/80 backdrop-blur border border-gray-800 text-gray-400 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
                                    {currentEvent.eventType || 'Online'}
                                </div>
                                <div className="bg-[#050505]/80 backdrop-blur border border-gray-800 text-gray-400 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
                                    CLASS: {currentEvent.class || 'UNCLASSIFIED'}
                                </div>
                            </div>

                            <h1 className="text-5xl sm:text-7xl lg:text-[7rem] font-black italic uppercase tracking-tighter mb-6 text-white drop-shadow-[0_0_20px_rgba(0,242,255,0.4)] leading-[0.9]">
                                <CyberText text={currentEvent.target?.replace(/_/g, ' ') || currentEvent.title || 'UNKNOWN'} />
                            </h1>
                            
                            <p className="text-gray-400 max-w-2xl text-sm md:text-base font-bold bg-[#050505]/80 backdrop-blur border-l-4 border-cyan-600 p-4 mb-10 h-24 overflow-hidden">
                                {currentEvent.description || "Transmitting raw telemetry stream from the sector. Prepare for system override."}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mb-12">
                                <div className="border border-cyan-900/50 bg-[#050505]/80 backdrop-blur p-4">
                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mb-1">ENTRY_FEE</p>
                                    <p className="text-lg font-black text-gray-200">{currentEvent.entryPrize || 'Free'}</p>
                                </div>
                                <div className="border border-green-900/50 bg-[#050505]/80 backdrop-blur p-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-green-500/10 rounded-bl-full" />
                                    <p className="text-[8px] text-green-700 font-bold uppercase tracking-[0.3em] mb-1">PRIZE_POOL</p>
                                    <p className="text-lg font-black text-green-400">{currentEvent.winningPrize || 'TBD'}</p>
                                </div>
                                <div className="border border-gray-800 bg-[#050505]/80 backdrop-blur p-4">
                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mb-1">REGION</p>
                                    <p className="text-lg font-black text-white">{currentEvent.region || currentEvent.location || 'GLOBAL'}</p>
                                </div>
                                <div className="border border-cyan-600 bg-cyan-600/10 backdrop-blur p-0 flex items-stretch">
                                    <Link to={`/live-events/${currentEvent._id}`} className="interactive w-full h-full flex items-center justify-center gap-2 hover:bg-cyan-600 hover:text-white text-cyan-500 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group">
                                        <FiCrosshair className="text-xl group-hover:rotate-90 transition-transform" />
                                        ENTER
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* SLIDER CONTROLS (BOTTOM) */}
                <div className="absolute bottom-10 left-6 right-6 lg:left-12 lg:right-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-6 z-30">
                    
                    {/* Index Indicator */}
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black italic text-cyan-600">
                            {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
                        </span>
                        <span className="text-xl font-bold text-gray-700 italic">/</span>
                        <span className="text-xl font-bold text-gray-600 italic">
                            {events.length < 10 ? `0${events.length}` : events.length}
                        </span>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={prevSlide}
                            className="interactive w-14 h-14 border border-cyan-900 bg-[#050505]/80 backdrop-blur text-cyan-500 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors group"
                        >
                            <FiChevronLeft className="text-2xl group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="interactive w-14 h-14 border border-cyan-900 bg-[#050505]/80 backdrop-blur text-cyan-500 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition-colors group"
                        >
                            <FiChevronRight className="text-2xl group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Progress Bar (Visual only) */}
                    <div className="hidden lg:block flex-1 max-w-sm ml-8 bg-gray-900 h-1">
                        <motion.div 
                            className="h-full bg-cyan-600"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentIndex + 1) / events.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scanlines {
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                }
                body { cursor: none !important; }
                a, button, select, input, .interactive { cursor: none !important; }
            `}} />
        </div>
    );
}

export default LiveEvents;