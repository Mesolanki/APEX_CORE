import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Tag, ShoppingCart, Calendar, Crosshair, Terminal, Zap, Image as ImageIcon, Trash2 } from 'lucide-react';
import { API_BASE } from '../api';

const initialSpecs = { os: '', cpu: '', ram: '', gpu: '', storage: '' };
const categories = ['STREET_ARCADE', 'SIMULATOR', 'OFF_ROAD', 'RETRO_RACER', 'PROTOTYPE', 'DLC'];
const screenshotCategories = ['GAMEPLAY', 'CINEMATIC', 'UI', 'ENVIRONMENT', 'SHOWROOM', 'CONTENT', 'PODIUM', 'EVENT'];

const GamesManagement = () => {
    const [marketItems, setMarketItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ 
        id: '', title: '', genre: 'STREET_ARCADE', price: '', image: '', releaseDate: '', description: '',
        developer: '', publisher: '', downloads: 0,
        downloadSize: '',
        minSpecs: { ...initialSpecs },
        recommendedSpecs: { ...initialSpecs },
        screenshots: []
    });

    useEffect(() => {
        fetchGamesData();
    }, []);

    const fetchGamesData = async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/games`);
            if (data && data.globalMarket) {
                setMarketItems(data.globalMarket);
            }
        } catch (error) {
            console.error('Failed to fetch', error);
        }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const finalData = { ...formData, id: formData.id || `ASSET_${Math.floor(Math.random()*10000)}` };
            await axios.post(`${API_BASE}/api/games/add-vehicle`, finalData);
            setIsFormOpen(false);
            setFormData({ 
                id: '', title: '', genre: 'STREET_ARCADE', price: '', image: '', releaseDate: '', description: '',
                developer: '', publisher: '', downloads: 0,
                downloadSize: '', minSpecs: { ...initialSpecs }, recommendedSpecs: { ...initialSpecs }, screenshots: []
            });
            fetchGamesData();
        } catch (error) {
            console.error('Failed to add market item', error);
        }
    };

    const handleSpecChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    const addScreenshot = () => {
        setFormData(prev => ({
            ...prev,
            screenshots: [...prev.screenshots, { category: 'GAMEPLAY', url: '' }]
        }));
    };

    const updateScreenshot = (index, field, value) => {
        const newScreenshots = [...formData.screenshots];
        newScreenshots[index][field] = value;
        setFormData(prev => ({ ...prev, screenshots: newScreenshots }));
    };

    const removeScreenshot = (index) => {
        setFormData(prev => ({
            ...prev,
            screenshots: prev.screenshots.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono text-gray-200 uppercase selection:bg-red-600 selection:text-white">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-4 border-red-600 pl-6 relative">
                <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -left-10 w-8 h-px bg-red-600/30" />
                <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2">CHASSIS_VAULT</h1>
                    <p className="text-[10px] text-gray-500 tracking-[0.3em] bg-black border border-gray-900 px-3 py-1 inline-flex items-center gap-2">
                        <Terminal size={12} className="text-red-500" /> Administrative Access Granted
                    </p>
                </div>
                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-black hover:bg-[#0a0a0a] border border-red-600 text-white px-6 py-3 font-black text-xs tracking-widest transition-colors flex items-center gap-3 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] group"
                >
                    <Plus className="w-4 h-4 text-red-500 group-hover:rotate-90 transition-transform duration-300" /> DEPLOY_MODULE
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-[#050505] p-8 md:p-10 border border-gray-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 to-red-500" />
                    <div className="flex items-center gap-4 mb-8 border-b border-gray-900 pb-4">
                        <Zap className="text-red-600" />
                        <h3 className="text-xl font-black italic text-white tracking-widest">INITIALIZE_NEW_ASSET</h3>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-10">
                        {/* CORE TIER */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] text-red-500 font-bold tracking-[0.4em] mb-4">CORE_PARAMETERS</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" placeholder="MODULE_DESIGNATION (TITLE)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700" required />
                                
                                <select 
                                    value={formData.genre} 
                                    onChange={e => setFormData({...formData, genre: e.target.value})} 
                                    className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors uppercase" 
                                    required
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
                                </select>

                                <input type="text" placeholder="DEVELOPER_STUDIO" value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700" />

                                <input type="text" placeholder="PUBLISHER_STUDIO" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700" />

                                <input type="text" placeholder="ACQUISITION_COST (E.G. FREE OR $5.99)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700" required />
                                
                                <input type="number" min="0" placeholder="DOWNLOAD_COUNT (0)" value={formData.downloads} onChange={e => setFormData({...formData, downloads: Number(e.target.value)})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700" />

                                <div className="relative">
                                    <label className="absolute -top-2 left-4 bg-[#050505] px-2 text-[8px] uppercase text-red-500 font-black tracking-widest">REVISION_DATE</label>
                                    <input type="date" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors" required />
                                </div>

                                <input type="text" placeholder="PRIMARY_VISUAL_FEED (COVER IMG URL)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors md:col-span-1 placeholder:text-gray-700" />
                            </div>
                            <textarea placeholder="OPERATIONAL_INTEL (DESCRIPTION)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors h-32 placeholder:text-gray-700" required />
                        </div>

                        {/* HARDWARE SPECS GRID */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] text-red-500 font-bold tracking-[0.4em] mb-4">DEPLOYMENT_REQUIREMENTS</h4>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                                {/* MIN SPECS */}
                                <div className="space-y-3 bg-black p-4 sm:p-6 border border-gray-900 shadow-inner">
                                    <h5 className="text-[10px] text-gray-500 font-black tracking-widest border-b border-gray-800 pb-2 mb-4">MINIMUM_THRESHOLD</h5>
                                    {['os', 'cpu', 'ram', 'gpu', 'storage'].map(field => (
                                        <input key={field} type="text" placeholder={`MIN_${field.toUpperCase()}`} value={formData.minSpecs[field]} onChange={e => handleSpecChange('minSpecs', field, e.target.value)} className="w-full bg-[#020202] border border-gray-800 py-3 px-4 text-xs font-bold tracking-wider focus:outline-none focus:border-red-900 transition-colors" />
                                    ))}
                                </div>
                                
                                {/* REC SPECS */}
                                <div className="space-y-3 bg-black p-4 sm:p-6 border border-gray-900 shadow-inner">
                                    <h5 className="text-[10px] text-gray-500 font-black tracking-widest border-b border-gray-800 pb-2 mb-4">OPTIMAL_SYNC</h5>
                                    {['os', 'cpu', 'ram', 'gpu', 'storage'].map(field => (
                                        <input key={field} type="text" placeholder={`REC_${field.toUpperCase()}`} value={formData.recommendedSpecs[field]} onChange={e => handleSpecChange('recommendedSpecs', field, e.target.value)} className="w-full bg-[#020202] border border-gray-800 py-3 px-4 text-xs font-bold tracking-wider focus:outline-none focus:border-blue-900 transition-colors" />
                                    ))}
                                </div>
                            </div>

                            <input type="text" placeholder="PAYLOAD_SIZE (E.G. ~12.4 GB)" value={formData.downloadSize} onChange={e => setFormData({...formData, downloadSize: e.target.value})} className="w-full bg-black border border-gray-800 py-4 px-5 text-white text-xs font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700 mt-4" />
                        </div>

                        {/* SCREENSHOTS LOGS MULTIPART */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-4">
                                <h4 className="text-[10px] text-red-500 font-bold tracking-[0.4em]">VISUAL_CAPTURE_LOGS</h4>
                                <button type="button" onClick={addScreenshot} className="text-[9px] bg-red-900/20 text-red-500 px-3 py-1.5 border border-red-900/50 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2 font-black tracking-widest">
                                    <ImageIcon size={12} /> ADD_FRAME
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {formData.screenshots.map((s, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-3 bg-black p-3 border border-gray-800 group">
                                        <select value={s.category} onChange={e => updateScreenshot(i, 'category', e.target.value)} className="bg-[#050505] border border-gray-700 text-xs text-gray-300 py-3 px-4 focus:outline-none focus:border-red-500 uppercase tracking-widest shrink-0 w-full sm:w-48">
                                            {screenshotCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <input type="text" placeholder={`FEED_URL_${i+1}`} value={s.url} onChange={e => updateScreenshot(i, 'url', e.target.value)} className="flex-1 bg-[#050505] border border-gray-700 py-3 px-4 text-xs font-mono focus:outline-none focus:border-red-500 placeholder:text-gray-700" required />
                                        <button type="button" onClick={() => removeScreenshot(i)} className="bg-red-900/20 text-red-500 px-4 hover:bg-red-600 hover:text-white border border-red-900/50 transition-colors shrink-0 flex items-center justify-center py-3 sm:py-0">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {formData.screenshots.length === 0 && (
                                    <div className="text-[10px] text-gray-600 tracking-widest text-center py-6 bg-black border border-gray-900 dashed">NO_VISUAL_LOGS_ATTACHED</div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-12 border-t border-gray-900 pt-8">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-[10px] font-black tracking-widest text-gray-500 hover:text-white border border-transparent hover:border-gray-800 transition-all">ABORT_SEQUENCE</button>
                            <button type="submit" className="bg-red-600 text-white px-8 py-3 text-[10px] font-black tracking-widest border border-red-500 hover:bg-white hover:text-black transition-all flex items-center gap-2">EXECUTE_DEPLOY <Terminal size={14} /></button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-10">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Zap className="mx-auto w-8 h-8 text-red-600 animate-pulse mb-4" />
                        <p className="text-[10px] font-black tracking-[0.5em] text-gray-500">SYNCING_MAINFRAME...</p>
                    </div>
                ) : marketItems.map((item, idx) => (
                    <div key={item.id || idx} className="bg-black border border-gray-800 group relative flex flex-col h-full hover:border-red-600/50 transition-colors overflow-hidden cursor-crosshair shadow-lg">
                        <div className="h-40 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] tracking-widest bg-[#020202] text-gray-700">NO_FEED</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2 py-1 tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                ID:{item.id}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col bg-[#020202] group-hover:bg-[#050505] transition-colors relative z-10 border-t border-gray-900">
                            <h3 className="text-base font-black text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">{item.title}</h3>
                            
                            {item.developer && (
                                <div className="text-[8px] text-cyan-600 font-black tracking-[0.2em] mb-1 uppercase">
                                    DEV: <span className="text-cyan-400">{item.developer}</span>
                                </div>
                            )}

                            {item.releaseDate && (
                                <div className="text-[8px] text-gray-500 font-black tracking-[0.2em] mb-4 uppercase">
                                    REV: <span className="text-gray-300">{item.releaseDate}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-[#050505] border border-gray-800 text-[9px] text-gray-400 px-2 py-1 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                                    <Tag className="w-3 h-3 text-red-600" /> {item.genre?.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <div className="mt-auto border-t border-gray-900 pt-4 flex justify-between items-center">
                                <span className="text-[10px] font-black tracking-widest text-emerald-500">{item.price}</span>
                                <button className="text-gray-600 group-hover:text-red-500 group-hover:-rotate-90 transition-all duration-300">
                                    <Crosshair className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GamesManagement;
