// components/DriveBackground.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DriveBackground = ({ children, isAccelerating }) => {
    // Parallax background skyline (mountains/distant city)
    const skyline = [...Array(6)].map((_, i) => ({
        id: i,
        width: Math.random() * 200 + 150,
        height: Math.random() * 100 + 50,
        opacity: Math.random() * 0.4 + 0.1
    }));

    // Burnout smoke particles
    const smokeParticles = [...Array(15)].map((_, i) => ({
        id: i,
        delay: Math.random() * 1.5,
        duration: Math.random() * 1 + 1,
        size: Math.random() * 50 + 40,
        yOffset: (Math.random() - 0.5) * 30,
    }));

    // High-speed foreground blur lines
    const speedLines = [...Array(10)].map((_, i) => ({
        id: i,
        top: Math.random() * 25 + 75 + '%',
        delay: Math.random() * 0.5,
        duration: Math.random() * 0.4 + 0.2,
    }));

    return (
        <div className="relative min-h-screen w-full bg-[#050810] overflow-hidden flex items-center justify-between font-mono">

            {/* 1. Static Sky & Sunset Glow */}
            <div className="absolute top-0 inset-x-0 h-[65%] bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#1e293b] z-0">
                <div className="absolute bottom-10 right-[25%] w-[500px] h-[200px] bg-orange-600/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-20 right-[40%] w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full" />
            </div>

            {/* 2. Distant Parallax Skyline */}
            <div className="absolute top-[35%] left-0 w-full h-[30%] overflow-hidden z-0 opacity-40">
                <motion.div
                    className="flex items-end h-full w-[200vw]"
                    animate={{ x: ['0vw', '-100vw'] }}
                    transition={{ repeat: Infinity, duration: isAccelerating ? 3 : 25, ease: "linear" }}
                >
                    {[...skyline, ...skyline].map((b, i) => (
                        <div key={i} className="bg-gradient-to-t from-[#050810] to-[#334155] rounded-t-lg mx-1"
                            style={{ width: b.width, height: b.height, opacity: b.opacity }} />
                    ))}
                </motion.div>
            </div>

            {/* 3. The Multi-Layered Racing Track */}
            <div className="absolute bottom-0 w-full h-[35%] bg-[#0f1115] z-10 flex flex-col justify-start overflow-hidden border-t-2 border-gray-800">

                {/* Track Fencing (Background Blur) */}
                <motion.div
                    className="absolute top-0 w-[200vw] h-12 bg-[repeating-linear-gradient(90deg,#333_0,#333_10px,transparent_10px,transparent_40px)] border-t border-b border-gray-600 z-0 opacity-40 blur-[1px]"
                    animate={{ x: ['0vw', '-100vw'] }}
                    transition={{ repeat: Infinity, duration: isAccelerating ? 0.2 : 1.5, ease: "linear" }}
                />

                {/* Red & White Track Apex Curb */}
                <motion.div
                    className="w-[200vw] h-4 mt-10 bg-[repeating-linear-gradient(90deg,#ef4444_0,#ef4444_80px,#ffffff_80px,#ffffff_160px)] shadow-[0_5px_15px_rgba(0,0,0,0.9)] z-10"
                    animate={{ x: ['0vw', '-100vw'] }}
                    transition={{ repeat: Infinity, duration: isAccelerating ? 0.08 : 0.6, ease: "linear" }}
                />

                {/* Motion Blurred Asphalt */}
                <motion.div
                    className="w-[200vw] h-full bg-[repeating-linear-gradient(90deg,#111_0,#111_150px,#18181b_150px,#18181b_300px)] z-0"
                    animate={{ x: ['0vw', '-100vw'] }}
                    transition={{ repeat: Infinity, duration: isAccelerating ? 0.04 : 0.3, ease: "linear" }}
                    style={{ filter: isAccelerating ? 'blur(2px)' : 'blur(0px)' }}
                />
            </div>

            {/* 4. The Precision Porsche 911 (SVG Masterpiece) */}
            <motion.div
                className="absolute bottom-[16%] left-[-15%] md:left-[5%] z-20 w-[450px] md:w-[650px] flex items-end"
                animate={
                    isAccelerating
                        ? { x: '150vw', rotateZ: -3, y: 15 } // Squats hard on rear suspension and launches
                        : { y: [0, -1.5, 0, 1.5, 0] } // Idle engine rumble
                }
                transition={
                    isAccelerating
                        ? { duration: 0.7, ease: "easeIn", delay: 0.1 }
                        : { repeat: Infinity, duration: 0.05 }
                }
            >
                {/* Underglow / Taillight Road Reflection */}
                <div className="absolute bottom-[15px] left-[30px] w-32 h-16 bg-red-600 blur-[40px] opacity-70" />

                {/* BURNOUT SMOKE (Idling) */}
                <AnimatePresence>
                    {!isAccelerating && smokeParticles.map((smoke) => (
                        <motion.div
                            key={smoke.id}
                            className="absolute bottom-[10px] left-[60px] bg-gray-300/20 rounded-full blur-2xl mix-blend-screen z-30 pointer-events-none"
                            style={{ width: smoke.size, height: smoke.size }}
                            animate={{
                                x: [0, -400],
                                y: [0, smoke.yOffset - 60],
                                scale: [1, 6],
                                opacity: [0, 0.7, 0],
                            }}
                            transition={{ repeat: Infinity, duration: smoke.duration, delay: smoke.delay, ease: "easeOut" }}
                        />
                    ))}
                </AnimatePresence>

                {/* NITROUS LAUNCH FLAMES (On Login) */}
                {isAccelerating && (
                    <div className="absolute bottom-[28px] left-[-140px] z-10 flex items-center">
                        <motion.div
                            className="w-[180px] h-[25px] bg-gradient-to-l from-[#ffffff] via-[#3b82f6] to-transparent rounded-full blur-[3px]"
                            animate={{ scaleX: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ repeat: Infinity, duration: 0.05 }}
                            style={{ transformOrigin: 'right center' }}
                        />
                        <motion.div
                            className="absolute right-0 w-[280px] h-[80px] bg-gradient-to-l from-[#ea580c] to-transparent rounded-full blur-[12px] opacity-80"
                            animate={{ scaleX: [1, 1.3, 1], scaleY: [1, 1.6, 1] }}
                            transition={{ repeat: Infinity, duration: 0.07 }}
                            style={{ transformOrigin: 'right center' }}
                        />
                    </div>
                )}

                {/* SVG PORSCHE 911 */}
                <svg viewBox="0 0 520 160" className="w-full h-auto relative z-20 drop-shadow-[0_25px_25px_rgba(0,0,0,0.8)]">
                    <defs>
                        {/* Headlight Beam Gradient */}
                        <linearGradient id="headlight-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Headlight Beam */}
                    <path d="M 465 88 L 620 60 L 620 140 Z" fill="url(#headlight-beam)" opacity="0.3" />

                    {/* Main Body (Racing Yellow #eab308) - REFINED SILHOUETTE */}
                    <path
                        d="M 30 125 
                           C 25 100, 30 85, 45 75 
                           C 80 50, 150 25, 230 25 
                           C 280 25, 320 40, 345 55 
                           C 370 75, 430 80, 470 85 
                           C 490 88, 495 105, 485 125 
                           L 435 125 
                           A 45 45 0 0 0 345 125 
                           L 175 125 
                           A 50 50 0 0 0 75 125 
                           L 30 125 Z"
                        fill="#eab308"
                    />

                    {/* Body Shading for Depth and Realism */}
                    {/* Roof/Hood Highlight */}
                    <path d="M 45 75 C 80 50, 150 25, 230 25 C 280 25, 320 40, 345 55 C 370 75, 430 80, 470 85" fill="transparent" stroke="#fef08a" strokeWidth="3" opacity="0.8" filter="blur(1px)" />
                    {/* Classic 911 Shoulder Line (Beltline) */}
                    <path d="M 40 85 C 120 75, 250 70, 350 72 C 410 73, 460 80, 480 88" stroke="#ca8a04" strokeWidth="2.5" opacity="0.7" fill="transparent" filter="blur(1px)" />
                    {/* Lower Side Skirt Shadow */}
                    <path d="M 175 122 L 345 122" fill="transparent" stroke="#854d0e" strokeWidth="6" opacity="0.8" filter="blur(1px)" />

                    {/* Windows (Refined 911 teardrop DLO) */}
                    <path d="M 330 60 C 290 35, 240 35, 200 35 C 140 35, 100 55, 80 70 L 95 73 L 340 65 Z" fill="#0a0a0c" stroke="#1f2937" strokeWidth="2" />
                    {/* B-Pillar */}
                    <path d="M 215 35 L 205 69" stroke="#111" strokeWidth="5" />

                    {/* Door Seams and Handles */}
                    <path d="M 150 72 L 145 122 M 250 68 L 260 122" stroke="#ca8a04" strokeWidth="1.5" opacity="0.6" />
                    <rect x="230" y="80" width="18" height="3" rx="1.5" fill="#ca8a04" />

                    {/* Classic Rear Engine Vents (Decklid) */}
                    <path d="M 50 70 L 75 62" stroke="#111" strokeWidth="2.5" />
                    <path d="M 53 74 L 78 66" stroke="#111" strokeWidth="2.5" />
                    <path d="M 56 78 L 81 70" stroke="#111" strokeWidth="2.5" />

                    {/* Lower Carbon Fiber Trim & Front Lip */}
                    <path d="M 465 118 L 485 115 L 485 125 L 455 125 Z" fill="#111" />
                    <path d="M 30 115 L 45 115 L 45 125 L 25 125 Z" fill="#111" />
                    <rect x="172" y="125" width="176" height="4" fill="#111" rx="1" />

                    {/* Quad Exhaust Pipe */}
                    <rect x="15" y="115" width="20" height="7" rx="3" fill={isAccelerating ? "#fff" : "#111"} stroke="#444" strokeWidth="2" />

                    {/* The Continuous Red Taillight Bar */}
                    <path d="M 25 81 L 45 81" stroke="#ef4444" strokeWidth="4" filter="drop-shadow(0 0 8px #ef4444)" />
                    <path d="M 25 81 L 40 81" stroke="#fff" strokeWidth="1.5" />

                    {/* Oval Headlight & DRL Glow */}
                    <ellipse cx="465" cy="85" rx="7" ry="14" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" transform="rotate(-20 465 85)" />
                    <ellipse cx="465" cy="85" rx="4" ry="9" fill="#fff" filter="drop-shadow(0 0 10px #fff)" transform="rotate(-20 465 85)" />

                    {/* ---- SPINNING WHEELS ---- */}
                    {/* Big Red Brake Calipers (Static behind wheels) */}
                    <path d="M 105 125 A 20 20 0 0 1 125 105" fill="transparent" stroke="#ef4444" strokeWidth="6" />
                    <path d="M 365 125 A 20 20 0 0 1 385 105" fill="transparent" stroke="#ef4444" strokeWidth="6" />
                    <circle cx="125" cy="125" r="16" fill="#222" /> {/* Brake rotor hub */}
                    <circle cx="385" cy="125" r="16" fill="#222" />

                    {/* Rear Wheel (Wider) */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: isAccelerating ? 0.05 : 0.4, ease: "linear" }}
                        style={{ transformOrigin: '125px 125px' }}
                    >
                        <circle cx="125" cy="125" r="40" fill="transparent" stroke="#050505" strokeWidth="8" /> {/* Tire */}
                        <circle cx="125" cy="125" r="35" fill="#1a1a1a" stroke="#333" strokeWidth="1" /> {/* Rim Edge */}
                        {/* 5-Spoke Modern Alloy Design */}
                        {[0, 72, 144, 216, 288].map(deg => (
                            <path key={deg} d="M 125 125 L 120 90 L 130 90 Z" fill="#94a3b8" transform={`rotate(${deg} 125 125)`} />
                        ))}
                        <circle cx="125" cy="125" r="6" fill="#000" stroke="#eab308" strokeWidth="1" /> {/* Center lock */}
                    </motion.g>

                    {/* Front Wheel */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: isAccelerating ? 0.05 : 0.4, ease: "linear" }}
                        style={{ transformOrigin: '385px 125px' }}
                    >
                        <circle cx="385" cy="125" r="37" fill="transparent" stroke="#050505" strokeWidth="8" />
                        <circle cx="385" cy="125" r="32" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
                        {[0, 72, 144, 216, 288].map(deg => (
                            <path key={deg} d="M 385 125 L 381 94 L 389 94 Z" fill="#94a3b8" transform={`rotate(${deg} 385 125)`} />
                        ))}
                        <circle cx="385" cy="125" r="5" fill="#000" stroke="#eab308" strokeWidth="1" />
                    </motion.g>
                </svg>
            </motion.div>

            {/* 5. Speed Lines (Extreme Foreground Blur) */}
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
                {speedLines.map((line) => (
                    <motion.div
                        key={line.id}
                        className="absolute h-[3px] bg-cyan-400/60 blur-[1px] rounded-full"
                        style={{ top: line.top, width: Math.random() * 300 + 150 + 'px' }}
                        animate={{ x: ['100vw', '-50vw'] }}
                        transition={{
                            repeat: Infinity,
                            delay: line.delay,
                            duration: isAccelerating ? line.duration * 0.15 : line.duration,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* 6. Form Container Overlay */}
            <motion.div
                className="relative z-40 w-full h-full flex justify-end items-center pr-6 md:pr-24 pointer-events-auto"
                animate={{
                    opacity: isAccelerating ? 0 : 1,
                    x: isAccelerating ? 50 : 0,
                    filter: isAccelerating ? 'blur(10px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.4 }}
            >
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default DriveBackground;