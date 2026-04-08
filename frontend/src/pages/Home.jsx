import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import {
    FiActivity, FiLayers, FiCrosshair, FiFlag, FiAward, 
    FiZap, FiChevronRight, FiTrendingUp, FiDownload, FiSettings, FiPlayCircle
} from 'react-icons/fi';
// Ensure your API path is correct or mock it out if not available
import api from '../api/api';

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

function Home() {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);
    const horizontalSectionRef = useRef(null);
    const horizontalWrapperRef = useRef(null);
    const assemblyRef = useRef(null); 

    const [activeFilter, setActiveFilter] = useState("ALL");
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bootText, setBootText] = useState("INITIALIZING_CORE...");

    // --- MOCK DATA ---
    const mockMarket = [
        { id: 'SYS-01', title: 'PORSCHE 911 GT3 R', genre: 'SIMULATOR', price: 'FREE', image: 'https://images.unsplash.com/photo-1503376712344-652d0f48a616?q=80&w=800&auto=format&fit=crop' },
        { id: 'SYS-02', title: 'NISSAN GT-R R34', genre: 'STREET_ARCADE', price: '$4.99', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800&auto=format&fit=crop' },
        { id: 'SYS-03', title: 'MCLAREN 720S GT3', genre: 'SIMULATOR', price: '$9.99', image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=800&auto=format&fit=crop' },
        { id: 'SYS-04', title: 'MAZDA RX-7 FD', genre: 'STREET_ARCADE', price: 'FREE', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop' },
        { id: 'SYS-05', title: 'FORD BRONCO BAJA', genre: 'OFF_ROAD', price: '$5.99', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop' },
        { id: 'SYS-06', title: 'AUDI R8 LMS', genre: 'SIMULATOR', price: '$7.99', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800&auto=format&fit=crop' }
    ];

    const mockEvents = [
        { title: "NEO TOKYO DRIFT CUP", status: "LIVE", prize: "$50,000", entrants: 128, date: "NOW" },
        { title: "NÜRBURGRING ENDURANCE", status: "UPCOMING", prize: "$100,000", entrants: "64/100", date: "APR 15" },
        { title: "STREET SYNDICATE SPRINT", status: "REGISTRATION", prize: "$25,000", entrants: "12/50", date: "MAY 02" }
    ];

    const mockDrivers = [
        { rank: 1, alias: "GHOST_RIDER", chassis: "PORSCHE 911 GT3", rating: "S+", winRate: "78%" },
        { rank: 2, alias: "NIGHT_KID", chassis: "NISSAN GT-R R34", rating: "S", winRate: "72%" },
        { rank: 3, alias: "APEX_PREDATOR", chassis: "MCLAREN 720S", rating: "S", winRate: "69%" }
    ];

    // --- GSAP CUSTOM GAMING CURSOR ---
    useLayoutEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current) return;

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

            // Re-bind hover events slightly after load to ensure DOM is ready
            setTimeout(() => {
                const interactives = document.querySelectorAll('button, a, .interactive-card');
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
    }, [loading, activeFilter]);

    // --- GSAP SCROLL ANIMATIONS ---
    useLayoutEffect(() => {
        if (loading) return;

        let ctx = gsap.context(() => {
            // 1. Top Progress Bar
            if (document.querySelector(".scroll-progress")) {
                gsap.to(".scroll-progress", {
                    scaleX: 1, ease: "none",
                    scrollTrigger: { trigger: mainRef.current, start: "top top", end: "bottom bottom", scrub: true }
                });
            }

            // 2. Hero Parallax
            if (mainRef.current.querySelector(".hero-bg")) {
                gsap.to(mainRef.current.querySelector(".hero-bg"), {
                    yPercent: 30, scale: 1.05,
                    scrollTrigger: { trigger: "header.hero-section", start: "top top", end: "bottom top", scrub: true }
                });
            }

            // 3. 🏁 360° DIAGNOSTIC SCAN
            if (assemblyRef.current && document.querySelector(".car-1")) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: assemblyRef.current,
                        start: "top top",
                        end: "+=200%", // Adjusted for 3 stages
                        pin: true,
                        scrub: 1,
                    }
                });

                // Helper config for smoother crossfades
                const hideState = { autoAlpha: 0, scale: 1.1, filter: "blur(5px)", duration: 1 };
                const showState = { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1 };

                tl.to(".car-1", hideState)
                  .to(".txt-1", { autoAlpha: 0, x: -30, duration: 1 }, "<")
                  .fromTo(".car-2", { autoAlpha: 0, scale: 0.9, filter: "blur(5px)" }, showState, "<")
                  .fromTo(".txt-2", { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 1 }, "<")
                  
                  .to(".car-2", hideState)
                  .to(".txt-2", { autoAlpha: 0, x: 30, duration: 1 }, "<")
                  .fromTo(".car-3", { autoAlpha: 0, scale: 0.9, filter: "blur(5px)" }, showState, "<")
                  .fromTo(".txt-3", { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 1 }, "<");
            }

            // 4. Horizontal Scroll Section (Showroom)
            if (horizontalSectionRef.current && horizontalWrapperRef.current) {
                const getScrollAmount = () => {
                    let wrapperWidth = horizontalWrapperRef.current.scrollWidth;
                    return -(wrapperWidth - window.innerWidth + 64); // 64px accounts for padding
                };

                const tween = gsap.to(horizontalWrapperRef.current, {
                    x: getScrollAmount,
                    ease: "none",
                });

                ScrollTrigger.create({
                    trigger: horizontalSectionRef.current,
                    start: "top top",
                    end: () => `+=${getScrollAmount() * -1}`,
                    pin: true,
                    animation: tween,
                    scrub: 1,
                    invalidateOnRefresh: true
                });
            }

            // 5. Reveal Text Effects
            gsap.utils.toArray('.reveal-text').forEach(text => {
                gsap.fromTo(text, 
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
                      scrollTrigger: { trigger: text, start: "top 90%" } }
                );
            });

            // 6. Staggered Sections
            gsap.from(".step-card", {
                y: 50, opacity: 0, duration: 0.6, stagger: 0.15, ease: "back.out(1.2)",
                scrollTrigger: { trigger: ".steps-section", start: "top 75%" }
            });

            gsap.from(".stat-card", {
                y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
                scrollTrigger: { trigger: ".telemetry-section", start: "top 85%" }
            });

            setTimeout(() => ScrollTrigger.refresh(), 200);

        }, mainRef.current);

        return () => ctx.revert();
    }, [loading, activeFilter]);

    // --- FAKE BOOT SEQUENCE ---
    useEffect(() => {
        const bootSequence = [
            "ESTABLISHING_UPLINK...",
            "LOADING_AERODYNAMICS_ENGINE...",
            "DECRYPTING_LOBBIES...",
            "SYSTEM_ONLINE"
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            i++;
            if (i < bootSequence.length) {
                setBootText(bootSequence[i]);
            } else {
                clearInterval(interval);
                fetchGameData();
            }
        }, 400); // Sped up slightly for better UX

        return () => clearInterval(interval);
    }, []);

    const fetchGameData = async () => {
        try {
            // Wrap in try-catch in case API is offline to ensure app still loads mock data
            const response = await api.get('/api/games').catch(() => ({ data: null }));
            setGameData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.1),transparent_50%)]" />
                <FiZap className="text-4xl animate-pulse mb-6 text-cyan-600 drop-shadow-[0_0_15px_rgba(0,242,255,0.8)]" />
                <div className="overflow-hidden border border-cyan-900/50 bg-black/50 backdrop-blur px-6 py-3">
                    <span className="font-black uppercase tracking-[0.4em] text-xs block text-white text-center">
                        {bootText}
                    </span>
                    <div className="h-0.5 bg-cyan-600 mt-2 w-full origin-left animate-[scaleX_1.6s_ease-in-out_forwards]" />
                </div>
            </div>
        );
    }

    const currentMarketData = gameData?.globalMarket?.length > 0 ? gameData.globalMarket : mockMarket;
    const filteredMarket = currentMarketData.filter(game =>
        activeFilter === "ALL" ? true : game.genre === activeFilter
    );

    return (
        // Added custom class for scoped cursor hiding to prevent global bleed
        <div ref={mainRef} className="scoped-cursor-app min-h-screen bg-[#020202] text-gray-200 font-mono overflow-x-hidden selection:bg-cyan-600 selection:text-white relative">
            
            {/* GLOBAL CRT EFFECTS */}
            <div className="crt-overlay" />
            <div className="scanline" />
            
            {/* TOP SCROLL PROGRESS */}
            <div className="fixed top-0 left-0 w-full h-[2px] bg-gray-900 z-[200] origin-left">
                <div className="scroll-progress h-full bg-cyan-500 shadow-[0_0_15px_rgba(0,242,252,1)] scale-x-0 origin-left" />
            </div>

            {/* GSAP TACTICAL CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-500/50 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-colors">
                <div className="absolute top-[-2px] w-[1px] h-2 bg-cyan-500" />
                <div className="absolute bottom-[-2px] w-[1px] h-2 bg-cyan-500" />
                <div className="absolute left-[-2px] h-[1px] w-2 bg-cyan-500" />
                <div className="absolute right-[-2px] h-[1px] w-2 bg-cyan-500" />
            </div>
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />

            {/* GSAP Scroll Progress */}
            <div className="scroll-progress fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 to-cyan-400 z-[100] origin-left scale-x-0" />

            {/* HERO SECTION */}
            <header className="hero-section relative w-full h-screen flex items-center justify-center overflow-hidden border-b border-gray-900 bg-black">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="hero-bg absolute inset-[-10%] bg-cover bg-center opacity-30 mix-blend-luminosity grayscale transition-all duration-1000" style={{ backgroundImage: `url(${gameData?.featuredAsset?.image || 'https://images.unsplash.com/photo-1512749491228-caef5a7831d7?q=80'})` }} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05),transparent_70%)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-[#020202]" />
                </div>

                <div className="relative z-10 ultra-wide-container px-6 flex flex-col items-center text-center">
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-3 mb-6 bg-cyan-600/10 border border-cyan-500/30 px-4 py-1.5 backdrop-blur-md">
                        <div className="w-2 h-2 bg-cyan-500 rounded-none animate-ping" />
                        <span className="text-cyan-500 text-[10px] font-bold tracking-[0.4em] uppercase">APEX_CORE_V5</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="reveal-text text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black italic tracking-tighter uppercase mb-4 leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                    >
                        CYBER<span className="text-cyan-500">_PUNK</span>
                    </motion.h1>
                    
                    <p className="reveal-text text-gray-400 max-w-lg mx-auto text-sm sm:text-base mb-12 tracking-widest uppercase border-l-2 border-cyan-600 pl-4 py-1">
                        {gameData?.featuredAsset?.tagline || "Absolute precision. Zero tolerance."}
                    </p>
                    
                    <motion.button 
                        onClick={() => navigate(`/game/featured/${gameData?.featuredAsset?.id || 'demo'}`)} 
                        whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(0, 242, 255, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        className="reveal-text glass-card group relative overflow-hidden text-cyan-400 px-12 py-5 font-black uppercase tracking-[0.2em] text-xs border border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,255,0.1)] transition-all"
                    >
                        <span className="relative z-10 flex items-center gap-3"><FiActivity className="text-lg" /> INITIALIZE_DRIVE</span>
                        <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out mix-blend-difference" />
                    </motion.button>
                </div>

                {/* BOTTOM DECORATIONS */}
                <div className="absolute bottom-10 left-10 flex items-center gap-4 z-20">
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Lat: 35.6895° N</div>
                    <div className="w-8 h-px bg-gray-800" />
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Lon: 139.6917° E</div>
                </div>
                
                {/* HUD TARGETS */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] border border-cyan-500/10 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/50" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500/50" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500/50" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/50" />
                </div>
            </header>

            {/* 🔥 TECHNICAL REVEAL (3 Stages) */}
            <section ref={assemblyRef} className="relative h-screen w-full bg-[#030303] flex items-center justify-center overflow-hidden border-b border-gray-900 group/scan">
                
                {/* BACKGROUND DECORATIONS */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute h-px w-full top-1/4 bg-cyan-600/20" />
                    <div className="absolute h-px w-full top-1/2 bg-cyan-600/30" />
                    <div className="absolute h-px w-full top-3/4 bg-cyan-600/20" />
                    <div className="absolute w-px h-full left-1/4 bg-cyan-600/10" />
                    <div className="absolute w-px h-full left-3/4 bg-cyan-600/10" />
                </div>

                <div className="absolute top-10 left-6 md:left-10 z-50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 bg-cyan-500 animate-pulse" />
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Specs_<span className="text-cyan-500">Matrix</span></h2>
                    </div>
                    <p className="text-[10px] text-gray-500 tracking-[0.4em] uppercase font-bold pl-5">Technical Breakdown // V5.0.0</p>
                </div>

                <div className="relative w-full max-w-6xl h-full flex items-center justify-center px-4">
                    
                    {/* PHASE 1: SIDE (FRONT) */}
                    <div className="car-1 absolute w-[95%] md:w-[85%] h-[50%] md:h-[70%] flex items-center justify-center z-10 transition-all duration-700 top-1/2 -translate-y-[60%] lg:top-auto lg:translate-y-0">
                        <motion.img 
                            animate={{ x: [0, -2, 2, 0], filter: ["hue-rotate(0deg)", "hue-rotate(10deg)", "hue-rotate(-10deg)", "hue-rotate(0deg)"] }}
                            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror", repeatDelay: 3 }}
                            src={`${import.meta.env.BASE_URL}car-side.png`} className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(220,38,38,0.2)] lg:scale-125 hover:brightness-125 transition-all" alt="LH Side" 
                        />
                    </div>
                    <div className="txt-1 absolute bottom-20 left-4 right-4 md:bottom-auto md:left-10 md:right-auto z-20 border-l-4 border-cyan-500 px-6 py-4 glass-card shadow-2xl transition-transform duration-300 group-hover/scan:translate-y-[-10px]">
                        <span className="block text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-1">DATA: ALPHA</span>
                        <span className="block text-xl md:text-3xl font-black text-white italic leading-tight uppercase tracking-tighter">Aerodynamic_Force</span>
                        <div className="mt-3 flex flex-col gap-1">
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-cyan-600" /> DRAG_INDEX: 0.24</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-cyan-600" /> VECTOR: STABLE</span>
                        </div>
                    </div>

                    {/* PHASE 2: TOP DOWN */}
                    <div className="car-2 absolute w-[75%] md:w-[50%] h-[80%] md:h-[95%] flex items-center justify-center z-10 opacity-0 top-1/2 -translate-y-[60%] lg:top-auto lg:translate-y-0">
                         <motion.img 
                            animate={{ opacity: [1, 0.8, 1, 0.9, 1] }}
                            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
                            src={`${import.meta.env.BASE_URL}car-top.png`} className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] lg:scale-125" alt="Top View" 
                         />
                    </div>
                    <div className="txt-2 absolute bottom-20 left-4 right-4 md:bottom-auto md:right-10 md:left-auto z-20 border-r-4 border-white px-6 py-4 glass-card shadow-2xl opacity-0 text-center md:text-right">
                        <span className="block text-[10px] text-cyan-400 font-bold uppercase tracking-[0.3em] mb-1">DATA: SIGMA</span>
                        <span className="block text-xl md:text-3xl font-black text-white italic leading-tight uppercase tracking-tighter">Structural_Grid</span>
                        <div className="mt-3 flex flex-col gap-1 items-center md:items-end">
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-2">SYMMETRY: 100% <div className="hidden md:block w-1 h-1 bg-white" /></span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-2">ALIGNMENT: TRUED <div className="hidden md:block w-1 h-1 bg-white" /></span>
                        </div>
                    </div>

                    {/* PHASE 3: EXPLODED / PARTS */}
                    <div className="car-3 absolute w-[100%] md:w-[90%] h-[60%] md:h-[80%] flex items-center justify-center z-10 opacity-0 top-1/2 -translate-y-[60%] lg:top-auto lg:translate-y-0">
                        <motion.img 
                            animate={{ x: [-1, 1, -1, 0], y: [1, -1, 1, 0] }}
                            transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 4 }}
                            src={`${import.meta.env.BASE_URL}car-detail.png`} className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,242,255,0.2)] lg:scale-125" alt="Exploded Parts" 
                        />
                    </div>
                    <div className="txt-3 absolute bottom-20 left-4 right-4 md:bottom-auto md:left-10 md:right-auto z-20 border-l-4 border-cyan-500 px-6 py-4 glass-card shadow-2xl opacity-0">
                        <span className="block text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-1">DATA: GAMMA</span>
                        <span className="block text-xl md:text-3xl font-black text-white italic leading-tight uppercase tracking-tighter">Core_Telemetry</span>
                        <div className="mt-3 flex flex-col gap-1">
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-cyan-600" /> SYSTEM: ACTIVE</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-cyan-600" /> LINK: ENCRYPTED</span>
                        </div>
                    </div>
                </div>

                {/* BOTTOM STATUS BAR */}
                <div className="absolute bottom-10 right-10 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-600" /> LINK_ACQUIRED</div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white/10" /> ENCRYPTION_SYNC</div>
                </div>
            </section>

            {/* HOW TO PLAY / ONBOARDING */}
            <section className="steps-section py-24 md:py-32 bg-[#050505] border-b border-gray-900 relative overflow-hidden">
                <div className="absolute right-[-10%] top-[10%] text-[20vw] font-black italic text-gray-900/10 whitespace-nowrap pointer-events-none select-none">
                    ONBOARDING
                </div>
                <div className="ultra-wide-container px-6 relative z-10">
                    <div className="text-center mb-16 md:mb-20 reveal-text">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-4">
                            Deployment Protocol
                        </h2>
                        <p className="text-gray-500 text-xs tracking-[0.2em] uppercase">Three steps to enter the global grid</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
                        <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gray-800 -translate-y-1/2 z-0" />

                        {[
                            { step: "01", icon: FiDownload, title: "ACQUIRE CLIENT", desc: "Download the Apex Core Engine via our secure P2P launcher. Windows & Linux supported.", action: "DOWNLOAD NOW" },
                            { step: "02", icon: FiSettings, title: "CALIBRATE HARDWARE", desc: "Map your direct-drive wheel, pedals, or controller. Engine detects 99% of peripherals.", action: "VIEW SPECS" },
                            { step: "03", icon: FiPlayCircle, title: "ENTER THE GRID", desc: "Pass the mandatory Rookie License test and join the global matchmaking servers.", action: "TUTORIALS" }
                        ].map((item, i) => (
                            <div key={i} className="step-card glass-card relative z-10 p-8 flex flex-col items-center text-center group hover:border-cyan-400 transition-colors duration-500">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 group-hover:bg-cyan-500 transition-colors" />
                                <div className="text-6xl font-black italic text-gray-900 absolute top-4 left-4 group-hover:text-cyan-900/20 transition-colors">{item.step}</div>
                                
                                <div className="w-20 h-20 rounded-full bg-black border border-gray-800 flex items-center justify-center mb-6 group-hover:border-cyan-500 group-hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all z-10">
                                    <item.icon className="text-3xl text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                
                                <h3 className="text-xl font-black uppercase text-white mb-4 z-10">{item.title}</h3>
                                <p className="text-[11px] text-gray-400 tracking-widest leading-relaxed uppercase z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GSAP HORIZONTAL SCROLL SHOWROOM */}
            <section ref={horizontalSectionRef} className="bg-[#020202] relative overflow-hidden h-screen flex flex-col justify-center border-b border-gray-900">
                <div className="absolute top-12 left-6 right-6 z-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-gray-800 bg-[#020202]/80 backdrop-blur-sm">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest text-white flex items-center gap-4 reveal-text">
                        <FiLayers className="text-cyan-500" /> Chassis_Deck
                    </h2>
                    <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                        {["ALL", "STREET_ARCADE", "SIMULATOR", "OFF_ROAD"].map(cat => (
                            <button key={cat} onClick={() => setActiveFilter(cat)} className={`interactive-card hover:text-white transition-colors pb-1 ${activeFilter === cat ? "text-cyan-400 border-b-2 border-cyan-400" : ""}`}>
                                {cat.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden w-full h-full flex items-center mt-12 md:mt-24">
                    <div ref={horizontalWrapperRef} className="flex gap-6 px-6 w-max">
                        {filteredMarket.length > 0 ? filteredMarket.map((game, index) => (
                            <div 
                                key={index} 
                                onClick={() => navigate(`/game/showroom/${game.id}`)}
                                className="glass-card group relative w-[85vw] sm:w-[380px] h-[480px] flex-shrink-0 flex flex-col overflow-hidden hover:border-cyan-400/50 transition-all duration-500"
                            >
                                <div className="h-[65%] w-full overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <img src={game.image} alt={game.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-out" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    <div className="absolute top-4 left-4 bg-cyan-600 text-white text-[8px] font-black px-2 py-1 tracking-widest uppercase shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                                        CLASS: {game.genre}
                                    </div>
                                </div>
                                <div className="flex-1 p-5 flex flex-col justify-between relative z-10 border-t border-gray-900 group-hover:bg-cyan-900/10 transition-colors">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">ID: {game.id}</span>
                                            <FiCrosshair className="text-gray-700 group-hover:text-cyan-500 transition-colors" />
                                        </div>
                                        <h3 className="text-lg md:text-xl font-black uppercase text-white leading-tight mb-1">{game.title}</h3>
                                        {game.releaseDate && <div className="inline-block mt-1 mb-2 px-1.5 py-0.5 bg-cyan-600/20 text-cyan-400 text-[9px] rounded font-bold tracking-widest uppercase animate-pulse border border-cyan-500/30">RELEASED: {game.releaseDate}</div>}
                                        {game.description && <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">{game.description}</p>}
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                                        <span className="font-black text-lg text-white">{game.price}</span>
                                        <span className="text-[9px] text-cyan-500 uppercase tracking-widest font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                            Acquire <FiChevronRight />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="w-[100vw] flex items-center justify-center text-gray-600 font-bold tracking-widest uppercase">
                                NO CHASSIS FOUND FOR THIS CLASS
                            </div>
                        )}
                        <div className="w-[5vw] flex-shrink-0" />
                    </div>
                </div>
            </section>

            {/* DUAL SECTION: EVENTS & DRIVERS */}
            <section className="py-24 md:py-32 bg-black border-b border-gray-900">
                <div className="ultra-wide-container px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <div className="flex items-end justify-between mb-8 pb-4 border-b border-gray-800 reveal-text">
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                                <FiFlag className="text-cyan-600" /> Live_Circuits
                            </h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            {mockEvents.map((event, i) => (
                                <div key={i} className={`glass-card group p-5 border-l-4 ${event.status === 'LIVE' ? 'border-cyan-600 bg-cyan-900/10' : 'border-gray-700 bg-black/40'} hover:bg-cyan-900/20 transition-colors cursor-pointer`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 ${event.status === 'LIVE' ? 'bg-cyan-600 text-white animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                                            {event.status}
                                        </span>
                                        <span className="text-xs font-bold text-gray-500 tracking-widest">{event.date}</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-black uppercase text-white mb-6 group-hover:text-cyan-400 transition-colors">{event.title}</h3>
                                    <div className="flex justify-between items-end pt-4 border-t border-gray-800">
                                        <div>
                                            <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Prize Pool</span>
                                            <span className="text-base font-black text-cyan-400">{event.prize}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Entrants</span>
                                            <span className="text-sm font-bold text-gray-300">{event.entrants}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-end justify-between mb-8 pb-4 border-b border-gray-800 reveal-text">
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                                <FiAward className="text-cyan-500" /> Hall_Of_Fame
                            </h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {mockDrivers.map((driver, i) => (
                                <div key={i} className="glass-card flex items-center justify-between p-4 bg-black/20 hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <span className={`text-2xl font-black italic ${i === 0 ? 'text-yellow-500' : 'text-gray-700'}`}>0{driver.rank}</span>
                                        <div>
                                            <h4 className="text-sm md:text-base font-black uppercase text-gray-300 group-hover:text-white transition-colors">{driver.alias}</h4>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-500">{driver.chassis}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="text-right hidden sm:block">
                                            <span className="text-sm font-black text-cyan-400">{driver.winRate}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center group-hover:border-cyan-500 group-hover:bg-cyan-500/10 transition-colors">
                                            <FiTrendingUp className="text-gray-600 group-hover:text-cyan-400" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* GSAP TELEMETRY CARDS */}
            <section className="telemetry-section py-20 bg-[#020202] border-b border-gray-900 relative">
                <div className="ultra-wide-container px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 relative z-10">
                    <div className="lg:col-span-1 flex flex-col justify-center">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white reveal-text">Sys_Telemetry</h3>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-600 reveal-text">Live Network Diagnostics</p>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(gameData?.systemTelemetry || [
                            { label: "Active Nodes", value: "1,204" },
                            { label: "Match Latency", value: "24ms" },
                            { label: "Bandwidth", value: "1.2 TB/s" },
                            { label: "Lobbies", value: "8,942" }
                        ]).map((stat, i) => (
                            <div key={i} className="stat-card glass-card p-5 md:p-6 flex flex-col justify-center hover:border-cyan-400/50 transition-colors">
                                <span className="text-[9px] font-bold uppercase tracking-widest block mb-2 text-gray-500">{stat.label}</span>
                                <span className="text-2xl md:text-3xl font-black italic text-white mb-2">{stat.value}</span>
                                <div className="h-1 bg-gray-800 w-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "100%" }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,242,255,0.8)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="bg-black py-16 flex flex-col items-center">
                <h2 className="text-2xl md:text-3xl font-black italic text-gray-800 uppercase tracking-tighter">APEX_ENGINE_V5</h2>
                <p className="text-[10px] text-gray-600 tracking-[0.2em] uppercase flex items-center gap-2 mt-4">
                    <span className="w-1.5 h-1.5 bg-cyan-600 inline-block" /> © 2026 Motorsport System
                </p>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scoped-cursor-app, 
                .scoped-cursor-app a, 
                .scoped-cursor-app button, 
                .scoped-cursor-app .interactive-card { 
                    cursor: none !important; 
                }
            `}} />
        </div>
    );
}

export default Home;