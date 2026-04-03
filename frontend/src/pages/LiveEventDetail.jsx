import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import {
    FiArrowLeft, FiFlag, FiUsers, FiMapPin, FiAward, FiImage, FiX,
    FiShield, FiCalendar, FiGlobe, FiMail, FiPhone, FiExternalLink,
    FiStar, FiSend, FiZap, FiClock, FiMaximize2, FiInfo, FiGrid
} from 'react-icons/fi';
import CyberText from '../components/CyberText';

/* ────────────────────────────────────────
   Star Rating helper
──────────────────────────────────────── */
function StarRating({ value = 0, max = 5, onChange }) {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => onChange && setHovered(star)}
                    onMouseLeave={() => onChange && setHovered(0)}
                    onClick={() => onChange && onChange(star)}
                    className={`text-xl transition-colors ${
                        star <= display
                            ? 'text-amber-400'
                            : 'text-gray-700'
                    } ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

/* ────────────────────────────────────────
   Detail badge
──────────────────────────────────────── */
function DetailBadge({ icon: Icon, label, value, accent = 'cyan' }) {
    const colors = {
        cyan:   'border-cyan-900/40 bg-cyan-950/20 text-cyan-400',
        violet: 'border-violet-900/40 bg-violet-950/20 text-violet-400',
        amber:  'border-amber-900/40 bg-amber-950/20 text-amber-400',
        green:  'border-green-900/40 bg-green-950/20 text-green-400',
        fuchsia:'border-fuchsia-900/40 bg-fuchsia-950/20 text-fuchsia-400',
    };
    return (
        <div className={`border ${colors[accent]} p-4 flex items-start gap-3 backdrop-blur-sm`}>
            <Icon className="mt-0.5 shrink-0 text-lg" />
            <div className="min-w-0">
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold mb-1">{label}</p>
                <p className="text-sm font-black text-white break-words">{value || '—'}</p>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────
   Main component
──────────────────────────────────────── */
export default function LiveEventDetail() {
    const { eventId } = useParams();
    const navigate    = useNavigate();

    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [err,        setErr]        = useState('');
    const [lightbox,   setLightbox]   = useState(null);
    const [activeTab,  setActiveTab]  = useState('details'); // details | photos | reviews

    // Review form
    const [reviewForm, setReviewForm] = useState({ username: '', rating: 0, comment: '' });
    const [reviewStatus, setReviewStatus] = useState('idle'); // idle | loading | success | error
    const [reviewMsg, setReviewMsg]       = useState('');

    /* Fetch */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setErr('');
            try {
                const isMongoId = eventId?.length === 24 && /^[0-9a-fA-F]{24}$/.test(eventId);
                let res;
                if (isMongoId) {
                    res = await api.get(`/api/events/${eventId}`);
                    if (!cancelled) setData({ item: res.data });
                } else {
                    const idx = parseInt(eventId, 10);
                    if (!eventId || Number.isNaN(idx) || idx < 0) {
                        if (!cancelled) { setErr('Invalid event link'); setLoading(false); }
                        return;
                    }
                    res = await api.get(`/api/games/live-event/${idx}`);
                    if (!cancelled) setData(res.data);
                }
            } catch (e) {
                if (!cancelled) setErr(e.response?.data?.message || 'Event not found');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [eventId]);

    const ev           = data?.item;
    const heroImage    = ev?.coverImage || (ev?.photos?.[0]) || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1600';
    const photos       = ev?.photos?.length ? ev.photos : (ev?.coverImage ? [ev.coverImage] : []);
    const participants = ev?.registeredUsers || [];
    const reviews      = ev?.reviews         || [];

    /* Submit review */
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewForm.username || !reviewForm.rating) {
            setReviewMsg('Please enter your name and a star rating.');
            setReviewStatus('error');
            return;
        }
        setReviewStatus('loading');
        try {
            await api.post(`/api/events/${eventId}/reviews`, reviewForm);
            // Re-fetch to get updated reviews
            const res = await api.get(`/api/events/${eventId}`);
            setData({ item: res.data });
            setReviewForm({ username: '', rating: 0, comment: '' });
            setReviewStatus('success');
            setReviewMsg('Review submitted successfully!');
            setTimeout(() => { setReviewMsg(''); setReviewStatus('idle'); }, 3000);
        } catch (e) {
            setReviewStatus('error');
            setReviewMsg(e.response?.data?.message || 'Failed to submit review.');
        }
    };

    const tabs = [
        { id: 'details', label: 'Event Details', icon: FiInfo },
        { id: 'photos',  label: `Photos (${photos.length})`, icon: FiGrid },
        { id: 'reviews', label: `Reviews (${reviews.length})`, icon: FiStar },
    ];

    /* ── Render ── */
    return (
        <div className="min-h-screen bg-[#030303] text-white font-mono pt-24 pb-32 px-4 sm:px-6">
            {/* Background glow blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
                <div className="absolute -top-32 right-0 w-[70vw] h-[70vw] bg-cyan-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-violet-600/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative max-w-6xl mx-auto z-10">
                {/* Back button */}
                <button
                    type="button"
                    onClick={() => navigate('/live-events')}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-cyan-400 mb-8 transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> All events
                </button>

                {/* Loading */}
                {loading && (
                    <div className="py-40 text-center text-cyan-500 text-xs uppercase tracking-[0.4em] animate-pulse">
                        <CyberText text="Loading broadcast…" />
                    </div>
                )}

                {/* Error */}
                {err && !loading && (
                    <div className="border border-cyan-900 bg-cyan-950/30 p-10 text-center text-cyan-400">
                        {err}
                        <Link to="/live-events" className="block mt-4 text-[10px] uppercase tracking-widest text-gray-500 hover:text-white">
                            Back to grid
                        </Link>
                    </div>
                )}

                {!loading && ev && (
                    <>
                        {/* ═══════════════ HERO HEADER ═══════════════ */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative mb-10 border border-cyan-900/30 overflow-hidden"
                        >
                            {/* Hero background image */}
                            <div className="relative h-64 sm:h-80">
                                <img
                                    src={heroImage}
                                    alt=""
                                    className="w-full h-full object-cover opacity-30"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/70 to-[#030303]/10" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/80 via-transparent to-[#030303]/80" />

                                {/* Scanline overlay */}
                                <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
                            </div>

                            {/* Hero content overlay */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                                        ev.status === 'LIVE'
                                            ? 'border-cyan-500 text-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,242,255,0.3)] animate-pulse'
                                            : ev.status === 'Completed'
                                            ? 'border-gray-600 text-gray-400 bg-gray-950/60'
                                            : 'border-amber-500/60 text-amber-400 bg-amber-950/40'
                                    }`}>
                                        {ev.status}
                                    </span>
                                    <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-gray-700/50 text-gray-400 bg-black/40">
                                        {ev.eventType || 'Online'}
                                    </span>
                                    {ev.class && ev.class !== 'UNCLASSIFIED' && (
                                        <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-fuchsia-800/50 text-fuchsia-400 bg-fuchsia-950/30">
                                            {ev.class}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-none mb-3 drop-shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                                    <CyberText text={ev.target?.replace(/_/g, ' ') || 'EVENT'} />
                                </h1>

                                {ev.description && (
                                    <p className="text-gray-400 text-sm max-w-2xl leading-relaxed border-l-4 border-cyan-600 pl-4 mb-4">
                                        {ev.description}
                                    </p>
                                )}

                                {/* Average rating */}
                                {ev.avgRating > 0 && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <StarRating value={ev.avgRating} />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {ev.avgRating} / 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Enroll button — top right */}
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => navigate(`/event-enroll/${eventId}`)}
                                    className="bg-cyan-600 hover:bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] px-6 py-3 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]"
                                >
                                    Enroll Now
                                </button>
                            </div>
                        </motion.div>

                        {/* ═══════════════ TABS ═══════════════ */}
                        <div className="flex border-b border-gray-800/60 mb-8 overflow-x-auto">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-colors whitespace-nowrap ${
                                        activeTab === id
                                            ? 'border-cyan-500 text-cyan-400'
                                            : 'border-transparent text-gray-600 hover:text-gray-300'
                                    }`}
                                >
                                    <Icon className="text-sm" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* ═══════════════ TAB: DETAILS ═══════════════ */}
                        {activeTab === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid lg:grid-cols-3 gap-8"
                            >
                                {/* Left: Event info + Participants */}
                                <div className="lg:col-span-2 space-y-8">

                                    {/* Quick stats grid */}
                                    <div>
                                        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                            <FiZap className="text-cyan-500" /> Event Specifications
                                        </h2>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <DetailBadge icon={FiCalendar} label="Start Date"
                                                value={ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                                accent="cyan"
                                            />
                                            <DetailBadge icon={FiCalendar} label="End Date"
                                                value={ev.endDate ? new Date(ev.endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                                accent="cyan"
                                            />
                                            <DetailBadge icon={FiMapPin} label="Region / Venue"
                                                value={ev.venue ? `${ev.region} · ${ev.venue}` : ev.region}
                                                accent="violet"
                                            />
                                            <DetailBadge icon={FiClock} label="Type"
                                                value={ev.eventType}
                                                accent="violet"
                                            />
                                            <DetailBadge icon={FiFlag}  label="Class / Tier"
                                                value={ev.class?.replace(/_/g, ' ')}
                                                accent="fuchsia"
                                            />
                                            <DetailBadge icon={FiUsers} label="Slots"
                                                value={ev.maxParticipants
                                                    ? `${ev.participants} / ${ev.maxParticipants} enrolled`
                                                    : `${ev.participants || 0} enrolled`}
                                                accent="green"
                                            />
                                            <DetailBadge icon={FiAward} label="Entry Fee"
                                                value={ev.entryPrize || 'Free'}
                                                accent="amber"
                                            />
                                            <DetailBadge icon={FiAward} label="Prize Pool"
                                                value={ev.prizePool || ev.winningPrize || 'TBD'}
                                                accent="amber"
                                            />
                                        </div>
                                    </div>

                                    {/* Participants */}
                                    <div>
                                        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 border-b border-gray-800/60 pb-3">
                                            <FiShield className="text-green-500" /> Registered Pilots ({participants.length})
                                        </h2>
                                        {participants.length === 0 ? (
                                            <p className="text-xs text-gray-600 uppercase tracking-widest py-8 border border-dashed border-gray-800 text-center bg-[#050505]/50">
                                                No pilots registered yet.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {participants.map((p, i) => (
                                                    <div key={i} className="bg-[#050505] border border-gray-900 border-l-2 border-l-cyan-600 p-3 group hover:bg-[#0a0a0a] transition-colors">
                                                        <p className="text-xs font-black text-white italic tracking-widest mb-0.5">{p.alias}</p>
                                                        <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase">{p.team || 'Independent'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Podium */}
                                    {(ev.winner || ev.winnerAlias) && (
                                        <div className="border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-black p-6">
                                            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400 mb-4 flex items-center gap-2">
                                                <FiAward /> Podium Results
                                            </h2>
                                            <div className="space-y-4">
                                                <div>
                                                    <span className="text-[9px] text-gray-600 uppercase tracking-widest block mb-1">🥇 Winner</span>
                                                    <p className="text-xl font-black uppercase text-white">{ev.winnerAlias || ev.winner}</p>
                                                    {ev.winnerTime && ev.winnerTime !== '—' && (
                                                        <p className="text-cyan-400 font-mono text-sm mt-1">{ev.winnerTime}</p>
                                                    )}
                                                </div>
                                                {ev.runnerUp && ev.runnerUp !== '—' && (
                                                    <div className="pt-4 border-t border-gray-800">
                                                        <span className="text-[9px] text-gray-600 uppercase tracking-widest block mb-1">🥈 Runner Up</span>
                                                        <p className="text-gray-300 font-bold uppercase">{ev.runnerUp}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Organizer card */}
                                <div className="space-y-6">
                                    <div className="border border-violet-900/40 bg-gradient-to-br from-violet-950/30 to-black p-6 sticky top-28">
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-violet-400 mb-5 flex items-center gap-2 border-b border-violet-900/30 pb-3">
                                            <FiInfo /> Organized By
                                        </h2>

                                        {/* Logo */}
                                        {ev.organizerLogo ? (
                                            <div className="mb-4 border border-gray-800 bg-black p-3 flex items-center justify-center h-20">
                                                <img
                                                    src={ev.organizerLogo}
                                                    alt={ev.organizerName}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="mb-4 border border-gray-800 bg-[#0a0a0a] h-20 flex items-center justify-center">
                                                <span className="text-[10px] text-gray-700 uppercase tracking-widest">No logo</span>
                                            </div>
                                        )}

                                        <p className="text-xl font-black italic uppercase text-white tracking-tight mb-1">
                                            {ev.organizerName || 'Unknown Organizer'}
                                        </p>

                                        {/* Contact details */}
                                        <div className="mt-4 space-y-2">
                                            {ev.organizerEmail && (
                                                <a href={`mailto:${ev.organizerEmail}`}
                                                    className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-widest font-bold">
                                                    <FiMail className="shrink-0" />
                                                    <span className="truncate">{ev.organizerEmail}</span>
                                                </a>
                                            )}
                                            {ev.organizerPhone && (
                                                <a href={`tel:${ev.organizerPhone}`}
                                                    className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-widest font-bold">
                                                    <FiPhone className="shrink-0" />
                                                    {ev.organizerPhone}
                                                </a>
                                            )}
                                            {ev.organizerWebsite && (
                                                <a href={ev.organizerWebsite}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[10px] text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest font-black border border-violet-900/40 px-3 py-2 mt-3 hover:bg-violet-950/30">
                                                    <FiExternalLink /> Visit Website
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══════════════ TAB: PHOTOS ═══════════════ */}
                        {activeTab === 'photos' && (
                            <motion.div
                                key="photos"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                    <FiImage className="text-fuchsia-400" /> Event Gallery
                                </h2>

                                {photos.length === 0 ? (
                                    <div className="py-32 border border-dashed border-gray-800 text-center bg-[#050505]/50">
                                        <FiImage className="mx-auto text-3xl text-gray-700 mb-3" />
                                        <p className="text-xs text-gray-600 uppercase tracking-widest">
                                            No photos uploaded for this event.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {photos.map((src, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setLightbox(i)}
                                                className="relative aspect-video overflow-hidden border border-gray-800 hover:border-fuchsia-500/60 transition-all group bg-[#0a0a0a]"
                                            >
                                                <img
                                                    src={src}
                                                    alt={`Event photo ${i + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                    <FiMaximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg text-xl" />
                                                </div>
                                                <span className="absolute bottom-2 right-2 text-[8px] font-black text-white/70 bg-black/60 px-1.5 py-0.5">
                                                    {i + 1} / {photos.length}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ═══════════════ TAB: REVIEWS ═══════════════ */}
                        {activeTab === 'reviews' && (
                            <motion.div
                                key="reviews"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid lg:grid-cols-3 gap-8"
                            >
                                {/* Review list */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                        <FiStar className="text-amber-400" /> Community Reviews
                                        {ev.avgRating > 0 && (
                                            <span className="ml-2 text-amber-400 font-black">{ev.avgRating} / 5</span>
                                        )}
                                    </h2>

                                    {reviews.length === 0 ? (
                                        <div className="py-16 border border-dashed border-gray-800 text-center bg-[#050505]/50">
                                            <FiStar className="mx-auto text-2xl text-gray-700 mb-3" />
                                            <p className="text-xs text-gray-600 uppercase tracking-widest">
                                                No reviews yet. Be the first!
                                            </p>
                                        </div>
                                    ) : (
                                        reviews.map((r, i) => (
                                            <div key={r._id || i} className="border border-gray-800 bg-[#050505] p-5 border-l-4 border-l-amber-500/60">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div>
                                                        <p className="text-sm font-black italic uppercase tracking-widest text-white">{r.username}</p>
                                                        <p className="text-[9px] text-gray-600 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <StarRating value={r.rating} />
                                                </div>
                                                {r.comment && (
                                                    <p className="text-sm text-gray-400 leading-relaxed mt-2 border-t border-gray-800 pt-2">
                                                        {r.comment}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Write review */}
                                <div>
                                    <div className="border border-cyan-900/40 bg-[#050505] p-6 sticky top-28">
                                        <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.4em] mb-5 flex items-center gap-2 border-b border-gray-800 pb-3">
                                            <FiSend /> Write a Review
                                        </h2>

                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold block mb-1.5">Your Name</label>
                                                <input
                                                    type="text"
                                                    value={reviewForm.username}
                                                    onChange={e => setReviewForm(f => ({ ...f, username: e.target.value }))}
                                                    placeholder="PILOT_ALIAS"
                                                    className="w-full bg-black border border-gray-800 focus:border-cyan-600 p-3 text-[11px] font-bold text-white outline-none uppercase tracking-widest transition-colors placeholder:text-gray-700"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold block mb-2">Rating</label>
                                                <StarRating
                                                    value={reviewForm.rating}
                                                    onChange={r => setReviewForm(f => ({ ...f, rating: r }))}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold block mb-1.5">Comment (optional)</label>
                                                <textarea
                                                    value={reviewForm.comment}
                                                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                                    placeholder="Share your experience..."
                                                    rows={4}
                                                    className="w-full bg-black border border-gray-800 focus:border-cyan-600 p-3 text-[11px] text-gray-300 outline-none transition-colors resize-none font-mono"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={reviewStatus === 'loading'}
                                                className="w-full bg-cyan-600 hover:bg-white hover:text-black text-black font-black text-[10px] uppercase tracking-[0.2em] py-4 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <FiSend /> {reviewStatus === 'loading' ? 'Submitting...' : 'Submit Review'}
                                            </button>

                                            {reviewMsg && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className={`text-[10px] font-bold uppercase tracking-widest text-center ${
                                                        reviewStatus === 'success' ? 'text-green-400' : 'text-red-400'
                                                    }`}
                                                >
                                                    {reviewMsg}
                                                </motion.p>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* ═══ LIGHTBOX ═══ */}
            <AnimatePresence>
                {lightbox !== null && photos[lightbox] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/97 flex flex-col items-center justify-center p-4"
                        onClick={() => setLightbox(null)}
                    >
                        <button
                            type="button"
                            className="absolute top-6 right-6 text-white/60 hover:text-white z-10 p-2 border border-gray-800 bg-black/80 hover:border-gray-600 transition-colors"
                            aria-label="Close"
                            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
                        >
                            <FiX size={20} />
                        </button>

                        {/* Counter */}
                        <p className="absolute top-6 left-6 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            {lightbox + 1} / {photos.length}
                        </p>

                        <img
                            src={photos[lightbox]}
                            alt=""
                            className="max-w-full max-h-[85vh] object-contain border border-gray-800"
                            onClick={e => e.stopPropagation()}
                        />

                        {/* Prev / Next */}
                        <div className="absolute bottom-8 flex items-center gap-4">
                            <button
                                type="button"
                                disabled={lightbox === 0}
                                onClick={e => { e.stopPropagation(); setLightbox(l => Math.max(0, l - 1)); }}
                                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-20 transition-all"
                            >
                                ← Prev
                            </button>
                            <button
                                type="button"
                                disabled={lightbox === photos.length - 1}
                                onClick={e => { e.stopPropagation(); setLightbox(l => Math.min(photos.length - 1, l + 1)); }}
                                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-20 transition-all"
                            >
                                Next →
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
