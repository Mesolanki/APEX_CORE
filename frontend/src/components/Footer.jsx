import React from 'react';
import { FiCrosshair, FiRadio } from 'react-icons/fi';

function Footer() {
    return (
        <footer className="bg-[#020202] border-t-2 border-cyan-900 font-mono text-cyan-400 relative z-10 pt-16 pb-8 overflow-hidden">

            {/* SUBTLE GLOW EFFECT AT THE TOP OF THE FOOTER */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-600/80 to-transparent"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[30px] bg-cyan-600/10 blur-xl"></div>
            
            <div className="scanlines pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* BRANDING & STATUS */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-cyan-600 mb-2">
                            <FiCrosshair className="animate-spin-slow" />
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase">Global_Comm_Network</span>
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                            PILOT<span className="text-cyan-600">_SYNDICATE</span>
                        </h2>
                        <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest leading-relaxed max-w-xs border-l-2 border-cyan-900/50 pl-3 py-1">
                            Unrestricted telemetry. Decentralized racing matrix. Override the system.
                        </p>
                        <div className="inline-flex items-center gap-2 border border-cyan-900/50 bg-cyan-950/20 px-3 py-1.5 mt-2">
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-none animate-ping"></span>
                            <span className="text-[9px] text-cyan-500 uppercase tracking-[0.3em] font-black">UPLINK: SECURED</span>
                        </div>
                    </div>

                    {/* DIRECTORIES */}
                    <div>
                        <h3 className="text-[10px] text-cyan-600 font-black flex items-center gap-2 uppercase tracking-[0.3em] mb-6">
                            <FiRadio /> Directories
                        </h3>
                        <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
                            <li className="interactive hover:text-white transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                                ALL_CHASSIS
                            </li>
                            <li className="interactive hover:text-white transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                                TOP_OPERATIVES
                            </li>
                            <li className="interactive hover:text-white transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                                NEW_SCHEMATICS
                            </li>
                            <li className="interactive hover:text-white transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                                UPCOMING_DROPS
                            </li>
                        </ul>
                    </div>

                    {/* SUPPORT & PROTOCOLS */}
                    <div>
                        <h3 className="text-[10px] text-cyan-600 font-black flex items-center gap-2 uppercase tracking-[0.3em] mb-6">
                            <FiRadio /> Protocols
                        </h3>
                        <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
                            <li className="interactive hover:text-white transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                                PILOT_SUPPORT
                            </li>
                            <li className="interactive hover:text-white transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                                REFUND_PROTOCOL
                            </li>
                            <li className="interactive hover:text-white transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                                END_USER_DIRECTIVE
                            </li>
                            <li className="interactive hover:text-white transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                                PRIVACY_OVERRIDE
                            </li>
                        </ul>
                    </div>

                    {/* COMMS CHANNELS */}
                    <div>
                        <h3 className="text-[10px] text-cyan-600 font-black flex items-center gap-2 uppercase tracking-[0.3em] mb-6">
                            <FiRadio /> Comms_Link
                        </h3>
                        <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
                             <li className="interactive hover:text-cyan-400 transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-900 group-hover:text-cyan-500 transition-colors">[*]</span>
                                DISCORD_NODE
                            </li>
                            <li className="interactive hover:text-cyan-400 transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-900 group-hover:text-cyan-500 transition-colors">[*]</span>
                                X_FREQUENCY
                            </li>
                            <li className="interactive hover:text-cyan-400 transition-colors cursor-none group flex items-center gap-2">
                                <span className="text-cyan-900 group-hover:text-cyan-500 transition-colors">[*]</span>
                                GITHUB_REPO
                            </li>
                        </ul>
                    </div>

                </div>

                {/* BOTTOM SYSTEM BAR */}
                 <div className="pt-8 border-t border-cyan-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[9px] text-gray-600 uppercase tracking-[0.4em] font-black">
                        © 2026 PILOT_SYNDICATE. ALL SYSTEM RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-4 text-[9px] text-gray-600 border border-cyan-900 bg-black px-4 py-2 uppercase tracking-[0.3em] font-black shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                        <span className="text-cyan-500">SYS_VER: 5.0.1</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span>ENCRYPTION: AES-256</span>
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scanlines {
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                }
            `}} />
        </footer>
    );
}

export default Footer;