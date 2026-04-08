import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiGrid, FiList, FiDownload, FiLayers, FiZap, FiChevronLeft, FiCrosshair, FiMaximize } from 'react-icons/fi';
import api from '../api/api';

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

function Library() {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    const [libraryData, setLibraryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQ, setSearchQ] = useState('');
    const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'LIST'
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [bootText, setBootText] = useState("LOCATING_LIBRARY_MODULES...");

    // --- FAKE BOOT SEQUENCE ---
    useEffect(() => {
        const bootSequence = [
            "ESTABLISHING_UPLINK...",
            "DECRYPTING_ASSETS...",
            "MOUNTING_DRIVES...",
            "SYSTEM_ONLINE"
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            i++;
            if (i < bootSequence.length) {
                setBootText(bootSequence[i]);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    // --- DATA FETCHING ---
    useEffect(() => {
        let isMounted = true;
        const fetchLibrary = async () => {
            try {
                setTimeout(async () => {
                    const res = await api.get('/api/games');
                    if (isMounted) {
                        setLibraryData(res.data?.globalMarket || []);
                        setLoading(false);
                    }
                }, 1400); // give enough time for boot text
            } catch (error) {
                console.error("Failed to load library:", error);
                if (isMounted) setLoading(false);
            }
        };
        fetchLibrary();
        return () => { isMounted = false; };
    }, []);

    // --- GSAP CUSTOM GAMING CURSOR ---
    useLayoutEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current || loading) return;

        let ctx = gsap.context(() => {
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
                gsap.to(cursorDotRef.current, { scale: 0, duration: 0.2 });
            };

            const handleHoverLeave = () => {
                gsap.to(cursorRef.current, { scale: 1, rotation: 0, borderColor: "rgba(255, 255, 255, 0.3)", duration: 0.3, ease: "power2.out" });
                gsap.to(cursorDotRef.current, { scale: 1, duration: 0.2 });
            };

            window.addEventListener("mousemove", moveCursor);

            setTimeout(() => {
                const interactives = document.querySelectorAll('button, a, .interactive-card, input');
                interactives.forEach(el => {
                    el.addEventListener("mouseenter", handleHoverEnter);
                    el.addEventListener("mouseleave", handleHoverLeave);
                });
            }, 500);

            return () => window.removeEventListener("mousemove", moveCursor);
        });

        return () => ctx.revert();
    }, [loading, activeCategory, searchQ, viewMode]);

    // --- GSAP REVEAL ANIMATIONS & PROGRESS ---
    useLayoutEffect(() => {
        if (loading) return;
        let ctx = gsap.context(() => {
            gsap.to(".scroll-progress", {
                scaleX: 1, ease: "none",
                scrollTrigger: { trigger: mainRef.current, start: "top top", end: "bottom bottom", scrub: true }
            });

            gsap.fromTo(".reveal-text", 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, ease: "power4.out", stagger: 0.1 }
            );
        }, mainRef);
        return () => ctx.revert();
    }, [loading]);

    // --- FILTERING & CATEGORIZATION ---
    const categories = useMemo(() => {
        const cats = new Set(libraryData.map(item => item.genre || 'UNCLASSIFIED'));
        return ['ALL', ...Array.from(cats).sort()];
    }, [libraryData]);

    const filteredLibrary = useMemo(() => {
        return libraryData.filter(item => {
            const matchesCat = activeCategory === 'ALL' || item.genre === activeCategory;
            const matchesSearch = item.title?.toLowerCase().includes(searchQ.toLowerCase()) || item.id?.toLowerCase().includes(searchQ.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [libraryData, activeCategory, searchQ]);

    const groupedLibrary = useMemo(() => {
        const groups = {};
        filteredLibrary.forEach(item => {
            const genre = item.genre || 'UNCLASSIFIED';
            if (!groups[genre]) groups[genre] = [];
            groups[genre].push(item);
        });
        return groups;
    }, [filteredLibrary]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent_50%)]" />
                <FiZap className="text-4xl animate-pulse mb-6 text-cyan-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                <div className="overflow-hidden border border-cyan-900/50 bg-black/50 backdrop-blur px-6 py-3">
                    <span className="font-black uppercase tracking-[0.4em] text-xs block text-white text-center">
                        {bootText}
                    </span>
                    <div className="h-0.5 bg-cyan-600 mt-2 w-full origin-left animate-[scaleX_1.6s_ease-in-out_forwards]" />
                </div>
            </div>
        );
    }

    return (
        <div ref={mainRef} className="scoped-cursor-app min-h-screen bg-[#020202] text-gray-200 font-mono overflow-x-hidden selection:bg-cyan-600 selection:text-white relative">
            
            {/* GSAP TACTICAL CURSOR (Only on Desktop) */}
            <div className="hidden lg:block">
                <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-500/50 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-colors">
                    <div className="absolute top-[-2px] w-[1px] h-2 bg-cyan-500" />
                    <div className="absolute bottom-[-2px] w-[1px] h-2 bg-cyan-500" />
                    <div className="absolute left-[-2px] h-[1px] w-2 bg-cyan-500" />
                    <div className="absolute right-[-2px] h-[1px] w-2 bg-cyan-500" />
                </div>
                <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
            </div>

            {/* GSAP Scroll Progress */}
            <div className="scroll-progress fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 to-cyan-400 z-[100] origin-left scale-x-0" />

            {/* STANDALONE NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 md:p-8 flex justify-between items-center pointer-events-none">
                <button onClick={() => navigate('/')} className="interactive-card pointer-events-auto flex items-center gap-3 text-xs font-black tracking-widest uppercase text-gray-500 hover:text-cyan-500 transition-colors bg-[#050505] border border-gray-800 px-5 py-3 hover:border-cyan-600/50">
                    <FiChevronLeft className="text-lg" /> TERMINATE_SESSION
                </button>
                <div className="bg-cyan-600/10 border border-cyan-500/30 px-4 py-2 flex items-center gap-3 pointer-events-auto shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                    <div className="w-1.5 h-1.5 bg-cyan-500 animate-ping" />
                    <span className="text-cyan-500 text-[10px] font-black tracking-[0.3em] uppercase">SECURE_LINK</span>
                </div>
            </nav>

            <div className="relative w-full max-w-7xl mx-auto px-6 pt-32 md:pt-40 pb-24 z-10 flex flex-col min-h-screen">
                
                {/* HUD / TITLE */}
                <div className="mb-12 md:mb-16 flex flex-col gap-3 reveal-text border-l-4 border-cyan-600 pl-6 md:pl-8">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black italic tracking-tighter text-white uppercase leading-none">
                        LIBRARY_VAULT
                    </h1>
                    <p className="text-gray-500 text-[10px] md:text-xs tracking-[0.3em] uppercase bg-black w-fit px-3 py-1 border border-gray-900 mt-2">
                        Total Indexed Entities: <span className="text-white font-black">{filteredLibrary.length}</span>
                    </p>
                </div>

                {/* --- SUPER SLEEK CONTROLS BAR (RED/BLACK STYLE) --- */}
                <div className="bg-[#050505] border border-gray-900 p-4 mb-12 flex flex-col lg:flex-row justify-between gap-6 shadow-2xl reveal-text items-end relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-600/30" />
                    
                    {/* Categories Pill Menu */}
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 lg:pb-0 w-full lg:w-auto mt-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`interactive-card text-[10px] font-black tracking-widest uppercase pb-1 transition-colors whitespace-nowrap shrink-0 group ${
                                    activeCategory === cat 
                                    ? 'text-cyan-500 border-b-2 border-cyan-500 font-black' 
                                    : 'text-gray-600 hover:text-white'
                                }`}
                            >
                                {cat.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto shrink-0">
                        {/* Search Input CLI Style */}
                        <div className="flex items-center bg-black border border-gray-800 px-4 focus-within:border-cyan-500/50 transition-colors w-full sm:w-64 md:w-80 h-12">
                            <span className="text-cyan-600 text-xs font-black mr-3">&gt;</span>
                            <input
                                type="text"
                                placeholder="QUERY_SYSTEM..."
                                value={searchQ}
                                onChange={(e) => setSearchQ(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest uppercase text-white w-full placeholder:text-gray-700 h-full"
                            />
                            <FiSearch className="text-gray-600 ml-2 shrink-0" />
                        </div>

                        {/* View Toggles */}
                        <div className="flex bg-black border border-gray-800 shrink-0 h-12">
                            <button 
                                onClick={() => setViewMode('GRID')}
                                className={`interactive-card px-4 h-full flex items-center justify-center transition-colors ${viewMode === 'GRID' ? 'text-white bg-gray-900 border-b-2 border-cyan-600' : 'text-gray-600 hover:text-cyan-400'}`}
                            >
                                <FiGrid size={16} />
                            </button>
                            <div className="w-px h-full bg-gray-900" />
                            <button 
                                onClick={() => setViewMode('LIST')}
                                className={`interactive-card px-4 h-full flex items-center justify-center transition-colors ${viewMode === 'LIST' ? 'text-white bg-gray-900 border-b-2 border-cyan-600' : 'text-gray-600 hover:text-cyan-400'}`}
                            >
                                <FiList size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- LIBRARY CONTENT --- */}
                {filteredLibrary.length === 0 ? (
                    <div className="py-40 flex flex-col items-center justify-center text-center bg-[#050505] border border-gray-900 flex-1">
                        <FiLayers className="text-5xl text-cyan-900/30 mb-6" />
                        <h3 className="text-xl font-black italic text-gray-500 tracking-widest uppercase mb-2">QUERY_RETURNED_NULL</h3>
                        <p className="text-[10px] tracking-widest text-gray-700 uppercase">Input mismatch. Re-calibrate filters.</p>
                    </div>
                ) : (
                    <div className="space-y-24 flex-1">
                        {Object.entries(groupedLibrary).map(([genre, items]) => (
                            <div key={genre}>
                                <div className="flex items-center gap-6 mb-10 reveal-text">
                                    <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter">{genre.replace(/_/g, ' ')}</h2>
                                    <div className="h-px bg-gray-900 flex-1 relative">
                                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-12 h-px bg-cyan-600" />
                                    </div>
                                </div>

                                {/* === GRID VIEW === */}
                                {viewMode === 'GRID' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                        <AnimatePresence>
                                            {items.map((item) => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.4 }}
                                                    key={item.id}
                                                    onClick={() => navigate(`/game/showroom/${item.id}`)}
                                                    className="interactive-card group relative bg-black border border-gray-800 h-[450px] flex flex-col overflow-hidden hover:border-cyan-600/50 transition-colors cursor-pointer"
                                                >
                                                    {/* IMAGE HEADER */}
                                                    <div className="h-[60%] w-full overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-out" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                                        
                                                        <div className="absolute top-4 left-4">
                                                            <span className="bg-cyan-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                                                                ID:{item.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* CARD FOOTER INFO */}
                                                    <div className="flex-1 p-6 flex flex-col justify-between bg-[#020202] relative z-10 border-t border-gray-900 group-hover:bg-[#050505] transition-colors">
                                                        
                                                        <div>
                                                            <h3 className="text-lg font-black uppercase text-white leading-tight mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                                                            {item.description && <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed uppercase tracking-wide">{item.description}</p>}
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-end pt-4 mt-4 border-t border-gray-900">
                                                            <div>
                                                                <span className="block text-[8px] text-gray-500 uppercase tracking-[0.2em] mb-1">
                                                                    ACQUISITIONS: {item.downloads || 0}
                                                                </span>
                                                                <span className="text-[9px] font-black text-cyan-500 tracking-widest uppercase flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                                     INITIATE_MODULE
                                                                </span>
                                                            </div>
                                                            <FiCrosshair className="text-gray-700 group-hover:text-cyan-500 group-hover:-rotate-90 transition-all duration-300" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* === LIST VIEW === */}
                                {viewMode === 'LIST' && (
                                    <div className="flex flex-col gap-4">
                                        <AnimatePresence>
                                            {items.map((item) => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.4 }}
                                                    key={item.id}
                                                    onClick={() => navigate(`/game/showroom/${item.id}`)}
                                                    className="interactive-card flex flex-col md:flex-row items-stretch bg-black border border-gray-800 hover:border-cyan-600/50 transition-colors group cursor-pointer overflow-hidden p-0"
                                                >
                                                    {/* IMAGE */}
                                                    <div className="w-full md:w-64 h-40 md:h-auto overflow-hidden shrink-0 relative grayscale group-hover:grayscale-0 transition-all duration-500 border-r border-gray-900">
                                                        <img src={item.image} alt="" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-out" />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black opacity-0 md:opacity-80" />
                                                    </div>
                                                    
                                                    <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row justify-between w-full gap-6 bg-[#020202] group-hover:bg-[#050505] transition-colors relative z-10">
                                                        <div className="truncate pr-4 flex-1 flex flex-col justify-center">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase border border-gray-800 px-2 py-0.5">{item.id}</span>
                                                                <span className="text-[10px] text-cyan-500 font-black tracking-[0.2em] uppercase px-2 py-0.5 bg-cyan-900/10 border border-cyan-900/30">MODULE_SYNC: {item.downloads || 0}</span>
                                                            </div>
                                                            <h3 className="text-xl md:text-2xl font-black italic text-white group-hover:text-cyan-400 transition-colors truncate mb-2 uppercase">{item.title}</h3>
                                                            {item.description && <p className="text-[10px] text-gray-600 truncate uppercase tracking-widest">{item.description}</p>}
                                                        </div>
                                                        
                                                        <div className="hidden lg:flex items-center gap-8 shrink-0 bg-[#000] px-8 py-3 border border-gray-900 justify-center min-w-[220px]">
                                                            <div className="text-right">
                                                                <span className="block text-[8px] text-gray-500 uppercase tracking-[0.2em] mb-1">Payload</span>
                                                                <span className="text-sm font-black text-gray-300">{item.downloadSize || '12.4 GB'}</span>
                                                            </div>
                                                            <div className="w-px h-10 bg-gray-800" />
                                                            <div className="text-right flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform cursor-pointer">
                                                                 ACCESS <FiCrosshair className="text-lg" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @media (min-width: 1024px) {
                    .scoped-cursor-app, 
                    .scoped-cursor-app a, 
                    .scoped-cursor-app button, 
                    .scoped-cursor-app .interactive-card,
                    .scoped-cursor-app input { 
                        cursor: none !important; 
                    }
                }
                `
            }} />
        </div>
    );
}

export default Library;