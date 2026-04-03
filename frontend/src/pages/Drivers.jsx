import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import api from '../api/api';
import { FiTrendingUp, FiChevronRight, FiFilter, FiCrosshair, FiZap } from 'react-icons/fi';

function Drivers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    const countryFilter = searchParams.get('country') || 'ALL';
    const teamFilter = searchParams.get('team') || 'ALL';
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value === 'ALL' || value === '') next.delete(key);
        else next.set(key, value);
        setSearchParams(next, { replace: true });
    };

    // --- GSAP CUSTOM GAMING CURSOR ---
    useLayoutEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current) return;

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

        const interactives = document.querySelectorAll('button, a, select, input, .interactive-card');
        interactives.forEach(el => {
            el.addEventListener("mouseenter", handleHoverEnter);
            el.addEventListener("mouseleave", handleHoverLeave);
        });

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            interactives.forEach(el => {
                el.removeEventListener("mouseenter", handleHoverEnter);
                el.removeEventListener("mouseleave", handleHoverLeave);
            });
        };
    }, [loading, drivers, countryFilter, teamFilter, q]);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                // Simulating a slight boot delay for the aesthetic
                setTimeout(async () => {
                    const res = await api.get('/api/games');
                    if (!c) setDrivers(res.data?.topDrivers || []);
                    if (!c) setLoading(false);
                }, 800);
            } catch {
                if (!c) setDrivers([]);
                if (!c) setLoading(false);
            }
        })();
        return () => { c = true; };
    }, []);

    const countries = useMemo(() => {
        const set = new Set();
        drivers.forEach((d) => {
            if (d.country) set.add(d.country);
        });
        return ['ALL', ...Array.from(set).sort()];
    }, [drivers]);

    const teams = useMemo(() => {
        const set = new Set();
        drivers.forEach((d) => {
            if (d.team) set.add(d.team);
        });
        return ['ALL', ...Array.from(set).sort()];
    }, [drivers]);

    const filtered = useMemo(() => {
        return drivers.filter((d) => {
            if (countryFilter !== 'ALL' && d.country !== countryFilter) return false;
            if (teamFilter !== 'ALL' && d.team !== teamFilter) return false;
            if (q) {
                const hay = `${d.alias || ''} ${d.car || ''} ${d.team || ''} ${d.signatureTrack || ''}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [drivers, countryFilter, teamFilter, q]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent_50%)]" />
                <FiZap className="text-4xl animate-pulse mb-6 text-cyan-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                <div className="overflow-hidden border border-cyan-900/50 bg-black/50 backdrop-blur px-6 py-3">
                    <span className="font-black uppercase tracking-[0.4em] text-xs block text-white">
                        FETCHING_DRIVER_TELEMETRY...
                    </span>
                    <div className="h-0.5 bg-cyan-600 mt-2 w-full origin-left animate-[scaleX_1s_ease-in-out_infinite_alternate]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-gray-200 font-mono overflow-x-hidden selection:bg-cyan-600 selection:text-white cursor-none pt-24 pb-32">
            
            {/* --- CUSTOM CURSOR --- */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 border border-white/30 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center mix-blend-difference transition-colors duration-200">
                <div className="absolute top-[-4px] w-0.5 h-2 bg-white" />
                <div className="absolute bottom-[-4px] w-0.5 h-2 bg-white" />
                <div className="absolute left-[-4px] w-2 h-0.5 bg-white" />
                <div className="absolute right-[-4px] w-2 h-0.5 bg-white" />
            </div>
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-cyan-500 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />

            {/* CRT Scanline Overlay */}
            <div className="scanlines pointer-events-none fixed inset-0 z-[90] opacity-10" />

            <div className="relative max-w-7xl mx-auto px-6 z-10">
                
                {/* HEADER */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-3 mb-6 bg-cyan-600/10 border border-cyan-500/30 px-4 py-1.5 backdrop-blur-md">
                        <div className="w-2 h-2 bg-cyan-500 rounded-none animate-ping" />
                        <span className="text-cyan-500 text-[10px] font-bold tracking-[0.4em] uppercase">GLOBAL_RANKINGS</span>
                    </div>
                    
                    <h1 className="text-5xl sm:text-7xl md:text-[6rem] font-black italic uppercase tracking-tighter mb-6 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                        TOP_DRIVERS
                    </h1>
                    
                    <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-widest max-w-lg mb-10 border-l-2 border-cyan-600 pl-4 py-1 text-left">
                        Review telemetry, active chassis, and historical win rates of the elite roster.
                    </p>
                </motion.div>

                {/* FILTER / SEARCH CONSOLE */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="flex flex-col lg:flex-row lg:items-end gap-4 p-5 bg-black border border-gray-900 mb-12 shadow-2xl relative"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-900 via-cyan-900/30 to-gray-900" />
                    
                    <div className="flex items-center gap-2 text-cyan-600 shrink-0 mb-2 lg:mb-0 lg:mr-4">
                        <FiFilter className="text-lg" />
                        <span className="text-[10px] font-black uppercase tracking-widest">QUERY_DB</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                        <div className="flex flex-col gap-2">
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Region</label>
                            <select
                                value={countryFilter}
                                onChange={(e) => setParam('country', e.target.value)}
                                className="bg-[#050505] border border-gray-800 rounded-sm px-3 py-3 text-[10px] uppercase tracking-widest text-gray-300 outline-none focus:border-cyan-500/50 transition-colors"
                            >
                                {countries.map((c) => (
                                    <option key={c} value={c}>{c === 'ALL' ? 'ALL REGIONS' : c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Syndicate / Team</label>
                            <select
                                value={teamFilter}
                                onChange={(e) => setParam('team', e.target.value)}
                                className="bg-[#050505] border border-gray-800 rounded-sm px-3 py-3 text-[10px] uppercase tracking-widest text-gray-300 outline-none focus:border-cyan-500/50 transition-colors"
                            >
                                {teams.map((t) => (
                                    <option key={t} value={t}>{t === 'ALL' ? 'ALL TEAMS' : t.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Search Alias</label>
                            <input
                                type="search"
                                placeholder="ENTER CALLSIGN..."
                                value={searchParams.get('q') || ''}
                                onChange={(e) => setParam('q', e.target.value)}
                                className="bg-[#050505] border border-gray-800 rounded-sm px-4 py-3 text-[10px] uppercase tracking-widest text-white placeholder:text-gray-700 outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* DRIVER GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filtered.map((d, i) => (
                        <motion.div
                            key={`${d.rank}-${d.alias}-${i}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link to={`/drivers/${encodeURIComponent(d.rank)}`} className="block h-full">
                                <div className="interactive-card group relative bg-black border border-gray-800 h-[420px] flex flex-col overflow-hidden hover:border-cyan-600/50 transition-colors cursor-pointer">
                                    
                                    {/* Image Section */}
                                    <div className="h-[60%] overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                                        <img 
                                            src={d.portrait || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80'} 
                                            alt={d.alias}
                                            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                        
                                        <div className="absolute top-4 left-4 bg-cyan-600 text-white text-[9px] font-black px-2 py-1 tracking-widest uppercase shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                            RANK 0{d.rank}
                                        </div>

                                        {d.country && (
                                            <div className="absolute top-4 right-4 bg-black/80 border border-gray-800 text-gray-400 text-[8px] font-bold px-2 py-1 tracking-widest uppercase backdrop-blur-md">
                                                {d.country}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Section */}
                                    <div className="flex-1 p-5 flex flex-col justify-between bg-gradient-to-b from-black to-[#050505] relative z-10 border-t border-gray-900 group-hover:bg-[#0a0a0a] transition-colors">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[9px] text-red-500 font-bold tracking-widest uppercase">{d.team?.replace(/_/g, ' ') || 'SOLO'}</span>
                                                <FiCrosshair className="text-gray-700 group-hover:text-red-500 transition-colors" />
                                            </div>
                                            <h3 className="text-xl font-black uppercase text-white leading-tight tracking-tight">{d.alias?.replace(/_/g, ' ')}</h3>
                                            <p className="text-[10px] text-gray-500 uppercase mt-1 font-bold">{d.car?.replace(/_/g, ' ')}</p>
                                        </div>
                                        
                                        <div className="flex justify-between items-end pt-4 border-t border-gray-800 mt-4">
                                            <div>
                                                <span className="block text-[8px] text-gray-600 uppercase tracking-widest mb-1">Win Rate</span>
                                                <span className="font-black text-sm text-gray-300 group-hover:text-white transition-colors">{d.winRate || 'N/A'}</span>
                                            </div>
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold group-hover:text-red-500 transition-colors flex items-center gap-1">
                                                Dossier <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {!loading && drivers.length === 0 && (
                    <div className="border border-dashed border-gray-800 py-20 text-center">
                        <p className="text-gray-600 text-xs uppercase tracking-widest font-bold">DATABASE EMPTY. NO DRIVER RECORDS FOUND.</p>
                    </div>
                )}

                {!loading && drivers.length > 0 && filtered.length === 0 && (
                    <div className="border border-red-900/30 bg-red-900/10 py-16 text-center rounded-sm mt-8">
                        <FiAlertCircle className="mx-auto text-red-500 text-2xl mb-3" />
                        <p className="text-red-500/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                            ZERO MATCHES FOR CURRENT QUERY PARAMETERS.
                        </p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scanlines {
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                }
                body { cursor: none !important; }
                a, button, select, input, [role="button"] { cursor: none !important; }
                `
            }} />
        </div>
    );
}

export default Drivers;