import React, { useLayoutEffect, useRef } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';

function ThankYou() {
    const location = useLocation();
    const orderId = location.state?.orderId;

    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    // --- GSAP TACTICAL CURSOR ---
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
                gsap.to(cursorRef.current, { scale: 1.5, rotation: 45, borderColor: "#22c55e", duration: 0.3, ease: "back.out(2)" });
                gsap.to(cursorRef.current.children, { backgroundColor: "#22c55e", duration: 0.3 });
                gsap.to(cursorDotRef.current, { scale: 0, duration: 0.2 });
            };

            const handleHoverLeave = () => {
                gsap.to(cursorRef.current, { scale: 1, rotation: 0, borderColor: "rgba(34, 197, 94, 0.5)", duration: 0.3, ease: "power2.out" });
                gsap.to(cursorRef.current.children, { backgroundColor: "#22c55e", duration: 0.3 });
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
    }, []);

    // Redirect to home if they navigate here without a purchase state
    if (!orderId) {
        return <Navigate to="/" replace />;
    }

    const isEventEnrollment = location.state?.isEventEnrollment;
    const isFree = orderId?.startsWith('FREE-');

    return (
        <div className="min-h-screen bg-[#020202] text-white font-mono flex items-center justify-center cursor-none relative overflow-hidden">
            
            {/* GSAP TACTICAL CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-green-500/50 pointer-events-none z-[9999] flex items-center justify-center transition-colors">
                <div className="absolute top-[-2px] w-[1px] h-2 bg-green-500" />
                <div className="absolute bottom-[-2px] w-[1px] h-2 bg-green-500" />
                <div className="absolute left-[-2px] h-[1px] w-2 bg-green-500" />
                <div className="absolute right-[-2px] h-[1px] w-2 bg-green-500" />
            </div>
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white pointer-events-none z-[9999] rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
            
            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-black border border-green-600 p-10 text-center relative z-10 shadow-[0_0_50px_rgba(34,197,94,0.15)]"
            >
                <FiCheck className="text-green-500 text-6xl mx-auto mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse" />
                <h1 className="text-2xl font-black italic uppercase tracking-widest mb-2 text-green-500">
                    {isEventEnrollment ? 'Enrollment_Confirmed' : (isFree ? 'Download_Initiated' : 'Transaction_Valid')}
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-6">
                    {isEventEnrollment ? 'Pilot credentials logged on server.' : (isFree ? 'Acquisition secured. Downloading payload...' : 'Funds allocated. Authorization logged.')}
                </p>
                <p className="text-sm font-mono font-bold text-gray-300 tracking-[0.2em] bg-[#050505] border border-gray-900 p-4 mb-8 select-all">
                    {orderId}
                </p>
                <Link
                    to="/"
                    className="interactive inline-flex items-center justify-center gap-3 w-full border border-green-600 text-green-500 hover:bg-green-600 hover:text-black py-4 font-black uppercase tracking-[0.3em] text-[10px] transition-colors"
                >
                    <FiArrowLeft /> Return_To_Grid
                </Link>
            </motion.div>

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

export default ThankYou;
