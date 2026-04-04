import React, { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
    FiCheck, FiArrowLeft, FiShield, FiZap, FiDownload, FiCopy,
    FiBox, FiHardDrive, FiCpu, FiMonitor, FiWifi, FiLock,
    FiImage, FiCalendar, FiUsers, FiStar, FiChevronRight, FiGlobe, FiHeadphones
} from 'react-icons/fi';

// ─── PARTICLE SYSTEM ──────────────────────────
function ParticleField() {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.6 - 0.2,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.6 + 0.1,
            color: Math.random() > 0.3 ? 'rgba(0,242,255,' : 'rgba(34,197,94,',
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = p.color + (p.alpha * 0.15) + ')';
                ctx.fill();
            });
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0,242,255,${0.08 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            animFrameRef.current = requestAnimationFrame(draw);
        };
        draw();

        const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        return () => { cancelAnimationFrame(animFrameRef.current); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

// ─── TYPEWRITER ──────────────────────────────
function TypeWriter({ text, speed = 40, className = '', onComplete }) {
    const [displayed, setDisplayed] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) { setDisplayed(text.substring(0, i + 1)); i++; }
            else { clearInterval(interval); onComplete?.(); setTimeout(() => setShowCursor(false), 2000); }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span className={className}>
            {displayed}
            {showCursor && <span className="animate-pulse text-cyan-500">▌</span>}
        </span>
    );
}

// ─── HEX BADGE ───────────────────────────────
function HexBadge({ children }) {
    return (
        <div className="relative">
            <svg viewBox="0 0 120 138" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(0,242,255,0.4))' }}>
                <defs>
                    <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(0,242,255,0.2)" />
                        <stop offset="100%" stopColor="rgba(34,197,94,0.15)" />
                    </linearGradient>
                    <linearGradient id="hexStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f2ff" />
                        <stop offset="50%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#00f2ff" />
                    </linearGradient>
                </defs>
                <polygon points="60 1, 118 35, 118 103, 60 137, 2 103, 2 35" fill="url(#hexGrad)" stroke="url(#hexStroke)" strokeWidth="2" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">{children}</div>
        </div>
    );
}

