import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import api from '../api/api';
import { FiSend, FiUser, FiMessageSquare, FiHeart, FiPlus, FiX, FiLock, FiSearch, FiZap, FiCrosshair } from 'react-icons/fi';

const CATEGORIES = [
    { id: 'ALL', label: 'ALL_CHANNELS' },
    { id: 'GENERAL', label: 'GENERAL_COMMS' },
    { id: 'EVENTS', label: 'LIVE_EVENTS' },
    { id: 'DRIVERS', label: 'PILOT_LOUNGE' },
    { id: 'GARAGE', label: 'GARAGE_TECH' },
    { id: 'LFG', label: 'LFG_MATCHMAKING' },
];

function Community() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({ content: '', mediaType: 'none', category: 'GENERAL' });
    const [mediaFile, setMediaFile] = useState(null);

    const [expandedComments, setExpandedComments] = useState({});
    const [commentData, setCommentData] = useState({});

    const feedCategory = searchParams.get('category') || 'ALL';
    const feedQ = searchParams.get('q') || '';

    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    // --- GSAP CUSTOM GAMING CURSOR ---
    useLayoutEffect(() => {
        if (!cursorRef.current || !cursorDotRef.current) return;

        let ctx = gsap.context(() => {
            gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
            gsap.set(cursorDotRef.current, { xPercent: -50, yPercent: -50 });

            const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3.out" });
            const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3.out" });
            const xDotTo = gsap.quickTo(cursorDotRef.current, "x", { duration: 0.05, ease: "power4.out" });
            const yDotTo = gsap.quickTo(cursorDotRef.current, "y", { duration: 0.05, ease: "power4.out" });

            const moveCursor = (e) => {
                xTo(e.clientX);
                yTo(e.clientY);
                xDotTo(e.clientX);
                yDotTo(e.clientY);
            };

            const handleHoverEnter = () => {
                gsap.to(cursorRef.current, { scale: 1.5, rotation: 45, borderColor: "#ef4444", duration: 0.3, ease: "back.out(2)" });
                gsap.to(cursorRef.current.children, { backgroundColor: "#ef4444", duration: 0.3 });
                gsap.to(cursorDotRef.current, { scale: 0, duration: 0.2 });
            };

            const handleHoverLeave = () => {
                gsap.to(cursorRef.current, { scale: 1, rotation: 0, borderColor: "rgba(255, 255, 255, 0.3)", duration: 0.3, ease: "power2.out" });
                gsap.to(cursorRef.current.children, { backgroundColor: "#ffffff", duration: 0.3 });
                gsap.to(cursorDotRef.current, { scale: 1, duration: 0.2 });
            };

            window.addEventListener("mousemove", moveCursor);

            setTimeout(() => {
                const interactives = document.querySelectorAll('button, a, input, textarea, select, .interactive');
                interactives.forEach(el => {
                    el.addEventListener("mouseenter", handleHoverEnter);
                    el.addEventListener("mouseleave", handleHoverLeave);
                });
            }, 500);

            return () => {
                window.removeEventListener("mousemove", moveCursor);
            };
        });

        return () => ctx.revert();
    }, [loading]);

    const setFeedCategory = (cat) => {
        const next = new URLSearchParams(searchParams);
        if (cat === 'ALL') next.delete('category');
        else next.set('category', cat);
        setSearchParams(next, { replace: true });
    };

    const setFeedQuery = (q) => {
        const next = new URLSearchParams(searchParams);
        const trimmed = String(q).trim();
        if (!trimmed) next.delete('q');
        else next.set('q', trimmed);
        setSearchParams(next, { replace: true });
    };

    const loadFeed = useCallback(async () => {
        const params = {};
        if (feedCategory !== 'ALL') params.category = feedCategory;
        if (feedQ.trim()) params.q = feedQ.trim();
        const res = await api.get('/api/community', { params });
        setPosts(res.data);
    }, [feedCategory, feedQ]);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const userRes = await api.get('/api/community/profile');
                if (!c) setCurrentUser(userRes.data);
            } catch {
                if (!c) setCurrentUser(null);
            }
        })();
        return () => { c = true; };
    }, []);

    useEffect(() => {
        let c = false;
        (async () => {
            setLoading(true);
            try {
                await loadFeed();
            } catch (err) {
                console.error('Sync Error:', err);
            } finally {
                if (!c) setLoading(false);
            }
        })();
        return () => { c = true; };
    }, [loadFeed]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return alert('You must be logged in to broadcast.');

        const data = new FormData();
        data.append('content', formData.content);
        data.append('mediaType', formData.mediaType);
        data.append('category', formData.category);
        if (mediaFile) data.append('media', mediaFile);

        try {
            await api.post('/api/community/send', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData({ content: '', mediaType: 'none', category: formData.category });
            setMediaFile(null);
            setIsFormOpen(false);
            loadFeed();
        } catch (err) {
            alert('Transmission failed.');
        }
    };

    const handleLike = async (post) => {
        try {
            if (!currentUser) return alert('Login required to like.');
            const pid = postIdStr(post);
            if (!pid) return;
            await api.put(`/api/community/${encodeURIComponent(pid)}/like`, {});
            await loadFeed();
        } catch (err) {
            console.error('Like failed', err);
            const msg = err.response?.data?.message || 'Could not update like.';
            alert(msg);
        }
    };

    const canonicalUserId = currentUser && (currentUser._id || currentUser.id) ? String(currentUser._id ?? currentUser.id) : null;
    const postIdStr = (post) => String(post._id ?? post.id ?? '');

    const isPostLiked = (post) => {
        if (!canonicalUserId) return false;
        const ids = Array.isArray(post.likedBy) ? post.likedBy : [];
        return ids.some((id) => String(id) === canonicalUserId);
    };

    const isCommentLiked = (comment) => {
        if (!canonicalUserId) return false;
        const ids = Array.isArray(comment.likedBy) ? comment.likedBy : [];
        return ids.some((id) => String(id) === canonicalUserId);
    };

    const commentLikeCount = (comment) => {
        const lb = Array.isArray(comment.likedBy) ? comment.likedBy.length : 0;
        return lb > 0 ? lb : comment.likes || 0;
    };

    const commentRouteId = (comment, index) => comment._id != null ? String(comment._id) : String(index);

    const handleCommentLike = async (post, comment, index) => {
        try {
            if (!currentUser) return alert('Login required to like comments.');
            const pid = postIdStr(post);
            if (!pid) return;
            const cid = commentRouteId(comment, index);
            await api.put(`/api/community/${pid}/comment/${encodeURIComponent(cid)}/like`, {});
            await loadFeed();
        } catch (err) {
            console.error('Comment like failed', err);
            alert('Could not update comment like.');
        }
    };

    const handleAddComment = async (postId) => {
        const data = commentData[postId];
        if (!currentUser || !currentUser.username) return alert('Authentication Error: Please log in again.');
        if (!data || !data.text || data.text.trim() === '') return alert('Comment text required.');

        try {
            const response = await api.post(`/api/community/${postId}/comment`, { text: data.text });
            if (response.status === 201) {
                setCommentData((prev) => ({ ...prev, [postId]: { text: '' } }));
                loadFeed();
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            alert('Transmission failed.');
        }
    };

    const toggleComments = (postId) => {
        setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-cyan-500 font-mono">
                <FiZap className="text-4xl animate-pulse mb-4" />
                <span className="text-[10px] tracking-[0.5em] uppercase">SYNCING_COMM_LINK...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-gray-200 font-mono p-6 pt-24 pb-32 cursor-none relative overflow-x-hidden">
            
            {/* GSAP CURSOR (Only shown on non-touch devices) */}
            <div className="hidden lg:block">
                <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference">
                    <div className="absolute top-[-4px] w-0.5 h-2 bg-white" />
                    <div className="absolute bottom-[-4px] w-0.5 h-2 bg-white" />
                    <div className="absolute left-[-4px] w-2 h-0.5 bg-white" />
                    <div className="absolute right-[-4px] w-2 h-0.5 bg-white" />
                </div>
                <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-cyan-600 pointer-events-none z-[9999] mix-blend-difference rounded-full" />
            </div>

            <div className="scanlines pointer-events-none fixed inset-0 z-50 opacity-10" />

            <header className="max-w-4xl mx-auto mb-10 border-b-2 border-cyan-900 pb-8 relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-500 mb-2">
                            <FiCrosshair className="animate-spin-slow" />
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Global_Comm_Network</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">Pilot_Syndicate</h1>
                    </div>
                    {currentUser ? (
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(true)}
                            className="interactive bg-cyan-600 hover:bg-white text-white hover:text-black px-6 py-4 border border-cyan-500 hover:border-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shrink-0 w-full sm:w-auto justify-center"
                        >
                            <FiPlus className="text-lg" /> INIT_BROADCAST
                        </button>
                    ) : (
                        <div className="text-[9px] text-cyan-500 border border-cyan-900 bg-cyan-950/30 px-6 py-3 uppercase tracking-widest font-black flex items-center gap-2 w-full sm:w-auto justify-center">
                            <FiLock /> AUTH_LOCKED
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex flex-wrap gap-2 flex-1">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setFeedCategory(c.id)}
                                className={`interactive px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] border transition-colors ${
                                    feedCategory === c.id
                                        ? 'bg-cyan-600/20 border-cyan-600 text-cyan-500'
                                        : 'border-gray-800 text-gray-500 hover:border-cyan-900 hover:text-cyan-400'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-0 items-stretch shrink-0 w-full lg:w-auto">
                        <div className="flex-1 lg:w-64 bg-black border border-gray-800 flex items-center px-4 focus-within:border-cyan-600 transition-colors">
                            <FiSearch className="text-cyan-600" />
                            <input
                                type="search"
                                placeholder="QUERY_RECORDS..."
                                value={feedQ}
                                onChange={(e) => setFeedQuery(e.target.value)}
                                className="w-full bg-transparent p-3 text-[10px] tracking-widest uppercase font-bold text-white outline-none placeholder:text-gray-700"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto space-y-8 relative z-10">
                {posts.length === 0 ? (
                    <div className="py-20 text-center border border-gray-900 bg-[#0a0a0a] backdrop-blur-md">
                        <p className="text-cyan-500 text-xs font-bold tracking-[0.3em] uppercase">No_Transmissions_Intercepted</p>
                    </div>
                ) : (
                    posts.map((post) => {
                        const liked = isPostLiked(post);
                        const likeCount = commentLikeCount(post);
                        
                        return (
                            <div key={post._id} className="interactive-card bg-transparent border border-gray-800 hover:border-cyan-600 transition-colors duration-500 group">
                                <div className="p-4 border-b border-gray-800 bg-[#0a0a0a] flex justify-between items-center flex-wrap gap-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-cyan-950/30 border border-cyan-900/50 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                            <FiUser className="text-cyan-500 text-lg relative z-10" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-black italic uppercase tracking-wider text-white block">{post.username}</span>
                                            {post.category && (
                                                <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-[0.2em]">{categoryLabel(post.category)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <div className="p-6 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans uppercase font-bold tracking-wider bg-black/40">
                                    {post.content}
                                </div>

                                {post.mediaUrl && post.mediaType === 'image' && (
                                    <div className="px-6 pb-6 bg-black/40">
                                        <img src={post.mediaUrl} alt="transmission" className="w-full h-auto border border-gray-800 grayscale hover:grayscale-0 transition-all duration-700" />
                                    </div>
                                )}
                                {post.mediaUrl && post.mediaType === 'video' && (
                                    <div className="px-6 pb-6 bg-black/40">
                                        <div className="aspect-video border border-gray-800 bg-black grayscale hover:grayscale-0 transition-all duration-700">
                                            <video src={post.mediaUrl} controls className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 border-t border-gray-800 bg-[#050505] flex gap-8 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => handleLike(post)}
                                        className={`interactive flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                                            liked ? 'text-cyan-500' : 'text-gray-500 hover:text-cyan-400'
                                        }`}
                                    >
                                        <FiZap className={`text-lg ${liked ? 'fill-cyan-600 text-cyan-600' : ''}`} />
                                        {likeCount} {likeCount === 1 ? 'VOLT' : 'VOLTS'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleComments(post._id)}
                                        className="interactive flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-cyan-500 transition-colors"
                                    >
                                        <FiMessageSquare className="text-lg" />
                                        {post.comments?.length || 0} REPLIES
                                    </button>
                                </div>

                                {expandedComments[post._id] && (
                                    <div className="p-6 border-t border-cyan-900/40 bg-black">
                                        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                                            {post.comments?.map((comment, i) => (
                                                <div key={comment._id || i} className="bg-[#050505] p-4 border border-gray-900 border-l-2 border-l-cyan-600">
                                                    <div className="flex justify-between items-start gap-2 mb-2">
                                                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] italic">{comment.username}</span>
                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCommentLike(post, comment, i)}
                                                                className={`interactive flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ${
                                                                    isCommentLiked(comment) ? 'text-cyan-500' : 'text-gray-600 hover:text-cyan-400'
                                                                }`}
                                                            >
                                                                <FiZap className={`text-sm ${isCommentLiked(comment) ? 'fill-cyan-600 text-cyan-600' : ''}`} />
                                                                {commentLikeCount(comment)}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-cyan-400 font-mono tracking-wider uppercase">{comment.text}</p>
                                                </div>
                                            ))}
                                            {post.comments?.length === 0 && (
                                                <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">No_Replies_Logged.</p>
                                            )}
                                        </div>

                                        {currentUser ? (
                                            <div className="flex gap-0 border border-gray-800 focus-within:border-cyan-600 transition-colors">
                                                <input
                                                    type="text"
                                                    placeholder="ENCODE_REPLY..."
                                                    className="bg-black p-4 text-[10px] tracking-[0.2em] font-bold uppercase text-white outline-none flex-1 placeholder:text-gray-700"
                                                    value={commentData[post._id]?.text || ''}
                                                    onChange={(e) => setCommentData({ ...commentData, [post._id]: { ...commentData[post._id], text: e.target.value }})}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddComment(post._id)}
                                                    className="interactive bg-cyan-900/20 hover:bg-cyan-600 text-cyan-500 hover:text-white px-6 font-black transition-colors flex items-center justify-center border-l border-gray-800"
                                                >
                                                    <FiSend />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-[9px] text-cyan-500 uppercase font-black tracking-[0.3em] text-center p-3 border border-cyan-900/50 bg-cyan-950/20">
                                                AUTH_LOCKED :: CANNOT_REPLY
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </main>

            {isFormOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-auto">
                    <div className="bg-black border border-cyan-600 w-full max-w-2xl relative shadow-[0_0_50px_rgba(220,38,38,0.15)] animate-[fadeIn_0.2s_ease-out]">
                        <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />
                        
                        <div className="flex justify-between items-center p-6 border-b border-gray-900 relative z-10 bg-[#050505]">
                            <div className="flex items-center gap-3 text-cyan-500">
                                <FiMessageSquare className="text-xl" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Initialize_Transmission</span>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-cyan-500 transition-colors">
                                <FiX className="text-2xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 relative z-10">
                            <div className="w-full bg-[#050505] border border-gray-900 p-4 mb-6 flex items-center gap-4">
                                <div className="w-8 h-8 bg-cyan-950 flex items-center justify-center border border-cyan-900">
                                    <FiUser className="text-cyan-500" />
                                </div>
                                <div>
                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mb-1">OPERATIVE_ID</p>
                                    <p className="text-xs font-black uppercase italic text-gray-200">{currentUser?.username}</p>
                                </div>
                                <FiLock className="ml-auto text-cyan-900" />
                            </div>

                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">TARGET_NODE</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-black border border-gray-800 p-4 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white outline-none focus:border-cyan-600"
                            >
                                {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>

                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">PAYLOAD</label>
                            <textarea
                                placeholder="ENTER_DATA..."
                                required
                                className="w-full bg-black border border-gray-800 p-4 mb-6 text-xs font-mono uppercase tracking-wider text-white h-32 focus:border-cyan-600 outline-none resize-none"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />

                            <div className="mb-8 p-4 border border-gray-800 border-dashed bg-[#050505]">
                                <span className="block text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">ATTACH_MEDIA (OPTIONAL)</span>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    className="w-full text-[10px] outline-none text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-[0.2em] file:bg-cyan-950 file:text-cyan-500 hover:file:bg-cyan-900 cursor-pointer transition-colors"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setMediaFile(file);
                                        if (file && file.type.includes('image')) setFormData({ ...formData, mediaType: 'image' });
                                        if (file && file.type.includes('video')) setFormData({ ...formData, mediaType: 'video' });
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-cyan-600 hover:bg-white hover:text-black text-white font-black py-5 text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all"
                            >
                                <FiSend className="text-lg" /> BROADCAST_TO_NETWORK
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .scanlines {
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                }
                @media (min-width: 1024px) {
                    body { cursor: none !important; }
                    a, button, select, input, textarea { cursor: none !important; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #00f2ff; }
            `}} />
        </div>
    );
}

export default Community;
