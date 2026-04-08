import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiLogOut, FiMenu, FiX, FiZap } from 'react-icons/fi';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQ, setSearchQ] = useState('');

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(!!localStorage.getItem('token'));
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (location.pathname === '/community') {
            const q = new URLSearchParams(location.search).get('q') || '';
            setSearchQ(q);
        }
    }, [location.pathname, location.search]);

    const submitCommunitySearch = () => {
        const q = searchQ.trim();
        if (!q) {
            navigate('/community');
            return;
        }
        navigate(`/community?q=${encodeURIComponent(q)}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navLinkActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(`${path}/`);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Events', path: '/live-events' },
        { label: 'Top Players', path: '/top-players' },
        { label: 'Library', path: '/library' },
        { label: 'Community', path: '/community' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 w-full z-[100] font-mono transition-all duration-500 ${
                isScrolled || isMobileMenuOpen
                    ? 'py-3 bg-[#020202]/95 backdrop-blur-md border-b border-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
                    : 'py-5 bg-transparent border-b border-transparent'
            }`}
        >
            <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-8 lg:gap-12 min-w-0">
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="relative">
                            <div className="w-10 h-10 bg-cyan-500 flex items-center justify-center border border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-shadow">
                                <FiZap className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tighter italic uppercase leading-none">
                            APEX_<span className="text-cyan-500">CORE</span>
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-2">
                        {navLinks.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.15em] transition-colors ${
                                    navLinkActive(item.path)
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {item.label}
                                {navLinkActive(item.path) && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(0,242,255,0.8)]"
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center bg-[#0a0a0a] border border-gray-800 px-4 py-2.5 focus-within:border-cyan-600/50 transition-colors w-64 lg:w-80 group">
                        <FiSearch className="text-gray-600" />
                        <input
                            type="search"
                            placeholder="SEARCH TERMINAL..."
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submitCommunitySearch()}
                            className="bg-transparent border-none outline-none text-[10px] uppercase font-bold tracking-widest text-white ml-3 w-full placeholder:text-gray-700"
                        />
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-gray-800" />

                    <div className="hidden lg:flex items-center gap-3">
                        <button
                            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                            className="flex items-center gap-2 pl-1 pr-4 py-1.5 bg-[#0a0a0a] border border-gray-800 hover:border-cyan-600/50 transition-colors group"
                            aria-label="Profile"
                        >
                            <div className={`w-6 h-6 border flex items-center justify-center transition-colors ${
                                isAuthenticated 
                                    ? 'bg-cyan-600/20 border-cyan-600/50 text-cyan-500 group-hover:bg-cyan-600 group-hover:text-white' 
                                    : 'bg-gray-900 border-gray-800 text-gray-600 group-hover:border-cyan-500/30'
                            }`}>
                                <FiUser size={12} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest hidden md:inline group-hover:text-white transition-colors">
                                {isAuthenticated ? 'Profile' : 'Access'}
                            </span>
                        </button>

                        {isAuthenticated ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-cyan-600 transition-colors p-2 border border-transparent hover:border-cyan-900/50 bg-[#0a0a0a]"
                                aria-label="Logout"
                            >
                                <FiLogOut size={14} />
                            </button>
                        ) : (
                            <Link
                                to="/signup"
                                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500 transition-colors flex items-center gap-2 relative overflow-hidden group"
                            >
                                <span className="relative z-10">INITIATE</span>
                                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out mix-blend-difference" />
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        className="lg:hidden text-gray-400 hover:text-cyan-500 p-2 border border-gray-900 bg-[#0a0a0a] transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-black border-b border-gray-900 overflow-hidden"
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            <div className="flex md:hidden items-center bg-[#0a0a0a] border border-gray-800 px-3 py-3 focus-within:border-cyan-600/50 transition-colors">
                                <FiSearch className="text-gray-600 shrink-0" />
                                <input
                                    type="search"
                                    placeholder="SEARCH DB..."
                                    value={searchQ}
                                    onChange={(e) => setSearchQ(e.target.value)}
                                    className="bg-transparent border-none outline-none text-[10px] uppercase font-bold tracking-widest text-white ml-3 w-full placeholder:text-gray-700"
                                />
                            </div>

                            <div className="flex flex-col gap-2 mt-4">
                                {navLinks.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`text-xs font-black uppercase tracking-[0.2em] py-3 border-l-2 pl-4 transition-colors ${
                                            navLinkActive(item.path) ? 'text-white border-cyan-600 bg-cyan-600/5' : 'text-gray-600 border-transparent hover:text-gray-300 hover:border-gray-700'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <button 
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        navigate(isAuthenticated ? '/profile' : '/login');
                                    }}
                                    className="text-xs font-black uppercase tracking-[0.2em] py-3 border-l-2 pl-4 text-cyan-600 border-transparent hover:text-cyan-400 text-left"
                                >
                                    User_Profile
                                </button>
                            </div>

                            <hr className="border-gray-900 my-4" />

                            <div className="flex flex-col gap-3">
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/profile" className="interactive-card text-xs font-black text-white bg-cyan-900/10 border border-cyan-800 uppercase tracking-[0.2em] text-center py-4">
                                            User_Dashboard
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="text-[10px] font-black text-red-600 hover:text-red-400 uppercase tracking-widest text-center py-2"
                                        >
                                            Terminate_Link
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-4 mt-2">
                                        <Link to="/login" className="interactive-card text-xs font-black text-gray-200 hover:text-white uppercase tracking-[0.2em] text-center border border-gray-800 bg-[#0a0a0a] py-4 transition-colors">
                                            SECURE_LOGIN
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="interactive-card text-center py-4 bg-cyan-600 text-white text-xs font-black uppercase tracking-[0.2em] border border-cyan-500 hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                        >
                                            INITIATE_SESSION
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

export default Navbar;