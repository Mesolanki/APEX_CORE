import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Gamepad2, LayoutDashboard, Calendar, Users, LogOut, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DashboardLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'DASHBOARD', icon: LayoutDashboard },
        { path: '/games', label: 'ASSET_CDB', icon: Gamepad2 },
        { path: '/events', label: 'LIVE_CIRCUITS', icon: Calendar },
        { path: '/drivers', label: 'TOP_PLAYERS', icon: Users },
    ];

    return (
        <div className="min-h-screen flex bg-[#020202] text-gray-100 font-mono selection:bg-red-600 selection:text-white uppercase">
            {/* CRT Scanline overlay effect */}
            <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />

            {/* Sidebar */}
            <aside className="w-64 bg-[#050505] border-r border-gray-900 flex flex-col flex-shrink-0 relative z-40">
                <div className="p-6 flex flex-col items-start gap-4 border-b border-gray-900 pb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black border border-red-900 flex items-center justify-center relative overflow-hidden group hover:border-red-500 transition-colors">
                            <Gamepad2 className="w-5 h-5 text-red-600 group-hover:text-red-500 group-hover:animate-pulse" />
                            <div className="absolute inset-0 bg-red-600/10 group-hover:bg-red-600/20" />
                        </div>
                        <div>
                            <span className="text-xl font-black italic tracking-widest text-white">GRID_OS</span>
                            <p className="text-[8px] text-gray-500 tracking-[0.4em] flex items-center gap-1 mt-1">
                                <Terminal className="w-3 h-3 text-red-500" /> ADMIN_TERMINAL
                            </p>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 mt-8 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-4 px-4 py-4 border transition-all duration-200 group text-xs font-black tracking-widest",
                                    isActive 
                                        ? "bg-red-900/10 border-red-900/50 text-red-500" 
                                        : "border-transparent text-gray-500 hover:border-gray-800 hover:bg-black hover:text-white"
                                )
                            }
                        >
                            <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-900">
                    <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-4 text-[10px] font-black tracking-widest text-gray-600 border border-transparent hover:border-red-900/50 hover:text-red-500 hover:bg-red-900/10 transition-all uppercase"
                    >
                        <LogOut className="w-4 h-4" />
                        TERMINATE_LINK
                    </button>
                    
                    <div className="mt-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-[8px] text-gray-600 tracking-widest uppercase">SECURE CONNECTION</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0a0a0a] via-[#020202] to-black">
                 {/* Top Glow */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-red-900/10 blur-[100px] pointer-events-none rounded-full" />
                
                <div className="flex-1 overflow-auto p-6 md:p-10 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