// ─── ANIMATED CHECKLIST ITEM ─────────────────
function CheckItem({ label, delay = 0, icon: Icon = FiCheck }) {
    const [checked, setChecked] = useState(false);
    useEffect(() => { const t = setTimeout(() => setChecked(true), delay); return () => clearTimeout(t); }, [delay]);
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: delay / 1000, duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-4 py-3 border-b border-gray-900/60 last:border-b-0 group"
        >
            <div className={`w-6 h-6 border flex-shrink-0 flex items-center justify-center transition-all duration-500 ${checked ? 'bg-green-500/20 border-green-500' : 'border-gray-700 bg-black'}`}>
                <AnimatePresence>
                    {checked && (
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                            <FiCheck className="text-green-400 text-xs" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon className={`text-sm flex-shrink-0 transition-colors duration-300 ${checked ? 'text-cyan-500' : 'text-gray-700'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${checked ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
            </div>
            <span className={`text-[7px] font-black tracking-[0.3em] uppercase transition-colors duration-300 flex-shrink-0 ${checked ? 'text-green-500' : 'text-gray-800'}`}>
                {checked ? 'DONE' : '---'}
            </span>
        </motion.div>
    );
}

// ─── SCREENSHOT LIGHTBOX ─────────────────────
function ScreenshotGallery({ screenshots = [] }) {
    const [lightbox, setLightbox] = useState(null);
    if (!screenshots.length) return null;

    return (
        <>
            <div className="anim-section w-full bg-black/60 border border-gray-800 backdrop-blur-sm overflow-hidden">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <FiImage className="text-cyan-500" />
                        <span className="text-[9px] text-cyan-500 font-black tracking-[0.5em] uppercase">VISUAL_LOGS</span>
                        <div className="flex-1 h-px bg-gray-900" />
                        <span className="text-[8px] text-gray-600 font-black tracking-[0.2em] uppercase">{screenshots.length}_CAPTURED</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {screenshots.map((url, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 2.2 + i * 0.15, duration: 0.5, ease: 'backOut' }}
                                onClick={() => setLightbox(i)}
                                className="relative aspect-video overflow-hidden border border-gray-800 group cursor-pointer hover:border-cyan-500/50 transition-all"
                            >
                                <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-2 left-2 text-[7px] font-black text-gray-400 tracking-[0.3em] uppercase bg-black/80 px-2 py-0.5 border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                    FRAME_{String(i + 1).padStart(2, '0')}
                                </div>
                                {/* Corner brackets */}
                                <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-cyan-500/0 group-hover:border-cyan-500/60 transition-colors" />
                                <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-cyan-500/0 group-hover:border-cyan-500/60 transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LIGHTBOX */}
            <AnimatePresence>
                {lightbox !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-8 cursor-pointer backdrop-blur-md"
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}>
                            <div className="relative border border-cyan-500/30 shadow-[0_0_60px_rgba(0,242,255,0.2)] max-w-4xl max-h-[80vh]">
                                <img src={screenshots[lightbox]} className="max-w-full max-h-[80vh] object-contain" alt="" />
                                <div className="absolute top-3 right-3 bg-black/80 border border-gray-800 px-3 py-1 text-[8px] font-black text-cyan-500 tracking-[0.3em] uppercase">
                                    FRAME_{String(lightbox + 1).padStart(2, '0')} · ESC_TO_CLOSE
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════
function ThankYou() {
    const location = useLocation();
    const orderId = location.state?.orderId;
    const isEventEnrollment = location.state?.isEventEnrollment;
    const isFree = orderId?.startsWith('FREE-');
    const passedItems = location.state?.items || [];
    const passedScreenshots = location.state?.screenshots || [];
    const firstItem = passedItems[0] || null;

    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);
    const containerRef = useRef(null);

    const [bootPhase, setBootPhase] = useState(0);
    const [copied, setCopied] = useState(false);

    // ─── GSAP TACTICAL CURSOR ────────────────
    useLayoutEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current) return;
        let ctx = gsap.context(() => {
            gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
            gsap.set(cursorDotRef.current, { xPercent: -50, yPercent: -50 });
            const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3.out" });
            const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3.out" });
            const xDotTo = gsap.quickTo(cursorDotRef.current, "x", { duration: 0.05, ease: "power4.out" });
            const yDotTo = gsap.quickTo(cursorDotRef.current, "y", { duration: 0.05, ease: "power4.out" });
            const moveCursor = (e) => { xTo(e.clientX); yTo(e.clientY); xDotTo(e.clientX); yDotTo(e.clientY); };
            const handleHoverEnter = () => { gsap.to(cursorRef.current, { scale: 1.5, rotation: 45, borderColor: "#00f2ff", duration: 0.3, ease: "back.out(2)" }); gsap.to(cursorDotRef.current, { scale: 0, duration: 0.2 }); };
            const handleHoverLeave = () => { gsap.to(cursorRef.current, { scale: 1, rotation: 0, borderColor: "rgba(0, 242, 255, 0.3)", duration: 0.3, ease: "power2.out" }); gsap.to(cursorDotRef.current, { scale: 1, duration: 0.2 }); };
            window.addEventListener("mousemove", moveCursor);
            setTimeout(() => {
                document.querySelectorAll('button, a, .interactive').forEach(el => {
                    el.addEventListener("mouseenter", handleHoverEnter);
                    el.addEventListener("mouseleave", handleHoverLeave);
                });
            }, 500);
            return () => window.removeEventListener("mousemove", moveCursor);
        });
        return () => ctx.revert();
    }, [bootPhase]);

    // ─── GSAP ENTRANCE ANIMATIONS ────────────
    useLayoutEffect(() => {
        if (bootPhase < 2 || !containerRef.current) return;
        let ctx = gsap.context(() => {
            gsap.from('.anim-badge', { scale: 0, rotation: -180, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 0.2 });
            gsap.from('.anim-title', { y: 40, opacity: 0, duration: 0.8, ease: 'power4.out', delay: 0.6 });
            gsap.from('.anim-subtitle', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.9 });
            gsap.from('.anim-order-block', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 1.1 });
            gsap.from('.anim-stats', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out', delay: 1.4 });
            gsap.from('.anim-section', { y: 30, opacity: 0, stagger: 0.2, duration: 0.6, ease: 'power3.out', delay: 1.8 });
            gsap.from('.anim-cta', { y: 20, opacity: 0, stagger: 0.15, duration: 0.5, ease: 'power2.out', delay: 2.6 });
            gsap.to('.hex-ring', { rotation: 360, duration: 20, repeat: -1, ease: 'none' });
            gsap.to('.progress-fill', { width: '100%', duration: 2, delay: 1.5, ease: 'power2.out' });
        }, containerRef.current);
        return () => ctx.revert();
    }, [bootPhase]);

    // ─── BOOT SEQUENCE ───────────────────────
    useEffect(() => {
        const t1 = setTimeout(() => setBootPhase(1), 1200);
        const t2 = setTimeout(() => setBootPhase(2), 2800);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const handleCopy = useCallback(() => {
        if (orderId) { navigator.clipboard.writeText(orderId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }
    }, [orderId]);

    if (!orderId) return <Navigate to="/" replace />;

    // ─── STATUS CONFIG ───────────────────────
    const statusConfig = isEventEnrollment
        ? { title: 'ENROLLMENT_CONFIRMED', subtitle: 'Pilot credentials authenticated and logged on server.', icon: FiShield, accentLabel: 'EVENT_LINKED' }
        : isFree
            ? { title: 'DOWNLOAD_INITIATED', subtitle: 'Payload secured. Downloading to local system.', icon: FiDownload, accentLabel: 'FREE_ACCESS' }
            : { title: 'TRANSACTION_VALID', subtitle: 'Funds allocated. Authorization chain verified.', icon: FiZap, accentLabel: 'PREMIUM_KEY' };

    const timestamp = new Date().toISOString().replace('T', ' // ').slice(0, 25);

    // ─── CHECKLIST ITEMS (context-dependent) ─
    const checklistItems = isEventEnrollment ? [
        { label: 'Registration verified & confirmed', delay: 2200, icon: FiShield },
        { label: 'Pilot alias locked to roster', delay: 2500, icon: FiUsers },
        { label: 'Team assignment synchronized', delay: 2800, icon: FiGlobe },
        { label: 'Event calendar updated', delay: 3100, icon: FiCalendar },
        { label: 'Comms channel activated', delay: 3400, icon: FiHeadphones },
        { label: 'Confirmation transmitted to email', delay: 3700, icon: FiZap },
    ] : [
        { label: 'Payment authorized & validated', delay: 2200, icon: FiShield },
        { label: 'License key generated', delay: 2500, icon: FiLock },
        { label: 'Asset bound to your account', delay: 2800, icon: FiStar },
        { label: 'Download queue initialized', delay: 3100, icon: FiDownload },
        { label: 'Cloud save slot allocated', delay: 3400, icon: FiHardDrive },
        { label: 'Receipt encrypted & stored', delay: 3700, icon: FiZap },
    ];

    // requirements info
    const sysRequirements = [
        { label: 'PLATFORM', value: 'WINDOWS 10/11 · LINUX', icon: FiMonitor },
        { label: 'PROCESSOR', value: 'INTEL i5-8400 / AMD RYZEN 5', icon: FiCpu },
        { label: 'MEMORY', value: '8 GB RAM MIN', icon: FiHardDrive },
        { label: 'NETWORK', value: 'BROADBAND 10 MBPS+', icon: FiWifi },
    ];


    // ─── BOOT SCREEN ─────────────────────────
    if (bootPhase < 2) {
        return (
            <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center cursor-none relative overflow-hidden font-mono">
                <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-500/30 pointer-events-none z-[9999] flex items-center justify-center">
                    <div className="absolute top-[-2px] w-[1px] h-2 bg-cyan-500" /><div className="absolute bottom-[-2px] w-[1px] h-2 bg-cyan-500" /><div className="absolute left-[-2px] h-[1px] w-2 bg-cyan-500" /><div className="absolute right-[-2px] h-[1px] w-2 bg-cyan-500" />
                </div>
                <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white pointer-events-none z-[9999] rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />

                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,242,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.08),transparent_60%)]" />

                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex flex-col items-center">
                    <div className="w-28 h-28 relative mb-10">
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-spin" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/40 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FiShield className={`text-3xl ${bootPhase === 0 ? 'text-cyan-500 animate-pulse' : 'text-green-500'} transition-colors duration-500`} />
                        </div>
                    </div>
                    <div className="bg-black/60 border border-cyan-900/40 backdrop-blur-md px-8 py-5 text-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500 mb-3">
                            {bootPhase === 0 ? 'VALIDATING_TRANSACTION...' : 'ENCRYPTING_RECEIPT...'}
                        </div>
                        <div className="w-64 h-1 bg-gray-900 overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-green-500" initial={{ width: '0%' }} animate={{ width: bootPhase === 0 ? '45%' : '90%' }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
                        </div>
                        <div className="text-[8px] text-gray-600 mt-3 font-bold tracking-[0.3em] uppercase">
                            {bootPhase === 0 ? 'PHASE_1: Authentication' : 'PHASE_2: Confirmation'}
                        </div>
                    </div>
                </motion.div>

                <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-10" />
                <style dangerouslySetInnerHTML={{ __html: `.scanlines{background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,0) 50%,rgba(0,0,0,.2) 50%,rgba(0,0,0,.2));background-size:100% 4px}body{cursor:none!important}a,button,select,input,.interactive{cursor:none!important}` }} />
            </div>
        );
    }

    // ═══════════════════════════════════════════
    //  MAIN RENDER
    // ═══════════════════════════════════════════
    return (
        <div ref={containerRef} className="min-h-screen bg-[#020202] text-white font-mono cursor-none relative overflow-hidden">

            <ParticleField />

            {/* CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-500/30 pointer-events-none z-[9999] flex items-center justify-center transition-colors">
                <div className="absolute top-[-2px] w-[1px] h-2 bg-cyan-500" /><div className="absolute bottom-[-2px] w-[1px] h-2 bg-cyan-500" /><div className="absolute left-[-2px] h-[1px] w-2 bg-cyan-500" /><div className="absolute right-[-2px] h-[1px] w-2 bg-cyan-500" />
            </div>
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white pointer-events-none z-[9999] rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />

            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-[0.06]" />
            <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,242,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,255,0.06)_0%,transparent_70%)] z-0" />

            {/* CORNER HUD */}
            <div className="fixed top-8 left-8 z-10 flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 animate-pulse" />
                <span className="text-[8px] text-gray-600 tracking-[0.4em] font-black uppercase">SYSTEM_ONLINE</span>
            </div>
            <div className="fixed top-8 right-8 z-10 text-right">
                <span className="text-[8px] text-gray-600 tracking-[0.3em] font-black uppercase block">UTC_{timestamp.split(' // ')[0]?.slice(11)}</span>
            </div>
            <div className="fixed bottom-8 left-8 z-10 flex items-center gap-4 text-[8px] text-gray-700 font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-600" /> APEX_CORE_V5</span>
                <span>•</span>
                <span>ENCRYPTED_LINK</span>
            </div>
            <div className="fixed bottom-8 right-8 z-10 text-[8px] text-gray-700 font-black uppercase tracking-[0.2em]">
                REF: {orderId?.slice(0, 8) || 'NULL'}
            </div>

            {/* ─── SCROLLABLE CONTENT ─────────────── */}
            <div className="relative z-10 flex flex-col items-center px-4 py-16 md:py-24 max-w-3xl mx-auto">

                {/* ━━━ HERO: BADGE + TITLE ━━━ */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full flex flex-col items-center">

                    {/* HEX BADGE */}
                    <div className="anim-badge relative w-28 h-32 mb-8">
                        <div className="hex-ring absolute -inset-6 opacity-30">
                            <svg viewBox="0 0 160 178" className="w-full h-full">
                                <polygon points="80 1, 158 45, 158 133, 80 177, 2 133, 2 45" fill="none" stroke="rgba(0,242,255,0.3)" strokeWidth="1" strokeDasharray="8,6" />
                            </svg>
                        </div>
                        <HexBadge>
                            <FiCheck className="text-4xl text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.9)]" />
                        </HexBadge>
                    </div>

                    {/* STATUS PILL */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 300 }} className="anim-subtitle inline-flex items-center gap-3 mb-6 bg-green-500/10 border border-green-500/30 px-4 py-2 backdrop-blur-md">
                        <div className="w-2 h-2 bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-[9px] font-black tracking-[0.4em] uppercase">{statusConfig.accentLabel}</span>
                    </motion.div>

                    {/* TITLE */}
                    <h1 className="anim-title text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-3 text-center leading-none">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400">{statusConfig.title}</span>
                    </h1>
                    <p className="anim-subtitle text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-10 text-center max-w-md">{statusConfig.subtitle}</p>
                </motion.div>


                {/* ━━━ ACQUIRED ITEM CARD ━━━ */}
                {firstItem && (
                    <div className="anim-section w-full bg-black/60 border border-gray-800 backdrop-blur-sm overflow-hidden mb-6">
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />
                        <div className="flex flex-col sm:flex-row">
                            {/* Thumbnail */}
                            {firstItem.image && (
                                <div className="sm:w-48 h-40 sm:h-auto overflow-hidden relative flex-shrink-0">
                                    <img src={firstItem.image} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity duration-500" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/70 hidden sm:block" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent sm:hidden" />
                                    {firstItem.genre && (
                                        <div className="absolute top-3 left-3 bg-cyan-600/90 text-white text-[7px] font-black px-2 py-1 tracking-[0.3em] uppercase shadow-[0_0_10px_rgba(0,242,255,0.4)]">
                                            {firstItem.genre}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Details */}
                            <div className="flex-1 p-6 flex flex-col justify-center">
                                <span className="text-[8px] text-cyan-500 font-black tracking-[0.4em] uppercase mb-2">
                                    {isEventEnrollment ? 'EVENT_ENROLLED' : 'ACQUIRED_ASSET'}
                                </span>
                                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white mb-3 leading-tight">
                                    {firstItem.title || 'UNKNOWN_MODULE'}
                                </h2>
                                {firstItem.description && (
                                    <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em] leading-relaxed line-clamp-2 mb-3">{firstItem.description}</p>
                                )}
                                <div className="flex items-center gap-6">
                                    <div>
                                        <span className="text-[7px] text-gray-600 font-black tracking-[0.3em] uppercase block mb-1">VALUE</span>
                                        <span className={`text-lg font-black ${firstItem.priceUsd > 0 ? 'text-green-400' : 'text-cyan-400'}`}>
                                            {firstItem.priceUsd > 0 ? `$${firstItem.priceUsd.toFixed(2)}` : 'FREE'}
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-800" />
                                    <div>
                                        <span className="text-[7px] text-gray-600 font-black tracking-[0.3em] uppercase block mb-1">SKU</span>
                                        <span className="text-[10px] font-bold text-gray-400 tracking-widest">{firstItem.id || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ━━━ ADDITIONAL ITEMS ━━━ */}
                {passedItems.length > 1 && (
                    <div className="anim-section w-full bg-black/60 border border-gray-800 backdrop-blur-sm overflow-hidden mb-6">
                        <div className="p-5">
                            <span className="text-[8px] text-cyan-500 font-black tracking-[0.4em] uppercase block mb-4">ADDITIONAL_ASSETS · {passedItems.length - 1}_MORE</span>
                            {passedItems.slice(1).map((item, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-900/60 last:border-b-0">
                                    {item.image && <img src={item.image} className="w-12 h-12 object-cover border border-gray-800 grayscale flex-shrink-0" alt="" />}
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-300 truncate block">{item.title}</span>
                                        <span className="text-[8px] text-gray-600 tracking-widest uppercase">{item.id || 'SKU_UNKNOWN'}</span>
                                    </div>
                                    <span className="text-sm font-black text-green-400 flex-shrink-0">{item.priceUsd > 0 ? `$${item.priceUsd.toFixed(2)}` : 'FREE'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* ━━━ TRANSACTION ID CARD ━━━ */}
                <div className="anim-order-block w-full bg-black/60 border border-gray-800 backdrop-blur-sm relative overflow-hidden mb-6">
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-[8px] text-cyan-500 font-black tracking-[0.5em] uppercase">TRANSACTION_ID</span>
                            <button onClick={handleCopy} className="interactive flex items-center gap-2 text-[8px] text-gray-600 hover:text-cyan-400 transition-colors font-black tracking-widest uppercase">
                                {copied ? <><FiCheck className="text-green-500" /> COPIED</> : <><FiCopy /> COPY</>}
                            </button>
                        </div>
                        <div className="bg-[#0a0a0a] border border-gray-900 p-5 mb-5 font-mono select-all group hover:border-cyan-900/50 transition-colors">
                            <TypeWriter text={orderId} speed={30} className="text-sm md:text-base font-bold text-cyan-400 tracking-[0.15em] break-all" />
                        </div>

                        {/* Progress bar */}
                        <div className="mb-5">
                            <div className="flex justify-between mb-2">
                                <span className="text-[8px] text-gray-600 font-black tracking-widest uppercase">VERIFICATION_PROGRESS</span>
                                <span className="text-[8px] text-green-500 font-black tracking-widest uppercase">COMPLETE</span>
                            </div>
                            <div className="h-1 bg-gray-900 w-full overflow-hidden">
                                <div className="progress-fill h-full bg-gradient-to-r from-cyan-500 via-green-500 to-cyan-500 shadow-[0_0_10px_rgba(0,242,255,0.6)]" style={{ width: 0 }} />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'STATUS', value: 'VERIFIED', color: 'text-green-400' },
                                { label: 'TIMESTAMP', value: timestamp.split(' // ')[1] || 'NOW', color: 'text-gray-300' },
                                { label: 'ENCRYPTION', value: 'AES-256', color: 'text-cyan-400' },
                            ].map((stat, i) => (
                                <div key={i} className="anim-stats bg-[#0a0a0a] border border-gray-900 p-3 md:p-4 text-center">
                                    <span className="text-[7px] text-gray-600 font-black tracking-[0.3em] uppercase block mb-2">{stat.label}</span>
                                    <span className={`text-[10px] font-black tracking-widest ${stat.color}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
                </div>


                {/* ━━━ SCREENSHOTS GALLERY ━━━ */}
                {passedScreenshots.length > 0 && (
                    <div className="w-full mb-6">
                        <ScreenshotGallery screenshots={passedScreenshots} />
                    </div>
                )}

                {/* ━━━ FALLBACK SCREENSHOTS (if no real ones passed, show item image) ━━━ */}
                {passedScreenshots.length === 0 && firstItem?.image && (
                    <div className="anim-section w-full mb-6">
                        <ScreenshotGallery screenshots={[firstItem.image]} />
                    </div>
                )}


                {/* ━━━ CHECKLIST: WHAT'S INCLUDED ━━━ */}
                <div className="anim-section w-full bg-black/60 border border-gray-800 backdrop-blur-sm overflow-hidden mb-6">
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <FiCheck className="text-green-500" />
                            <span className="text-[9px] text-green-400 font-black tracking-[0.5em] uppercase">
                                {isEventEnrollment ? 'ENROLLMENT_CHECKLIST' : 'ACQUISITION_CHECKLIST'}
                            </span>
                            <div className="flex-1 h-px bg-gray-900" />
                        </div>
                        <div className="space-y-0">
                            {checklistItems.map((item, i) => (
                                <CheckItem key={i} label={item.label} delay={item.delay} icon={item.icon} />
                            ))}
                        </div>
                    </div>
                </div>


                {/* ━━━ SYSTEM REQUIREMENTS ━━━ */}
                {!isEventEnrollment && (
                    <div className="anim-section w-full bg-black/60 border border-gray-800 backdrop-blur-sm overflow-hidden mb-6">
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <FiCpu className="text-cyan-500" />
                                <span className="text-[9px] text-cyan-500 font-black tracking-[0.5em] uppercase">SYSTEM_REQUIREMENTS</span>
                                <div className="flex-1 h-px bg-gray-900" />
                                <span className="text-[7px] text-gray-600 font-black tracking-[0.2em] uppercase">MINIMUM_SPEC</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {sysRequirements.map((req, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 2.8 + i * 0.1, duration: 0.4 }}
                                        className="bg-[#0a0a0a] border border-gray-900 p-4 flex items-center gap-4 group hover:border-cyan-900/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 border border-gray-800 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:bg-cyan-500/5 transition-all flex-shrink-0">
                                            <req.icon className="text-gray-600 group-hover:text-cyan-500 transition-colors" />
                                        </div>
                                        <div>
                                            <span className="text-[7px] text-gray-600 font-black tracking-[0.3em] uppercase block mb-1">{req.label}</span>
                                            <span className="text-[10px] font-bold text-gray-300 tracking-wider uppercase">{req.value}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}


                {/* ━━━ WHAT'S NEXT ━━━ */}
                <div className="anim-section w-full bg-black/60 border border-gray-800 backdrop-blur-sm overflow-hidden mb-8">
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <FiChevronRight className="text-yellow-500" />
                            <span className="text-[9px] text-yellow-400 font-black tracking-[0.5em] uppercase">WHAT_NEXT</span>
                            <div className="flex-1 h-px bg-gray-900" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {(isEventEnrollment ? [
                                { title: 'CHECK_SCHEDULE', desc: 'View the event timeline and match brackets.', link: '/events', icon: FiCalendar },
                                { title: 'TEAM_COMMS', desc: 'Coordinate with your squad in the community hub.', link: '/community', icon: FiUsers },
                                { title: 'PRACTICE_MODE', desc: 'Hit the grid and warm up before the event.', link: '/library', icon: FiStar },
                            ] : [
                                { title: 'OPEN_LIBRARY', desc: 'Access your acquired assets and start playing.', link: '/library', icon: FiBox },
                                { title: 'JOIN_EVENTS', desc: 'Compete in live tournaments for prizes.', link: '/events', icon: FiCalendar },
                                { title: 'COMMUNITY_HUB', desc: 'Connect with other pilots on the grid.', link: '/community', icon: FiUsers },
                            ]).map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.link}
                                    className="interactive group bg-[#0a0a0a] border border-gray-900 p-5 hover:border-cyan-500/40 hover:bg-cyan-900/5 transition-all"
                                >
                                    <item.icon className="text-xl text-gray-700 group-hover:text-cyan-500 transition-colors mb-3" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-white mb-2 transition-colors">{item.title}</h4>
                                    <p className="text-[8px] text-gray-600 leading-relaxed uppercase tracking-wider">{item.desc}</p>
                                    <div className="flex items-center gap-1 mt-3 text-[7px] text-cyan-600 font-black tracking-[0.3em] uppercase group-hover:translate-x-1 transition-transform">
                                        NAVIGATE <FiChevronRight className="text-[8px]" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>


                {/* ━━━ CTA BUTTONS ━━━ */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Link to="/" className="anim-cta interactive group relative overflow-hidden flex items-center justify-center gap-3 border border-cyan-600/60 text-cyan-400 hover:text-black py-5 font-black uppercase tracking-[0.25em] text-[9px] transition-all">
                        <span className="relative z-10 flex items-center gap-3"><FiArrowLeft /> RETURN_TO_HQ</span>
                        <div className="absolute inset-0 bg-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                    <Link to="/library" className="anim-cta interactive group relative overflow-hidden flex items-center justify-center gap-3 bg-cyan-600/10 border border-cyan-500/40 text-cyan-400 hover:text-black py-5 font-black uppercase tracking-[0.25em] text-[9px] transition-all">
                        <span className="relative z-10 flex items-center gap-3"><FiBox /> VIEW_LIBRARY</span>
                        <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                </div>

                {/* SECURITY */}
                <div className="anim-cta flex items-center justify-center gap-3 text-[7px] text-gray-700 font-black tracking-[0.3em] uppercase mb-8">
                    <FiShield className="text-cyan-900" />
                    SECURE_TRANSMISSION · NO_REAL_DATA_LOGGED
                    <FiShield className="text-cyan-900" />
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scanlines{background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,0) 50%,rgba(0,0,0,.2) 50%,rgba(0,0,0,.2));background-size:100% 4px}
                body{cursor:none!important}a,button,select,input,.interactive{cursor:none!important}
            `}} />
        </div>
    );
}

export default ThankYou;
