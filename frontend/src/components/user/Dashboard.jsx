import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Dashboard() {
    const navigate = useNavigate();
    const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const stats = [
        { label: "RPM", value: "8,500", color: "text-red-600", bar: "85%" },
        { label: "LATENCY", value: "24ms", color: "text-cyan-500", bar: "12%" },
        { label: "CORE_TEMP", value: "72°C", color: "text-orange-500", bar: "65%" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] p-6 font-mono text-white relative z-10 overflow-hidden">
            <header className="flex justify-between items-start border-b border-red-900/30 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                        GRID<span className="text-red-600">_OS</span>
                    </h1>
                    <div className="flex gap-4 mt-1">
                        <span className="text-[10px] text-cyan-500 animate-pulse tracking-widest uppercase">● UPLINK_STABLE</span>
                        <span className="text-[10px] text-gray-500 tracking-widest">{systemTime}</span>
                    </div>
                </div>

                <button onClick={handleLogout} className="group border border-red-600/50 px-6 py-3 rounded-sm text-[10px] uppercase font-bold transition-all hover:bg-red-600/10">
                    <span className="text-gray-300 group-hover:text-red-500 transition-colors">TERMINATE_SESSION [ESC]</span>
                </button>
            </header>

            <div className="grid grid-cols-12 gap-6">
                <aside className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="bg-[#0a0a0a] border-l-2 border-red-600 p-5">
                        <h3 className="text-[10px] text-gray-500 uppercase tracking-tighter mb-4 font-bold">Live_Telemetry</h3>
                        <div className="space-y-6">
                            {stats.map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-gray-400">{stat.label}</span>
                                        <span className={stat.color}>{stat.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: stat.bar }} transition={{ duration: 1, delay: i * 0.2 }} className={`h-full ${stat.color.replace('text', 'bg')}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="col-span-12 lg:col-span-9">
                    <div className="relative bg-[#0a0a0a] border border-white/10 rounded-lg p-10 min-h-[600px]">
                        <div className="border-b border-white/5 pb-4 mb-8">
                            <h2 className="text-white text-3xl font-black uppercase italic tracking-tighter">
                                Welcome_Back <span className="text-red-600">Driver_01</span>
                            </h2>
                            <p className="text-xs text-gray-500 mt-2 font-mono">ID: {localStorage.getItem('token')?.slice(-8) || 'GUEST_MODE'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            <div className="p-8 border border-white/5 bg-white/5 rounded hover:border-red-600/50 transition-colors group cursor-pointer">
                                <h4 className="text-sm font-bold uppercase mb-2 group-hover:text-red-600">Enter Circuit</h4>
                                <p className="text-[10px] text-gray-500">Initiate global race matchmaking sequence.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;