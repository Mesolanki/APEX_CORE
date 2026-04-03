import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../api/api';
import {
    FiArrowLeft, FiShoppingCart, FiLayers, FiPlay,
    FiDownload, FiMonitor, FiCpu, FiHardDrive, FiImage, FiX, FiCheck, FiZap, FiVideo, FiMaximize2, FiCrosshair
} from 'react-icons/fi';
import { mergeDetailItem } from '../data/gameDetailContent';
import { parsePriceFromGame } from '../utils/price';

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const categoryMeta = {
    featured: { label: 'Classified drop', accent: 'from-cyan-600 to-cyan-900', cta: 'Download launcher', glow: 'shadow-cyan-500/30' },
    showroom: { label: 'Chassis details', accent: 'from-cyan-600 to-cyan-600', cta: 'Acquire module', glow: 'shadow-cyan-500/25' },
    release: { label: 'Expansion module', accent: 'from-cyan-500 to-cyan-600', cta: 'Pre-order', glow: 'shadow-cyan-500/25' },
};

function SpecBlock({ title, specs, variant }) {
    if (!specs || !Object.keys(specs).length) return null;
    const rows = [
        { k: 'OS', v: specs.os, icon: FiMonitor },
        { k: 'CPU', v: specs.cpu, icon: FiCpu },
        { k: 'RAM', v: specs.ram, icon: FiLayers },
        { k: 'GPU', v: specs.gpu, icon: FiMonitor },
        { k: 'Storage', v: specs.storage, icon: FiHardDrive },
    ].filter((r) => r.v);
    
    // Applying global Red/Black CRT Theme directly to SpecBlock
    const border = variant === 'rec' ? 'border-cyan-500/50' : 'border-gray-800';
    
    return (
        <div className={`spec-card p-6 bg-black border ${border} relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-2 h-2 ${variant === 'rec' ? 'bg-cyan-500' : 'bg-gray-800'}`} />
            <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 border-b pb-2 ${variant === 'rec' ? 'text-cyan-500 border-cyan-500/30' : 'text-gray-500 border-gray-900'}`}>{title}</h3>
            <ul className="space-y-4">
                {rows.map(({ k, v, icon: Ic }) => (
                    <li key={k} className="flex gap-4 items-start group-hover:translate-x-1 transition-transform">
                        <Ic className={`${variant === 'rec' ? 'text-cyan-600' : 'text-gray-600'} mt-1 shrink-0`} size={14} />
                        <div>
                            <span className={`text-[8px] uppercase tracking-widest block leading-none mb-1 ${variant === 'rec' ? 'text-cyan-400' : 'text-gray-600'}`}>{k}</span>
                            <span className="text-[11px] text-gray-200 font-bold uppercase">{v}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function GameDetail() {
    const { category, id } = useParams();
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lightbox, setLightbox] = useState(null);
    const [activeScreenshotCat, setActiveScreenshotCat] = useState('ALL');

    // --- CUSTOM CURSOR ---
    useLayoutEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current) return;
        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3" });
        const xDotTo = gsap.quickTo(cursorDotRef.current, "x", { duration: 0.05, ease: "power4" });
        const yDotTo = gsap.quickTo(cursorDotRef.current, "y", { duration: 0.05, ease: "power4" });

        const move = (e) => { xTo(e.clientX); yTo(e.clientY); xDotTo(e.clientX); yDotTo(e.clientY); };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, [loading]);

    // --- GSAP SCROLL ANIMATIONS ---
    useLayoutEffect(() => {
        if (loading || !payload) return;

        let ctx = gsap.context(() => {
            gsap.to(".detail-hero-img", {
                yPercent: 30,
                scrollTrigger: { trigger: ".detail-hero", start: "top top", end: "bottom top", scrub: true }
            });

            gsap.utils.toArray('.gsap-reveal').forEach((el) => {
                gsap.from(el, {
                    y: 60, opacity: 0, duration: 1, ease: "power4.out",
                    scrollTrigger: { trigger: el, start: "top 90%" }
                });
            });

            gsap.from(".screenshot-item", {
                scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.8, ease: "back.out(1.2)",
                scrollTrigger: { trigger: ".screenshot-grid", start: "top 85%" }
            });
        }, mainRef);

        return () => ctx.revert();
    }, [loading, payload]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const safeId = encodeURIComponent(id || '');
                const res = await api.get(`/api/games/detail/${category}/${safeId}`);
                if (!cancelled) setPayload(res.data);
            } catch (e) {
                if (!cancelled) setError(e.response?.data?.message || 'FAILED_TO_SYNC_DATA');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [category, id]);

    const item = useMemo(() => mergeDetailItem(payload?.item), [payload]);
    const meta = categoryMeta[category] || categoryMeta.showroom;

    // Mapping new formatted screenshots logic
    const formattedScreenshots = useMemo(() => {
        if (!item?.screenshots || item.screenshots.length === 0) {
            return item?.image ? [{ category: 'ALL', url: item.image }] : [];
        }
        return item.screenshots.map(s => {
            // Handle legacy format if string
            if (typeof s === 'string') return { category: 'ALL', url: s };
            return { category: s.category || 'ALL', url: s.url };
        });
    }, [item?.screenshots, item?.image]);

    const availableCategories = useMemo(() => {
        const cats = new Set(formattedScreenshots.map(s => s.category));
        const arr = Array.from(cats).filter(c => c !== 'ALL');
        return ['ALL', ...arr];
    }, [formattedScreenshots]);
    
    const visibleScreenshots = useMemo(() => {
        if (activeScreenshotCat === 'ALL') return formattedScreenshots;
        return formattedScreenshots.filter(s => s.category === activeScreenshotCat);
    }, [activeScreenshotCat, formattedScreenshots]);

    const handlePrimaryCta = () => {
        const price = parsePriceFromGame(item?.price);
        
        if (price === 0) {
            // Directly start download / go to thank you page for free games
            navigate('/thank-you', {
                state: {
                    orderId: `FREE-${item?.id || 'DOWNLOAD'}-${Date.now()}`
                }
            });
            return;
        }

        navigate('/checkout', {
            state: {
                items: [{
                    id: item?.id,
                    title: (item?.title || '').replace(/_/g, ' '),
                    priceUsd: price,
                    qty: 1,
                    image: item?.image || formattedScreenshots[0]?.url,
                }],
            },
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono">
                <FiZap className="text-4xl animate-pulse mb-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">DECRYPTING_ASSET_PROTOCOLS...</span>
            </div>
        );
    }

    return (
        <div ref={mainRef} className="min-h-screen bg-[#020202] text-gray-200 font-mono overflow-x-hidden selection:bg-cyan-600 selection:text-white cursor-none">
            
            {/* CROSSHAIR CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 border border-white/30 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center mix-blend-difference">
                <div className="absolute top-[-4px] w-0.5 h-2 bg-white" />
                <div className="absolute bottom-[-4px] w-0.5 h-2 bg-white" />
                <div className="absolute left-[-4px] w-2 h-0.5 bg-white" />
                <div className="absolute right-[-4px] w-2 h-0.5 bg-white" />
            </div>
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1 h-1 bg-cyan-500 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />

            {/* SCANLINES OVERLAY */}
            <div className="scanlines pointer-events-none fixed inset-0 z-[90] opacity-[0.05]" />

            {/* HERO SECTION */}
            <header className="detail-hero relative h-[70vh] sm:h-[85vh] w-full flex items-end overflow-hidden border-b border-gray-900">
                <div className="absolute inset-0 z-0">
                    <img src={item?.image} className="detail-hero-img w-full h-full object-cover grayscale opacity-40 scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
                    <motion.button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-cyan-500 mb-10 hover:text-white transition-colors"
                    >
                        <FiArrowLeft /> RETRACE_HUB
                    </motion.button>

                    <div className="inline-flex items-center gap-3 mb-6 bg-cyan-600/10 border border-cyan-500/30 px-3 py-1 backdrop-blur-md">
                        <FiZap className="text-cyan-500 text-xs" />
                        <span className="text-cyan-500 text-[9px] font-bold tracking-[0.4em] uppercase">{meta.label}</span>
                    </div>

                    <h1 className="text-5xl sm:text-8xl font-black italic uppercase tracking-tighter text-white leading-none mb-6">
                        {(item?.title || '').replace(/_/g, ' ')}
                    </h1>

                    <div className="flex flex-wrap items-center gap-8 border-l-2 border-cyan-600 pl-4">
                        <div>
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Status</span>
                            <span className="text-sm font-black text-white uppercase">{item?.price || 'CLASSIFIED'}</span>
                        </div>
                        <div className="w-px h-8 bg-gray-800" />
                        <div>
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Engine_Ver</span>
                            <span className="text-sm font-black text-white uppercase">{item?.version || 'v1.0.0'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT GRID */}
            <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                {/* LEFT: Intel & Specs */}
                <div className="lg:col-span-8 space-y-24">
                    
                    {/* VIDEO SECTION */}
                    {item?.videoUrl && (
                        <section className="gsap-reveal overflow-hidden border border-gray-900 bg-black relative aspect-video group">
                            <iframe 
                                className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                src={item.videoUrl}
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                            />
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-cyan-600 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest pointer-events-none shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                <FiVideo /> Live_Feed
                            </div>
                        </section>
                    )}

                    {/* INTEL */}
                    <section className="gsap-reveal">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-4">
                            <span className="w-10 h-1 bg-cyan-600" /> Operational_Intel
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl border-l-[3px] border-gray-800 pl-8 uppercase text-[13px] tracking-wide font-medium">
                            {item?.description || "No specific deployment data available for this chassis module. Telemetry remains classified until acquisition."}
                        </p>
                    </section>

                    {/* CATEGORIZED SCREENSHOTS GALLERY */}
                    <section className="gsap-reveal bg-[#050505] border border-gray-900 p-8 shadow-2xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-900 pb-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500 flex items-center gap-3">
                                <FiImage /> VISUAL_CAPTURE_LOGS
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {availableCategories.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => setActiveScreenshotCat(cat)}
                                        className={`px-3 py-1 text-[8px] font-black tracking-widest uppercase transition-all ${activeScreenshotCat === cat ? 'bg-cyan-600 text-white border border-cyan-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-black text-gray-500 border border-gray-800 hover:text-white'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="screenshot-grid grid grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {visibleScreenshots.map((shot, i) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        key={`${shot.url}-${i}`} 
                                        onClick={() => setLightbox(i)}
                                        className="screenshot-item relative aspect-video overflow-hidden border border-gray-800 grayscale hover:grayscale-0 transition-all duration-500 cursor-crosshair group"
                                    >
                                        <img src={shot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                        <div className="absolute inset-0 bg-cyan-600/0 group-hover:bg-cyan-600/10 transition-colors" />
                                        <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 text-[7px] font-black text-gray-400 tracking-widest border border-gray-800 group-hover:border-cyan-500 transition-colors">
                                            {shot.category}
                                        </div>
                                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiMaximize2 className="text-cyan-500 drop-shadow-md" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* SPECS */}
                    {(item?.minSpecs || item?.recommendedSpecs) && (
                        <section className="gsap-reveal space-y-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500 flex items-center gap-3">
                                <FiCpu /> SYSTEM_REQUIREMENTS
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <SpecBlock title="MINIMUM_THRESHOLD" specs={item.minSpecs} variant="min" />
                                <SpecBlock title="OPTIMAL_SYNC" specs={item.recommendedSpecs} variant="rec" />
                            </div>
                        </section>
                    )}
                </div>

                {/* RIGHT: SIDEBAR BOX */}
                <aside className="lg:col-span-4 space-y-8">
                    <div className="gsap-reveal sticky top-32 p-8 bg-[#050505] border border-gray-900 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FiCrosshair size={100} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-600 animate-ping" /> MODULE_ACQUISITION
                        </h3>
                        
                        <div className="space-y-4 mb-10 relative z-10">
                            <div className="p-4 bg-black border border-gray-800 flex justify-between items-center group hover:border-cyan-900/50 transition-colors">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">PAYLOAD_SIZE</span>
                                <span className="text-sm font-black text-gray-200 uppercase">{item?.downloadSize || '12.4 GB'}</span>
                            </div>
                            <div className="p-4 bg-black border border-gray-800 flex justify-between items-center group hover:border-cyan-900/50 transition-colors">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">NETWORK</span>
                                <span className="text-xs font-black text-gray-200 uppercase tracking-widest">SECURED_P2P</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePrimaryCta}
                            className="w-full py-5 bg-cyan-600 text-white font-black uppercase tracking-[0.3em] text-[10px] border border-cyan-500 hover:bg-white hover:text-black transition-all group flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,242,255,0.4)] relative z-10 hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]"
                        >
                            {category === 'showroom' ? <FiShoppingCart /> : <FiDownload />}
                            {meta.cta}
                        </button>

                        <p className="mt-8 text-[8px] text-gray-600 uppercase tracking-widest text-center leading-loose font-bold">
                            By initializing deployment, you agree to the <br/>
                            <span className="text-cyan-900 underline decoration-cyan-900 underline-offset-4 line-through">APEX_CORE_EULA</span> and telemetry tracking.
                        </p>
                    </div>
                </aside>
            </div>

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {lightbox !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-[#020202]/98 flex flex-col items-center justify-center p-10 backdrop-blur-sm"
                    >
                        <button 
                            onClick={() => setLightbox(null)}
                            className="absolute top-10 right-10 text-gray-500 hover:text-cyan-500 transition-colors p-4 z-50 cursor-crosshair"
                        >
                            <FiX size={40} />
                        </button>
                        
                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={visibleScreenshots[lightbox]?.url} 
                            className="max-w-full max-h-[75vh] object-contain border border-gray-800 shadow-[0_0_50px_rgba(220,38,38,0.1)]" 
                            alt="" 
                        />

                        <div className="mt-12 flex items-center gap-10">
                            <button 
                                disabled={lightbox === 0}
                                onClick={() => setLightbox(prev => prev - 1)}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-cyan-500 disabled:opacity-0 transition-all cursor-crosshair"
                            >
                                PREV_LOG
                            </button>
                            <div className="h-px w-20 bg-gray-800" />
                            <span className="text-xs font-black tracking-widest text-cyan-500">CAPTURE_{lightbox + 1} // {visibleScreenshots.length}</span>
                            <div className="h-px w-20 bg-gray-800" />
                            <button 
                                disabled={lightbox === visibleScreenshots.length - 1}
                                onClick={() => setLightbox(prev => prev + 1)}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-cyan-500 disabled:opacity-0 transition-all cursor-crosshair"
                            >
                                NEXT_LOG
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scanlines {
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                }
                body { cursor: none !important; }
                a, button, [role="button"], input, select { cursor: none !important; }
            `}} />
        </div>
    );
}

export default GameDetail;