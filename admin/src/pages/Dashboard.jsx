import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Users, Calendar, Gamepad2, Activity, Terminal, TrendingUp,
    DollarSign, Download, Trophy, BarChart3, Zap, Code2,
    Package, Star, RefreshCw, AlertCircle
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://apex-core-backend.onrender.com';


function parsePrice(str) {
    if (!str) return 0;
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
}

function fmtMoney(n) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
}

const StatCard = ({ title, value, sub, icon: Icon, accent = 'cyan', trend }) => {
    const palette = {
        cyan:    { border: 'border-cyan-900/50',   bg: 'bg-cyan-950/20',   text: 'text-cyan-400',   icon: 'text-cyan-500',   dot: 'bg-cyan-500'   },
        violet:  { border: 'border-violet-900/50', bg: 'bg-violet-950/20', text: 'text-violet-400', icon: 'text-violet-500', dot: 'bg-violet-500' },
        amber:   { border: 'border-amber-900/50',  bg: 'bg-amber-950/20',  text: 'text-amber-400',  icon: 'text-amber-500',  dot: 'bg-amber-500'  },
        green:   { border: 'border-green-900/50',  bg: 'bg-green-950/20',  text: 'text-green-400',  icon: 'text-green-500',  dot: 'bg-green-500'  },
        fuchsia: { border: 'border-fuchsia-900/50',bg: 'bg-fuchsia-950/20',text: 'text-fuchsia-400',icon: 'text-fuchsia-500',dot: 'bg-fuchsia-500'},
    }[accent];

    return (
        <div className={`bg-[#050505] border ${palette.border} p-6 relative overflow-hidden group hover:bg-[#080808] transition-colors`}>
            {/* Corner dot */}
            <div className={`absolute top-0 right-0 w-2 h-2 ${palette.dot} group-hover:animate-ping`} />
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 w-0 group-hover:w-full h-px transition-all duration-500 ${palette.dot}`} />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[9px] text-gray-500 font-black tracking-[0.3em] uppercase mb-1">{title}</p>
                    <h3 className={`text-3xl font-black italic text-white group-hover:${palette.text} transition-colors`}>{value}</h3>
                    {sub && <p className="text-[10px] text-gray-600 mt-1 font-bold">{sub}</p>}
                </div>
                <div className={`w-10 h-10 flex items-center justify-center border ${palette.border} ${palette.bg}`}>
                    <Icon className={`w-5 h-5 ${palette.icon}`} />
                </div>
            </div>

            {trend !== undefined && (
                <div className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 border ${palette.border} ${palette.bg} ${palette.text} inline-flex items-center gap-1 mt-2`}>
                    <TrendingUp className="w-3 h-3" /> {trend}
                </div>
            )}
        </div>
    );
};

/* ──────────────────────────────────────────────
   Section header
──────────────────────────────────────────────── */
const SectionHead = ({ icon: Icon, title, accent = 'text-cyan-500' }) => (
    <div className="flex items-center gap-3 mb-5 border-b border-gray-900 pb-3">
        <Icon className={`w-4 h-4 ${accent}`} />
        <span className="text-[10px] font-black tracking-[0.4em] text-white uppercase">{title}</span>
    </div>
);

/* ──────────────────────────────────────────────
   Mini bar chart (pure CSS)
──────────────────────────────────────────────── */
const MiniBar = ({ pct, color = 'bg-cyan-500' }) => (
    <div className="h-1.5 bg-gray-900 w-full">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
);

