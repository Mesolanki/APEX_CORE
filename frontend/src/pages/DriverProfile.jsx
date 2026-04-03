import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { FiArrowLeft, FiAward, FiMapPin, FiImage, FiX, FiPlay } from 'react-icons/fi';

function DriverProfile() {
    const { rank } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        let c = false;
        (async () => {
            setLoading(true);
            setErr('');
            try {
                const safe = encodeURIComponent(rank || '');
                const res = await api.get(`/api/games/driver-detail/${safe}`);
                if (!c) setDriver(res.data?.item);
            } catch (e) {
                if (!c) setErr(e.response?.data?.message || 'Driver not found');
            } finally {
                if (!c) setLoading(false);
            }
        })();
        return () => { c = true; };
    }, [rank]);

    const portraitSrc =
        driver?.portrait ||
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800';

    const shots = driver?.screenshots?.length
        ? driver.screenshots
        : driver?.portrait
            ? [driver.portrait]
            : [];

    return (
        <div className="min-h-screen bg-[#020617] text-white font-mono pt-24 pb-32 px-4 sm:px-6">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
            </div>

            <div className="relative max-w-5xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate('/drivers')}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-cyan-400 mb-8"
                >
                    <FiArrowLeft /> All drivers
                </button>

                {loading && (
                    <div className="py-32 text-cyan-500/80 text-xs uppercase text-center tracking-[0.4em] animate-pulse">Loading dossier…</div>
                )}

                {err && !loading && (
                    <div className="border border-red-900/50 bg-red-950/20 p-8 rounded-2xl text-red-400 text-center">
                        {err}
                        <Link to="/drivers" className="block mt-4 text-[10px] text-gray-500 uppercase tracking-widest hover:text-white">Roster</Link>
                    </div>
                )}

                {!loading && driver && (
                    <>
                        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start mb-16">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 rounded-3xl opacity-75 blur-sm" />
                                <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 aspect-[3/4] max-h-[520px]">
                                    <img
                                        src={portraitSrc}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#020617] to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-[10px] text-cyan-400 uppercase tracking-[0.35em] mb-2">{driver.team}</p>
                                        <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter">
                                            {driver.alias?.replace(/_/g, ' ')}
                                        </h1>
                                        <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest text-[10px]">
                                            {driver.country} · {driver.car?.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-6 py-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/20">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Rank</span>
                                        <span className="text-4xl font-black text-cyan-400 italic">{driver.rank}</span>
                                    </div>
                                    <div className="px-6 py-4 rounded-2xl bg-black/50 border border-gray-800 flex-1 min-w-[140px]">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Best lap</span>
                                        <span className="text-2xl font-mono font-bold text-white">{driver.time}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-gray-800 p-4 bg-black/30">
                                        <FiAward className="text-cyan-500 mb-2" />
                                        <span className="text-[9px] text-gray-600 uppercase">Wins</span>
                                        <p className="text-2xl font-black text-white">{driver.wins || '—'}</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-800 p-4 bg-black/30">
                                        <FiAward className="text-violet-400 mb-2" />
                                        <span className="text-[9px] text-gray-600 uppercase">Podiums</span>
                                        <p className="text-2xl font-black text-white">{driver.podiums || '—'}</p>
                                    </div>
                                </div>

                                {driver.signatureTrack && (
                                    <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                                        <FiMapPin className="text-cyan-600" />
                                        {driver.signatureTrack}
                                    </p>
                                )}

                                <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-cyan-600 pl-4">
                                    {driver.bio || 'No dossier text on file.'}
                                </p>
                            </motion.div>
                        </div>

                        {driver.videoUrl && (
                            <section className="mb-16">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-4 flex items-center gap-2">
                                    <FiPlay className="text-cyan-500" /> Onboard / highlight
                                </h2>
                                <div className="relative rounded-2xl overflow-hidden border border-gray-800 aspect-video bg-black max-w-3xl">
                                    <iframe
                                        title="Driver video"
                                        src={driver.videoUrl}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-4 flex items-center gap-2">
                                <FiImage className="text-violet-400" /> Garage & track shots
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {shots.map((src, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setLightbox(i)}
                                        className="aspect-video rounded-xl overflow-hidden border border-gray-800 hover:border-cyan-500/40 transition-all group"
                                    >
                                        <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </button>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>

            <AnimatePresence>
                {lightbox !== null && shots[lightbox] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setLightbox(null)}
                    >
                        <button
                            type="button"
                            className="absolute top-6 right-6 text-white/70 hover:text-white z-10"
                            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
                            aria-label="Close"
                        >
                            <FiX size={32} />
                        </button>
                        <img
                            src={shots[lightbox]}
                            alt=""
                            className="max-w-full max-h-[90vh] object-contain rounded-lg border border-gray-800"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default DriverProfile;
