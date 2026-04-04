import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { FiCreditCard, FiShield, FiPackage, FiArrowRight, FiCheck, FiArrowLeft, FiAlertTriangle, FiCrosshair } from 'react-icons/fi';
import api from '../api/api';

const LS_KEY = 'nexus_checkout_items';

function loadSavedItems() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : null;
    } catch {
        return null;
    }
}

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    const [status, setStatus] = useState('idle');
    const [err, setErr] = useState('');
    const [orderId, setOrderId] = useState(null);

    const [email, setEmail] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExp, setCardExp] = useState('');
    const [cardCvc, setCardCvc] = useState('');

    // --- GSAP CUSTOM GAMING CURSOR ---
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
                const interactives = document.querySelectorAll('button, a, input, .interactive');
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


    const items = useMemo(() => {
        const fromNav = location.state?.items;
        if (Array.isArray(fromNav) && fromNav.length) return fromNav;
        const saved = loadSavedItems();
        if (saved?.length) return saved;
        return [
            {
                id: 'DEMO_SKU',
                title: 'Grid Pass · Season starter',
                priceUsd: 49.99,
                qty: 1,
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400&auto=format&fit=crop',
            },
        ];
    }, [location.state]);

    useEffect(() => {
        if (location.state?.items?.length) {
            localStorage.setItem(LS_KEY, JSON.stringify(location.state.items));
        }
    }, [location.state]);

    const subtotal = useMemo(
        () => items.reduce((sum, row) => {
            const qty = Math.max(1, parseInt(row.qty, 10) || 1);
            const p = Number(row.priceUsd) || 0;
            return sum + p * qty;
        }, 0),
        [items]
    );

    const handlePayment = async (e) => {
        e.preventDefault();
        setErr('');
        setStatus('processing');
        try {
            const payload = {
                email: email.trim() || undefined,
                items: items.map((row) => ({
                    title: row.title || 'Item',
                    priceUsd: Number(row.priceUsd) || 0,
                    qty: Math.max(1, parseInt(row.qty, 10) || 1),
                })),
            };
            const res = await api.post('/api/payments/charge', payload);

            // Get userId from stored JWT for profile logging
            const token = localStorage.getItem('token');
            let userId = null;
            if (token) {
                try {
                    const payload64 = token.split('.')[1];
                    userId = JSON.parse(atob(payload64)).id;
                } catch {}
            }

            let isEventEnrollment = false;
            for (const item of items) {
                if (item.isEvent && item.eventId !== undefined) {
                    isEventEnrollment = true;
                    try {
                        // Try new Events API first (MongoDB ObjectId)
                        const isObjectId = /^[0-9a-fA-F]{24}$/.test(item.eventId);
                        if (isObjectId) {
                            await api.post(`/api/events/${item.eventId}/join`, {
                                alias: item.alias,
                                team: item.team,
                                userId
                            });
                        } else {
                            await api.post(`/api/games/live-event/${item.eventId}/participate`, {
                                alias: item.alias,
                                team: item.team
                            });
                        }
                    } catch (participateErr) {
                        console.error("Failed to enroll pilot in backend:", participateErr);
                    }
                } else if (userId) {
                    // Log game purchase to profile
                    try {
                        await api.patch('/user/profile-purchase', {
                            gameId:    item.id || item.gameId || '',
                            gameTitle: item.title || 'Unknown Game',
                            price:     Number(item.priceUsd) || 0,
                            image:     item.image || ''
                        });
                    } catch {} // Non-critical
                }
            }

            localStorage.removeItem(LS_KEY);
            navigate('/thank-you', {
                state: {
                    orderId: res.data.orderId,
                    isEventEnrollment,
                    items: items.map(row => ({
                        id: row.id,
                        title: (row.title || '').replace(/_/g, ' '),
                        priceUsd: Number(row.priceUsd) || 0,
                        image: row.image,
                    })),
                }
            });
        } catch (e) {
            setStatus('idle');
            const data = e.response?.data;
            setErr(typeof data === 'string' ? data : data?.message || 'Payment failed');
        }
    };

    // Success state is now handled by the /thank-you route
    


    return (
        <div className="min-h-screen bg-[#020202] text-white font-mono pt-24 pb-32 px-6 cursor-none relative overflow-x-hidden">
            
            {/* GSAP CURSOR */}
            {/* GSAP TACTICAL CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-red-500/50 pointer-events-none z-[9999] flex items-center justify-center transition-colors">
                <div className="absolute top-[-2px] w-[1px] h-2 bg-red-500" />
                <div className="absolute bottom-[-2px] w-[1px] h-2 bg-red-500" />
                <div className="absolute left-[-2px] h-[1px] w-2 bg-red-500" />
                <div className="absolute right-[-2px] h-[1px] w-2 bg-red-500" />
            </div>
            <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-white pointer-events-none z-[9999] rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-10" />

            <div className="max-w-6xl mx-auto relative z-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="interactive flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-red-500 mb-10 transition-colors"
                >
                    <FiArrowLeft /> ABORT_TRANSFER
                </button>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* CART ITEMS */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 text-red-600 mb-4 ps-1 border-l-2 border-red-600">
                            <FiPackage className="text-xl ml-3" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Acquisition_Manifest</span>
                        </div>

                        <div className="bg-transparent border border-gray-900 flex flex-col">
                            {items.map((row, i) => (
                                <div key={`${row.id || row.title}-${i}`} className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-gray-900 p-6">
                                    <div className="w-full sm:w-32 h-32 bg-black border border-gray-800 overflow-hidden shrink-0 relative">
                                        <img src={row.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=200'} alt="" className="w-full h-full object-cover grayscale opacity-70" />
                                        <div className="absolute inset-0 border border-gray-700/50 mix-blend-overlay"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[9px] text-red-500 uppercase tracking-[0.3em] font-bold block mb-1">SKU_REF: {row.id || 'GENERIC_ASSET'}</span>
                                        <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter truncate text-gray-200">
                                            {(row.title || 'Item').replace(/_/g, ' ')}
                                        </h3>
                                        <p className="text-[10px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-3">
                                            UNITS_ACQUIRED [ {Math.max(1, parseInt(row.qty, 10) || 1)} ]
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="block text-[9px] text-gray-600 uppercase tracking-[0.2em] font-bold mb-1">VALUE</span>
                                        <span className="text-red-500 font-black text-2xl">
                                            ${(Number(row.priceUsd || 0) * Math.max(1, parseInt(row.qty, 10) || 1)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            <div className="p-6 bg-[#050505]">
                                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-3">
                                    <span>SUBTOTAL</span>
                                    <span className="font-mono text-gray-400">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-6">
                                    <span>NETWORK_TAX</span>
                                    <span className="font-mono text-gray-400">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-black italic uppercase text-white border-t border-gray-900 pt-6">
                                    <span>NET_TRANSFER</span>
                                    <span className="text-red-500">${subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAYMENT FORM */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handlePayment} className="bg-black border border-red-900 p-8 sticky top-28 shadow-2xl relative">
                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                <FiCrosshair className="text-4xl text-red-500" />
                            </div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 text-white flex items-center gap-3">
                                <FiShield className="text-red-600 text-lg" /> Uplink_Secured
                            </h2>

                            {err && (
                                <div className="mb-6 p-4 border border-red-500 bg-red-950/20 text-red-500 text-[10px] uppercase font-bold tracking-widest flex items-start gap-3">
                                    <FiAlertTriangle className="shrink-0 text-sm" />
                                    <span>{err}</span>
                                </div>
                            )}

                            <div className="space-y-5 mb-8 relative z-10">
                                <div>
                                    <label className="text-[9px] text-red-500 uppercase font-black tracking-[0.3em] block mb-2">TARGET_EMAIL</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#050505] border border-gray-800 p-4 text-[10px] font-bold tracking-[0.2em] text-white focus:border-red-600 outline-none transition-colors uppercase placeholder:text-gray-700"
                                        placeholder="DATA@NEXUS.COM"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-red-500 uppercase font-black tracking-[0.3em] block mb-2">ACCOUNT_HOLDER</label>
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        required
                                        className="w-full bg-[#050505] border border-gray-800 p-4 text-[10px] font-bold tracking-[0.2em] text-white focus:border-red-600 outline-none transition-colors uppercase placeholder:text-gray-700"
                                        placeholder="NAME_STRING"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-red-500 uppercase font-black tracking-[0.3em] block mb-2">CREDENTIAL_KEY</label>
                                    <div className="bg-[#050505] border border-gray-800 p-3.5 flex items-center gap-3 focus-within:border-red-600 transition-colors">
                                        <FiCreditCard className="text-red-900 shrink-0" />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="cc-number"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
                                            required
                                            minLength={12}
                                            className="bg-transparent text-xs w-full outline-none font-mono tracking-[0.2em] text-white placeholder:text-gray-700"
                                            placeholder="XXXX XXXX XXXX XXXX"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] text-red-500 uppercase font-black tracking-[0.3em] block mb-2">CYCLE</label>
                                        <input
                                            type="text"
                                            value={cardExp}
                                            onChange={(e) => setCardExp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            required
                                            className="w-full bg-[#050505] border border-gray-800 p-4 text-xs font-mono font-bold tracking-[0.2em] text-white focus:border-red-600 outline-none transition-colors placeholder:text-gray-700"
                                            placeholder="MMYY"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-red-500 uppercase font-black tracking-[0.3em] block mb-2">PIN</label>
                                        <input
                                            type="password"
                                            value={cardCvc}
                                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            required
                                            className="w-full bg-[#050505] border border-gray-800 p-4 text-xs font-mono font-bold tracking-[0.2em] text-white focus:border-red-600 outline-none transition-colors placeholder:text-gray-700"
                                            placeholder="***"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'processing'}
                                className={`interactive w-full border font-black uppercase tracking-[0.4em] text-[10px] py-5 flex items-center justify-center gap-3 transition-colors ${
                                    status === 'processing'
                                        ? 'bg-gray-900 border-gray-900 text-gray-600 cursor-not-allowed'
                                        : 'bg-red-600/10 border-red-600 text-red-500 hover:bg-red-600 hover:text-white'
                                }`}
                            >
                                {status === 'processing' ? 'NEGOTIATING_UPLINK...' : (
                                    <>
                                        EXECUTE_TRANSFER <FiArrowRight />
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-[8px] uppercase font-bold tracking-[0.3em] text-gray-600">
                                <FiShield className="text-red-900" /> NO_REAL_DATA_LOGGED
                            </div>
                        </form>
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

export default Checkout;
