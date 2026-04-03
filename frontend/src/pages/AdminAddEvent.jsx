import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiZap, FiImage, FiFlag, FiCalendar,
    FiMapPin, FiUsers, FiAward, FiGlobe, FiMail, FiPhone,
    FiCheckCircle, FiAlertCircle, FiChevronDown, FiTrash2, FiLink
} from 'react-icons/fi';
import api from '../api/api';

/* ───────────────────────────────────────────────
   Reusable form field wrappers
─────────────────────────────────────────────── */
function FieldLabel({ children }) {
    return (
        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.35em] mb-1.5">
            {children}
        </label>
    );
}

function TextInput({ icon: Icon, name, value, onChange, placeholder, required, type = 'text' }) {
    return (
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700 text-sm pointer-events-none" />}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-[#080808] border border-gray-800 focus:border-cyan-600/70 outline-none text-white text-[11px] font-mono tracking-widest py-3 transition-colors placeholder:text-gray-700 ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
            />
        </div>
    );
}

function SelectInput({ name, value, onChange, options }) {
    return (
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-[#080808] border border-gray-800 focus:border-cyan-600/70 outline-none text-white text-[11px] font-mono tracking-widest py-3 px-3 transition-colors appearance-none cursor-pointer"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
        </div>
    );
}

function SectionHeader({ children }) {
    return (
        <div className="flex items-center gap-3 mt-8 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-900/40" />
            <span className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.4em] whitespace-nowrap">{children}</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-900/40" />
        </div>
    );
}

