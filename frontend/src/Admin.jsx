import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDatabase, FiPlus, FiLayers, FiFlag, FiClock, FiExternalLink } from 'react-icons/fi';
import api from './api/api';

function Admin() {
    const [activeTab, setActiveTab] = useState('VEHICLE');
    const [statusMsg, setStatusMsg] = useState('');

    // Form States
    const [vehicle, setVehicle] = useState({ id: "", title: "", genre: "STREET_ARCADE", price: "", image: "" });
    const [event, setEvent] = useState({ target: "", prize: "", eventClass: "S_CLASS", status: "LIVE" });
    const [release, setRelease] = useState({ id: "", title: "", eta: "", type: "TUNING_KIT", image: "", status: "IN_GARAGE" });

    // Handlers
    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/games/add-vehicle', vehicle);
            setStatusMsg('✅ Vehicle uploaded to mainframe.');
            setVehicle({ id: "", title: "", genre: "STREET_ARCADE", price: "", image: "" });
        } catch (err) { setStatusMsg('❌ Error uploading vehicle.'); }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/games/add-event', event);
            setStatusMsg('✅ Live Event broadcasted to servers.');
            setEvent({ target: "", prize: "", eventClass: "S_CLASS", status: "LIVE" });
        } catch (err) { setStatusMsg('❌ Error broadcasting event.'); }
    };

    const handleAddRelease = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/games/add-release', release);
            setStatusMsg('✅ Expansion packed into pipeline.');
            setRelease({ id: "", title: "", eta: "", type: "TUNING_KIT", image: "", status: "IN_GARAGE" });
        } catch (err) { setStatusMsg('❌ Error packing expansion.'); }
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 font-mono p-6 sm:p-12 selection:bg-red-600 selection:text-white">

            {/* Header */}
            <header className="max-w-4xl mx-auto mb-10 flex items-center gap-4 border-b border-gray-900 pb-6">
                <FiDatabase className="text-red-600 text-3xl" />
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-white">Mainframe_Admin</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-[10px] text-red-500 font-bold tracking-widest uppercase">Level 4 Clearance Required</p>
                        <Link to="/admin/dashboard" className="text-[10px] bg-gray-900 hover:bg-gray-800 px-3 py-1 border border-gray-800 text-blue-500 font-black uppercase tracking-widest transition-all">
                            Manage_All_Assets
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto">
                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-900 pb-4 overflow-x-auto">
                    <button onClick={() => setActiveTab('VEHICLE')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 'VEHICLE' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}><FiLayers /> Add_Chassis</button>
                    <button onClick={() => setActiveTab('EVENT')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 'EVENT' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}><FiFlag /> Add_Event</button>
                    <button onClick={() => setActiveTab('RELEASE')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${activeTab === 'RELEASE' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}><FiClock /> Add_Expansion</button>
                </div>

                {/* Status Message */}
                {statusMsg && (
                    <div className="mb-6 p-4 border border-gray-800 bg-[#0a0a0a] text-xs font-bold tracking-widest uppercase rounded">
                        {statusMsg}
                    </div>
                )}

                {/* FORM CONTAINER */}
                <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-blue-600" />
                    <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3 text-gray-200 mb-6">
                        <FiPlus className={activeTab === 'EVENT' ? 'text-red-500' : 'text-blue-500'} />
                        {activeTab === 'VEHICLE' && 'Import_New_Chassis'}
                        {activeTab === 'EVENT' && 'Broadcast_Live_Event'}
                        {activeTab === 'RELEASE' && 'Schedule_Expansion'}
                    </h2>

                    {/* VEHICLE FORM */}
                    {activeTab === 'VEHICLE' && (
                        <form onSubmit={handleAddVehicle} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" placeholder="ID (e.g. R_05)" required className="form-input" value={vehicle.id} onChange={(e) => setVehicle({ ...vehicle, id: e.target.value })} />
                            <input type="text" placeholder="Title" required className="form-input" value={vehicle.title} onChange={(e) => setVehicle({ ...vehicle, title: e.target.value })} />
                            <select className="form-input" value={vehicle.genre} onChange={(e) => setVehicle({ ...vehicle, genre: e.target.value })}>
                                <option value="STREET_ARCADE">STREET_ARCADE</option>
                                <option value="SIMULATOR">SIMULATOR</option>
                                <option value="OFF_ROAD">OFF_ROAD</option>
                                <option value="RETRO_RACER">RETRO_RACER</option>
                            </select>
                            <input type="text" placeholder="Price (e.g. 19.99_USD)" required className="form-input" value={vehicle.price} onChange={(e) => setVehicle({ ...vehicle, price: e.target.value })} />
                            <input type="text" placeholder="Image URL" required className="form-input sm:col-span-2" value={vehicle.image} onChange={(e) => setVehicle({ ...vehicle, image: e.target.value })} />
                            <button type="submit" className="form-btn bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]">UPLOAD_TO_SHOWROOM</button>
                        </form>
                    )}

                    {/* EVENT FORM */}
                    {activeTab === 'EVENT' && (
                        <div className="space-y-6">
                            {/* Quick add (legacy) */}
                            <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" placeholder="Target (e.g. NEON_DRIFT_RUN)" required className="form-input sm:col-span-2" value={event.target} onChange={(e) => setEvent({ ...event, target: e.target.value })} />
                                <input type="text" placeholder="Prize (e.g. 10,000_REP)" required className="form-input" value={event.prize} onChange={(e) => setEvent({ ...event, prize: e.target.value })} />
                                <select className="form-input" value={event.eventClass} onChange={(e) => setEvent({ ...event, eventClass: e.target.value })}>
                                    <option value="S_CLASS">S_CLASS</option>
                                    <option value="A_CLASS">A_CLASS</option>
                                    <option value="B_CLASS">B_CLASS</option>
                                    <option value="C_CLASS">C_CLASS</option>
                                </select>
                                <select className="form-input sm:col-span-2" value={event.status} onChange={(e) => setEvent({ ...event, status: e.target.value })}>
                                    <option value="LIVE">LIVE</option>
                                    <option value="STARTING_SOON">STARTING_SOON</option>
                                    <option value="ENDED">ENDED</option>
                                </select>
                                <button type="submit" className="form-btn bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]">BROADCAST_EVENT</button>
                            </form>

                            {/* Link to full event creator */}
                            <div className="border-t border-gray-800 pt-5">
                                <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] mb-3 font-bold">Full Event Creator with organizer details, photos & more</p>
                                <Link
                                    to="/admin/add-event"
                                    className="flex items-center gap-3 bg-cyan-600/10 border border-cyan-800/40 hover:bg-cyan-600/20 hover:border-cyan-600/60 text-cyan-400 px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all w-full justify-center"
                                >
                                    <FiExternalLink /> Open Full Event Creator
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* RELEASE FORM */}
                    {activeTab === 'RELEASE' && (
                        <form onSubmit={handleAddRelease} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" placeholder="ID (e.g. DLC_04)" required className="form-input" value={release.id} onChange={(e) => setRelease({ ...release, id: e.target.value })} />
                            <input type="text" placeholder="Title (e.g. DRIFT_KING_PACK)" required className="form-input" value={release.title} onChange={(e) => setRelease({ ...release, title: e.target.value })} />
                            <input type="text" placeholder="ETA (e.g. Q1_2027)" required className="form-input" value={release.eta} onChange={(e) => setRelease({ ...release, eta: e.target.value })} />
                            <select className="form-input" value={release.type} onChange={(e) => setRelease({ ...release, type: e.target.value })}>
                                <option value="TUNING_KIT">TUNING_KIT</option>
                                <option value="BODY_MOD">BODY_MOD</option>
                                <option value="CIRCUIT">CIRCUIT</option>
                            </select>
                            <select className="form-input" value={release.status} onChange={(e) => setRelease({ ...release, status: e.target.value })}>
                                <option value="IN_GARAGE">IN_GARAGE</option>
                                <option value="PROTOTYPE">PROTOTYPE</option>
                                <option value="CLASSIFIED">CLASSIFIED</option>
                            </select>
                            <input type="text" placeholder="Image URL" required className="form-input sm:col-span-2" value={release.image} onChange={(e) => setRelease({ ...release, image: e.target.value })} />
                            <button type="submit" className="form-btn bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]">SCHEDULE_EXPANSION</button>
                        </form>
                    )}
                </div>
            </main>

            {/* Custom Styles just for this component to keep JSX clean */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .form-input {
                    background-color: #000;
                    border: 1px solid #1f2937;
                    color: #d1d5db;
                    padding: 0.75rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .form-input:focus { border-color: #3b82f6; }
                .form-btn {
                    grid-column: 1 / -1;
                    color: white;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.75rem;
                    padding: 1rem;
                    border-radius: 0.25rem;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .form-btn:active { transform: scale(0.98); }
            `}} />
        </div>
    );
}

export default Admin;