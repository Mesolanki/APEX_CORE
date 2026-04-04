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

function StarRating({ value = 0, max = 5, onChange }) {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => onChange && setHovered(star)}
                    onMouseLeave={() => onChange && setHovered(0)}
                    onClick={() => onChange && onChange(star)}
                    className={`text-xl transition-colors ${
                        star <= display
                            ? 'text-cyan-400'
                            : 'text-gray-700'
                    } ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                    ★
                </button>
            ))}
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
    const [activeTab, setActiveTab] = useState('intel'); // intel | specs | reviews

    // Review form
    const [reviewForm, setReviewForm] = useState({ username: '', rating: 0, comment: '' });
    const [reviewStatus, setReviewStatus] = useState('idle'); // idle | loading | success | error
    const [reviewMsg, setReviewMsg] = useState('');

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
    const reviews = item?.reviews || [];
    const meta = categoryMeta[category] || categoryMeta.showroom;

    // Mapping new formatted screenshots logic
    const formattedScreenshots = useMemo(() => {
        if (!item?.screenshots || item.screenshots.length === 0) {
            return item?.image ? [{ category: 'ALL', url: item.image }] : [];
        }
        return item.screenshots.map(s => {
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

    const handlePrimaryCta = async () => {
        const price = parsePriceFromGame(item?.price);
        
        // Always increment download count when CTA is clicked
        try {
            const safeId = encodeURIComponent(id || '');
            await api.post(`/api/games/detail/${category}/${safeId}/download`);
        } catch (e) {
            console.error("Failed to log download:", e);
        }

        if (price === 0) {
            navigate('/thank-you', {
                state: {
                    orderId: `FREE-${item?.id || 'DOWNLOAD'}-${Date.now()}`,
                    items: [{
                        id: item?.id,
                        title: (item?.title || '').replace(/_/g, ' '),
                        priceUsd: 0,
                        image: item?.image,
                        genre: item?.genre,
                        description: item?.description,
                    }],
                    screenshots: formattedScreenshots.slice(0, 4).map(s => s.url),
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

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewForm.username || !reviewForm.rating) {
            setReviewMsg('Alias and rating required.');
            setReviewStatus('error');
            return;
        }
        setReviewStatus('loading');
        try {
            const safeId = encodeURIComponent(id || '');
            await api.post(`/api/games/detail/${category}/${safeId}/review`, reviewForm);
            
            // Re-fetch to get updated reviews/rating
            const res = await api.get(`/api/games/detail/${category}/${safeId}`);
            setPayload(res.data);
            
            setReviewForm({ username: '', rating: 0, comment: '' });
            setReviewStatus('success');
            setReviewMsg('Review transmitted successfully.');
            setTimeout(() => { setReviewMsg(''); setReviewStatus('idle'); }, 3000);
        } catch (e) {
            setReviewStatus('error');
            setReviewMsg(e.response?.data?.message || 'Transmission failed.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono">
                <FiZap className="text-4xl animate-pulse mb-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">DECRYPTING_ASSET_PROTOCOLS...</span>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-8 text-center">
                <FiX className="text-6xl mb-6 animate-pulse" />
                <h1 className="text-2xl font-black uppercase tracking-widest mb-4">UPLINK_FAILURE</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-12 max-w-md leading-relaxed">
                    {error || "THE_REQUESTED_DATA_MODULE_IS_MISSING_OR_CORRUPT. RE-CALIBRATE_SEARCH_PARAMETERS."}
                </p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-red-900/20 border border-red-500 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
                >
                    RETURN_TO_BASE
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'intel', label: 'Intel', icon: FiCrosshair },
        { id: 'specs', label: 'Requirements', icon: FiCpu },
        { id: 'reviews', label: `Comm-Logs (${reviews.length})`, icon: FiZap },
    ];

    return (
        <div ref={mainRef} className="min-h-screen bg-[#020202] text-gray-200 font-mono overflow-x-hidden selection:bg-cyan-600 selection:text-white cursor-none">
            
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 border border-white/30 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center mix-blend-difference">
                <div className="absolute top-[-4px] w-0.5 h-2 bg-white" />
                <div className="absolute bottom-[-4px] w-0.5 h-2 bg-white" />
                <div className="absolute left-[-4px] w-2 h-0.5 bg-white" />
                <div className="absolute right-[-4px] w-2 h-0.5 bg-white" />
            </div>
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1 h-1 bg-cyan-500 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />

            <div className="scanlines pointer-events-none fixed inset-0 z-[90] opacity-[0.05]" />

            <header className="detail-hero relative h-[70vh] sm:h-[85vh] w-full flex items-end overflow-hidden border-b border-gray-900">
                <div className="absolute inset-0 z-0">
                    <img src={item?.image} className="detail-hero-img w-full h-full object-cover grayscale opacity-40 scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
                    <motion.button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-cyan-500 mb-10 hover:text-white transition-colors">
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
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Rating</span>
                            <span className="text-sm font-black text-cyan-500 flex items-center gap-2">
                                {item?.avgRating || '—'} <span className="text-[10px] text-gray-600">/ 5.0</span>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TAB NAVIGATION */}
            <div className="max-w-7xl mx-auto px-6 border-b border-gray-900 flex space-x-12 overflow-x-auto selection:bg-transparent">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-6 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all border-b-2 ${
                            activeTab === tab.id ? 'text-cyan-500 border-cyan-500' : 'text-gray-600 border-transparent hover:text-gray-300'
                        }`}
                    >
                        <tab.icon className={activeTab === tab.id ? 'animate-pulse' : ''} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                <div className="lg:col-span-8 space-y-24">
                    
                    {activeTab === 'intel' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-24">
                            {item?.videoUrl && (
                                <section className="gsap-reveal overflow-hidden border border-gray-900 bg-black relative aspect-video group">
                                    <iframe 
                                        className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                        src={item.videoUrl}
                                        title="YouTube video player" frameBorder="0" allowFullScreen
                                    />
                                </section>
                            )}
                            <section className="gsap-reveal">
                                <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-4">
                                    <span className="w-10 h-1 bg-cyan-600" /> Operational_Intel
                                </h2>
                                <p className="text-gray-400 text-[13px] leading-relaxed max-w-3xl border-l-[3px] border-gray-800 pl-8 uppercase tracking-wide font-medium">
                                    {item?.description || "CLASSIFIED_INTEL_REMAINS_ENCRYPTED."}
                                </p>
                            </section>
                            <section className="gsap-reveal bg-[#050505] border border-gray-900 p-8 shadow-2xl">
                                <div className="flex justify-between items-center mb-8 gap-4 border-b border-gray-900 pb-4">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500 flex items-center gap-3"><FiImage /> VISUAL_LOGS</h2>
                                    <div className="flex gap-2">
                                        {availableCategories.map(cat => (
                                            <button key={cat} onClick={() => setActiveScreenshotCat(cat)} className={`px-3 py-1 text-[8px] font-black tracking-widest uppercase transition-all ${activeScreenshotCat === cat ? 'bg-cyan-600 text-white' : 'bg-black text-gray-500 border border-gray-800'}`}>{cat}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="screenshot-grid grid grid-cols-2 gap-4">
                                    {visibleScreenshots.map((shot, i) => (
                                        <div key={i} onClick={() => setLightbox(i)} className="relative aspect-video overflow-hidden border border-gray-800 grayscale hover:grayscale-0 transition-all cursor-crosshair group">
                                            <img src={shot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                            <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 text-[7px] font-black text-gray-400 tracking-widest border border-gray-800">{shot.category}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'specs' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-4">
                                <span className="w-10 h-1 bg-cyan-600" /> System_Thresholds
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <SpecBlock title="MINIMUM_REQ" specs={item.minSpecs} variant="min" />
                                <SpecBlock title="OPTIMAL_SYNC" specs={item.recommendedSpecs} variant="rec" />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-12 gap-12">
                            <div className="md:col-span-12 lg:col-span-7 space-y-6">
                                <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-4">
                                    <span className="w-10 h-1 bg-cyan-600" /> Comm_Intercepts
                                </h2>
                                {reviews.length === 0 ? (
                                    <div className="py-20 border border-dashed border-gray-800 text-center uppercase tracking-[0.3em] text-[10px] text-gray-600">Zero communications logged from the field.</div>
                                ) : (
                                    reviews.map((r, i) => (
                                        <div key={i} className="bg-[#050505] border border-gray-900 p-6 border-l-4 border-l-cyan-600 shadow-xl">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-cyan-500 text-[10px] font-black uppercase tracking-widest block mb-1">ID: {r.username}</span>
                                                    <span className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                                                </div>
                                                <StarRating value={r.rating} />
                                            </div>
                                            <p className="text-gray-400 text-xs leading-relaxed uppercase tracking-wider">{r.comment || 'NO_MESSAGE_LOGGED'}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="md:col-span-12 lg:col-span-5">
                                <div className="bg-[#050505] border border-gray-900 p-8 sticky top-32 shadow-2xl">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-6 flex items-center gap-2">TRANSMIT_LOG</h3>
                                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2 font-black">Pilot_Identity</label>
                                            <input type="text" value={reviewForm.username} onChange={e => setReviewForm(f => ({ ...f, username: e.target.value }))} className="w-full bg-black border border-gray-800 p-4 text-white text-xs outline-none focus:border-cyan-600 uppercase tracking-widest font-black" placeholder="ALIAS_01" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2 font-black">Sync_Rating</label>
                                            <StarRating value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2 font-black">Message_Encrypted</label>
                                            <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} className="w-full bg-black border border-gray-800 p-4 text-white text-xs outline-none focus:border-cyan-600 h-32 resize-none uppercase tracking-widest" placeholder="TYPE_MESSAGE..." />
                                        </div>
                                        <button className="w-full py-4 bg-cyan-600 text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50" disabled={reviewStatus === 'loading'}>
                                            {reviewStatus === 'loading' ? 'Transmitting...' : 'Initiate Transmission'}
                                        </button>
                                        {reviewMsg && <p className={`text-[9px] text-center uppercase tracking-widest font-black ${reviewStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>{reviewMsg}</p>}
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <aside className="lg:col-span-4 space-y-8">
                    <div className="p-8 bg-[#050505] border border-gray-900 shadow-2xl relative sticky top-32">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><FiCrosshair size={100} /></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-6 flex items-center gap-2">MODULE_STATUS</h3>
                        <div className="space-y-4 mb-10 relative z-10">
                            <div className="p-4 bg-black border border-gray-800 flex justify-between items-center"><span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Payload</span><span className="text-sm font-black text-gray-200">{item?.downloadSize || '12.4 GB'}</span></div>
                            <div className="p-4 bg-black border border-gray-800 flex justify-between items-center"><span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Acquisitions</span><span className="text-sm font-black text-white">{item?.downloads || '0'}</span></div>
                            <div className="p-4 bg-black border border-gray-800 flex justify-between items-center"><span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Encryption</span><span className="text-[8px] font-black text-cyan-500 tracking-[0.2em]">APEX_SECURED</span></div>
                        </div>
                        <button onClick={handlePrimaryCta} className="w-full py-5 bg-cyan-600 text-white font-black uppercase tracking-[0.3em] text-[10px] border border-cyan-500 hover:bg-white hover:text-black transition-all group flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,242,255,0.4)] relative z-10">
                            {category === 'showroom' ? <FiShoppingCart /> : <FiDownload />}
                            {meta.cta}
                        </button>
                    </div>
                </aside>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scanlines { background: linear-gradient(to bottom, transparent, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1)); background-size: 100% 4px; }
                body { cursor: none !important; }
                a, button, input, textarea { cursor: none !important; }
            `}} />
        </div>
    );
}

export default GameDetail;