/* ───────────────────────────────────────────────
   Main AdminAddEvent component
─────────────────────────────────────────────── */
export default function AdminAddEvent() {
    const [form, setForm] = useState({
        // Basic
        target:       '',
        description:  '',
        status:       'Upcoming',
        eventType:    'Online',
        class:        '',

        // Organizer
        organizerName:    '',
        organizerLogo:    '',
        organizerWebsite: '',
        organizerEmail:   '',
        organizerPhone:   '',

        // Schedule & Location
        startDate: '',
        endDate:   '',
        region:    'GLOBAL',
        venue:     '',

        // Prizes & Fees
        entryPrize:   'Free',
        winningPrize: '',
        prizePool:    '',

        // Media
        coverImage: '',

        // Participants
        maxParticipants: '',

        // Results (optional — filled after event)
        winner:      '',
        winnerAlias: '',
        winnerTime:  '',
        runnerUp:    '',
    });

    // Photos array (multi-URL input)
    const [photoUrls, setPhotoUrls] = useState(['']);

    const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    /* Handlers */
    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePhotoChange = (i, val) => {
        const updated = [...photoUrls];
        updated[i] = val;
        setPhotoUrls(updated);
    };

    const addPhotoRow    = () => setPhotoUrls(prev => [...prev, '']);
    const removePhotoRow = i  => setPhotoUrls(prev => prev.filter((_, idx) => idx !== i));

    const handleSubmit = async e => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        const photos = photoUrls.filter(u => u.trim() !== '');

        const payload = {
            ...form,
            photos,
            maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : 0,
            startDate: form.startDate || undefined,
            endDate:   form.endDate   || undefined,
        };

        try {
            await api.post('/api/events', payload);
            setStatus('success');
            setMessage('Event created successfully and pushed to the grid!');
            // Reset form
            setForm({
                target: '', description: '', status: 'Upcoming', eventType: 'Online', class: '',
                organizerName: '', organizerLogo: '', organizerWebsite: '', organizerEmail: '', organizerPhone: '',
                startDate: '', endDate: '', region: 'GLOBAL', venue: '',
                entryPrize: 'Free', winningPrize: '', prizePool: '',
                coverImage: '', maxParticipants: '',
                winner: '', winnerAlias: '', winnerTime: '', runnerUp: '',
            });
            setPhotoUrls(['']);
            setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to create event.');
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-white font-mono pt-24 pb-40 px-4 md:px-8">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-cyan-900/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-violet-900/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative max-w-4xl mx-auto">
                {/* Page header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-8 bg-cyan-500" />
                        <span className="text-[10px] text-cyan-600 font-black uppercase tracking-[0.5em]">Admin Console</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                        Add <span className="text-cyan-500">Event</span>
                    </h1>
                    <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">
                        Push a new event to the live broadcast grid
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-0">
                    <div className="border border-gray-800/60 bg-[#050505] p-6 md:p-8">

                        {/* ── BASIC INFO ── */}
                        <SectionHeader>Basic Info</SectionHeader>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2">
                                <FieldLabel>Event Name / Codename *</FieldLabel>
                                <TextInput
                                    name="target" value={form.target} onChange={handleChange}
                                    placeholder="NEON_CIRCUIT_2026" required
                                />
                            </div>

                            <div>
                                <FieldLabel>Status</FieldLabel>
                                <SelectInput name="status" value={form.status} onChange={handleChange}
                                    options={[
                                        { value: 'Upcoming',  label: 'Upcoming'  },
                                        { value: 'LIVE',      label: 'LIVE'      },
                                        { value: 'Completed', label: 'Completed' },
                                        { value: 'Cancelled', label: 'Cancelled' },
                                    ]}
                                />
                            </div>

                            <div>
                                <FieldLabel>Event Type</FieldLabel>
                                <SelectInput name="eventType" value={form.eventType} onChange={handleChange}
                                    options={[
                                        { value: 'Online',  label: 'Online'  },
                                        { value: 'Offline', label: 'Offline' },
                                        { value: 'Hybrid',  label: 'Hybrid'  },
                                    ]}
                                />
                            </div>

                            <div>
                                <FieldLabel>Class / Tier</FieldLabel>
                                <TextInput
                                    icon={FiFlag}
                                    name="class" value={form.class} onChange={handleChange}
                                    placeholder="APEX / ROOKIE / ELITE"
                                />
                            </div>

                            <div>
                                <FieldLabel>Max Participants</FieldLabel>
                                <TextInput
                                    icon={FiUsers}
                                    name="maxParticipants" value={form.maxParticipants} onChange={handleChange}
                                    placeholder="64" type="number"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <FieldLabel>Description</FieldLabel>
                                <textarea
                                    name="description" value={form.description} onChange={handleChange}
                                    placeholder="Describe the event, rules, and format..."
                                    rows={4}
                                    className="w-full bg-[#080808] border border-gray-800 focus:border-cyan-600/70 outline-none text-white text-[11px] font-mono tracking-wider py-3 px-3 transition-colors resize-none placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        {/* ── ORGANIZER ── */}
                        <SectionHeader>Organizer / Company</SectionHeader>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2">
                                <FieldLabel>Company / Organizer Name *</FieldLabel>
                                <TextInput
                                    name="organizerName" value={form.organizerName} onChange={handleChange}
                                    placeholder="Apex Gaming Co." required
                                />
                            </div>

                            <div>
                                <FieldLabel>Organizer Logo URL</FieldLabel>
                                <TextInput
                                    icon={FiImage}
                                    name="organizerLogo" value={form.organizerLogo} onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <FieldLabel>Official Website</FieldLabel>
                                <TextInput
                                    icon={FiGlobe}
                                    name="organizerWebsite" value={form.organizerWebsite} onChange={handleChange}
                                    placeholder="https://apex-gaming.com"
                                />
                            </div>

                            <div>
                                <FieldLabel>Contact Email</FieldLabel>
                                <TextInput
                                    icon={FiMail}
                                    name="organizerEmail" value={form.organizerEmail} onChange={handleChange}
                                    placeholder="events@company.com" type="email"
                                />
                            </div>

                            <div>
                                <FieldLabel>Contact Phone</FieldLabel>
                                <TextInput
                                    icon={FiPhone}
                                    name="organizerPhone" value={form.organizerPhone} onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        {/* ── SCHEDULE & LOCATION ── */}
                        <SectionHeader>Schedule &amp; Location</SectionHeader>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <FieldLabel>Start Date &amp; Time</FieldLabel>
                                <TextInput
                                    icon={FiCalendar}
                                    name="startDate" value={form.startDate} onChange={handleChange}
                                    type="datetime-local"
                                />
                            </div>

                            <div>
                                <FieldLabel>End Date &amp; Time</FieldLabel>
                                <TextInput
                                    icon={FiCalendar}
                                    name="endDate" value={form.endDate} onChange={handleChange}
                                    type="datetime-local"
                                />
                            </div>

                            <div>
                                <FieldLabel>Region</FieldLabel>
                                <TextInput
                                    icon={FiMapPin}
                                    name="region" value={form.region} onChange={handleChange}
                                    placeholder="GLOBAL / ASIA / NA"
                                />
                            </div>

                            <div>
                                <FieldLabel>Venue / Platform</FieldLabel>
                                <TextInput
                                    icon={FiMapPin}
                                    name="venue" value={form.venue} onChange={handleChange}
                                    placeholder="Apex Arena, Mumbai / Discord"
                                />
                            </div>
                        </div>

                        {/* ── PRIZES & FEES ── */}
                        <SectionHeader>Prizes &amp; Fees</SectionHeader>
                        <div className="grid sm:grid-cols-3 gap-5">
                            <div>
                                <FieldLabel>Entry Fee</FieldLabel>
                                <TextInput
                                    icon={FiAward}
                                    name="entryPrize" value={form.entryPrize} onChange={handleChange}
                                    placeholder="Free / $10"
                                />
                            </div>

                            <div>
                                <FieldLabel>Total Prize Pool</FieldLabel>
                                <TextInput
                                    icon={FiAward}
                                    name="prizePool" value={form.prizePool} onChange={handleChange}
                                    placeholder="$10,000"
                                />
                            </div>

                            <div>
                                <FieldLabel>1st Place Prize</FieldLabel>
                                <TextInput
                                    icon={FiAward}
                                    name="winningPrize" value={form.winningPrize} onChange={handleChange}
                                    placeholder="$5,000 + Trophy"
                                />
                            </div>
                        </div>

                        {/* ── MEDIA ── */}
                        <SectionHeader>Media &amp; Photos</SectionHeader>
                        <div className="space-y-4">
                            <div>
                                <FieldLabel>Cover / Hero Image URL</FieldLabel>
                                <TextInput
                                    icon={FiImage}
                                    name="coverImage" value={form.coverImage} onChange={handleChange}
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            {/* Dynamic photo URLs */}
                            <div>
                                <FieldLabel>Event Photos (Gallery)</FieldLabel>
                                <div className="space-y-2">
                                    {photoUrls.map((url, i) => (
                                        <div key={i} className="flex gap-2">
                                            <div className="relative flex-1">
                                                <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700 text-sm pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={url}
                                                    onChange={e => handlePhotoChange(i, e.target.value)}
                                                    placeholder={`Photo ${i + 1} URL - https://...`}
                                                    className="w-full bg-[#080808] border border-gray-800 focus:border-cyan-600/70 outline-none text-white text-[11px] font-mono tracking-wide py-3 pl-9 pr-3 transition-colors placeholder:text-gray-700"
                                                />
                                            </div>
                                            {photoUrls.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePhotoRow(i)}
                                                    className="px-3 border border-gray-800 text-gray-600 hover:text-red-400 hover:border-red-900 transition-colors"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addPhotoRow}
                                        className="flex items-center gap-2 text-[10px] text-cyan-600 hover:text-cyan-400 font-black uppercase tracking-[0.2em] border border-dashed border-cyan-900/40 px-4 py-2.5 w-full justify-center hover:bg-cyan-950/20 transition-colors mt-1"
                                    >
                                        <FiPlus /> Add Another Photo
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── RESULTS (optional) ── */}
                        <SectionHeader>Results (Fill After Event)</SectionHeader>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <FieldLabel>Winner Name</FieldLabel>
                                <TextInput
                                    name="winner" value={form.winner} onChange={handleChange}
                                    placeholder="Player / Team name"
                                />
                            </div>

                            <div>
                                <FieldLabel>Winner Alias</FieldLabel>
                                <TextInput
                                    name="winnerAlias" value={form.winnerAlias} onChange={handleChange}
                                    placeholder="GHOST_RIDER"
                                />
                            </div>

                            <div>
                                <FieldLabel>Winner Time / Score</FieldLabel>
                                <TextInput
                                    name="winnerTime" value={form.winnerTime} onChange={handleChange}
                                    placeholder="1:23.456"
                                />
                            </div>

                            <div>
                                <FieldLabel>Runner Up</FieldLabel>
                                <TextInput
                                    name="runnerUp" value={form.runnerUp} onChange={handleChange}
                                    placeholder="2nd place name"
                                />
                            </div>
                        </div>

                        {/* ── Submit ── */}
                        <div className="mt-10 pt-6 border-t border-gray-800/60">
                            <motion.button
                                whileHover={{ scale: 1.005 }}
                                whileTap={{ scale: 0.995 }}
                                type="submit"
                                disabled={status === 'loading'}
                                className={`w-full py-5 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                                    status === 'loading'
                                        ? 'bg-cyan-900/40 text-gray-500 cursor-not-allowed'
                                        : 'bg-cyan-600 text-black hover:bg-white hover:shadow-[0_0_40px_rgba(0,242,255,0.3)]'
                                }`}
                            >
                                <FiZap />
                                {status === 'loading' ? 'Pushing to Grid...' : 'Publish Event'}
                            </motion.button>

                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`mt-4 p-4 flex items-center gap-3 border text-[10px] font-bold uppercase tracking-[0.2em] ${
                                            status === 'success'
                                                ? 'border-green-900 bg-green-950/30 text-green-400'
                                                : 'border-red-900 bg-red-950/30 text-red-400'
                                        }`}
                                    >
                                        {status === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                                        {message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