/* ──────────────────────────────────────────────
   Main Dashboard
──────────────────────────────────────────────── */
const Dashboard = () => {
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState('');
    const [lastSync,  setLastSync]  = useState(null);

    // Raw data
    const [games,   setGames]   = useState([]);
    const [events,  setEvents]  = useState([]);
    const [drivers, setDrivers] = useState([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [gRes, eRes, dRes] = await Promise.all([
                axios.get(`${API}/api/games`).catch(() => ({ data: { globalMarket: [] } })),
                axios.get(`${API}/api/events`).catch(() => ({ data: [] })),
                axios.get(`${API}/api/drivers`).catch(() => ({ data: [] })),
            ]);
            setGames(gRes.data?.globalMarket   || []);
            setEvents(Array.isArray(eRes.data) ? eRes.data : []);
            setDrivers(Array.isArray(dRes.data) ? dRes.data : []);
            setLastSync(new Date());
        } catch (e) {
            setError('Failed to fetch analytics data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ── Derived analytics ── */

    // Total downloads across all games
    const totalDownloads = games.reduce((s, g) => s + (g.downloads || 0), 0);

    // Total gross earnings = sum of (price × downloads) for each game
    const totalEarnings = games.reduce((s, g) => {
        const price = parsePrice(g.price);
        const dl    = g.downloads || 0;
        return s + price * dl;
    }, 0);

    // Total event enrollments
    const totalEnrollments = events.reduce((s, e) => s + (e.participants || e.registeredUsers?.length || 0), 0);

    // Event enrollment revenue (entry fees × participants)
    const eventRevenue = events.reduce((s, e) => {
        const fee = parsePrice(e.entryPrize);
        const cnt = e.participants || e.registeredUsers?.length || 0;
        return s + fee * cnt;
    }, 0);

    const totalRevenue = totalEarnings + eventRevenue;

    // Games by developer (group)
    const devMap = {};
    games.forEach(g => {
        const dev = g.developer?.trim() || 'Unknown';
        if (!devMap[dev]) devMap[dev] = { games: 0, downloads: 0, earnings: 0 };
        devMap[dev].games++;
        devMap[dev].downloads += g.downloads || 0;
        devMap[dev].earnings  += parsePrice(g.price) * (g.downloads || 0);
    });

    const devLeaderboard = Object.entries(devMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.earnings - a.earnings);

    const maxDevEarnings = devLeaderboard[0]?.earnings || 1;

    // Top earning games
    const topGames = [...games]
        .map(g => ({ ...g, earnings: parsePrice(g.price) * (g.downloads || 0) }))
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 6);

    const maxGameEarnings = topGames[0]?.earnings || 1;

    // Events breakdown
    const liveCount     = events.filter(e => e.status === 'LIVE').length;
    const upcomingCount = events.filter(e => e.status === 'Upcoming').length;
    const doneCount     = events.filter(e => e.status === 'Completed').length;

    // Genre breakdown
    const genreMap = {};
    games.forEach(g => {
        const genre = g.genre || 'OTHER';
        genreMap[genre] = (genreMap[genre] || 0) + 1;
    });
    const genreList = Object.entries(genreMap).sort((a, b) => b[1] - a[1]);

    /* ── Render ── */
    return (
        <div className="space-y-10 font-mono text-gray-200 uppercase">

            {/* ─── Header ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-l-4 border-cyan-600 pl-5">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2">
                        MAINFRAME_ANALYTICS
                    </h1>
                    <p className="text-[10px] text-gray-600 tracking-[0.3em] font-bold flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-cyan-500" />
                        {lastSync ? `LAST_SYNC: ${lastSync.toLocaleTimeString()}` : 'SYNCING_DATA...'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchAll}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-black tracking-widest border border-cyan-900/50 text-cyan-500 hover:bg-cyan-950/30 transition-colors disabled:opacity-40"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        REFRESH_DATA
                    </button>
                    <div className="flex items-center gap-2 border border-gray-900 bg-[#050505] px-4 py-2">
                        <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
                        <span className="text-[10px] font-black tracking-widest text-emerald-500">UPLINK_SECURED</span>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 border border-red-900/50 bg-red-950/20 p-4 text-[10px] text-red-400 font-black tracking-widest">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-36 bg-[#050505] border border-gray-900 animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && (
                <>
                    {/* ─── TOP KPI ROW ─── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            title="Total Revenue"
                            value={fmtMoney(totalRevenue)}
                            sub={`Games: ${fmtMoney(totalEarnings)} + Events: ${fmtMoney(eventRevenue)}`}
                            icon={DollarSign}
                            accent="cyan"
                            trend="LIVE METRIC"
                        />
                        <StatCard
                            title="Total Downloads"
                            value={totalDownloads.toLocaleString()}
                            sub={`Across ${games.length} published games`}
                            icon={Download}
                            accent="violet"
                            trend={`${games.filter(g => (g.downloads||0) > 0).length} active titles`}
                        />
                        <StatCard
                            title="Event Enrollments"
                            value={totalEnrollments.toLocaleString()}
                            sub={`Across ${events.length} events`}
                            icon={Trophy}
                            accent="amber"
                            trend={`${liveCount} LIVE · ${upcomingCount} UPCOMING`}
                        />
                        <StatCard
                            title="Registered Pilots"
                            value={drivers.length.toLocaleString()}
                            sub="Driver roster size"
                            icon={Users}
                            accent="green"
                            trend="GLOBAL REGISTRY"
                        />
                    </div>

                    {/* ─── SECONDARY KPIs ─── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            title="Published Games"
                            value={games.length}
                            sub="In global market"
                            icon={Gamepad2}
                            accent="cyan"
                        />
                        <StatCard
                            title="Avg. Game Price"
                            value={games.length ? fmtMoney(games.reduce((s, g) => s + parsePrice(g.price), 0) / games.length) : '$0'}
                            sub="Mean acquisition cost"
                            icon={BarChart3}
                            accent="fuchsia"
                        />
                        <StatCard
                            title="Completed Events"
                            value={doneCount}
                            sub={`${liveCount} live · ${upcomingCount} upcoming`}
                            icon={Calendar}
                            accent="amber"
                        />
                        <StatCard
                            title="Dev Studios"
                            value={Object.keys(devMap).length}
                            sub="Unique developers"
                            icon={Code2}
                            accent="green"
                        />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2 bg-[#050505] border border-gray-800 p-6">
                            <SectionHead icon={Code2} title="Earnings by Developer" accent="text-cyan-400" />
                            {devLeaderboard.length === 0 ? (
                                <p className="text-[10px] text-gray-600 tracking-widest py-8 text-center">
                                    NO_DEVELOPER_DATA — Add developers to games in Games Management
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {devLeaderboard.map((dev, i) => (
                                        <div key={dev.name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black w-5 text-center ${i === 0 ? 'text-amber-400' : 'text-gray-600'}`}>
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-[11px] font-black text-white tracking-widest truncate max-w-[140px]">
                                                        {dev.name}
                                                    </span>
                                                    <span className="text-[9px] text-gray-600 font-bold">
                                                        {dev.games} game{dev.games !== 1 ? 's' : ''} · {dev.downloads.toLocaleString()} dl
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-black text-cyan-400 shrink-0">
                                                    {fmtMoney(dev.earnings)}
                                                </span>
                                            </div>
                                            <MiniBar pct={(dev.earnings / maxDevEarnings) * 100} color="bg-cyan-600" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-[#050505] border border-gray-800 p-6">
                            <SectionHead icon={Calendar} title="Events Breakdown" accent="text-amber-400" />
                            <div className="space-y-3 mb-6">
                                {[
                                    { label: 'LIVE',      count: liveCount,     color: 'bg-cyan-500',    text: 'text-cyan-400' },
                                    { label: 'UPCOMING',  count: upcomingCount, color: 'bg-amber-500',   text: 'text-amber-400' },
                                    { label: 'COMPLETED', count: doneCount,     color: 'bg-gray-600',    text: 'text-gray-400' },
                                    { label: 'TOTAL',     count: events.length, color: 'bg-violet-500',  text: 'text-violet-400' },
                                ].map(b => (
                                    <div key={b.label} className="flex items-center justify-between border border-gray-900 bg-black px-4 py-3">
                                        <span className={`text-[9px] font-black tracking-widest ${b.text}`}>{b.label}</span>
                                        <span className="text-xl font-black text-white">{b.count}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-800 pt-4">
                                <p className="text-[9px] text-gray-600 font-black tracking-widest mb-3">TOTAL ENROLLMENTS BY EVENT</p>
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {[...events]
                                        .sort((a, b) => (b.participants || 0) - (a.participants || 0))
                                        .map((ev, i) => {
                                            const cnt = ev.participants || ev.registeredUsers?.length || 0;
                                            const maxCnt = events.reduce((m, e) => Math.max(m, e.participants || 0), 1);
                                            return (
                                                <div key={ev._id || i}>
                                                    <div className="flex justify-between mb-0.5">
                                                        <span className="text-[9px] text-gray-400 truncate max-w-[130px] font-bold">{ev.target?.replace(/_/g, ' ')}</span>
                                                        <span className="text-[9px] text-amber-400 font-black">{cnt}</span>
                                                    </div>
                                                    <MiniBar pct={(cnt / maxCnt) * 100} color="bg-amber-600" />
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2 bg-[#050505] border border-gray-800 p-6">
                            <SectionHead icon={Star} title="Top Earning Game Titles" accent="text-fuchsia-400" />
                            {topGames.length === 0 ? (
                                <p className="text-[10px] text-gray-600 tracking-widest py-8 text-center">NO_GAME_DATA</p>
                            ) : (
                                <div className="space-y-3">
                                    {topGames.map((g, i) => (
                                        <div key={g.id || i} className="flex items-center gap-4 border border-gray-900 bg-black p-3 group hover:border-fuchsia-900/40 transition-colors">
                                            <span className={`text-[10px] font-black w-6 text-center shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-700'}`}>
                                                {i + 1}
                                            </span>

                                            <div className="w-10 h-10 bg-gray-900 border border-gray-800 shrink-0 overflow-hidden">
                                                {g.image
                                                    ? <img src={g.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                    : <span className="w-full h-full flex items-center justify-center text-gray-700"><Gamepad2 className="w-4 h-4" /></span>
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-white truncate">{g.title}</p>
                                                <p className="text-[9px] text-gray-600 font-bold">{g.developer || 'Unknown Dev'} · {g.downloads || 0} downloads · {g.price}</p>
                                                <MiniBar pct={(g.earnings / maxGameEarnings) * 100} color="bg-fuchsia-600" />
                                            </div>

                                            <span className="text-[12px] font-black text-fuchsia-400 shrink-0">{fmtMoney(g.earnings)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#050505] border border-gray-800 p-6">
                                <SectionHead icon={Package} title="Games by Genre" accent="text-violet-400" />
                                {genreList.length === 0 ? (
                                    <p className="text-[10px] text-gray-600 tracking-widest text-center py-4">NO_DATA</p>
                                ) : (
                                    <div className="space-y-3">
                                        {genreList.map(([genre, count]) => (
                                            <div key={genre}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[9px] font-black text-gray-400 tracking-widest">{genre.replace(/_/g, ' ')}</span>
                                                    <span className="text-[9px] font-black text-violet-400">{count}</span>
                                                </div>
                                                <MiniBar pct={(count / games.length) * 100} color="bg-violet-600" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-[#050505] border border-gray-800 p-6">
                                <SectionHead icon={Activity} title="System Status" accent="text-green-400" />
                                <div className="space-y-3">
                                    {[
                                        { label: 'API STATUS',      value: 'ONLINE',   ok: true },
                                        { label: 'DB CONNECTION',   value: 'ACTIVE',   ok: true },
                                        { label: 'GAME REGISTRY',   value: `${games.length} ASSETS`,  ok: true },
                                        { label: 'EVENT PIPELINE',  value: `${events.length} EVENTS`, ok: events.length > 0 },
                                        { label: 'DRIVER ROSTER',   value: `${drivers.length} PILOTS`,ok: drivers.length > 0 },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-center justify-between border-b border-gray-900 pb-2">
                                            <span className="text-[9px] text-gray-600 font-black tracking-widest">{s.label}</span>
                                            <span className={`text-[9px] font-black tracking-widest ${s.ok ? 'text-green-400' : 'text-amber-400'}`}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#050505] border border-gray-800 p-6">
                        <SectionHead icon={Zap} title="Live Event Enrollments — Detail" accent="text-amber-400" />
                        {events.length === 0 ? (
                            <p className="text-[10px] text-gray-600 tracking-widest text-center py-8">NO_EVENTS_IN_DATABASE</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-[9px] font-bold tracking-widest">
                                    <thead>
                                        <tr className="border-b border-gray-800">
                                            {['Event', 'Type', 'Status', 'Region', 'Entry Fee', 'Enrolled', 'Est. Revenue', 'Organizer'].map(h => (
                                                <th key={h} className="text-left text-gray-600 py-2 pr-6 font-black uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-900">
                                        {events.map((ev, i) => {
                                            const cnt = ev.participants || ev.registeredUsers?.length || 0;
                                            const rev = parsePrice(ev.entryPrize) * cnt;
                                            return (
                                                <tr key={ev._id || i} className="hover:bg-black transition-colors group">
                                                    <td className="py-3 pr-6">
                                                        <span className="text-white font-black truncate max-w-[160px] block">{ev.target?.replace(/_/g, ' ')}</span>
                                                    </td>
                                                    <td className="pr-6">
                                                        <span className="text-violet-400">{ev.eventType || 'Online'}</span>
                                                    </td>
                                                    <td className="pr-6">
                                                        <span className={ev.status === 'LIVE' ? 'text-cyan-400' : ev.status === 'Completed' ? 'text-gray-500' : 'text-amber-400'}>
                                                            {ev.status}
                                                        </span>
                                                    </td>
                                                    <td className="pr-6 text-gray-500">{ev.region || 'GLOBAL'}</td>
                                                    <td className="pr-6 text-green-400">{ev.entryPrize || 'Free'}</td>
                                                    <td className="pr-6">
                                                        <span className="text-amber-400 font-black">{cnt.toLocaleString()}</span>
                                                    </td>
                                                    <td className="pr-6">
                                                        <span className="text-fuchsia-400">{rev > 0 ? fmtMoney(rev) : '—'}</span>
                                                    </td>
                                                    <td className="text-gray-600">{ev.organizerName || '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-gray-800">
                                            <td colSpan={5} className="pt-3 text-[8px] text-gray-600 font-black tracking-widest">TOTAL</td>
                                            <td className="pt-3 text-amber-400 font-black">{totalEnrollments.toLocaleString()}</td>
                                            <td className="pt-3 text-fuchsia-400 font-black">{fmtMoney(eventRevenue)}</td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
